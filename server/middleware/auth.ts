import { Request, Response, NextFunction } from 'express';

/**
 * Express middleware to validate that the user is authenticated
 */
export function validateAuthenticatedUser(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  
  return res.status(401).json({
    error: 'Unauthorized',
    message: 'You must be logged in to access this resource',
  });
}

/**
 * Express middleware to validate that the user ID in the URL matches the authenticated user's ID
 * or that the user is an admin
 */
export function validateUserAccess(req: Request, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // Check if the user is trying to access their own data
  const requestedUserId = parseInt(req.params.userId || req.params.id);
  if (isNaN(requestedUserId)) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Invalid user ID',
    });
  }
  
  // User can access their own data (or is admin, if we add that role later)
  if (req.user.id === requestedUserId) {
    return next();
  }
  
  return res.status(403).json({
    error: 'Forbidden',
    message: 'You do not have permission to access this resource',
  });
}