import { Request, Response } from 'express';
import * as issuesService from './issues.service';
import { createIssueSchema } from './issues.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await issuesService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await issuesService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createIssueSchema.parse(req.body);
    const data = await issuesService.create(validatedData);
    res.status(201).json({ message: 'Issue record created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await issuesService.remove(req.params.id as string);
    res.status(200).json({ message: 'Issue record deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
