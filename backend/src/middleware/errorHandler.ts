import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error: any) => error.message);
    res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      error: 'Invalid ID format'
    });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    res.status(400).json({
      error: `${field} already exists`
    });
    return;
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    error: `Route ${req.originalUrl} not found`
  });
};