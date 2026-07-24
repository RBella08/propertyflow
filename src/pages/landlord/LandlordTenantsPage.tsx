import { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordTenants } from '@/features/tenants/hooks/useTenants';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  renewed: 'success',
  pending: 'warning',
  expired: 'secondary',
  terminated: 'destructive',
};

const STATUS_FILTERS = ['all', 'active', 'terminated', 'expired'] as const;

export function LandlordTenantsPage() {
  const { data: tenants, isLoading } = useLandlordTenants();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const filtered = tenants?.filter((t) => {
    const matchesSearch =
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.leaseStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Tenants</h1>
        <p className="text-muted-foreground">Everyone currently or previously leasing from you.</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
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
          {filtered.map((t) => (
            <Card key={t.tenantId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{t.fullName}</p>
                  <p className="flex flex-wrap items-center gap-3 text-small text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {t.email}
                    </span>
                    {t.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {t.phone}
                      </span>
                    )}
                  </p>
                  <p className="text-caption text-muted-foreground">
                    {t.propertyName} · Unit {t.unitNumber}
                  </p>
                </div>
                <Badge variant={statusVariant[t.leaseStatus] ?? 'secondary'} className="capitalize">
                  {t.leaseStatus}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No tenants match your filters.</p>
      )}
    </div>
  );
}
