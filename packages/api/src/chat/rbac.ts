import { prisma } from '@yp/db';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

/**
 * Проверить, может ли пользователь читать/писать в чат
 */
export async function canAccessChat(userId: string, userRole: UserRole, chatId: string): Promise<boolean> {
  // SUPER_ADMIN может всё
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // Проверяем участие в чате
  const membership = await prisma.chatMember.findUnique({
    where: {
      chatId_userId: {
        chatId,
        userId
      }
    }
  });

  return !!membership;
}

/**
 * Проверить, может ли пользователь создавать запросы/отгрузки для указанного админа
 */
export async function canCreateForAdmin(userId: string, userRole: UserRole, adminId: string): Promise<boolean> {
  // SUPER_ADMIN может всё
  if (userRole === 'SUPER_ADMIN') {
    return true;
  }

  // USER может создавать только для своего parentAdminId
  if (userRole === 'USER') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { parentAdminId: true }
    });
    return user?.parentAdminId === adminId;
  }

  // ADMIN может создавать для себя
  if (userRole === 'ADMIN') {
    return userId === adminId;
  }

  return false;
}





