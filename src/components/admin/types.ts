
import { Evaluator } from '@/components/EvaluatorProfile';
import { OrderStatus } from '@/services/api';

export interface AdminMetricsType {
  tenantCount: number;
  orderCount: number;
  pendingOrderCount: number;
  completedOrderCount: number;
}

export interface ActivityItem {
  id: string;
  type: 'evaluation_complete' | 'outreach_success' | 'booking_confirmed' | 'system_alert';
  message: string;
  timestamp: string;
  read: boolean;
}

export interface ActivityData {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  date: string;
}

export interface Order {
  id: string;
  tenantName: string;
  propertyAddress: string;
  date: string;
  status: OrderStatus;
  amount: number;
  rating?: number;
  userId: string;
  properties: any[];
  totalPrice: number;
  discount: number;
  createdAt: string;
  evaluator?: Evaluator;
}

export function convertToActivityItems(data: ActivityData[]): ActivityItem[] {
  return data.map(item => ({
    id: item.id,
    type: 'evaluation_complete' as const,
    message: `${item.user} ${item.action} ${item.target}`,
    timestamp: item.time,
    read: false
  }));
}
