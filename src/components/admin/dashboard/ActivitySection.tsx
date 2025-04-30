
import React from 'react';
import { ActivityItem } from '@/components/admin/types';
import RecentActivityFeed from '@/components/admin/RecentActivityFeed';
import PropertyHeatmap from '@/components/admin/PropertyHeatmap';

interface ActivitySectionProps {
  activityItems: ActivityItem[];
}

const ActivitySection: React.FC<ActivitySectionProps> = ({ activityItems }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Recent activity feed */}
      <RecentActivityFeed activities={activityItems} className="h-full" />
      
      {/* Property heatmap */}
      <PropertyHeatmap className="h-full" />
    </div>
  );
};

export default ActivitySection;
