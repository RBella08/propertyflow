import { useState } from 'react';
import { Link } from 'react-router';
import { Plus, Pencil, Bed, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerUnits } from '@/features/units/hooks/useUnits';
import { UnitStatusBadge } from '@/features/units/components/UnitStatusBadge';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_FILTERS = ['all', 'available', 'occupied', 'reserved', 'maintenance'] as const;

export function ManagerUnitsPage() {
  const { data: units, isLoading } = useManagerUnits();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Units</h1>
          <p className="text-muted-foreground">Units across your assigned properties.</p>
        </div>
        <Button asChild>
          <Link to="/manager/units/new">
            <Plus className="mr-2 h-4 w-4" /> Add Unit
          </Link>
        </Button>
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
        <Skeleton className="h-40" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((unit) => (
            <Card key={unit.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">
                    {unit.propertyName} — Unit {unit.unitNumber}
                  </p>
                  <div className="flex items-center gap-3 text-small text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {unit.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {unit.bathrooms}
                    </span>
                    <span>{formatNaira(unit.rentAmount)}/yr</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UnitStatusBadge status={unit.status} />
                  <Button size="sm" variant="ghost" title="Edit unit" asChild>
                    <Link to={`/manager/units/${unit.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
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
