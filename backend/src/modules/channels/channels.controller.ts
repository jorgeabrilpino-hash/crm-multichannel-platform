import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Channels')
@Controller('channels')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChannelsController {
    constructor(private readonly channelsService: ChannelsService) { }

    @Get('available')
    @ApiOperation({ summary: 'Get available channel types' })
    async getAvailable() {
        return this.channelsService.getAvailableChannels();
    }

    @Get('accounts')
    @ApiOperation({ summary: 'Get connected channel accounts' })
    async getAccounts(@CurrentUser('companyId') companyId: string) {
        return this.channelsService.getConnectedAccounts(companyId);
    }

    @Get('accounts/:id')
    @ApiOperation({ summary: 'Get channel account details' })
    async getAccount(@Param('id') id: string) {
        return this.channelsService.getAccountById(id);
    }

    @Post('whatsapp/connect')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Connect WhatsApp Business number' })
    async connectWhatsApp(
        @CurrentUser('companyId') companyId: string,
        @Body() data: {
            name: string;
            phoneNumber: string;
            phoneNumberId: string;
            wabaId: string;
            accessToken: string;
        },
    ) {
        return this.channelsService.connectWhatsApp(companyId, data);
    }

    @Put('accounts/:id/status')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update channel status' })
    async updateStatus(@Param('id') id: string, @Body('status') status: string) {
        return this.channelsService.updateAccountStatus(id, status);
    }

    @Delete('accounts/:id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Disconnect channel' })
    async disconnect(@Param('id') id: string) {
        return this.channelsService.disconnectAccount(id);
    }

    // Future channels preparation
    @Post('facebook/prepare')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Prepare Facebook Messenger (Phase 2)' })
    async prepareFacebook(
        @CurrentUser('companyId') companyId: string,
        @Body() data: { pageId: string; pageName: string; accessToken: string },
    ) {
        return this.channelsService.prepareFacebookChannel(companyId, data);
    }

    @Post('instagram/prepare')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Prepare Instagram DM (Phase 2)' })
    async prepareInstagram(
        @CurrentUser('companyId') companyId: string,
        @Body() data: { igUserId: string; username: string; accessToken: string },
    ) {
        return this.channelsService.prepareInstagramChannel(companyId, data);
    }
}
