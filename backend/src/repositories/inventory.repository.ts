import pool from '../config/db';
import { InventoryMovement, CreateMovementDTO, DailyStock, RecordDailyStockDTO } from '../types/inventory.types';

export class InventoryRepository {
  async findAllMovements(): Promise<InventoryMovement[]> {
    const result = await pool.query(`
      SELECT m.*, p.name as product_name
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      ORDER BY m.created_at DESC
    `);
    return result.rows;
  }

  async getCalculatedStock(productId: string): Promise<number> {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN movement_type = 'entry' THEN quantity ELSE -quantity END), 0) as current_stock
      FROM inventory_movements
      WHERE product_id = $1
    `, [productId]);
    
    return Number(result.rows[0].current_stock);
  }

  async createMovement(data: CreateMovementDTO, client = pool): Promise<InventoryMovement> {
    const result = await client.query(
      `INSERT INTO inventory_movements 
        (product_id, movement_type, quantity, source, notes, created_by) 
       VALUES ($1, $2, $3, 'manual', $4, $5) RETURNING *`,
      [data.product_id, data.movement_type, data.quantity, data.notes, data.created_by]
    );
    return result.rows[0];
  }

  async recordDailyStock(data: RecordDailyStockDTO): Promise<DailyStock> {
    const result = await pool.query(
      `INSERT INTO daily_stock 
        (product_id, recorded_date, quantity_start, quantity_end, recorded_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (product_id, recorded_date) 
       DO UPDATE SET 
         quantity_start = EXCLUDED.quantity_start,
         quantity_end = EXCLUDED.quantity_end,
         recorded_by = EXCLUDED.recorded_by
       RETURNING *`,
      [data.product_id, data.recorded_date, data.quantity_start, data.quantity_end, data.recorded_by]
    );
    return result.rows[0];
  }
}
