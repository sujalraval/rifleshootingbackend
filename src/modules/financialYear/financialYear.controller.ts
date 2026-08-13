import { Request, Response } from 'express';
import * as financialYearService from './financialYear.service';
import { financialYearSchema, updateFinancialYearSchema } from './financialYear.schema';
import { z } from 'zod';

export const getAll = async (req: Request, res: Response) => {
  try {
    const years = await financialYearService.getAllFinancialYears();
    res.status(200).json({ success: true, data: years });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = financialYearSchema.parse(req.body);
    const newYear = await financialYearService.createFinancialYear(validatedData);
    res.status(201).json({ success: true, data: newYear });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateFinancialYearSchema.parse(req.body);
    const updatedYear = await financialYearService.updateFinancialYear(req.params.id, validatedData);
    res.status(200).json({ success: true, data: updatedYear });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    await financialYearService.deleteFinancialYear(req.params.id);
    res.status(200).json({ success: true, message: 'Financial year deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleActive = async (req: Request, res: Response) => {
  try {
    const updatedYear = await financialYearService.toggleActiveStatus(req.params.id);
    res.status(200).json({ success: true, data: updatedYear });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
