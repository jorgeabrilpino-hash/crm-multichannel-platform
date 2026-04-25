import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ConversationStatus } from '@prisma/client';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get()
    @ApiOperation({ summary: 'List conversations' })
    async findAll(
        @CurrentUser('companyId') companyId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('status') status?: ConversationStatus,
        @Query('assignedTo') assignedTo?: string,
    ) {
        return this.conversationsService.findAll(companyId, {
            page: +page,
            limit: +limit,
            status,
            assignedTo,
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get conversation by ID' })
    async findOne(@Param('id') id: string) {
        return this.conversationsService.findOne(id);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Get conversation messages' })
    async getMessages(
        @Param('id') id: string,
        @Query('page') page = 1,
        @Query('limit') limit = 50,
    ) {
        return this.conversationsService.getMessages(id, +page, +limit);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send message' })
    async sendMessage(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body() body: { content: string; type?: string },
    ) {
        return this.conversationsService.sendMessage(id, userId, body.content, body.type);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Update conversation status' })
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: ConversationStatus,
    ) {
        return this.conversationsService.updateStatus(id, status);
    }

    @Put(':id/assign')
    @ApiOperation({ summary: 'Assign agent to conversation' })
    async assignAgent(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        return this.conversationsService.assignAgent(id, userId);
    }

    @Put(':id/unassign')
    @ApiOperation({ summary: 'Unassign agent from conversation' })
    async unassignAgent(
        @Param('id') id: string,
        @Body('userId') userId: string,
    ) {
        return this.conversationsService.unassignAgent(id, userId);
    }
}
