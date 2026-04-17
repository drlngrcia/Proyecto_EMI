import pool from '../config/db';
import { Alert } from '../types/alerts.types';
import { Request, Response, Router } from 'express';

export class AlertRepository {
  async findActiveAlerts(): Promise<Alert[]> {
    const result = await pool.query(`
      SELECT a.*, p.name as product_name 
      FROM alerts a
      JOIN products p ON a.product_id = p.id
      WHERE a.resolved = false 
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  }

  async resolveAlert(id: string): Promise<boolean> {
    const result = await pool.query(`
      UPDATE alerts SET resolved = true, resolved_at = NOW() WHERE id = $1
    `, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

const alertRepository = new AlertRepository();

export class AlertController {
  async getActive(req: Request, res: Response) {
    try {
      const alerts = await alertRepository.findActiveAlerts();
      res.json(alerts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async resolve(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await alertRepository.resolveAlert(id);
      if (!success) return res.status(404).json({ message: 'Alerta no encontrada' });
      res.json({ message: 'Alerta marcada como resuelta' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

const router = Router();
const alertController = new AlertController();

router.get('/', (req, res) => alertController.getActive(req, res));
router.patch('/:id/resolve', (req, res) => alertController.resolve(req, res));

export default router;
