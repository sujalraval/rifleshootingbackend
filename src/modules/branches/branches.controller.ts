import { Request, Response } from 'express';
import * as branchesService from './branches.service';
import { createBranchSchema, updateBranchSchema } from './branches.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await branchesService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await branchesService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createBranchSchema.parse(req.body);
    const data = await branchesService.create(validatedData);
    res.status(201).json({ message: 'Branch created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateBranchSchema.parse(req.body);
    const data = await branchesService.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Branch updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await branchesService.remove(req.params.id as string);
    res.status(200).json({ message: 'Branch deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
