import { supabase } from '@/lib/supabase';
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas';

export async function registerUser(input: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        first_name: input.firstName,
        last_name: input.lastName,
        role: input.role,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) throw error;
  return data;
}

export async function loginUser(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error) throw error;

  // Check suspension immediately, before declaring login successful —
  // this is what prevents the confusing "Welcome back" toast from ever
  // appearing for a suspended account, instead of racing against
  // AuthProvider's own async check.
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('status')
    .eq('user_id', data.user.id)
    .single();

  if (!profileError && profile?.status === 'suspended') {
    await supabase.auth.signOut();
    throw new Error('Your account has been suspended. Contact support for assistance.');
  }

  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function changePassword(
  email: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Supabase has no direct "verify current password" call — re-authenticating
  // with it is the standard way to confirm it's correct before changing it.
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });
  if (verifyError) throw new Error('Current password is incorrect');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function sendPasswordResetEmail(input: ForgotPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: `${window.location.origin}/login` },
  });
  if (error) throw error;
}

export async function updatePassword(input: ResetPasswordInput) {
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error) throw error;
}
