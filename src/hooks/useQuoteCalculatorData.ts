import { useState, useEffect, useCallback } from 'react';
import { PortfolioSize, PortfolioIndicator } from '@/types';
import { ManualLocation } from '@/types/location';
import { getPortfolioIndicators, getStaticPortfolioIndicators } from '@/utils/quoteCalculatorData';
import { getRoles, getRolesSalaryComparison, getStaticRoles, getStaticRolesSalaryComparison, ROLES, ROLES_SALARY_COMPARISON } from '@/utils/rolesData';
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

  // Load roles data based on location
  const loadRolesData = useCallback(async () => {
    const location = getEffectiveLocation();
    
    if (!location?.country) {
      // No location available, use static data
      setRoles(getStaticRoles());
      setRolesSalaryComparison(getStaticRolesSalaryComparison());
      setIsUsingDynamicRoles(false);
      setRolesError(null);
      return;
    }

    setIsLoadingRoles(true);
    setRolesError(null);

    try {
      console.log('🔄 Loading roles data for location:', location.countryName || location.country);
      
      // Load both roles and salary data
      const [rolesData, salaryData] = await Promise.all([
        getRoles(location),
        getRolesSalaryComparison(location)
      ]);
      
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
      setRoles(getStaticRoles());
      setRolesSalaryComparison(getStaticRolesSalaryComparison());
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