// types/health.ts
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency: number;
  };
  memory: {
    used: number;
    total: number;
    percentUsed: number;
  };
  version: string;
}

// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { HealthCheckResponse } from '@/types/health';
import { Pool } from 'pg';

// Database connection pool (initialize this in a separate db config file)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
});

async function checkDatabase(): Promise<{ isHealthy: boolean; latency: number }> {
  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { isHealthy: true, latency: Date.now() - start };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database health check failed:', error);
    return { isHealthy: false, latency: Date.now() - start };
  }
}

function getMemoryUsage() {
  const used = process.memoryUsage().heapUsed;
  const total = process.memoryUsage().heapTotal;
  return {
    used: Math.round(used / 1024 / 1024), // MB
    total: Math.round(total / 1024 / 1024), // MB
    percentUsed: Math.round((used / total) * 100),
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckResponse>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    // Check database health
    const dbHealth = await checkDatabase();
    const memory = getMemoryUsage();

    const healthCheck: HealthCheckResponse = {
      status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbHealth.isHealthy ? 'connected' : 'disconnected',
        latency: dbHealth.latency,
      },
      memory: {
        used: memory.used,
        total: memory.total,
        percentUsed: memory.percentUsed,
      },
      version: process.env.APP_VERSION || '1.0.0',
    };

    res.status(dbHealth.isHealthy ? 200 : 503).json(healthCheck);
  } catch (error) {
    console.error('Health check failed:', error);
    
    const unhealthyResponse: HealthCheckResponse = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: 'disconnected',
        latency: -1,
      },
      memory: getMemoryUsage(),
      version: process.env.APP_VERSION || '1.0.0',
    };

    res.status(503).json(unhealthyResponse);
  }
}

// Optional: Add rate limiting middleware
export const config = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};