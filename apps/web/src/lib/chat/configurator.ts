import { VolumeWeightCalculator } from '../shipment/number-generator';

/**
 * Cargo box input
 */
export interface CargoBox {
  l: number;        // length in cm
  w: number;        // width in cm  
  h: number;        // height in cm
  weight: number;   // weight in kg
  qty: number;      // quantity
}

/**
 * Configurator calculation result
 */
export interface ConfiguratorResult {
  totalVolumeM3: number;
  totalWeightKg: number;
  chargeableWeightKg: number;
  densityKgM3: number;
  lines: Array<{
    box: CargoBox;
    volumeM3: number;
    volumeWeightKg: number;
    chargeableWeightKg: number;
    densityKgM3: number;
  }>;
  summary: string;
}

/**
 * Configurator calculator
 */
export class ChatConfigurator {
  /**
   * Calculate cargo metrics
   */
  static calculate(
    boxes: CargoBox[],
    divisor: number = 5000
  ): ConfiguratorResult {
    if (boxes.length === 0) {
      throw new Error('At least one box required');
    }

    // Validate inputs
    for (const box of boxes) {
      if (box.l <= 0 || box.w <= 0 || box.h <= 0 || box.weight <= 0 || box.qty <= 0) {
        throw new Error('All box dimensions, weight and quantity must be positive');
      }
      if (box.l > 200 || box.w > 200 || box.h > 200) {
        throw new Error('Box dimensions cannot exceed 200cm');
      }
      if (box.weight > 1000) {
        throw new Error('Box weight cannot exceed 1000kg');
      }
    }

    const lines = boxes.map(box => {
      const volumeM3 = (box.l * box.w * box.h) / 1000000; // cm³ to m³
      const volumeWeightKg = VolumeWeightCalculator.calculateVolumeWeight(
        box.l, box.w, box.h, 'AIR'
      );
      const chargeableWeightKg = Math.max(box.weight, volumeWeightKg);
      const densityKgM3 = box.weight / volumeM3;

      return {
        box,
        volumeM3,
        volumeWeightKg,
        chargeableWeightKg,
        densityKgM3
      };
    });

    // Aggregate totals
    const totalVolumeM3 = lines.reduce((sum, line) => 
      sum + (line.volumeM3 * line.box.qty), 0
    );
    const totalWeightKg = lines.reduce((sum, line) => 
      sum + (line.box.weight * line.box.qty), 0
    );
    const totalVolumeWeightKg = lines.reduce((sum, line) => 
      sum + (line.volumeWeightKg * line.box.qty), 0
    );
    const chargeableWeightKg = Math.max(totalWeightKg, totalVolumeWeightKg);
    const densityKgM3 = totalWeightKg / totalVolumeM3;

    // Generate human-readable summary
    const boxCount = boxes.reduce((sum, box) => sum + box.qty, 0);
    const isVolumeChargeable = totalVolumeWeightKg > totalWeightKg;
    const transportMode = divisor === 5000 ? 'авиа' : divisor === 6000 ? 'морской' : 'авто';

    const summary = [
      `${boxCount} коробок`,
      `общий объём ${totalVolumeM3.toFixed(2)} м³`,
      `фактический вес ${totalWeightKg.toFixed(0)} кг`,
      isVolumeChargeable 
        ? `расчётный вес ${totalVolumeWeightKg.toFixed(0)} кг (${transportMode}, ${divisor})`
        : `расчётный вес ${totalWeightKg.toFixed(0)} кг`,
      `плотность ${densityKgM3.toFixed(0)} кг/м³`
    ].join(', ');

    return {
      totalVolumeM3,
      totalWeightKg,
      chargeableWeightKg,
      densityKgM3,
      lines,
      summary
    };
  }

  /**
   * Generate system message payload for chat
   */
  static generateSystemMessage(result: ConfiguratorResult, note?: string) {
    return {
      type: 'configurator',
      title: 'Расчёт груза',
      data: {
        summary: result.summary,
        details: {
          totalVolumeM3: result.totalVolumeM3,
          totalWeightKg: result.totalWeightKg,
          chargeableWeightKg: result.chargeableWeightKg,
          densityKgM3: result.densityKgM3,
          lines: result.lines.map(line => ({
            dimensions: `${line.box.l}×${line.box.w}×${line.box.h} см`,
            weight: `${line.box.weight} кг`,
            qty: line.box.qty,
            volumeM3: line.volumeM3,
            volumeWeightKg: line.volumeWeightKg,
            chargeableWeightKg: line.chargeableWeightKg,
            densityKgM3: line.densityKgM3
          }))
        },
        note
      }
    };
  }
}
