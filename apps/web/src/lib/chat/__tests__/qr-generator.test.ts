import { QRChatGenerator } from '../qr-generator';

describe('QRChatGenerator', () => {
  const mockPayload = {
    v: 2,
    type: 'CHAT_ACCESS' as const,
    chat: 'chat-123',
    order: 'shipment-456',
    branch: 'branch-789',
    client_code: '0421'
  };

  it('should generate valid QR payload', () => {
    const payload = QRChatGenerator.generatePayload(
      'chat-123',
      'shipment-456', 
      'branch-789',
      '0421'
    );

    expect(payload).toEqual(mockPayload);
  });

  it('should parse shipment number from QR string', () => {
    const qrString = 'BR20251021_7_10(0421)';
    const shipmentNumber = QRChatGenerator.parseShipmentNumber(qrString);
    
    expect(shipmentNumber).toBe('BR20251021_7_10(0421)');
  });

  it('should extract client code from QR string', () => {
    const qrString = 'BR20251021_7_10(0421)';
    const clientCode = QRChatGenerator.extractClientCode(qrString);
    
    expect(clientCode).toBe('0421');
  });

  it('should validate QR payload structure', () => {
    expect(QRChatGenerator.validatePayload(mockPayload)).toBe(true);
    
    // Invalid payloads
    expect(QRChatGenerator.validatePayload({ ...mockPayload, v: 1 })).toBe(false);
    expect(QRChatGenerator.validatePayload({ ...mockPayload, type: 'INVALID' })).toBe(false);
    expect(QRChatGenerator.validatePayload({ ...mockPayload, client_code: 'ABC' })).toBe(false);
  });

  it('should handle invalid QR strings', () => {
    expect(QRChatGenerator.parseShipmentNumber('invalid')).toBeNull();
    expect(QRChatGenerator.extractClientCode('invalid')).toBeNull();
  });
});
