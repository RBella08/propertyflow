import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAllProperties } from '@/features/admin/hooks/useAdminOversight';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning'> = {
  active: 'success',
  draft: 'warning',
  archived: 'secondary',
};

export function AdminPropertiesPage() {
  const { data: properties, isLoading } = useAdminAllProperties();
  const [search, setSearch] = useState('');

  const filtered = properties?.filter(
    (p) =>
      p.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      p.landlordName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">All Properties</h1>
        <p className="text-muted-foreground">Every property listed across the platform.</p>
      </div>

      <Input
        placeholder="Search by property, landlord, or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{p.propertyName}</p>
                  <p className="text-small text-muted-foreground">
                    {p.city}, {p.state} · Owner: {p.landlordName} · {p.totalUnits} unit(s)
                  </p>
                </div>
                <Badge variant={statusVariant[p.status] ?? 'secondary'} className="capitalize">
                  {p.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No properties match your search.</p>
      )}
    </div>
  );
}
