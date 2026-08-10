import { Request, Response } from 'express';
import * as ammunitionService from './ammunition.service';
import { createAmmunitionSchema, updateAmmunitionSchema } from './ammunition.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await ammunitionService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await ammunitionService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createAmmunitionSchema.parse(req.body);
    const data = await ammunitionService.create(validatedData);
    res.status(201).json({ message: 'Ammunition record created', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateAmmunitionSchema.parse(req.body);
    const data = await ammunitionService.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Ammunition record updated', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await ammunitionService.remove(req.params.id as string);
    res.status(200).json({ message: 'Record deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
