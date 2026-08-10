import { Request, Response } from 'express';
import * as service from './guests.service';
import { createSchema, updateSchema } from './guests.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await service.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await service.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const data = await service.create(validatedData);
    res.status(201).json({ message: 'Record created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const data = await service.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Record updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id as string);
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
