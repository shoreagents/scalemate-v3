// Portfolio Data Service - Dynamic location-based portfolio indicators
import { PortfolioSize, PortfolioIndicator, MultiCountryRoleSalaryData, RoleCategory } from '@/types';

// Static fallback data for portfolio indicators
const PORTFOLIO_INFO: Readonly<Record<PortfolioSize, PortfolioIndicator>> = {
  '500-999': {
    min: 500,
    max: 999,
    tier: 'growing',
    description: 'Perfect for testing offshore teams',
    recommendedTeamSize: {
      assistantPropertyManager: 1,
      leasingCoordinator: 1,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 500000, max: 1500000 },
    implementationComplexity: 'simple'
  },
  '1000-1999': {
    min: 1000,
    max: 1999,
    tier: 'large',
    description: 'Ideal for full team implementation',
    recommendedTeamSize: {
      assistantPropertyManager: 2,
      leasingCoordinator: 2,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 1500000, max: 4000000 },
    implementationComplexity: 'moderate'
  },
  '2000-4999': {
    min: 2000,
    max: 4999,
    tier: 'major',
    description: 'Multiple teams across departments',
    recommendedTeamSize: {
      assistantPropertyManager: 3,
      leasingCoordinator: 2,
      marketingSpecialist: 2
    },
    averageRevenue: { min: 4000000, max: 15000000 },
    implementationComplexity: 'complex'
  },
  '5000+': {
    min: 5000,
    max: 99999,
    tier: 'enterprise',
    description: 'Full offshore operation',
    recommendedTeamSize: {
      assistantPropertyManager: 5,
      leasingCoordinator: 3,
      marketingSpecialist: 3
    },
    averageRevenue: { min: 15000000, max: 100000000 },
    implementationComplexity: 'enterprise'
  },
  'manual': {
    min: 0,
    max: 99999,
    tier: 'growing',
    description: 'Custom portfolio size with precise inputs',
    recommendedTeamSize: {
      assistantPropertyManager: 1,
      leasingCoordinator: 1,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 0, max: 100000000 },
    implementationComplexity: 'simple'
  }
} as const;

// Cache for dynamic data to avoid repeated API calls
interface CacheEntry {
  data: Record<PortfolioSize, PortfolioIndicator>;
  timestamp: number;
  location: string;
}

// Persistent cache using localStorage with fallback to in-memory
const CACHE_KEY = 'scalemate-portfolio-cache';
const CACHE_VERSION_KEY = 'scalemate-cache-version';
const CURRENT_CACHE_VERSION = '1.0';
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours cache duration

// Load cache from localStorage with error handling
function loadCacheFromStorage(): Map<string, CacheEntry> {
  try {
    // Check cache version compatibility
    const storedVersion = localStorage.getItem(CACHE_VERSION_KEY);
    if (storedVersion !== CURRENT_CACHE_VERSION) {
      console.log('🔄 Cache version mismatch, clearing old cache');
      localStorage.removeItem(CACHE_KEY);
      localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
      return new Map();
    }

    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const cacheMap = new Map<string, CacheEntry>();
      
      // Load entries and check expiration
      const now = Date.now();
      Object.entries(parsed).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry;
        if (now - cacheEntry.timestamp < CACHE_DURATION) {
          cacheMap.set(key, cacheEntry);
        }
      });
      
      console.log('📂 Loaded', cacheMap.size, 'cached portfolio indicators from localStorage');
      return cacheMap;
    }
  } catch (error) {
    console.warn('⚠️ Failed to load cache from localStorage:', error);
  }
  
  return new Map();
}

// Save cache to localStorage with error handling
function saveCacheToStorage(cache: Map<string, CacheEntry>): void {
  try {
    const cacheObject = Object.fromEntries(cache);
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
    localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
  } catch (error) {
    console.warn('⚠️ Failed to save cache to localStorage:', error);
    // Fallback: try to clear some space by removing our own cache
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('🧹 Cleared localStorage cache due to storage error');
    } catch (clearError) {
      console.warn('⚠️ Could not clear localStorage cache:', clearError);
    }
  }
}

