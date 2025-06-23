import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Railway Database Connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create the connection
export const connection = postgres(connectionString, {
  ssl: process.env.NODE_ENV === 'production' ? 'require' : false,
  max: 1, // Railway free tier connection limit
});

// Create the database instance with schema
export const db = drizzle(connection, { schema });

// Export all schemas for easy access
export * from './schema';

// Export connection for migration scripts
export default db; 