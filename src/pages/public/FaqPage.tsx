import { useCmsPage } from '@/features/cms/hooks/useCms';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';

export function FaqPage() {
  const { data: page, isLoading } = useCmsPage('faq');

  return (
    <div>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about renting, listing, and paying on PropertyFlow."
        imageUrl="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80"
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
