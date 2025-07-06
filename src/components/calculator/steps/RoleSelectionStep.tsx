'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomRole } from '@/types/calculator';
import { LocationData, ManualLocation } from '@/types/location';
import { useQuoteCalculatorData } from '@/hooks/useQuoteCalculatorData';
import { useCustomRoleData } from '@/hooks/useCustomRoleData';
import { ROLES } from '@/utils/rolesData';
import { 
  getCurrencySymbol, 
  getDisplayCurrencyByCountry,
  getDisplayCurrencyByCountryWithAPIFallback,
  getDirectExchangeRate
} from '@/utils/currency';
import { 
  Users, 
  Search as LucideSearch, 
  Plus, 
  Minus, 
  Sparkles,
  Filter,
  X
} from 'lucide-react';
import { 
  calculateIndividualRoleSavings, 
  calculateRoleCosts, 
  calculateTotalSavings,
  calculatePhpConversionDisplay,
  calculateDisplaySavings,
  calculateAllRoleRatesAndSummary
} from '@/utils/calculations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import pluralize from 'pluralize';

/**
 * Precise number formatting that preserves exact decimal values without rounding
 */
function formatNumberPrecise(num: number, options: { showDecimals?: boolean } = {}): string {
  const { showDecimals = true } = options;
  
  if (!showDecimals) {
    // Truncate instead of round to show exact mathematical result
    const truncated = Math.trunc(num);
    return truncated.toLocaleString();
  }
  
  return num.toLocaleString();
}

interface RoleSelectionStepProps {
  selectedRoles: Record<string, boolean>;
  customRoles: Record<string, CustomRole>;
  teamSize: Record<string, number>;
  userLocation?: LocationData;
  manualLocation?: ManualLocation | null;
  onChange: (
    selectedRoles: Record<string, boolean>, 
    teamSize: Record<string, number>,
    customRoles: Record<string, CustomRole>,
    userLocation?: LocationData
  ) => void;
  
  // Data passed from parent to avoid duplicate API calls
  roles: Record<string, any>;
  isLoadingRoles: boolean;
  rolesError: string | null;
  isUsingDynamicRoles: boolean;
}

interface RoleData {
  id: string;
  title: string;
  description: string;
  icon: string;
  type?: string;
  category?: string;
  tasks?: any[];
  searchKeywords?: string[];
  createdAt?: Date;
  complexity?: string;
  estimatedSalary?: any;
  requiredSkills?: string[];
  optionalSkills?: string[];
  aiGenerated?: boolean;
}

interface RoleSearchFilters {
  query: string;
  showCustomRoles: boolean;
  sortBy: 'name' | 'savings' | 'recent';
  savingsView: 'annual' | 'monthly';
}

interface SavingsRange {
  entry: number;
  moderate: number;
  experienced: number;
  range: string;
}

// Extend CustomRole locally to include locationKey for tracking
import type { CustomRole as BaseCustomRole } from '@/types/calculator';
type CustomRoleWithLocation = BaseCustomRole & { locationKey?: string };

