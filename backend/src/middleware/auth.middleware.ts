import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import type { TokenPayload } from '../utils/jwt.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const protect = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'No token provided',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = decoded;
    next(); 
  } catch {
    res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'Token is invalid or expired',
    });
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to perform this action',
      });
      return;
    }
    next();
  };
};