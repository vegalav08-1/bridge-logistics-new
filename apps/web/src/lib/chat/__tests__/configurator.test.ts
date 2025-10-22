import { ChatConfigurator, CargoBox } from '../configurator';

describe('ChatConfigurator', () => {
  const sampleBoxes: CargoBox[] = [
    { l: 50, w: 40, h: 30, weight: 10, qty: 2 },
    { l: 60, w: 50, h: 40, weight: 15, qty: 1 }
  ];

  it('should calculate basic metrics correctly', () => {
    const result = ChatConfigurator.calculate(sampleBoxes, 5000);
    
    expect(result.totalVolumeM3).toBeCloseTo(0.12, 2); // (50*40*30*2 + 60*50*40*1) / 1000000
    expect(result.totalWeightKg).toBe(35); // 10*2 + 15*1
    expect(result.chargeableWeightKg).toBeGreaterThanOrEqual(result.totalWeightKg);
    expect(result.densityKgM3).toBeGreaterThan(0);
  });

  it('should validate input constraints', () => {
    const invalidBoxes: CargoBox[] = [
      { l: 250, w: 40, h: 30, weight: 10, qty: 1 } // l > 200cm
    ];

    expect(() => ChatConfigurator.calculate(invalidBoxes)).toThrow('Box dimensions cannot exceed 200cm');
  });

  it('should handle volume weight calculation', () => {
    const volumeBox: CargoBox[] = [
      { l: 100, w: 100, h: 100, weight: 1, qty: 1 } // Very light but large
    ];

    const result = ChatConfigurator.calculate(volumeBox, 5000);
    expect(result.chargeableWeightKg).toBeGreaterThan(result.totalWeightKg);
  });

  it('should generate human-readable summary', () => {
    const result = ChatConfigurator.calculate(sampleBoxes, 5000);
    
    expect(result.summary).toContain('коробок');
    expect(result.summary).toContain('м³');
    expect(result.summary).toContain('кг');
  });

  it('should generate system message payload', () => {
    const result = ChatConfigurator.calculate(sampleBoxes, 5000);
    const systemMessage = ChatConfigurator.generateSystemMessage(result, 'Test note');
    
    expect(systemMessage.type).toBe('configurator');
    expect(systemMessage.data.summary).toBe(result.summary);
    expect(systemMessage.data.note).toBe('Test note');
  });
});
