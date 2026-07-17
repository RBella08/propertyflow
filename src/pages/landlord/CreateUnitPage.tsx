import { useSearchParams } from 'react-router';
import { UnitForm } from '@/features/units/components/UnitForm';
import { useCreateUnit } from '@/features/units/hooks/useUnitMutations';

export function CreateUnitPage() {
  const [searchParams] = useSearchParams();
  const lockedPropertyId = searchParams.get('propertyId') ?? undefined;
  const createUnit = useCreateUnit();

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-h4 text-foreground">Add Unit</h1>
      <UnitForm
        mode="create"
        lockedPropertyId={lockedPropertyId}
        onSubmit={(data) => createUnit.mutateAsync(data)}
      />
    </div>
  );
}
