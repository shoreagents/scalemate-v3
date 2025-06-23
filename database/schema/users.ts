import { pgTable, bigserial, varchar, text, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';

// 👤 USERS TABLE - Registered user accounts
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  companyName: varchar('company_name', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  location: varchar('location', { length: 255 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  emailIdx: uniqueIndex('idx_email').on(table.email),
}));

// 🔐 ANONYMOUS_SESSIONS TABLE - Session management for anonymous users  
export const anonymousSessions = pgTable('anonymous_sessions', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  sessionId: varchar('session_id', { length: 100 }).notNull().unique(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  location: varchar('location', { length: 255 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  lastActivity: timestamp('last_activity').defaultNow(),
}, (table) => ({
  sessionIdIdx: uniqueIndex('idx_session_id').on(table.sessionId),
  expiresAtIdx: index('idx_expires_at').on(table.expiresAt),
}));

// Type exports for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AnonymousSession = typeof anonymousSessions.$inferSelect;
export type NewAnonymousSession = typeof anonymousSessions.$inferInsert; 