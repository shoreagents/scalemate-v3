// Portfolio Data Service - Static portfolio indicators
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { LocationData } from '@/types/location';

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
      averageRevenue: { min: 250000, max: 500000 }, // GBP values - 2025 market-adjusted
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
      averageRevenue: { min: 500000, max: 1200000 },
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
      averageRevenue: { min: 1200000, max: 3000000 },
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
      averageRevenue: { min: 3000000, max: 8000000 },
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
      averageRevenue: { min: 0, max: 8000000 },
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
      averageRevenue: { min: 400000, max: 800000 }, // NZD values - 2025 market-adjusted
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
      averageRevenue: { min: 350000, max: 700000 }, // SGD values - 2025 market-adjusted
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

// Default portfolio data (US-based)
export const DEFAULT_PORTFOLIO_INFO: Readonly<Record<PortfolioSize, PortfolioIndicator>> = PORTFOLIO_INFO["United States"]!;

// Helper function to get standardized country name from location context
function getCountryNameFromLocation(location: LocationData): string {
  return location.countryName || location.country;
}

// Helper function to check if static data is available for a country
function hasStaticDataForCountry(countryName: string): countryName is keyof typeof PORTFOLIO_INFO {
  return countryName in PORTFOLIO_INFO;
}

/**
 * Get portfolio indicators with location-based customization
 * Uses predefined data for supported countries, falls back to US data for others
 * No longer attempts API calls - uses static data only
 */
export async function getPortfolioIndicators(location?: LocationData): Promise<{
  data: Record<PortfolioSize, PortfolioIndicator>;
  currency: string;
  currencySymbol: string;
}> {
  // If no location provided, return default US data
  if (!location?.country) {
    return {
      data: DEFAULT_PORTFOLIO_INFO,
      currency: 'USD',
      currencySymbol: '$'
    };
  }

  // Get standardized country name from location for fallback logic
  const countryName = getCountryNameFromLocation(location);
  
  // Use predefined data if available for this country
  if (hasStaticDataForCountry(countryName)) {
    console.log('📋 Using predefined portfolio data for country:', countryName);
    
    // Get currency info for the country
    let currency = 'USD';
    let currencySymbol = '$';
    
    switch (countryName) {
      case 'Australia':
        currency = 'AUD';
        currencySymbol = 'A$';
        break;
      case 'Canada':
        currency = 'CAD';
        currencySymbol = 'C$';
        break;
      case 'United Kingdom':
        currency = 'GBP';
        currencySymbol = '£';
        break;
      case 'New Zealand':
        currency = 'NZD';
        currencySymbol = 'NZ$';
        break;
      case 'Singapore':
        currency = 'SGD';
        currencySymbol = 'S$';
        break;
      case 'Philippines':
        currency = 'PHP';
        currencySymbol = '₱';
        break;
      default:
        currency = 'USD';
        currencySymbol = '$';
    }
    
    return {
      data: PORTFOLIO_INFO[countryName]!,
      currency,
      currencySymbol
    };
  }

  // Fallback: Use USA data for countries without static data
  console.log('🇺🇸 Using USA portfolio data for country:', location.country);
  return {
    data: DEFAULT_PORTFOLIO_INFO,
    currency: 'USD',
    currencySymbol: '$'
  };
}

/**
 * Get static portfolio indicators (for fallback or testing)
 */
export function getStaticPortfolioIndicators(): Record<PortfolioSize, PortfolioIndicator> {
  return DEFAULT_PORTFOLIO_INFO;
} 