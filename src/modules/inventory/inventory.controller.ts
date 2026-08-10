import { Request, Response } from 'express';
import * as inventoryService from './inventory.service';
import { createInventorySchema, updateInventorySchema } from './inventory.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await inventoryService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createInventorySchema.parse(req.body);
    const data = await inventoryService.create(validatedData);
    res.status(201).json({ message: 'Item created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateInventorySchema.parse(req.body);
    const data = await inventoryService.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Item updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await inventoryService.remove(req.params.id as string);
    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
