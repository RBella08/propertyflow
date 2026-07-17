import { Link } from 'react-router';
import { Wallet, Receipt, Wrench } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { label: 'Pay Rent', to: '/tenant/payments/pay', icon: Wallet },
  { label: 'Download Receipt', to: '/tenant/receipts', icon: Receipt },
  { label: 'Report Issue', to: '/tenant/maintenance/new', icon: Wrench },
];

export function QuickActions() {
  return (
    <Card>
      <CardContent className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="flex flex-col items-center gap-2 rounded-md border p-4 text-center transition-colors hover:bg-accent"
          >
            <action.icon className="h-6 w-6 text-primary" />
            <span className="text-small font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
