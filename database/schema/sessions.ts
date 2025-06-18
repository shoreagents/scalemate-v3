import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').unique().notNull(),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrer: text('referrer'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  country: text('country'),
  device: text('device'),
  pageViews: integer('page_views').default(1),
  timeOnSite: integer('time_on_site'), // in seconds
  calculatorStarted: timestamp('calculator_started'),
  calculatorCompleted: timestamp('calculator_completed'),
  exitIntent: timestamp('exit_intent'),
  leadGenerated: timestamp('lead_generated'),
  email: text('email'),
  metadata: jsonb('metadata'), // Additional tracking data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert; 