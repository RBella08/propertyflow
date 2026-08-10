import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { changePasswordSchema, type ChangePasswordInput } from '@/features/auth/schemas';
import { changePassword } from '@/features/auth/services/authService';
import { useAuthContext } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';
import {
  isPushSupported,
  getPushPermissionStatus,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/pushNotifications';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export function SettingsPage() {
  const { user, profile } = useAuthContext();
  const { theme, setTheme } = useTheme();

  const [pushSupported, setPushSupported] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    isPushSupported().then(setPushSupported);
    getPushPermissionStatus().then((status) => setPushEnabled(status === 'granted'));
  }, []);

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        toast.success('Push notifications turned off');
      } else {
        await subscribeToPush(profile!.id);
        setPushEnabled(true);
        toast.success('Push notifications turned on');
      }
    } catch (error) {
      toast.error('Could not update push notifications', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setPushLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = async (data: ChangePasswordInput) => {
    if (!user?.email) return;
    try {
      await changePassword(user.email, data.currentPassword, data.newPassword);
      toast.success('Password updated');
      reset();
    } catch (error) {
      toast.error('Could not update password', {
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    }
  };

  return (
    <div>
      <h1>Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          {THEMES.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'rounded-md border px-4 py-2 text-small font-medium',
                theme === t.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input text-muted-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-h6">
            <Bell className="h-4 w-4" /> Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pushSupported ? (
            <Button
              onClick={handleTogglePush}
              loading={pushLoading}
              variant={pushEnabled ? 'outline' : 'default'}
            >
              {pushEnabled ? 'Turn Off' : 'Turn On'} Push Notifications
            </Button>
          ) : (
            <p className="text-small text-muted-foreground">
              On iPhone, push notifications only work once you&apos;ve added PropertyFlow to your
              Home Screen: tap the Share icon in Safari, then &quot;Add to Home Screen.&quot; Open
              the app from that icon and this option will appear here.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <PasswordInput
                id="currentPassword"
                {...register('currentPassword')}
                error={!!errors.currentPassword}
              />
              {errors.currentPassword && (
                <p className="text-caption text-destructive">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="newPassword">New Password</Label>
              <PasswordInput
                id="newPassword"
                {...register('newPassword')}
                error={!!errors.newPassword}
              />
              {errors.newPassword && (
                <p className="text-caption text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <PasswordInput
                id="confirmNewPassword"
                {...register('confirmNewPassword')}
                error={!!errors.confirmNewPassword}
              />
              {errors.confirmNewPassword && (
                <p className="text-caption text-destructive">{errors.confirmNewPassword.message}</p>
              )}
            </div>

            <Button type="submit" loading={isSubmitting} className="w-fit">
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
