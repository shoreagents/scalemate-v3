// Roles Data Service - Dynamic location-based roles and salary data
import { 
  MultiCountryRoleSalaryData, 
  RoleCategory, 
  CountrySalaryData,
  RoleId,
  Task,
  TaskComplexity,
  EnhancedRole,
  ExperienceLevel
} from '@/types';
import { LocationData, ManualLocation } from '@/types/location';
import { getDirectExchangeRate, getCurrencyByCountry } from './currency';

// Enhanced multi-country salary data with detailed breakdowns - Updated with 2025 market rates
const SALARY_DATA = {
  assistantPropertyManager: {
    Australia: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    "United States": {
      entry: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      moderate: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      experienced: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 }
    },
    Canada: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    "United Kingdom": {
      entry: { base: 32000, total: 41600, benefits: 6400, taxes: 9600 },
      moderate: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      experienced: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 }
    },
    "New Zealand": {
      entry: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      moderate: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      experienced: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 }
    },
    Singapore: {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 70000, total: 91000, benefits: 14000, taxes: 21000 }
    },
    Philippines: {
      entry: { base: 300000, total: 390000, benefits: 60000, taxes: 90000 },
      moderate: { base: 420000, total: 546000, benefits: 84000, taxes: 126000 },
      experienced: { base: 600000, total: 780000, benefits: 120000, taxes: 180000 }
    }
  },
  leasingCoordinator: {
    Australia: {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 95000, total: 123500, benefits: 19000, taxes: 28500 }
    },
    "United States": {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    Canada: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 82000, total: 106600, benefits: 16400, taxes: 24600 }
    },
    "United Kingdom": {
      entry: { base: 38000, total: 49400, benefits: 7600, taxes: 11400 },
      moderate: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      experienced: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 }
    },
    "New Zealand": {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    Singapore: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    Philippines: {
      entry: { base: 350000, total: 455000, benefits: 70000, taxes: 105000 },
      moderate: { base: 480000, total: 624000, benefits: 96000, taxes: 144000 },
      experienced: { base: 720000, total: 936000, benefits: 144000, taxes: 216000 }
    }
  },
  marketingSpecialist: {
    Australia: {
      entry: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      moderate: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 },
      experienced: { base: 105000, total: 136500, benefits: 21000, taxes: 31500 }
    },
    "United States": {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 95000, total: 123500, benefits: 19000, taxes: 28500 }
    },
    Canada: {
      entry: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      moderate: { base: 72000, total: 93600, benefits: 14400, taxes: 21600 },
      experienced: { base: 92000, total: 119600, benefits: 18400, taxes: 27600 }
    },
    "United Kingdom": {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 70000, total: 91000, benefits: 14000, taxes: 21000 }
    },
    "New Zealand": {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 98000, total: 127400, benefits: 19600, taxes: 29400 }
    },
    Singapore: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    Philippines: {
      entry: { base: 400000, total: 520000, benefits: 80000, taxes: 120000 },
      moderate: { base: 600000, total: 780000, benefits: 120000, taxes: 180000 },
      experienced: { base: 900000, total: 1170000, benefits: 180000, taxes: 270000 }
    }
  }
} as const;

