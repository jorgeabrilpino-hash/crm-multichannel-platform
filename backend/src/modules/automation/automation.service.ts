import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AutomationService {
    constructor(private readonly prisma: PrismaService) { }

    // Get all automation rules for a company
    async getRules(companyId: string) {
        return this.prisma.automationRule.findMany({
            where: { companyId },
            orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        });
    }

    // Get single rule
    async getRule(id: string) {
        const rule = await this.prisma.automationRule.findUnique({
            where: { id },
        });

        if (!rule) {
            throw new NotFoundException('Automation rule not found');
        }

        return rule;
    }

    // Create automation rule
    async createRule(companyId: string, data: {
        name: string;
        description?: string;
        trigger: string;
        conditions?: any[];
        actions?: any[];
        priority?: number;
    }) {
        return this.prisma.automationRule.create({
            data: {
                companyId,
                name: data.name,
                description: data.description,
                trigger: data.trigger,
                conditions: data.conditions || [],
                actions: data.actions || [],
                priority: data.priority || 0,
                isActive: false, // Inactive by default in Phase 1
            },
        });
    }

    // Update rule
    async updateRule(id: string, data: {
        name?: string;
        description?: string;
        trigger?: string;
        conditions?: any[];
        actions?: any[];
        priority?: number;
        isActive?: boolean;
    }) {
        return this.prisma.automationRule.update({
            where: { id },
            data,
        });
    }

    // Delete rule
    async deleteRule(id: string) {
        await this.prisma.automationRule.delete({ where: { id } });
        return { message: 'Automation rule deleted' };
    }

    // Toggle rule active status
    async toggleRule(id: string) {
        const rule = await this.getRule(id);
        return this.prisma.automationRule.update({
            where: { id },
            data: { isActive: !rule.isActive },
        });
    }

    // AI endpoints preparation
    async processAiRequest(data: {
        conversationId: string;
        type: string;
        input: any;
    }) {
        // Placeholder for AI processing in Phase 2
        // This will integrate with LLM providers
        return {
            status: 'not_implemented',
            message: 'AI processing will be available in Phase 2',
            input: data,
        };
    }

    async getAiConfig() {
        // Return AI configuration (to be expanded in Phase 2)
        return {
            enabled: false,
            providers: ['openai', 'anthropic', 'custom'],
            features: {
                intentDetection: false,
                autoResponse: false,
                summarization: false,
                sentiment: false,
            },
        };
    }
}