export function RoleSelectionStep({ 
  selectedRoles, 
  customRoles,
  teamSize, 
  userLocation,
  manualLocation,
  onChange,
  
  // Data from parent
    roles, 
    isLoadingRoles, 
    rolesError, 
    isUsingDynamicRoles 
}: RoleSelectionStepProps) {
  // All dynamic data now passed as props from parent to avoid duplicate API calls
  
  // Create stable location cache key to prevent infinite re-renders
  const locationCacheKey = useMemo(() => {
    const country = manualLocation?.country || userLocation?.country || 'US';
    const currency = manualLocation?.currency || userLocation?.currency || 'USD';
    const key = `${country}-${currency}`;
    console.log(`🔄 [RoleSelectionStep] locationCacheKey changed to: ${key}`);
    return key;
  }, [manualLocation?.country, manualLocation?.currency, userLocation?.country, userLocation?.currency]);

  // Create stable location objects to prevent infinite re-renders in async functions
  const stableUserLocation = useMemo(() => userLocation, [userLocation?.country, userLocation?.currency]);
  const stableManualLocation = useMemo(() => manualLocation, [manualLocation?.country, manualLocation?.currency]);

  // Currency handling function - same pattern as PortfolioStep
  // Note: Manual location takes priority over auto-detected location

  const getEffectiveCurrencySymbol = (userLocation?: LocationData, manualLocation?: ManualLocation | null) => {
    let currency: string;
    
    // Manual location takes priority over auto-detected location
    if (manualLocation?.country) {
      currency = getDisplayCurrencyByCountryWithAPIFallback(manualLocation.country, !isUsingDynamicRoles);
    } 
    // Fallback to auto-detected location if no manual selection
    else if (userLocation?.currency) {
      currency = userLocation.currency;
    }
    // Default fallback
    else {
      currency = 'USD';
    }
    
    return getCurrencySymbol(currency);
  };

  // Helper function to get display country name - only shows "United States" when API fails
  const getDisplayCountryName = (userLocation?: LocationData, manualLocation?: ManualLocation | null) => {
    const country = manualLocation?.country || userLocation?.country;
    
    // List of supported countries with salary data
    const supportedCountries = [
      'Australia',
      'Canada',
      'United Kingdom',
      'New Zealand',
      'Singapore',
      'Philippines',
      'United States'
    ];
    
    // If country is supported, use its actual name
    if (country && supportedCountries.includes(country)) {
      return country;
    }
    
    // For unsupported countries:
    // - If API is working: use actual country name
    // - If API failed: show "United States" since we use USA data
    if (!isUsingDynamicRoles) {
      return 'United States';
    } else {
      return country || 'United States';
    }
  };

  // Helper function to get display country name - shows "United States" for unsupported countries
  const getDisplayCountryNameWithAPIFallback = (userLocation?: LocationData, manualLocation?: ManualLocation | null, isAPIFailed: boolean = false) => {
    const country = manualLocation?.country || userLocation?.country;
    
    // List of supported countries with salary data
    const supportedCountries = [
      'Australia',
      'Canada',
      'United Kingdom',
      'New Zealand',
      'Singapore',
      'Philippines',
      'United States'
    ];
    
    // If country is supported, use its actual name
    if (country && supportedCountries.includes(country)) {
      return country;
    }
    
    // For unsupported countries:
    // - If API is working: use actual country name
    // - If API failed: show "United States" since we use USA data
    if (isAPIFailed) {
      return 'United States';
    } else {
      return country || 'United States';
    }
  };

  const [searchFilters, setSearchFilters] = useState<RoleSearchFilters>({
    query: '',
    showCustomRoles: true,
    sortBy: 'savings',
    savingsView: 'annual'
  });
  const [showCustomRoleForm, setShowCustomRoleForm] = useState(false);
  const [customRoleForm, setCustomRoleForm] = useState({
    title: '',
    description: '',
    estimatedSalary: 50000
  });
  const [duplicateRoleError, setDuplicateRoleError] = useState<string | null>(null);
  const [updatingCustomRoles, setUpdatingCustomRoles] = useState<Set<string>>(new Set());
  const isUpdatingRef = useRef(false);

  // Custom role API integration
  const { 
    customRole, 
    isLoading: isLoadingCustomRole, 
    error: customRoleError, 
    generateCustomRole, 
    clearCustomRole,
    isUsingDynamicData: isUsingDynamicCustomRole 
  } = useCustomRoleData(userLocation, manualLocation);

  // Create merged roles object that includes both predefined and custom roles
  const mergedRoles = useMemo(() => {
    // Smart fallback logic based on API state
    let availableRoles;
    
    console.log('🔍 [RoleSelectionStep] Determining data source:', {
      isLoadingRoles,
      rolesExists: !!roles,
      rolesCount: roles ? Object.keys(roles).length : 0,
      isUsingDynamicRoles,
      rolesError
    });
    
    if (isLoadingRoles) {
      // While loading, use static roles to prevent layout shifts
      availableRoles = ROLES;
      console.log('📋 [RoleSelectionStep] Using static roles (loading)');
    } else if (roles && Object.keys(roles).length > 0) {
      // AI data is available and valid - use dynamic roles
      availableRoles = roles;
      console.log('✅ [RoleSelectionStep] Using dynamic roles:', Object.keys(roles));
    } else {
      // AI failed or no data - use static roles as fallback
      availableRoles = ROLES;
      console.log('📋 [RoleSelectionStep] Using static roles (fallback)');
    }
    
    // Merge predefined roles with custom roles
    const merged: Record<string, any> = { ...availableRoles };
    
    // Add custom roles to the merged object
    Object.entries(customRoles || {}).forEach(([roleId, customRole]) => {
      merged[roleId] = {
        id: roleId,
        title: customRole.title,
        description: customRole.description,
        icon: customRole.icon,
        type: 'custom',
        category: 'custom',
        salary: customRole.salary, // Include AI-generated salary data
        tasks: customRole.tasks || [],
        experienceLevels: customRole.experienceLevels || [],
        createdAt: customRole.createdAt,
        aiGenerated: customRole.aiGenerated
      };
    });
    
    console.log('🔗 [RoleSelectionStep] Merged roles:', Object.keys(merged));
    return merged;
  }, [roles, customRoles, isLoadingRoles, isUsingDynamicRoles, rolesError]);

  // All available roles (predefined + additional + custom) - Limited to first 3
  const allRoles = useMemo(() => {
    const predefinedRoles = Object.values(mergedRoles).slice(0, 3) as RoleData[];
    const customRolesList = Object.values(customRoles || {}) as RoleData[];
    
    // Put custom roles first, then predefined roles
    return [...customRolesList, ...predefinedRoles];
  }, [mergedRoles, customRoles]);

  // Remove the local getSavingsForRole function and replace with centralized version
  const getRoleSavings = async (role: any) => {
    return await calculateIndividualRoleSavings(role, stableUserLocation, stableManualLocation, mergedRoles);
  };

  // Add state for role savings
  const [roleSavings, setRoleSavings] = useState<Record<string, any>>({});

  // Update savings calculations
  useEffect(() => {
    const updateRoleSavings = async () => {
      const newSavings: Record<string, any> = {};
      
      for (const role of allRoles) {
        if (role.id) {
          try {
            const savings = await calculateIndividualRoleSavings(role, stableUserLocation, stableManualLocation, mergedRoles);
            newSavings[role.id] = savings;
          } catch (error) {
            console.error('Error calculating savings for role:', role.id, error);
            newSavings[role.id] = {
              entry: 0,
              moderate: 0,
              experienced: 0,
              range: `${getEffectiveCurrencySymbol(stableUserLocation, stableManualLocation)}0`
            };
          }
        }
      }
      
      setRoleSavings(newSavings);
    };

    updateRoleSavings();
  }, [allRoles, teamSize, locationCacheKey, mergedRoles]);

  // Helper function to get cached savings for a role
  const getCachedRoleSavings = (role: any) => {
    return roleSavings[role.id] || {
      entry: 0,
      moderate: 0,
      experienced: 0,
      range: `${getEffectiveCurrencySymbol(stableUserLocation, stableManualLocation)}0`
    };
  };

  // Update total savings calculation to use centralized function
  const getTotalSavings = () => {
    return calculateTotalSavings(selectedRoles, teamSize, allRoles, stableUserLocation, stableManualLocation, mergedRoles);
  };

  // Update sorting logic to use cached savings
  const filteredRoles = useMemo(() => {
    let filtered = allRoles.filter(role => {
      // Text search
      if (searchFilters.query) {
        const query = searchFilters.query.toLowerCase();
        const searchableText = [
          role.title,
          role.description,
          ...((role as any).searchKeywords || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) return false;
      }
      
      // Custom roles filter
      if (!searchFilters.showCustomRoles && role.type === 'custom') {
        return false;
      }
      
      return true;
    });

    // Sort roles - Custom roles always first, then apply sorting to predefined roles
    filtered.sort((a, b) => {
      // Always put custom roles first
      if (a.type === 'custom' && b.type !== 'custom') return -1;
      if (b.type === 'custom' && a.type !== 'custom') return 1;
      
      // If both are custom roles, sort by creation date (newest first)
      if (a.type === 'custom' && b.type === 'custom') {
        return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
      }
      
      // If both are predefined roles, apply the selected sorting
      switch (searchFilters.sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'savings':
          const aSavings = getCachedRoleSavings(a);
          const bSavings = getCachedRoleSavings(b);
          return bSavings.experienced - aSavings.experienced;
        case 'recent':
          return 0; // Predefined roles don't have creation dates
        default:
          return 0;
      }
    });

    return filtered;
  }, [allRoles, searchFilters, userLocation, roleSavings]);

  const handleRoleToggle = (roleId: string) => {
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: !selectedRoles[roleId]
    };
    
    const newTeamSize = { ...teamSize };
    
    if (!selectedRoles[roleId] && !teamSize[roleId]) {
      newTeamSize[roleId] = 1;
    } else if (selectedRoles[roleId]) {
      newTeamSize[roleId] = 0;
    }
    
    onChange(newSelectedRoles, newTeamSize, customRoles, userLocation);
  };

  const handleTeamSizeChange = (roleId: string, change: number) => {
    const currentSize = teamSize[roleId] || 1; // Default to 1 for unselected roles
    const newSize = Math.max(0, currentSize + change); // Removed the upper limit of 10
    
    const newTeamSize = {
      ...teamSize,
      [roleId]: newSize
    };
    
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: newSize > 0
    };
    
    onChange(newSelectedRoles, newTeamSize, customRoles, userLocation);
  };

  const handleCustomRoleSubmit = async () => {
    if (!customRoleForm.title.trim()) return;
    
    if (!customRoleForm.description.trim()) {
      setDuplicateRoleError('Role description is required');
      return;
    }
    
    // Check if role name already exists (case-insensitive, ignore spaces, singular/plural)
    const normalizeRoleName = (str: string) =>
      (str || '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map(word => pluralize.singular(word))
        .join('')
        .trim();
    const normalizedNewRole = normalizeRoleName(customRoleForm.title);
    const existingRole = Object.values(mergedRoles).find(role => 
      normalizeRoleName(role.title) === normalizedNewRole
    );
    
    if (existingRole) {
      setDuplicateRoleError(`Role '${customRoleForm.title.trim()}' already exists. Choose a different role.`);
      return;
    }
    
    // Clear any previous duplicate error
    setDuplicateRoleError(null);
    
    // Generate custom role data using AI API
    const generatedCustomRole = await generateCustomRole(
      customRoleForm.title.trim(), 
      customRoleForm.description.trim()
    );
    
    if (generatedCustomRole) {
      const customRoleId = generatedCustomRole.id;
      const newCustomRole: CustomRole = {
        id: customRoleId,
        title: generatedCustomRole.title,
        description: generatedCustomRole.description,
        category: 'custom',
        icon: generatedCustomRole.icon,
        type: 'custom',
        tasks: generatedCustomRole.tasks || [],
        requiredSkills: [],
        optionalSkills: [],
        estimatedSalary: {
          local: customRoleForm.estimatedSalary,
          philippine: customRoleForm.estimatedSalary * 0.3 // Rough 70% savings estimate
        },
        complexity: 'medium',
        createdAt: new Date(),
        aiGenerated: true,
        // Add AI-generated salary data
        salary: generatedCustomRole.salary,
        experienceLevels: generatedCustomRole.experienceLevels
      };
      
      const newCustomRoles = {
        ...customRoles,
        [customRoleId]: newCustomRole
      };
      
      // Automatically select the newly created custom role
      const newSelectedRoles = {
        ...selectedRoles,
        [customRoleId]: true
      };
      
      // Set team size to 1 for the new custom role
      const newTeamSize = {
        ...teamSize,
        [customRoleId]: 1
      };
      
      // Reset form
      setCustomRoleForm({
        title: '',
        description: '',
        estimatedSalary: 50000
      });
      setShowCustomRoleForm(false);
      
      onChange(newSelectedRoles, newTeamSize, newCustomRoles, userLocation);
    } else {
      // Fallback to basic custom role if AI generation fails
      const customRoleId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newCustomRole: CustomRole = {
        id: customRoleId,
        title: customRoleForm.title.trim(),
        description: customRoleForm.description.trim(),
        category: 'custom',
        icon: '✨',
        type: 'custom',
        tasks: [],
        requiredSkills: [],
        optionalSkills: [],
        estimatedSalary: {
          local: customRoleForm.estimatedSalary,
          philippine: customRoleForm.estimatedSalary * 0.3 // Rough 70% savings estimate
        },
        complexity: 'medium',
        createdAt: new Date(),
        aiGenerated: false
      };
      
      const newCustomRoles = {
        ...customRoles,
        [customRoleId]: newCustomRole
      };
      
      // Automatically select the newly created custom role
      const newSelectedRoles = {
        ...selectedRoles,
        [customRoleId]: true
      };
      
      // Set team size to 1 for the new custom role
      const newTeamSize = {
        ...teamSize,
        [customRoleId]: 1
      };
      
      // Reset form
      setCustomRoleForm({
        title: '',
        description: '',
        estimatedSalary: 50000
      });
      setShowCustomRoleForm(false);
      
      onChange(newSelectedRoles, newTeamSize, newCustomRoles, userLocation);
    }
  };

  const getTotalTeamSize = () => {
    return Object.entries(selectedRoles).reduce((sum, [roleId, isSelected]) => {
      if (!isSelected) return sum;
      return sum + (teamSize[roleId] || 0);
    }, 0);
  };

  // Add state for currency conversions
  const [phpConversions, setPhpConversions] = useState<Record<string, string>>({});
  const [summaryPhilippinesCostConverted, setSummaryPhilippinesCostConverted] = useState<string>('Converting...');

  // Update PHP conversions using centralized function
  useEffect(() => {
    const updatePhpConversions = async () => {
      const newConversions: Record<string, string> = {};
      const targetCurrency = stableManualLocation?.currency || stableUserLocation?.currency || 'USD';
      
      for (const role of allRoles) {
        if (role.id) {
          try {
            const currentTeamSize = teamSize[role.id] || 1;
            const conversion = await calculatePhpConversionDisplay(
              role, 
              currentTeamSize, 
              targetCurrency, 
              searchFilters.savingsView, 
              mergedRoles
            );
            newConversions[role.id] = conversion;
          } catch (error) {
            console.error('Error converting PHP for role:', role.id, error);
            newConversions[role.id] = 'Converting...';
          }
        }
      }
      
      setPhpConversions(newConversions);
    };

    updatePhpConversions();
  }, [allRoles, teamSize, searchFilters.savingsView, locationCacheKey, mergedRoles]);

  // Update summary Philippines cost conversion
  useEffect(() => {
    const updateSummaryPhilippinesCost = async () => {
      try {
        const { summary } = await calculateAllRoleRatesAndSummary(
          allRoles,
          selectedRoles,
          teamSize,
          stableUserLocation,
          stableManualLocation,
          mergedRoles,
          searchFilters.savingsView,
          isUsingDynamicRoles
        );
        const convertedCost = `≈ ${getEffectiveCurrencySymbol(stableUserLocation, stableManualLocation)}${summary.totalPhilippinesCost.toLocaleString()}`;
        setSummaryPhilippinesCostConverted(convertedCost);
      } catch (error) {
        console.error('Error updating summary Philippines cost:', error);
        setSummaryPhilippinesCostConverted('Converting...');
      }
    };

    updateSummaryPhilippinesCost();
  }, [selectedRoles, teamSize, allRoles, searchFilters.savingsView, locationCacheKey, mergedRoles]);

  const [roleDisplaySavings, setRoleDisplaySavings] = useState<Record<string, { displayAmount: number; percentage: string }>>({});

  // Update role display savings with live rates
  useEffect(() => {
    const updateRoleDisplaySavings = async () => {
      const newDisplaySavings: Record<string, { displayAmount: number; percentage: string }> = {};
      for (const role of allRoles) {
        if (role.id) {
          try {
            const currentTeamSize = teamSize[role.id] || 1;
            const displayData = await calculateDisplaySavings(
              role,
              currentTeamSize,
              searchFilters.savingsView,
              stableUserLocation,
              stableManualLocation,
              mergedRoles
            );
            newDisplaySavings[role.id] = displayData;
          } catch (error) {
            newDisplaySavings[role.id] = { displayAmount: 0, percentage: '' };
          }
        }
      }
      setRoleDisplaySavings(newDisplaySavings);
    };
    updateRoleDisplaySavings();
  }, [allRoles, teamSize, searchFilters.savingsView, locationCacheKey, mergedRoles]);

  // State for role rates and summary
  const [roleRates, setRoleRates] = useState<Record<string, { local: number; phConverted: number }>>({});
  const [summaryData, setSummaryData] = useState<{
    totalLocalCost: number;
    totalPhilippinesCost: number;
    totalSavings: number;
    percentage: number;
    totalPhilippinesCostPHP: number;
  }>({
    totalLocalCost: 0,
    totalPhilippinesCost: 0,
    totalSavings: 0,
    percentage: 0,
    totalPhilippinesCostPHP: 0
  });
  const [currencyError, setCurrencyError] = useState<string | null>(null);

  // Update role rates and summary using centralized function
  useEffect(() => {
    const updateRoleRatesAndSummary = async () => {
      try {
        const { roleRates: newRoleRates, summary, error } = await calculateAllRoleRatesAndSummary(
          allRoles,
          selectedRoles,
          teamSize,
          stableUserLocation,
          stableManualLocation,
          mergedRoles,
          searchFilters.savingsView,
          isUsingDynamicRoles
        );
        
        if (error) {
          setCurrencyError(error);
          console.error('Currency API error:', error);
        } else {
          setCurrencyError(null);
          setRoleRates(newRoleRates);
          setSummaryData(summary);
        }
      } catch (error) {
        console.error('Error updating role rates and summary:', error);
        setCurrencyError('Unable to get current exchange rates. Please check your internet connection and try again.');
      }
    };
    updateRoleRatesAndSummary();
  }, [allRoles, selectedRoles, teamSize, locationCacheKey, mergedRoles, searchFilters.savingsView]);

  const handleRemoveCustomRole = (roleId: string) => {
    const newCustomRoles = { ...customRoles };
    delete newCustomRoles[roleId];
    
    // Also clean up selectedRoles and teamSize to prevent the role from appearing in TaskSelectionStep
    const newSelectedRoles = { ...selectedRoles };
    delete newSelectedRoles[roleId];
    
    const newTeamSize = { ...teamSize };
    delete newTeamSize[roleId];
    
    onChange(newSelectedRoles, newTeamSize, newCustomRoles, userLocation);
  };

  // Automatically re-fetch custom role data for all custom roles when location changes
  useEffect(() => {
    // Prevent multiple simultaneous updates
    if (isUpdatingRef.current) {
      console.log(`🔄 [RoleSelectionStep] Skipping effect - already updating`);
      return;
    }
    
    const effectId = Math.random().toString(36).substring(2, 9);
    console.log(`🔄 [RoleSelectionStep] Location change effect triggered - Effect ID: ${effectId}`);
    
    // Build a location key for cache
    const locationKey = `${manualLocation?.country || userLocation?.country || 'US'}|${manualLocation?.currency || userLocation?.currency || 'USD'}`;
    
    console.log(`🔄 [RoleSelectionStep] Location key: ${locationKey} - Effect ID: ${effectId}`);
    console.log(`🔄 [RoleSelectionStep] Custom roles count: ${Object.keys(customRoles).length} - Effect ID: ${effectId}`);
    
    // Check if we have custom roles that need updating
    const customRolesToUpdate = Object.entries(customRoles).filter(([roleId, customRole]) => {
      const customRoleWithLoc = customRole as CustomRoleWithLocation;
      const needsUpdate = !customRoleWithLoc.locationKey || customRoleWithLoc.locationKey !== locationKey;
      console.log(`🔄 [RoleSelectionStep] Role ${customRole.title}: locationKey=${customRoleWithLoc.locationKey}, needsUpdate=${needsUpdate} - Effect ID: ${effectId}`);
      return needsUpdate;
    });

    if (customRolesToUpdate.length === 0) {
      console.log(`🔄 [RoleSelectionStep] No custom roles need location updates - Effect ID: ${effectId}`);
      return;
    }

    console.log(`🔄 [RoleSelectionStep] Location changed, updating ${customRolesToUpdate.length} custom roles for location: ${locationKey} - Effect ID: ${effectId}`);

    // Set updating state for all custom roles that need updating
    const roleIdsToUpdate = customRolesToUpdate.map(([roleId]) => roleId);
    setUpdatingCustomRoles(new Set(roleIdsToUpdate));
    isUpdatingRef.current = true;

    // Use an async function to handle the sequential processing
    const updateCustomRoles = async () => {
      // Process roles sequentially to avoid race conditions
      for (const [roleId, customRole] of customRolesToUpdate) {
        console.log(`🔄 [RoleSelectionStep] Updating custom role: ${customRole.title} (${roleId}) - Effect ID: ${effectId}`);
        
        const newCustomRole = await generateCustomRole(customRole.title, customRole.description);
        if (newCustomRole) {
          // Merge all required fields from the original customRole
          const mergedCustomRole: CustomRoleWithLocation = {
            ...customRole,
            ...newCustomRole,
            createdAt: typeof newCustomRole.createdAt === 'string' ? new Date(newCustomRole.createdAt) : newCustomRole.createdAt,
            locationKey
          };
          const updatedCustomRoles = { ...customRoles, [roleId]: mergedCustomRole };
          onChange(selectedRoles, teamSize, updatedCustomRoles, userLocation);
          
          console.log(`✅ [RoleSelectionStep] Updated custom role: ${customRole.title} - Effect ID: ${effectId}`);
          console.log(`✅ [RoleSelectionStep] Updated custom roles count: ${Object.keys(updatedCustomRoles).length} - Effect ID: ${effectId}`);
        } else {
          console.log(`❌ [RoleSelectionStep] Failed to update custom role: ${customRole.title}`);
        }
        
        // Remove this role from updating state
        setUpdatingCustomRoles(prev => {
          const newSet = new Set(prev);
          newSet.delete(roleId);
          return newSet;
        });
      }
      
      // Clear the updating flag when all roles are processed
      isUpdatingRef.current = false;
    };

    updateCustomRoles();
  }, [locationCacheKey]);

  // Clear updating state when no custom roles are being updated
  useEffect(() => {
    if (updatingCustomRoles.size === 0) {
      return;
    }
    
    // Check if all custom roles have been updated
    const hasUpdatingRoles = Object.keys(customRoles).some(roleId => updatingCustomRoles.has(roleId));
    if (!hasUpdatingRoles) {
      setUpdatingCustomRoles(new Set());
    }
  }, [updatingCustomRoles, customRoles]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">
            Which roles do you want to offshore?
          </h2>
        </div>
        <p className="text-body-large text-neutral-600">
          Search from our comprehensive role library or create custom roles. 
          See transparent savings with location-based comparisons.
        </p>
      </div>

      {/* Currency API Error Banner */}
      {currencyError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-800">Currency Conversion Error</h3>
              <p className="text-sm text-red-700">{currencyError}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col min-[468px]:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400 z-10" />
            <Input
              type="text"
              placeholder="Search roles (e.g., property manager, leasing, marketing...)"
              value={searchFilters.query}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              className="pl-10"
            />
          </div>
          {/* Add Custom Role Button (always visible, disabled when form is open) */}
          <Button
            onClick={() => {
              setShowCustomRoleForm(true);
              setDuplicateRoleError(null); // Clear any previous duplicate error
            }}
            disabled={showCustomRoleForm}
            variant="neural-primary"
            leftIcon={<Plus className="w-5 h-5" />}
            className="whitespace-nowrap"
          >
            Add Custom Role
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <span className="text-sm font-medium text-neutral-700">Sort & Filter:</span>
          </div>
          
          {/* Sort By */}
          <div className="relative">
            <select
              value={searchFilters.sortBy}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                sortBy: e.target.value as any
              }))}
              className="px-3 py-1 pr-8 border border-neutral-300 rounded-md text-sm appearance-none bg-white focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors"
            >
              <option value="savings">Highest Savings</option>
              <option value="name">Name A-Z</option>
              <option value="recent">Recently Added</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Custom Roles Toggle */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={searchFilters.showCustomRoles}
              onChange={(e) => setSearchFilters(prev => ({ 
                ...prev, 
                showCustomRoles: e.target.checked 
              }))}
              className="rounded border-neutral-300"
            />
            Show Custom Roles
          </label>

          {/* Spacer to push savings view to the right */}
          <div className="flex-1"></div>

          {/* Savings View Toggle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">View:</span>
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, savingsView: 'annual' }))}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  searchFilters.savingsView === 'annual'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setSearchFilters(prev => ({ ...prev, savingsView: 'monthly' }))}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  searchFilters.savingsView === 'monthly'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role Cards Grid */}
      {isLoadingRoles ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative h-full">
              <div className="p-6 rounded-xl border-2 border-neutral-200 bg-white flex flex-col h-full">
                {/* Role Header Skeleton */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2 justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                      <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                </div>

                {/* Savings Preview Skeleton */}
                <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                  <div className="text-center mb-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mx-auto" />
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="text-right">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                      <div className="text-right">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-14 mb-1" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                      </div>
                    </div>
                    <div className="border-t border-green-300 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                        <div className="text-right">
                          <div className="h-5 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Size Selector Skeleton */}
                <div className="border-t border-cyber-green-200 pt-4 bg-cyber-green-25 -mx-6 px-6 pb-2 rounded-b-xl overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                      <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Centered Spinner Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-neural-blue-500 border-t-transparent opacity-60" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Show Create Custom Role Form as first card only if showCustomRoleForm is true */}
        {showCustomRoleForm && (
          <motion.div
              key="custom-role-form"
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 rounded-xl border bg-white border-neutral-200 flex flex-col justify-between"
          >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✨</span>
              </div>
                <h3 className="text-lg font-semibold text-neutral-900">Create Custom Role</h3>
            </div>
              <div className="grid grid-cols-1 mb-4">
                <div className="w-full mb-4">
                  <label className="block text-sm font-medium text-neutral-800 mb-1">Role Title</label>
                  <Input
                  type="text"
                  placeholder="e.g., Property Data Analyst"
                  value={customRoleForm.title}
                  onChange={(e) => {
                    setCustomRoleForm(prev => ({ ...prev, title: e.target.value }));
                    // Clear duplicate error when user starts typing
                    if (duplicateRoleError) {
                      setDuplicateRoleError(null);
                    }
                  }}
                  required
                />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-800 mb-1">Description</label>
                <textarea
                  placeholder="Describe the key responsibilities and tasks for this role..."
                  value={customRoleForm.description}
                  onChange={(e) => {
                    setCustomRoleForm(prev => ({ ...prev, description: e.target.value }));
                    // Clear duplicate error when user starts typing
                    if (duplicateRoleError) {
                      setDuplicateRoleError(null);
                    }
                  }}
                  rows={3}
                  required
                  className="w-full p-3 border border-neutral-300 rounded-lg focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 transition-colors"
                />
              </div>
            </div>
              {/* Error Display */}
              {(customRoleError || duplicateRoleError) && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-700">{customRoleError || duplicateRoleError}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-auto">
                <Button
                  type="button"
                  onClick={handleCustomRoleSubmit}
                  disabled={!customRoleForm.title.trim() || !customRoleForm.description.trim() || isLoadingCustomRole}
                  variant="neural-primary"
                  className="px-4 py-2"
                >
                  {isLoadingCustomRole ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    'Create Role'
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowCustomRoleForm(false);
                    clearCustomRole(); // Clear any error state
                    setDuplicateRoleError(null); // Clear duplicate error
                  }}
                  variant="quantum-secondary"
                  className="px-4 py-2"
                  disabled={isLoadingCustomRole}
                >
                  Cancel
                </Button>
              </div>
          </motion.div>
        )}
          {/* Role Cards */}
          {filteredRoles.map((role) => {
            const isSelected = selectedRoles[role.id];
            const currentTeamSize = teamSize[role.id] || 1;
            const savings = getCachedRoleSavings(role);
            const costs = calculateRoleCosts(role, currentTeamSize, userLocation, manualLocation, roles, searchFilters.savingsView);
            const isUpdating = role.type === 'custom' && updatingCustomRoles.has(role.id);
            
            // Show skeleton card for custom roles that are being updated
            if (isUpdating) {
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.22, ease: 'easeInOut' }}
                  className="relative h-full"
                >
                  <div className="p-6 rounded-xl border-2 border-neutral-200 bg-white flex flex-col h-full">
                    {/* Role Header Skeleton */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2 justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                          <div className="w-16 h-4 bg-purple-200 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
                    </div>

                    {/* Savings Preview Skeleton */}
                    <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                      <div className="text-center mb-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mx-auto mb-2" />
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24 mx-auto" />
                      </div>

                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                            <div className="text-right">
                              <div className="h-5 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                          <div className="text-right">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-14 mb-1" />
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                          </div>
                        </div>
                        <div className="border-t border-green-300 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                            <div className="text-right">
                              <div className="h-5 bg-gray-200 rounded animate-pulse w-20 mb-1" />
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                  {/* Centered Spinner Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-neural-blue-500 border-t-transparent opacity-60" />
                  </div>
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={role.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="relative h-full"
              >
                <div
                  className={`
                    p-6 rounded-xl border cursor-pointer h-full flex flex-col transition-colors duration-300
                    ${isSelected 
                      ? 'border-brand-primary-500 bg-brand-primary-50' 
                      : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:bg-brand-primary-25'
                    }
                  `}
                  onClick={() => handleRoleToggle(role.id)}
                >
                  {/* ✖ Remove Button for Custom Roles (top-right, only if not selected) */}
                  {role.type === 'custom' && !isSelected && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        handleRemoveCustomRole(role.id);
                      }}
                      className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-brand-primary-500 focus:outline-none z-20 transition-colors duration-200"
                      title="Remove Custom Role"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                  {/* Selected Indicator */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ duration: 0.1, ease: 'easeInOut' }}
                        className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-primary-500 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Role Header */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2 justify-between">
                      <div className="flex items-center gap-2">
                      <div className="text-2xl">{role.icon}</div>
                      {role.type === 'custom' && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                          Custom
                        </span>
                      )}
                      </div>
                    </div>
                    <h3 className={`
                      text-lg font-bold mb-1
                      ${isSelected ? 'text-brand-primary-700' : 'text-neutral-900'}
                    `}>
                      {role.title}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {role.description}
                    </p>
                  </div>

                  {/* Enhanced Savings Preview with Location Comparison */}
                  {(userLocation || manualLocation) && (
                    <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                      <div className="text-center mb-4">
                        <span className="text-sm font-semibold text-green-800">
                          {searchFilters.savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost Comparison
                          {isSelected && (
                            <span className="block text-xs text-green-600">
                              for {currentTeamSize} Team {currentTeamSize === 1 ? 'Member' : 'Members'}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Location vs Philippines Comparison */}
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-green-700 font-medium">
                              {getDisplayCountryName(userLocation, manualLocation)} Rate:
                            </span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-900">
                                {getEffectiveCurrencySymbol(userLocation, manualLocation)}{formatNumberPrecise(roleRates[role.id]?.local ?? 0, { showDecimals: false })}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-green-700 font-medium">Philippines Rate:</span>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-900">
                              ₱{(() => {
                                // Check both predefined roles and custom roles for salary data
                                const roleSalaryData = roles?.[role.id]?.salary || customRoles?.[role.id]?.salary;
                                const philippineData = roleSalaryData?.Philippines;
                                if (philippineData) {
                                  const entryPH = philippineData.entry.base * currentTeamSize;
                                  const moderatePH = philippineData.moderate.base * currentTeamSize;
                                  const experiencedPH = philippineData.experienced.base * currentTeamSize;
                                  const avgPH = (entryPH + moderatePH + experiencedPH) / 3;
                                  const displayRate = searchFilters.savingsView === 'monthly' 
                                                    ? avgPH / 12
                                                    : avgPH;
                                  return formatNumberPrecise(displayRate, { showDecimals: false });
                                }
                                return '0';
                              })()}
                            </div>
                            <div className="text-xs text-green-600">
                              {roleRates[role.id]?.phConverted !== undefined && (
                                <span>
                                  ≈ {getEffectiveCurrencySymbol(userLocation, manualLocation)}{formatNumberPrecise(roleRates[role.id]?.phConverted ?? 0, { showDecimals: false })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-green-300 pt-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-green-800">Role Cost Savings:</span>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-600">
                                {getEffectiveCurrencySymbol(userLocation, manualLocation)}{(() => {
                                  const local = roleRates[role.id]?.local ?? 0;
                                  const phConverted = roleRates[role.id]?.phConverted ?? 0;
                                  const savings = Math.trunc(local) - Math.trunc(phConverted);
                                  return formatNumberPrecise(savings, { showDecimals: false });
                                })()}
                              </div>
                              <div className="text-xs text-green-600">
                                {(() => {
                                  const local = Math.trunc(roleRates[role.id]?.local ?? 0);
                                  const phConverted = Math.trunc(roleRates[role.id]?.phConverted ?? 0);
                                  if (local > 0) {
                                    const savings = local - phConverted;
                                    const percentage = (savings / local) * 100;
                                    return `${percentage.toFixed(1)}% Savings`;
                                  }
                                  return '0.0% savings';
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Team Size Selector */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-t border-cyber-green-200 pt-4 bg-cyber-green-25 -mx-6 px-6 pb-2 rounded-b-xl overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cyber-green-700">Team Size:</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTeamSizeChange(role.id, -1);
                              }}
                              className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                ${currentTeamSize > 0 
                                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                                  : 'bg-neutral-100 text-neutral-400'
                                }
                              `}
                              disabled={currentTeamSize <= 0}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            
                            <span className="w-8 text-center font-bold text-cyber-green-700">
                              {currentTeamSize}
                            </span>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTeamSizeChange(role.id, 1);
                              }}
                              className="w-8 h-8 rounded-full bg-cyber-green-100 text-cyber-green-600 hover:bg-cyber-green-200 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
        </AnimatePresence>
      )}

      {/* No Results */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LucideSearch className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No roles found</h3>
          <p className="text-neutral-600 mb-4">
            Try adjusting your search or filters, or create a custom role.
          </p>
          <button
            onClick={() => {
              setShowCustomRoleForm(true);
              setDuplicateRoleError(null); // Clear any previous duplicate error
            }}
            className="px-4 py-2 bg-brand-primary-500 text-white rounded-lg hover:bg-brand-primary-600 transition-colors"
          >
            Create Custom Role
          </button>
        </div>
      )}

      {/* Summary Card */}
      {Object.values(selectedRoles).some(Boolean) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-neural-blue-50/30 border border-neural-blue-100/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-neural-blue-900">
                Summary
              </h3>
              <p className="text-sm text-neutral-600 mb-8">
                Your complete offshore team configuration and savings breakdown.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
              <div className="lg:col-span-3">
                <div className="text-sm text-gray-600 font-bold mb-2">Selected Roles & Team Size</div>
                {/* Selected Roles Badge */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {Object.entries(selectedRoles)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([roleId]) => {
                      const role = allRoles.find(r => r.id === roleId);
                      const size = teamSize[roleId] || 1;
                      if (!role) return null;
                      
                      return (
                        <div
                          key={roleId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-neural-blue-100 text-neural-blue-900 rounded-full text-xs font-medium"
                        >
                          <span className="text-[10px]">{role.icon}</span>
                          <span className="whitespace-nowrap">
                            {role.title}
                          </span>
                          <span className="bg-neural-blue-200 text-neural-blue-800 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                            {size}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>
              
              {(() => {
                const currencySymbol = getEffectiveCurrencySymbol(userLocation, manualLocation);
                const displayPeriod = searchFilters.savingsView === 'monthly' ? 'Monthly' : 'Annual';
                
                return (
                  <>
                    <div className="flex flex-col justify-end items-center">
                      <div className="text-xl font-bold text-red-600">
                        {currencySymbol}{formatNumberPrecise(summaryData.totalLocalCost ?? 0, { showDecimals: false })}
                      </div>
                      <div className="text-sm text-gray-600 font-bold mt-1">
                        {getDisplayCountryName(userLocation, manualLocation)} {displayPeriod} Cost
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-end items-center">
                      <div className="text-xl font-bold text-blue-600">
                        ₱{formatNumberPrecise(summaryData.totalPhilippinesCostPHP ?? 0, { showDecimals: false })}
                      </div>
                      <div className="text-xs text-blue-500">
                        {summaryPhilippinesCostConverted}
                      </div>
                      <div className="text-sm text-gray-600 font-bold mt-1">
                        Philippines {displayPeriod} Cost
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-end items-center">
                      <div className="text-xl font-bold text-green-600">
                        {currencySymbol}{formatNumberPrecise(summaryData.totalSavings ?? 0, { showDecimals: false })}
                      </div>
                      <div className="text-xs text-green-500">
                        {summaryData.percentage.toFixed(1)}% Savings
                      </div>
                      <div className="text-sm text-gray-600 font-bold mt-1">
                        {displayPeriod} Savings
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 