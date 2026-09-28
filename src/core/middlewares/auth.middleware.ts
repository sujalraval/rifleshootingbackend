import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { JWT_SECRET } from '../config';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isFirstLogin: boolean;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  let decoded: any;
  try {
    decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }

  try {
    // Load the user on every request so deleted users and role changes take effect immediately
    const user = await prisma.user.findUnique({
      where: { id: decoded?.id },
      select: { id: true, email: true, role: true, isFirstLogin: true },
    });
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
