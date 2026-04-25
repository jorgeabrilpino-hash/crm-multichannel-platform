import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(companyId: string, options: {
        page?: number;
        limit?: number;
        search?: string;
        tagId?: string;
    }) {
        const { page = 1, limit = 20, search, tagId } = options;
        const skip = (page - 1) * limit;

        const where: any = { companyId };

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        if (tagId) {
            where.contactTags = { some: { tagId } };
        }

        const [contacts, total] = await Promise.all([
            this.prisma.contact.findMany({
                where,
                skip,
                take: limit,
                include: {
                    contactTags: { include: { tag: true } },
                    _count: { select: { conversations: true } },
                },
                orderBy: { lastContactAt: 'desc' },
            }),
            this.prisma.contact.count({ where }),
        ]);

        return {
            data: contacts.map(this.formatContact),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async findOne(id: string) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                contactTags: { include: { tag: true } },
                notes: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                conversations: {
                    take: 10,
                    orderBy: { lastMessageAt: 'desc' },
                    include: { channelAccount: { include: { channel: true } } },
                },
            },
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        return this.formatContact(contact);
    }

    // Vista 360° del contacto
    async get360View(id: string) {
        const contact = await this.prisma.contact.findUnique({
            where: { id },
            include: {
                contactTags: { include: { tag: true } },
                notes: { include: { user: true }, orderBy: { createdAt: 'desc' } },
                conversations: {
                    orderBy: { lastMessageAt: 'desc' },
                    include: {
                        channelAccount: { include: { channel: true } },
                        messages: { take: 5, orderBy: { createdAt: 'desc' } },
                        participants: { include: { user: true } },
                    },
                },
            },
        });

        if (!contact) {
            throw new NotFoundException('Contact not found');
        }

        const stats = await this.prisma.message.groupBy({
            by: ['direction'],
            where: { conversation: { contactId: id } },
            _count: true,
        });

        return {
            ...this.formatContact(contact),
            statistics: {
                totalConversations: contact.conversations.length,
                messagesReceived: stats.find((s) => s.direction === 'INBOUND')?._count || 0,
                messagesSent: stats.find((s) => s.direction === 'OUTBOUND')?._count || 0,
            },
            recentConversations: contact.conversations,
        };
    }

    async create(companyId: string, dto: CreateContactDto) {
        const contact = await this.prisma.contact.create({
            data: {
                companyId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                source: dto.source || 'manual',
                customFields: dto.customFields || {},
            },
            include: { contactTags: { include: { tag: true } } },
        });

        return this.formatContact(contact);
    }

    async update(id: string, dto: UpdateContactDto) {
        const contact = await this.prisma.contact.update({
            where: { id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                customFields: dto.customFields,
            },
            include: { contactTags: { include: { tag: true } } },
        });

        return this.formatContact(contact);
    }

    async delete(id: string) {
        await this.prisma.contact.delete({ where: { id } });
        return { message: 'Contact deleted successfully' };
    }

    // Tags
    async addTag(contactId: string, tagId: string) {
        await this.prisma.contactTag.create({
            data: { contactId, tagId },
        });
        return this.findOne(contactId);
    }

    async removeTag(contactId: string, tagId: string) {
        await this.prisma.contactTag.deleteMany({
            where: { contactId, tagId },
        });
        return this.findOne(contactId);
    }

    // Notes
    async addNote(contactId: string, userId: string, content: string) {
        return this.prisma.contactNote.create({
            data: { contactId, userId, content },
            include: { user: true },
        });
    }

    // Find or create by WhatsApp ID
    async findOrCreateByWhatsApp(companyId: string, whatsappId: string, phone: string) {
        let contact = await this.prisma.contact.findFirst({
            where: {
                companyId,
                OR: [{ whatsappId }, { phone }],
            },
        });

        if (!contact) {
            contact = await this.prisma.contact.create({
                data: {
                    companyId,
                    whatsappId,
                    phone,
                    source: 'whatsapp',
                },
            });
        } else if (!contact.whatsappId) {
            contact = await this.prisma.contact.update({
                where: { id: contact.id },
                data: { whatsappId },
            });
        }

        return contact;
    }

    private formatContact(contact: any) {
        return {
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            fullName: [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown',
            email: contact.email,
            phone: contact.phone,
            avatar: contact.avatar,
            source: contact.source,
            customFields: contact.customFields,
            lastContactAt: contact.lastContactAt,
            tags: contact.contactTags?.map((ct: any) => ct.tag) || [],
            notes: contact.notes || [],
            conversationCount: contact._count?.conversations || contact.conversations?.length || 0,
            createdAt: contact.createdAt,
        };
    }
}
