import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.issues) || Array.isArray(error?.errors)) {
        const issues = error.errors || error.issues || [];
        res.status(400).json({
          error: 'Validation failed',
          details: issues.map((err: any) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error instanceof ZodError || error?.name === 'ZodError' || Array.isArray(error?.issues) || Array.isArray(error?.errors)) {
        const issues = error.errors || error.issues || [];
        res.status(400).json({
          error: 'Query validation failed',
          details: issues.map((err: any) => ({
            field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || ''),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
}
