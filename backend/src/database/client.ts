// lib/db/prisma.ts
import { PrismaClient } from '@prisma/client';
import { Logger } from './logger'; // Implement your preferred logger

// Custom Prisma client type with additional methods
export interface EnhancedPrismaClient extends PrismaClient {
  isConnected: boolean;
  healthCheck(): Promise<boolean>;
}

// Connection configuration
const CONNECTION_CONFIG = {
  pool: {
    min: 2,
    max: 10,
    idle: 10000, // ms
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

// Singleton instance
let prismaInstance: EnhancedPrismaClient | null = null;

/**
 * Creates an enhanced Prisma client instance with additional functionality
 */
function createPrismaClient(): EnhancedPrismaClient {
  const client = new PrismaClient(CONNECTION_CONFIG) as EnhancedPrismaClient;
  
  // Add connection state tracking
  client.isConnected = false;

  // Add health check method
  client.healthCheck = async () => {
    try {
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      Logger.error('Database health check failed:', error);
      return false;
    }
  };

  // Add connection lifecycle hooks
  client.$on('beforeExit', async () => {
    await client.$disconnect();
    client.isConnected = false;
    Logger.info('Database connection closed');
  });

  // Query logging in development
  if (process.env.NODE_ENV === 'development') {
    client.$use(async (params, next) => {
      const start = Date.now();
      const result = await next(params);
      const end = Date.now();
      Logger.debug(`Query ${params.model}.${params.action} took ${end - start}ms`);
      return result;
    });
  }

  return client;
}

/**
 * Initialize database connection
 */
export async function initializeDatabase(): Promise<EnhancedPrismaClient> {
  try {
    if (!prismaInstance) {
      prismaInstance = createPrismaClient();
      await prismaInstance.$connect();
      prismaInstance.isConnected = true;
      Logger.info('Database connection established');
    }
    return prismaInstance;
  } catch (error) {
    Logger.error('Failed to initialize database:', error);
    throw new Error('Database initialization failed');
  }
}

/**
 * Get the Prisma client instance
 */
export function getPrismaClient(): EnhancedPrismaClient {
  if (!prismaInstance) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return prismaInstance;
}

/**
 * Gracefully shutdown database connection
 */
export async function disconnectDatabase(): Promise<void> {
  if (prismaInstance) {
    await prismaInstance.$disconnect();
    prismaInstance.isConnected = false;
    prismaInstance = null;
    Logger.info('Database connection terminated');
  }
}

/**
 * Transaction helper
 */
export async function withTransaction<T>(
  callback: (tx: EnhancedPrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  try {
    return await client.$transaction(async (tx) => {
      return await callback(tx as EnhancedPrismaClient);
    });
  } catch (error) {
    Logger.error('Transaction failed:', error);
    throw error;
  }
}

// Error types
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: unknown) {
    super(message, originalError);
    this.name = 'ConnectionError';
  }
}

// Export singleton instance
export const prisma = getPrismaClient();

// Handle process termination
process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});