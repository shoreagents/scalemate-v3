// Roles Data Service - Dynamic location-based roles and salary data
import { 
  MultiCountryRoleSalaryData, 
  RoleCategory, 
  CountrySalaryData,
  RoleId,
  Task,
  TaskComplexity,
  EnhancedRole
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

// Additional searchable property management roles (predefined but not in original 3)
export const ADDITIONAL_PROPERTY_ROLES: Readonly<Record<string, Partial<EnhancedRole>>> = {
  maintenanceCoordinator: {
    title: 'Maintenance Coordinator',
    icon: '🔧',
    description: 'Coordinates maintenance requests, vendor management, and property upkeep schedules.',
    category: 'maintenance'
  },
  propertyAccountant: {
    title: 'Property Accountant',
    icon: '💰',
    description: 'Manages financial records, rent collection, budgeting, and financial reporting.',
    category: 'finance'
  },
  tenantRelationsSpecialist: {
    title: 'Tenant Relations Specialist',
    icon: '🤝',
    description: 'Handles tenant communications, resolves conflicts, and manages resident satisfaction.',
    category: 'property-management'
  },
  propertyInspector: {
    title: 'Property Inspector',
    icon: '🔍',
    description: 'Conducts property inspections, move-in/move-out assessments, and compliance checks.',
    category: 'property-management'
  },
  leasingAgent: {
    title: 'Leasing Agent',
    icon: '🏠',
    description: 'Shows properties, processes applications, and converts prospects into tenants.',
    category: 'leasing'
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
    salaryData: SALARY_DATA.assistantPropertyManager,
    tasks: TASKS_DATA.assistantPropertyManager
  },
  leasingCoordinator: {
    id: 'leasingCoordinator',
    title: 'Leasing Coordinator',
    icon: '🗝️',
    description: 'Manages leasing activities, prospect communication, and application processing.',
    category: 'leasing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-secondary',
    salaryData: SALARY_DATA.leasingCoordinator,
    tasks: TASKS_DATA.leasingCoordinator
  },
  marketingSpecialist: {
    id: 'marketingSpecialist',
    title: 'Marketing Specialist',
    icon: '📈',
    description: 'Creates marketing campaigns, manages digital presence, and analyzes market trends.',
    category: 'marketing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-accent',
    salaryData: SALARY_DATA.marketingSpecialist,
    tasks: TASKS_DATA.marketingSpecialist
  }
} as const;

// Backward compatibility: Export tasks in the old format for existing code
export const ROLE_TASKS: Readonly<Record<RoleId, readonly Task[]>> = TASKS_DATA;

// Backward compatibility: Export salary data in the old format for existing code
export const ROLES_SALARY_COMPARISON: Readonly<Record<string, MultiCountryRoleSalaryData>> = SALARY_DATA;

// Cache interfaces and constants
interface RolesCacheEntry {
  data: typeof ROLES;
  timestamp: number;
  location: string;
}

interface RolesSalaryCacheEntry {
  data: typeof ROLES_SALARY_COMPARISON;
  timestamp: number;
  location: string;
}

// Combined cache entry for the 'both' optimization
interface CombinedCacheEntry {
  roles: typeof ROLES;
  rolesSalaryComparison: typeof ROLES_SALARY_COMPARISON;
  timestamp: number;
  location: string;
}

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours cache duration

// Cache management functions
function loadRolesCacheFromStorage(): Map<string, RolesCacheEntry> {
  try {
    const stored = localStorage.getItem('scalemate-roles-cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(parsed.map(([key, value]: [string, RolesCacheEntry]) => [key, value]));
    }
  } catch (error) {
    console.warn('Failed to load roles cache from localStorage:', error);
  }
  return new Map();
}

function loadRolesSalaryCacheFromStorage(): Map<string, RolesSalaryCacheEntry> {
  try {
    const stored = localStorage.getItem('scalemate-roles-salary-cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(parsed.map(([key, value]: [string, RolesSalaryCacheEntry]) => [key, value]));
    }
  } catch (error) {
    console.warn('Failed to load roles salary cache from localStorage:', error);
  }
  return new Map();
}

function saveRolesCacheToStorage(cache: Map<string, RolesCacheEntry>): void {
  try {
    const serialized = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('scalemate-roles-cache', serialized);
  } catch (error) {
    console.warn('Failed to save roles cache to localStorage:', error);
  }
}

function saveRolesSalaryCacheToStorage(cache: Map<string, RolesSalaryCacheEntry>): void {
  try {
    const serialized = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('scalemate-roles-salary-cache', serialized);
  } catch (error) {
    console.warn('Failed to save roles salary cache to localStorage:', error);
  }
}

// Helper function to normalize country name to consistent cache key
function normalizeCacheKey(location: LocationData): string {
  // Use countryName if available (from auto-detection), otherwise use country (from manual selection)
  // Both should already be full country names at this point
  return location.countryName || location.country;
}

// Combined cache functions for the 'both' optimization
function loadCombinedCacheFromStorage(): Map<string, CombinedCacheEntry> {
  try {
    const stored = localStorage.getItem('scalemate-combined-cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      return new Map(parsed.map(([key, value]: [string, CombinedCacheEntry]) => [key, value]));
    }
  } catch (error) {
    console.warn('Failed to load combined cache from localStorage:', error);
  }
  return new Map();
}

function saveCombinedCacheToStorage(cache: Map<string, CombinedCacheEntry>): void {
  try {
    const serialized = JSON.stringify(Array.from(cache.entries()));
    localStorage.setItem('scalemate-combined-cache', serialized);
  } catch (error) {
    console.warn('Failed to save combined cache to localStorage:', error);
  }
}

// Initialize cache variables
const rolesCache = typeof window !== 'undefined' ? loadRolesCacheFromStorage() : new Map<string, RolesCacheEntry>();
const rolesSalaryCache = typeof window !== 'undefined' ? loadRolesSalaryCacheFromStorage() : new Map<string, RolesSalaryCacheEntry>();
const combinedCache = typeof window !== 'undefined' ? loadCombinedCacheFromStorage() : new Map<string, CombinedCacheEntry>();

/**
 * Helper function to check if we have predefined data for a country
 */
function hasStaticDataForCountry(countryName: string): boolean {
  // Check if the country exists in any of the role's salary data
  const assistantManagerData = SALARY_DATA.assistantPropertyManager;
  if (!assistantManagerData) return false;
  
  // Check if the country exists as a key in the salary data
  return countryName in assistantManagerData;
}

/**
 * Convert salary data from USD to target currency
 * @deprecated This function is no longer used - currency conversion is handled by the combined API
 */
async function convertSalaryDataToCurrency(
  salaryData: typeof ROLES_SALARY_COMPARISON,
  targetCurrency: string,
  targetCountry: string
): Promise<typeof ROLES_SALARY_COMPARISON> {
  const multiplier = await getDirectExchangeRate('USD', targetCurrency);
  
  if (multiplier === 1.0) {
    // No conversion needed for USD
    return salaryData;
  }
  
  console.log(`💱 Converting salary data from USD to ${targetCurrency} (multiplier: ${multiplier})`);
  
  const convertedData = { ...salaryData };
  
  // Convert each role's salary data
  (Object.keys(convertedData) as Array<keyof typeof ROLES_SALARY_COMPARISON>).forEach(roleId => {
    // We know roleData exists because we're iterating over keys of convertedData
    const roleData = convertedData[roleId]!;
    // Use US data as base and convert to target currency
    const usData = roleData["United States"];
    
    if (!usData) {
      console.error('Missing US salary data for role:', roleId);
      return;
    }
    
    // Create converted data with all required fields
    const convertedCountryData: CountrySalaryData = {
      entry: {
        base: Math.round(usData.entry.base * multiplier),
        total: Math.round(usData.entry.total * multiplier),
        benefits: Math.round(usData.entry.benefits * multiplier),
        taxes: Math.round(usData.entry.taxes * multiplier)
      },
      moderate: {
        base: Math.round(usData.moderate.base * multiplier),
        total: Math.round(usData.moderate.total * multiplier),
        benefits: Math.round(usData.moderate.benefits * multiplier),
        taxes: Math.round(usData.moderate.taxes * multiplier)
      },
      experienced: {
        base: Math.round(usData.experienced.base * multiplier),
        total: Math.round(usData.experienced.total * multiplier),
        benefits: Math.round(usData.experienced.benefits * multiplier),
        taxes: Math.round(usData.experienced.taxes * multiplier)
      }
    };
    
    // Update the role data with the converted country data
    (roleData as any)[targetCountry] = convertedCountryData;
  });
  
  return convertedData;
}

/**
 * Generate dynamic roles using Anthropic API
 */
async function generateDynamicRoles(location: LocationData): Promise<typeof ROLES | null> {
  try {
    console.log('🤖 Generating dynamic roles using API for:', location.countryName || location.country);
    
    const response = await fetch('/api/anthropic/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        requestType: 'both'
      }),
    });

    if (!response.ok) {
      console.error('❌ Failed to generate dynamic roles:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.roles) {
      console.error('❌ Invalid response from roles API');
      return null;
    }

    // Convert API response to ROLES format
    const rolesData = data.roles;
    const dynamicRoles = {
      assistantPropertyManager: {
        ...rolesData.assistantPropertyManager,
        salaryData: SALARY_DATA.assistantPropertyManager, // Use static salary data for now
      },
      leasingCoordinator: {
        ...rolesData.leasingCoordinator,
        salaryData: SALARY_DATA.leasingCoordinator,
      },
      marketingSpecialist: {
        ...rolesData.marketingSpecialist,
        salaryData: SALARY_DATA.marketingSpecialist,
      }
    } as const;

    console.log('✅ Dynamic roles generated successfully');
    return dynamicRoles;
  } catch (error) {
    console.error('❌ Error generating dynamic roles:', error);
    return null;
  }
}

