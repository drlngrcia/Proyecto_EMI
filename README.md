# RestaurantStock

**Sistema de Gestión de Inventario para Restaurantes**  
Proyecto de Feria EMI · 2026

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 · Vite · TypeScript |
| **Backend** | Node.js · Express · TypeScript |
| **Base de Datos** | PostgreSQL 16 (Dockerizado) |
| **Cliente API** | Bruno (colección incluida en el repo) |
| **Contenedores** | Docker + Docker Compose |

---

## Requisitos Previos

Antes de levantar el proyecto, asegurarse de tener instalado:

- [Node.js](https://nodejs.org/) `v18+` (recomendado: instalar con [nvm](https://github.com/nvm-sh/nvm))
- [Docker](https://www.docker.com/) y **Docker Compose** (viene incluido con Docker Desktop)
- [Bruno](https://www.usebruno.com/) — cliente de API para probar los endpoints (gratis)

> **Verificar instalaciones:**
> ```bash
> node --version      # debe mostrar v18.x.x o superior
> docker --version    # Docker version 24.x o superior
> docker compose version
> ```

---

## Levantar el Proyecto (Paso a Paso)

### 1 Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Proyecto_EMI
```

### 2️ Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

> El archivo `.env` ya viene con valores por defecto que funcionan localmente. No hace falta cambiar nada para desarrollo.

### 3️ Levantar la Base de Datos (Docker)

```bash
docker compose up -d
```

Este comando hace **tres cosas automáticamente**:

1.  Levanta **PostgreSQL 16** en el puerto `5432`
2.  Levanta **pgAdmin** (gestor visual de BD) en el puerto `5050`
3.  Ejecuta `schema.sql` y **crea todas las tablas** con sus relaciones

Verificar que los contenedores estén corriendo:
```bash
docker ps
```
Deberías ver `emi_postgres` y `emi_pgadmin` con estado `Up`.

>  **La base de datos debe estar corriendo ANTES de iniciar el backend.**

### 4️ Instalar dependencias e iniciar el Backend

```bash
cd backend
npm install
npm run dev
```

El servidor arranca en: **`http://localhost:3000`**  
Si la conexión a PostgreSQL es exitosa, verás en consola:
```
 PostgreSQL conectado – 2025-04-17T...
 Servidor corriendo en http://localhost:3000
```

### 5⃣ Instalar dependencias e iniciar el Frontend

En una **nueva terminal**:

```bash
cd frontend
npm install
npm run dev
```

La app React abre en: **`http://localhost:5173`**

---

##  URLs de Acceso

| Servicio | URL | Descripción |
|---|---|---|
| **Frontend** | http://localhost:5173 | Aplicación React |
| **Backend API** | http://localhost:3000/api | REST API |
| **Health Check** | http://localhost:3000/api/health | Estado del servidor |
| **pgAdmin** | http://localhost:5050 | Gestor visual PostgreSQL |

### Credenciales pgAdmin
- **Email:** `admin@emi.com`
- **Password:** `admin123`

Para conectar pgAdmin al servidor de PostgreSQL la primera vez:
1. Click en **Add New Server**
2. **Name:** `EMI Local`
3. Tab **Connection:**  
   - Host: `emi_postgres`  
   - Port: `5432`  
   - Username: `emi_user`  
   - Password: `emi_password`

---

##  Base de Datos

La base de datos se crea **automáticamente** al levantar Docker por primera vez gracias al archivo `schema.sql`.

### Tablas incluidas

| Tabla | Descripción |
|---|---|
| `users` | Usuarios del sistema (admin / staff) |
| `products` | Catálogo de productos e insumos |
| `sales` | Cabeceras de ventas |
| `sale_items` | Ítems detallados de cada venta |
| `inventory_movements` | Historial de entradas y salidas |
| `daily_stock` | Conteo físico diario (solo no contables) |
| `alerts` | Alertas automáticas de bajo stock |

> Los **datos de prueba iniciales** (2 usuarios: admin y staff) son insertados automáticamente por el schema.

### Comandos útiles de Docker

```bash
# Levantar contenedores en segundo plano
docker compose up -d

# Ver logs de PostgreSQL en tiempo real
docker logs emi_postgres -f

# Detener contenedores (sin borrar datos)
docker compose stop

# Detener Y eliminar contenedores (sin borrar datos del volumen)
docker compose down

#   Eliminar TODO incluyendo la base de datos (usar con cuidado)
docker compose down -v
```

---

##  Probar la API con Bruno

El repositorio incluye una colección completa de Bruno lista para usar.

### Cómo importar la colección

1. Abrir **Bruno**
2. Click en **Open Collection**
3. Navegar a la carpeta del proyecto y seleccionar: `backend/bruno/`
4. Activar el environment **Local** (esquina superior derecha en Bruno)

### Endpoints disponibles en la colección

```
 health/
   └── Health Check                    GET  /api/health

 users/
   ├── Get All Users                   GET  /api/users
   └── Create User                     POST /api/users

 products/
   ├── Get All Products                GET  /api/products
   ├── Get Product by ID               GET  /api/products/:id
   ├── Create Product (Contable)       POST /api/products
   ├── Create Product (No Contable)    POST /api/products
   ├── Update Product                  PUT  /api/products/:id
   └── Deactivate Product              DELETE /api/products/:id

 inventory/
   ├── Get All Movements               GET  /api/inventory/movements
   ├── Register Entry                  POST /api/inventory/movements
   ├── Register Exit Manual            POST /api/inventory/movements
   ├── Get Stock by Product            GET  /api/inventory/stock/:productId
   └── Record Daily Stock              POST /api/inventory/daily-stock

 sales/
   ├── Get All Sales                   GET  /api/sales
   ├── Get Sale by ID                  GET  /api/sales/:id
   └── Create Sale                     POST /api/sales

 alerts/
   ├── Get Active Alerts               GET  /api/alerts
   └── Resolve Alert                   PATCH /api/alerts/:id/resolve
```

>  Para entender qué hace cada endpoint en detalle, consultar:  
> **`backend/API_MANUAL.md`** — manual completo para el equipo de frontend.

---

##  Estructura del Proyecto

```
Proyecto_EMI/
├── docker-compose.yml        ← Orquestación de contenedores
├── schema.sql                ← Definición de la BD (se ejecuta al iniciar Docker)
├── .env                      ← Variables de entorno (no subir a git)
├── .env.example              ← Template de variables de entorno
├── .gitignore
│
├── backend/
│   ├── API_MANUAL.md         ←  Manual de API para el frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                  ← Variables del backend (copia del raíz)
│   ├── bruno/                ←  Colección de Bruno (abrir desde Bruno)
│   └── src/
│       ├── index.ts          ← Entry point del servidor
│       ├── config/db.ts      ← Conexión a PostgreSQL
│       ├── routes/           ← Registro de todos los endpoints
│       ├── controllers/      ← Manejo de req/res HTTP
│       ├── services/         ← Lógica de negocio
│       ├── repositories/     ← Consultas a la base de datos
│       └── types/            ← Interfaces TypeScript
│
└── frontend/
    ├── package.json
    ├── vite.config.ts        ← Proxy: /api → localhost:3000
    └── src/
        ├── main.tsx
        └── App.tsx
```

---

## ⚡ Comandos Rápidos (Resumen)

```bash
# Base de datos
docker compose up -d

# Backend (en /backend)
npm install && npm run dev

# Frontend (en /frontend)
npm install && npm run dev
```

---

##  Flujo de Trabajo en Equipo

- El **backend** expone la API en `http://localhost:3000/api`
- El **frontend** tiene configurado un proxy automático: cualquier llamada a `/api/...` se redirige al backend. No es necesario escribir la URL completa en fetch, solo `/api/...`
- Las **alertas de stock** son generadas **automáticamente** por el backend — el frontend solo las consulta y las marca como resueltas.
- La colección de **Bruno** ya tiene todos los bodies de ejemplo listos. Solo hay que reemplazar los UUIDs con los que devuelva la BD al crear registros.

---

>  Cualquier duda sobre los endpoints: revisar `backend/API_MANUAL.md`
