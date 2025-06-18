# ScaleMate Database Setup

This directory contains the database schema and configuration for the ScaleMate application using Drizzle ORM with PostgreSQL on Railway.

## 🗂️ Structure

```
database/
├── schema/              # Database table definitions
│   ├── index.ts        # Schema exports
│   ├── users.ts        # User accounts and authentication
│   ├── leads.ts        # Lead management and tracking
│   ├── calculations.ts # Calculator results and data
│   └── sessions.ts     # Session tracking and analytics
├── migrations/         # Auto-generated migration files
├── index.ts           # Database connection and setup
├── utils.ts           # Database utility functions
└── README.md          # This file
```

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install drizzle-orm drizzle-kit postgres
npm install -D @types/pg
```

### 2. Environment Variables

Add to your `.env.local`:

```env
DATABASE_URL="postgresql://username:password@host:port/database?ssl=require"
```

### 3. Generate Migrations

```bash
npm run db:generate
```

### 4. Push to Database

```bash
npm run db:push
```

### 5. Run Migrations (Production)

```bash
npm run db:migrate
```

## 📋 Database Tables

### Users Table
- Stores user account information
- Fields: id, email, name, company, role, phone, isActive
- Used for authentication and user management

### Leads Table
- Stores lead information from the calculator
- Fields: email, name, phone, company, portfolio data, calculation results
- Used for lead management and CRM integration

### Calculations Table
- Stores calculator results and session data
- Fields: input data, results, recommendations, ROI metrics
- Used for analytics and user history

### Sessions Table
- Stores user session and analytics data
- Fields: session ID, user agent, UTM parameters, tracking events
- Used for analytics and user behavior tracking

## 🔧 Railway Integration

### Automatic Deployments
- Connect your GitHub repository to Railway
- Railway will automatically deploy on pushes to main branch
- Database migrations run automatically on deployment

### Environment Setup
1. Create a new Railway project
2. Add PostgreSQL database service
3. Connect your GitHub repository
4. Set environment variables in Railway dashboard

### Migration Strategy
- Migrations are generated automatically from schema changes
- Push migrations to GitHub for automatic deployment
- Railway runs migrations on each deployment

## 💡 Usage Examples

### Creating a Lead
```typescript
import { createLead } from '@/database/utils';

const lead = await createLead({
  email: 'user@example.com',
  name: 'John Doe',
  company: 'ABC Property Management',
  portfolioSize: 500,
  calculationData: calculationResults
});
```

### Saving Calculator Results
```typescript
import { saveCalculation } from '@/database/utils';

const calculation = await saveCalculation({
  sessionId: 'sess_123',
  calculationType: 'offshore',
  inputData: formData,
  results: calculationResults,
  monthlySavings: '5000.00'
});
```

### Session Tracking
```typescript
import { createSession, updateSession } from '@/database/utils';

// Create session
const session = await createSession({
  sessionId: 'sess_123',
  userAgent: req.headers['user-agent'],
  utmSource: 'google'
});

// Update session
await updateSession('sess_123', {
  calculatorStarted: new Date(),
  pageViews: 3
});
```

## 🛠️ NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:drop": "drizzle-kit drop"
  }
}
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit database credentials
2. **SSL**: Always use SSL in production (Railway enforces this)
3. **Connection Limits**: Set appropriate connection limits for Railway
4. **Backups**: Railway provides automatic backups
5. **Access Control**: Use Railway's access control features

## 📊 Analytics & Monitoring

- Use Railway's built-in monitoring
- Track query performance in Railway dashboard
- Monitor connection usage and limits
- Set up alerts for database errors

## 🚨 Troubleshooting

### Common Issues

1. **Connection Errors**: Check DATABASE_URL format
2. **Migration Failures**: Ensure schema syntax is correct
3. **SSL Issues**: Verify SSL settings for production
4. **Type Errors**: Install `@types/pg` for TypeScript support

### Debug Commands

```bash
# Check database connection
npm run db:studio

# Validate schema
npm run db:generate

# Reset database (development only)
npm run db:drop
```

## 📚 Documentation Links

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Railway Documentation](https://docs.railway.app/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 