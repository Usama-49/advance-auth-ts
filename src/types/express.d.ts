import { JwtPayload } from 'jsonwebtoken';

// Extend the global Express namespace
declare global {
  namespace Express {
    interface Request {
      // Add the custom user property to Express's Request interface
      user?: JwtPayload | { userId: string; role: string };
    }
  }
}