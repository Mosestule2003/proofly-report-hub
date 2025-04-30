
import { ActivityData, ActivityItem } from '@/components/admin/types';

// Convert user activity to ActivityItem format
export const convertToActivityItems = (data: ActivityData[]): ActivityItem[] => {
  return data.map(item => ({
    id: item.id,
    type: 'evaluation_complete' as const,
    message: `${item.user} ${item.action} ${item.target}`,
    timestamp: item.time,
    read: false
  }));
};
