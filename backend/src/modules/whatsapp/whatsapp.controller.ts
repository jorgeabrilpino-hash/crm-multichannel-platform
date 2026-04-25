import { Controller, Get, Post, Body, Param, Query, UseGuards, RawBodyRequest, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('WhatsApp')
@Controller('whatsapp')
export class WhatsappController {
    constructor(private readonly whatsappService: WhatsappService) { }

    // Webhook verification (GET)
    @Get('webhook')
    @ApiOperation({ summary: 'Verify WhatsApp webhook' })
    verifyWebhook(
        @Query('hub.mode') mode: string,
        @Query('hub.verify_token') token: string,
        @Query('hub.challenge') challenge: string,
    ) {
        return this.whatsappService.verifyWebhook(mode, token, challenge);
    }

    // Webhook handler (POST)
    @Post('webhook')
    @ApiOperation({ summary: 'Handle WhatsApp webhook' })
    async handleWebhook(@Body() body: any) {
        return this.whatsappService.processWebhook(body);
    }

    // Send message
    @Post('send')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Send WhatsApp message' })
    async sendMessage(
        @Body() body: {
            channelAccountId: string;
            to: string;
            content: string;
            type?: string;
        },
    ) {
        return this.whatsappService.sendMessage(
            body.channelAccountId,
            body.to,
            body.content,
            body.type,
        );
    }

    // Get templates
    @Get('templates/:whatsappNumberId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get WhatsApp templates' })
    async getTemplates(@Param('whatsappNumberId') whatsappNumberId: string) {
        return this.whatsappService.getTemplates(whatsappNumberId);
    }

    // Sync templates
    @Post('templates/:channelAccountId/sync')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Sync WhatsApp templates from Meta' })
    async syncTemplates(@Param('channelAccountId') channelAccountId: string) {
        return this.whatsappService.syncTemplates(channelAccountId);
    }
}
