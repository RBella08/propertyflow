import { useState } from 'react';
import { Bed, Bath } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAllUnits } from '@/features/admin/hooks/useAdminOversight';
import { UnitStatusBadge } from '@/features/units/components/UnitStatusBadge';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_FILTERS = ['all', 'available', 'occupied', 'reserved', 'maintenance'] as const;

export function AdminUnitsPage() {
  const { data: units, isLoading } = useAdminAllUnits();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = units?.filter((u) => {
    const matchesSearch =
      u.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      u.unitNumber.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">All Units</h1>
        <p className="text-muted-foreground">Every unit across every property on the platform.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by property or unit number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {u.propertyName} — Unit {u.unitNumber}
                  </p>
                  <div className="flex items-center gap-3 text-small text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {u.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {u.bathrooms}
                    </span>
                    <span>{formatNaira(u.rentAmount)}/yr</span>
                  </div>
                </div>
                <UnitStatusBadge status={u.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No units match your filters.</p>
      )}
    </div>
  );
}
