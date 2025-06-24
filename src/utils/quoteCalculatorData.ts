// Portfolio Data Service - Dynamic location-based portfolio indicators
import { PortfolioSize, PortfolioIndicator } from '@/types';

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

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

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
    const response = await fetch('/api/quote-calculator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location,
        portfolioSizes: ['500-999', '1000-1999', '2000-4999', '5000+', 'manual']
      }),
    });

    if (!response.ok) {
      throw new Error(`API response not ok: ${response.status}`);
    }

    const data = await response.json();
    return data.portfolioIndicators;
  } catch (error) {
    console.error('Failed to generate dynamic portfolio indicators:', error);
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

  // Create cache key
  const cacheKey = `${location.country}-${location.region || ''}-${location.city || ''}`;
  
  // Check cache first
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log('📊 Using cached portfolio indicators for:', location.countryName || location.country);
    return cached.data;
  }

  try {
    // Try to get dynamic data
    console.log('🌍 Generating location-specific portfolio indicators for:', location.countryName || location.country);
    const dynamicData = await generateDynamicPortfolioIndicators(location);
    
    if (dynamicData) {
      // Cache the result
      cache.set(cacheKey, {
        data: dynamicData,
        timestamp: Date.now(),
        location: location.countryName || location.country
      });
      
      console.log('✅ Successfully generated dynamic portfolio indicators');
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
    adjustedData[portfolioKey] = {
      ...adjustedData[portfolioKey],
      averageRevenue: {
        min: Math.round(adjustedData[portfolioKey].averageRevenue.min * currencyMultiplier),
        max: Math.round(adjustedData[portfolioKey].averageRevenue.max * currencyMultiplier)
      },
      description: getLocationAdjustedDescription(adjustedData[portfolioKey].description, location)
    };
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
  const countryName = location.countryName || location.country;
  
  if (countryName && countryName !== 'Australia') {
    return `${description} - Tailored for ${countryName} market`;
  }
  
  return description;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearPortfolioIndicatorsCache(): void {
  cache.clear();
  console.log('🗑️ Portfolio indicators cache cleared');
}

/**
 * Get static portfolio indicators (for fallback or testing)
 */
export function getStaticPortfolioIndicators(): Record<PortfolioSize, PortfolioIndicator> {
  return PORTFOLIO_INFO;
} 