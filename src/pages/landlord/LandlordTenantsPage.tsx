import { useState } from 'react';
import { Link } from 'react-router';
import { Mail, Phone, FileCheck, FileSignature, Wallet, MessageSquare, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandlordTenants } from '@/features/tenants/hooks/useTenants';
import { RecordPaymentDialog } from '@/features/payments/components/RecordPaymentDialog';
import { ReviewDocumentDialog } from '@/features/id-verification/components/ReviewDocumentDialog';
import { LeaveScreeningReviewDialog } from '@/features/screening/components/LeaveScreeningReviewDialog';
import { ViewAgreementDialog } from '@/features/agreements/components/ViewAgreementDialog';
import { useMyPlan } from '@/features/plans/hooks/useMyPlan';
import { hasFeatureAccess } from '@/features/plans/planFeatures';

const statusVariant: Record<string, 'success' | 'secondary' | 'warning' | 'destructive'> = {
  active: 'success',
  renewed: 'success',
  pending: 'warning',
  expired: 'secondary',
  terminated: 'destructive',
};

const STATUS_FILTERS = ['all', 'active', 'renewed', 'terminated', 'expired'] as const;

export function LandlordTenantsPage() {
  const { data: tenants, isLoading } = useLandlordTenants();
  const { data: myPlan } = useMyPlan();
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

  const canScreenTenants = !myPlan || hasFeatureAccess(myPlan, 'tenantScreening');

  const handleLeaveReviewClick = (t: {
    leaseId: string;
    tenantProfileId: string;
    fullName: string;
  }) => {
    if (!canScreenTenants) {
      toast.info('Upgrade your plan to leave tenant screening reviews');
      return;
    }
    setReviewTarget({ leaseId: t.leaseId, tenantProfileId: t.tenantProfileId, name: t.fullName });
  };

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
          {filtered.map((t) => (
            <Card key={t.tenantId}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{t.fullName}</p>
                  <p className="flex flex-wrap items-center gap-3 text-small text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 shrink-0" />{' '}
                      <span className="truncate">{t.email}</span>
                    </span>
                    {t.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" /> {t.phone}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-caption text-muted-foreground">
                    {t.propertyName} · Unit {t.unitNumber}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge
                    variant={statusVariant[t.leaseStatus] ?? 'secondary'}
                    className="capitalize"
                  >
                    {t.leaseStatus}
                  </Badge>

                  {(t.leaseStatus === 'active' || t.leaseStatus === 'renewed') && (
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

                  <Button size="sm" variant="outline" asChild>
                    <Link to="/landlord/messages">
                      <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
                    </Link>
                  </Button>

                  {(t.leaseStatus === 'terminated' || t.leaseStatus === 'expired') && (
                    <Button
                      size="sm"
                      variant="outline"
                      title={!canScreenTenants ? 'Upgrade your plan to unlock this' : undefined}
                      onClick={() => handleLeaveReviewClick(t)}
                    >
                      {!canScreenTenants && <Lock className="mr-1.5 h-3.5 w-3.5" />}
                      Leave Review
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-card border py-16 text-center">
          <p className="text-h5 text-foreground">No tenants match your filters</p>
          <p className="text-muted-foreground">Try adjusting your search or status filter.</p>
        </div>
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
