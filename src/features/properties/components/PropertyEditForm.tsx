import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AmenitySelector } from './AmenitySelector';
import { propertySchema, type PropertyFormInput } from '../schemas';
import { useUpdateProperty } from '../hooks/usePropertyMutations';

const PROPERTY_TYPES = [
  'apartment',
  'duplex',
  'bungalow',
  'studio',
  'terrace',
  'penthouse',
  'mansion',
  'self_contained',
  'office',
];

interface PropertyEditFormProps {
  propertyId: string;
  defaultValues: PropertyFormInput;
}

export function PropertyEditForm({ propertyId, defaultValues }: PropertyEditFormProps) {
  const navigate = useNavigate();
  const updateProperty = useUpdateProperty();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormInput>({ resolver: zodResolver(propertySchema), defaultValues });

  useEffect(() => reset(defaultValues), [defaultValues, reset]);

  const amenityIds = watch('amenityIds');

  const onSubmit = async (data: PropertyFormInput) => {
    try {
      await updateProperty.mutateAsync({ propertyId, input: data });
      toast.success('Property updated');
      navigate('/landlord/properties');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error('Failed to update property', { description: message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="propertyName">Property name</Label>
            <Input id="propertyName" {...register('propertyName')} error={!!errors.propertyName} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register('description')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="propertyType">Property type</Label>
            <select
              id="propertyType"
              {...register('propertyType')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm md:w-60"
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register('address')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register('city')} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register('state')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <AmenitySelector selected={amenityIds} onChange={(ids) => setValue('amenityIds', ids)} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => navigate('/landlord/properties')}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}
