import pool from '../config/db';
import { Product, CreateProductDTO, UpdateProductDTO } from '../types/product.types';

export class ProductRepository {
  async findAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  }

  async findById(id: string): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async create(data: CreateProductDTO): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (name, category, unit, min_quantity, product_type) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.name, data.category, data.unit, data.min_quantity, data.product_type]
    );
    return result.rows[0];
  }

  async update(id: string, data: UpdateProductDTO): Promise<Product | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = $${idx}`);
        values.push(value);
        idx++;
      }
    }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    const query = `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    // Soft delete
    const result = await pool.query('UPDATE products SET active = false WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
