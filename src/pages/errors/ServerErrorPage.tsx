import { Button } from '@/components/ui/button';

export function ServerErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-h1 font-bold text-destructive">500</span>
      <h1 className="text-h4 text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-muted-foreground">
        An unexpected error occurred on our end. Please try again.
      </p>
      <Button onClick={() => window.location.reload()}>Retry</Button>
    </div>
  );
}
