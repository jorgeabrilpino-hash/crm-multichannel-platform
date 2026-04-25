import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Companies')
@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompaniesController {
    constructor(private readonly companiesService: CompaniesService) { }

    @Get('current')
    @ApiOperation({ summary: 'Get current company' })
    async getCurrent(@CurrentUser('companyId') companyId: string) {
        return this.companiesService.findOne(companyId);
    }

    @Put('current')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update current company' })
    async updateCurrent(
        @CurrentUser('companyId') companyId: string,
        @Body() data: { name?: string; timezone?: string },
    ) {
        return this.companiesService.update(companyId, data);
    }

    @Get('teams')
    @ApiOperation({ summary: 'Get company teams' })
    async getTeams(@CurrentUser('companyId') companyId: string) {
        return this.companiesService.getTeams(companyId);
    }

    @Post('teams')
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Create team' })
    async createTeam(
        @CurrentUser('companyId') companyId: string,
        @Body() data: { name: string; description?: string },
    ) {
        return this.companiesService.createTeam(companyId, data);
    }

    @Post('teams/:teamId/users')
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Add user to team' })
    async addUserToTeam(
        @Param('teamId') teamId: string,
        @Body() data: { userId: string; role?: string },
    ) {
        return this.companiesService.addUserToTeam(teamId, data.userId, data.role);
    }
}
