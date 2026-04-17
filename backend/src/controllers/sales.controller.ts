import { Request, Response } from 'express';
import { SalesService } from '../services/sales.service';

const salesService = new SalesService();

export class SalesController {
  async getAll(req: Request, res: Response) {
    try {
      const sales = await salesService.getAllSales();
      res.json(sales);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sale = await salesService.getSaleById(id);
      if (!sale) return res.status(404).json({ message: 'Venta no encontrada' });
      res.json(sale);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async processSale(req: Request, res: Response) {
    try {
      const result = await salesService.processNewSale(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
