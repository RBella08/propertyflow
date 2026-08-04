import { useState } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { resendVerificationEmail } from '@/features/auth/services/authService';

export function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    if (!email) {
      toast.error('Enter your email address first');
      return;
    }
    setSending(true);
    try {
      await resendVerificationEmail(email);
      setSent(true);
      toast.success('Verification email resent', {
        description: 'Check your inbox (and spam folder).',
      });
    } catch (error) {
      toast.error('Could not resend email', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setSending(false);
    }
  };

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
      <CardContent className="flex flex-col gap-4">
        <Button asChild className="w-full">
          <Link to="/login">Go to login</Link>
        </Button>

        <div className="border-t pt-4">
          <p className="mb-2 text-caption text-muted-foreground">
            Didn&apos;t get the email, or the link expired?
          </p>
          {sent ? (
            <p className="text-small text-success">Email resent — check your inbox.</p>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="resendEmail" className="sr-only">
                Email
              </Label>
              <Input
                id="resendEmail"
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button variant="outline" onClick={handleResend} loading={sending} className="w-full">
                Resend Verification Email
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
