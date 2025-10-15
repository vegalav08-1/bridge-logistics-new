import { prisma } from '../src/client';
import bcrypt from 'bcryptjs';

async function main() {
  // Пароли только для dev/staging. В prod задаёшь вручную/через админку.
  const defaultPassword = process.env.SEED_PASSWORD || 'ChangeMe123!';

  // SuperAdmin (из ТЗ)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'vegalav0202@gmail.com' },
    update: {},
    create: {
      email: 'vegalav0202@gmail.com',
      role: 'SUPER_ADMIN',
      passwordHash: await bcrypt.hash(defaultPassword, 12),
      emailVerified: new Date()
    }
  });

  // Пример Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash(defaultPassword, 12),
      emailVerified: new Date()
    }
  });

  // Пример User, привязанный к администратору (реферальная ветка)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      role: 'USER',
      parentAdminId: admin.id,
      passwordHash: await bcrypt.hash(defaultPassword, 12),
      emailVerified: new Date()
    }
  });

  // Создаем тестовые чаты и отгрузки
  const chat1 = await prisma.chat.create({
    data: {
      number: 'CHAT-001',
      type: 'SHIPMENT',
      status: 'NEW',
      members: {
        create: [
          { userId: user.id, role: 'USER' },
          { userId: admin.id, role: 'ADMIN' }
        ]
      },
      shipment: {
        create: {
          partnerAdminId: admin.id,
          createdById: user.id,
          status: 'NEW',
          notes: 'Тестовая отгрузка #1'
        }
      }
    }
  });

  const chat2 = await prisma.chat.create({
    data: {
      number: 'CHAT-002',
      type: 'REQUEST',
      status: 'NEW',
      members: {
        create: [
          { userId: user.id, role: 'USER' },
          { userId: admin.id, role: 'ADMIN' }
        ]
      },
      request: {
        create: {
          partnerAdminId: admin.id,
          createdById: user.id,
          description: 'Тестовая заявка #1',
          oldTrackNumber: 'TRACK-001'
        }
      }
    }
  });

  console.warn({ 
    superAdmin: superAdmin.email, 
    admin: admin.email, 
    user: user.email,
    chats: [chat1.number, chat2.number]
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
