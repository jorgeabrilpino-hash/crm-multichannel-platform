import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class CompaniesService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.company.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                teams: true,
                _count: {
                    select: { users: true, contacts: true },
                },
            },
        });

        if (!company) {
            throw new NotFoundException('Company not found');
        }

        return company;
    }

    async create(data: { name: string; slug: string; timezone?: string }) {
        return this.prisma.company.create({ data });
    }

    async update(id: string, data: { name?: string; timezone?: string; isActive?: boolean }) {
        return this.prisma.company.update({ where: { id }, data });
    }

    // Teams
    async getTeams(companyId: string) {
        return this.prisma.team.findMany({
            where: { companyId },
            include: {
                teamUsers: { include: { user: true } },
            },
        });
    }

    async createTeam(companyId: string, data: { name: string; description?: string }) {
        return this.prisma.team.create({
            data: { ...data, companyId },
        });
    }

    async addUserToTeam(teamId: string, userId: string, role = 'member') {
        return this.prisma.teamUser.create({
            data: { teamId, userId, role },
        });
    }

    async removeUserFromTeam(teamId: string, userId: string) {
        await this.prisma.teamUser.deleteMany({
            where: { teamId, userId },
        });
        return { message: 'User removed from team' };
    }
}
