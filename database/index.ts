import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from './schema/users';
import { leads } from './schema/leads';
import { calculations } from './schema/calculations';
import { sessions } from './schema/sessions';

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
export const db = drizzle(connection, { 
  schema: { users, leads, calculations, sessions } 
});

// Export all schema for easy access
export { users, leads, calculations, sessions }; 