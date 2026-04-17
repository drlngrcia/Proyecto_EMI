import { Router } from 'express';
import { SalesController } from '../controllers/sales.controller';

const router = Router();
const salesController = new SalesController();

router.get('/', (req, res) => salesController.getAll(req, res));
router.get('/:id', (req, res) => salesController.getById(req, res));
router.post('/', (req, res) => salesController.processSale(req, res));

export default router;
