import pool from '../config/db';

export class AlertRepository {
  /**
   * Verifica si el stock actual de un producto está por debajo de su mínimo
   * y crea/reactiva una alerta automáticamente si corresponde.
   * Se llama después de cualquier salida de inventario.
   */
  async checkAndCreateAlert(productId: string, client: any = pool): Promise<void> {
    // Obtener producto y su stock calculado en una sola query
    const result = await client.query(`
      SELECT
        p.id,
        p.min_quantity,
        COALESCE(SUM(
          CASE WHEN m.movement_type = 'entry' THEN m.quantity ELSE -m.quantity END
        ), 0) AS current_stock
      FROM products p
      LEFT JOIN inventory_movements m ON m.product_id = p.id
      WHERE p.id = $1
      GROUP BY p.id, p.min_quantity
    `, [productId]);

    if (!result.rows[0]) return;

    const { min_quantity, current_stock } = result.rows[0];
    const stock = Number(current_stock);
    const min = Number(min_quantity);

    const alertType = stock <= 0 ? 'out_of_stock' : stock < min ? 'low_stock' : null;

    if (alertType) {
      // Insertar alerta solo si no existe una activa del mismo tipo para este producto
      await client.query(`
        INSERT INTO alerts (product_id, alert_type, threshold_value, current_value)
        SELECT $1, $2, $3, $4
        WHERE NOT EXISTS (
          SELECT 1 FROM alerts 
          WHERE product_id = $1 AND alert_type = $2 AND resolved = false
        )
      `, [productId, alertType, min, stock]);
    } else {
      // Si el stock volvió a estar bien, resolver alertas activas pendientes
      await client.query(`
        UPDATE alerts SET resolved = true, resolved_at = NOW()
        WHERE product_id = $1 AND resolved = false
      `, [productId]);
    }
  }
}
