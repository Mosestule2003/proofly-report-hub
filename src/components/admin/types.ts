
import { Evaluator } from '@/components/EvaluatorProfile';

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

export function convertToActivityItems(data: ActivityData[]): ActivityItem[] {
  return data.map(item => ({
    id: item.id,
    type: 'evaluation_complete' as const,
    message: `${item.user} ${item.action} ${item.target}`,
    timestamp: item.time,
    read: false
  }));
}
