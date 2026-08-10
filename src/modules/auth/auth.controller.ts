import { Request, Response } from 'express';
import { loginUser, registerUser, updatePassword as updatePasswordService } from './auth.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(401).json({ message: error.message || 'Server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const data = await registerUser(name, email, password);
    res.status(201).json({ message: 'User registered successfully', ...data });
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = (decoded as any).id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const data = await updatePasswordService(userId, newPassword);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Server error' });
  }
};
