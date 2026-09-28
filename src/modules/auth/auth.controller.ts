import { Request, Response } from 'express';
import { getProfile, loginUser, updatePassword as updatePasswordService } from './auth.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Server error' });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getProfile(req.user!.id);
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const data = await updatePasswordService(req.user!.id, newPassword, currentPassword);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};
