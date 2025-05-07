import { Request, Response, NextFunction } from 'express';

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement proper authentication logic
  // For now, just pass through
  next();
}; 