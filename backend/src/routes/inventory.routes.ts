import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';

const router = Router();
const inventoryController = new InventoryController();

router.get('/movements', (req, res) => inventoryController.getMovements(req, res));
router.post('/movements', (req, res) => inventoryController.createMovement(req, res));
router.get('/stock/:productId', (req, res) => inventoryController.getStock(req, res));
router.post('/daily-stock', (req, res) => inventoryController.recordDailyStock(req, res));

export default router;
