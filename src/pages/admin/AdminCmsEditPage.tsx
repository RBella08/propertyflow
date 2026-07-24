import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useCmsPage, useUpdateCmsPage } from '@/features/cms/hooks/useCms';

export function AdminCmsEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: page, isLoading } = useCmsPage(slug);
  const updatePage = useUpdateCmsPage();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (page) {
      setTitle(page.title);
      setContent(page.content);
      setMetaDescription(page.metaDescription ?? '');
      setPublished(page.published);
    }
  }, [page]);

  const handleSave = async () => {
    if (!page) return;
    try {
      await updatePage.mutateAsync({
        pageId: page.id,
        updates: { title, content, metaDescription, published },
      });
      toast.success('Page updated');
      navigate('/admin/cms');
    } catch (error) {
      toast.error('Failed to save', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  if (isLoading) return <Skeleton className="h-96" />;
  if (!page) return <p className="text-destructive">Page not found.</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-h4 text-foreground">Edit: {page.title}</h1>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Page Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Input
              id="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="Shown in search engine results"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="published"
              checked={published}
              onCheckedChange={(v) => setPublished(!!v)}
            />
            <Label htmlFor="published" className="cursor-pointer font-normal">
              Published (visible on the live site)
            </Label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => navigate('/admin/cms')}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={updatePage.isPending}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
