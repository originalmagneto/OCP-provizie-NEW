import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { MoreHorizontal } from 'lucide-react';

type Status = 'pending' | 'processing' | 'success' | 'failed';

type TableData = {
  id: string;
  customer: string;
  email: string;
  amount: string;
  status: Status;
  date: string;
};

const statusVariants = {
  pending: {
    variant: 'outline' as const,
    text: 'Pending',
  },
  processing: {
    variant: 'secondary' as const,
    text: 'Processing',
  },
  success: {
    variant: 'default' as const,
    text: 'Completed',
  },
  failed: {
    variant: 'destructive' as const,
    text: 'Failed',
  },
};

type TableWidgetProps = {
  className?: string;
  title?: string;
  data?: TableData[];
};

export function TableWidget({
  className = '',
  title = 'Recent Transactions',
  data: propData,
}: TableWidgetProps) {
  // Sample data - in a real app, this would come from an API
  const defaultData: TableData[] = [
    {
      id: 'INV001',
      customer: 'John Doe',
      email: 'john@example.com',
      amount: '$250.00',
      status: 'success',
      date: '2023-05-15',
    },
    {
      id: 'INV002',
      customer: 'Jane Smith',
      email: 'jane@example.com',
      amount: '$150.00',
      status: 'processing',
      date: '2023-05-14',
    },
    {
      id: 'INV003',
      customer: 'Bob Johnson',
      email: 'bob@example.com',
      amount: '$350.00',
      status: 'pending',
      date: '2023-05-13',
    },
    {
      id: 'INV004',
      customer: 'Alice Williams',
      email: 'alice@example.com',
      amount: '$450.00',
      status: 'failed',
      date: '2023-05-12',
    },
    {
      id: 'INV005',
      customer: 'Charlie Brown',
      email: 'charlie@example.com',
      amount: '$550.00',
      status: 'success',
      date: '2023-05-11',
    },
  ];

  const data = propData || defaultData;

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Button variant="outline" size="sm" className="h-8">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>A list of recent transactions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{row.customer}</div>
                    <div className="text-sm text-muted-foreground">
                      {row.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[row.status].variant}>
                      {statusVariants[row.status].text}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell className="text-right">
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
