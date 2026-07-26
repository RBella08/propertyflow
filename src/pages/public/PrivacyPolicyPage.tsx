import { useCmsPage } from '@/features/cms/hooks/useCms';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';

export function PrivacyPolicyPage() {
  const { data: page, isLoading } = useCmsPage('privacy-policy');

  return (
    <div>
      <PageHero
        title="Privacy Policy"
        imageUrl="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80"
      />
      <div className="container py-12">
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <AnimatedSection className="prose prose-slate mx-auto max-w-3xl dark:prose-invert">
            <div
              dangerouslySetInnerHTML={{ __html: page?.content ?? '<p>Content coming soon.</p>' }}
            />
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
