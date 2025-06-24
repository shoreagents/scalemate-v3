import { pgTable, bigserial, varchar, text, timestamp, integer, index, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
import { users, anonymousSessions } from './users';

// Enums
export const quoteStatusEnum = pgEnum('quote_status', ['draft', 'in_progress', 'completed', 'expired']);

// 📋 QUOTE_CALCULATOR TABLE - Main quote entity with session tracking
export const quoteCalculator = pgTable('quote_calculator', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteId: varchar('quote_id', { length: 50 }).notNull().unique(),
  userId: bigserial('user_id', { mode: 'number' }).references(() => users.id, { onDelete: 'cascade' }),
  anonymousSessionId: bigserial('anonymous_session_id', { mode: 'number' }).references(() => anonymousSessions.id, { onDelete: 'cascade' }),
  status: quoteStatusEnum('status').default('draft'),
  currentStep: integer('current_step').default(1),
  location: varchar('location', { length: 255 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  expiresAt: timestamp('expires_at'),
}, (table) => ({
  quoteIdIdx: uniqueIndex('idx_quote_id').on(table.quoteId),
  userIdIdx: index('idx_user_id').on(table.userId),
  sessionIdIdx: index('idx_session_id').on(table.anonymousSessionId),
  statusIdx: index('idx_status').on(table.status),
  userStatusIdx: index('idx_quote_calculator_user_status').on(table.userId, table.status),
  sessionStatusIdx: index('idx_quote_calculator_session_status').on(table.anonymousSessionId, table.status),
  createdStatusIdx: index('idx_quote_calculator_created_status').on(table.createdAt, table.status),
}));

// Type exports
export type QuoteCalculator = typeof quoteCalculator.$inferSelect;
export type NewQuoteCalculator = typeof quoteCalculator.$inferInsert; 