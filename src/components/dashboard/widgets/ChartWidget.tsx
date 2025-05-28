import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { LineChart, BarChart, PieChart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';

type ChartType = 'line' | 'bar' | 'pie';

type ChartWidgetProps = {
  className?: string;
  title?: string;
  chartType?: ChartType;
};

export function ChartWidget({
  className = '',
  title = 'Analytics',
  chartType = 'line',
}: ChartWidgetProps) {
  // This is a placeholder for chart data
  // In a real app, you would fetch this data from an API
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'hsl(var(--primary))',
        backgroundColor: 'hsla(var(--primary) / 0.1)',
      },
      {
        label: 'Expenses',
        data: [28, 48, 40, 19, 86, 27],
        borderColor: 'hsl(var(--muted-foreground))',
        backgroundColor: 'hsla(var(--muted-foreground) / 0.1)',
      },
    ],
  };

  const renderChart = (type: ChartType) => {
    // In a real app, you would use a charting library like Recharts or Chart.js
    // This is just a placeholder UI
    switch (type) {
      case 'bar':
        return (
          <div className="flex h-64 items-center justify-center">
            <BarChart className="h-48 w-full text-muted-foreground/20" />
            <p className="absolute text-sm text-muted-foreground">
              Bar Chart Placeholder
            </p>
          </div>
        );
      case 'pie':
        return (
          <div className="flex h-64 items-center justify-center">
            <PieChart className="h-48 w-48 text-muted-foreground/20" />
            <p className="absolute text-sm text-muted-foreground">
              Pie Chart Placeholder
            </p>
          </div>
        );
      case 'line':
      default:
        return (
          <div className="flex h-64 items-center justify-center">
            <LineChart className="h-48 w-full text-muted-foreground/20" />
            <p className="absolute text-sm text-muted-foreground">
              Line Chart Placeholder
            </p>
          </div>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Tabs defaultValue={chartType} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="line">
              <LineChart className="mr-2 h-4 w-4" />
              Line
            </TabsTrigger>
            <TabsTrigger value="bar">
              <BarChart className="mr-2 h-4 w-4" />
              Bar
            </TabsTrigger>
            <TabsTrigger value="pie">
              <PieChart className="mr-2 h-4 w-4" />
              Pie
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={chartType} className="w-full">
          <TabsContent value="line">{renderChart('line')}</TabsContent>
          <TabsContent value="bar">{renderChart('bar')}</TabsContent>
          <TabsContent value="pie">{renderChart('pie')}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
