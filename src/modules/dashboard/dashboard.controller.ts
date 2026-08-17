import { Request, Response } from 'express';
import * as dashboardService from './dashboard.service';

export const getStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const data = await dashboardService.getDashboardStats(
      startDate as string | undefined,
      endDate as string | undefined
    );
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ message: error.message || 'Failed to fetch dashboard statistics' });
  }
};
