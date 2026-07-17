import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { UserRole } from '@/types/auth';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchOrCreateProfile(user: User) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!isMounted) return;

      // PGRST116 = "no rows found" — this user has no profile row yet.
      // This happens if the database trigger that should auto-create one
      // on signup doesn't exist (or hasn't run yet). We self-heal by
      // creating it here from the signup metadata instead of failing.
      if (error && error.code === 'PGRST116') {
        const meta = user.user_metadata as {
          first_name?: string;
          last_name?: string;
          role?: UserRole;
        };

        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email ?? '',
            first_name: meta.first_name ?? null,
            last_name: meta.last_name ?? null,
            full_name:
              meta.first_name && meta.last_name ? `${meta.first_name} ${meta.last_name}` : null,
            role: meta.role ?? 'tenant',
            status: 'active',
          })
          .select()
          .single();

        if (!isMounted) return;

        if (createError) {
          console.error('AuthProvider: failed to self-heal profile ->', createError.message);
          setProfile(null);
        } else {
          setProfile(created);
        }
        setIsLoading(false);
        return;
      }

      if (error) {
        console.error('AuthProvider: failed to load profile ->', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
      setIsLoading(false);
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (!isMounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        fetchOrCreateProfile(currentSession.user);
      } else {
        setIsLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) {
        setIsLoading(true);
        fetchOrCreateProfile(newSession.user);
      } else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    isAuthenticated: !!session,
    isLoading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
