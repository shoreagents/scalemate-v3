# 🗄️ ScaleMate Database

## 📋 Overview

This database setup uses **Drizzle ORM** with **TypeScript schemas** for a better development experience with full type safety, auto-completion, and compile-time error checking.

## 🏗️ Architecture

### **Schema Files** (`database/schema/`)
- `users.ts` - User accounts and anonymous sessions
- `core.ts` - Main quote calculator tables
- `masterData.ts` - Roles, tasks, and experience levels
- `quoteCalculator.ts` - Quote calculator step data and calculations
- `index.ts` - Exports all schemas and utilities

### **Migration Files** (`database/migrations/`)
- Contains SQL migration files for deployment
- Generated from TypeScript schemas using `drizzle-kit`

## 🚀 Quick Start

### **Development Commands**

```bash
# Generate new migrations from schema changes
npm run db:generate

# Push schema changes directly to database (development only)
npm run db:push

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio (database GUI)
npm run db:studio

# Drop all tables (careful!)
npm run db:drop
```

### **Using the Database in Code**

```typescript
import { db, users, quoteCalculator, eq } from '@/database';

// Type-safe insertions
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe'
}).returning();

// Type-safe queries
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// Complex joins with full type safety
const quotesWithUsers = await db.select({
  quote: quoteCalculator,
  user: users
})
.from(quoteCalculator)
.leftJoin(users, eq(quoteCalculator.userId, users.id));
```

## 🔧 Schema Development Workflow

### **1. Make Schema Changes**
Edit files in `database/schema/` to modify your database structure.

### **2. Generate Migration**
```bash
npm run db:generate
```
This creates a new SQL migration file in `database/migrations/`.

### **3. Review Migration**
Check the generated SQL file to ensure it matches your intentions.

### **4. Apply Migration**
```bash
# Development
npm run db:push

# Production (Railway)
npm run db:migrate
```

## 📊 Database Tables

### **Core Tables**
- `users` - Registered user accounts
- `anonymous_sessions` - Anonymous user sessions
- `quote_calculator` - Main quote entities

### **Master Data**
- `roles` - Available roles (Property Manager, etc.)
- `tasks` - Tasks associated with each role
- `experience_levels` - Entry, Mid, Senior levels

### **Quote Calculator Data**
- `quote_calculator_basic_info` - Step 1: Portfolio info
- `quote_calculator_roles` - Step 2: Selected roles
- `quote_calculator_role_tasks` - Step 3: Task assignments
- `quote_calculator_role_experience` - Step 4: Experience distribution
- `quote_calculator_calculations` - Final calculations
- `quote_calculator_role_costs` - Detailed cost breakdowns
- `quote_calculator_activity_log` - Audit trail

## 🌐 Railway Deployment

### **Environment Variables**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
```

### **Migration on Railway**
Railway will automatically run migrations on deployment if you have a build script that includes:
```bash
npm run db:migrate
```

## 🔒 Type Safety Benefits

### **Compile-Time Checks**
- ✅ Column names are validated at compile time
- ✅ Data types are enforced
- ✅ Foreign key relationships are typed
- ✅ Query results are fully typed

### **IDE Support**
- 🔍 Auto-completion for table and column names
- 📝 Inline documentation for schema fields
- 🐛 Immediate error highlighting for invalid queries
- 🔄 Automatic refactoring when schema changes

## 📚 Example Operations

### **User Management**
```typescript
import { createUser, getUserByEmail } from '@/database/utils';

// Create user with type safety
const user = await createUser({
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  companyName: 'ACME Corp'
});

// Get user with return type inference
const foundUser = await getUserByEmail('john@example.com');
```

### **Quote Calculator**
```typescript
import { db, quoteCalculator, users, eq } from '@/database';

// Create new quote
const quote = await db.insert(quoteCalculator).values({
  quoteId: 'QTE-2025-001',
  userId: user.id,
  status: 'draft',
  currentStep: 1
}).returning();

// Get quotes with user details
const quotesWithUsers = await db.select()
  .from(quoteCalculator)
  .leftJoin(users, eq(quoteCalculator.userId, users.id))
  .where(eq(quoteCalculator.status, 'completed'));
```

## 🛠️ Utilities

### **Database Connection**
```typescript
import { db, connection } from '@/database';

// Use db for queries
const results = await db.select().from(users);

// Close connection when needed
await connection.end();
```

### **Testing**
```typescript
import { testConnection } from '@/database/utils';

// Test database connectivity
const isConnected = await testConnection();
```

## 📖 Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Railway PostgreSQL Guide](https://docs.railway.app/databases/postgresql) 