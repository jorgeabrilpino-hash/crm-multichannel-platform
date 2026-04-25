import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Contacts')
@Controller('contacts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
    constructor(private readonly contactsService: ContactsService) { }

    @Get()
    @ApiOperation({ summary: 'List contacts' })
    async findAll(
        @CurrentUser('companyId') companyId: string,
        @Query('page') page = 1,
        @Query('limit') limit = 20,
        @Query('search') search?: string,
        @Query('tagId') tagId?: string,
    ) {
        return this.contactsService.findAll(companyId, { page: +page, limit: +limit, search, tagId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get contact by ID' })
    async findOne(@Param('id') id: string) {
        return this.contactsService.findOne(id);
    }

    @Get(':id/360')
    @ApiOperation({ summary: 'Get contact 360° view' })
    async get360View(@Param('id') id: string) {
        return this.contactsService.get360View(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create contact' })
    async create(@CurrentUser('companyId') companyId: string, @Body() dto: CreateContactDto) {
        return this.contactsService.create(companyId, dto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update contact' })
    async update(@Param('id') id: string, @Body() dto: UpdateContactDto) {
        return this.contactsService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete contact' })
    async delete(@Param('id') id: string) {
        return this.contactsService.delete(id);
    }

    @Post(':id/tags')
    @ApiOperation({ summary: 'Add tag to contact' })
    async addTag(@Param('id') id: string, @Body('tagId') tagId: string) {
        return this.contactsService.addTag(id, tagId);
    }

    @Delete(':id/tags/:tagId')
    @ApiOperation({ summary: 'Remove tag from contact' })
    async removeTag(@Param('id') id: string, @Param('tagId') tagId: string) {
        return this.contactsService.removeTag(id, tagId);
    }

    @Post(':id/notes')
    @ApiOperation({ summary: 'Add note to contact' })
    async addNote(
        @Param('id') id: string,
        @CurrentUser('id') userId: string,
        @Body('content') content: string,
    ) {
        return this.contactsService.addNote(id, userId, content);
    }
}
