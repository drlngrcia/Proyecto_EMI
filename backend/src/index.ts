import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/db';
import router from './routes';

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT ?? 3000;

// ── Middlewares ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ────────────────────────────────────────────────────
app.use('/api', router);

// ── Arranque ─────────────────────────────────────────────────
const start = async (): Promise<void> => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
  });
};

start();
