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

/** HTTP status for a failed request: 404 when the record doesn't exist (or was deleted), otherwise the given fallback. */
export const errorStatus = (error: any, fallback: number) => (error?.code === 'P2025' ? 404 : fallback);

/** An error for a missing (or deleted) record; controllers answer it with 404 via errorStatus(). */
export const notFoundError = (message: string) => Object.assign(new Error(message), { code: 'P2025' });

/**
 * Express handler that answers { success, data }. Validation and business-rule errors are 400,
 * missing records 404, unexpected failures 500.
 */
export const handle =
  (status: number, run: (req: import('express').Request) => Promise<unknown>) =>
  async (req: import('express').Request, res: import('express').Response) => {
    try {
      res.status(status).json({ success: true, data: await run(req) });
    } catch (error: any) {
      if (error?.name === 'ZodError') return res.status(400).json(validationError(error));
      if (error?.code === 'P2025') return res.status(404).json({ success: false, message: error.message || 'Record not found' });
      if (error?.code === 'P2002') return res.status(400).json({ success: false, message: 'A record with this value already exists' });
      if (error instanceof Error && !('code' in error)) return res.status(400).json({ success: false, message: error.message });
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  };
