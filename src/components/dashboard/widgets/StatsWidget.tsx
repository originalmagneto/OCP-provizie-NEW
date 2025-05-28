import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { BarChart3, TrendingUp, Users, FileText } from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
  trend: 'up' | 'down';
};

function StatCard({ title, value, change, icon, trend }: StatCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-md bg-primary/10 p-2">{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <div className={`mt-1 flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? (
            <TrendingUp className="mr-1 h-4 w-4" />
          ) : (
            <TrendingUp className="mr-1 h-4 w-4 rotate-180" />
          )}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
}

type StatsWidgetProps = {
  className?: string;
};

export function StatsWidget({ className = '' }: StatsWidgetProps) {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231',
      change: '+20.1% from last month',
      icon: <BarChart3 className="h-4 w-4 text-primary" />,
      trend: 'up' as const,
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+12.3% from last month',
      icon: <Users className="h-4 w-4 text-primary" />,
      trend: 'up' as const,
    },
    {
      title: 'Invoices',
      value: '89',
      change: '+5.2% from last month',
      icon: <FileText className="h-4 w-4 text-primary" />,
      trend: 'down' as const,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
