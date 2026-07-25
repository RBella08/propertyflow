import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useBanks,
  useMyPayoutInfo,
  useResolveAccountName,
  useCreateSubaccount,
} from '@/features/payouts/hooks/usePayouts';

const VERIFY_COOLDOWN_MS = 5000;

export function PayoutSettingsPage() {
  const { data: banks, isLoading: banksLoading } = useBanks();
  const { data: payoutInfo, isLoading: infoLoading } = useMyPayoutInfo();
  const resolveAccount = useResolveAccountName();
  const createSubaccount = useCreateSubaccount();

  const [businessName, setBusinessName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [verifyDisabledUntil, setVerifyDisabledUntil] = useState(0);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [manualName, setManualName] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);

  const selectedBank = banks?.find((b) => b.code === bankCode);
  const verifyOnCooldown = Date.now() < verifyDisabledUntil;

  const handleVerify = async () => {
    if (!bankCode || accountNumber.length < 10) {
      toast.error('Select a bank and enter a valid 10-digit account number');
      return;
    }
    setVerifyDisabledUntil(Date.now() + VERIFY_COOLDOWN_MS);
    setVerifyFailed(false);
    try {
      const name = await resolveAccount.mutateAsync({ accountNumber, bankCode });
      setResolvedName(name);
      toast.success(`Account verified: ${name}`);
    } catch (error) {
      setResolvedName(null);
      setVerifyFailed(true);
      toast.error('Could not verify automatically', {
        description:
          error instanceof Error
            ? error.message
            : 'This is often caused by your Paystack business still being under compliance review.',
      });
    }
  };

  const finalAccountName = useManualEntry ? manualName : resolvedName;

  const handleSave = async () => {
    if (!finalAccountName || !selectedBank || !businessName) {
      toast.error('Complete all fields first');
      return;
    }
    try {
      await createSubaccount.mutateAsync({
        businessName,
        bankCode: selectedBank.code,
        bankName: selectedBank.name,
        accountNumber,
        accountName: finalAccountName,
      });
      toast.success('Payout details saved! Rent payments will now be sent directly to your bank.');
    } catch (error) {
      toast.error('Could not save payout details', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  if (infoLoading) return <Skeleton className="h-96" />;

  const isConfigured = !!payoutInfo?.subaccountCode;

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-h4 text-foreground">Payout Settings</h1>

      {isConfigured ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle className="h-10 w-10 text-success" />
            <p className="font-medium text-foreground">Payouts are set up</p>
            <p className="text-small text-muted-foreground">
              {payoutInfo?.bankName} · {payoutInfo?.bankAccountNumber} · {payoutInfo?.accountName}
            </p>
            <p className="text-caption text-muted-foreground">
              You keep {100 - (payoutInfo?.commissionPercentage ?? 10)}% of every rent payment.
              PropertyFlow retains {payoutInfo?.commissionPercentage ?? 10}% as its platform fee.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-h6">
              <ShieldCheck className="h-5 w-5 text-primary" /> Set Up Direct Payouts
            </CardTitle>
            <CardDescription>
              Connect your bank account so rent payments go straight to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="businessName">Business / Landlord Name</Label>
              <Input
                id="businessName"
                placeholder="How your payouts will be labeled"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="bank">Bank</Label>
              <select
                id="bank"
                value={bankCode}
                onChange={(e) => {
                  setBankCode(e.target.value);
                  setResolvedName(null);
                  setVerifyFailed(false);
                }}
                disabled={banksLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select your bank...</option>
                {(banks ?? []).map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <div className="flex gap-2">
                <Input
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => {
                    setAccountNumber(e.target.value);
                    setResolvedName(null);
                    setVerifyFailed(false);
                  }}
                  maxLength={10}
                  placeholder="10-digit account number"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVerify}
                  loading={resolveAccount.isPending}
                  disabled={verifyOnCooldown || useManualEntry}
                >
                  Verify
                </Button>
              </div>
              {resolvedName && (
                <p className="flex items-center gap-1.5 text-caption text-success">
                  <CheckCircle className="h-3.5 w-3.5" /> {resolvedName}
                </p>
              )}
            </div>

            {verifyFailed && !useManualEntry && (
              <div className="flex flex-col gap-2 rounded-md border border-warning/40 bg-warning/10 p-3">
                <p className="flex items-center gap-1.5 text-caption text-foreground">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  Automatic verification isn&apos;t available right now — likely because your
                  Paystack business is still under compliance review.
                </p>
                <Button size="sm" variant="outline" onClick={() => setUseManualEntry(true)}>
                  Enter account name manually instead
                </Button>
              </div>
            )}

            {useManualEntry && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="manualName">Account Holder Name</Label>
                <Input
                  id="manualName"
                  placeholder="Exact name on the bank account"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
                <p className="text-caption text-muted-foreground">
                  Double-check this matches your bank account exactly — it wasn&apos;t verified
                  automatically.
                </p>
              </div>
            )}

            <Button
              onClick={handleSave}
              loading={createSubaccount.isPending}
              disabled={!finalAccountName}
            >
              Save Payout Details
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
