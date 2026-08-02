import { useState } from 'react';
import { Mail, Phone, FileCheck, FileSignature, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useManagerTenants } from '@/features/tenants/hooks/useTenants';
import { RecordPaymentDialog } from '@/features/payments/components/RecordPaymentDialog';
import { ReviewDocumentDialog } from '@/features/id-verification/components/ReviewDocumentDialog';
import { LeaveScreeningReviewDialog } from '@/features/screening/components/LeaveScreeningReviewDialog';
import { ViewAgreementDialog } from '@/features/agreements/components/ViewAgreementDialog';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  renewed: 'success',
  pending: 'warning',
  expired: 'secondary',
  terminated: 'destructive',
};

const STATUS_FILTERS = ['all', 'active', 'terminated', 'expired'] as const;

export function ManagerTenantsPage() {
  const { data: tenants, isLoading } = useManagerTenants();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('all');

  const [paymentTarget, setPaymentTarget] = useState<{ id: string; name: string } | null>(null);
  const [reviewDocsTarget, setReviewDocsTarget] = useState<{
    profileId: string;
    name: string;
  } | null>(null);
  const [agreementTarget, setAgreementTarget] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{
    leaseId: string;
    tenantProfileId: string;
    name: string;
  } | null>(null);

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
        <p className="text-muted-foreground">Tenants across your assigned properties.</p>
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
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
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

                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={statusVariant[t.leaseStatus] ?? 'secondary'}
                    className="capitalize"
                  >
                    {t.leaseStatus}
                  </Badge>

                  {t.leaseStatus === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      title="Record a cash/offline payment"
                      onClick={() => setPaymentTarget({ id: t.tenantId, name: t.fullName })}
                    >
                      <Wallet className="mr-1.5 h-3.5 w-3.5" /> Record Payment
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setReviewDocsTarget({ profileId: t.tenantProfileId, name: t.fullName })
                    }
                  >
                    <FileCheck className="mr-1.5 h-3.5 w-3.5" /> ID Docs
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => setAgreementTarget(t.leaseId)}>
                    <FileSignature className="mr-1.5 h-3.5 w-3.5" /> Agreement
                  </Button>

                  {(t.leaseStatus === 'terminated' || t.leaseStatus === 'expired') && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setReviewTarget({
                          leaseId: t.leaseId,
                          tenantProfileId: t.tenantProfileId,
                          name: t.fullName,
                        })
                      }
                    >
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No tenants match your filters.</p>
      )}

      {paymentTarget && (
        <RecordPaymentDialog
          open={!!paymentTarget}
          onClose={() => setPaymentTarget(null)}
          tenantId={paymentTarget.id}
          tenantName={paymentTarget.name}
        />
      )}

      {reviewDocsTarget && (
        <ReviewDocumentDialog
          open={!!reviewDocsTarget}
          onClose={() => setReviewDocsTarget(null)}
          tenantProfileId={reviewDocsTarget.profileId}
          tenantName={reviewDocsTarget.name}
        />
      )}

      {agreementTarget && (
        <ViewAgreementDialog
          open={!!agreementTarget}
          onClose={() => setAgreementTarget(null)}
          leaseId={agreementTarget}
        />
      )}

      {reviewTarget && (
        <LeaveScreeningReviewDialog
          open={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          leaseId={reviewTarget.leaseId}
          tenantProfileId={reviewTarget.tenantProfileId}
          tenantName={reviewTarget.name}
        />
      )}
    </div>
  );
}
