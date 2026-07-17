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
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function sendPasswordResetEmail(input: ForgotPasswordInput) {
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(input: ResetPasswordInput) {
  const { error } = await supabase.auth.updateUser({
    password: input.password,
  });
  if (error) throw error;
}
