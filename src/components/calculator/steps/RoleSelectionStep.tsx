'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomRole } from '@/types/calculator';
import { LocationData, ManualLocation } from '@/types/location';
import { useQuoteCalculatorData } from '@/hooks/useQuoteCalculatorData';
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
  Filter
} from 'lucide-react';
import { 
  calculateIndividualRoleSavings, 
  calculateRoleCosts, 
  calculateTotalSavings,
  calculatePhpConversionDisplay,
  calculateDisplaySavings,
  calculateAllRoleRatesAndSummary
} from '@/utils/calculations';

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
    return `${country}-${currency}`;
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

  // All available roles (predefined + additional + custom) - Limited to first 3
  const allRoles = useMemo(() => {
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
    
    const predefinedRoles = Object.values(availableRoles).slice(0, 3) as RoleData[];
    const customRolesList = Object.values(customRoles || {}) as RoleData[];
    
    return [...predefinedRoles, ...customRolesList];
  }, [roles, customRoles, isLoadingRoles, isUsingDynamicRoles, rolesError]);

  // Remove the local getSavingsForRole function and replace with centralized version
  const getRoleSavings = async (role: any) => {
    return await calculateIndividualRoleSavings(role, stableUserLocation, stableManualLocation, roles);
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
            const savings = await calculateIndividualRoleSavings(role, stableUserLocation, stableManualLocation, roles);
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
  }, [allRoles, teamSize, locationCacheKey, roles]);

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
    return calculateTotalSavings(selectedRoles, teamSize, allRoles, stableUserLocation, stableManualLocation, roles);
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

    // Sort roles
    filtered.sort((a, b) => {
      switch (searchFilters.sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'savings':
          const aSavings = getCachedRoleSavings(a);
          const bSavings = getCachedRoleSavings(b);
          return bSavings.experienced - aSavings.experienced;
        case 'recent':
          if (a.type === 'custom' && b.type === 'custom') {
            return new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime();
          }
          return a.type === 'custom' ? -1 : 1;
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

  const handleCustomRoleSubmit = () => {
    if (!customRoleForm.title.trim()) return;
    
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
    
    // Reset form
    setCustomRoleForm({
      title: '',
      description: '',
      estimatedSalary: 50000
    });
    setShowCustomRoleForm(false);
    
    onChange(selectedRoles, teamSize, newCustomRoles, userLocation);
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
              roles
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
  }, [allRoles, teamSize, searchFilters.savingsView, locationCacheKey, roles]);

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
          roles,
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
  }, [selectedRoles, teamSize, allRoles, searchFilters.savingsView, locationCacheKey, roles]);

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
              roles
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
  }, [allRoles, teamSize, searchFilters.savingsView, locationCacheKey, roles]);

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
          roles,
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
  }, [allRoles, selectedRoles, teamSize, locationCacheKey, roles, searchFilters.savingsView]);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-headline-1 text-neutral-900">
            Role Selection
          </h2>
          {/* AI Indicator beside title */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
            isUsingDynamicRoles 
              ? 'bg-purple-50 border border-purple-200'
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isLoadingRoles 
                ? 'bg-purple-500 animate-pulse'
                : isUsingDynamicRoles 
                  ? 'bg-purple-500'
                  : 'bg-gray-500'
            }`}></div>
            <span className={`text-xs font-medium ${
              isUsingDynamicRoles 
                ? 'text-purple-700'
                : 'text-gray-700'
            }`}>
              Powered by AI
            </span>
          </div>
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
            <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search roles (e.g., property manager, leasing, marketing...)"
              value={searchFilters.query}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, query: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors"
            />
          </div>
          
          {/* Add Custom Role Button */}
          <button
            onClick={() => setShowCustomRoleForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white rounded-lg hover:shadow-neural-glow transition-all duration-200 flex items-center justify-center gap-2 font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Add Custom Role
          </button>
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

      {/* Custom Role Form */}
      {showCustomRoleForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-900">Create Custom Role</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">Role Title*</label>
              <input
                type="text"
                placeholder="e.g., Property Data Analyst"
                value={customRoleForm.title}
                onChange={(e) => setCustomRoleForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-green-800 mb-1">
                Estimated Local Salary ({getEffectiveCurrencySymbol(userLocation, manualLocation)})
              </label>
              <input
                type="number"
                value={customRoleForm.estimatedSalary}
                onChange={(e) => setCustomRoleForm(prev => ({ ...prev, estimatedSalary: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-green-800 mb-1">Description</label>
              <textarea
                placeholder="Describe the key responsibilities and tasks for this role..."
                value={customRoleForm.description}
                onChange={(e) => setCustomRoleForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCustomRoleSubmit}
              disabled={!customRoleForm.title.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Role
            </button>
            <button
              onClick={() => setShowCustomRoleForm(false)}
              className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredRoles.map((role) => {
          const isSelected = selectedRoles[role.id];
          const currentTeamSize = teamSize[role.id] || 1;
          const savings = getCachedRoleSavings(role);
          const costs = calculateRoleCosts(role, currentTeamSize, userLocation, manualLocation, roles, searchFilters.savingsView);
          
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-full"
            >
              <div
                className={`
                  p-6 rounded-xl border-2 cursor-pointer h-full flex flex-col
                  ${isSelected 
                    ? 'border-brand-primary-500 bg-brand-primary-50 shadow-lg' 
                    : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:bg-brand-primary-25'
                  }
                `}
                onClick={() => handleRoleToggle(role.id)}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-primary-500 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Role Header */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl">{role.icon}</div>
                    {role.type === 'custom' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Custom
                      </span>
                    )}
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
                              const roleSalaryData = roles?.[role.id]?.salary;
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
            onClick={() => setShowCustomRoleForm(true)}
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
              <h3 className="text-lg font-bold text-neural-blue-900 mb-2">
                Total Summary
              </h3>
              <p className="text-sm text-neutral-600">
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
                    <div>
                      <div className="text-sm text-gray-600 font-bold mb-2">
                        {getDisplayCountryName(userLocation, manualLocation)} {displayPeriod} Cost
                      </div>
                      <div className="text-xl font-bold text-red-600">
                        {currencySymbol}{formatNumberPrecise(summaryData.totalLocalCost ?? 0, { showDecimals: false })}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 font-bold mb-2">
                        Philippines {displayPeriod} Cost
                      </div>
                      <div className="text-xl font-bold text-blue-600">
                        ₱{formatNumberPrecise(summaryData.totalPhilippinesCostPHP ?? 0, { showDecimals: false })}
                      </div>
                      <div className="text-xs text-blue-500">
                        {summaryPhilippinesCostConverted}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-600 font-bold mb-2">
                         {displayPeriod} Savings
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {currencySymbol}{formatNumberPrecise(summaryData.totalSavings ?? 0, { showDecimals: false })}
                      </div>
                      <div className="text-xs text-green-500">
                        {summaryData.percentage.toFixed(1)}% Savings
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