/**
 * Generate dynamic roles salary comparison using Anthropic API
 */
async function generateDynamicRolesSalaryComparison(location: LocationData): Promise<typeof ROLES_SALARY_COMPARISON | null> {
  try {
    console.log('🤖 Generating dynamic salary data using API for:', location.countryName || location.country);
    
    const response = await fetch('/api/anthropic/roles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        requestType: 'both'
      }),
    });

    if (!response.ok) {
      console.error('❌ Failed to generate dynamic salary data:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.rolesSalaryComparison) {
      console.error('❌ Invalid response from salary API');
      return null;
    }

    console.log('✅ Dynamic salary data generated successfully');
    return data.rolesSalaryComparison as typeof ROLES_SALARY_COMPARISON;
  } catch (error) {
    console.error('❌ Error generating dynamic salary data:', error);
    return null;
  }
}

/**
 * Generate both roles and salary data using the new combined API endpoint
 */
async function generateBothData(location: LocationData): Promise<{roles: typeof ROLES, rolesSalaryComparison: typeof ROLES_SALARY_COMPARISON} | null> {
  try {
    console.log('🤖 Generating both roles and salary data using combined API for:', location.countryName || location.country);
    
    // Import the combined data function from quoteCalculatorData
    const { generateCombinedLocationData } = await import('./quoteCalculatorData');
    const combinedData = await generateCombinedLocationData(location);
    
    if (!combinedData.roles || !combinedData.rolesSalaryComparison) {
      console.error('❌ Invalid response from combined API');
      return null;
    }

    // Convert API response to proper ROLES format
    const rolesData = combinedData.roles;
    const dynamicRoles = {
      assistantPropertyManager: {
        ...rolesData.assistantPropertyManager,
        salaryData: combinedData.rolesSalaryComparison.assistantPropertyManager,
      },
      leasingCoordinator: {
        ...rolesData.leasingCoordinator,
        salaryData: combinedData.rolesSalaryComparison.leasingCoordinator,
      },
      marketingSpecialist: {
        ...rolesData.marketingSpecialist,
        salaryData: combinedData.rolesSalaryComparison.marketingSpecialist,
      }
    } as const;

    console.log('✅ Combined data generated successfully via new API');
    return {
      roles: dynamicRoles,
      rolesSalaryComparison: combinedData.rolesSalaryComparison as typeof ROLES_SALARY_COMPARISON
    };
  } catch (error) {
    console.error('❌ Error generating combined data:', error);
    return null;
  }
}

