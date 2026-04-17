import { Router, Request, Response } from 'express';

const router = Router();

// ── Health check ─────────────────────────────────────────────
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'API EMI funcionando correctamente 🚀',
    timestamp: new Date().toISOString(),
  });
});

import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import salesRoutes from './sales.routes';
import usersRoutes from './users.routes';
import alertsRoutes from './alerts.routes';

router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/users', usersRoutes);
router.use('/alerts', alertsRoutes);

export default router;
