import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';

const router = Router();
const productController = new ProductController();

// Es necesario bindiar 'this' o usar arrow functions de clase en el controller
// o simplemente llamar el método desde el controller
router.get('/', (req, res) => productController.getAll(req, res));
router.get('/:id', (req, res) => productController.getById(req, res));
router.post('/', (req, res) => productController.create(req, res));
router.put('/:id', (req, res) => productController.update(req, res));
router.delete('/:id', (req, res) => productController.deactivate(req, res));

export default router;
