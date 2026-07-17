import { Check } from 'lucide-react';

interface PropertyAmenitiesProps {
  amenities: { id: string; name: string; icon: string | null }[];
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  if (amenities.length === 0) {
    return <p className="mt-2 text-muted-foreground">No amenities listed.</p>;
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {amenities.map((amenity) => (
        <div key={amenity.id} className="flex items-center gap-2 text-small text-foreground">
          <Check className="h-4 w-4 text-success" />
          {amenity.name}
        </div>
      ))}
    </div>
  );
}
