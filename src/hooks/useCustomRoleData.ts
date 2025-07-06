import { useState, useCallback, useMemo } from 'react';
import { LocationData, ManualLocation } from '@/types/location';
import { getCurrencySymbol, getDisplayCurrencyByCountry } from '@/utils/currency';

interface CustomRole {
  id: string;
  title: string;
  icon: string;
  description: string;
  category: 'custom';
  type: 'custom';
  color: string;
  salary: any;
  tasks: any[];
  experienceLevels: any[];
  createdAt: string;
}

interface UseCustomRoleDataResult {
  customRole: CustomRole | null;
  isLoading: boolean;
  error: string | null;
  generateCustomRole: (roleName: string, roleDescription?: string) => Promise<CustomRole | null>;
  clearCustomRole: () => void;
  isUsingDynamicData: boolean;
}

export function useCustomRoleData(
  locationData?: LocationData | null,
  manualLocation?: ManualLocation | null
): UseCustomRoleDataResult {
  const [customRole, setCustomRole] = useState<CustomRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDynamicData, setIsUsingDynamicData] = useState(false);

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

  const generateCustomRole = useCallback(async (roleName: string, roleDescription?: string): Promise<CustomRole | null> => {
    if (!effectiveLocation) {
      setError('Location is required to generate custom role data');
      return null;
    }

    if (!roleName.trim()) {
      setError('Custom role name is required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 [CUSTOM-ROLE] Generating custom role data for:', roleName);
      console.log('📡 [CUSTOM-ROLE] Calling /api/anthropic/custom-roles with:', {
        country: effectiveLocation.country,
        countryName: effectiveLocation.countryName,
        currency: effectiveLocation.currency,
        customRoleName: roleName,
        customRoleDescription: roleDescription
      });

      const response = await fetch('/api/anthropic/custom-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: effectiveLocation,
          customRoleName: roleName,
          customRoleDescription: roleDescription
        })
      });

      if (response.ok) {
        let apiData;
        try {
          apiData = await response.json();
        } catch (jsonError) {
          console.error('❌ [CUSTOM-ROLE] Failed to parse API response:', jsonError);
          throw new Error('Invalid response from server');
        }
        
        console.log('✅ [CUSTOM-ROLE] Custom role API response received:', {
          success: apiData.success,
          ai: apiData.ai,
          fallback: apiData.fallback,
          cache: apiData.cache,
          customRole: apiData.customRole?.title,
          tasksCount: apiData.customRole?.tasks?.length || 0
        });

        if (apiData.customRole) {
          setCustomRole(apiData.customRole);
          setIsUsingDynamicData(!!apiData.ai);
          setIsLoading(false);
          return apiData.customRole;
        } else {
          throw new Error('No custom role data received from API');
        }
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        throw new Error(errorData.error || 'Failed to generate custom role data');
      }
    } catch (err) {
      console.error('❌ [CUSTOM-ROLE] Error generating custom role data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate custom role data';
      setError(errorMessage);
      setIsUsingDynamicData(false);
      setIsLoading(false);
      return null;
    }
  }, [effectiveLocation]);

  const clearCustomRole = useCallback(() => {
    setCustomRole(null);
    setError(null);
    setIsUsingDynamicData(false);
  }, []);

  return {
    customRole,
    isLoading,
    error,
    generateCustomRole,
    clearCustomRole,
    isUsingDynamicData
  };
} 