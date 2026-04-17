import { Request, Response } from 'express';
import { InventoryService } from '../services/inventory.service';

const inventoryService = new InventoryService();

export class InventoryController {
  async getMovements(req: Request, res: Response) {
    try {
      const movements = await inventoryService.getMovements();
      res.json(movements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async createMovement(req: Request, res: Response) {
    try {
      const movement = await inventoryService.createManualMovement(req.body);
      res.status(201).json(movement);
    } catch (error: any) {
      const status = error.message.includes('exist') || error.message.includes('cero') ? 400 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  async getStock(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const stockInfo = await inventoryService.getStock(productId);
      res.json(stockInfo);
    } catch (error: any) {
      const status = error.message.includes('exist') ? 404 : 500;
      res.status(status).json({ message: error.message });
    }
  }

  async recordDailyStock(req: Request, res: Response) {
    try {
      const result = await inventoryService.recordDailyStock(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
