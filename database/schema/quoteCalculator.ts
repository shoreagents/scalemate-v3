import { pgTable, bigserial, varchar, text, timestamp, integer, decimal, boolean, index, uniqueIndex, json } from 'drizzle-orm/pg-core';
import { quoteCalculator } from './core';
import { roles, tasks, experienceLevels } from './masterData';

// 📊 QUOTE_CALCULATOR_BASIC_INFO - Step 1: Properties, team size, annual revenue
export const quoteCalculatorBasicInfo = pgTable('quote_calculator_basic_info', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorId: bigserial('quote_calculator_id', { mode: 'number' }).notNull().references(() => quoteCalculator.id, { onDelete: 'cascade' }),
  numberOfProperties: integer('number_of_properties'),
  currentTeamSize: integer('current_team_size'),
  annualRevenue: decimal('annual_revenue', { precision: 15, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueQuoteBasicInfo: uniqueIndex('unique_quote_basic_info').on(table.quoteCalculatorId),
}));

// 🔧 QUOTE_CALCULATOR_ROLES - Step 2: Selected roles and team counts
export const quoteCalculatorRoles = pgTable('quote_calculator_roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorId: bigserial('quote_calculator_id', { mode: 'number' }).notNull().references(() => quoteCalculator.id, { onDelete: 'cascade' }),
  roleId: bigserial('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  teamCount: integer('team_count').notNull().default(1),
  orderIndex: integer('order_index').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueQuoteRole: uniqueIndex('unique_quote_role').on(table.quoteCalculatorId, table.roleId),
  quoteCalculatorIdIdx: index('idx_quote_calculator_id').on(table.quoteCalculatorId),
  roleIdIdx: index('idx_role_id').on(table.roleId),
}));

// ✅ QUOTE_CALCULATOR_ROLE_TASKS - Step 3: Task assignments per role
export const quoteCalculatorRoleTasks = pgTable('quote_calculator_role_tasks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorRoleId: bigserial('quote_calculator_role_id', { mode: 'number' }).notNull().references(() => quoteCalculatorRoles.id, { onDelete: 'cascade' }),
  taskId: bigserial('task_id', { mode: 'number' }).notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  isSelected: boolean('is_selected').default(false),
  customTaskName: varchar('custom_task_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueRoleTask: uniqueIndex('unique_role_task').on(table.quoteCalculatorRoleId, table.taskId),
  quoteCalculatorRoleIdIdx: index('idx_quote_calculator_role_id').on(table.quoteCalculatorRoleId),
  taskIdIdx: index('idx_task_id').on(table.taskId),
}));

// 🎯 QUOTE_CALCULATOR_ROLE_EXPERIENCE - Step 4: Experience level distribution
export const quoteCalculatorRoleExperience = pgTable('quote_calculator_role_experience', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorRoleId: bigserial('quote_calculator_role_id', { mode: 'number' }).notNull().references(() => quoteCalculatorRoles.id, { onDelete: 'cascade' }),
  experienceLevelId: bigserial('experience_level_id', { mode: 'number' }).notNull().references(() => experienceLevels.id, { onDelete: 'cascade' }),
  teamCount: integer('team_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueRoleExperience: uniqueIndex('unique_role_experience').on(table.quoteCalculatorRoleId, table.experienceLevelId),
  quoteCalculatorRoleIdIdx: index('idx_quote_calculator_role_id').on(table.quoteCalculatorRoleId),
  experienceLevelIdIdx: index('idx_experience_level_id').on(table.experienceLevelId),
}));

// 💰 QUOTE_CALCULATOR_CALCULATIONS - Final cost summaries
export const quoteCalculatorCalculations = pgTable('quote_calculator_calculations', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorId: bigserial('quote_calculator_id', { mode: 'number' }).notNull().references(() => quoteCalculator.id, { onDelete: 'cascade' }),
  totalMonthlyCostUsd: decimal('total_monthly_cost_usd', { precision: 12, scale: 2 }),
  totalMonthlyCostPhp: decimal('total_monthly_cost_php', { precision: 12, scale: 2 }),
  totalMonthlySavingsUsd: decimal('total_monthly_savings_usd', { precision: 12, scale: 2 }),
  totalTeams: integer('total_teams'),
  totalRoles: integer('total_roles'),
  calculationTimestamp: timestamp('calculation_timestamp').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  uniqueQuoteCalculation: uniqueIndex('unique_quote_calculation').on(table.quoteCalculatorId),
  quoteCalculatorIdIdx: index('idx_quote_calculator_id').on(table.quoteCalculatorId),
}));

