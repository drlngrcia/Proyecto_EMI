import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// ── Pool de conexiones PostgreSQL ────────────────────────────
const pool = new Pool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     ?? 'emi_user',
  password: process.env.DB_PASSWORD ?? 'emi_password',
  database: process.env.DB_NAME     ?? 'emi_db',
  // Configuración del pool
  max: 20,                // máximo de clientes simultáneos
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

// ── Verificar conexión al arrancar ───────────────────────────
export const testConnection = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() AS now');
    client.release();
    console.log(`✅ PostgreSQL conectado – ${result.rows[0].now}`);
  } catch (error) {
    console.error('❌ Error al conectar con PostgreSQL:', error);
    process.exit(1);
  }
};

export default pool;