// Task definitions for each role
const TASKS_DATA = {
  assistantPropertyManager: [
    {
      id: 'apm-tenant-screening',
      name: 'Tenant Application Screening',
      tooltip: 'Automate reference checks, income verification, and risk scoring for faster tenant approvals.',
      complexity: 'medium'
    },
    {
      id: 'apm-maintenance-coordination',
      name: 'Maintenance Coordination',
      tooltip: 'AI matches maintenance requests with best-fit contractors and optimizes scheduling.',
      complexity: 'medium'
    },
    {
      id: 'apm-lease-renewals',
      name: 'Lease Renewal Processing',
      tooltip: 'Automatically calculate rent increases, generate renewal documents, and track responses.',
      complexity: 'low'
    },
    {
      id: 'apm-compliance-tracking',
      name: 'Compliance Documentation',
      tooltip: 'Track regulatory requirements, automate compliance reporting, and flag potential issues.',
      complexity: 'high'
    },
    {
      id: 'apm-rent-collection',
      name: 'Rent Collection & Processing',
      tooltip: 'Automate rent collection, track payments, and handle late fee calculations.',
      complexity: 'low'
    },
    {
      id: 'apm-tenant-communication',
      name: 'Tenant Communication Hub',
      tooltip: 'Centralize tenant communications, automate responses, and maintain communication logs.',
      complexity: 'medium'
    },
    {
      id: 'apm-emergency-response',
      name: 'Emergency Response Coordination',
      tooltip: 'Manage emergency situations, coordinate with contractors, and ensure quick response times.',
      complexity: 'high'
    },
    {
      id: 'apm-property-inspections',
      name: 'Property Inspection Scheduling',
      tooltip: 'Schedule routine inspections, track findings, and generate inspection reports.',
      complexity: 'medium'
    },
    {
      id: 'apm-vendor-management',
      name: 'Vendor & Contractor Management',
      tooltip: 'Maintain vendor database, track performance, and manage contractor relationships.',
      complexity: 'high'
    },
    {
      id: 'apm-financial-reporting',
      name: 'Financial Reporting & Analytics',
      tooltip: 'Generate financial reports, track expenses, and provide property performance insights.',
      complexity: 'high'
    }
  ],
  leasingCoordinator: [
    {
      id: 'lc-inquiry-management',
      name: 'Inquiry Response Management',
      tooltip: 'Automatically respond to common inquiries with personalized, AI-generated responses.',
      complexity: 'low'
    },
    {
      id: 'lc-property-tours',
      name: 'Virtual Tour Coordination',
      tooltip: 'Schedule virtual tours, send automated follow-ups, and track prospect engagement.',
      complexity: 'medium'
    },
    {
      id: 'lc-application-processing',
      name: 'Application Processing',
      tooltip: 'Streamline application reviews, automate document collection, and speed up approvals.',
      complexity: 'medium'
    },
    {
      id: 'lc-lease-preparation',
      name: 'Lease Document Preparation',
      tooltip: 'Generate customized lease agreements, automate clause selection, and ensure compliance.',
      complexity: 'high'
    },
    {
      id: 'lc-prospect-nurturing',
      name: 'Prospect Nurturing Campaigns',
      tooltip: 'Develop automated follow-up sequences and nurture prospects through the leasing funnel.',
      complexity: 'medium'
    },
    {
      id: 'lc-market-research',
      name: 'Market Research & Pricing',
      tooltip: 'Analyze local market conditions, competitor pricing, and recommend optimal rent levels.',
      complexity: 'high'
    },
    {
      id: 'lc-showing-scheduling',
      name: 'Property Showing Scheduling',
      tooltip: 'Coordinate property showings, manage availability, and track showing outcomes.',
      complexity: 'low'
    },
    {
      id: 'lc-tenant-screening',
      name: 'Tenant Screening & Verification',
      tooltip: 'Conduct background checks, verify income, and assess tenant suitability.',
      complexity: 'medium'
    },
    {
      id: 'lc-lease-negotiation',
      name: 'Lease Negotiation Support',
      tooltip: 'Assist with lease terms negotiation, prepare counter-offers, and track negotiation progress.',
      complexity: 'high'
    },
    {
      id: 'lc-move-in-coordination',
      name: 'Move-in Coordination',
      tooltip: 'Coordinate move-in logistics, conduct orientation, and ensure smooth tenant transition.',
      complexity: 'medium'
    }
  ],
  marketingSpecialist: [
    {
      id: 'ms-content-creation',
      name: 'Marketing Content Creation',
      tooltip: 'Generate property listings, social media content, and marketing materials automatically.',
      complexity: 'medium'
    },
    {
      id: 'ms-lead-generation',
      name: 'Lead Generation Campaigns',
      tooltip: 'Optimize ad targeting, automate lead nurturing, and track conversion rates.',
      complexity: 'high'
    },
    {
      id: 'ms-market-analysis',
      name: 'Market Analysis & Reporting',
      tooltip: 'Analyze rental trends, competitor pricing, and generate market insights automatically.',
      complexity: 'high'
    },
    {
      id: 'ms-social-media',
      name: 'Social Media Management',
      tooltip: 'Schedule posts, respond to comments, and track engagement across all platforms.',
      complexity: 'low'
    },
    {
      id: 'ms-email-marketing',
      name: 'Email Marketing Campaigns',
      tooltip: 'Design email campaigns, segment audiences, and track email performance metrics.',
      complexity: 'medium'
    },
    {
      id: 'ms-seo-optimization',
      name: 'SEO & Website Optimization',
      tooltip: 'Optimize property listings for search engines and improve website visibility.',
      complexity: 'high'
    },
    {
      id: 'ms-advertising-management',
      name: 'Digital Advertising Management',
      tooltip: 'Manage PPC campaigns, optimize ad spend, and track ROI across advertising platforms.',
      complexity: 'high'
    },
    {
      id: 'ms-brand-management',
      name: 'Brand Management & Positioning',
      tooltip: 'Develop brand guidelines, maintain brand consistency, and enhance brand reputation.',
      complexity: 'medium'
    },
    {
      id: 'ms-analytics-reporting',
      name: 'Analytics & Performance Reporting',
      tooltip: 'Track marketing KPIs, generate performance reports, and provide actionable insights.',
      complexity: 'high'
    },
    {
      id: 'ms-event-coordination',
      name: 'Event & Open House Coordination',
      tooltip: 'Plan and coordinate marketing events, open houses, and community engagement activities.',
      complexity: 'medium'
    }
  ]
} as const;

