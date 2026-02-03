// src/pages/api/[...slug].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';
import * as Sentry from '@sentry/nextjs';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { z } from 'zod';

// Import route handlers
import { handleSoilRecordsRoute } from '@/lib/api/routes/soilRecords';

// Import validation schemas
import { locationQuerySchema } from '@/lib/validation/schemas';

// Import configuration
import { config } from '@/lib/config';

// Initialize services
const prisma = new PrismaClient();
const redis = createClient({
  url: config.REDIS_URL,
});

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Initialize error tracking
Sentry.init({
  dsn: config.SENTRY_DSN,
  environment: config.NODE_ENV,
});

// API route handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply CORS
  await cors()(req, res);

  // Apply rate limiting
  await limiter(req, res);

  try {
    // Health check route
    if (req.url === '/api/health') {
      return res.status(200).json({ status: 'ok' });
    }

    // Handle soil records route
    if (req.url?.startsWith('/api/soil-records')) {
      // Validate query parameters
      const queryValidation = locationQuerySchema.safeParse(req.query);
      if (!queryValidation.success) {
        return res.status(400).json({ 
          error: 'Invalid query parameters',
          details: queryValidation.error 
        });
      }

      return await handleSoilRecordsRoute(req, res, { 
        prisma,
        redis
      });
    }

    // 404 for unmatched routes
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    // Log error to Sentry
    Sentry.captureException(error);

    // Return error response
    return res.status(500).json({ 
      error: 'Internal server error',
      requestId: res.getHeader('x-request-id')
    });
  }
}

// Configuration options
export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};