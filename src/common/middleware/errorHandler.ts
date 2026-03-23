import fs from 'node:fs/promises';
import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import { HttpError, ErrorCode, ValidationError } from '../exceptions/HttpErrors.js';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({ error: err.errorCode, details: err.errors });
  }

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ error: err.errorCode });
  }

  console.error('[Unexpected Error]:', err); // log
  res.status(500).json({ error: ErrorCode.INTERNAL_SERVER_ERROR });
};