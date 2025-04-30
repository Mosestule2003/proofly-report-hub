
export interface ActivityItem {
  id: string;
  type: 'evaluation_complete' | 'outreach_success' | 'booking_confirmed' | 'system_alert';
  message: string;
  timestamp: string;
  read: boolean;
}

export const generateDemoActivities = (): ActivityItem[] => {
  return [
    {
      id: '1',
      type: 'evaluation_complete',
      message: 'Property evaluation completed at 123 Main St.',
      timestamp: '10 minutes ago',
      read: false
    },
    {
      id: '2',
      type: 'outreach_success',
      message: 'AI successfully scheduled viewing with landlord for 456 Oak Ave.',
      timestamp: '25 minutes ago',
      read: false
    },
    {
      id: '3',
      type: 'booking_confirmed',
      message: 'Client confirmed evaluation appointment for 789 Pine Blvd.',
      timestamp: '1 hour ago',
      read: true
    },
    {
      id: '4',
      type: 'system_alert',
      message: 'Evaluator Mark S. is approaching capacity for this week.',
      timestamp: '3 hours ago',
      read: true
    },
    {
      id: '5',
      type: 'outreach_success',
      message: 'AI scheduled 3 viewings for client Sarah T.',
      timestamp: '5 hours ago',
      read: true
    }
  ];
};

export const generateRandomMetrics = () => {
  return {
    successRate: 87,
    totalOutreaches: 134,
    scheduledViewings: 116,
    avgResponseTime: '1.7m',
    totalOrders: 68,
    evaluationsInProgress: 12,
    totalRevenue: 28750,
    evaluationCompletionRate: 76
  };
};
