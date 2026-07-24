import { Link } from 'react-router';
import { Pencil, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCmsPages } from '@/features/cms/hooks/useCms';

export function AdminCmsPage() {
  const { data: pages, isLoading } = useCmsPages();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-h4 text-foreground">Content Management</h1>
        <p className="text-muted-foreground">
          Edit your public-facing pages without touching code.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="flex flex-col gap-3">
          {pages?.map((page) => (
            <Card key={page.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium text-foreground">{page.title}</p>
                  <p className="text-small text-muted-foreground">
                    /{page.slug} · Last updated {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={page.published ? 'success' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {page.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {page.published ? 'Published' : 'Draft'}
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/cms/${page.slug}`}>
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
