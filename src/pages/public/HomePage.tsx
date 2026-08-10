import { Link } from 'react-router';
import {
  Building2,
  MapPin,
  DoorOpen,
  ArrowRight,
  Search,
  FileSignature,
  CreditCard,
  ShieldCheck,
  Zap,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AnimatedSection } from '@/components/AnimatedSection';
import { useHomeStats } from '@/features/home/hooks/useHomeStats';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { PropertyCardSkeleton } from '@/features/properties/components/PropertyCardSkeleton';
import { usePropertiesByCity } from '@/features/home/hooks/usePropertiesByCity';

const HOW_IT_WORKS = [
  {
    icon: Search,
    title: 'Search & Discover',
    body: 'Browse verified listings, filter by location, price, and property type, and book an inspection in minutes.',
  },
  {
    icon: FileSignature,
    title: 'Apply & Lease',
    body: 'Landlords review your details and issue a lease directly through the platform — no paperwork chasing.',
  },
  {
    icon: CreditCard,
    title: 'Pay & Manage',
    body: 'Pay rent online with instant, verified receipts, and track everything from one dashboard.',
  },
];

const WHY_US = [
  {
    icon: ShieldCheck,
    title: 'Server-Verified Payments',
    body: 'Every rent payment is independently confirmed on our servers — never just trusted from a browser.',
  },
  {
    icon: Zap,
    title: 'Instant, Real-Time Updates',
    body: 'Payment confirmations, maintenance updates, and announcements arrive the moment they happen.',
  },
  {
    icon: BarChart3,
    title: 'Direct Payouts to Landlords',
    body: "Rent goes straight to a landlord's own bank account automatically — no manual transfers, no delays.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I used to keep rent records in a notebook. Now I open my dashboard and see everything at a glance.',
    name: 'Adaeze',
    role: 'Landlord, Lagos',
  },
  {
    quote: 'Paying rent online and getting my receipt instantly saved me so much back and forth.',
    name: 'Emeka',
    role: 'Tenant, Abuja',
  },
  {
    quote:
      'Managing three properties used to take a whole afternoon every week. Now it takes ten minutes.',
    name: 'Folake',
    role: 'Landlord, Port Harcourt',
  },
];

export function HomePage() {
  const { data: stats, isLoading: statsLoading } = useHomeStats();
  const { data: featured, isLoading: propertiesLoading } = useProperties({}, 1, 6);
  const { data: cities } = usePropertiesByCity();

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero */}
      <section
        className="relative flex min-h-[85vh] items-center bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(15,23,42,0.72), rgba(15,23,42,0.72)), url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80)',
        }}
      >
        <div className="container flex flex-col items-center gap-6 py-24 text-center">
          <AnimatedSection>
            <h1 className="max-w-2xl text-h1 font-bold text-white">
              Find your next home, managed the modern way
            </h1>
          </AnimatedSection>
          <AnimatedSection delay={150}>
            <p className="max-w-xl text-body text-white/90">
              Browse verified rental properties across Nigeria, pay rent online, and manage your
              tenancy — all in one place.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/properties">Browse Properties</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-white/10 text-white hover:bg-white/20"
                asChild
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="border-b py-12">
        <div className="container">
          <AnimatedSection className="mb-6 text-center">
            <h2 className="text-h4 text-foreground">Browse by Location</h2>
            <p className="mt-1 text-muted-foreground">Find properties in your city.</p>
          </AnimatedSection>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cities?.map((c, i) => (
              <AnimatedSection key={`${c.city}-${c.state}`} delay={i * 60}>
                <Link
                  to={`/properties?city=${encodeURIComponent(c.city)}`}
                  className="flex flex-col items-center gap-1 rounded-card border p-4 text-center transition-colors hover:bg-accent"
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">{c.city}</span>
                  <span className="text-caption text-muted-foreground">
                    {c.propertyCount} properties
                  </span>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b py-12">
        <div className="container grid grid-cols-1 gap-8 sm:grid-cols-3">
          {statsLoading ? (
            <>
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </>
          ) : (
            <>
              <AnimatedSection className="flex flex-col items-center gap-2 text-center">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">
                  {stats?.propertyCount ?? 0}
                </span>
                <span className="text-small text-muted-foreground">Properties Listed</span>
              </AnimatedSection>
              <AnimatedSection delay={100} className="flex flex-col items-center gap-2 text-center">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">{stats?.cityCount ?? 0}</span>
                <span className="text-small text-muted-foreground">Cities Covered</span>
              </AnimatedSection>
              <AnimatedSection delay={200} className="flex flex-col items-center gap-2 text-center">
                <DoorOpen className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">
                  {stats?.availableUnitCount ?? 0}
                </span>
                <span className="text-small text-muted-foreground">Units Available Now</span>
              </AnimatedSection>
            </>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="border-b py-16">
        <div className="container">
          <AnimatedSection className="mb-10 text-center">
            <h2 className="text-h3 text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps, whether you're renting or listing.
            </p>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <AnimatedSection key={step.title} delay={i * 120}>
                <Card className="h-full transition-transform hover:-translate-y-1">
                  <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-foreground">{step.title}</h3>
                    <p className="text-small text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-h3 text-foreground">Featured Properties</h2>
              <p className="text-muted-foreground">A few of our latest listings.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/properties">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propertiesLoading
              ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : featured?.items.map((property, i) => (
                  <AnimatedSection key={property.id} delay={i * 80}>
                    <PropertyCard property={property} />
                  </AnimatedSection>
                ))}
          </div>
        </div>
      </section>

      {/* Why PropertyFlow — with image */}
      <section className="border-y bg-muted/40 py-16">
        <div className="container grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <AnimatedSection>
            <img
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=80"
              alt="Handing over house keys"
              className="aspect-[4/3] w-full rounded-card object-cover shadow-modal"
            />
          </AnimatedSection>
          <div className="flex flex-col gap-6">
            <AnimatedSection>
              <h2 className="text-h3 text-foreground">Why PropertyFlow</h2>
            </AnimatedSection>
            {WHY_US.map((item, i) => (
              <AnimatedSection
                key={item.title}
                delay={(i + 1) * 100}
                className="flex items-start gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="text-small text-muted-foreground">{item.body}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container">
          <AnimatedSection className="mb-10 text-center">
            <h2 className="text-h3 text-foreground">What People Are Saying</h2>
          </AnimatedSection>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <AnimatedSection key={t.name} delay={i * 120}>
                <Card className="h-full">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <p className="text-small italic text-muted-foreground">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="mt-auto">
                      <p className="text-small font-semibold text-foreground">{t.name}</p>
                      <p className="text-caption text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative bg-cover bg-center py-24"
        style={{
          backgroundImage:
            'linear-gradient(rgba(37,99,235,0.88), rgba(37,99,235,0.88)), url(https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80)',
        }}
      >
        <div className="container flex flex-col items-center gap-4 text-center">
          <AnimatedSection>
            <h2 className="text-h3 text-white">Are you a landlord or agency?</h2>

            <p className="max-w-lg text-body text-white/90">
              Manage your entire property portfolio, collect rent online, and track everything in
              one dashboard.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={300}>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-foreground hover:bg-white/90"
              asChild
            >
              <Link to="/register" className="!text-black">
                List Your Property
              </Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
