import { Link } from 'react-router';
import { Building2, DoorClosed, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const actions = [
  { label: 'Add Property', to: '/landlord/properties/new', icon: Building2 },
  { label: 'Add Unit', to: '/landlord/units/new', icon: DoorClosed },
  { label: 'View Reports', to: '/landlord/reports', icon: BarChart3 },
];

export function LandlordQuickActions() {
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
