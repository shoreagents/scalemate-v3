import { pgTable, text, timestamp, uuid, jsonb, integer, decimal } from 'drizzle-orm/pg-core';

export const calculations = pgTable('calculations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id'),
  email: text('email'),
  calculationType: text('calculation_type').notNull(), // 'offshore', 'onshore', 'hybrid'
  inputData: jsonb('input_data').notNull(), // All form inputs
  results: jsonb('results').notNull(), // Calculation results
  recommendations: jsonb('recommendations'), // AI recommendations
  monthlySavings: decimal('monthly_savings', { precision: 10, scale: 2 }),
  yearlySavings: decimal('yearly_savings', { precision: 10, scale: 2 }),
  roiPercentage: decimal('roi_percentage', { precision: 5, scale: 2 }),
  paybackMonths: integer('payback_months'),
  completed: text('completed').default('false'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Calculation = typeof calculations.$inferSelect;
export type NewCalculation = typeof calculations.$inferInsert; 