// Initialize persistent cache
const cache = loadCacheFromStorage();

// Helper function to normalize country name to consistent cache key
function normalizeCacheKey(location: LocationContext): string {
  const countryName = location.countryName || location.country;
  
  // Map common country codes to full names for consistent caching
  const codeToName: Record<string, string> = {
    'US': 'United States',
    'AU': 'Australia', 
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'UK': 'United Kingdom',
    'DE': 'Germany',
    'FR': 'France',
    'ES': 'Spain',
    'IT': 'Italy',
    'NL': 'Netherlands',
    'NZ': 'New Zealand',
    'SG': 'Singapore',
    'PH': 'Philippines',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'IN': 'India',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'CH': 'Switzerland',
    'NO': 'Norway',
    'SE': 'Sweden',
    'DK': 'Denmark',
    'PL': 'Poland',
    'CZ': 'Czech Republic',
    'HU': 'Hungary',
    'RO': 'Romania',
    'BG': 'Bulgaria',
    'HR': 'Croatia',
    'IL': 'Israel',
    'TR': 'Turkey',
    'RU': 'Russia',
    'UA': 'Ukraine',
    'ZA': 'South Africa',
    'TH': 'Thailand',
    'MY': 'Malaysia',
    'ID': 'Indonesia',
    'VN': 'Vietnam',
    'HK': 'Hong Kong',
    'TW': 'Taiwan',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru'
  };
  
  // If location.country is a country code, convert to full name
  return codeToName[location.country] || countryName;
}

interface LocationContext {
  country: string;
  countryName?: string | undefined;
  region?: string | undefined;
  city?: string | undefined;
  currency?: string | undefined;
}

/**
 * Generate location-specific portfolio indicators using Anthropic API
 */
