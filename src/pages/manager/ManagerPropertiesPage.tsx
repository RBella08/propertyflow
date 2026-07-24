import { useState } from 'react';
import { Link } from 'react-router';
import { Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useManagerProperties } from '@/features/properties/hooks/useManagerProperties';
import { AnnouncementDialog } from '@/features/announcements/components/AnnouncementDialog';

export function ManagerPropertiesPage() {
  const { data: properties, isLoading } = useManagerProperties();
  const [search, setSearch] = useState('');
  const [announceTarget, setAnnounceTarget] = useState<{ id: string; name: string } | null>(null);

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
            <Card key={p.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <Link to={`/properties/${p.slug}`} className="flex items-center gap-4 flex-1">
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
                </Link>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="capitalize">
                    {p.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Post an announcement to this property's tenants"
                    onClick={() => setAnnounceTarget({ id: p.id, name: p.propertyName })}
                  >
                    <Megaphone className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No properties assigned to you yet.</p>
      )}

      {announceTarget && (
        <AnnouncementDialog
          open={!!announceTarget}
          onClose={() => setAnnounceTarget(null)}
          propertyId={announceTarget.id}
          propertyName={announceTarget.name}
        />
      )}
    </div>
  );
}
