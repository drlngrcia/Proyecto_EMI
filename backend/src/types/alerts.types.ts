export interface Alert {
  id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock';
  threshold_value: number;
  current_value: number;
  resolved: boolean;
  resolved_at: Date | null;
  created_at: Date;
}
