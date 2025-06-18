import { pgTable, text, timestamp, uuid, jsonb, integer } from 'drizzle-orm/pg-core';

export const leads = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  phone: text('phone'),
  company: text('company'),
  role: text('role'),
  portfolioSize: integer('portfolio_size'),
  currentStaff: integer('current_staff'),
  monthlyRevenue: integer('monthly_revenue'),
  interestedServices: jsonb('interested_services'),
  calculationData: jsonb('calculation_data'),
  source: text('source').default('calculator'),
  status: text('status').default('new'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert; 