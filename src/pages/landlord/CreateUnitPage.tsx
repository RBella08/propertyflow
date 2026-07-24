import { useSearchParams } from 'react-router';
import { UnitForm } from '@/features/units/components/UnitForm';
import { useCreateUnit, useLandlordPropertyOptions } from '@/features/units/hooks/useUnits';

export function CreateUnitPage() {
  const [searchParams] = useSearchParams();
  const lockedPropertyId = searchParams.get('propertyId') ?? undefined;
  const createUnit = useCreateUnit();
  const { data: properties, isLoading: propertiesLoading } = useLandlordPropertyOptions();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-h4 text-foreground">Add Unit</h1>
      <UnitForm
        mode="create"
        lockedPropertyId={lockedPropertyId}
        onSubmit={(data) => createUnit.mutateAsync(data)}
        properties={properties}
        propertiesLoading={propertiesLoading}
        backPath="/landlord/units"
      />
    </div>
  );
}
