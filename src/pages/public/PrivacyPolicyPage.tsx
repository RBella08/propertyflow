import { useCmsPage } from '@/features/cms/hooks/useCms';
import { Skeleton } from '@/components/ui/skeleton';

export function PrivacyPolicyPage() {
  const { data: page, isLoading } = useCmsPage('privacy-policy');

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div
        className="prose prose-slate mx-auto max-w-3xl dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: page?.content ?? '<p>Content coming soon.</p>' }}
      />
    </div>
  );
}
