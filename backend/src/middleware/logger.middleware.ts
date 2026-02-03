// middleware/logger.ts
import { NextApiRequest, NextApiResponse } from 'next';
import pino from 'pino';
import { v4 as uuidv4 } from 'uuid';

// Define custom request type with tracking fields
interface EnhancedRequest extends NextApiRequest {
  id?: string;
  startTime?: number;
}

// Configure logger based on environment
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: process.env.NODE_ENV !== 'production',
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
    },
  },
});

// Define log entry type
interface LogEntry {
  id: string;
  method: string;
  url: string;
  query: object;
  body?: object;
  statusCode?: number;
  error?: Error;
  duration?: number;
  userAgent?: string;
  ip?: string;
}

export function withLogging(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: EnhancedRequest, res: NextApiResponse): Promise<void> => {
    // Assign request ID and start time
    req.id = uuidv4();
    req.startTime = Date.now();

    // Prepare base log entry
    const logEntry: LogEntry = {
      id: req.id,
      method: req.method || 'UNKNOWN',
      url: req.url || '',
      query: req.query,
      body: req.body,
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] as string || req.socket.remoteAddress,
    };

    // Log request
    logger.info({ 
      msg: 'Incoming request',
      ...logEntry 
    });

    try {
      // Execute handler
      await handler(req, res);

      // Calculate duration
      const duration = Date.now() - req.startTime;

      // Log successful response
      logger.info({
        msg: 'Request completed',
        ...logEntry,
        statusCode: res.statusCode,
        duration,
      });

    } catch (error) {
      // Calculate duration for error case
      const duration = Date.now() - req.startTime;

      // Log error
      logger.error({
        msg: 'Request failed',
        ...logEntry,
        statusCode: res.statusCode,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        duration,
      });

      // Re-throw error for error handling middleware
      throw error;
    }
  };
}

// Usage example in API route
export default withLogging(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Your API route logic here
});