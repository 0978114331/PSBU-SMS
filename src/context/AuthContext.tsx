import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'admin' | 'user';

type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, adminCode: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase.from('profiles').select('id, role, full_name').eq('id', userId).maybeSingle();
    if (!error) setProfile(data as Profile | null);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void (async () => loadProfile(nextSession.user.id))();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    user: session?.user ?? null,
    profile,
    loading,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    },
    signUp: async (email, password, fullName, role, adminCode) => {
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
      if (error) return { error: new Error(error.message) };
      if (role === 'admin') {
        const { error: roleError } = await supabase.rpc('request_admin_role', { p_code: adminCode });
        if (roleError) return { error: new Error('មិនអាចកំណត់សិទ្ធិ Admin បានទេ') };
      }
      return { error: null };
    },
    signOut: async () => { await supabase.auth.signOut(); },
  }), [loading, profile, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
