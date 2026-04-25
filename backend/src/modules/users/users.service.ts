import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(companyId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where: { companyId },
                skip,
                take: limit,
                include: {
                    userRoles: { include: { role: true } },
                    teamUsers: { include: { team: true } },
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where: { companyId } }),
        ]);

        return {
            data: users.map(this.formatUser),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                userRoles: { include: { role: true } },
                teamUsers: { include: { team: true } },
                company: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return this.formatUser(user);
    }

    async create(dto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                companyId: dto.companyId,
                userRoles: dto.roleIds
                    ? {
                        create: dto.roleIds.map((roleId) => ({ roleId })),
                    }
                    : undefined,
            },
            include: {
                userRoles: { include: { role: true } },
            },
        });

        return this.formatUser(user);
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.update({
            where: { id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                isActive: dto.isActive,
            },
            include: {
                userRoles: { include: { role: true } },
            },
        });

        return this.formatUser(user);
    }

    async delete(id: string) {
        await this.prisma.user.delete({ where: { id } });
        return { message: 'User deleted successfully' };
    }

    async updateRoles(userId: string, roleIds: string[]) {
        // Remove existing roles
        await this.prisma.userRole.deleteMany({ where: { userId } });

        // Add new roles
        await this.prisma.userRole.createMany({
            data: roleIds.map((roleId) => ({ userId, roleId })),
        });

        return this.findOne(userId);
    }

    private formatUser(user: any) {
        return {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            avatar: user.avatar,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt,
            roles: user.userRoles?.map((ur: any) => ur.role.name) || [],
            teams: user.teamUsers?.map((tu: any) => ({
                id: tu.team.id,
                name: tu.team.name,
                role: tu.role,
            })) || [],
            createdAt: user.createdAt,
        };
    }
}
