'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { DesignPillarProvider } from './DesignPillarProvider';
import { SimpleCartProvider } from './SimpleCartProvider';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthError, Session } from '@supabase/supabase-js';

// Helper to get cookie value client-side
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface Props {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  supabase: any;
  signInWithEmail: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: AuthError | null }>;
  sendMagicLink: (email: string) => Promise<{ error?: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error?: AuthError | null }>;
  signInWithTwitter: () => Promise<{ error?: AuthError | null }>;
  signInWithDiscord: () => Promise<{ error?: AuthError | null }>;
  signInWithGithub: () => Promise<{ error?: AuthError | null }>;
  signInWithLinkedin: () => Promise<{ error?: AuthError | null }>;
  // Link methods - for adding providers to existing account
  linkGoogle: (next?: string) => Promise<{ error?: AuthError | null }>;
  linkTwitter: (next?: string) => Promise<{ error?: AuthError | null }>;
  linkDiscord: (next?: string) => Promise<{ error?: AuthError | null }>;
  linkGithub: (next?: string) => Promise<{ error?: AuthError | null }>;
  linkLinkedin: (next?: string) => Promise<{ error?: AuthError | null }>;
  signOut: () => Promise<{ error?: AuthError | null }>;
  isAuthenticated: boolean;
  loading: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function Providers({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let isSigningOut = false;

    const getUser = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          setUser(null);
          setSession(null);
        } else {
          console.log('Initial session check:', currentSession?.user?.email || 'no session');
          setUser(currentSession?.user ?? null);
          setSession(currentSession);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setUser(null);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state change:', event, currentSession?.user?.email || 'no session');

        // Handle different auth events
        switch (event) {
          case 'SIGNED_OUT':
            isSigningOut = false;
            setUser(null);
            setSession(null);
            break;
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            setUser(currentSession?.user ?? null);
            setSession(currentSession);
            break;
          case 'USER_UPDATED':
            if (currentSession?.user) {
              setUser(currentSession.user);
              setSession(currentSession);
            }
            break;
          default:
            // For any other event, update the user state
            setUser(currentSession?.user ?? null);
            setSession(currentSession);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithEmail = async (email: string, password: string) => {
    const result = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: result.error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const result = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: result.error };
  };

  const sendMagicLink = async (email: string) => {
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error: result.error };
  };

  const signInWithGoogle = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (result.error) {
      console.error('Google OAuth error:', result.error);
    }

    return { error: result.error };
  };

  const signInWithTwitter = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (result.error) {
      console.error('Twitter OAuth error:', result.error);
    }

    return { error: result.error };
  };

  const signInWithDiscord = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (result.error) {
      console.error('Discord OAuth error:', result.error);
    }

    return { error: result.error };
  };

  const signInWithGithub = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'read:user user:email public_repo',
      },
    });

    if (result.error) {
      console.error('GitHub OAuth error:', result.error);
    }

    return { error: result.error };
  };

  const signInWithLinkedin = async () => {
    const result = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (result.error) {
      console.error('LinkedIn OAuth error:', result.error);
    }

    return { error: result.error };
  };

  // Link methods - for adding providers to an already logged-in user
  // Falls back to signInWithOAuth if no Supabase session (e.g., Twitter-only users)
  const linkGoogle = async (next?: string) => {
    // Check if we have a valid Supabase session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession) {
      // User has Supabase session - use linkIdentity
      const result = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/user/account')}`,
        },
      });

      if (result.error) {
        console.error('Google link error:', result.error);
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }

      return { error: result.error };
    } else {
      // No Supabase session - use signInWithOAuth
      // The auth callback will detect existing unified user from cookies and link
      console.log('No Supabase session, using signInWithOAuth for linking');
      const result = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (result.error) {
        console.error('Google OAuth error:', result.error);
      }

      return { error: result.error };
    }
  };

  const linkTwitter = async (next?: string) => {
    console.log('linkTwitter called');
    try {
      // Check if we have a valid Supabase session
      const { data: { session: currentSession } } = await supabase.auth.getSession();

      if (currentSession) {
        // User has Supabase session - use linkIdentity
        const result = await supabase.auth.linkIdentity({
          provider: 'twitter',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/user/account')}`,
          },
        });

        console.log('linkTwitter result:', JSON.stringify(result, null, 2));

        if (result.error) {
          console.error('Twitter link error:', result.error);
        }

        if (result.data?.url) {
          console.log('Redirecting to:', result.data.url);
          window.location.href = result.data.url;
        }

        return { error: result.error };
      } else {
        // No Supabase session - redirect to custom Twitter OAuth
        // Our custom Twitter OAuth will detect existing unified user from cookies
        console.log('No Supabase session, using custom Twitter OAuth');
        window.location.href = '/api/auth/twitter';
        return { error: null };
      }
    } catch (err) {
      console.error('linkTwitter exception:', err);
      return { error: err as any };
    }
  };

  const linkDiscord = async (next?: string) => {
    // Check if we have a valid Supabase session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession) {
      // User has Supabase session - use linkIdentity
      const result = await supabase.auth.linkIdentity({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/user/account')}`,
        },
      });

      if (result.error) {
        console.error('Discord link error:', result.error);
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }

      return { error: result.error };
    } else {
      // No Supabase session - use signInWithOAuth
      console.log('No Supabase session, using signInWithOAuth for linking');
      const result = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (result.error) {
        console.error('Discord OAuth error:', result.error);
      }

      return { error: result.error };
    }
  };

  const linkGithub = async (next?: string) => {
    // Check if we have a valid Supabase session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession) {
      // User has Supabase session - use linkIdentity
      const result = await supabase.auth.linkIdentity({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/user/account?tab=repos')}&auth_flow=linking`,
          scopes: 'read:user user:email public_repo',
        },
      });

      if (result.error) {
        console.error('GitHub link error:', result.error);
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }

      return { error: result.error };
    } else {
      // No Supabase session - use signInWithOAuth
      console.log('No Supabase session, using signInWithOAuth for linking');
      const result = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/user/account?tab=repos`,
          scopes: 'read:user user:email public_repo',
        },
      });

      if (result.error) {
        console.error('GitHub OAuth error:', result.error);
      }

      return { error: result.error };
    }
  };

  const linkLinkedin = async (next?: string) => {
    // Check if we have a valid Supabase session
    const { data: { session: currentSession } } = await supabase.auth.getSession();

    if (currentSession) {
      // User has Supabase session - use linkIdentity
      const result = await supabase.auth.linkIdentity({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next || '/user/account')}`,
        },
      });

      if (result.error) {
        console.error('LinkedIn link error:', result.error);
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
      }

      return { error: result.error };
    } else {
      // No Supabase session - use signInWithOAuth
      console.log('No Supabase session, using signInWithOAuth for linking');
      const result = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (result.error) {
        console.error('LinkedIn OAuth error:', result.error);
      }

      return { error: result.error };
    }
  };

  const signOut = async () => {
    // Manual cleanup of Supabase tokens from localStorage to ensure complete logout
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && typeof localStorage !== 'undefined') {
      try {
        const urlParts = supabaseUrl.split('//');
        if (urlParts.length > 1) {
          const domainParts = urlParts[1].split('.');
          if (domainParts.length > 0) {
            const projectRef = domainParts[0];
            const supabaseAuthTokenKey = `sb-${projectRef}-auth-token`;
            localStorage.removeItem(supabaseAuthTokenKey);
          }
        }
      } catch (e) { /* Silently fail on local storage error */ }

      // Also clear any other generic sb-*-auth-token keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
    }

    // Clear alternative auth cookies
    if (typeof document !== 'undefined') {
      document.cookie = 'b0ase_handcash_token=; path=/; max-age=0';
      document.cookie = 'b0ase_user_handle=; path=/; max-age=0';
      document.cookie = 'b0ase_twitter_user=; path=/; max-age=0';
      document.cookie = 'b0ase_wallet_provider=; path=/; max-age=0';
      document.cookie = 'b0ase_wallet_address=; path=/; max-age=0';
      document.cookie = 'handcash_auth_token=; path=/; max-age=0'; // Legacy - clear for compatibility
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('isLoggingOut', 'true');
    }

    const result = await supabase.auth.signOut();
    return { error: result.error };
  };

  // Handle server-side logout redirect cleanup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('logged_out') === 'true') {
        console.log('🧹 Detected server-side logout, preventing stale state...');

        // Clear local storage explicitly
        try {
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
              localStorage.removeItem(key);
            }
          });
        } catch (e) {
          console.error('Error clearing localStorage:', e);
        }

        // Reset React state
        setUser(null);
        setSession(null);
        setLoading(false);

        // Remove the param from URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, []);

  const authValue: AuthContextType = {
    user,
    session,
    supabase,
    signInWithEmail,
    signUpWithEmail,
    sendMagicLink,
    signInWithGoogle,
    signInWithTwitter,
    signInWithDiscord,
    signInWithGithub,
    signInWithLinkedin,
    linkGoogle,
    linkTwitter,
    linkDiscord,
    linkGithub,
    linkLinkedin,
    signOut,
    isAuthenticated: !!user,
    loading,
    isLoading: loading,
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="b0ase-theme">
      <DesignPillarProvider>
        <AuthContext.Provider value={authValue}>
          <SimpleCartProvider>
            {children}
          </SimpleCartProvider>
        </AuthContext.Provider>
      </DesignPillarProvider>
    </ThemeProvider>
  );
}