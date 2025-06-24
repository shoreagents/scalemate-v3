// Roles Data Service - Dynamic location-based roles and salary data
import { MultiCountryRoleSalaryData, RoleCategory } from '@/types';
import { LocationContext } from '@/types/location';

// Enhanced multi-country salary data with detailed breakdowns - Updated with 2025 market rates
export const ROLES_SALARY_COMPARISON: Readonly<Record<string, MultiCountryRoleSalaryData>> = {
  assistantPropertyManager: {
    AU: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    US: {
      entry: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      moderate: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      experienced: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 }
    },
    CA: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    UK: {
      entry: { base: 32000, total: 41600, benefits: 6400, taxes: 9600 },
      moderate: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      experienced: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 }
    },
    NZ: {
      entry: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      moderate: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      experienced: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 }
    },
    SG: {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 70000, total: 91000, benefits: 14000, taxes: 21000 }
    },
    PH: {
      entry: { base: 300000, total: 390000, benefits: 60000, taxes: 90000 },
      moderate: { base: 420000, total: 546000, benefits: 84000, taxes: 126000 },
      experienced: { base: 600000, total: 780000, benefits: 120000, taxes: 180000 }
    }
  },
  leasingCoordinator: {
    AU: {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 95000, total: 123500, benefits: 19000, taxes: 28500 }
    },
    US: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    CA: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 82000, total: 106600, benefits: 16400, taxes: 24600 }
    },
    UK: {
      entry: { base: 38000, total: 49400, benefits: 7600, taxes: 11400 },
      moderate: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      experienced: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 }
    },
    NZ: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    SG: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    PH: {
      entry: { base: 350000, total: 455000, benefits: 70000, taxes: 105000 },
      moderate: { base: 480000, total: 624000, benefits: 96000, taxes: 144000 },
      experienced: { base: 720000, total: 936000, benefits: 144000, taxes: 216000 }
    }
  },
  marketingSpecialist: {
    AU: {
      entry: { base: 62000, total: 80600, benefits: 12400, taxes: 18600 },
      moderate: { base: 80000, total: 104000, benefits: 16000, taxes: 24000 },
      experienced: { base: 105000, total: 136500, benefits: 21000, taxes: 31500 }
    },
    US: {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 95000, total: 123500, benefits: 19000, taxes: 28500 }
    },
    CA: {
      entry: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      moderate: { base: 72000, total: 93600, benefits: 14400, taxes: 21600 },
      experienced: { base: 92000, total: 119600, benefits: 18400, taxes: 27600 }
    },
    UK: {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 70000, total: 91000, benefits: 14000, taxes: 21000 }
    },
    NZ: {
      entry: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      moderate: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 },
      experienced: { base: 98000, total: 127400, benefits: 19600, taxes: 29400 }
    },
    SG: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    PH: {
      entry: { base: 400000, total: 520000, benefits: 80000, taxes: 120000 },
      moderate: { base: 600000, total: 780000, benefits: 120000, taxes: 180000 },
      experienced: { base: 900000, total: 1170000, benefits: 180000, taxes: 270000 }
    }
  }
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
    salaryData: ROLES_SALARY_COMPARISON.assistantPropertyManager,
    requiredSkills: ['Property Management', 'Tenant Relations', 'Administrative Skills', 'Communication'],
    optionalSkills: ['Maintenance Coordination', 'Compliance Knowledge', 'Basic Accounting'],
    searchKeywords: ['property', 'manager', 'tenant', 'administration', 'operations', 'maintenance', 'compliance']
  },
  leasingCoordinator: {
    id: 'leasingCoordinator',
    title: 'Leasing Coordinator',
    icon: '🗝️',
    description: 'Manages leasing activities, prospect communication, and application processing.',
    category: 'leasing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-secondary',
    salaryData: ROLES_SALARY_COMPARISON.leasingCoordinator,
    requiredSkills: ['Sales Skills', 'Customer Service', 'Application Processing', 'Market Knowledge'],
    optionalSkills: ['Marketing Skills', 'CRM Software', 'Negotiation Skills'],
    searchKeywords: ['leasing', 'coordinator', 'sales', 'applications', 'prospects', 'tours', 'inquiries']
  },
  marketingSpecialist: {
    id: 'marketingSpecialist',
    title: 'Marketing Specialist',
    icon: '📈',
    description: 'Creates marketing campaigns, manages digital presence, and analyzes market trends.',
    category: 'marketing' as RoleCategory,
    type: 'predefined' as const,
    color: 'brand-accent',
    salaryData: ROLES_SALARY_COMPARISON.marketingSpecialist,
    requiredSkills: ['Digital Marketing', 'Content Creation', 'Analytics', 'Social Media'],
    optionalSkills: ['Graphic Design', 'SEO/SEM', 'Video Production', 'Data Analysis'],
    searchKeywords: ['marketing', 'specialist', 'digital', 'social media', 'content', 'campaigns', 'analytics']
  }
} as const;



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
function normalizeCacheKey(location: LocationContext): string {
  // Use countryName if available (from auto-detection), otherwise use country (from manual selection)
  // Both should already be full country names at this point
  return location.countryName || location.country;
}

// Initialize cache variables
const rolesCache = typeof window !== 'undefined' ? loadRolesCacheFromStorage() : new Map<string, RolesCacheEntry>();
const rolesSalaryCache = typeof window !== 'undefined' ? loadRolesSalaryCacheFromStorage() : new Map<string, RolesSalaryCacheEntry>();

/**
 * Generate dynamic roles data using Anthropic API
 */
