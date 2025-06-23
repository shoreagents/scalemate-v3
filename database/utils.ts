import { db } from './index';
import { 
  users, 
  anonymousSessions, 
  quoteCalculator, 
  roles, 
  tasks, 
  experienceLevels,
  eq, 
  desc, 
  and,
  type User,
  type NewUser,
  type QuoteCalculator,
  type NewQuoteCalculator
} from './schema';

// Example: User operations with type safety
export async function createUser(userData: NewUser) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

// Example: Quote calculator operations
export async function createQuoteCalculator(quoteData: NewQuoteCalculator) {
  const [quote] = await db.insert(quoteCalculator).values(quoteData).returning();
  return quote;
}

export async function getQuotesByUser(userId: number) {
  return await db
    .select()
    .from(quoteCalculator)
    .where(eq(quoteCalculator.userId, userId))
    .orderBy(desc(quoteCalculator.createdAt));
}

// Example: Complex query with joins
export async function getQuoteWithDetails(quoteId: string) {
  return await db
    .select({
      quote: quoteCalculator,
      user: users,
    })
    .from(quoteCalculator)
    .leftJoin(users, eq(quoteCalculator.userId, users.id))
    .where(eq(quoteCalculator.quoteId, quoteId));
}

// Example: Raw SQL queries if needed
export async function executeRawQuery(query: string, params?: any[]) {
  // You can use db to execute raw SQL queries
  // Example: await db.execute(sql`SELECT * FROM users WHERE id = ${userId}`);
  console.log('Raw query:', query, params);
}

// Test database connection
export async function testConnection() {
  try {
    // Test with a simple query
    const result = await db.select().from(users).limit(1);
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
} 