import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if a user is authenticated
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  return res.status(401).json({ message: 'Authentication required' });
}