import { FLAGS } from '@yp/shared';

/**
 * Integration hooks for S4-S7 features
 */

// S4: Chat Core - Message events
export async function publishMessageCreated(chatId: string, message: any) {
  if (!FLAGS.WS_ENABLED) return;

  // This function should be called from the server context where RealtimeServer instance is available
  // For now, we'll just log the event
  console.log('Real-time event:', {
    type: 'message.created',
    room: `chat:${chatId}`,
    seq: message.seq,
    data: {
      chatId,
      message: {
        id: message.id,
        seq: message.seq,
        kind: message.kind,
        payload: message.payload,
        authorId: message.authorId,
        createdAt: message.createdAt.toISOString(),
      },
    },
  });
}

export async function publishMessageEdited(chatId: string, message: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'message.edited',
    room: `chat:${chatId}`,
    seq: message.seq,
    data: {
      chatId,
      message: {
        id: message.id,
        seq: message.seq,
        kind: message.kind,
        payload: message.payload,
        authorId: message.authorId,
        createdAt: message.createdAt.toISOString(),
        editedAt: message.editedAt?.toISOString(),
      },
    },
  });
}

export async function publishMessageDeleted(chatId: string, message: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'message.deleted',
    room: `chat:${chatId}`,
    seq: message.seq,
    data: {
      chatId,
      message: {
        id: message.id,
        seq: message.seq,
        kind: message.kind,
        authorId: message.authorId,
        deletedAt: message.deletedAt?.toISOString(),
      },
    },
  });
}

// S5: Feed - Chat updated events
export async function publishChatUpdated(chatId: string) {
  if (!FLAGS.WS_ENABLED) return;

  const { prisma } = await import('@yp/db');
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    select: { updatedAt: true },
  });

  if (chat) {
  console.log('Real-time event:', {
      type: 'chat.updated',
      room: `chat:${chatId}`,
      data: {
        chatId,
        updatedAt: chat.updatedAt.toISOString(),
      },
    });
  }
}

// S6: Offer/QR - Business events
export async function publishOfferProposed(chatId: string, offer: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'offer.proposed',
    room: `chat:${chatId}`,
    data: {
      chatId,
      offer: {
        id: offer.id,
        pricePerKgUSD: offer.pricePerKgUSD,
        insuranceUSD: offer.insuranceUSD,
        packingUSD: offer.packingUSD,
        deliveryDays: offer.deliveryDays,
        deliveryMethod: offer.deliveryMethod,
        notes: offer.notes,
        createdAt: offer.createdAt.toISOString(),
      },
    },
  });
}

export async function publishOfferAccepted(chatId: string, offer: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'offer.accepted',
    room: `chat:${chatId}`,
    data: {
      chatId,
      offer: {
        id: offer.id,
        acceptedAt: new Date().toISOString(),
      },
    },
  });
}

export async function publishShipmentCreated(chatId: string, shipment: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'shipment.created',
    room: `chat:${chatId}`,
    data: {
      chatId,
      shipment: {
        id: shipment.id,
        status: shipment.status,
        trackingNumber: shipment.trackingNumber,
        createdAt: shipment.createdAt.toISOString(),
      },
    },
  });
}

export async function publishQRGenerated(chatId: string, qrLabel: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'qr.generated',
    room: `chat:${chatId}`,
    data: {
      chatId,
      qrLabel: {
        id: qrLabel.id,
        code: qrLabel.code,
        pdfKey: qrLabel.pdfKey,
        createdAt: qrLabel.createdAt.toISOString(),
      },
    },
  });
}

// S7: Files - Attachment events
export async function publishAttachmentPreviewReady(chatId: string, attachment: any) {
  if (!FLAGS.WS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'attachment.preview.ready',
    room: `chat:${chatId}`,
    data: {
      chatId,
      attachmentId: attachment.id,
      thumbReady: true,
      thumbKey: attachment.thumbKey,
      width: attachment.width,
      height: attachment.height,
      pages: attachment.pages,
    },
  });
}

// Receipt events (from receipts.ts)
export async function publishReceiptDelivered(chatId: string, messageSeq: number, userId: string) {
  if (!FLAGS.WS_ENABLED || !FLAGS.DELIVERED_RECEIPTS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'receipt.delivered',
    room: `chat:${chatId}`,
    data: {
      chatId,
      messageSeq,
      userId,
      at: new Date().toISOString(),
    },
  });
}

export async function publishReceiptRead(chatId: string, maxReadSeq: number, userId: string) {
  if (!FLAGS.WS_ENABLED || !FLAGS.READ_RECEIPTS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'receipt.read',
    room: `chat:${chatId}`,
    data: {
      chatId,
      maxReadSeq,
      userId,
      at: new Date().toISOString(),
    },
  });
}

// Typing events (from presence.ts)
export async function publishTypingStart(chatId: string, userId: string) {
  if (!FLAGS.WS_ENABLED || !FLAGS.TYPING_INDICATORS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'typing.start',
    room: `chat:${chatId}`,
    data: {
      chatId,
      userId,
      at: new Date().toISOString(),
    },
  });
}

export async function publishTypingStop(chatId: string, userId: string) {
  if (!FLAGS.WS_ENABLED || !FLAGS.TYPING_INDICATORS_ENABLED) return;

  console.log('Real-time event:', {
    type: 'typing.stop',
    room: `chat:${chatId}`,
    data: {
      chatId,
      userId,
      at: new Date().toISOString(),
    },
  });
}
