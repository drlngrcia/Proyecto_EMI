# 📦 RestaurantStock – Manual de API Backend

> **Para el equipo de Frontend**  
> Base URL local: `http://localhost:3000/api`  
> Stack: Node.js · Express · TypeScript · PostgreSQL 16

---

## 📌 Índice

1. [Conceptos clave](#1-conceptos-clave)
2. [Flujo general del sistema](#2-flujo-general-del-sistema)
3. [Tipos de datos importantes](#3-tipos-de-datos-importantes)
4. [Endpoints](#4-endpoints)
   - [Health](#-health)
   - [Usuarios](#-usuarios)
   - [Productos](#-productos)
   - [Inventario](#-inventario)
   - [Ventas](#-ventas)
   - [Alertas](#-alertas)
5. [Códigos de respuesta](#5-códigos-de-respuesta)
6. [Flujo recomendado de prueba](#6-flujo-recomendado-de-prueba)

---

## 1. Conceptos Clave

Antes de consumir la API, es importante entender estas diferencias del dominio:

### Productos Contables vs No Contables

| | Contable (`countable`) | No Contable (`non_countable`) |
|---|---|---|
| **Ejemplos** | Latas, panes, botellas | Queso, jamón, lechuga |
| **¿Cómo se descuenta?** | Automáticamente al registrar una venta | Manualmente al cierre del día |
| **Endpoint para descontar** | `POST /api/sales` | `POST /api/inventory/daily-stock` |
| **Cálculo de consumo** | Sistema registra cada salida | `quantity_start - quantity_end` del día |

### Alertas Automáticas

El backend genera alertas **de forma automática** — el frontend NO necesita crearlas. Se activan en estas situaciones:

- Al procesar una venta (`POST /sales`) → si el stock de algún producto vendido baja del mínimo
- Al registrar una salida manual (`exit_manual`) → igual verificación
- Al registrar el cierre diario (`POST /daily-stock`) → para no contables

Tipos de alerta:
- `low_stock` → stock actual < `min_quantity`
- `out_of_stock` → stock actual ≤ 0

---

## 2. Flujo General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO TÍPICO DE UN DÍA                   │
└─────────────────────────────────────────────────────────────┘

1. MAÑANA — Recepción de mercadería
   POST /api/inventory/movements  (movement_type: "entry")
   ↳ Aumenta el stock de los productos recibidos

2. DURANTE EL DÍA — Se registran ventas
   POST /api/sales
   ↳ [Transacción atómica]
      a) Crea registro en tabla `sales`
      b) Crea los ítems en `sale_items`
      c) Crea movimientos de salida en `inventory_movements` (exit_sale, automático)
      d) Verifica si algún producto bajó del mínimo → genera alerta si corresponde

3. TARDE — Baja por pérdida o vencimiento
   POST /api/inventory/movements  (movement_type: "exit_manual")
   ↳ Descuenta stock manualmente
   ↳ Genera alerta si el stock queda bajo

4. CIERRE DE DÍA — Solo para productos NO CONTABLES
   POST /api/inventory/daily-stock
   ↳ El encargado anota cuánto queda visualmente
   ↳ El sistema calcula consumo = quantity_start - quantity_end
   ↳ Genera alerta si quantity_end < min_quantity

5. PANEL DE ALERTAS — En cualquier momento
   GET /api/alerts
   ↳ Devuelve todas las alertas activas (no resueltas)
   
   PATCH /api/alerts/:id/resolve
   ↳ Marca una alerta como resuelta (ej: al reponer mercadería)
```

---

## 3. Tipos de Datos Importantes

### Producto
```json
{
  "id": "uuid",
  "name": "Lata de Atún",
  "category": "Enlatados",
  "unit": "unidad",
  "min_quantity": 5,
  "product_type": "countable",
  "active": true,
  "created_at": "2025-04-17T00:00:00.000Z"
}
```

### Movimiento de Inventario
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "product_name": "Lata de Atún",
  "movement_type": "entry | exit_sale | exit_manual",
  "quantity": 10,
  "source": "manual | automatic",
  "sale_id": "uuid | null",
  "notes": "Texto libre | null",
  "created_by": "uuid | null",
  "created_at": "2025-04-17T00:00:00.000Z"
}
```

### Stock calculado (respuesta de `/inventory/stock/:id`)
```json
{
  "product": { ...campos del producto... },
  "current_stock": 37
}
```

### Venta completa (respuesta de `GET /sales/:id`)
```json
{
  "id": "uuid",
  "external_ref": "TICKET-001",
  "sale_date": "2025-04-17T00:00:00.000Z",
  "status": "confirmed",
  "created_by": "uuid | null",
  "created_at": "2025-04-17T00:00:00.000Z",
  "items": [
    {
      "id": "uuid",
      "sale_id": "uuid",
      "product_id": "uuid",
      "product_name": "Lata de Atún",
      "quantity": 3,
      "unit_price": 5.50
    }
  ]
}
```

### Alerta
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "product_name": "Lata de Atún",
  "alert_type": "low_stock | out_of_stock",
  "threshold_value": 5,
  "current_value": 2,
  "resolved": false,
  "resolved_at": null,
  "created_at": "2025-04-17T00:00:00.000Z"
}
```

---

## 4. Endpoints

---

### 🟢 Health

#### `GET /api/health`
Verifica que el servidor esté corriendo. Útil para saber si el backend está disponible antes de renderizar la app.

**Respuesta exitosa `200`**
```json
{
  "status": "ok",
  "message": "API EMI funcionando correctamente 🚀",
  "timestamp": "2025-04-17T06:00:00.000Z"
}
```

---

### 👤 Usuarios

#### `GET /api/users`
Lista todos los usuarios del sistema (admin y staff).

**Respuesta `200`** → Array de usuarios

---

#### `POST /api/users`
Crea un nuevo usuario (encargado o admin del restaurante).

**Body**
```json
{
  "name": "Juan Pérez",
  "email": "juan@restaurante.com",
  "role": "staff"
}
```
> Roles válidos: `"admin"` | `"staff"`

**Respuesta `201`** → Usuario creado  
**Error `400`** → Email ya registrado

---

### 🍅 Productos

#### `GET /api/products`
Lista el catálogo de productos (ingredientes e insumos).

**Respuesta `200`** → Array de productos

---

#### `GET /api/products/:id`
Detalle de un producto específico.

**Respuesta `200`** → Producto  
**Error `404`** → Producto no encontrado

---

#### `POST /api/products`
Crea un producto nuevo en el catálogo.

**Body — Producto Contable**
```json
{
  "name": "Lata de Atún",
  "category": "Enlatados",
  "unit": "unidad",
  "min_quantity": 5,
  "product_type": "countable"
}
```

**Body — Producto No Contable**
```json
{
  "name": "Queso Cheddar",
  "category": "Lácteos",
  "unit": "kg",
  "min_quantity": 0.5,
  "product_type": "non_countable"
}
```

> Valores válidos `product_type`: `"countable"` | `"non_countable"`  
> El campo `category` es opcional.

**Respuesta `201`** → Producto creado  
**Error `400`** → `min_quantity` negativa

---

#### `PUT /api/products/:id`
Edita uno o más campos de un producto.

**Body** (todos los campos son opcionales)
```json
{
  "name": "Lata de Atún Premium",
  "min_quantity": 10,
  "active": true
}
```

**Respuesta `200`** → Producto actualizado  
**Error `404`** → Producto no encontrado

---

#### `DELETE /api/products/:id`
**Soft delete**: desactiva el producto (`active: false`), no lo elimina de la base de datos.

**Respuesta `200`**
```json
{ "message": "Producto desactivado exitosamente" }
```

---

### 📦 Inventario

#### `GET /api/inventory/movements`
Historial completo de todos los movimientos de inventario (entradas, salidas por ventas, salidas manuales).

**Respuesta `200`** → Array de movimientos, incluye `product_name` para mostrar en UI

---

#### `POST /api/inventory/movements`
Registra un movimiento manual: **entrada** (recepción de mercadería) o **salida** (pérdida, vencimiento).

> ⚠️ Las salidas por ventas (`exit_sale`) son generadas **automáticamente** por el backend al crear una venta. El frontend nunca debe llamar a este endpoint para ventas.

**Body — Entrada de mercadería**
```json
{
  "product_id": "uuid-producto",
  "movement_type": "entry",
  "quantity": 20,
  "notes": "Compra semanal - factura #4521"
}
```

**Body — Baja manual (pérdida/vencimiento)**
```json
{
  "product_id": "uuid-producto",
  "movement_type": "exit_manual",
  "quantity": 2,
  "notes": "Producto vencido"
}
```

> Valores válidos `movement_type` para este endpoint: `"entry"` | `"exit_manual"`  
> El campo `notes` es opcional.

**Respuesta `201`** → Movimiento creado  
**Error `400`** → Cantidad ≤ 0 o producto inexistente

---

#### `GET /api/inventory/stock/:productId`
Consulta el **stock calculado en tiempo real** de un producto.  
El stock se calcula sumando todas las entradas y restando todas las salidas del historial de movimientos.

**Respuesta `200`**
```json
{
  "product": { ...datos del producto... },
  "current_stock": 37.5
}
```

**Error `404`** → Producto no encontrado

---

#### `POST /api/inventory/daily-stock`
**Solo para productos NO CONTABLES.** El encargado anota visualmente cuánto queda al cierre del día. El sistema calcula automáticamente el consumo del día (`quantity_start - quantity_end`).

Si ya existe un registro para ese producto en esa fecha, **lo actualiza** (no duplica).

**Body**
```json
{
  "product_id": "uuid-producto-no-contable",
  "recorded_date": "2025-04-17",
  "quantity_start": 2.5,
  "quantity_end": 0.75
}
```

> `recorded_date` debe estar en formato `YYYY-MM-DD`

**Respuesta `201`** → Registro creado/actualizado, incluye `estimated_consumption` calculado  
**Error `400`** → Cantidades negativas

---

### 💵 Ventas

#### `GET /api/sales`
Lista todas las ventas registradas.

**Respuesta `200`** → Array de ventas (sin items detallados)

---

#### `GET /api/sales/:id`
Detalle completo de una venta: incluye los ítems y el nombre de cada producto.

**Respuesta `200`** → Venta con `items[]` poblado

---

#### `POST /api/sales`
Registra una nueva venta. Este endpoint ejecuta una **transacción atómica**:

1. Crea el encabezado de la venta
2. Inserta los ítems
3. Genera movimientos de salida automáticos (`exit_sale`) por cada ítem
4. Verifica si algún producto bajó del mínimo → **genera alertas automáticas**

Si algo falla en cualquier paso, **todo se deshace** (rollback). No quedan datos inconsistentes.

**Body**
```json
{
  "external_ref": "TICKET-2025-001",
  "items": [
    {
      "product_id": "uuid-producto-1",
      "quantity": 3,
      "unit_price": 5.50
    },
    {
      "product_id": "uuid-producto-2",
      "quantity": 1,
      "unit_price": 12.00
    }
  ]
}
```

> `external_ref` es opcional (referencia del sistema de facturación externo).  
> `unit_price` es opcional por ítem.  
> `items` debe tener al menos 1 elemento.

**Respuesta `201`** → Venta completa con ítems  
**Error `400`** → Sin ítems o datos inválidos

---

### 🚨 Alertas

Las alertas son **generadas automáticamente** por el backend. El frontend solo necesita consultarlas y marcarlas como resueltas.

#### `GET /api/alerts`
Devuelve todas las alertas **activas** (no resueltas). Ideal para el panel de control en tiempo real.

**Respuesta `200`** → Array de alertas activas, incluye `product_name`

```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "product_name": "Lata de Atún",
    "alert_type": "low_stock",
    "threshold_value": 5,
    "current_value": 2,
    "resolved": false,
    "resolved_at": null,
    "created_at": "2025-04-17T06:00:00.000Z"
  }
]
```

---

#### `PATCH /api/alerts/:id/resolve`
Marca una alerta como resuelta. Llamar cuando el encargado repone el stock o reconoce la alerta.

**Sin body requerido.**

**Respuesta `200`**
```json
{ "message": "Alerta marcada como resuelta" }
```

**Error `404`** → Alerta no encontrada

---

## 5. Códigos de Respuesta

| Código | Significado |
|---|---|
| `200` | Operación exitosa |
| `201` | Recurso creado exitosamente |
| `400` | Datos inválidos o regla de negocio violada |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

**Formato de error estándar**
```json
{ "message": "Descripción del error aquí" }
```

---

## 6. Flujo Recomendado de Prueba

Sigue este orden en Bruno para probar el sistema de punta a punta:

```
1. GET  /api/health                        → confirmar que el servidor está arriba

2. POST /api/users                         → crear usuario admin/staff

3. POST /api/products  (countable)         → ej: "Lata de Atún", min: 5
   POST /api/products  (non_countable)     → ej: "Queso Cheddar", min: 0.5

4. GET  /api/products                      → copiar los UUIDs de los productos creados

5. POST /api/inventory/movements (entry)   → ingresar 6 latas de atún

6. GET  /api/inventory/stock/:productId    → debe mostrar current_stock: 6

7. POST /api/sales                         → vender 5 latas de atún
                                             ↳ stock queda en 1 (< min: 5)
                                             ↳ se genera alerta automática

8. GET  /api/alerts                        → debe aparecer alerta "low_stock"

9. POST /api/inventory/movements (entry)   → reponer 20 latas
                                             (la alerta se resuelve automáticamente)

10. POST /api/inventory/daily-stock        → cierre del queso: start:2.5, end:0.75
                                             ↳ consumo calculado: 1.75 kg
                                             ↳ si end < min → genera alerta

11. PATCH /api/alerts/:id/resolve          → marcar alerta como resuelta manualmente
```

---

> 📁 La colección de Bruno con todos los endpoints listos se encuentra en:  
> `backend/bruno/` — Abre la carpeta desde Bruno para importarla directamente.
