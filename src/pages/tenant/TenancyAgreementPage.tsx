import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { agreementSchema, type AgreementFormInput } from '@/features/agreements/schemas';
import { RULES_AND_REGULATIONS } from '@/features/agreements/content/rulesAndRegulations';
import { SignaturePad } from '@/features/agreements/components/SignaturePad';
import {
  useMyActiveLeaseAgreement,
  useHasApprovedIdDocument,
  useSignAgreement,
} from '@/features/agreements/hooks/useAgreement';
import { getTenantId } from '@/features/payments/services/paymentService';
import { useAuthContext } from '@/providers/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

async function getLandlordProfileIdForLease(leaseId: string): Promise<string> {
  const { data: lease, error: leaseError } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('id', leaseId)
    .single();
  if (leaseError) throw new Error(`Could not find lease details: ${leaseError.message}`);

  const { data: unit, error: unitError } = await supabase
    .from('units')
    .select('property_id')
    .eq('id', lease.unit_id)
    .single();
  if (unitError) throw new Error(`Could not find unit details: ${unitError.message}`);

  const { data: property, error: propertyError } = await supabase
    .from('properties')
    .select('landlord_id, manager_id')
    .eq('id', unit.property_id)
    .single();
  if (propertyError) throw new Error(`Could not find property details: ${propertyError.message}`);

  if (property.manager_id) return property.manager_id;

  const { data: landlord, error: landlordError } = await supabase
    .from('landlord_basic_info')
    .select('profile_id')
    .eq('id', property.landlord_id)
    .single();
  if (landlordError) throw new Error(`Could not find landlord details: ${landlordError.message}`);

  return landlord.profile_id;
}

export function TenancyAgreementPage() {
  const { profile } = useAuthContext();
  const { data: tenantIdResult } = useQuery({
    queryKey: ['tenant-id-for-agreement', profile?.id],
    queryFn: () => getTenantId(profile!.id),
    enabled: !!profile?.id,
  });

  const { data: result, isLoading } = useMyActiveLeaseAgreement(tenantIdResult);
  const { data: hasIdDoc } = useHasApprovedIdDocument(profile?.id);
  const signAgreement = useSignAgreement();
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AgreementFormInput>({ resolver: zodResolver(agreementSchema) });

  const onSubmit = async (data: AgreementFormInput) => {
    if (!signatureDataUrl) {
      toast.error('Please sign in the signature box before submitting');
      return;
    }
    if (!result?.agreement) {
      toast.error('Could not find your agreement record. Please refresh and try again.');
      return;
    }

    try {
      const landlordProfileId = await getLandlordProfileIdForLease(result.leaseId);
      await signAgreement.mutateAsync({
        agreementId: result.agreement.id,
        landlordProfileId,
        input: data,
        signatureDataUrl,
      });
      toast.success('Agreement signed successfully');
    } catch (error) {
      // Shows the real, specific reason instead of a generic message
      toast.error('Could not submit agreement', {
        description: error instanceof Error ? error.message : 'Unknown error — please try again.',
      });
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;

  if (!result) {
    return <p className="text-muted-foreground">No active lease found.</p>;
  }

  if (result.agreement.status === 'signed') {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 py-16 text-center">
        <CheckCircle className="h-10 w-10 text-success" />
        <h1 className="text-h4 text-foreground">Agreement Signed</h1>
        <p className="text-muted-foreground">
          Signed by {result.agreement.typedName} on{' '}
          {result.agreement.signedAt && new Date(result.agreement.signedAt).toLocaleDateString()}.
        </p>
        {result.agreement.signatureData && (
          <img
            src={result.agreement.signatureData}
            alt="Your signature"
            className="mt-2 h-24 rounded-md border bg-white p-2"
          />
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Tenancy Agreement</h1>
        <p className="text-muted-foreground">
          Please complete this agreement to finalize your tenancy.
        </p>
      </div>

      {!hasIdDoc && (
        <Card className="border-warning/40 bg-warning/10">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
            <p className="text-small text-foreground">
              You must submit an ID document before signing this agreement.{' '}
              <Link
                to="/tenant/id-verification"
                className="font-medium text-primary hover:underline"
              >
                Upload one now →
              </Link>
            </p>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Guarantor Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guarantorName">Full Name</Label>
              <Input
                id="guarantorName"
                {...register('guarantorName')}
                error={!!errors.guarantorName}
              />
              {errors.guarantorName && (
                <p className="text-caption text-destructive">{errors.guarantorName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="guarantorPhone">Phone</Label>
                <Input
                  id="guarantorPhone"
                  {...register('guarantorPhone')}
                  error={!!errors.guarantorPhone}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guarantorEmail">Email</Label>
                <Input
                  id="guarantorEmail"
                  type="email"
                  {...register('guarantorEmail')}
                  error={!!errors.guarantorEmail}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guarantorAddress">Address</Label>
              <Input
                id="guarantorAddress"
                {...register('guarantorAddress')}
                error={!!errors.guarantorAddress}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guarantorRelationship">Relationship to You</Label>
              <Input
                id="guarantorRelationship"
                placeholder="e.g. Employer, Sibling, Colleague"
                {...register('guarantorRelationship')}
                error={!!errors.guarantorRelationship}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Rules & Regulations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <ol className="flex flex-col gap-2 text-small text-muted-foreground">
              {RULES_AND_REGULATIONS.map((rule, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-medium text-foreground">{i + 1}.</span> {rule}
                </li>
              ))}
            </ol>
            <div className="flex items-start gap-2 border-t pt-4">
              <Checkbox
                id="rulesAcknowledged"
                onCheckedChange={(v) => setValue('rulesAcknowledged', !!v)}
              />
              <Label
                htmlFor="rulesAcknowledged"
                className="cursor-pointer font-normal leading-snug"
              >
                I have read, understood, and agree to all the terms listed above.
              </Label>
            </div>
            {errors.rulesAcknowledged && (
              <p className="text-caption text-destructive">{errors.rulesAcknowledged.message}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Signature</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignaturePad onChange={setSignatureDataUrl} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="typedName">Type your full legal name to confirm</Label>
              <Input id="typedName" {...register('typedName')} error={!!errors.typedName} />
              {errors.typedName && (
                <p className="text-caption text-destructive">{errors.typedName.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" loading={isSubmitting} disabled={!hasIdDoc}>
          Sign & Submit Agreement
        </Button>
      </form>
    </div>
  );
}