// 📊 QUOTE_CALCULATOR_ROLE_COSTS - Detailed cost breakdown per role/experience
export const quoteCalculatorRoleCosts = pgTable('quote_calculator_role_costs', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorCalculationId: bigserial('quote_calculator_calculation_id', { mode: 'number' }).notNull().references(() => quoteCalculatorCalculations.id, { onDelete: 'cascade' }),
  roleId: bigserial('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  experienceLevelId: bigserial('experience_level_id', { mode: 'number' }).notNull().references(() => experienceLevels.id, { onDelete: 'cascade' }),
  teamCount: integer('team_count').notNull(),
  monthlyCostPerTeamUsd: decimal('monthly_cost_per_team_usd', { precision: 10, scale: 2 }),
  monthlyCostPerTeamPhp: decimal('monthly_cost_per_team_php', { precision: 10, scale: 2 }),
  totalMonthlyCostUsd: decimal('total_monthly_cost_usd', { precision: 12, scale: 2 }),
  totalMonthlyCostPhp: decimal('total_monthly_cost_php', { precision: 12, scale: 2 }),
  usEquivalentCostUsd: decimal('us_equivalent_cost_usd', { precision: 12, scale: 2 }),
  monthlySavingsUsd: decimal('monthly_savings_usd', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  calculationIdIdx: index('idx_calculation_id').on(table.quoteCalculatorCalculationId),
  roleIdIdx: index('idx_role_id').on(table.roleId),
  experienceLevelIdIdx: index('idx_experience_level_id').on(table.experienceLevelId),
}));

// 📝 QUOTE_CALCULATOR_ACTIVITY_LOG - Audit trail of user progress
export const quoteCalculatorActivityLog = pgTable('quote_calculator_activity_log', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  quoteCalculatorId: bigserial('quote_calculator_id', { mode: 'number' }).notNull().references(() => quoteCalculator.id, { onDelete: 'cascade' }),
  stepNumber: integer('step_number'),
  action: varchar('action', { length: 100 }),
  previousData: json('previous_data'),
  newData: json('new_data'),
  userIp: varchar('user_ip', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  quoteCalculatorIdIdx: index('idx_quote_calculator_id').on(table.quoteCalculatorId),
  stepNumberIdx: index('idx_step_number').on(table.stepNumber),
  actionIdx: index('idx_action').on(table.action),
  createdAtIdx: index('idx_created_at').on(table.createdAt),
}));

// Type exports
export type QuoteCalculatorBasicInfo = typeof quoteCalculatorBasicInfo.$inferSelect;
export type NewQuoteCalculatorBasicInfo = typeof quoteCalculatorBasicInfo.$inferInsert;
export type QuoteCalculatorRoles = typeof quoteCalculatorRoles.$inferSelect;
export type NewQuoteCalculatorRoles = typeof quoteCalculatorRoles.$inferInsert;
export type QuoteCalculatorRoleTasks = typeof quoteCalculatorRoleTasks.$inferSelect;
export type NewQuoteCalculatorRoleTasks = typeof quoteCalculatorRoleTasks.$inferInsert;
export type QuoteCalculatorRoleExperience = typeof quoteCalculatorRoleExperience.$inferSelect;
export type NewQuoteCalculatorRoleExperience = typeof quoteCalculatorRoleExperience.$inferInsert;
export type QuoteCalculatorCalculations = typeof quoteCalculatorCalculations.$inferSelect;
export type NewQuoteCalculatorCalculations = typeof quoteCalculatorCalculations.$inferInsert;
export type QuoteCalculatorRoleCosts = typeof quoteCalculatorRoleCosts.$inferSelect;
export type NewQuoteCalculatorRoleCosts = typeof quoteCalculatorRoleCosts.$inferInsert;
export type QuoteCalculatorActivityLog = typeof quoteCalculatorActivityLog.$inferSelect;
export type NewQuoteCalculatorActivityLog = typeof quoteCalculatorActivityLog.$inferInsert; 