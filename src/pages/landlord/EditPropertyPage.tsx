import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getPropertyForEdit } from '@/features/properties/services/propertyManagementService';
import { PropertyEditForm } from '@/features/properties/components/PropertyEditForm';
import { Skeleton } from '@/components/ui/skeleton';

export function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['property-edit', id],
    queryFn: () => getPropertyForEdit(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError || !data || !id) {
    return <p className="text-destructive">Couldn&apos;t load this property.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-h4 text-foreground">Edit Property</h1>
      <PropertyEditForm propertyId={id} defaultValues={data} />
    </div>
  );
}
