import { Card, CardContent, CardHeader, CardTitle } from '../../ui/Card';
import { Button } from '../../ui/Button';

type WelcomeWidgetProps = {
  className?: string;
};

export function WelcomeWidget({ className = '' }: WelcomeWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Welcome back! 👋</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          Welcome to your dashboard. Here's what's happening today.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline">
            View Reports
          </Button>
          <Button size="sm" variant="outline">
            Create Invoice
          </Button>
          <Button size="sm" variant="outline">
            View Calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
