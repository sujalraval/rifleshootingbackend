import { z } from 'zod';

const status = z.enum(['Active', 'Inactive']);
const requiredName = (label: string) => z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`);

export const categorySchema = z.object({
  name: requiredName('Category name'),
  status: status.optional().default('Active'),
});
export const updateCategorySchema = z.object({
  name: requiredName('Category name').optional(),
  status: status.optional(),
});

export const subCategorySchema = z.object({
  name: requiredName('Sub-category name'),
  categoryId: z.string({ error: 'Select a parent category' }).uuid('Select a parent category'),
  status: status.optional().default('Active'),
});
export const updateSubCategorySchema = z.object({
  name: requiredName('Sub-category name').optional(),
  categoryId: z.string({ error: 'Select a parent category' }).uuid('Select a parent category').optional(),
  status: status.optional(),
});

const itemFields = {
  name: requiredName('Item name'),
  categoryId: z.string({ error: 'Item category is required' }).uuid('Item category is required'),
  subCategoryId: z.string({ error: 'Sub-category is required' }).uuid('Sub-category is required'),
  uom: requiredName('UoM'),
  brandName: z.string().trim().optional(),
  caliber: z.string().trim().optional(),
  description: z.string().trim().optional(),
  status: status.optional(),
  returnable: z.boolean().optional(),
  returnableWithEmptyShells: z.boolean().optional(),
  disposable: z.boolean().optional(),
  licenceType: z.enum(['Licence', 'Non-Licence']).optional(),
  licenceSub: z.enum(['Licence 5', 'Licence 8']).nullable().optional(),
};

export const itemSchema = z.object(itemFields);
export const updateItemSchema = z.object(itemFields).partial();

export type CategoryInput = z.infer<typeof updateCategorySchema>;
export type SubCategoryInput = z.infer<typeof updateSubCategorySchema>;
export type ItemInput = z.infer<typeof updateItemSchema>;
