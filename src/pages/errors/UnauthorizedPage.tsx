import { Link } from 'react-router';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="text-h1 font-bold text-warning">401</span>
      <h1 className="text-h4 text-foreground">You need to sign in</h1>
      <p className="max-w-sm text-muted-foreground">Please log in to access this page.</p>
      <Button asChild>
        <Link to="/login">Go to Login</Link>
      </Button>
    </div>
  );
}
