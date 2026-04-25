import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Events')
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    // Get pending events (for n8n)
    @Get('pending')
    @ApiOperation({ summary: 'Get pending events for processing' })
    async getPending(@Query('limit') limit = 100) {
        return this.eventsService.getPendingEvents(+limit);
    }

    // Mark event as processed
    @Put(':id/processed')
    @ApiOperation({ summary: 'Mark event as processed' })
    async markProcessed(
        @Param('id') id: string,
        @Body('error') error?: string,
    ) {
        return this.eventsService.markProcessed(id, error);
    }

    // Get events by type
    @Get('type/:type')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get events by type' })
    async getByType(
        @Param('type') type: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.eventsService.getEventsByType(type, { page: +page, limit: +limit });
    }

    // Register webhook
    @Post('webhooks')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register webhook for events' })
    async registerWebhook(
        @Body() body: { url: string; eventTypes: string[] },
    ) {
        return this.eventsService.registerWebhook(body.url, body.eventTypes);
    }
}
