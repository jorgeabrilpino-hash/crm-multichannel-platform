import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);

    constructor(private readonly prisma: PrismaService) { }

    // Emit an event (for n8n, AI, etc.)
    async emit(type: string, payload: any) {
        const event = await this.prisma.systemEvent.create({
            data: {
                type,
                payload,
                status: 'pending',
            },
        });

        this.logger.log(`Event emitted: ${type}`);

        // In production, this would trigger webhooks to n8n
        // For now, just store the event

        return event;
    }

    // Get pending events (for n8n polling)
    async getPendingEvents(limit = 100) {
        return this.prisma.systemEvent.findMany({
            where: { status: 'pending' },
            orderBy: { createdAt: 'asc' },
            take: limit,
        });
    }

    // Mark event as processed
    async markProcessed(eventId: string, error?: string) {
        return this.prisma.systemEvent.update({
            where: { id: eventId },
            data: {
                status: error ? 'failed' : 'processed',
                processedAt: new Date(),
                error,
            },
        });
    }

    // Get events by type
    async getEventsByType(type: string, options: { page?: number; limit?: number }) {
        const { page = 1, limit = 20 } = options;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            this.prisma.systemEvent.findMany({
                where: { type },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.systemEvent.count({ where: { type } }),
        ]);

        return {
            data: events,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    // Subscribe webhook (for n8n integration)
    async registerWebhook(url: string, eventTypes: string[]) {
        // Store webhook subscription
        // This would be expanded for full webhook management
        return {
            id: 'webhook_id',
            url,
            eventTypes,
            status: 'active',
        };
    }

    // Log AI event (preparation for Phase 2)
    async logAiEvent(data: {
        conversationId?: string;
        messageId?: string;
        type: string;
        input: any;
        output?: any;
        model?: string;
        tokensUsed?: number;
        latencyMs?: number;
        status?: string;
        error?: string;
    }) {
        return this.prisma.aiEvent.create({
            data: {
                conversationId: data.conversationId,
                messageId: data.messageId,
                type: data.type,
                input: data.input,
                output: data.output || null,
                model: data.model,
                tokensUsed: data.tokensUsed,
                latencyMs: data.latencyMs,
                status: data.status || 'pending',
                error: data.error,
            },
        });
    }
}
