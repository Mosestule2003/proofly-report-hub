
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface RecentActivityFeedProps {
  activities: any[];
  className?: string; // Added className prop
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({ activities, className }) => {
  return (
    <Card className={cn('h-full', className)}> {/* Using cn to combine classes */}
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="h-4 w-4" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground p-4">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex gap-2">
                  <div className={cn(
                    "mt-0.5 h-2 w-2 rounded-full",
                    activity.type === 'order' ? "bg-blue-500" :
                    activity.type === 'user' ? "bg-green-500" :
                    activity.type === 'system' ? "bg-amber-500" : "bg-slate-500"
                  )}></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
