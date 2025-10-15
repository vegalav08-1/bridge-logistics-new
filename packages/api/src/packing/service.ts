import { db } from '@yp/db';
import { ParcelCreateInput, ParcelUpdateInput, ParcelMoveInput, PresetCreateInput, PresetUpdateInput } from './validators';
import { PackingFinanceService } from './finance';
import { PackingEventService } from './events';

export class PackingService {
  // Генерация уникального кода для Parcel
  static async generateParcelCode(chatId: string): Promise<string> {
    const chat = await db.chat.findUnique({
      where: { id: chatId },
      select: { number: true }
    });
    
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Формат: PX-<shortChat>-<seq>
    const shortChat = chat.number.replace(/[^A-Z0-9]/g, '').substring(0, 8);
    
    // Найти последний номер в этой серии
    const lastParcel = await db.parcel.findFirst({
      where: {
        chatId,
        code: {
          startsWith: `PX-${shortChat}-`
        }
      },
      orderBy: { code: 'desc' }
    });

    let seq = 1;
    if (lastParcel) {
      const match = lastParcel.code.match(/-(\d+)$/);
      if (match) {
        seq = parseInt(match[1]) + 1;
      }
    }

    return `PX-${shortChat}-${seq.toString().padStart(2, '0')}`;
  }

