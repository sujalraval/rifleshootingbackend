import { Request, Response } from 'express';
import { ZodType } from 'zod';
import * as service from './itemMasters.service';
import {
  categorySchema,
  itemSchema,
  subCategorySchema,
  updateCategorySchema,
  updateItemSchema,
  updateSubCategorySchema,
} from './itemMasters.schema';
import { validationError, errorStatus } from '../../core/http';

// Wraps a service call in the { success, data } response shape used by the master screens.
// Validation and business-rule failures are 400s; anything unexpected is a 500.
const handle = (status: number, run: (req: Request) => Promise<unknown>) => async (req: Request, res: Response) => {
  try {
    res.status(status).json({ success: true, data: await run(req) });
  } catch (error: any) {
    if (error.name === 'ZodError') return res.status(400).json(validationError(error));
    if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'Record not found' });
    if (error instanceof Error && !('code' in error)) {
      return res.status(errorStatus(error, 400)).json({ success: false, message: error.message });
    }
    res.status(errorStatus(error, 500)).json({ success: false, message: error.message || 'Server error' });
  }
};

const parse = <T>(schema: ZodType<T>, req: Request) => schema.parse(req.body);
const id = (req: Request) => req.params.id as string;

export const listCategories = handle(200, () => service.listCategories());
export const createCategory = handle(201, (req) => service.createCategory(parse(categorySchema, req)));
export const updateCategory = handle(200, (req) => service.updateCategory(id(req), parse(updateCategorySchema, req)));
export const toggleCategory = handle(200, (req) => service.toggleCategory(id(req)));
export const deleteCategory = handle(200, (req) => service.deleteCategory(id(req)));

export const listSubCategories = handle(200, (req) =>
  service.listSubCategories(typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined)
);
export const createSubCategory = handle(201, (req) => service.createSubCategory(parse(subCategorySchema, req)));
export const updateSubCategory = handle(200, (req) => service.updateSubCategory(id(req), parse(updateSubCategorySchema, req)));
export const toggleSubCategory = handle(200, (req) => service.toggleSubCategory(id(req)));
export const deleteSubCategory = handle(200, (req) => service.deleteSubCategory(id(req)));

export const listItems = handle(200, () => service.listItems());
export const createItem = handle(201, (req) => service.createItem(parse(itemSchema, req)));
export const updateItem = handle(200, (req) => service.updateItem(id(req), parse(updateItemSchema, req)));
export const toggleItem = handle(200, (req) => service.toggleItem(id(req)));
export const deleteItem = handle(200, (req) => service.deleteItem(id(req)));
