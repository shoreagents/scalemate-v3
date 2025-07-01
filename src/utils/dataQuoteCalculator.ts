import { 
  RoleId, 
  RoleSalaryData, 
  LocationData
} from '@/types';
import { ROLES } from './rolesData';









// Location detection helper function
export const detectUserLocation = async (): Promise<LocationData> => {
  try {
    // Import here to avoid circular dependencies
    const { fetchIPLocation } = await import('./locationApi');
    const { getCountryFromCode } = await import('../types/location');
    const { getCurrencySymbol, getDisplayCurrencyByCountry } = await import('./currency');
    
    const ipData = await fetchIPLocation();
    
    // Convert IP location data to our standard LocationData format
    const translatedCountry = getCountryFromCode(ipData.country_code);
    const country = translatedCountry || ipData.country_name;
    
    // Use display currency logic to ensure consistency with fallback data
    const displayCurrency = getDisplayCurrencyByCountry(country);
    
    return {
      country: country,
      countryName: ipData.country_name,
      currency: displayCurrency, // Use display currency instead of detected currency
      currencySymbol: getCurrencySymbol(displayCurrency),
      detected: true,
      ipAddress: ipData.ip
    };
  } catch (error) {
    console.error('Failed to detect location:', error);
    // Fallback to default US location
    return {
      country: 'United States',
      countryName: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      detected: false
    };
  }
};

// Salary data with proper typing - Based on 2024 Australian market rates
export const SALARY_DATA: Readonly<Record<RoleId, RoleSalaryData>> = {
  assistantPropertyManager: {
    australian: {
      entry: { base: 45000, total: 72000 },
      moderate: { base: 58000, total: 93000 },
      experienced: { base: 75000, total: 120000 }
    },
    philippine: {
      entry: { base: 8000, total: 10000 },
      moderate: { base: 12000, total: 14000 },
      experienced: { base: 18000, total: 22000 }
    }
  },
  leasingCoordinator: {
    australian: {
      entry: { base: 52000, total: 83000 },
      moderate: { base: 68000, total: 109000 },
      experienced: { base: 85000, total: 136000 }
    },
    philippine: {
      entry: { base: 10000, total: 12000 },
      moderate: { base: 15000, total: 18000 },
      experienced: { base: 22000, total: 26000 }
    }
  },
  marketingSpecialist: {
    australian: {
      entry: { base: 55000, total: 88000 },
      moderate: { base: 72000, total: 115000 },
      experienced: { base: 95000, total: 152000 }
    },
    philippine: {
      entry: { base: 12000, total: 14000 },
      moderate: { base: 18000, total: 22000 },
      experienced: { base: 28000, total: 34000 }
    }
  }
} as const;

// Portfolio indicators are now dynamically generated based on location
// Static data moved to quoteCalculatorData.ts as fallback
// Use getPortfolioIndicators() from quoteCalculatorData instead
export { getPortfolioIndicators, getStaticPortfolioIndicators } from './quoteCalculatorData';









 