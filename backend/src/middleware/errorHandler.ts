import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(
    {
      method: req.method,
      path: req.originalUrl,
      statusCode,
      error: err.stack,
    },
    `Request Error: ${message}`
  );

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack, details: err.details }),
    },
    timestamp: new Date().toISOString(),
  });
};
