import { db } from '@yp/db';

export interface PackingEvent {
  type: 'parcel.created' | 'parcel.updated' | 'parcel.deleted' | 'parcel.moved' | 'labels.generated';
  chatId: string;
  parcelId?: string;
  data: any;
  timestamp: string;
}

export class PackingEventService {
  // Отправка события в комнату чата
  static async emitPackingEvent(event: PackingEvent) {
    // TODO: Интеграция с WebSocket/SSE системой
    // Пока просто логируем событие
    console.log('Packing Event:', event);
    
    // В реальной реализации здесь будет отправка через WebSocket
    // await wsService.emit(`chat:${event.chatId}`, event);
  }

  // Событие создания Parcel
  static async emitParcelCreated(parcelId: string, chatId: string) {
    const parcel = await db.parcel.findUnique({
      where: { id: parcelId },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    if (!parcel) return;

    await this.emitPackingEvent({
      type: 'parcel.created',
      chatId,
      parcelId,
      data: {
        code: parcel.code,
        name: parcel.name,
        kind: parcel.kind,
        creator: parcel.creator
      },
      timestamp: new Date().toISOString()
    });
  }

  // Событие обновления Parcel
  static async emitParcelUpdated(parcelId: string, chatId: string) {
    const parcel = await db.parcel.findUnique({
      where: { id: parcelId },
      include: {
        creator: {
          select: { id: true, email: true }
        }
      }
    });

    if (!parcel) return;

    await this.emitPackingEvent({
      type: 'parcel.updated',
      chatId,
      parcelId,
      data: {
        code: parcel.code,
        name: parcel.name,
        kind: parcel.kind,
        dimensions: {
          length: parcel.lengthCm,
          width: parcel.widthCm,
          height: parcel.heightCm,
          volume: parcel.volumeM3
        },
        weight: parcel.weightKg,
        pieces: parcel.pieces
      },
      timestamp: new Date().toISOString()
    });
  }

  // Событие удаления Parcel
  static async emitParcelDeleted(parcelId: string, chatId: string, code: string) {
    await this.emitPackingEvent({
      type: 'parcel.deleted',
      chatId,
      parcelId,
      data: {
        code
      },
      timestamp: new Date().toISOString()
    });
  }

  // Событие перемещения Parcel
  static async emitParcelMoved(parcelId: string, chatId: string, parentId?: string) {
    const parcel = await db.parcel.findUnique({
      where: { id: parcelId },
      select: { code: true, name: true }
    });

    if (!parcel) return;

    await this.emitPackingEvent({
      type: 'parcel.moved',
      chatId,
      parcelId,
      data: {
        code: parcel.code,
        name: parcel.name,
        parentId
      },
      timestamp: new Date().toISOString()
    });
  }

  // Событие генерации этикеток
  static async emitLabelsGenerated(chatId: string, parcelIds: string[], count: number) {
    await this.emitPackingEvent({
      type: 'labels.generated',
      chatId,
      data: {
        parcelIds,
        count
      },
      timestamp: new Date().toISOString()
    });
  }
}





