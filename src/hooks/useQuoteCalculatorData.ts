import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { ManualLocation, LocationData } from '@/types/location';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';
import { getRoles, getRolesSalaryComparison, getStaticRoles, getStaticRolesSalaryComparison, ROLES } from '@/utils/rolesData';
import { getCurrencySymbol, getCurrencyByCountry } from '@/utils/currency';

// Re-export currency utilities for backward compatibility
export { getCurrencySymbol, getCurrencyByCountry };

interface UseQuoteCalculatorDataResult {
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  roles: typeof ROLES;
  rolesSalaryComparison: Awaited<ReturnType<typeof getRolesSalaryComparison>>;
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
  const [portfolioIndicators, setPortfolioIndicators] = useState<Record<PortfolioSize, PortfolioIndicator>>(
    getStaticPortfolioIndicators()
  );
  const [roles, setRoles] = useState<typeof ROLES>(getStaticRoles());
  const [rolesSalaryComparison, setRolesSalaryComparison] = useState(getStaticRolesSalaryComparison());
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
        currency: getCurrencyByCountry(manualLocation.country),
        currencySymbol: getCurrencySymbol(getCurrencyByCountry(manualLocation.country)),
        detected: false
      };
    }
    return locationData || null;
  }, [locationData, manualLocation]);

  // Create location cache key
  const locationCacheKey = useMemo(() => {
    if (!effectiveLocation) return null;
    return `${effectiveLocation.country}-${effectiveLocation.countryName}-${effectiveLocation.currency}`;
  }, [effectiveLocation]);

  // Load portfolio indicators based on location
  const loadPortfolioIndicators = useCallback(async () => {
    // Check if we already processed this location
    if (locationCacheKey && processedLocationRef.current === locationCacheKey) {
      console.log('📋 Skipping portfolio indicators - already processed for:', locationCacheKey);
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
      setIsUsingDynamicData(false);
      setIsLoading(false);
      processedLocationRef.current = null;
      return;
    }

    try {
      console.log('🔄 Loading portfolio indicators for location:', effectiveLocation.countryName || effectiveLocation.country);
      
      const indicators = await getPortfolioIndicators(effectiveLocation);
      setPortfolioIndicators(indicators);
      
      // Mark this location as processed
      processedLocationRef.current = locationCacheKey;
      
      // Check if we got dynamic data by comparing with static data
      const staticData = getStaticPortfolioIndicators();
      const isDynamic = JSON.stringify(indicators) !== JSON.stringify(staticData);
      setIsUsingDynamicData(isDynamic);
      
      if (isDynamic) {
        console.log('✅ Using dynamic portfolio indicators for', effectiveLocation.countryName || effectiveLocation.country);
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
  }, [effectiveLocation, locationCacheKey]);

  // Load roles data based on location
  const loadRolesData = useCallback(async () => {
    // Check if we already processed this location for roles
    if (locationCacheKey && processedRolesLocationRef.current === locationCacheKey) {
      console.log('📋 Skipping roles data - already processed for:', locationCacheKey);
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
      
      // Load both roles and salary data
      const [rolesData, salaryData] = await Promise.all([
        getRoles(effectiveLocation),
        getRolesSalaryComparison(effectiveLocation)
      ]);
      
      console.log('📊 Loaded roles data:', {
        rolesData,
        salaryData,
        location: effectiveLocation
      });
      
      setRoles(rolesData);
      setRolesSalaryComparison(salaryData);
      
      // Mark this location as processed for roles
      processedRolesLocationRef.current = locationCacheKey;
      
      // Check if we got dynamic data by comparing with static data
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      const isDynamicRoles = JSON.stringify(rolesData) !== JSON.stringify(staticRoles);
      const isDynamicSalary = JSON.stringify(salaryData) !== JSON.stringify(staticSalary);
      const isDynamic = isDynamicRoles || isDynamicSalary;
      
      setIsUsingDynamicRoles(isDynamic);
      
      if (isDynamic) {
        console.log('✅ Using dynamic roles data for', effectiveLocation.countryName || effectiveLocation.country);
      } else {
        console.log('📋 Using static roles data (fallback)');
      }
      
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