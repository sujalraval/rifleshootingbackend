import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.string().optional(),
    permissions: z.array(
      z.object({
        module: z.string(),
        canRead: z.boolean(),
        canWrite: z.boolean(),
        canDelete: z.boolean()
      })
    ).optional()
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.string().optional(),
    permissions: z.array(
      z.object({
        module: z.string(),
        canRead: z.boolean(),
        canWrite: z.boolean(),
        canDelete: z.boolean()
      })
    ).optional()
  }),
});
