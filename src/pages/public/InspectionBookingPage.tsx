import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { inspectionSchema, type InspectionFormInput } from '@/features/inspections/schemas';
import { createInspection } from '@/features/inspections/services/inspectionService';
import { getPropertyBasicInfo } from '@/features/properties/services/propertyService';

export function InspectionBookingPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [submitted, setSubmitted] = useState(false);

  const { data: property, isLoading } = useQuery({
    queryKey: ['property-basic', propertyId],
    queryFn: () => getPropertyBasicInfo(propertyId as string),
    enabled: !!propertyId,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormInput>({ resolver: zodResolver(inspectionSchema) });

  const onSubmit = async (data: InspectionFormInput) => {
    if (!propertyId || !property) return;
    try {
      await createInspection(propertyId, property.propertyName, data);
      setSubmitted(true);
    } catch (error) {
      toast.error('Could not submit booking', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-xl py-12">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container flex max-w-xl flex-col items-center gap-4 py-24 text-center">
        <CheckCircle className="h-12 w-12 text-success" />
        <h1 className="text-h4 text-foreground">Inspection Requested!</h1>
        <p className="text-muted-foreground">
          We&apos;ve notified the property manager. They&apos;ll reach out to confirm your preferred
          time.
        </p>
        <Button asChild>
          <Link to="/properties">Browse More Properties</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-xl py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-h4">Book an Inspection</CardTitle>
          {property && (
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" /> {property.propertyName} — {property.city},{' '}
              {property.state}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="visitorName">Full Name</Label>
              <Input id="visitorName" {...register('visitorName')} error={!!errors.visitorName} />
              {errors.visitorName && (
                <p className="text-caption text-destructive">{errors.visitorName.message}</p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} error={!!errors.phone} />
                {errors.phone && (
                  <p className="text-caption text-destructive">{errors.phone.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} error={!!errors.email} />
                {errors.email && (
                  <p className="text-caption text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="preferredDate">Preferred Date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  {...register('preferredDate')}
                  error={!!errors.preferredDate}
                />
                {errors.preferredDate && (
                  <p className="text-caption text-destructive">{errors.preferredDate.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="preferredTime">Preferred Time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  {...register('preferredTime')}
                  error={!!errors.preferredTime}
                />
                {errors.preferredTime && (
                  <p className="text-caption text-destructive">{errors.preferredTime.message}</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Additional Notes (optional)</Label>
              <Textarea id="notes" rows={3} {...register('notes')} />
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Request Inspection
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