async function generateDynamicRoles(location: LocationContext): Promise<typeof ROLES | null> {
  try {
    console.log('🚀 Calling /api/anthropic/quote-calculator for roles with location:', location);
    
    const response = await fetch('/api/anthropic/quote-calculator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        portfolioSizes: [],
        requestType: 'roles'
      }),
    });

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API response error:', response.status, errorText);
      throw new Error(`API response not ok: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API response data received for roles:', Object.keys(data));
    
    if (data.roles) {
      console.log('🎯 Roles found in response');
      return data.roles;
    } else {
      console.error('❌ No roles in response:', data);
      return null;
    }
  } catch (error) {
    console.error('💥 Failed to generate dynamic roles:', error);
    return null;
  }
}

/**
 * Generate dynamic roles salary comparison using Anthropic API
 */
async function generateDynamicRolesSalaryComparison(location: LocationContext): Promise<typeof ROLES_SALARY_COMPARISON | null> {
  try {
    console.log('🚀 Calling /api/anthropic/quote-calculator for salary data with location:', location);
    
    const response = await fetch('/api/anthropic/quote-calculator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        portfolioSizes: [],
        requestType: 'salary'
      }),
    });

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API response error:', response.status, errorText);
      throw new Error(`API response not ok: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API response data received for salary:', Object.keys(data));
    
    if (data.rolesSalaryComparison) {
      console.log('🎯 Roles salary comparison found in response');
      return data.rolesSalaryComparison;
    } else {
      console.error('❌ No rolesSalaryComparison in response:', data);
      return null;
    }
  } catch (error) {
    console.error('💥 Failed to generate dynamic roles salary comparison:', error);
    return null;
  }
}

/**
 * Get roles with location-based customization
 * Falls back to static data if dynamic generation fails
 */
export async function getRoles(location?: LocationContext): Promise<typeof ROLES> {
  // If no location provided, return static data
  if (!location?.country) {
    return ROLES;
  }

  // Create normalized cache key for consistency between auto-detected and manual selection
  const cacheKey = normalizeCacheKey(location);
  
  // Check cache first
  const cached = rolesCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached roles for:', cacheKey, '(cache size:', rolesCache.size, ')');
    return cached.data;
  }

  try {
    // Try to get dynamic data
    console.log('🌍 Generating location-specific roles for:', location.countryName || location.country);
    const dynamicData = await generateDynamicRoles(location);
    
    if (dynamicData) {
      // Cache the result
      const cacheEntry: RolesCacheEntry = {
        data: dynamicData,
        timestamp: Date.now(),
        location: cacheKey
      };
      rolesCache.set(cacheKey, cacheEntry);
      saveRolesCacheToStorage(rolesCache);
      
      console.log('✅ Successfully generated and cached roles for:', cacheKey, '(cache size:', rolesCache.size, ')');
      return dynamicData;
    }
  } catch (error) {
    console.error('Error generating dynamic roles:', error);
  }

  // Fallback to static data
  console.log('📋 Using static roles as fallback');
  return ROLES;
}

/**
 * Get roles salary comparison with location-based customization
 * Falls back to static data if dynamic generation fails
 */
export async function getRolesSalaryComparison(location?: LocationContext): Promise<typeof ROLES_SALARY_COMPARISON> {
  // If no location provided, return static data
  if (!location?.country) {
    return ROLES_SALARY_COMPARISON;
  }

  // Create normalized cache key for consistency between auto-detected and manual selection
  const cacheKey = normalizeCacheKey(location);
  
  // Check cache first
  const cached = rolesSalaryCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached roles salary comparison for:', cacheKey, '(cache size:', rolesSalaryCache.size, ')');
    return cached.data;
  }

  try {
    // Try to get dynamic data
    console.log('🌍 Generating location-specific roles salary comparison for:', location.countryName || location.country);
    const dynamicData = await generateDynamicRolesSalaryComparison(location);
    
    if (dynamicData) {
      // Cache the result
      const cacheEntry: RolesSalaryCacheEntry = {
        data: dynamicData,
        timestamp: Date.now(),
        location: cacheKey
      };
      rolesSalaryCache.set(cacheKey, cacheEntry);
      saveRolesSalaryCacheToStorage(rolesSalaryCache);
      
      console.log('✅ Successfully generated and cached roles salary comparison for:', cacheKey, '(cache size:', rolesSalaryCache.size, ')');
      return dynamicData;
    }
  } catch (error) {
    console.error('Error generating dynamic roles salary comparison:', error);
  }

  // Fallback to static data
  console.log('📋 Using static roles salary comparison as fallback');
  return ROLES_SALARY_COMPARISON;
}

/**
 * Clear roles cache (useful for testing or manual refresh)
 */
export function clearRolesCache(): void {
  rolesCache.clear();
  rolesSalaryCache.clear();
  
  try {
    localStorage.removeItem('scalemate-roles-cache');
    localStorage.removeItem('scalemate-roles-salary-cache');
    console.log('🗑️ Roles cache cleared from memory and localStorage');
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
    }
  };
}

/**
 * Check if roles data is cached for a specific location
 */
export function hasRolesCachedData(country: string): boolean {
  const cacheKey = normalizeCacheKey({ country });
  const rolesEntry = rolesCache.get(cacheKey);
  const salaryEntry = rolesSalaryCache.get(cacheKey);
  
  const rolesValid = rolesEntry && (Date.now() - rolesEntry.timestamp) < CACHE_DURATION;
  const salaryValid = salaryEntry && (Date.now() - salaryEntry.timestamp) < CACHE_DURATION;
  
  return Boolean(rolesValid || salaryValid);
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