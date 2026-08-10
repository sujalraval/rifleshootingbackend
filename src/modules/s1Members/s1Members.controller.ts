import { Request, Response } from 'express';
import * as s1S1S1MembersService from './s1S1S1Members.service';
import { createS1MemberSchema, updateS1MemberSchema } from './s1S1S1Members.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await s1S1S1MembersService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await s1S1S1MembersService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createS1MemberSchema.parse(req.body);
    const data = await s1S1S1MembersService.create(validatedData);
    res.status(201).json({ message: 'S1Member created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateS1MemberSchema.parse(req.body);
    const data = await s1S1S1MembersService.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'S1Member updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await s1S1S1MembersService.remove(req.params.id as string);
    res.status(200).json({ message: 'S1Member deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
