import { useState, useEffect, useCallback } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { ManualLocation } from '@/types/location';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';
import { getCurrencySymbol, getCurrencyByCountry } from '@/utils/currency';

// Re-export currency utilities for backward compatibility
export { getCurrencySymbol, getCurrencyByCountry };

interface LocationData {
  ip?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  currency?: string;
  currency_name?: string;
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