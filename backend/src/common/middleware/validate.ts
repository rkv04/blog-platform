import type { NextFunction, Request, Response } from 'express';
import { ZodObject } from 'zod'

import { ValidationError } from '../exceptions/HttpErrors.js';


export function validate(schema: ZodObject, source: 'body' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    req[source] = result.data;
    next();
  };
}