export interface Product {
  id: string;
  name: string;
  category: string | null;
  unit: string;
  min_quantity: number | string; // Numeric coming from PG can sometimes be a string depending on pg pkg config
  product_type: 'countable' | 'non_countable';
  active: boolean;
  created_at: Date;
}

export interface CreateProductDTO {
  name: string;
  category?: string;
  unit: string;
  min_quantity: number;
  product_type: 'countable' | 'non_countable';
}

export interface UpdateProductDTO {
  name?: string;
  category?: string;
  unit?: string;
  min_quantity?: number;
  product_type?: 'countable' | 'non_countable';
  active?: boolean;
}
