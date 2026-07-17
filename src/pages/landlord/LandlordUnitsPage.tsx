import { Link } from 'react-router';
import { Plus, Pencil, Bed, Bath } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordUnits } from '@/features/units/hooks/useUnits';
import { UnitStatusBadge } from '@/features/units/components/UnitStatusBadge';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function LandlordUnitsPage() {
  const { data: units, isLoading } = useLandlordUnits();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h4 text-foreground">Units</h1>
          <p className="text-muted-foreground">
            Manage every rentable unit across your properties.
          </p>
        </div>
        <Button asChild>
          <Link to="/landlord/units/new">
            <Plus className="mr-2 h-4 w-4" /> Add Unit
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : units && units.length > 0 ? (
        <div className="flex flex-col gap-3">
          {units.map((unit) => (
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
                  <Button size="sm" variant="ghost" asChild>
                    <Link to={`/landlord/units/${unit.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-h5 text-foreground">No units yet</p>
          <p className="text-muted-foreground">Add units to the properties you&apos;ve created.</p>
          <Button asChild>
            <Link to="/landlord/units/new">
              <Plus className="mr-2 h-4 w-4" /> Add Unit
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
