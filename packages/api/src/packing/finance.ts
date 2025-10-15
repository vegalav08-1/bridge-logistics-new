import { db } from '@yp/db';

export interface PriceRules {
  packing?: {
    fixed?: number;
    perKg?: number;
  };
  insurance?: {
    percent?: number;
  };
  other?: Array<{
    title: string;
    amount: number;
  }>;
}

export class PackingFinanceService {
  // Применение автоопераций для упаковки
  static async applyPackingAutoOps(
    parcelId: string, 
    priceRules: PriceRules,
    chatId: string,
    userId: string
  ) {
    // Сначала сторнируем предыдущие AUTO операции для этого Parcel
    await this.reversePackingAutoOps(parcelId);

    const operations = [];

    // Стоимость упаковки
    if (priceRules.packing) {
      const parcel = await db.parcel.findUnique({
        where: { id: parcelId },
        select: { weightKg: true, kind: true, name: true }
      });

      if (parcel) {
        let packingAmount = 0;

        if (priceRules.packing.fixed) {
          packingAmount += priceRules.packing.fixed;
        }

        if (priceRules.packing.perKg && parcel.weightKg) {
          packingAmount += priceRules.packing.perKg * parcel.weightKg;
        }

        if (packingAmount > 0) {
          operations.push({
            chatId,
            userId,
            opKind: 'pack',
            title: `Упаковка ${parcel.name || parcel.kind} #${parcelId.slice(-6)}`,
            amount: packingAmount,
            currency: 'USD', // TODO: получать из настроек чата
            isAuto: true,
            metadata: JSON.stringify({
              parcelId,
              packingType: 'fixed',
              weight: parcel.weightKg
            })
          });
        }
      }
    }

    // Страховка
    if (priceRules.insurance?.percent) {
      // TODO: получать стоимость товара из чата/отгрузки
      const goodsValue = 0; // Пока заглушка
      if (goodsValue > 0) {
        const insuranceAmount = goodsValue * (priceRules.insurance.percent / 100);
        operations.push({
          chatId,
          userId,
          opKind: 'insurance',
          title: `Страховка ${priceRules.insurance.percent}%`,
          amount: insuranceAmount,
          currency: 'USD',
          isAuto: true,
          metadata: JSON.stringify({
            parcelId,
            insurancePercent: priceRules.insurance.percent
          })
        });
      }
    }

    // Прочие услуги
    if (priceRules.other) {
      for (const service of priceRules.other) {
        operations.push({
          chatId,
          userId,
          opKind: 'other',
          title: service.title,
          amount: service.amount,
          currency: 'USD',
          isAuto: true,
          metadata: JSON.stringify({
            parcelId,
            serviceType: 'other'
          })
        });
      }
    }

    // Создаем операции в FinanceLedger
    if (operations.length > 0) {
      await db.financeLedger.createMany({
        data: operations
      });
    }

    return operations;
  }

  // Сторнирование предыдущих AUTO операций
  static async reversePackingAutoOps(parcelId: string) {
    // Находим все AUTO операции для этого Parcel
    const autoOps = await db.financeLedger.findMany({
      where: {
        isAuto: true,
        metadata: {
          contains: parcelId
        }
      }
    });

    // Создаем сторнирующие операции
    const reverseOps = autoOps.map(op => ({
      chatId: op.chatId,
      userId: op.userId,
      opKind: op.opKind,
      title: `СТОРНО: ${op.title}`,
      amount: -op.amount, // Отрицательная сумма
      currency: op.currency,
      isAuto: true,
      metadata: JSON.stringify({
        ...JSON.parse(op.metadata || '{}'),
        reversedFrom: op.id,
        parcelId
      })
    }));

    if (reverseOps.length > 0) {
      await db.financeLedger.createMany({
        data: reverseOps
      });
    }

    return reverseOps.length;
  }

  // Получение стоимости упаковки для Parcel
  static async getPackingCost(parcelId: string): Promise<number> {
    const operations = await db.financeLedger.findMany({
      where: {
        isAuto: true,
        metadata: {
          contains: parcelId
        }
      }
    });

    return operations.reduce((total, op) => total + op.amount, 0);
  }

  // Парсинг правил ценообразования из JSON строки
  static parsePriceRules(priceRulesJson: string): PriceRules {
    try {
      return JSON.parse(priceRulesJson);
    } catch (error) {
      console.error('Error parsing price rules:', error);
      return {};
    }
  }
}


