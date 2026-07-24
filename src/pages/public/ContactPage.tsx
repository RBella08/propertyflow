import { useCmsPage } from '@/features/cms/hooks/useCms';
import { ContactForm } from '@/features/contact/components/ContactForm';
import { Skeleton } from '@/components/ui/skeleton';

export function ContactPage() {
  const { data: page, isLoading } = useCmsPage('contact');

  return (
    <div className="container py-12">
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          {isLoading ? (
            <Skeleton className="h-40" />
          ) : (
            <div
              className="prose prose-slate dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: page?.content ?? '<h1>Contact Us</h1>' }}
            />
          )}
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
