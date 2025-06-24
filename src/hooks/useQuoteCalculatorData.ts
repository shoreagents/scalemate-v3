import { useState, useEffect, useCallback } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';

// Helper function to get currency symbol from currency code
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'AUD': 'A$',
    'CAD': 'C$',
    'GBP': '£',
    'EUR': '€',
    'NZD': 'NZ$',
    'SGD': 'S$',
    'PHP': '₱',
    'JPY': '¥',
    'KRW': '₩',
    'CNY': '¥',
    'INR': '₹',
    'BRL': 'R$',
    'MXN': '$',
    'CHF': 'CHF',
    'NOK': 'kr',
    'SEK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RON': 'lei',
    'BGN': 'лв',
    'HRK': 'kn',
    'ILS': '₪',
    'TRY': '₺',
    'RUB': '₽',
    'UAH': '₴',
    'ZAR': 'R',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'VND': '₫',
    'HKD': 'HK$',
    'TWD': 'NT$',
    'ARS': '$',
    'CLP': '$',
    'COP': '$',
    'PEN': 'S/',
  };
  
  return symbols[currencyCode] || '$';
}

// Helper function to detect currency based on country name
export function getCurrencyByCountry(countryName: string): string {
  const countryCurrencyMap: Record<string, string> = {
    'United States': 'USD',
    'United States of America': 'USD',
    'USA': 'USD',
    'US': 'USD',
    'Australia': 'AUD',
    'Canada': 'CAD',
    'United Kingdom': 'GBP',
    'UK': 'GBP',
    'Great Britain': 'GBP',
    'England': 'GBP',
    'Scotland': 'GBP',
    'Wales': 'GBP',
    'Northern Ireland': 'GBP',
    'Germany': 'EUR',
    'France': 'EUR',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'Netherlands': 'EUR',
    'Belgium': 'EUR',
    'Austria': 'EUR',
    'Portugal': 'EUR',
    'Ireland': 'EUR',
    'Finland': 'EUR',
    'Luxembourg': 'EUR',
    'Slovenia': 'EUR',
    'Slovakia': 'EUR',
    'Estonia': 'EUR',
    'Latvia': 'EUR',
    'Lithuania': 'EUR',
    'Malta': 'EUR',
    'Cyprus': 'EUR',
    'Greece': 'EUR',
    'New Zealand': 'NZD',
    'Singapore': 'SGD',
    'Philippines': 'PHP',
    'Japan': 'JPY',
    'South Korea': 'KRW',
    'China': 'CNY',
    'India': 'INR',
    'Brazil': 'BRL',
    'Mexico': 'MXN',
    'Switzerland': 'CHF',
    'Norway': 'NOK',
    'Sweden': 'SEK',
    'Denmark': 'DKK',
    'Poland': 'PLN',
    'Czech Republic': 'CZK',
    'Hungary': 'HUF',
    'Romania': 'RON',
    'Bulgaria': 'BGN',
    'Croatia': 'HRK',
    'Israel': 'ILS',
    'Turkey': 'TRY',
    'Russia': 'RUB',
    'Ukraine': 'UAH',
    'South Africa': 'ZAR',
    'Thailand': 'THB',
    'Malaysia': 'MYR',
    'Indonesia': 'IDR',
    'Vietnam': 'VND',
    'Hong Kong': 'HKD',
    'Taiwan': 'TWD',
    'Argentina': 'ARS',
    'Chile': 'CLP',
    'Colombia': 'COP',
    'Peru': 'PEN'
  };
  
  return countryCurrencyMap[countryName] || 'USD';
}

interface LocationData {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  currency?: string;
  currency_name?: string;
}

interface ManualLocation {
  country: string;
}

interface UseQuoteCalculatorDataResult {
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  isLoading: boolean;
  error: string | null;
  refreshIndicators: () => Promise<void>;
  isUsingDynamicData: boolean;
}

export function useQuoteCalculatorData(
  locationData?: LocationData | null,
  manualLocation?: ManualLocation | null
): UseQuoteCalculatorDataResult {
  const [portfolioIndicators, setPortfolioIndicators] = useState<Record<PortfolioSize, PortfolioIndicator>>(
    getStaticPortfolioIndicators()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDynamicData, setIsUsingDynamicData] = useState(false);

  // Get effective location (manual override takes precedence)
  const getEffectiveLocation = useCallback(() => {
    if (manualLocation?.country) {
      return {
        country: manualLocation.country,
        countryName: manualLocation.country,
        currency: getCurrencyByCountry(manualLocation.country)
      };
    }

    if (locationData?.country_code) {
      return {
        country: locationData.country_code,
        countryName: locationData.country_name || undefined,
        region: locationData.region || undefined,
        city: locationData.city || undefined,
        currency: locationData.currency || undefined
      };
    }

    return null;
  }, [locationData, manualLocation]);

  // Load portfolio indicators based on location
  const loadPortfolioIndicators = useCallback(async () => {
    const location = getEffectiveLocation();
    
    if (!location?.country) {
      // No location available, use static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setIsUsingDynamicData(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading portfolio indicators for location:', location.countryName || location.country);
      
      const indicators = await getPortfolioIndicators(location);
      setPortfolioIndicators(indicators);
      
      // Check if we got dynamic data by comparing with static data
      const staticData = getStaticPortfolioIndicators();
      const isDynamic = JSON.stringify(indicators) !== JSON.stringify(staticData);
      setIsUsingDynamicData(isDynamic);
      
      if (isDynamic) {
        console.log('✅ Using dynamic portfolio indicators for', location.countryName || location.country);
      } else {
        console.log('📋 Using static portfolio indicators (fallback)');
      }
      
    } catch (err) {
      console.error('❌ Error loading portfolio indicators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio indicators');
      
      // Fallback to static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setIsUsingDynamicData(false);
    } finally {
      setIsLoading(false);
    }
  }, [getEffectiveLocation]);

  // Refresh indicators manually
  const refreshIndicators = useCallback(async () => {
    await loadPortfolioIndicators();
  }, [loadPortfolioIndicators]);

  // Load indicators when location changes
  useEffect(() => {
    loadPortfolioIndicators();
  }, [loadPortfolioIndicators]);

  return {
    portfolioIndicators,
    isLoading,
    error,
    refreshIndicators,
    isUsingDynamicData
  };
} 