import { Request, Response } from 'express';
import * as service from './membershipNames.service';
import { membershipNameSchema, updateMembershipNameSchema } from './membershipNames.schema';
import { z } from 'zod';

export const getAll = async (req: Request, res: Response) => {
  try {
    const names = await service.getAll();
    res.status(200).json({ success: true, data: names });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = membershipNameSchema.parse(req.body);
    const newName = await service.create(validatedData);
    res.status(201).json({ success: true, data: newName });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    // Handle Prisma unique constraint error
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Membership name already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateMembershipNameSchema.parse(req.body);
    const updatedName = await service.update(req.params.id, validatedData);
    res.status(200).json({ success: true, data: updatedName });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Membership name already exists.' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const updatedName = await service.toggleStatus(req.params.id);
    res.status(200).json({ success: true, data: updatedName });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await service.remove(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
