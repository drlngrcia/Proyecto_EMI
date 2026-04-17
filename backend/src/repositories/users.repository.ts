import pool from '../config/db';
import { User, CreateUserDTO } from '../types/users.types';

export class UserRepository {
  async findAll(): Promise<User[]> {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return result.rows;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const result = await pool.query(
      `INSERT INTO users (name, email, role) VALUES ($1, $2, $3) RETURNING *`,
      [data.name, data.email, data.role]
    );
    return result.rows[0];
  }
}
