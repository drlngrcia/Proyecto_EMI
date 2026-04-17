-- ============================================================
-- Schema EMI – Sistema de Inventario y Ventas
-- ============================================================

-- Extensión para UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Tabla: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR   NOT NULL,
  email      VARCHAR   UNIQUE NOT NULL,
  role       VARCHAR   NOT NULL CHECK (role IN ('admin', 'staff')),
  active     BOOLEAN   DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Tabla: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR   NOT NULL,
  category     VARCHAR,
  unit         VARCHAR   NOT NULL,
  min_quantity DECIMAL   NOT NULL,
  product_type VARCHAR   NOT NULL CHECK (product_type IN ('countable', 'non_countable')),
  active       BOOLEAN   DEFAULT true,
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Tabla: sales
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  external_ref VARCHAR,
  sale_date    TIMESTAMP NOT NULL DEFAULT NOW(),
  status       VARCHAR   NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_by   UUID      REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Tabla: sale_items
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id    UUID    NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID    NOT NULL REFERENCES products(id),
  quantity   DECIMAL NOT NULL,
  unit_price DECIMAL
);

-- ============================================================
-- Tabla: inventory_movements
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_movements (
  id            UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID      NOT NULL REFERENCES products(id),
  movement_type VARCHAR   NOT NULL CHECK (movement_type IN ('entry', 'exit_sale', 'exit_manual')),
  quantity      DECIMAL   NOT NULL,
  source        VARCHAR   NOT NULL CHECK (source IN ('manual', 'automatic')),
  sale_id       UUID      REFERENCES sales(id),
  notes         TEXT,
  created_by    UUID      REFERENCES users(id),
  created_at    TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Tabla: daily_stock
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_stock (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id            UUID    NOT NULL REFERENCES products(id),
  recorded_date         DATE    NOT NULL,
  quantity_start        DECIMAL NOT NULL,
  quantity_end          DECIMAL NOT NULL,
  estimated_consumption DECIMAL GENERATED ALWAYS AS (quantity_start - quantity_end) STORED,
  recorded_by           UUID    REFERENCES users(id),
  created_at            TIMESTAMP DEFAULT NOW(),

  CONSTRAINT unique_product_date UNIQUE (product_id, recorded_date)
);

-- ============================================================
-- Tabla: alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
  id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID      NOT NULL REFERENCES products(id),
  alert_type      VARCHAR   NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
  threshold_value DECIMAL   NOT NULL,
  current_value   DECIMAL   NOT NULL,
  resolved        BOOLEAN   DEFAULT false,
  resolved_at     TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- Datos de prueba (seed mínimo)
-- ============================================================
INSERT INTO users (name, email, role) VALUES
  ('Admin EMI', 'admin@emi.com', 'admin'),
  ('Staff 1',   'staff1@emi.com', 'staff')
ON CONFLICT (email) DO NOTHING;
