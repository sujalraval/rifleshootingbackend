import { ZodError } from 'zod';

/**
 * Builds a 400 response body for a failed zod parse. `message` is human-readable
 * (the frontend shows it directly); `errors` keeps the per-field details.
 */
export const validationError = (error: ZodError) => {
  const errors = error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));
  const message = errors
    .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
    .join('; ');
  return { success: false, message: `Validation failed - ${message}`, errors };
};
