import { pgTable, bigserial, varchar, text, timestamp, integer, decimal, boolean, index, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const complexityLevelEnum = pgEnum('complexity_level', ['low', 'medium', 'high']);

// 🔧 ROLES TABLE - Available roles (Frontend, Backend, DevOps, etc.)
export const roles = pgTable('roles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }),
  salaryRangeMin: decimal('salary_range_min', { precision: 10, scale: 2 }),
  salaryRangeMax: decimal('salary_range_max', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('idx_name').on(table.name),
  categoryIdx: index('idx_category').on(table.category),
  isActiveIdx: index('idx_is_active').on(table.isActive),
  categoryActiveIdx: index('idx_roles_category_active').on(table.category, table.isActive),
}));

// ✅ TASKS TABLE - Available tasks per role
export const tasks = pgTable('tasks', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  roleId: bigserial('role_id', { mode: 'number' }).notNull().references(() => roles.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  complexityLevel: complexityLevelEnum('complexity_level').default('medium'),
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  roleIdIdx: index('idx_role_id').on(table.roleId),
  nameIdx: index('idx_name').on(table.name),
  isActiveIdx: index('idx_is_active').on(table.isActive),
  isDefaultIdx: index('idx_is_default').on(table.isDefault),
  roleActiveIdx: index('idx_tasks_role_active').on(table.roleId, table.isActive),
}));

// 📈 EXPERIENCE_LEVELS TABLE - Senior, Mid, Entry levels
export const experienceLevels = pgTable('experience_levels', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  yearsMin: integer('years_min'),
  yearsMax: integer('years_max'),
  salaryMultiplier: decimal('salary_multiplier', { precision: 3, scale: 2 }).default('1.00'),
  orderIndex: integer('order_index').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  nameIdx: index('idx_name').on(table.name),
  orderIndexIdx: index('idx_order_index').on(table.orderIndex),
  isActiveIdx: index('idx_is_active').on(table.isActive),
  orderActiveIdx: index('idx_experience_levels_order_active').on(table.orderIndex, table.isActive),
}));

// Type exports
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type ExperienceLevel = typeof experienceLevels.$inferSelect;
export type NewExperienceLevel = typeof experienceLevels.$inferInsert; 