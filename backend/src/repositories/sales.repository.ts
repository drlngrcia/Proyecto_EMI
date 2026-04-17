import pool from '../config/db';
import { Sale, CreateSaleDTO } from '../types/sales.types';
import { InventoryRepository } from './inventory.repository';
import { AlertRepository } from './alerts.repository';

export class SalesRepository {
  private inventoryRepo: InventoryRepository;
  private alertRepo: AlertRepository;

  constructor() {
    this.inventoryRepo = new InventoryRepository();
    this.alertRepo = new AlertRepository();
  }

  async findAll(): Promise<Sale[]> {
    const result = await pool.query(`
      SELECT * FROM sales ORDER BY created_at DESC
    `);
    return result.rows;
  }

  async findById(id: string): Promise<Sale | null> {
    const saleResult = await pool.query('SELECT * FROM sales WHERE id = $1', [id]);
    const sale = saleResult.rows[0];

    if (!sale) return null;

    const itemsResult = await pool.query(`
      SELECT i.*, p.name as product_name
      FROM sale_items i
      JOIN products p ON i.product_id = p.id
      WHERE i.sale_id = $1
    `, [id]);

    sale.items = itemsResult.rows;
    return sale;
  }

  // AQUÍ ES DONDE SUCEDE LA MAGIA DE LA TRANSACCIÓN
  async createSaleWithTransaction(data: CreateSaleDTO): Promise<Sale> {
    const client = await pool.connect();

    try {
      // 1. Iniciar Transacción
      await client.query('BEGIN');

      // 2. Insertar Cabecera de la Venta
      const saleResult = await client.query(
        `INSERT INTO sales (external_ref, status, created_by) 
         VALUES ($1, 'confirmed', $2) RETURNING *`,
        [data.external_ref, data.created_by]
      );
      const sale = saleResult.rows[0];

      // 3. Insertar Items e impactar Inventario
      for (const item of data.items) {
        // 3.a Insertar sale_item
        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) 
           VALUES ($1, $2, $3, $4)`,
          [sale.id, item.product_id, item.quantity, item.unit_price]
        );

        // 3.b Registrar movimiento salida (exit_sale)
        await client.query(
          `INSERT INTO inventory_movements 
           (product_id, movement_type, quantity, source, sale_id, created_by)
           VALUES ($1, 'exit_sale', $2, 'automatic', $3, $4)`,
          [item.product_id, item.quantity, sale.id, data.created_by]
        );
      }

      // 4. Confirmar todo (Si llega aquí sin errores)
      await client.query('COMMIT');

      // 5. Verificar alertas por cada producto vendido (fuera de la transacción,
      //    para no bloquear si falla el check de alerta)
      for (const item of data.items) {
        await this.alertRepo.checkAndCreateAlert(item.product_id).catch(() => {});
      }
      
      // Obtener el objeto completo con sus items
      const fullSale = await this.findById(sale.id);
      return fullSale!;

    } catch (error) {
      // 5. Ocurrió un error: DESHACER TODO (nadie recibe stock fantasma)
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // 6. Liberar el cliente al pool
      client.release();
    }
  }
}
