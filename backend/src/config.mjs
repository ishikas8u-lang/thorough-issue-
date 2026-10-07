import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  host: process.env.HOST || '127.0.0.1',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  databasePath: process.env.DATABASE_PATH
    ? path.resolve(process.cwd(), process.env.DATABASE_PATH)
    : path.resolve(__dirname, '../data/campus_assist.db'),

  // Configurable allowed CORS origins (Strict in production, never '*')
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],

  sessionTtlMs: parseInt(process.env.SESSION_TTL_HOURS || '24', 10) * 60 * 60 * 1000,
  cookieSecure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',

  // Rate Limiting (per IP window)
  rateLimits: {
    authPerMinute: parseInt(process.env.RATE_LIMIT_AUTH_PER_MINUTE || '5', 10),
    reportPerMinute: parseInt(process.env.RATE_LIMIT_REPORT_PER_MINUTE || '10', 10),
    lookupPerMinute: parseInt(process.env.RATE_LIMIT_LOOKUP_PER_MINUTE || '30', 10),
  },

  staffReviewerUsername: process.env.STAFF_DEMO_USERNAME || 'staff_vansh',
};