/**
 * Get roles with location-based customization
 * Uses predefined data for supported countries, falls back to US data with currency conversion for others
 */
export async function getRoles(location?: LocationData): Promise<typeof ROLES> {
  // If no location provided, return static US data
  if (!location?.country) {
    return ROLES;
  }

  // Create normalized cache key for consistency between auto-detected and manual selection
  const cacheKey = normalizeCacheKey(location);
  
  // Check combined cache first
  const combined = combinedCache.get(cacheKey);
  if (combined && (Date.now() - combined.timestamp) < CACHE_DURATION) {
    console.log('⚡ Using cached combined roles for:', cacheKey);
    return combined.roles;
  }
  
  // Check legacy cache
  const cached = rolesCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached roles for:', cacheKey, '(cache size:', rolesCache.size, ')');
    return cached.data;
  }

  try {
    // Try to get dynamic data using 'both' API call
    console.log('🌍 Generating location-specific data for:', location.countryName || location.country);
    const bothData = await generateBothData(location);
    
    if (bothData) {
      // Cache the combined result
      const combinedEntry: CombinedCacheEntry = {
        roles: bothData.roles,
        rolesSalaryComparison: bothData.rolesSalaryComparison,
        timestamp: Date.now(),
        location: cacheKey
      };
      combinedCache.set(cacheKey, combinedEntry);
      saveCombinedCacheToStorage(combinedCache);
      
      console.log('✅ Successfully generated and cached combined data for:', cacheKey);
      return bothData.roles;
    }
  } catch (error) {
    console.error('Error generating dynamic roles:', error);
  }

  // Get standardized country name for fallback logic
  const countryName = location.countryName || location.country;

  // Check if we have predefined data for this country
  if (hasStaticDataForCountry(countryName)) {
    console.log('📋 Using predefined roles data for:', countryName);
    // Use predefined role definitions with country-specific salary data
    return {
      ...ROLES,
      assistantPropertyManager: {
        ...ROLES.assistantPropertyManager,
        salaryData: SALARY_DATA.assistantPropertyManager
      },
      leasingCoordinator: {
        ...ROLES.leasingCoordinator,
        salaryData: SALARY_DATA.leasingCoordinator
      },
      marketingSpecialist: {
        ...ROLES.marketingSpecialist,
        salaryData: SALARY_DATA.marketingSpecialist
      }
    };
  }

  // For unsupported countries, use US data (no currency conversion)
  console.log('🇺🇸 Using US salary data for:', location.country);
  return {
    ...ROLES,
    assistantPropertyManager: {
      ...ROLES.assistantPropertyManager,
      salaryData: SALARY_DATA.assistantPropertyManager
    },
    leasingCoordinator: {
      ...ROLES.leasingCoordinator,
      salaryData: SALARY_DATA.leasingCoordinator
    },
    marketingSpecialist: {
      ...ROLES.marketingSpecialist,
      salaryData: SALARY_DATA.marketingSpecialist
    }
  };
}

