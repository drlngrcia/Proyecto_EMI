export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'entry' | 'exit_sale' | 'exit_manual';
  quantity: number | string;
  source: 'manual' | 'automatic';
  sale_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
}

export interface DailyStock {
  id: string;
  product_id: string;
  recorded_date: Date;
  quantity_start: number | string;
  quantity_end: number | string;
  estimated_consumption: number | string;
  recorded_by: string | null;
  created_at: Date;
}

export interface CreateMovementDTO {
  product_id: string;
  movement_type: 'entry' | 'exit_manual';
  quantity: number;
  notes?: string;
  created_by?: string; // Se pasaría si hubiera Auth
}

export interface RecordDailyStockDTO {
  product_id: string;
  recorded_date: string; // YYYY-MM-DD
  quantity_start: number;
  quantity_end: number;
  recorded_by?: string;
}
