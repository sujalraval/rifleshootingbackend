import { Request, Response } from 'express';
import * as membershipChargeService from './membershipCharges.service';
import { membershipChargeSchema, updateMembershipChargeSchema } from './membershipCharges.schema';
import { z } from 'zod';

export const getAll = async (req: Request, res: Response) => {
  try {
    const charges = await membershipChargeService.getAllMembershipCharges();
    res.status(200).json({ success: true, data: charges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = membershipChargeSchema.parse(req.body);
    const newCharge = await membershipChargeService.createMembershipCharge(validatedData);
    res.status(201).json({ success: true, data: newCharge });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateMembershipChargeSchema.parse(req.body);
    const updatedCharge = await membershipChargeService.updateMembershipCharge(req.params.id, validatedData);
    res.status(200).json({ success: true, data: updatedCharge });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const updatedCharge = await membershipChargeService.toggleStatus(req.params.id);
    res.status(200).json({ success: true, data: updatedCharge });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await membershipChargeService.deleteMembershipCharge(req.params.id);
    res.status(200).json({ success: true, message: 'Membership Charge deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
