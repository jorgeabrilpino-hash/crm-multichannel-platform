import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ChannelType } from '@prisma/client';

@Injectable()
export class ChannelsService {
    constructor(private readonly prisma: PrismaService) { }

    async getAvailableChannels() {
        return this.prisma.channel.findMany({
            where: { isEnabled: true },
            orderBy: { type: 'asc' },
        });
    }

    async getConnectedAccounts(companyId: string) {
        return this.prisma.channelAccount.findMany({
            where: { companyId },
            include: {
                channel: true,
                whatsappNumber: true,
                webhooks: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getAccountById(id: string) {
        const account = await this.prisma.channelAccount.findUnique({
            where: { id },
            include: {
                channel: true,
                whatsappNumber: true,
                webhooks: true,
            },
        });

        if (!account) {
            throw new NotFoundException('Channel account not found');
        }

        return account;
    }

    async connectWhatsApp(companyId: string, data: {
        name: string;
        phoneNumber: string;
        phoneNumberId: string;
        wabaId: string;
        accessToken: string;
    }) {
        // Get or create WhatsApp channel
        let channel = await this.prisma.channel.findUnique({
            where: { type: 'WHATSAPP' },
        });

        if (!channel) {
            channel = await this.prisma.channel.create({
                data: { type: 'WHATSAPP', name: 'WhatsApp Business' },
            });
        }

        // Create channel account
        const account = await this.prisma.channelAccount.create({
            data: {
                channelId: channel.id,
                companyId,
                name: data.name,
                identifier: data.phoneNumber,
                accessToken: data.accessToken,
                status: 'active',
                whatsappNumber: {
                    create: {
                        phoneNumber: data.phoneNumber,
                        phoneNumberId: data.phoneNumberId,
                        wabaId: data.wabaId,
                        displayName: data.name,
                        status: 'connected',
                    },
                },
            },
            include: {
                channel: true,
                whatsappNumber: true,
            },
        });

        return account;
    }

    async updateAccountStatus(id: string, status: string) {
        return this.prisma.channelAccount.update({
            where: { id },
            data: { status },
            include: { channel: true },
        });
    }

    async disconnectAccount(id: string) {
        await this.prisma.channelAccount.update({
            where: { id },
            data: { status: 'inactive' },
        });

        return { message: 'Channel disconnected successfully' };
    }

    // Prepare future channels (Facebook, Instagram)
    async prepareFacebookChannel(companyId: string, data: { pageId: string; pageName: string; accessToken: string }) {
        let channel = await this.prisma.channel.findUnique({
            where: { type: 'FACEBOOK' },
        });

        if (!channel) {
            channel = await this.prisma.channel.create({
                data: { type: 'FACEBOOK', name: 'Facebook Messenger' },
            });
        }

        return this.prisma.channelAccount.create({
            data: {
                channelId: channel.id,
                companyId,
                name: data.pageName,
                identifier: data.pageId,
                accessToken: data.accessToken,
                status: 'pending', // Pending setup
            },
            include: { channel: true },
        });
    }

    async prepareInstagramChannel(companyId: string, data: { igUserId: string; username: string; accessToken: string }) {
        let channel = await this.prisma.channel.findUnique({
            where: { type: 'INSTAGRAM' },
        });

        if (!channel) {
            channel = await this.prisma.channel.create({
                data: { type: 'INSTAGRAM', name: 'Instagram Direct' },
            });
        }

        return this.prisma.channelAccount.create({
            data: {
                channelId: channel.id,
                companyId,
                name: data.username,
                identifier: data.igUserId,
                accessToken: data.accessToken,
                status: 'pending',
            },
            include: { channel: true },
        });
    }
}
