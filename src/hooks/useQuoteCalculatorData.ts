import { useState, useEffect, useCallback } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { ManualLocation, LocationData } from '@/types/location';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';
import { getRoles, getRolesSalaryComparison, getStaticRoles, getStaticRolesSalaryComparison, ROLES, ROLES_SALARY_COMPARISON } from '@/utils/rolesData';
import { getCurrencySymbol, getCurrencyByCountry } from '@/utils/currency';

// Re-export currency utilities for backward compatibility
export { getCurrencySymbol, getCurrencyByCountry };

interface UseQuoteCalculatorDataResult {
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  roles: typeof ROLES;
  rolesSalaryComparison: typeof ROLES_SALARY_COMPARISON;
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
  const [rolesSalaryComparison, setRolesSalaryComparison] = useState<typeof ROLES_SALARY_COMPARISON>(getStaticRolesSalaryComparison());
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [isUsingDynamicData, setIsUsingDynamicData] = useState(false);
  const [isUsingDynamicRoles, setIsUsingDynamicRoles] = useState(false);

  // Get effective location data (manual takes priority)
  const getEffectiveLocation = useCallback((): LocationData | null => {
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

  // Load portfolio indicators based on location
  const loadPortfolioIndicators = useCallback(async () => {
    const location = getEffectiveLocation();
    
    // Always show loading state, even for static data
    setIsLoading(true);
    setError(null);
    
    // Add a small delay to make loading visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!location) {
      // No location available, use static data
      setPortfolioIndicators(getStaticPortfolioIndicators());
      setIsUsingDynamicData(false);
      setIsLoading(false);
      return;
    }

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

  // Load roles data based on location
  const loadRolesData = useCallback(async () => {
    const location = getEffectiveLocation();
    
    // Always show loading state, even for static data
    setIsLoadingRoles(true);
    setRolesError(null);
    
    // Add a small delay to make loading visible
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (!location) {
      // No location available, use static data
      console.log('📋 No location data, using static roles data');
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      setRoles(staticRoles);
      setRolesSalaryComparison(staticSalary);
      setIsUsingDynamicRoles(false);
      setIsLoadingRoles(false);
      return;
    }

    try {
      console.log('🔄 Loading roles data for location:', location.countryName || location.country);
      
      // Load both roles and salary data
      const [rolesData, salaryData] = await Promise.all([
        getRoles(location),
        getRolesSalaryComparison(location)
      ]);
      
      console.log('📊 Loaded roles data:', {
        rolesData,
        salaryData,
        location
      });
      
      setRoles(rolesData);
      setRolesSalaryComparison(salaryData);
      
      // Check if we got dynamic data by comparing with static data
      const staticRoles = getStaticRoles();
      const staticSalary = getStaticRolesSalaryComparison();
      const isDynamicRoles = JSON.stringify(rolesData) !== JSON.stringify(staticRoles);
      const isDynamicSalary = JSON.stringify(salaryData) !== JSON.stringify(staticSalary);
      const isDynamic = isDynamicRoles || isDynamicSalary;
      
      setIsUsingDynamicRoles(isDynamic);
      
      if (isDynamic) {
        console.log('✅ Using dynamic roles data for', location.countryName || location.country);
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
  }, [getEffectiveLocation]);

  // Refresh indicators manually
  const refreshIndicators = useCallback(async () => {
    await loadPortfolioIndicators();
  }, [loadPortfolioIndicators]);

  // Refresh roles manually
  const refreshRoles = useCallback(async () => {
    await loadRolesData();
  }, [loadRolesData]);

  // Load indicators when location changes
  useEffect(() => {
    loadPortfolioIndicators();
  }, [loadPortfolioIndicators]);

  // Load roles when location changes
  useEffect(() => {
    loadRolesData();
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