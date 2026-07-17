import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-h1 font-bold text-destructive">403</span>
      <h1 className="text-h4 text-foreground">Access denied</h1>
      <p className="max-w-sm text-muted-foreground">You don't have permission to view this page.</p>
      <Button asChild variant="outline">
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
