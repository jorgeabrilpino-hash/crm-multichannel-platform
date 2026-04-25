import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { ChannelsModule } from './modules/channels/channels.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { EventsModule } from './modules/events/events.module';
import { AutomationModule } from './modules/automation/automation.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),

        // Database
        PrismaModule,

        // Feature modules
        AuthModule,
        UsersModule,
        CompaniesModule,
        ContactsModule,
        ConversationsModule,
        ChannelsModule,
        WhatsappModule,
        EventsModule,
        AutomationModule,
    ],
})
export class AppModule { }
