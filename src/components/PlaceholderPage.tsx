interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-h3 text-foreground">{title}</h1>
      <p className="text-muted-foreground">
        {description ?? 'This page will be built in an upcoming development phase.'}
      </p>
    </div>
  );
}
