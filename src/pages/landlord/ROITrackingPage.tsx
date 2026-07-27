import { useState } from 'react';
import { toast } from 'sonner';
import { TrendingUp, Pencil } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useROIData, useUpdatePropertyInvestment } from '@/features/accounting/hooks/useAccounting';

function formatNaira(amount: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ROITrackingPage() {
  const { data: roiData, isLoading } = useROIData();
  const updateInvestment = useUpdatePropertyInvestment();
  const [editTarget, setEditTarget] = useState<{ id: string; name: string } | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');

  const handleSave = async () => {
    if (!editTarget || !purchasePrice || !purchaseDate) {
      toast.error('Enter both purchase price and date');
      return;
    }
    try {
      await updateInvestment.mutateAsync({
        propertyId: editTarget.id,
        purchasePrice: Number(purchasePrice),
        purchaseDate,
      });
      toast.success('Investment details saved');
      setEditTarget(null);
      setPurchasePrice('');
      setPurchaseDate('');
    } catch {
      toast.error('Could not save investment details');
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Investment & ROI</h1>
        <p className="text-muted-foreground">
          Enter each property's purchase price to see its real annual return.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {roiData?.map((r) => (
          <Card key={r.propertyId}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium text-foreground">{r.propertyName}</p>
                {r.purchasePrice ? (
                  <p className="text-small text-muted-foreground">
                    Purchased {formatNaira(r.purchasePrice)}
                    {r.purchaseDate && ` on ${new Date(r.purchaseDate).toLocaleDateString()}`}
                  </p>
                ) : (
                  <p className="text-small text-muted-foreground">No purchase details set</p>
                )}
                <p className="text-caption text-muted-foreground">
                  Last 12 months: {formatNaira(r.annualIncome)} income,{' '}
                  {formatNaira(r.annualExpenses)} expenses
                </p>
              </div>
              <div className="flex items-center gap-3">
                {r.roiPercentage !== null ? (
                  <Badge
                    variant={r.roiPercentage >= 8 ? 'success' : 'warning'}
                    className="flex items-center gap-1"
                  >
                    <TrendingUp className="h-3 w-3" /> {r.roiPercentage}% ROI
                  </Badge>
                ) : (
                  <Badge variant="secondary">Set purchase price</Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditTarget({ id: r.propertyId, name: r.propertyName });
                    setPurchasePrice(r.purchasePrice ? String(r.purchasePrice) : '');
                    setPurchaseDate(r.purchaseDate ?? '');
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {roiData && roiData.length === 0 && (
          <p className="text-muted-foreground">No properties yet.</p>
        )}
      </div>

      <Dialog open={!!editTarget} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Investment Details — {editTarget?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="purchasePrice">Purchase Price (₦)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
              />
            </div>
            <Button onClick={handleSave} loading={updateInvestment.isPending}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
