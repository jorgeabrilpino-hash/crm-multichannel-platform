import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { PrismaService } from '../../common/prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                userRoles: {
                    include: { role: true },
                },
                company: true,
            },
        });

        if (!user || !user.isActive) {
            await this.logLogin(user?.id, false, ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            await this.logLogin(user.id, false, ipAddress, userAgent);
            throw new UnauthorizedException('Invalid credentials');
        }

        await this.logLogin(user.id, true, ipAddress, userAgent);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        const tokens = await this.generateTokens(user);
        const roles = user.userRoles.map((ur) => ur.role.name);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                avatar: user.avatar,
                roles,
                company: {
                    id: user.company.id,
                    name: user.company.name,
                },
            },
            ...tokens,
        };
    }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 12);

        // Get or create default role (AGENT)
        let agentRole = await this.prisma.role.findUnique({
            where: { name: 'AGENT' },
        });

        if (!agentRole) {
            agentRole = await this.prisma.role.create({
                data: { name: 'AGENT', description: 'Default agent role' },
            });
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                companyId: dto.companyId,
                userRoles: {
                    create: { roleId: agentRole.id },
                },
            },
            include: {
                userRoles: { include: { role: true } },
                company: true,
            },
        });

        const tokens = await this.generateTokens(user);
        const roles = user.userRoles.map((ur) => ur.role.name);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles,
                company: {
                    id: user.company.id,
                    name: user.company.name,
                },
            },
            ...tokens,
        };
    }

    async refreshToken(refreshToken: string) {
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        userRoles: { include: { role: true } },
                        company: true,
                    },
                },
            },
        });

        if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        // Revoke old token
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });

        // Generate new tokens
        return this.generateTokens(storedToken.user);
    }

    async logout(userId: string, refreshToken?: string) {
        if (refreshToken) {
            await this.prisma.refreshToken.updateMany({
                where: { userId, token: refreshToken },
                data: { revokedAt: new Date() },
            });
        } else {
            // Revoke all refresh tokens
            await this.prisma.refreshToken.updateMany({
                where: { userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });
        }
        return { message: 'Logged out successfully' };
    }

    async validateUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: { include: { role: true } },
                company: true,
            },
        });

        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        return user;
    }

    private async generateTokens(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            companyId: user.companyId,
            roles: user.userRoles?.map((ur: any) => ur.role.name) || [],
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = uuidv4();
        const refreshExpiresIn = this.configService.get<number>('REFRESH_TOKEN_DAYS', 7);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + refreshExpiresIn);

        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            accessToken,
            refreshToken,
            expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
        };
    }

    private async logLogin(userId: string | undefined, success: boolean, ipAddress?: string, userAgent?: string) {
        if (userId) {
            await this.prisma.loginLog.create({
                data: { userId, success, ipAddress, userAgent },
            });
        }
    }
}
