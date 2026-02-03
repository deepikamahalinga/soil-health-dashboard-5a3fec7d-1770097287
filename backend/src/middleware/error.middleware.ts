// types/error.ts
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public errors?: any[]
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// middleware/errorHandler.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { AppError } from '../types/error';

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    errors?: any[];
    stack?: string;
  };
}

export function errorHandler(
  err: Error | AppError,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Default to 500 server error
  let statusCode = 500;
  let errorMessage = 'Internal Server Error';
  let errorCode: string | undefined;
  let errors: any[] | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorMessage = err.message;
    errorCode = err.code;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    errorMessage = 'Validation Error';
    errors = [err.message];
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorMessage = 'Unauthorized';
  }

  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: errorMessage,
      ...(errorCode && { code: errorCode }),
      ...(errors && { errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(errorResponse);
}

// utils/errorUtils.ts
export const throwError = (
  statusCode: number,
  message: string,
  code?: string,
  errors?: any[]
) => {
  throw new AppError(statusCode, message, code, errors);
};

// Example usage in API route
// pages/api/example.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { errorHandler } from '../../middleware/errorHandler';
import { throwError } from '../../utils/errorUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Your API logic here
    if (!req.body.requiredField) {
      throwError(400, 'Required field missing', 'VALIDATION_ERROR');
    }

    if (!req.headers.authorization) {
      throwError(401, 'Unauthorized access', 'UNAUTHORIZED');
    }

    // Resource not found example
    throwError(404, 'Resource not found', 'NOT_FOUND');

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    errorHandler(error as Error, req, res);
  }
}

// Helper function to wrap API handlers with error handling
export function withErrorHandler(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error as Error, req, res);
    }
  };
}

// Example of using the wrapper
// pages/api/protected.ts
export default withErrorHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Your API logic here
});