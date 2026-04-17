import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';

const productService = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error: any) {
      if (error.message.includes('negativa')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.updateProduct(id, req.body);
      if (!product) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async deactivate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await productService.deactivateProduct(id);
      if (!success) return res.status(404).json({ message: 'Producto no encontrado' });
      res.json({ message: 'Producto desactivado exitosamente' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
