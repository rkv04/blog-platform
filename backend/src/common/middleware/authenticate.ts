import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { ErrorCode, ForbiddenError, UnauthorizedError } from '../exceptions/HttpErrors.js';
import { verifyAccessToken } from '../utils/token.utils.js';


declare global {
  namespace Express {
    interface Request {
      user: { id: number; role: string }; 
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError();
    }
    req.user = verifyAccessToken(authHeader.slice(7));
    next();
  }
  catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedError(ErrorCode.TOKEN_EXPIRED));
    }
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedError('INVALID_TOKEN'));
    }
    next(err);
  }
};

export const optionalAuthenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      req.user = verifyAccessToken(authHeader.slice(7));
    }
  } catch {
    // intentionally ignored
  }
  next();
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (req.user.role !== 'admin') {
    return next(new ForbiddenError());
  }
  next();
}