// Portfolio Data Service - Dynamic location-based portfolio indicators
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { LocationData } from '@/types/location';
import { getDirectExchangeRate, getCurrencyByCountry } from './currency';

// Predefined portfolio data for supported countries (using string keys)
const PORTFOLIO_INFO: Readonly<Record<string, Record<PortfolioSize, PortfolioIndicator>>> = {
  Australia: {
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
      averageRevenue: { min: 400000, max: 800000 }, // AUD values - 2025 market-adjusted
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
      averageRevenue: { min: 800000, max: 2000000 },
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
      averageRevenue: { min: 2000000, max: 5000000 },
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
      averageRevenue: { min: 5000000, max: 15000000 },
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
      averageRevenue: { min: 0, max: 15000000 },
      implementationComplexity: 'simple'
    }
  },
  "United States": {
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
      averageRevenue: { min: 300000, max: 700000 }, // USD values - 2025 market-adjusted
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
      averageRevenue: { min: 700000, max: 1800000 },
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
      averageRevenue: { min: 1800000, max: 4500000 },
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
      averageRevenue: { min: 4500000, max: 12000000 },
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
      averageRevenue: { min: 0, max: 12000000 },
      implementationComplexity: 'simple'
    }
  },
  Canada: {
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
      averageRevenue: { min: 400000, max: 900000 }, // CAD values - 2025 market-adjusted
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
      averageRevenue: { min: 900000, max: 2200000 },
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
      averageRevenue: { min: 2200000, max: 5500000 },
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
      averageRevenue: { min: 5500000, max: 16000000 },
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
      averageRevenue: { min: 0, max: 16000000 },
      implementationComplexity: 'simple'
    }
  },
  "United Kingdom": {
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
      averageRevenue: { min: 250000, max: 600000 }, // GBP values - 2025 market-adjusted
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
      averageRevenue: { min: 600000, max: 1500000 },
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
      averageRevenue: { min: 1500000, max: 3800000 },
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
      averageRevenue: { min: 3800000, max: 10000000 },
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
      averageRevenue: { min: 0, max: 10000000 },
      implementationComplexity: 'simple'
    }
  },
  "New Zealand": {
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
      averageRevenue: { min: 450000, max: 950000 }, // NZD values - 2025 market-adjusted
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
      averageRevenue: { min: 950000, max: 2300000 },
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
      averageRevenue: { min: 2300000, max: 5800000 },
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
      averageRevenue: { min: 5800000, max: 17000000 },
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
      averageRevenue: { min: 0, max: 17000000 },
      implementationComplexity: 'simple'
    }
  },
  Singapore: {
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
      averageRevenue: { min: 400000, max: 850000 }, // SGD values - 2025 market-adjusted
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
      averageRevenue: { min: 850000, max: 2100000 },
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
      averageRevenue: { min: 2100000, max: 5200000 },
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
      averageRevenue: { min: 5200000, max: 15000000 },
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
      averageRevenue: { min: 0, max: 15000000 },
    implementationComplexity: 'simple'
    }
  },
  Philippines: {
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
      averageRevenue: { min: 8000000, max: 15000000 }, // PHP values - 2025 market-adjusted
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
      averageRevenue: { min: 15000000, max: 35000000 },
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
      averageRevenue: { min: 35000000, max: 80000000 },
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
      averageRevenue: { min: 80000000, max: 200000000 },
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
      averageRevenue: { min: 0, max: 200000000 },
      implementationComplexity: 'simple'
    }
  }
} as const;

// Default fallback data (using US market as base)
const DEFAULT_PORTFOLIO_INFO = PORTFOLIO_INFO["United States"]!; // Safe because "United States" is always in PORTFOLIO_INFO

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
function normalizeCacheKey(location: LocationData): string {
  // Use countryName if available (from auto-detection), otherwise use country (from manual selection)
  // Both should already be full country names at this point
  return location.countryName || location.country;
}



/**
 * Generate location-specific data using combined Anthropic API
 * Returns both portfolio indicators and roles/salary data
 */
