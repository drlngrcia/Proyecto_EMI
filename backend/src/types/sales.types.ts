export interface Sale {
  id: string;
  external_ref: string | null;
  sale_date: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_by: string | null;
  created_at: Date;
  items?: SaleItem[]; // populated separately
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number | string;
  unit_price: number | string | null;
}

export interface CreateSaleItemDTO {
  product_id: string;
  quantity: number;
  unit_price?: number;
}

export interface CreateSaleDTO {
  external_ref?: string;
  created_by?: string;
  items: CreateSaleItemDTO[];
}
