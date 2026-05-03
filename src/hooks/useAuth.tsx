import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  user_type: string;
  company_name: string | null;
  sme_id: string | null;
  municipality: string | null;
  producer_program_id: string | null;
  role_in_company: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  consentGiven: boolean | null;
  consentLoading: boolean;
  signUp: (email: string, password: string, metadata?: { full_name?: string; user_type?: string; company_name?: string; sme_id?: string; industry_sector?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  submitConsent: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);
  // Start as true so ProtectedRoute always waits for the first fetch — avoids a
  // race window where consentGiven is null but consentLoading is already false.
  const [consentLoading, setConsentLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setProfile(data as Profile);
    }
  };

  const fetchConsent = async (userId: string) => {
    setConsentLoading(true);
    const { data, error } = await supabase
      .from('user_consent')
      .select('consent_given')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      setConsentGiven(data.consent_given);
    } else {
      // Row may not exist yet for users who signed up before this migration.
      // Treat missing row as consent not yet given.
      setConsentGiven(false);
    }
    setConsentLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setConsentLoading(true); // block renders until fetchConsent resolves
          setTimeout(() => {
            fetchProfile(session.user.id);
            fetchConsent(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setConsentGiven(null);
          setConsentLoading(false);
        }

        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchConsent(session.user.id);
      } else {
        setConsentLoading(false);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; user_type?: string; company_name?: string; sme_id?: string; industry_sector?: string }
  ) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setConsentGiven(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  };

  const submitConsent = async (): Promise<{ error: Error | null }> => {
    if (!user) return { error: new Error('Not authenticated') };

    const now = new Date().toISOString();

    // Upsert so this is safe regardless of whether the trigger already created the row.
    const { error } = await supabase
      .from('user_consent')
      .upsert(
        { user_id: user.id, consent_given: true, consent_timestamp: now },
        { onConflict: 'user_id' }
      );

    if (!error) {
      setConsentGiven(true);
    }

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      consentGiven,
      consentLoading,
      signUp,
      signIn,
      signOut,
      refreshProfile,
      submitConsent,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
