import { AnimatedSection } from './AnimatedSection';

interface PageHeroProps {
  title: string;
  subtitle?: string;
  imageUrl: string;
}

export function PageHero({ title, subtitle, imageUrl }: PageHeroProps) {
  return (
    <section
      className="flex min-h-[40vh] items-center bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(15,23,42,0.7), rgba(15,23,42,0.7)), url(${imageUrl})`,
      }}
    >
      <div className="container py-16 text-center text-white">
        <AnimatedSection>
          <h1 className="text-h2 font-bold">{title}</h1>
        </AnimatedSection>
        {subtitle && (
          <AnimatedSection delay={150}>
            <p className="mx-auto mt-3 max-w-xl text-body text-white/90">{subtitle}</p>
          </AnimatedSection>
        )}
      </div>
    </section>
  );
}
