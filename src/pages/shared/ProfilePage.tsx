import { useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useMyProfile,
  useUpdateMyProfile,
  useUploadAvatar,
} from '@/features/profile/hooks/useProfile';
import { useAuthContext } from '@/providers/AuthProvider';
import type { ProfileUpdateInput } from '@/features/profile/services/profileService';

export function ProfilePage() {
  const { data: profile, isLoading } = useMyProfile();
  const updateProfile = useUpdateMyProfile();
  const uploadAvatar = useUploadAvatar();
  const { refreshProfile } = useAuthContext();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileUpdateInput>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone ?? '',
        address: profile.address ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    try {
      await updateProfile.mutateAsync(data);
      await refreshProfile();
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update profile');
    }
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar.mutateAsync(file);
      await refreshProfile();
      toast.success('Avatar updated');
    } catch {
      toast.error('Could not upload avatar');
    }
  };

  if (isLoading || !profile) return <Skeleton className="h-96" />;

  const initials = `${profile.firstName[0] ?? ''}${profile.lastName[0] ?? ''}`.toUpperCase() || 'U';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-h4 text-foreground">My Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-h6">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatarUrl ?? undefined} />
                <AvatarFallback className="text-h6">{initials}</AvatarFallback>
              </Avatar>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-small text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register('phone')} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <Input id="state" {...register('state')} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" {...register('country')} />
              </div>
            </div>
            <Button type="submit" loading={isSubmitting} className="w-fit">
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
