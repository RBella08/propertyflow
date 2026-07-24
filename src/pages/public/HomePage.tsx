import { Link } from 'react-router';
import {
  Building2,
  MapPin,
  DoorOpen,
  ArrowRight,
  Search,
  FileSignature,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeStats } from '@/features/home/hooks/useHomeStats';
import { useProperties } from '@/features/properties/hooks/useProperties';
import { PropertyCard } from '@/features/properties/components/PropertyCard';
import { PropertyCardSkeleton } from '@/features/properties/components/PropertyCardSkeleton';

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

  return (
    <div className="flex flex-col">
      <section
        className="relative border-b bg-cover bg-center py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(15,23,42,0.75), rgba(15,23,42,0.75)), url(https://picsum.photos/seed/hero-home/1600/700)`,
        }}
      >
        <div className="container flex flex-col items-center gap-6 text-center">
          <h1 className="max-w-2xl text-h1 font-bold text-white">
            Find your next home, managed the modern way
          </h1>
          <p className="max-w-xl text-body text-white/90">
            Browse verified rental properties across Nigeria, pay rent online, and manage your
            tenancy — all in one place.
          </p>
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
        </div>
      </section>

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
              <div className="flex flex-col items-center gap-2 text-center">
                <Building2 className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">
                  {stats?.propertyCount ?? 0}
                </span>
                <span className="text-small text-muted-foreground">Properties Listed</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <MapPin className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">{stats?.cityCount ?? 0}</span>
                <span className="text-small text-muted-foreground">Cities Covered</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <DoorOpen className="h-8 w-8 text-primary" />
                <span className="text-h3 font-bold text-foreground">
                  {stats?.availableUnitCount ?? 0}
                </span>
                <span className="text-small text-muted-foreground">Units Available Now</span>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="border-b py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-h3 text-foreground">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps, whether you're renting or listing.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step) => (
              <Card key={step.title}>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="text-small text-muted-foreground">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-h3 text-foreground">Featured Properties</h2>
              <p className="text-muted-foreground">A few of our latest listings.</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/properties">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propertiesLoading
              ? Array.from({ length: 3 }).map((_, i) => <PropertyCardSkeleton key={i} />)
              : featured?.items.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/40 py-16">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-h3 text-foreground">What People Are Saying</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Card key={t.name}>
                <CardContent className="flex flex-col gap-4 p-6">
                  <p className="text-small italic text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="text-small font-semibold text-foreground">{t.name}</p>
                    <p className="text-caption text-muted-foreground">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="container flex flex-col items-center gap-4 text-center">
          <h2 className="text-h3">Are you a landlord or agency?</h2>
          <p className="max-w-lg text-body opacity-90">
            Manage your entire property portfolio, collect rent online, and track everything in one
            dashboard.
          </p>
          <Button size="lg" variant="secondary" className="bg-background text-foreground" asChild>
            <Link to="/register">List Your Property</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
