// Statistics Types

export interface ChartSeriesItem {
  bucket: string;
  value: number;
}

export interface OverviewCards {
  new_users: number;
  invest_amount: number;
  withdraw_success_amount: number;
  commission_paid: number;
  [key: string]: number; // Allow extensibility
}

export interface OverviewData {
  cards: OverviewCards;
  new_users_series: ChartSeriesItem[];
  invest_amount_series: ChartSeriesItem[];
  // Add other series as needed by the actual API response if more detailed
}

export interface ConversionData {
  new_users: number;
  first_invest_users: number;
  conversion_rate: number;
}

export interface PromoTopItem {
  user_id: number;
  username: string;
  invite_count?: number;
  team_invest?: number;
  team_commission?: number;
}

export interface ProductInvestStats {
  product_id: number;
  product_name: string;
  total_invest_amount: number;
  order_count: number;
}

export interface StatsQueryParams {
  from?: string;
  to?: string;
  granularity?: 'day' | 'week' | 'month';
}
