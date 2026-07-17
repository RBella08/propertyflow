import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { unitSchema, type UnitFormInput } from '../schemas';
import { useLandlordPropertyOptions } from '../hooks/useUnits';

const STATUS_OPTIONS = ['available', 'occupied', 'reserved', 'maintenance'] as const;

interface UnitFormProps {
  mode: 'create' | 'edit';
  defaultValues?: UnitFormInput;
  lockedPropertyId?: string;
  onSubmit: (data: UnitFormInput) => Promise<void>;
}

export function UnitForm({ mode, defaultValues, lockedPropertyId, onSubmit }: UnitFormProps) {
  const navigate = useNavigate();

  const { data: properties, isLoading: propertiesLoading } = useLandlordPropertyOptions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnitFormInput>({
    resolver: zodResolver(unitSchema),
    defaultValues: defaultValues ?? {
      propertyId: lockedPropertyId ?? '',
      unitNumber: '',
      bedrooms: 1,
      bathrooms: 1,
      rentAmount: 0,
      status: 'available',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const submit = async (data: UnitFormInput) => {
    try {
      await onSubmit(data);

      toast.success(mode === 'create' ? 'Unit created' : 'Unit updated');

      navigate('/landlord/units');
    } catch (error) {
      toast.error(mode === 'create' ? 'Failed to create unit' : 'Failed to update unit', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6">
        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="propertyId">Property</Label>

            <select
              id="propertyId"
              {...register('propertyId')}
              disabled={!!lockedPropertyId || propertiesLoading}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-60"
            >
              <option value="">Select a property...</option>

              {(properties ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.propertyName}
                </option>
              ))}
            </select>

            {errors.propertyId && (
              <p className="text-caption text-destructive">{errors.propertyId.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="unitNumber">Unit Number</Label>

            <Input
              id="unitNumber"
              placeholder="A1"
              {...register('unitNumber')}
              error={!!errors.unitNumber}
            />

            {errors.unitNumber && (
              <p className="text-caption text-destructive">{errors.unitNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>

              <Input
                id="bedrooms"
                type="number"
                min={0}
                {...register('bedrooms', { valueAsNumber: true })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>

              <Input
                id="bathrooms"
                type="number"
                min={0}
                {...register('bathrooms', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="rentAmount">Annual Rent (₦)</Label>

            <Input
              id="rentAmount"
              type="number"
              min={0}
              {...register('rentAmount', { valueAsNumber: true })}
              error={!!errors.rentAmount}
            />

            {errors.rentAmount && (
              <p className="text-caption text-destructive">{errors.rentAmount.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>

            <select
              id="status"
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm capitalize"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/landlord/units')}>
              Cancel
            </Button>

            <Button type="submit" loading={isSubmitting}>
              {mode === 'create' ? 'Create Unit' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
