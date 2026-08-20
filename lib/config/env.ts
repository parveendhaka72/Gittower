/**
 * Environment Variables & Secrets Management
 * Validates required environment variables and provides typed configuration.
 */

export interface AppConfig {
  github: {
    clientId: string;
    clientSecret: string;
  };
  gemini: {
    apiKey: string;
    model: string;
  };
  database: {
    mongoUri?: string;
    postgresUrl?: string;
  };
  app: {
    url: string;
    nodeEnv: 'development' | 'production' | 'test';
    isProduction: boolean;
  };
}

function getEnvVar(key: string, defaultValue?: string, required: boolean = false): string {
  const value = process.env[key] || defaultValue;
  if (required && !value) {
    console.warn(`[Config Warning] Missing required environment variable: ${key}`);
  }
  return value || '';
}

export const env: AppConfig = {
  github: {
    clientId: getEnvVar('GITHUB_CLIENT_ID', '', false),
    clientSecret: getEnvVar('GITHUB_CLIENT_SECRET', '', false),
  },
  gemini: {
    apiKey: getEnvVar('GEMINI_API_KEY', '', false),
    model: getEnvVar('GEMINI_MODEL', 'gemini-2.0-flash', false),
  },
  database: {
    mongoUri: getEnvVar('MONGODB_URI', 'mongodb://localhost:27017/gittower', false),
    postgresUrl: getEnvVar('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/gittower', false),
  },
  app: {
    url: getEnvVar('APP_URL', 'http://localhost:3000', false),
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
};

/**
 * Validates configuration at runtime with diagnostic feedback
 */
export function validateEnvironment(): { isValid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!process.env.GITHUB_CLIENT_ID) missing.push('GITHUB_CLIENT_ID');
  if (!process.env.GITHUB_CLIENT_SECRET) missing.push('GITHUB_CLIENT_SECRET');
  if (!process.env.GEMINI_API_KEY) warnings.push('GEMINI_API_KEY (AI features will use deterministic simulation if absent)');
  if (!process.env.MONGODB_URI) warnings.push('MONGODB_URI (Using in-memory NoSQL datastore)');
  if (!process.env.DATABASE_URL) warnings.push('DATABASE_URL (Using in-memory Relational SQL engine)');

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}
