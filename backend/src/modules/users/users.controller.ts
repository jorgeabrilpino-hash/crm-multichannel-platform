import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles('ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'List all users' })
    async findAll(
        @CurrentUser('companyId') companyId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
    ) {
        return this.usersService.findAll(companyId, +page, +limit);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Create new user' })
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @Put(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update user' })
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Delete user' })
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Put(':id/roles')
    @Roles('ADMIN')
    @ApiOperation({ summary: 'Update user roles' })
    async updateRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[]) {
        return this.usersService.updateRoles(id, roleIds);
    }
}
