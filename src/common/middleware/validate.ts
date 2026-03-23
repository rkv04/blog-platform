import type { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod'
import fs from 'node:fs';

import { ValidationError } from '../exceptions/HttpErrors.js';


export const validate = (schema: ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body ?? {},
      query: req.query ?? {},
      params: req.params ?? {},
      file: (req as any).file ?? {}
    });

    if (!result.success) {
      const error = new ValidationError(result.error);
      return next(error);
    }
    next();
  };
};