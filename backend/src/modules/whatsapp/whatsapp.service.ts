import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ContactsService } from '../contacts/contacts.service';
import { ConversationsService } from '../conversations/conversations.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class WhatsappService {
    private readonly logger = new Logger(WhatsappService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly configService: ConfigService,
        private readonly contactsService: ContactsService,
        private readonly conversationsService: ConversationsService,
        private readonly eventsService: EventsService,
    ) { }

    // Verify webhook (Meta requirement)
    verifyWebhook(mode: string, token: string, challenge: string) {
        const verifyToken = this.configService.get<string>('WHATSAPP_VERIFY_TOKEN');

        if (mode === 'subscribe' && token === verifyToken) {
            this.logger.log('Webhook verified successfully');
            return challenge;
        }

        throw new BadRequestException('Webhook verification failed');
    }

    // Process incoming webhook from Meta
    async processWebhook(body: any) {
        try {
            const entry = body.entry?.[0];
            const changes = entry?.changes?.[0];
            const value = changes?.value;

            if (!value) {
                return { status: 'no_data' };
            }

            // Handle message status updates
            if (value.statuses) {
                await this.handleStatusUpdate(value.statuses);
                return { status: 'status_processed' };
            }

            // Handle incoming messages
            if (value.messages) {
                await this.handleIncomingMessages(value);
                return { status: 'messages_processed' };
            }

            return { status: 'no_action' };
        } catch (error) {
            this.logger.error('Webhook processing error:', error);
            throw error;
        }
    }

    private async handleStatusUpdate(statuses: any[]) {
        for (const status of statuses) {
            await this.prisma.whatsappMessageLog.updateMany({
                where: { waMessageId: status.id },
                data: { status: status.status },
            });

            if (status.status === 'delivered' || status.status === 'read') {
                await this.prisma.message.updateMany({
                    where: { externalId: status.id },
                    data: { status: status.status },
                });
            }
        }
    }

    private async handleIncomingMessages(value: any) {
        const phoneNumberId = value.metadata?.phone_number_id;
        const messages = value.messages;
        const contacts = value.contacts;

        // Find the WhatsApp number
        const waNumber = await this.prisma.whatsappNumber.findFirst({
            where: { phoneNumberId },
            include: { channelAccount: true },
        });

        if (!waNumber) {
            this.logger.warn(`WhatsApp number not found: ${phoneNumberId}`);
            return;
        }

        for (const msg of messages) {
            const waContact = contacts?.find((c: any) => c.wa_id === msg.from);
            const contactPhone = msg.from;

            // Find or create contact
            const contact = await this.contactsService.findOrCreateByWhatsApp(
                waNumber.channelAccount.companyId,
                msg.from,
                `+${contactPhone}`,
            );

            // Update contact name if available
            if (waContact?.profile?.name && !contact.firstName) {
                const nameParts = waContact.profile.name.split(' ');
                await this.prisma.contact.update({
                    where: { id: contact.id },
                    data: {
                        firstName: nameParts[0],
                        lastName: nameParts.slice(1).join(' ') || null,
                    },
                });
            }

            // Get or create conversation
            const conversation = await this.conversationsService.getOrCreateConversation(
                waNumber.channelAccount.companyId,
                contact.id,
                waNumber.channelAccountId,
            );

            // Extract message content
            const { content, type } = this.extractMessageContent(msg);

            // Add message to conversation
            await this.conversationsService.addIncomingMessage(
                conversation.id,
                content,
                type,
                msg.id,
            );

            // Log the message
            await this.prisma.whatsappMessageLog.create({
                data: {
                    whatsappNumberId: waNumber.id,
                    waMessageId: msg.id,
                    direction: 'inbound',
                    status: 'received',
                    metadata: msg,
                },
            });

            // Emit event for automation/AI
            await this.eventsService.emit('message.received', {
                conversationId: conversation.id,
                contactId: contact.id,
                messageId: msg.id,
                channel: 'whatsapp',
                content,
                type,
            });

            // Update contact last contact time
            await this.prisma.contact.update({
                where: { id: contact.id },
                data: { lastContactAt: new Date() },
            });
        }
    }

    private extractMessageContent(msg: any): { content: string; type: string } {
        if (msg.text) {
            return { content: msg.text.body, type: 'TEXT' };
        }
        if (msg.image) {
            return { content: msg.image.caption || '[Image]', type: 'IMAGE' };
        }
        if (msg.video) {
            return { content: msg.video.caption || '[Video]', type: 'VIDEO' };
        }
        if (msg.audio) {
            return { content: '[Audio]', type: 'AUDIO' };
        }
        if (msg.document) {
            return { content: msg.document.filename || '[Document]', type: 'DOCUMENT' };
        }
        if (msg.location) {
            return { content: `[Location: ${msg.location.latitude}, ${msg.location.longitude}]`, type: 'LOCATION' };
        }
        if (msg.sticker) {
            return { content: '[Sticker]', type: 'STICKER' };
        }
        return { content: '[Unknown message]', type: 'TEXT' };
    }

    // Send message via WhatsApp Cloud API
    async sendMessage(channelAccountId: string, to: string, content: string, type = 'text') {
        const account = await this.prisma.channelAccount.findUnique({
            where: { id: channelAccountId },
            include: { whatsappNumber: true },
        });

        if (!account || !account.whatsappNumber) {
            throw new BadRequestException('WhatsApp account not found');
        }

        const url = `https://graph.facebook.com/v18.0/${account.whatsappNumber.phoneNumberId}/messages`;

        const payload: any = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: to.replace(/\D/g, ''), // Remove non-digits
        };

        if (type === 'text') {
            payload.type = 'text';
            payload.text = { body: content };
        } else if (type === 'template') {
            // For templates, content should be JSON string with template data
            const templateData = JSON.parse(content);
            payload.type = 'template';
            payload.template = templateData;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${account.accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                this.logger.error('WhatsApp API error:', result);
                throw new BadRequestException(result.error?.message || 'Failed to send message');
            }

            // Log the sent message
            await this.prisma.whatsappMessageLog.create({
                data: {
                    whatsappNumberId: account.whatsappNumber.id,
                    waMessageId: result.messages?.[0]?.id,
                    direction: 'outbound',
                    status: 'sent',
                },
            });

            return result;
        } catch (error) {
            this.logger.error('Send message error:', error);
            throw error;
        }
    }

    // Get templates
    async getTemplates(whatsappNumberId: string) {
        return this.prisma.whatsappTemplate.findMany({
            where: { whatsappNumberId },
            orderBy: { name: 'asc' },
        });
    }

    // Sync templates from Meta
    async syncTemplates(channelAccountId: string) {
        const account = await this.prisma.channelAccount.findUnique({
            where: { id: channelAccountId },
            include: { whatsappNumber: true },
        });

        if (!account || !account.whatsappNumber) {
            throw new BadRequestException('WhatsApp account not found');
        }

        const url = `https://graph.facebook.com/v18.0/${account.whatsappNumber.wabaId}/message_templates`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${account.accessToken}` },
        });

        const result = await response.json();

        if (!response.ok) {
            throw new BadRequestException(result.error?.message || 'Failed to sync templates');
        }

        // Upsert templates
        for (const template of result.data || []) {
            await this.prisma.whatsappTemplate.upsert({
                where: {
                    whatsappNumberId_templateId: {
                        whatsappNumberId: account.whatsappNumber.id,
                        templateId: template.id,
                    },
                },
                create: {
                    whatsappNumberId: account.whatsappNumber.id,
                    templateId: template.id,
                    name: template.name,
                    language: template.language,
                    category: template.category,
                    status: template.status,
                    components: template.components,
                },
                update: {
                    status: template.status,
                    components: template.components,
                },
            });
        }

        return this.getTemplates(account.whatsappNumber.id);
    }
}
