// types/auth.ts
export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends NextApiRequest {
  user?: UserPayload;
}

// middleware/auth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { NextHandler } from 'next-connect';
import jwt from 'jsonwebtoken';
import { UserPayload, AuthenticatedRequest } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Always use env variable in production

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: NextHandler
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid authorization header'
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized: No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
      req.user = decoded;
      return next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          error: 'Unauthorized: Token expired'
        });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          error: 'Unauthorized: Invalid token'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
};

// Optional: Higher-order function to protect specific routes
export const withAuth = (
  handler: (
    req: AuthenticatedRequest,
    res: NextApiResponse
  ) => Promise<void> | void
) => {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    try {
      await authMiddleware(req, res, () => handler(req, res));
    } catch (error) {
      console.error('Auth Handler Error:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
};

// Usage example in API route:
// pages/api/protected-route.ts
import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '../../middleware/auth';

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  // Access authenticated user
  const user = req.user;
  
  res.status(200).json({
    message: 'Protected route',
    user
  });
};

export default withAuth(handler);