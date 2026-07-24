import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { leaseSchema, type LeaseFormInput } from '@/features/leases/schemas';
import { useAvailableUnitOptions } from '@/features/leases/hooks/useLeases';
import { useCreateLease } from '@/features/leases/hooks/useLeaseMutations';
import { TenantLookup } from '@/features/leases/components/TenantLookup';

const BILLING_CYCLES = ['monthly', 'quarterly', 'annually'];

export function CreateLeasePage() {
  const navigate = useNavigate();
  const { data: units, isLoading: unitsLoading } = useAvailableUnitOptions();
  const createLease = useCreateLease();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeaseFormInput>({
    resolver: zodResolver(leaseSchema),
    defaultValues: { billingCycle: 'annually', securityDeposit: 0 },
  });

  const selectedUnitId = watch('unitId');

  const handleUnitChange = (unitId: string) => {
    setValue('unitId', unitId);
    const unit = units?.find((u) => u.id === unitId);
    if (unit) setValue('monthlyRent', unit.rentAmount);
  };

  const onSubmit = async (data: LeaseFormInput) => {
    try {
      await createLease.mutateAsync(data);
      toast.success('Lease created', {
        description: 'The unit is now marked occupied and the first invoice was generated.',
      });
      navigate('/landlord/leases');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error('Failed to create lease', { description: message });
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-h4 text-foreground">Create Lease</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Unit &amp; Tenant</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="unitId">Unit</Label>
              <select
                id="unitId"
                value={selectedUnitId ?? ''}
                onChange={(e) => handleUnitChange(e.target.value)}
                disabled={unitsLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select an available unit...</option>
                {(units ?? []).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.propertyName} — Unit {unit.unitNumber}
                  </option>
                ))}
              </select>
              {errors.unitId && (
                <p className="text-caption text-destructive">{errors.unitId.message}</p>
              )}
              {units && units.length === 0 && !unitsLoading && (
                <p className="text-caption text-muted-foreground">
                  No available units. Free one up or add a new unit first.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label>Tenant</Label>
              <TenantLookup onFound={(tenantId) => setValue('tenantId', tenantId)} />
              {errors.tenantId && (
                <p className="text-caption text-destructive">{errors.tenantId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-h6">Terms</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  error={!!errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-caption text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">End date</Label>
                <Input id="endDate" type="date" {...register('endDate')} error={!!errors.endDate} />
                {errors.endDate && (
                  <p className="text-caption text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyRent">Annual rent (₦)</Label>
              <Input
                id="monthlyRent"
                type="number"
                {...register('monthlyRent', { valueAsNumber: true })}
                error={!!errors.monthlyRent}
              />
              {errors.monthlyRent && (
                <p className="text-caption text-destructive">{errors.monthlyRent.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="securityDeposit">Security deposit (₦)</Label>
              <Input
                id="securityDeposit"
                type="number"
                {...register('securityDeposit', { valueAsNumber: true })}
                error={!!errors.securityDeposit}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="billingCycle">Billing cycle</Label>
              <select
                id="billingCycle"
                {...register('billingCycle')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
              >
                {BILLING_CYCLES.map((cycle) => (
                  <option key={cycle} value={cycle} className="capitalize">
                    {cycle}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/landlord/leases')}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create Lease
          </Button>
        </div>
      </form>
    </div>
  );
}
