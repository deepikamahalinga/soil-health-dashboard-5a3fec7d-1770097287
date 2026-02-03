import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { errorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { cors } from '@/lib/cors';
import { validateRequest } from '@/lib/validate-request';
import { config } from '@/config';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  API_RATE_LIMIT: z.string(),
  API_RATE_LIMIT_WINDOW: z.string()
});

// Validate environment variables
const env = envSchema.parse(process.env);

// Initialize services
const initServices = async () => {
  try {
    await prisma.$connect();
    await redis.connect();
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
};

// API middleware configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    },
    externalResolver: true
  }
};

// Base API handler
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Apply CORS
    await cors(req, res);

    // Apply rate limiting
    await rateLimit(req, res);

    // Validate request
    await validateRequest(req);

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Health check endpoint
    if (req.url === '/api/health') {
      return res.status(200).json({ status: 'ok' });
    }

    // Handle route
    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    return errorHandler(error, req, res);
  }
}

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  
  try {
    await prisma.$disconnect();
    await redis.disconnect();
    logger.info('Cleanup completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Initialize application
initServices().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});