import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { registerSchema, type RegisterInput } from '../schemas';
import { registerUser } from '../services/authService';

export function RegisterForm() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'tenant' },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      await registerUser(data);
      toast.success('Account created!', {
        description: 'Check your email to verify your account before logging in.',
      });
      navigate('/verify-email');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error('Registration failed', { description: message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Start managing your properties or lease today.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...register('firstName')} error={!!errors.firstName} />
              {errors.firstName && (
                <p className="text-caption text-destructive">{errors.firstName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...register('lastName')} error={!!errors.lastName} />
              {errors.lastName && (
                <p className="text-caption text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} error={!!errors.email} />
            {errors.email && (
              <p className="text-caption text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" {...register('password')} error={!!errors.password} />
            <PasswordStrengthMeter password={watch('password') ?? ''} />
            {errors.password && (
              <p className="text-caption text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <PasswordInput
              id="confirmPassword"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <p className="text-caption text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">I am a</Label>
            {/* Temporary native select — upgraded to the Shadcn Select
                component in the Forms phase once it's installed. */}
            <select
              id="role"
              {...register('role')}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="tenant">Tenant</option>
              <option value="landlord">Landlord</option>
            </select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" loading={isSubmitting}>
            Create account
          </Button>
          <p className="text-small text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
