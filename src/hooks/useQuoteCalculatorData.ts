import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { ManualLocation, LocationData } from '@/types/location';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';
import { getStaticRoles, getStaticRolesSalaryComparison, ROLES } from '@/utils/rolesData';
import { getCurrencySymbol, getDisplayCurrencyByCountry, getCurrencyByCountry } from '@/utils/currency';

// Re-export for convenience
export { getCurrencySymbol, getDisplayCurrencyByCountry, getCurrencyByCountry };

interface UseQuoteCalculatorDataResult {
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  portfolioCurrency: string;
  portfolioCurrencySymbol: string;
  roles: typeof ROLES;
  rolesSalaryComparison: ReturnType<typeof getStaticRolesSalaryComparison>;
  isLoading: boolean;
  isLoadingRoles: boolean;
  error: string | null;
  rolesError: string | null;
  refreshIndicators: () => Promise<void>;
  refreshRoles: () => Promise<void>;
  isUsingDynamicData: boolean;
  isUsingDynamicRoles: boolean;
}

export function useQuoteCalculatorData(
  locationData?: LocationData | null,
  manualLocation?: ManualLocation | null
): UseQuoteCalculatorDataResult {
  const [portfolioIndicators, setPortfolioIndicators] = useState<Record<PortfolioSize, PortfolioIndicator>>(getStaticPortfolioIndicators());
  const [portfolioCurrency, setPortfolioCurrency] = useState<string>('USD');
  const [portfolioCurrencySymbol, setPortfolioCurrencySymbol] = useState<string>('$');
  const [roles, setRoles] = useState<typeof ROLES>(getStaticRoles());
  const [rolesSalaryComparison, setRolesSalaryComparison] = useState<ReturnType<typeof getStaticRolesSalaryComparison>>(getStaticRolesSalaryComparison());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [isUsingDynamicData, setIsUsingDynamicData] = useState(false);
  const [isUsingDynamicRoles, setIsUsingDynamicRoles] = useState(false);

  // Cache to prevent duplicate API calls for same location
  const processedLocationRef = useRef<string | null>(null);
  const processedRolesLocationRef = useRef<string | null>(null);

  // Get effective location data (manual takes priority) - memoized to prevent recreations
  const effectiveLocation = useMemo((): LocationData | null => {
    if (manualLocation?.country) {
      // Convert manual location to LocationData format
      return {
        country: manualLocation.country as any, // Manual location bypass validation
        countryName: manualLocation.country,
        currency: getDisplayCurrencyByCountry(manualLocation.country),
        currencySymbol: getCurrencySymbol(getDisplayCurrencyByCountry(manualLocation.country)),
        detected: false
      };
    }
    return locationData || null;
  }, [locationData, manualLocation]);

  // Create location cache key (matches backend API cache key format)
  const locationCacheKey = useMemo(() => {
    if (!effectiveLocation) return null;
    const key = `${effectiveLocation.country || ''}|${effectiveLocation.countryName || ''}|${effectiveLocation.currency || ''}`;
    console.log('🔑 [HOOK] Generated cache key:', key, 'for location:', effectiveLocation.country);
    return key;
  }, [effectiveLocation]);

  // Load portfolio indicators based on location
  const loadPortfolioIndicators = useCallback(async () => {
    console.log('🔍 [HOOK] Portfolio cache check:', {
      locationCacheKey,
      processedLocation: processedLocationRef.current,
      isMatch: locationCacheKey === processedLocationRef.current
    });
    
    // Check if we already processed this location
    if (locationCacheKey && processedLocationRef.current === locationCacheKey) {
      console.log('📋 [HOOK] Skipping portfolio indicators - already processed for:', locationCacheKey);
      return;
    }
    
    // Always show loading state, even for static data
    setIsLoading(true);
    setError(null);
    
    // Add a small delay to make loading visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!effectiveLocation) {
      // No location available, use static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setPortfolioCurrency('USD');
      setPortfolioCurrencySymbol('$');
      setIsUsingDynamicData(false);
      setIsLoading(false);
      processedLocationRef.current = null;
      return;
    }

    try {
      console.log('🔄 Loading portfolio indicators for location:', effectiveLocation.countryName || effectiveLocation.country);

      // Try to get dynamic data from API first
      try {
        console.log('🔄 [HOOK] Attempting to fetch dynamic portfolio indicators from AI API for:', effectiveLocation.countryName || effectiveLocation.country);
        console.log('📡 [HOOK] Calling /api/anthropic/quote-calculator with:', {
          country: effectiveLocation.country,
          countryName: effectiveLocation.countryName,
          currency: effectiveLocation.currency,
          requestType: 'portfolio'
        });

        const response = await fetch('/api/anthropic/quote-calculator', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: effectiveLocation,
            requestType: 'portfolio'
          })
        });

        if (response.ok) {
          const apiData = await response.json();
          
          console.log('✅ [HOOK] Quote-calculator API response received:', {
            success: apiData.success,
            ai: apiData.ai,
            fallback: apiData.fallback,
            cache: apiData.cache,
            currency: apiData.currency,
            currencySymbol: apiData.currencySymbol,
            portfolioSizes: apiData.portfolioIndicators ? Object.keys(apiData.portfolioIndicators) : 'N/A'
          });

          if (apiData.portfolioIndicators) {
            setPortfolioIndicators(apiData.portfolioIndicators);
            setPortfolioCurrency(apiData.currency || 'USD');
            setPortfolioCurrencySymbol(apiData.currencySymbol || '$');
            setIsUsingDynamicData(!!apiData.ai);
            // Mark this location as processed
            processedLocationRef.current = locationCacheKey;
            setIsLoading(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ [HOOK] Quote-calculator AI API call failed, falling back to static data:', apiError);
      }

      // Fallback to static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setPortfolioCurrency('USD');
      setPortfolioCurrencySymbol('$');
      setIsUsingDynamicData(false);
      processedLocationRef.current = locationCacheKey;
    } catch (err) {
      console.error('❌ Error loading portfolio indicators:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio indicators');
      // Fallback to static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setPortfolioCurrency('USD');
      setPortfolioCurrencySymbol('$');
      setIsUsingDynamicData(false);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveLocation, locationCacheKey]);

  // Load roles data based on location
  const loadRolesData = useCallback(async () => {
    console.log('🔍 [HOOK] Roles cache check:', {
      locationCacheKey,
      processedRolesLocation: processedRolesLocationRef.current,
      isMatch: locationCacheKey === processedRolesLocationRef.current
    });
    
    // Check if we already processed this location for roles
    if (locationCacheKey && processedRolesLocationRef.current === locationCacheKey) {
      console.log('📋 [HOOK] Skipping roles data - already processed for:', locationCacheKey);
      return;
    }
    
    // Always show loading state, even for static data
    setIsLoadingRoles(true);
    setRolesError(null);
    
    // Add a small delay to make loading visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!effectiveLocation) {
      // No location available, use static data
      console.log('📋 No location data, using static roles data');
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      setRoles(staticRoles);
      setRolesSalaryComparison(staticSalary);
      setIsUsingDynamicRoles(false);
      setIsLoadingRoles(false);
      processedRolesLocationRef.current = null;
      return;
    }

    try {
      console.log('🔄 Loading roles data for location:', effectiveLocation.countryName || effectiveLocation.country);
      
      // Try to get dynamic data from API first
      try {
        console.log('🔄 [HOOK] Attempting to fetch dynamic roles data for:', effectiveLocation.countryName || effectiveLocation.country);
        console.log('📡 [HOOK] Calling /api/anthropic/roles with:', {
          country: effectiveLocation.country,
          countryName: effectiveLocation.countryName,
          currency: effectiveLocation.currency,
          requestType: 'all'
        });
        
        const response = await fetch('/api/anthropic/roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: effectiveLocation,
            requestType: 'all'
          })
        });

        if (response.ok) {
          const apiData = await response.json();
          
          console.log('✅ [HOOK] Roles API response received:', {
            success: apiData.success,
            ai: apiData.ai,
            fallback: apiData.fallback,
            cache: apiData.cache,
            requestType: apiData.requestType,
            roles: apiData.roles ? Object.keys(apiData.roles) : 'N/A',
            salaryComparison: apiData.rolesSalaryComparison ? Object.keys(apiData.rolesSalaryComparison) : 'N/A'
          });
          
          if (apiData.roles && apiData.rolesSalaryComparison) {
            console.log('✅ [HOOK] Using dynamic roles data from API for:', effectiveLocation.countryName || effectiveLocation.country);
            setRoles(apiData.roles);
            setRolesSalaryComparison(apiData.rolesSalaryComparison);
            setIsUsingDynamicRoles(true);
            
            // Mark this location as processed for roles
            processedRolesLocationRef.current = locationCacheKey;
            setIsLoadingRoles(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('⚠️ [HOOK] Roles AI API call failed, falling back to static data:', apiError);
      }
      
      // Fallback to static data
      console.log('📋 Using static roles data (fallback)');
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      setRoles(staticRoles);
      setRolesSalaryComparison(staticSalary);
      setIsUsingDynamicRoles(false);
      
      // Mark this location as processed for roles
      processedRolesLocationRef.current = locationCacheKey;
      
    } catch (err) {
      console.error('❌ Error loading roles data:', err);
      setRolesError(err instanceof Error ? err.message : 'Failed to load roles data');
      
      // Fallback to static data
      console.log('📋 Error occurred, falling back to static data');
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      setRoles(staticRoles);
      setRolesSalaryComparison(staticSalary);
      setIsUsingDynamicRoles(false);
    } finally {
      setIsLoadingRoles(false);
    }
  }, [effectiveLocation, locationCacheKey]);

  // Load indicators when location cache key changes (prevents duplicate calls)
  useEffect(() => {
    loadPortfolioIndicators();
  }, [locationCacheKey]);

  // Load roles when location cache key changes (prevents duplicate calls)
  useEffect(() => {
    loadRolesData();
  }, [locationCacheKey]);

  // Refresh indicators manually - stable reference
  const refreshIndicators = useCallback(async () => {
    await loadPortfolioIndicators();
  }, [loadPortfolioIndicators]);

  // Refresh roles manually - stable reference
  const refreshRoles = useCallback(async () => {
    await loadRolesData();
  }, [loadRolesData]);

  return {
    portfolioIndicators,
    portfolioCurrency,
    portfolioCurrencySymbol,
    roles,
    rolesSalaryComparison,
    isLoading,
    isLoadingRoles,
    error,
    rolesError,
    refreshIndicators,
    refreshRoles,
    isUsingDynamicData,
    isUsingDynamicRoles
  };
} 