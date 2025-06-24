// Portfolio Data Service - Dynamic location-based portfolio indicators
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { Country, LocationContext } from '@/types/location';
import { getCurrencyMultiplier, getCurrencyByCountry } from './currency';

// Predefined revenue data for supported Country types
const COUNTRY_REVENUE_DATA: Readonly<Record<Country, Record<PortfolioSize, PortfolioIndicator>>> = {
  AU: {
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
      averageRevenue: { min: 750000, max: 2250000 }, // AUD values
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
      averageRevenue: { min: 2250000, max: 6000000 },
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
      averageRevenue: { min: 6000000, max: 22500000 },
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
      averageRevenue: { min: 22500000, max: 150000000 },
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
      averageRevenue: { min: 0, max: 150000000 },
      implementationComplexity: 'simple'
    }
  },
  US: {
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
      averageRevenue: { min: 500000, max: 1500000 }, // USD values (base)
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
  },
  CA: {
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
      averageRevenue: { min: 675000, max: 2025000 }, // CAD values
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
      averageRevenue: { min: 2025000, max: 5400000 },
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
      averageRevenue: { min: 5400000, max: 20250000 },
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
      averageRevenue: { min: 20250000, max: 135000000 },
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
      averageRevenue: { min: 0, max: 135000000 },
      implementationComplexity: 'simple'
    }
  },
  UK: {
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
      averageRevenue: { min: 400000, max: 1200000 }, // GBP values
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
      averageRevenue: { min: 1200000, max: 3200000 },
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
      averageRevenue: { min: 3200000, max: 12000000 },
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
      averageRevenue: { min: 12000000, max: 80000000 },
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
      averageRevenue: { min: 0, max: 80000000 },
      implementationComplexity: 'simple'
    }
  },
  NZ: {
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
      averageRevenue: { min: 800000, max: 2400000 }, // NZD values
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
      averageRevenue: { min: 2400000, max: 6400000 },
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
      averageRevenue: { min: 6400000, max: 24000000 },
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
      averageRevenue: { min: 24000000, max: 160000000 },
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
      averageRevenue: { min: 0, max: 160000000 },
      implementationComplexity: 'simple'
    }
  },
  SG: {
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
      averageRevenue: { min: 675000, max: 2025000 }, // SGD values
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
      averageRevenue: { min: 2025000, max: 5400000 },
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
      averageRevenue: { min: 5400000, max: 20250000 },
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
      averageRevenue: { min: 20250000, max: 135000000 },
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
      averageRevenue: { min: 0, max: 135000000 },
      implementationComplexity: 'simple'
    }
  }
} as const;

// Static fallback data for portfolio indicators (USD base)
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
  // Use countryName if available (from auto-detection), otherwise use country (from manual selection)
  // Both should already be full country names at this point
  return location.countryName || location.country;
}



/**
 * Generate location-specific portfolio indicators using Anthropic API
 */
async function generateDynamicPortfolioIndicators(location: LocationContext): Promise<Record<PortfolioSize, PortfolioIndicator> | null> {
  try {
    console.log('🚀 Calling /api/anthropic/quote-calculator with location:', location);
    
    const response = await fetch('/api/anthropic/quote-calculator', {
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
 * Helper function to determine if a country code is a supported Country type
 */
function isSupportedCountry(countryCode: string): countryCode is Country {
  return ['AU', 'US', 'CA', 'UK', 'NZ', 'SG'].includes(countryCode);
}

/**
 * Helper function to get country code from location context
 */
function getCountryCodeFromLocation(location: LocationContext): string | null {
  // Try to get 2-letter country code from location context
  if (location.country && location.country.length === 2) {
    return location.country.toUpperCase();
  }
  
  // Fallback: try to convert country name to code
  const countryNameToCode: Record<string, string> = {
    'United States': 'US',
    'Australia': 'AU', 
    'Canada': 'CA',
    'United Kingdom': 'UK',
    'New Zealand': 'NZ',
    'Singapore': 'SG'
  };
  
  return countryNameToCode[location.country] || null;
}

/**
 * Get portfolio indicators with location-based customization
 * Uses predefined data for supported Country types, currency multipliers for others
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

  // Get country code from location for fallback logic
  const countryCode = getCountryCodeFromLocation(location);
  
  // Fallback: Use predefined data for supported Country types when API fails
  if (countryCode && isSupportedCountry(countryCode)) {
    console.log('📋 API failed - using predefined portfolio data for supported country:', countryCode);
    return COUNTRY_REVENUE_DATA[countryCode];
  }

  // Final fallback: Use currency multiplier to adjust static data for unsupported countries
  console.log('💱 Using currency multiplier fallback for:', location.country);
  const currency = location.currency || getCurrencyByCountry(location.country);
  return getLocationAdjustedStaticData(currency);
}

/**
 * Apply currency-based adjustments to static data
 * Only uses currency - other location data not needed for static fallback
 */
function getLocationAdjustedStaticData(currency: string): Record<PortfolioSize, PortfolioIndicator> {
  const adjustedData = { ...PORTFOLIO_INFO };
  
  // Apply currency-based revenue adjustments
  const currencyMultiplier = getCurrencyMultiplier(currency || 'USD');
  
  Object.keys(adjustedData).forEach(key => {
    const portfolioKey = key as PortfolioSize;
    const originalData = adjustedData[portfolioKey];
    if (originalData) {
      adjustedData[portfolioKey] = {
        ...originalData,
        averageRevenue: {
          min: Math.round(originalData.averageRevenue.min * currencyMultiplier),
          max: Math.round(originalData.averageRevenue.max * currencyMultiplier)
        }
        // Note: description unchanged for static fallback
      };
    }
  });

  return adjustedData;
}



// Note: getLocationAdjustedDescription removed - was unused in static fallback

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