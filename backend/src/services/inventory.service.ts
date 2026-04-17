import { InventoryRepository } from '../repositories/inventory.repository';
import { ProductRepository } from '../repositories/product.repository';
import { AlertRepository } from '../repositories/alerts.repository';
import { CreateMovementDTO, RecordDailyStockDTO } from '../types/inventory.types';
import pool from '../config/db';

export class InventoryService {
  private repository: InventoryRepository;
  private productRepo: ProductRepository;
  private alertRepo: AlertRepository;

  constructor() {
    this.repository = new InventoryRepository();
    this.productRepo = new ProductRepository();
    this.alertRepo = new AlertRepository();
  }

  async getMovements() {
    return this.repository.findAllMovements();
  }

  async createManualMovement(data: CreateMovementDTO) {
    if (data.quantity <= 0) throw new Error('La cantidad debe ser mayor a cero');

    const product = await this.productRepo.findById(data.product_id);
    if (!product) throw new Error('El producto no existe');

    const movement = await this.repository.createMovement(data);

    // Verificar alerta automática en cualquier salida manual
    if (data.movement_type === 'exit_manual') {
      await this.alertRepo.checkAndCreateAlert(data.product_id).catch(() => {});
    }

    return movement;
  }

  async getStock(productId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new Error('El producto no existe');

    const stock = await this.repository.getCalculatedStock(productId);
    return { product, current_stock: stock };
  }

  /**
   * Cierre diario para productos NO CONTABLES.
   * El encargado anota quantity_start y quantity_end visualmente.
   * El sistema calcula el consumo (columna estimated_consumption en BD).
   * También verifica si la cantidad final está por debajo del mínimo y genera alerta.
   */
  async recordDailyStock(data: RecordDailyStockDTO) {
    if (data.quantity_start < 0 || data.quantity_end < 0) {
      throw new Error('Las cantidades no pueden ser negativas');
    }

    const record = await this.repository.recordDailyStock(data);

    // Para productos no contables: verificar si quantity_end < min_quantity
    const product = await this.productRepo.findById(data.product_id);
    if (product) {
      const min = Number(product.min_quantity);
      const current = Number(data.quantity_end);
      const alertType = current <= 0 ? 'out_of_stock' : current < min ? 'low_stock' : null;

      if (alertType) {
        await pool.query(`
          INSERT INTO alerts (product_id, alert_type, threshold_value, current_value)
          SELECT $1, $2, $3, $4
          WHERE NOT EXISTS (
            SELECT 1 FROM alerts WHERE product_id = $1 AND alert_type = $2 AND resolved = false
          )
        `, [data.product_id, alertType, min, current]).catch(() => {});
      } else {
        // Stock recuperado: resolver alertas previas
        await pool.query(
          `UPDATE alerts SET resolved = true, resolved_at = NOW() WHERE product_id = $1 AND resolved = false`,
          [data.product_id]
        ).catch(() => {});
      }
    }

    return record;
  }
}
