import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { getUnitById } from '@/features/units/services/unitService';
import { UnitForm } from '@/features/units/components/UnitForm';
import { useUpdateUnit, useLandlordPropertyOptions } from '@/features/units/hooks/useUnits';
import { Skeleton } from '@/components/ui/skeleton';

export function EditUnitPage() {
  const { id } = useParams<{ id: string }>();
  const updateUnit = useUpdateUnit();
  const { data: properties, isLoading: propertiesLoading } = useLandlordPropertyOptions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['unit', id],
    queryFn: () => getUnitById(id as string),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl">
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (isError || !data || !id) {
    return <p className="text-destructive">Couldn&apos;t load this unit.</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-h4 text-foreground">Edit Unit</h1>
      <UnitForm
        mode="edit"
        defaultValues={data}
        onSubmit={(input) => updateUnit.mutateAsync({ unitId: id, input })}
        properties={properties}
        propertiesLoading={propertiesLoading}
        backPath="/landlord/units"
      />
    </div>
  );
}
