import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create default roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'ADMIN' },
        update: {},
        create: {
            name: 'ADMIN',
            description: 'Administrador del sistema con acceso completo',
            permissions: JSON.stringify(['*']),
        },
    });

    const supervisorRole = await prisma.role.upsert({
        where: { name: 'SUPERVISOR' },
        update: {},
        create: {
            name: 'SUPERVISOR',
            description: 'Supervisor con acceso a reportes y gestión de equipos',
            permissions: JSON.stringify(['users:read', 'contacts:*', 'conversations:*']),
        },
    });

    const agentRole = await prisma.role.upsert({
        where: { name: 'AGENT' },
        update: {},
        create: {
            name: 'AGENT',
            description: 'Agente de atención al cliente',
            permissions: JSON.stringify(['contacts:read', 'conversations:*']),
        },
    });

    console.log('✅ Roles created');

    // 2. Create default company
    const company = await prisma.company.upsert({
        where: { slug: 'default-company' },
        update: {},
        create: {
            name: 'Mi Empresa',
            slug: 'default-company',
            timezone: 'America/Bogota',
        },
    });

    console.log('✅ Company created:', company.name);

    // 3. Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@empresa.com' },
        update: {},
        create: {
            email: 'admin@empresa.com',
            password: adminPassword,
            firstName: 'Admin',
            lastName: 'Sistema',
            companyId: company.id,
            userRoles: {
                create: { roleId: adminRole.id },
            },
        },
    });

    console.log('✅ Admin user created');
    console.log('');
    console.log('═══════════════════════════════════════════');
    console.log('  🔐 CREDENCIALES DE ADMIN');
    console.log('═══════════════════════════════════════════');
    console.log('  Email:    admin@empresa.com');
    console.log('  Password: admin123');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

    // 4. Create default channels
    await prisma.channel.upsert({
        where: { type: 'WHATSAPP' },
        update: {},
        create: { type: 'WHATSAPP', name: 'WhatsApp Business', isEnabled: true },
    });

    await prisma.channel.upsert({
        where: { type: 'FACEBOOK' },
        update: {},
        create: { type: 'FACEBOOK', name: 'Facebook Messenger', isEnabled: false },
    });

    await prisma.channel.upsert({
        where: { type: 'INSTAGRAM' },
        update: {},
        create: { type: 'INSTAGRAM', name: 'Instagram Direct', isEnabled: false },
    });

    console.log('✅ Channels created');
    console.log('');
    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
