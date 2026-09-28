import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET is not set. Add it to the backend .env file.');
}

export const JWT_SECRET: string = jwtSecret;

// Comma-separated list of allowed frontend origins. Unset = allow any origin (local dev).
export const CORS_ORIGINS = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

export const MIN_PASSWORD_LENGTH = 8;