  // Создание Parcel
  static async createParcel(data: ParcelCreateInput & { createdById: string }) {
    const { chatId, parentId, code, name, kind, pieces, weightKg, lengthCm, widthCm, heightCm, attrs } = data;

    // Проверка доступа к чату
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId: data.createdById
          }
        }
      }
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    // Проверка родительского Parcel (если указан)
    if (parentId) {
      const parentParcel = await db.parcel.findFirst({
        where: {
          id: parentId,
          chatId
        }
      });

      if (!parentParcel) {
        throw new Error('Parent parcel not found');
      }
    }

    // Вычисление объема
    let volumeM3: number | undefined;
    if (lengthCm && widthCm && heightCm) {
      volumeM3 = (lengthCm * widthCm * heightCm) / 1000000; // см³ в м³
    }

    const parcel = await db.parcel.create({
      data: {
        chatId,
        parentId,
        code,
        name,
        kind,
        pieces,
        weightKg,
        lengthCm,
        widthCm,
        heightCm,
        volumeM3,
        attrs,
        createdById: data.createdById
      },
      include: {
        chat: {
          select: { id: true, number: true, status: true }
        },
        parent: {
          select: { id: true, code: true, name: true }
        },
        children: {
          select: { id: true, code: true, name: true }
        },
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Применяем автооперации по финансам, если есть правила
    if (attrs) {
      try {
        const priceRules = PackingFinanceService.parsePriceRules(attrs);
        await PackingFinanceService.applyPackingAutoOps(
          parcel.id,
          priceRules,
          chatId,
          data.createdById
        );
      } catch (error) {
        console.error('Error applying packing finance rules:', error);
        // Не прерываем создание Parcel из-за ошибки в финансах
      }
    }

    // Отправляем событие создания
    await PackingEventService.emitParcelCreated(parcel.id, chatId);

    return parcel;
  }

  // Обновление Parcel
  static async updateParcel(id: string, data: ParcelUpdateInput, userId: string) {
    // Проверка доступа
    const existingParcel = await db.parcel.findFirst({
      where: {
        id,
        chat: {
          members: {
            some: {
              userId
            }
          }
        }
      }
    });

    if (!existingParcel) {
      throw new Error('Parcel not found or access denied');
    }

    // Вычисление нового объема
    let volumeM3: number | undefined;
    if (data.lengthCm && data.widthCm && data.heightCm) {
      volumeM3 = (data.lengthCm * data.widthCm * data.heightCm) / 1000000;
    } else if (data.lengthCm !== undefined || data.widthCm !== undefined || data.heightCm !== undefined) {
      // Если изменились размеры, но не все указаны, используем существующие значения
      const length = data.lengthCm ?? existingParcel.lengthCm;
      const width = data.widthCm ?? existingParcel.widthCm;
      const height = data.heightCm ?? existingParcel.heightCm;
      
      if (length && width && height) {
        volumeM3 = (length * width * height) / 1000000;
      }
    }

    const parcel = await db.parcel.update({
      where: { id },
      data: {
        ...data,
        volumeM3
      },
      include: {
        chat: {
          select: { id: true, number: true, status: true }
        },
        parent: {
          select: { id: true, code: true, name: true }
        },
        children: {
          select: { id: true, code: true, name: true }
        },
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Обновляем автооперации по финансам, если изменились правила
    if (data.attrs) {
      try {
        const priceRules = PackingFinanceService.parsePriceRules(data.attrs);
        await PackingFinanceService.applyPackingAutoOps(
          parcel.id,
          priceRules,
          parcel.chatId,
          userId
        );
      } catch (error) {
        console.error('Error updating packing finance rules:', error);
        // Не прерываем обновление Parcel из-за ошибки в финансах
      }
    }

    // Отправляем событие обновления
    await PackingEventService.emitParcelUpdated(parcel.id, parcel.chatId);

    return parcel;
  }

  // Перемещение Parcel
  static async moveParcel(id: string, data: ParcelMoveInput, userId: string) {
    // Проверка доступа
    const existingParcel = await db.parcel.findFirst({
      where: {
        id,
        chat: {
          members: {
            some: {
              userId
            }
          }
        }
      }
    });

    if (!existingParcel) {
      throw new Error('Parcel not found or access denied');
    }

    // Проверка нового родителя (если указан)
    if (data.parentId) {
      const parentParcel = await db.parcel.findFirst({
        where: {
          id: data.parentId,
          chatId: existingParcel.chatId
        }
      });

      if (!parentParcel) {
        throw new Error('Parent parcel not found');
      }

      // Проверка на циклическую зависимость
      if (data.parentId === id) {
        throw new Error('Cannot move parcel to itself');
      }
    }

    const parcel = await db.parcel.update({
      where: { id },
      data: {
        parentId: data.parentId
      },
      include: {
        chat: {
          select: { id: true, number: true, status: true }
        },
        parent: {
          select: { id: true, code: true, name: true }
        },
        children: {
          select: { id: true, code: true, name: true }
        },
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    // Отправляем событие перемещения
    await PackingEventService.emitParcelMoved(parcel.id, parcel.chatId, data.parentId);

    return parcel;
  }

  // Удаление Parcel
  static async deleteParcel(id: string, userId: string) {
    // Проверка доступа
    const existingParcel = await db.parcel.findFirst({
      where: {
        id,
        chat: {
          members: {
            some: {
              userId
            }
          }
        }
      },
      include: {
        children: true
      }
    });

    if (!existingParcel) {
      throw new Error('Parcel not found or access denied');
    }

    // Проверка на наличие дочерних элементов
    if (existingParcel.children.length > 0) {
      throw new Error('Cannot delete parcel with children');
    }

    // Сохраняем данные для события
    const parcelCode = existingParcel.code;
    const chatId = existingParcel.chatId;

    await db.parcel.delete({
      where: { id }
    });

    // Отправляем событие удаления
    await PackingEventService.emitParcelDeleted(id, chatId, parcelCode);

    return { success: true };
  }

  // Получение дерева Parcel для чата
  static async getParcelsTree(chatId: string, userId: string) {
    // Проверка доступа к чату
    const chat = await db.chat.findFirst({
      where: {
        id: chatId,
        members: {
          some: {
            userId
          }
        }
      }
    });

    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const parcels = await db.parcel.findMany({
      where: { chatId },
      include: {
        parent: {
          select: { id: true, code: true, name: true }
        },
        children: {
          select: { id: true, code: true, name: true, kind: true }
        },
        creator: {
          select: { id: true, email: true }
        }
      },
      orderBy: [
        { parentId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    return parcels;
  }

  // Создание PackingPreset
  static async createPreset(data: PresetCreateInput & { adminId: string }) {
    const preset = await db.packingPreset.create({
      data: {
        ...data,
        adminId: data.adminId
      }
    });

    return preset;
  }

  // Обновление PackingPreset
  static async updatePreset(id: string, data: PresetUpdateInput, adminId: string) {
    const preset = await db.packingPreset.update({
      where: {
        id,
        adminId
      },
      data
    });

    return preset;
  }

  // Удаление PackingPreset
  static async deletePreset(id: string, adminId: string) {
    await db.packingPreset.delete({
      where: {
        id,
        adminId
      }
    });

    return { success: true };
  }

  // Получение пресетов админа
  static async getPresets(adminId: string) {
    const presets = await db.packingPreset.findMany({
      where: { adminId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    return presets;
  }
}
