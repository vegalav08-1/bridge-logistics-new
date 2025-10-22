import { ShipmentNumberGenerator } from '../shipment/number-generator';

/**
 * QR payload structure for chat access
 */
export interface QRPayload {
  v: number;                    // version
  type: 'CHAT_ACCESS';         // payload type
  chat: string;                 // chat ID
  order: string;                // shipment ID
  branch: string;               // admin branch ID
  client_code: string;          // client code (3-6 digits)
}

/**
 * QR code generator for shipment labels
 */
export class QRChatGenerator {
  /**
   * Generate QR payload for chat access
   */
  static generatePayload(
    chatId: string,
    shipmentId: string,
    branchId: string,
    clientCode: string
  ): QRPayload {
    return {
      v: 2,
      type: 'CHAT_ACCESS',
      chat: chatId,
      order: shipmentId,
      branch: branchId,
      client_code: clientCode
    };
  }

  /**
   * Parse QR code string to extract shipment number
   */
  static parseShipmentNumber(qrString: string): string | null {
    // Extract shipment number from QR string like "BR20251021_7_10(0421)"
    const match = qrString.match(/^BR\d{8}_\d+_\d+\(\d{3,6}\)$/);
    return match ? match[0] : null;
  }

  /**
   * Extract client code from QR string
   */
  static extractClientCode(qrString: string): string | null {
    const match = qrString.match(/\((\d{3,6})\)$/);
    return match ? match[1] : null;
  }

  /**
   * Validate QR payload structure
   */
  static validatePayload(payload: any): payload is QRPayload {
    return (
      payload &&
      typeof payload === 'object' &&
      payload.v === 2 &&
      payload.type === 'CHAT_ACCESS' &&
      typeof payload.chat === 'string' &&
      typeof payload.order === 'string' &&
      typeof payload.branch === 'string' &&
      typeof payload.client_code === 'string' &&
      /^\d{3,6}$/.test(payload.client_code)
    );
  }

  /**
   * Generate QR code data URL
   */
  static async generateQRCodeDataURL(payload: QRPayload): Promise<string> {
    // TODO: Implement actual QR code generation
    // For now, return a mock data URL
    const qrString = `BR${Date.now().toString().slice(-8)}_1_1(${payload.client_code})`;
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  /**
   * Generate shipment number from QR payload
   */
  static generateShipmentNumber(payload: QRPayload): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = 1; // TODO: Get from database
    const boxes = 1; // TODO: Get from shipment data
    
    return `BR${dateStr}_${sequence}_${boxes}(${payload.client_code})`;
  }
}
