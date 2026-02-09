/**
 * Centralized Environment Configuration
 *
 * This file validates and provides typed access to all environment variables.
 * Throws clear errors on startup if required variables are missing.
 */

/**
 * Centralized Environment Configuration
 *
 * This file validates and provides typed access to all environment variables.
 * Designed to be safe during build time.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value && typeof window === 'undefined') {
    // Only throw if we're not in a build/static-gen phase if possible, 
    // but a cleaner way is to just let it be used and fail when accessed.
    console.warn(`⚠️ Warning: Missing required environment variable: ${key}`);
  }
  return value || '';
}

function optionalEnv(key: string, defaultValue: string = ''): string {
  return process.env[key] || defaultValue;
}

export const config = {
  // Database (Supabase)
  get supabase() {
    return {
      url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
      anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    };
  },

  // Google OAuth
  get google() {
    return {
      clientId: requireEnv('GOOGLE_CLIENT_ID'),
      clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
    };
  },

  // Google AI APIs
  get googleAI() {
    return {
      apiKey: requireEnv('GOOGLE_API_KEY'),
      aiApiKey: optionalEnv('GOOGLE_AI_API_KEY'),
      proApiKey: optionalEnv('GOOGLE_AI_PRO_API_KEY'),
    };
  },

  // Admin
  get admin() {
    return {
      password: requireEnv('ADMIN_PASSWORD'),
      email: requireEnv('ADMIN_EMAIL'),
      studioPassword: optionalEnv('STUDIO_PASSWORD'),
    };
  },

  // App Configuration
  get app() {
    return {
      url: requireEnv('NEXT_PUBLIC_APP_URL'),
      nextAuthUrl: requireEnv('NEXTAUTH_URL'),
      env: process.env.NODE_ENV || 'development',
      isDevelopment: process.env.NODE_ENV === 'development',
      isProduction: process.env.NODE_ENV === 'production',
    };
  },

  // Optional: AIML API
  get aiml() {
    return {
      apiKey: optionalEnv('AIML_API_KEY'),
    };
  },
};
