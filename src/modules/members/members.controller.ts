import { Request, Response } from 'express';
import * as membersService from './members.service';
import { createMemberSchema, updateMemberSchema } from './members.schema';

export const getAll = async (req: Request, res: Response) => {
  try {
    const data = await membersService.findAll();
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const data = await membersService.findById(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createMemberSchema.parse(req.body);
    const data = await membersService.create(validatedData);
    res.status(201).json({ message: 'Member created successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateMemberSchema.parse(req.body);
    const data = await membersService.update(req.params.id as string, validatedData);
    res.status(200).json({ message: 'Member updated successfully', data });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ message: 'Validation failed', errors: error.errors });
    }
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await membersService.remove(req.params.id as string);
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getOutstanding = async (req: Request, res: Response) => {
  try {
    const data = await membersService.getOutstanding(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getIssuedItems = async (req: Request, res: Response) => {
  try {
    const data = await membersService.getIssuedItems(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const data = await membersService.getSubscriptions(req.params.id as string);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  try {
    const data = await membersService.createSubscription(req.params.id as string, req.body);
    res.status(201).json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
