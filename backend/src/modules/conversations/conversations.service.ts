import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConversationStatus } from '@prisma/client';

@Injectable()
export class ConversationsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(companyId: string, options: {
        page?: number;
        limit?: number;
        status?: ConversationStatus;
        assignedTo?: string;
    }) {
        const { page = 1, limit = 20, status, assignedTo } = options;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (status) {
            where.status = status;
        }

        if (assignedTo) {
            where.participants = { some: { userId: assignedTo, unassignedAt: null } };
        }

        const [conversations, total] = await Promise.all([
            this.prisma.conversation.findMany({
                where,
                skip,
                take: limit,
                include: {
                    contact: true,
                    channelAccount: { include: { channel: true } },
                    participants: {
                        where: { unassignedAt: null },
                        include: { user: { select: { id: true, firstName: true, lastName: true } } },
                    },
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
                orderBy: { lastMessageAt: 'desc' },
            }),
            this.prisma.conversation.count({ where }),
        ]);

        return {
            data: conversations.map(this.formatConversation),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id },
            include: {
                contact: { include: { contactTags: { include: { tag: true } } } },
                channelAccount: { include: { channel: true } },
                participants: { include: { user: true } },
            },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        return this.formatConversation(conversation);
    }

    async getMessages(conversationId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: { conversationId },
                skip,
                take: limit,
                include: {
                    sender: { select: { id: true, firstName: true, lastName: true, avatar: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.message.count({ where: { conversationId } }),
        ]);

        // Mark messages as read
        await this.prisma.message.updateMany({
            where: { conversationId, isRead: false, direction: 'INBOUND' },
            data: { isRead: true },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { unreadCount: 0 },
        });

        return {
            data: messages.reverse(),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async sendMessage(conversationId: string, senderId: string, content: string, type = 'TEXT') {
        const conversation = await this.prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { channelAccount: true },
        });

        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderId,
                direction: 'OUTBOUND',
                type: type as any,
                content,
                status: 'sent',
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true } },
            },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: new Date() },
        });

        return message;
    }

    async updateStatus(id: string, status: ConversationStatus) {
        const data: any = { status };
        if (status === 'CLOSED') {
            data.closedAt = new Date();
        }

        return this.prisma.conversation.update({
            where: { id },
            data,
        });
    }

    async assignAgent(conversationId: string, userId: string) {
        // Unassign current agents
        await this.prisma.conversationParticipant.updateMany({
            where: { conversationId, unassignedAt: null },
            data: { unassignedAt: new Date() },
        });

        // Assign new agent
        await this.prisma.conversationParticipant.create({
            data: { conversationId, userId, role: 'agent' },
        });

        return this.findOne(conversationId);
    }

    async unassignAgent(conversationId: string, userId: string) {
        await this.prisma.conversationParticipant.updateMany({
            where: { conversationId, userId, unassignedAt: null },
            data: { unassignedAt: new Date() },
        });

        return this.findOne(conversationId);
    }

    // Create or get conversation for a contact
    async getOrCreateConversation(companyId: string, contactId: string, channelAccountId: string) {
        let conversation = await this.prisma.conversation.findFirst({
            where: {
                contactId,
                channelAccountId,
                status: { not: 'CLOSED' },
            },
        });

        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: {
                    companyId,
                    contactId,
                    channelAccountId,
                    status: 'OPEN',
                },
            });
        }

        return conversation;
    }

    // Add incoming message
    async addIncomingMessage(conversationId: string, content: string, type = 'TEXT', externalId?: string) {
        const message = await this.prisma.message.create({
            data: {
                conversationId,
                direction: 'INBOUND',
                type: type as any,
                content,
                externalId,
                status: 'delivered',
            },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessageAt: new Date(),
                unreadCount: { increment: 1 },
                windowExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h window
            },
        });

        return message;
    }

    private formatConversation(conv: any) {
        return {
            id: conv.id,
            status: conv.status,
            unreadCount: conv.unreadCount,
            lastMessageAt: conv.lastMessageAt,
            windowExpiresAt: conv.windowExpiresAt,
            contact: {
                id: conv.contact.id,
                name: [conv.contact.firstName, conv.contact.lastName].filter(Boolean).join(' ') || 'Unknown',
                phone: conv.contact.phone,
                avatar: conv.contact.avatar,
                tags: conv.contact.contactTags?.map((ct: any) => ct.tag) || [],
            },
            channel: {
                type: conv.channelAccount.channel.type,
                name: conv.channelAccount.name,
            },
            assignedAgents: conv.participants
                ?.filter((p: any) => !p.unassignedAt)
                .map((p: any) => ({
                    id: p.user.id,
                    name: `${p.user.firstName} ${p.user.lastName}`,
                })) || [],
            lastMessage: conv.messages?.[0] || null,
            createdAt: conv.createdAt,
        };
    }
}
