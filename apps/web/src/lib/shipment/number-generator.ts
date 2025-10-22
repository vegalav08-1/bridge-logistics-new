import { ShipmentNumberComponents, ShipmentNumber } from '../domain/shipment';

/**
 * Shipment number generator with client code
 * Format: BRYYYYMMDD_seq_boxes(CODE)
 */
export class ShipmentNumberGenerator {
  /**
   * Generate shipment number components
   */
  static generateComponents(
    date: Date,
    boxes: number,
    clientCode: string
  ): ShipmentNumberComponents {
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    
    return {
      date: dateStr,
      sequence: 0, // Will be set by database sequence
      boxes,
      client_code: clientCode
    };
  }

  /**
   * Format shipment number from components
   */
  static formatNumber(components: ShipmentNumberComponents): ShipmentNumber {
    const { date, sequence, boxes, client_code } = components;
    return `BR${date}_${sequence}_${boxes}(${client_code})` as ShipmentNumber;
  }

  /**
   * Parse shipment number back to components
   */
  static parseNumber(number: string): ShipmentNumberComponents | null {
    const match = number.match(/^BR(\d{8})_(\d+)_(\d+)\((\d{3,6})\)$/);
    if (!match) return null;

    const [, date, sequence, boxes, client_code] = match;
    
    return {
      date,
      sequence: parseInt(sequence, 10),
      boxes: parseInt(boxes, 10),
      client_code
    };
  }

  /**
   * Validate shipment number format
   */
  static isValidNumber(number: string): boolean {
    return /^BR\d{8}_\d+_\d+\(\d{3,6}\)$/.test(number);
  }

  /**
   * Extract client code from shipment number
   */
  static extractClientCode(number: string): string | null {
    const match = number.match(/\((\d{3,6})\)$/);
    return match ? match[1] : null;
  }

  /**
   * Extract date from shipment number
   */
  static extractDate(number: string): Date | null {
    const match = number.match(/^BR(\d{8})_/);
    if (!match) return null;

    const dateStr = match[1];
    const year = parseInt(dateStr.slice(0, 4), 10);
    const month = parseInt(dateStr.slice(4, 6), 10) - 1; // JS months are 0-based
    const day = parseInt(dateStr.slice(6, 8), 10);

    return new Date(year, month, day);
  }
}

/**
 * Volume weight calculator
 */
export class VolumeWeightCalculator {
  private static readonly VOLUME_FACTORS = {
    AIR: 5000,    // kg/m³
    SEA: 6000,    // kg/m³
    TRUCK: 3000,  // kg/m³
    RAIL: 3000,   // kg/m³
  };

  /**
   * Calculate volume weight for cargo item
   */
  static calculateVolumeWeight(
    length: number, // cm
    width: number,  // cm
    height: number, // cm
    transportMode: keyof typeof VolumeWeightCalculator.VOLUME_FACTORS = 'AIR'
  ): number {
    const volume = (length * width * height) / 1000000; // m³
    const factor = this.VOLUME_FACTORS[transportMode];
    return volume * factor;
  }

  /**
   * Calculate chargeable weight (max of actual and volume weight)
   */
  static calculateChargeableWeight(
    actualWeight: number,
    volumeWeight: number
  ): number {
    return Math.max(actualWeight, volumeWeight);
  }

  /**
   * Get volume weight calculation details
   */
  static getCalculationDetails(
    length: number,
    width: number,
    height: number,
    actualWeight: number,
    transportMode: keyof typeof VolumeWeightCalculator.VOLUME_FACTORS = 'AIR'
  ) {
    const volumeWeight = this.calculateVolumeWeight(length, width, height, transportMode);
    const chargeableWeight = this.calculateChargeableWeight(actualWeight, volumeWeight);
    
    return {
      actual_weight: actualWeight,
      volume_weight: volumeWeight,
      chargeable_weight: chargeableWeight,
      volume_factor: this.VOLUME_FACTORS[transportMode],
      is_volume_chargeable: volumeWeight > actualWeight
    };
  }
}

/**
 * Client code utilities
 */
export class ClientCodeUtils {
  /**
   * Generate random client code (3-6 digits)
   */
  static generateRandom(length: number = 4): string {
    if (length < 3 || length > 6) {
      throw new Error('Client code length must be between 3 and 6 digits');
    }
    
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    
    return code.toString().padStart(length, '0');
  }

  /**
   * Validate client code format
   */
  static isValid(code: string): boolean {
    return /^\d{3,6}$/.test(code);
  }

  /**
   * Format client code with leading zeros if needed
   */
  static format(code: string, targetLength: number = 4): string {
    if (!this.isValid(code)) {
      throw new Error('Invalid client code format');
    }
    
    return code.padStart(targetLength, '0');
  }
}
