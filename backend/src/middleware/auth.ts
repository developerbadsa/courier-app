import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  phone: string;
  email?: string | null;
  roles: string[];
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export const authenticateJwt = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Authentication token required' },
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.accessSecret) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'User account is inactive or not found' },
      });
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      roles: user.roles.map((r) => r.role.name),
    };

    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: { code: 401, message: 'Invalid or expired token', details: err.message },
    });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 401, message: 'Unauthorized' },
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: { code: 403, message: 'Forbidden: Insufficient permissions' },
      });
    }

    next();
  };
};
