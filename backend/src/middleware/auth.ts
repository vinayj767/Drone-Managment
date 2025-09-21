import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const error: AppError = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      const error: AppError = new Error('Invalid token. User not found.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      const authError: AppError = new Error('Invalid token.');
      authError.statusCode = 401;
      authError.isOperational = true;
      next(authError);
    } else if (error.name === 'TokenExpiredError') {
      const authError: AppError = new Error('Token expired.');
      authError.statusCode = 401;
      authError.isOperational = true;
      next(authError);
    } else {
      next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const error: AppError = new Error('Access denied. User not authenticated.');
      error.statusCode = 401;
      error.isOperational = true;
      throw error;
    }

    if (!roles.includes(req.user.role)) {
      const error: AppError = new Error('Access denied. Insufficient permissions.');
      error.statusCode = 403;
      error.isOperational = true;
      throw error;
    }

    next();
  };
};