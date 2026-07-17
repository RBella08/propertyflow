import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type ConnectionStatus = 'checking' | 'connected' | 'error';

export function HomePage() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setStatus('error');
          setErrorMessage(error.message);
        } else {
          setStatus('connected');
        }
      })
      .catch((err: Error) => {
        setStatus('error');
        setErrorMessage(err.message);
      });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-24">
      <div className="fixed top-6 right-6">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-h4 text-foreground">PropertyFlow</CardTitle>
          <CardDescription>Supabase connection status</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-small text-muted-foreground">Database</span>
            {status === 'checking' && <Badge variant="secondary">Checking...</Badge>}
            {status === 'connected' && <Badge variant="success">Connected</Badge>}
            {status === 'error' && <Badge variant="destructive">Error</Badge>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-small text-muted-foreground">Auth session</span>
            {isLoading ? (
              <Badge variant="secondary">Checking...</Badge>
            ) : (
              <Badge variant={isAuthenticated ? 'success' : 'outline'}>
                {isAuthenticated ? 'Logged in' : 'Not logged in'}
              </Badge>
            )}
          </div>
          {errorMessage && <p className="text-caption text-destructive">{errorMessage}</p>}
          <Button className="w-full" disabled={status !== 'connected'}>
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
