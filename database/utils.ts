import { db } from './index';
import { leads } from './schema/leads';
import { calculations } from './schema/calculations';
import { sessions } from './schema/sessions';
import { users } from './schema/users';
import { eq, desc, and } from 'drizzle-orm';

// Lead Operations
export async function createLead(leadData: {
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  role?: string;
  portfolioSize?: number;
  currentStaff?: number;
  monthlyRevenue?: number;
  interestedServices?: any;
  calculationData?: any;
  source?: string;
}) {
  const [lead] = await db.insert(leads).values(leadData).returning();
  return lead;
}

export async function getLeadByEmail(email: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.email, email));
  return lead;
}

export async function updateLeadStatus(leadId: string, status: string, notes?: string) {
  const [lead] = await db
    .update(leads)
    .set({ status, notes, updatedAt: new Date() })
    .where(eq(leads.id, leadId))
    .returning();
  return lead;
}

// Calculation Operations
export async function saveCalculation(calculationData: {
  sessionId?: string;
  email?: string;
  calculationType: string;
  inputData: any;
  results: any;
  recommendations?: any;
  monthlySavings?: string;
  yearlySavings?: string;
  roiPercentage?: string;
  paybackMonths?: number;
}) {
  const [calculation] = await db.insert(calculations).values(calculationData).returning();
  return calculation;
}

export async function getCalculationsByEmail(email: string) {
  return await db
    .select()
    .from(calculations)
    .where(eq(calculations.email, email))
    .orderBy(desc(calculations.createdAt));
}

export async function getCalculationBySession(sessionId: string) {
  const [calculation] = await db
    .select()
    .from(calculations)
    .where(eq(calculations.sessionId, sessionId))
    .orderBy(desc(calculations.createdAt));
  return calculation;
}

// Session Operations
export async function createSession(sessionData: {
  sessionId: string;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  device?: string;
}) {
  const [session] = await db.insert(sessions).values(sessionData).returning();
  return session;
}

export async function updateSession(sessionId: string, updates: {
  pageViews?: number;
  timeOnSite?: number;
  calculatorStarted?: Date;
  calculatorCompleted?: Date;
  exitIntent?: Date;
  leadGenerated?: Date;
  email?: string;
  metadata?: any;
}) {
  const [session] = await db
    .update(sessions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(sessions.sessionId, sessionId))
    .returning();
  return session;
}

export async function getSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.sessionId, sessionId));
  return session;
}

// User Operations
export async function createUser(userData: {
  email: string;
  name?: string;
  company?: string;
  role?: string;
  phone?: string;
}) {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

// Analytics Functions
export async function getRecentLeads(limit: number = 10) {
  return await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

export async function getCalculationStats() {
  const totalCalculations = await db.select().from(calculations);
  const completedCalculations = await db
    .select()
    .from(calculations)
    .where(eq(calculations.completed, 'true'));
    
  return {
    total: totalCalculations.length,
    completed: completedCalculations.length,
    completionRate: totalCalculations.length > 0 ? (completedCalculations.length / totalCalculations.length * 100) : 0
  };
} 