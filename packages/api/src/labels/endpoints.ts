import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { generateLabel, createShipmentLabel, validateLabelData } from '@yp/files';

const router: Router = Router();

// Middleware для проверки аутентификации
function authenticateToken(req: any, res: any, next: any) {
  // TODO: Implement proper JWT authentication
  req.user = { id: 'mock-user', role: 'ADMIN' };
  next();
}

// Схемы валидации
const LabelDataSchema = z.object({
  trackingNumber: z.string().min(1),
  orderNumber: z.string().min(1),
  qrCode: z.string().min(1),
  senderName: z.string().min(1),
  senderAddress: z.string().min(1),
  senderCity: z.string().min(1),
  senderCountry: z.string().min(1),
  senderPhone: z.string().optional(),
  recipientName: z.string().min(1),
  recipientAddress: z.string().min(1),
  recipientCity: z.string().min(1),
  recipientCountry: z.string().min(1),
  recipientPhone: z.string().optional(),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  description: z.string().min(1),
  value: z.number().positive().optional(),
  currency: z.string().optional(),
  specialInstructions: z.string().optional(),
  serviceType: z.string().optional(),
  deliveryDate: z.string().optional(),
  barcode: z.string().optional(),
});

const LabelOptionsSchema = z.object({
  format: z.enum(['A6', 'A7']).default('A6'),
  template: z.enum(['standard', 'express', 'fragile']).default('standard'),
  language: z.enum(['ru', 'en', 'zh']).default('ru'),
  includeQR: z.boolean().default(true),
  includeBarcode: z.boolean().default(true),
  includeLogo: z.boolean().default(true),
});

const CreateShipmentLabelSchema = z.object({
  shipmentId: z.string().min(1),
  senderName: z.string().min(1),
  senderAddress: z.string().min(1),
  senderCity: z.string().min(1),
  senderCountry: z.string().min(1),
  senderPhone: z.string().optional(),
  recipientName: z.string().min(1),
  recipientAddress: z.string().min(1),
  recipientCity: z.string().min(1),
  recipientCountry: z.string().min(1),
  recipientPhone: z.string().optional(),
  weight: z.number().positive(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
  }),
  description: z.string().min(1),
  value: z.number().positive().optional(),
  currency: z.string().optional(),
  specialInstructions: z.string().optional(),
  serviceType: z.string().optional(),
  deliveryDate: z.string().optional(),
});

// POST /api/labels/generate
router.post('/generate', authenticateToken, async (req: any, res: any) => {
  try {
    const { data, options } = req.body;

    // Валидируем данные
    const dataValidation = LabelDataSchema.safeParse(data);
    if (!dataValidation.success) {
      return res.status(400).json({
        error: 'Invalid label data',
        details: dataValidation.error.errors,
      });
    }

    const optionsValidation = LabelOptionsSchema.safeParse(options || {});
    if (!optionsValidation.success) {
      return res.status(400).json({
        error: 'Invalid label options',
        details: optionsValidation.error.errors,
      });
    }

    // Дополнительная валидация
    const validation = validateLabelData(dataValidation.data);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Label data validation failed',
        details: validation.errors,
      });
    }

    // Генерируем этикетку
    const result = await generateLabel(dataValidation.data, optionsValidation.data);

    // Возвращаем PDF как файл
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="label_${result.labelId}.pdf"`);
    res.setHeader('Content-Length', result.pdfBuffer.length);
    res.send(result.pdfBuffer);

  } catch (error) {
    console.error('Label generation error:', error);
    res.status(500).json({ error: 'Failed to generate label' });
  }
});

// POST /api/labels/shipment/:shipmentId
router.post('/shipment/:shipmentId', authenticateToken, async (req: any, res: any) => {
  try {
    const { shipmentId } = req.params;
    const labelData = req.body;

    // Валидируем данные
    const validation = CreateShipmentLabelSchema.safeParse({
      shipmentId,
      ...labelData,
    });

    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid shipment label data',
        details: validation.error.errors,
      });
    }

    // Создаем этикетку для отгрузки
    const result = await createShipmentLabel(shipmentId, labelData);

    // Возвращаем PDF как файл
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="shipment_${shipmentId}_label.pdf"`);
    res.setHeader('Content-Length', result.pdfBuffer.length);
    res.send(result.pdfBuffer);

  } catch (error) {
    console.error('Shipment label generation error:', error);
    res.status(500).json({ error: 'Failed to generate shipment label' });
  }
});

// GET /api/labels/templates
router.get('/templates', authenticateToken, async (req: any, res: any) => {
  try {
    const templates = [
      {
        id: 'standard',
        name: 'Standard Label',
        description: 'Standard shipping label format',
        formats: ['A6', 'A7'],
        languages: ['ru', 'en', 'zh'],
      },
      {
        id: 'express',
        name: 'Express Label',
        description: 'Express shipping label with priority marking',
        formats: ['A6'],
        languages: ['ru', 'en'],
      },
      {
        id: 'fragile',
        name: 'Fragile Label',
        description: 'Fragile goods label with special handling instructions',
        formats: ['A6', 'A7'],
        languages: ['ru', 'en'],
      },
    ];

    res.json({ templates });

  } catch (error) {
    console.error('Templates endpoint error:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

// GET /api/labels/formats
router.get('/formats', authenticateToken, async (req: any, res: any) => {
  try {
    const formats = [
      {
        id: 'A6',
        name: 'A6 (105×148 mm)',
        width: 105,
        height: 148,
        description: 'Standard label size',
      },
      {
        id: 'A7',
        name: 'A7 (74×105 mm)',
        width: 74,
        height: 105,
        description: 'Compact label size',
      },
    ];

    res.json({ formats });

  } catch (error) {
    console.error('Formats endpoint error:', error);
    res.status(500).json({ error: 'Failed to get formats' });
  }
});

// POST /api/labels/validate
router.post('/validate', authenticateToken, async (req: any, res: any) => {
  try {
    const { data } = req.body;

    // Валидируем данные
    const dataValidation = LabelDataSchema.safeParse(data);
    if (!dataValidation.success) {
      return res.status(400).json({
        valid: false,
        errors: dataValidation.error.errors,
      });
    }

    // Дополнительная валидация
    const validation = validateLabelData(dataValidation.data);
    
    res.json({
      valid: validation.valid,
      errors: validation.errors,
    });

  } catch (error) {
    console.error('Validation endpoint error:', error);
    res.status(500).json({ error: 'Failed to validate label data' });
  }
});

export { router as labelsRouter };

