import { Request, Response } from 'express';
import { loginUser, registerUser } from './auth.service';

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
