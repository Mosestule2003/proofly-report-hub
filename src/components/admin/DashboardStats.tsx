
import React from 'react';
import { 
  ShoppingBag, 
  CheckCircle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    positive: boolean;
  };
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <div className="flex items-center mt-1">
              {change.positive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-xs font-medium ${change.positive ? 'text-green-500' : 'text-red-500'}`}>
                {change.value}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-primary/10">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  totalOrders: number;
  completedEvaluations: number;
  totalEarnings: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
  totalOrders, 
  completedEvaluations,
  totalEarnings 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard 
        title="Total Evaluation Orders"
        value={totalOrders.toString()}
        change={{ value: "12% from last month", positive: true }}
        icon={<ShoppingBag className="h-5 w-5 text-primary" />}
      />
      
      <StatCard 
        title="Completed Evaluations"
        value={completedEvaluations.toString()}
        change={{ value: "8% from last month", positive: true }}
        icon={<CheckCircle className="h-5 w-5 text-primary" />}
      />
      
      <StatCard 
        title="Total Earnings"
        value={`$${totalEarnings.toFixed(2)}`}
        change={{ value: "3% from last month", positive: false }}
        icon={<DollarSign className="h-5 w-5 text-primary" />}
      />
    </div>
  );
};

export default DashboardStats;
