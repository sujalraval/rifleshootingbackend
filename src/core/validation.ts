import { z } from 'zod';

// Fields the server owns. Clients must never set these through a create/update body.
const SYSTEM_FIELDS = ['id', 'isDeleted', 'deletedAt', 'createdAt', 'updatedAt'];

/**
 * Accepts any JSON object but removes server-controlled fields.
 * Stop-gap for modules that do not have a full schema yet.
 */
export const looseObjectSchema = z
  .record(z.string(), z.unknown())
  .transform((data) => {
    const result: Record<string, unknown> = { ...data };
    for (const field of SYSTEM_FIELDS) delete result[field];
    return result;
  });
