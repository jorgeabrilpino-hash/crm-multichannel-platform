import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Automation')
@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Get('rules')
    @ApiOperation({ summary: 'Get automation rules' })
    async getRules(@CurrentUser('companyId') companyId: string) {
        return this.automationService.getRules(companyId);
    }

    @Get('rules/:id')
    @ApiOperation({ summary: 'Get automation rule by ID' })
    async getRule(@Param('id') id: string) {
        return this.automationService.getRule(id);
    }

    @Post('rules')
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Create automation rule' })
    async createRule(
        @CurrentUser('companyId') companyId: string,
        @Body() body: {
            name: string;
            description?: string;
            trigger: string;
            conditions?: any[];
            actions?: any[];
            priority?: number;
        },
    ) {
        return this.automationService.createRule(companyId, body);
    }

    @Put('rules/:id')
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Update automation rule' })
    async updateRule(@Param('id') id: string, @Body() body: any) {
        return this.automationService.updateRule(id, body);
    }

    @Delete('rules/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete automation rule' })
    async deleteRule(@Param('id') id: string) {
        return this.automationService.deleteRule(id);
    }

    @Put('rules/:id/toggle')
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Toggle automation rule' })
    async toggleRule(@Param('id') id: string) {
        return this.automationService.toggleRule(id);
    }

    // AI Endpoints (Phase 2 preparation)
    @Post('ai/process')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Process AI request (Phase 2)' })
    async processAi(@Body() body: { conversationId: string; type: string; input: any }) {
        return this.automationService.processAiRequest(body);
    }

    @Get('ai/config')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Get AI configuration (Phase 2)' })
    async getAiConfig() {
        return this.automationService.getAiConfig();
    }
}