// Task complexity multipliers
export const TASK_COMPLEXITY_MULTIPLIERS: Readonly<Record<TaskComplexity | 'custom', number>> = {
  low: 1,
  medium: 1.5,
  high: 2,
  custom: 1
} as const;

// Experience levels configuration for the calculator
export const EXPERIENCE_LEVELS_DATA = [
  { level: 'entry', title: 'Entry Level', icon: '🌱', description: '0-2 years', bestFor: 'Basic tasks, learning opportunities', color: 'text-green-700' },
  { level: 'moderate', title: 'Mid Level', icon: '🚀', description: '3-5 years', bestFor: 'Complex tasks, team leadership', color: 'text-blue-700' },
  { level: 'experienced', title: 'Senior Level', icon: '⭐', description: '5+ years', bestFor: 'Strategic decisions, mentoring', color: 'text-purple-700' }
] as const;

// Backward compatibility function
export const getExperienceLevels = () => {
  return EXPERIENCE_LEVELS_DATA;
};

// Simplified enhanced property management roles for Step 2 implementation
export const ROLES = {
  assistantPropertyManager: {
    id: 'assistantPropertyManager',
    title: 'Assistant Property Manager',
    icon: '🏢',
    description: 'Handles day-to-day property operations, tenant relations, and administrative tasks.',
    category: 'property-management' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-primary',
    salary: SALARY_DATA.assistantPropertyManager,
    tasks: TASKS_DATA.assistantPropertyManager,
    experienceLevels: EXPERIENCE_LEVELS_DATA
  },
  leasingCoordinator: {
    id: 'leasingCoordinator',
    title: 'Leasing Coordinator',
    icon: '🗝️',
    description: 'Manages leasing activities, prospect communication, and application processing.',
    category: 'leasing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-secondary',
    salary: SALARY_DATA.leasingCoordinator,
    tasks: TASKS_DATA.leasingCoordinator,
    experienceLevels: EXPERIENCE_LEVELS_DATA
  },
  marketingSpecialist: {
    id: 'marketingSpecialist',
    title: 'Marketing Specialist',
    icon: '📈',
    description: 'Creates marketing campaigns, manages digital presence, and analyzes market trends.',
    category: 'marketing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-accent',
    salary: SALARY_DATA.marketingSpecialist,
    tasks: TASKS_DATA.marketingSpecialist,
    experienceLevels: EXPERIENCE_LEVELS_DATA
  }
} as const;

/**
 * Get static roles (for fallback or testing)
 */
export function getStaticRoles() {
  return ROLES;
}

/**
 * Get static roles salary comparison (for fallback or testing)
 */
export function getStaticRolesSalaryComparison() {
  return SALARY_DATA;
}

/**
 * Get salary data for a specific role and country with USA fallback
 * Ensures USA is always the default when country is not found
 */
export function getRoleSalaryForCountry(roleId: string, country: string) {
  const roleSalaryData = SALARY_DATA[roleId as keyof typeof SALARY_DATA];
  if (!roleSalaryData) {
    console.warn(`❌ No salary data found for role: ${roleId}`);
    return null;
  }
  
  // Try to get salary data for the specific country
  let countrySalaryData = (roleSalaryData as any)[country];
  
  // If country not found, fall back to USA
  if (!countrySalaryData) {
    console.log(`📊 No salary data for country: ${country} - falling back to USA data`);
    countrySalaryData = roleSalaryData["United States"];
  }
  
  return countrySalaryData;
}

/**
 * Get all salary data for a role with USA fallback for missing countries
 * Returns a copy of the salary data with USA data filled in for missing countries
 */
export function getRoleSalaryWithUSAFallback(roleId: string) {
  const roleSalaryData = SALARY_DATA[roleId as keyof typeof SALARY_DATA];
  if (!roleSalaryData) {
    return null;
  }
  
  // Get USA data as fallback
  const usaData = roleSalaryData["United States"];
  if (!usaData) {
    return roleSalaryData;
  }
  
  // Create a copy with USA data for missing countries
  const result = { ...roleSalaryData } as any;
  
  // For any country that doesn't have data, use USA data
  Object.keys(result).forEach(country => {
    if (country !== "United States" && country !== "Philippines" && !result[country]) {
      result[country] = usaData;
    }
  });
  
  return result;
} 