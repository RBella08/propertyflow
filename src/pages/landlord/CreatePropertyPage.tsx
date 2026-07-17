import { PropertyForm } from '@/features/properties/components/PropertyForm';

export function CreatePropertyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-h4 text-foreground">Add Property</h1>
      <PropertyForm />
    </div>
  );
}
