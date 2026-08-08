import { useState } from 'react';
import { Plus, Trash2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useVendors, useDeleteVendor } from '@/features/vendors/hooks/useVendors';
import { VendorForm } from '@/features/vendors/components/VendorForm';

const CATEGORIES = [
  'all',
  'plumbing',
  'electrical',
  'structural',
  'appliance',
  'pest_control',
  'cleaning',
  'general',
];

export function VendorsPage() {
  const { data: vendors, isLoading } = useVendors();
  const deleteVendor = useDeleteVendor();
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filtered = vendors?.filter((v) => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteVendor.mutateAsync(id);
      toast.success('Vendor removed');
    } catch {
      toast.error('Could not remove vendor');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h4 text-foreground">Vendors</h1>
          <p className="text-muted-foreground">Your maintenance contractor directory.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Vendor
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-small capitalize"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">
              {c === 'all' ? 'All categories' : c.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="h-40" />
      ) : filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id}>
              <CardContent className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{v.name}</p>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {v.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    title="Remove vendor"
                    onClick={() => handleDelete(v.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {v.phone && (
                  <p className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" /> {v.phone}
                  </p>
                )}
                {v.email && (
                  <p className="flex items-center gap-1.5 text-small text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" /> {v.email}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">No vendors match your filters.</p>
      )}

      <VendorForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  );
}
