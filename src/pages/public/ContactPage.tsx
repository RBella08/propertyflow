import { useCmsPage } from '@/features/cms/hooks/useCms';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHero } from '@/components/PageHero';
import { AnimatedSection } from '@/components/AnimatedSection';

export function ContactPage() {
  const { data: page, isLoading } = useCmsPage('contact');

  return (
    <div>
      <PageHero
        title="Get in Touch"
        subtitle="Questions, feedback, or need help? We're here."
        imageUrl="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80"
      />
      <div className="container py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
          <AnimatedSection>
            {isLoading ? (
              <Skeleton className="h-40" />
            ) : (
              <div
                className="prose prose-slate dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: page?.content ?? '<h1>Contact Us</h1>' }}
              />
            )}
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
