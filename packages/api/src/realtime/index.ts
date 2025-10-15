import { Router, type Request, type Response } from 'express';
// Real-time endpoints will be implemented when @yp/realtime is ready

const router: Router = Router();

// Placeholder endpoints - will be implemented when @yp/realtime is ready
router.get('/ws', (req: any, res: any) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/sse', (req: any, res: any) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.post('/command', (req: any, res: any) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/metrics', (req: any, res: any) => {
  res.status(501).json({ error: 'Not implemented yet' });
});

router.get('/health', (req: any, res: any) => {
  res.json({ status: 'ok', message: 'Real-time service not ready' });
});

export { router as realtimeRouter };
