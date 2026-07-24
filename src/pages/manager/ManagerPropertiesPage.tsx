import { useState } from 'react';
import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerProperties } from '@/features/properties/hooks/useManagerProperties';

export function ManagerPropertiesPage() {
  const { data: properties, isLoading } = useManagerProperties();
  const [search, setSearch] = useState('');

  const filtered = properties?.filter(
    (p) =>
      p.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Assigned Properties</h1>
        <p className="text-muted-foreground">Properties you&apos;ve been assigned to manage.</p>
      </div>

      <Input
        placeholder="Search by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <Link key={p.id} to={`/properties/${p.slug}`}>
              <Card className="transition-colors hover:bg-accent">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                      {p.coverImage && (
                        <img src={p.coverImage} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{p.propertyName}</p>
                      <p className="text-small text-muted-foreground">
                        {p.city}, {p.state} · {p.occupiedUnits}/{p.totalUnits} occupied
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {p.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No properties assigned to you yet.</p>
      )}
    </div>
  );
}