async function generateDynamicPortfolioIndicators(location: LocationContext): Promise<Record<PortfolioSize, PortfolioIndicator> | null> {
  try {
    console.log('🚀 Calling /api/quote-calculator with location:', location);
    
    const response = await fetch('/api/quote-calculator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        portfolioSizes: [] // Claude will generate dynamic ranges
      }),
    });

    console.log('📡 API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API response error:', response.status, errorText);
      throw new Error(`API response not ok: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API response data received:', Object.keys(data));
    
    if (data.portfolioIndicators) {
      console.log('🎯 Portfolio indicators found in response');
      return data.portfolioIndicators;
    } else {
      console.error('❌ No portfolioIndicators in response:', data);
      return null;
    }
  } catch (error) {
    console.error('💥 Failed to generate dynamic portfolio indicators:', error);
    return null;
  }
}

/**
 * Get portfolio indicators with location-based customization
 * Falls back to static data if dynamic generation fails
 */
export async function getPortfolioIndicators(location?: LocationContext): Promise<Record<PortfolioSize, PortfolioIndicator>> {
  // If no location provided, return static data
  if (!location?.country) {
    return PORTFOLIO_INFO;
  }

  // Create normalized cache key for consistency between auto-detected and manual selection
  const cacheKey = normalizeCacheKey(location);
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached portfolio indicators for:', cacheKey, '(cache size:', cache.size, ')');
    return cached.data;
  }

  try {
    // Try to get dynamic data
    console.log('🌍 Generating location-specific portfolio indicators for:', location.countryName || location.country);
    const dynamicData = await generateDynamicPortfolioIndicators(location);
    
    if (dynamicData) {
      // Cache the result
      const cacheEntry: CacheEntry = {
        data: dynamicData,
        timestamp: Date.now(),
        location: cacheKey
      };
      cache.set(cacheKey, cacheEntry);
      
      // Persist to localStorage
      saveCacheToStorage(cache);
      
      console.log('✅ Successfully generated and cached portfolio indicators for:', cacheKey, '(cache size:', cache.size, ')');
      return dynamicData;
    }
  } catch (error) {
    console.error('Error generating dynamic portfolio indicators:', error);
  }

  // Fallback to static data with location-aware adjustments
  console.log('📋 Using static portfolio indicators as fallback');
  return getLocationAdjustedStaticData(location);
}

/**
 * Apply basic location-based adjustments to static data
 */
function getLocationAdjustedStaticData(location: LocationContext): Record<PortfolioSize, PortfolioIndicator> {
  const adjustedData = { ...PORTFOLIO_INFO };
  
  // Apply currency-based revenue adjustments
  const currencyMultiplier = getCurrencyMultiplier(location.currency || 'USD');
  
  Object.keys(adjustedData).forEach(key => {
    const portfolioKey = key as PortfolioSize;
    const originalData = adjustedData[portfolioKey];
    if (originalData) {
      adjustedData[portfolioKey] = {
        ...originalData,
        averageRevenue: {
          min: Math.round(originalData.averageRevenue.min * currencyMultiplier),
          max: Math.round(originalData.averageRevenue.max * currencyMultiplier)
        },
        description: getLocationAdjustedDescription(originalData.description, location)
      };
    }
  });

  return adjustedData;
}

/**
 * Get currency multiplier for revenue adjustments
 */
function getCurrencyMultiplier(currency: string): number {
  const multipliers: Record<string, number> = {
    'USD': 1.0,
    'AUD': 1.5,
    'CAD': 1.35,
    'GBP': 0.8,
    'EUR': 0.9,
    'NZD': 1.6,
    'SGD': 1.35,
    'PHP': 56.0
  };
  
  return multipliers[currency] || 1.0;
}

/**
 * Adjust description based on location
 */
function getLocationAdjustedDescription(description: string, location: LocationContext): string {
  // Return original description without location-specific text
  return description;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearPortfolioIndicatorsCache(): void {
  cache.clear();
  
  // Also clear localStorage
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_VERSION_KEY);
    console.log('🗑️ Portfolio indicators cache cleared from memory and localStorage');
  } catch (error) {
    console.warn('⚠️ Failed to clear localStorage cache:', error);
    console.log('🗑️ Portfolio indicators cache cleared from memory only');
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[]; duration: number } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
    duration: CACHE_DURATION
  };
}

/**
 * Check if cache has entry for a specific country
 */
export function hasCachedData(country: string): boolean {
  const normalizedKey = normalizeCacheKey({ country });
  const entry = cache.get(normalizedKey);
  return entry ? (Date.now() - entry.timestamp) < CACHE_DURATION : false;
}

/**
 * Get static portfolio indicators (for fallback or testing)
 */
export function getStaticPortfolioIndicators(): Record<PortfolioSize, PortfolioIndicator> {
  return PORTFOLIO_INFO;
}

// Cache for roles data - consistent with portfolio indicators cache
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

// Load roles cache from localStorage on initialization
function loadRolesCacheFromStorage(): Map<string, RolesCacheEntry> {
  try {
    const stored = localStorage.getItem('scalemate-roles-cache');
    if (!stored) return new Map();
    
    const parsed = JSON.parse(stored);
    return new Map(parsed.map(([key, value]: [string, RolesCacheEntry]) => [key, value]));
  } catch (error) {
    console.warn('Failed to load roles cache from localStorage:', error);
    return new Map();
  }
}

function loadRolesSalaryCacheFromStorage(): Map<string, RolesSalaryCacheEntry> {
  try {
    const stored = localStorage.getItem('scalemate-roles-salary-cache');
    if (!stored) return new Map();
    
    const parsed = JSON.parse(stored);
    return new Map(parsed.map(([key, value]: [string, RolesSalaryCacheEntry]) => [key, value]));
  } catch (error) {
    console.warn('Failed to load roles salary cache from localStorage:', error);
    return new Map();
  }
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

const rolesCache = typeof window !== 'undefined' ? loadRolesCacheFromStorage() : new Map<string, RolesCacheEntry>();
const rolesSalaryCache = typeof window !== 'undefined' ? loadRolesSalaryCacheFromStorage() : new Map<string, RolesSalaryCacheEntry>();

/**
 * Generate dynamic roles data using Anthropic API
 */
async function generateDynamicRoles(location: LocationContext): Promise<typeof ROLES | null> {
  try {
    console.log('🚀 Calling /api/quote-calculator for roles with location:', location);
    
    const response = await fetch('/api/quote-calculator', {
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
    console.log('✅ API response data received:', Object.keys(data));
    
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
    console.log('🚀 Calling /api/quote-calculator for salary data with location:', location);
    
    const response = await fetch('/api/quote-calculator', {
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
    console.log('✅ API response data received:', Object.keys(data));
    
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

  // Create normalized cache key for consistency
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

  // Create normalized cache key for consistency
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
  
  // Also clear localStorage
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

// Business tier detection - both static and dynamic versions
export function detectBusinessTier(data: { propertyCount: number; currentTeamSize: number; annualRevenue?: number }, portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>): 'growing' | 'large' | 'major' | 'enterprise' {
  const { propertyCount, currentTeamSize, annualRevenue } = data;
  
  if (portfolioIndicators) {
    // Dynamic tier detection based on portfolio indicators
    const sortedIndicators = Object.entries(portfolioIndicators)
      .filter(([size]) => size !== 'manual')
      .sort((a, b) => a[1].min - b[1].min);
    
    // Property count thresholds from portfolio indicators
    for (const [size, indicator] of sortedIndicators.reverse()) {
      if (propertyCount >= indicator.min) {
        return indicator.tier;
      }
    }
    
    // Team size detection using portfolio indicators recommended team sizes
    for (const [size, indicator] of sortedIndicators.reverse()) {
      const totalRecommendedTeam = Object.values(indicator.recommendedTeamSize || {}).reduce((sum: number, count) => sum + (count as number || 0), 0);
      if (currentTeamSize >= totalRecommendedTeam) {
        return indicator.tier;
      }
    }
    
    // Revenue detection using portfolio indicators average revenue
    if (annualRevenue && annualRevenue > 0) {
      for (const [size, indicator] of sortedIndicators.reverse()) {
        if (annualRevenue >= indicator.averageRevenue.min) {
          return indicator.tier;
        }
      }
    }
    
    // Default to the smallest tier
    return sortedIndicators[0]?.[1]?.tier || 'growing';
  } else {
    // Static tier detection (fallback)
    // Primary tier detection based on property count
    if (propertyCount >= 5000) return 'enterprise';
    if (propertyCount >= 2000) return 'major';
    if (propertyCount >= 1000) return 'large';
    if (propertyCount >= 500) return 'growing';
    
    // Secondary detection based on team size for edge cases
    if (currentTeamSize >= 20) return 'enterprise';
    if (currentTeamSize >= 10) return 'major';
    if (currentTeamSize >= 5) return 'large';
    
    // Tertiary detection based on actual revenue (if provided)
    if (annualRevenue && annualRevenue > 0) {
      if (annualRevenue >= 15000000) return 'enterprise';
      if (annualRevenue >= 4000000) return 'major';
      if (annualRevenue >= 1500000) return 'large';
    }
    
    // Default to growing for smaller portfolios
    return 'growing';
  }
}

// Enhanced multi-country salary data with detailed breakdowns
export const ROLES_SALARY_COMPARISON: Readonly<Record<string, MultiCountryRoleSalaryData>> = {
  assistantPropertyManager: {
    AU: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    US: {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 70000, total: 91000, benefits: 14000, taxes: 21000 }
    },
    CA: {
      entry: { base: 40000, total: 52000, benefits: 8000, taxes: 12000 },
      moderate: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      experienced: { base: 67000, total: 87100, benefits: 13400, taxes: 20100 }
    },
    UK: {
      entry: { base: 28000, total: 36400, benefits: 5600, taxes: 8400 },
      moderate: { base: 36000, total: 46800, benefits: 7200, taxes: 10800 },
      experienced: { base: 46000, total: 59800, benefits: 9200, taxes: 13800 }
    },
    NZ: {
      entry: { base: 43000, total: 55900, benefits: 8600, taxes: 12900 },
      moderate: { base: 56000, total: 72800, benefits: 11200, taxes: 16800 },
      experienced: { base: 72000, total: 93600, benefits: 14400, taxes: 21600 }
    },
    SG: {
      entry: { base: 36000, total: 46800, benefits: 7200, taxes: 10800 },
      moderate: { base: 47000, total: 61100, benefits: 9400, taxes: 14100 },
      experienced: { base: 60000, total: 78000, benefits: 12000, taxes: 18000 }
    },
    PH: {
      entry: { base: 8000, total: 10400, benefits: 1600, taxes: 2400 },
      moderate: { base: 12000, total: 15600, benefits: 2400, taxes: 3600 },
      experienced: { base: 18000, total: 23400, benefits: 3600, taxes: 5400 }
    }
  },
  leasingCoordinator: {
    AU: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 85000, total: 110500, benefits: 17000, taxes: 25500 }
    },
    US: {
      entry: { base: 48000, total: 62400, benefits: 9600, taxes: 14400 },
      moderate: { base: 63000, total: 81900, benefits: 12600, taxes: 18900 },
      experienced: { base: 78000, total: 101400, benefits: 15600, taxes: 23400 }
    },
    CA: {
      entry: { base: 46000, total: 59800, benefits: 9200, taxes: 13800 },
      moderate: { base: 60000, total: 78000, benefits: 12000, taxes: 18000 },
      experienced: { base: 75000, total: 97500, benefits: 15000, taxes: 22500 }
    },
    UK: {
      entry: { base: 32000, total: 41600, benefits: 6400, taxes: 9600 },
      moderate: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      experienced: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 }
    },
    NZ: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 81000, total: 105300, benefits: 16200, taxes: 24300 }
    },
    SG: {
      entry: { base: 42000, total: 54600, benefits: 8400, taxes: 12600 },
      moderate: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      experienced: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 }
    },
    PH: {
      entry: { base: 10000, total: 13000, benefits: 2000, taxes: 3000 },
      moderate: { base: 15000, total: 19500, benefits: 3000, taxes: 4500 },
      experienced: { base: 22000, total: 28600, benefits: 4400, taxes: 6600 }
    }
  },
  marketingSpecialist: {
    AU: {
      entry: { base: 55000, total: 71500, benefits: 11000, taxes: 16500 },
      moderate: { base: 72000, total: 93600, benefits: 14400, taxes: 21600 },
      experienced: { base: 95000, total: 123500, benefits: 19000, taxes: 28500 }
    },
    US: {
      entry: { base: 52000, total: 67600, benefits: 10400, taxes: 15600 },
      moderate: { base: 68000, total: 88400, benefits: 13600, taxes: 20400 },
      experienced: { base: 88000, total: 114400, benefits: 17600, taxes: 26400 }
    },
    CA: {
      entry: { base: 50000, total: 65000, benefits: 10000, taxes: 15000 },
      moderate: { base: 65000, total: 84500, benefits: 13000, taxes: 19500 },
      experienced: { base: 84000, total: 109200, benefits: 16800, taxes: 25200 }
    },
    UK: {
      entry: { base: 35000, total: 45500, benefits: 7000, taxes: 10500 },
      moderate: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      experienced: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 }
    },
    NZ: {
      entry: { base: 53000, total: 68900, benefits: 10600, taxes: 15900 },
      moderate: { base: 69000, total: 89700, benefits: 13800, taxes: 20700 },
      experienced: { base: 90000, total: 117000, benefits: 18000, taxes: 27000 }
    },
    SG: {
      entry: { base: 45000, total: 58500, benefits: 9000, taxes: 13500 },
      moderate: { base: 58000, total: 75400, benefits: 11600, taxes: 17400 },
      experienced: { base: 76000, total: 98800, benefits: 15200, taxes: 22800 }
    },
    PH: {
      entry: { base: 12000, total: 15600, benefits: 2400, taxes: 3600 },
      moderate: { base: 18000, total: 23400, benefits: 3600, taxes: 5400 },
      experienced: { base: 28000, total: 36400, benefits: 5600, taxes: 8400 }
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