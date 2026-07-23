// Order Management Types

export type OrderStatus = 'PENDING' | 'PAID' | 'ACTIVE' | 'SETTLED' | 'CANCELLED' | 'REFUNDED';

export interface OrderListItem {
  id: number;
  order_id?: number;
  order_no?: string;
  user_id: number;
  username?: string;
  product_id: number;
  product_name?: string;
  amount: number;
  profit?: number;
  status: OrderStatus | string;
  created_at: string;
}

export interface OrderDetail extends OrderListItem {
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
}

export interface OrderQueryParams {
  page: number;
  page_size: number;
  user_id?: number;
  order_id?: string;
  status?: string;
  start_time?: string;
  end_time?: string;
}

export interface OrderListResult {
  total: number;
  records: OrderListItem[];
}

export const OrderStatusMap: Record<string, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  ACTIVE: '计息中',
  SETTLED: '已结算',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
};

export const OrderStatusColorMap: Record<string, string> = {
  PENDING: 'gray',
  PAID: 'blue',
  ACTIVE: 'green',
  SETTLED: 'arcoblue',
  CANCELLED: 'orange',
  REFUNDED: 'red',
};