/**
 * Get roles salary comparison with location-based customization
 * Uses predefined data for supported countries, falls back to US data with currency conversion for others
 */
export async function getRolesSalaryComparison(
  userLocation?: LocationData, 
  manualLocation?: ManualLocation | null
): Promise<typeof ROLES_SALARY_COMPARISON> {
  try {
    // Get effective location and currency
    const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
    let targetCurrency: string;
    
    if (manualLocation?.country) {
      targetCurrency = getCurrencyByCountry(manualLocation.country);
    } else if (userLocation?.currency) {
      targetCurrency = userLocation.currency;
    } else {
      targetCurrency = 'USD';
    }

    // Get the exchange rate
    const multiplier = await getDirectExchangeRate('USD', targetCurrency);
    
    if (multiplier === 1.0 || effectiveCountry === 'United States') {
      return ROLES_SALARY_COMPARISON;
    }
    
    // Convert USD amounts to target currency for countries without specific data
    const convertedData = { ...ROLES_SALARY_COMPARISON };
    
    // Only convert roles that don't have specific country data
    for (const [roleId, roleData] of Object.entries(convertedData)) {
      if (!roleData[effectiveCountry as keyof typeof roleData]) {
        // Convert US data to target currency
        const usData = roleData["United States"];
        if (usData) {
          convertedData[roleId as keyof typeof convertedData] = {
            ...roleData,
            [effectiveCountry]: {
              entry: {
                base: Math.round(usData.entry.base * multiplier),
                total: Math.round(usData.entry.total * multiplier),
                benefits: Math.round(usData.entry.benefits * multiplier),
                taxes: Math.round(usData.entry.taxes * multiplier)
              },
              moderate: {
                base: Math.round(usData.moderate.base * multiplier),
                total: Math.round(usData.moderate.total * multiplier),
                benefits: Math.round(usData.moderate.benefits * multiplier),
                taxes: Math.round(usData.moderate.taxes * multiplier)
              },
              experienced: {
                base: Math.round(usData.experienced.base * multiplier),
                total: Math.round(usData.experienced.total * multiplier),
                benefits: Math.round(usData.experienced.benefits * multiplier),
                taxes: Math.round(usData.experienced.taxes * multiplier)
              }
            }
          };
        }
      }
    }
    
    return convertedData;
  } catch (error) {
    console.warn('Failed to convert salary data, using original data:', error);
    return ROLES_SALARY_COMPARISON;
  }
}

