import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Amenity {
  id: string;
  name: string;
}

async function getAmenities(): Promise<Amenity[]> {
  const { data, error } = await supabase.from('amenities').select('id, name').order('name');
  if (error) throw error;
  return data ?? [];
}

interface AmenitySelectorProps {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export function AmenitySelector({ selected, onChange }: AmenitySelectorProps) {
  const { data: amenities, isLoading } = useQuery({
    queryKey: ['amenities'],
    queryFn: getAmenities,
  });

  const toggle = (id: string) => {
    onChange(selected.includes(id) ? selected.filter((a) => a !== id) : [...selected, id]);
  };

  if (isLoading) return <p className="text-muted-foreground">Loading amenities...</p>;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {(amenities ?? []).map((amenity) => (
        <div key={amenity.id} className="flex items-center gap-2">
          <Checkbox
            id={`amenity-${amenity.id}`}
            checked={selected.includes(amenity.id)}
            onCheckedChange={() => toggle(amenity.id)}
          />
          <Label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer font-normal">
            {amenity.name}
          </Label>
        </div>
      ))}
    </div>
  );
}