async function generateCombinedLocationData(location: LocationData): Promise<{
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator> | null;
  roles: any | null;
  rolesSalaryComparison: any | null;
}> {
  try {
    console.log('🚀 Calling combined API for location:', location);
    
    const response = await fetch('/api/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        portfolioSizes: ['small', 'medium', 'large']
      }),
    });

    console.log('📡 Combined API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Combined API response error:', response.status, errorText);
      throw new Error(`Combined API response not ok: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Combined API response data received:', Object.keys(data));
    
    return {
      portfolioIndicators: data.portfolioIndicators || null,
      roles: data.roles || null,
      rolesSalaryComparison: data.rolesSalaryComparison || null
    };
  } catch (error) {
    console.error('💥 Failed to generate combined location data:', error);
    return {
      portfolioIndicators: null,
      roles: null,
      rolesSalaryComparison: null
    };
  }
}

/**
 * Generate location-specific portfolio indicators using combined API
 * @deprecated Use generateCombinedLocationData for better efficiency
 */
async function generateDynamicPortfolioIndicators(location: LocationData): Promise<Record<PortfolioSize, PortfolioIndicator> | null> {
  const combinedData = await generateCombinedLocationData(location);
  return combinedData.portfolioIndicators;
}

/**
 * Helper function to get standardized country name from location context
 */
function getCountryNameFromLocation(location: LocationData): string {
  // Use countryName if available (from auto-detection), otherwise use country (from manual selection)
  const countryName = location.countryName || location.country;
  
  // LocationData should already contain full country names, not codes
  // Country code translation is handled during LocationData creation
  return countryName;
}

/**
 * Helper function to check if static data is available for a country
 */
function hasStaticDataForCountry(countryName: string): countryName is keyof typeof PORTFOLIO_INFO {
  return countryName in PORTFOLIO_INFO;
}

/**
 * Helper function to convert portfolio data from USD to target currency
 */
async function convertPortfolioDataToCurrency(
  portfolioData: Record<PortfolioSize, PortfolioIndicator>,
  targetCurrency: string
): Promise<Record<PortfolioSize, PortfolioIndicator>> {
  try {
    const multiplier = await getDirectExchangeRate('USD', targetCurrency);
    
    if (multiplier === 1.0) {
      // No conversion needed for USD
      return portfolioData;
    }
    
    console.log(`💱 Converting portfolio data from USD to ${targetCurrency} (multiplier: ${multiplier})`);
    
    const convertedData: Record<PortfolioSize, PortfolioIndicator> = {};
    
    for (const [size, indicator] of Object.entries(portfolioData)) {
      convertedData[size as PortfolioSize] = {
        ...indicator,
        averageRevenue: {
          min: Math.round(indicator.averageRevenue.min * multiplier),
          max: Math.round(indicator.averageRevenue.max * multiplier)
        }
      };
    }
    
    return convertedData;
  } catch (error) {
    console.warn('Failed to convert portfolio data, using original USD data:', error);
    return portfolioData;
  }
}

/**
 * Get portfolio indicators with location-based customization
 * Uses predefined data for countries with static data, currency multipliers for others
 * Falls back to static data if dynamic generation fails
 */
export async function getPortfolioIndicators(location?: LocationData): Promise<Record<PortfolioSize, PortfolioIndicator>> {
  // If no location provided, return default US data
  if (!location?.country) {
    return DEFAULT_PORTFOLIO_INFO;
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
    // Always try to get dynamic data first (for all locations)
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

  // Get standardized country name from location for fallback logic
  const countryName = getCountryNameFromLocation(location);
  
  // Fallback: Use predefined data if available for this country when API fails
  if (hasStaticDataForCountry(countryName)) {
    const staticData = PORTFOLIO_INFO[countryName]!; // Safe because we checked hasStaticDataForCountry
    console.log('📋 API failed - using predefined portfolio data for country:', countryName);
    return staticData;
  }

  // Final fallback: Use USA data as-is for countries without static data
  console.log('🇺🇸 Using USA portfolio data as-is for country:', location.country);
  
  // Return USA data without conversion
  return DEFAULT_PORTFOLIO_INFO;
}

// getLocationAdjustedStaticData function removed - no longer needed
// Unsupported countries now use USA data as-is without currency conversion



// Note: getLocationAdjustedDescription removed - was unused in static fallback

/**
 * Get static portfolio indicators (for fallback or testing)
 */
export function getStaticPortfolioIndicators(): Record<PortfolioSize, PortfolioIndicator> {
  return DEFAULT_PORTFOLIO_INFO;
}

/**
 * Export the combined data generation function for use by other utilities
 */
export { generateCombinedLocationData };

export async function getPortfolioDataInCurrency(
  targetCurrency: string
): Promise<Record<PortfolioSize, PortfolioIndicator>> {
  try {
    const multiplier = await getDirectExchangeRate('USD', targetCurrency);
    
    if (multiplier === 1.0) {
      return DEFAULT_PORTFOLIO_INFO;
    }
    
    const convertedData: Record<PortfolioSize, PortfolioIndicator> = {};
    
    for (const [size, indicator] of Object.entries(DEFAULT_PORTFOLIO_INFO)) {
      convertedData[size as PortfolioSize] = {
        ...indicator,
        averageRevenue: {
          min: Math.round(indicator.averageRevenue.min * multiplier),
          max: Math.round(indicator.averageRevenue.max * multiplier)
        }
      };
    }
    
    return convertedData;
  } catch (error) {
    console.warn('Failed to convert portfolio data, using USD fallback:', error);
    return DEFAULT_PORTFOLIO_INFO;
  }
} 