/**
 * Clear roles cache (useful for testing or manual refresh)
 */
export function clearRolesCache(): void {
  rolesCache.clear();
  rolesSalaryCache.clear();
  combinedCache.clear();
  
  try {
    localStorage.removeItem('scalemate-roles-cache');
    localStorage.removeItem('scalemate-roles-salary-cache');
    localStorage.removeItem('scalemate-combined-cache');
    console.log('🗑️ All roles cache cleared from memory and localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to clear localStorage roles cache:', error);
    console.log('🗑️ Roles cache cleared from memory only');
  }
}

/**
 * Get roles cache statistics
 */
export function getRolesCacheStats() {
  return {
    roles: {
      size: rolesCache.size,
      entries: Array.from(rolesCache.keys()),
      duration: CACHE_DURATION
    },
    rolesSalary: {
      size: rolesSalaryCache.size,
      entries: Array.from(rolesSalaryCache.keys()),
      duration: CACHE_DURATION
    },
    combined: {
      size: combinedCache.size,
      entries: Array.from(combinedCache.keys()),
      duration: CACHE_DURATION
    }
  };
}

/**
 * Check if roles data is cached for a specific location
 */
export function hasRolesCachedData(country: string): boolean {
  const locationData: LocationData = {
    country: country as any,
    countryName: country,
    currency: 'USD',
    currencySymbol: '$',
    detected: false
  };
  const cacheKey = normalizeCacheKey(locationData);
  const combinedEntry = combinedCache.get(cacheKey);
  const rolesEntry = rolesCache.get(cacheKey);
  const salaryEntry = rolesSalaryCache.get(cacheKey);
  
  const combinedValid = combinedEntry && (Date.now() - combinedEntry.timestamp) < CACHE_DURATION;
  const rolesValid = rolesEntry && (Date.now() - rolesEntry.timestamp) < CACHE_DURATION;
  const salaryValid = salaryEntry && (Date.now() - salaryEntry.timestamp) < CACHE_DURATION;
  
  return Boolean(combinedValid || rolesValid || salaryValid);
}

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
  return ROLES_SALARY_COMPARISON;
} 