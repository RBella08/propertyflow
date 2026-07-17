import { Link } from 'react-router';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="items-center text-center">
        <MailCheck className="mb-2 h-10 w-10 text-primary" />
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a confirmation link to your email address. Click it to activate your
          account, then log in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link to="/login">Go to login</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
