import { useCmsPage } from '@/features/cms/hooks/useCms';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';

export function AboutPage() {
  const { data: page, isLoading } = useCmsPage('about');

  return (
    <div>
      <PageHero
        title="About PropertyFlow"
        subtitle="Building a more trustworthy way to rent, list, and manage property in Nigeria."
        imageUrl="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80"
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
