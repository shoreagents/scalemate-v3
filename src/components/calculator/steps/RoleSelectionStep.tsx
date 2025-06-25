'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { CustomRole } from '@/types';
import { LocationData, ManualLocation } from '@/types/location';
import { getCurrencyByCountry, getCurrencySymbol, useQuoteCalculatorData } from '@/hooks/useQuoteCalculatorData';
import { getCurrencyMultiplier } from '@/utils/currency';
import { 
  Users, 
  Search, 
  Plus, 
  Minus, 
  Sparkles,
  Filter
} from 'lucide-react';

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
}

interface RoleSearchFilters {
  query: string;
  showCustomRoles: boolean;
  sortBy: 'name' | 'savings' | 'recent';
  savingsView: 'annual' | 'monthly';
}

interface SavingsRange {
  entry: number;
  experienced: number;
  range: string;
}

export function RoleSelectionStep({ 
  selectedRoles, 
  customRoles,
  teamSize, 
  userLocation,
  manualLocation,
  onChange 
}: RoleSelectionStepProps) {
  // Load dynamic data based on location
  const { 
    roles, 
    rolesSalaryComparison, 
    isLoadingRoles, 
    rolesError, 
    isUsingDynamicRoles 
  } = useQuoteCalculatorData(userLocation, manualLocation);

  // Currency handling function - same pattern as PortfolioStep
  // Helper function to get effective country from manual or auto location
  const getEffectiveCountry = (userLocation?: LocationData, manualLocation?: ManualLocation | null): string => {
    // Manual location takes priority over auto-detected location
    if (manualLocation?.country) {
      return manualLocation.country; // Return country name directly
    }
    // Fallback to auto-detected location
    else if (userLocation?.country) {
      // Convert country code to country name if needed
      const codeToNameMap: Record<string, string> = {
        'AU': 'Australia',
        'US': 'United States',
        'CA': 'Canada',
        'UK': 'United Kingdom',
        'NZ': 'New Zealand',
        'SG': 'Singapore',
        'PH': 'Philippines'
      };
      return codeToNameMap[userLocation.country] || userLocation.country;
    }
      // Default fallback
  return 'United States';
  };

  const getEffectiveCurrencySymbol = (userLocation?: LocationData, manualLocation?: ManualLocation | null) => {
    let currency: string;
    
    // Manual location takes priority over auto-detected location
    if (manualLocation?.country) {
      currency = getCurrencyByCountry(manualLocation.country);
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
  // Helper function to calculate savings for a role
  const getSavingsForRole = (role: any): SavingsRange => {
    const effectiveCountry = getEffectiveCountry(userLocation, manualLocation);
    
    if (role.type === 'predefined' && role.id && rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison]) {
      const roleSalaryData = rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison];
      if (!roleSalaryData) return { entry: 0, experienced: 0, range: `${getEffectiveCurrencySymbol(userLocation, manualLocation)}0` };
      
      const localSalaryData = roleSalaryData[effectiveCountry as keyof typeof roleSalaryData];
      const philippineSalaryData = roleSalaryData.Philippines;
      
      if (!localSalaryData || !philippineSalaryData) {
        return {
          entry: 0,
          experienced: 0,
          range: `${getEffectiveCurrencySymbol(userLocation, manualLocation)}0`
        };
      }

      // Get user's effective currency for conversion
      let targetCurrency: string;
      if (manualLocation?.country) {
        targetCurrency = getCurrencyByCountry(manualLocation.country);
      } else if (userLocation?.currency) {
        targetCurrency = userLocation.currency;
      } else {
        targetCurrency = 'USD';
      }
      
      // Convert PHP to user's currency
      const phpMultiplier = getCurrencyMultiplier('PHP');
      const targetMultiplier = getCurrencyMultiplier(targetCurrency);
      
      // Convert Philippine salaries to user's currency
      const philippineEntryInUserCurrency = (philippineSalaryData.entry.total / phpMultiplier) * targetMultiplier;
      const philippineExperiencedInUserCurrency = (philippineSalaryData.experienced.total / phpMultiplier) * targetMultiplier;
      
      // Calculate savings (local salary is already in user's currency)
      const entrySavings = localSalaryData.entry.total - philippineEntryInUserCurrency;
      const experiencedSavings = localSalaryData.experienced.total - philippineExperiencedInUserCurrency;
      
      return {
        entry: entrySavings,
        experienced: experiencedSavings,
        range: `${getEffectiveCurrencySymbol(userLocation, manualLocation)}${entrySavings.toLocaleString()} - ${getEffectiveCurrencySymbol(userLocation, manualLocation)}${experiencedSavings.toLocaleString()}`
      };
    } else if (role.estimatedSalary) {
      // For custom roles, calculate a range based on ±20% of the estimated salary
      const entryEstimate = role.estimatedSalary.local * 0.8;
      const experiencedEstimate = role.estimatedSalary.local * 1.2;
      const entryPhilippineEstimate = role.estimatedSalary.philippine * 0.8;
      const experiencedPhilippineEstimate = role.estimatedSalary.philippine * 1.2;
      
      return {
        entry: entryEstimate - entryPhilippineEstimate,
        experienced: experiencedEstimate - experiencedPhilippineEstimate,
        range: `${getEffectiveCurrencySymbol(userLocation, manualLocation)}${(entryEstimate - entryPhilippineEstimate).toLocaleString()} - ${getEffectiveCurrencySymbol(userLocation, manualLocation)}${(experiencedEstimate - experiencedPhilippineEstimate).toLocaleString()}`
      };
    }
    
    return {
      entry: 0,
      experienced: 0,
      range: `${getEffectiveCurrencySymbol(userLocation, manualLocation)}0`
    };
  };

  // All available roles (predefined + additional + custom) - Limited to first 3
  const allRoles = useMemo(() => {
    const predefinedRoles = roles ? Object.values(roles).slice(0, 3) : []; // Only first 3 roles
    const customRolesList = Object.values(customRoles || {});
    
    return [...predefinedRoles, ...customRolesList];
  }, [roles, customRoles]);

  // Filtered and sorted roles
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
          const aSavings = getSavingsForRole(a);
          const bSavings = getSavingsForRole(b);
          return bSavings.experienced - aSavings.experienced;
        case 'recent':
          if (a.type === 'custom' && b.type === 'custom') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return a.type === 'custom' ? -1 : 1;
        default:
          return 0;
      }
    });

    return filtered;
  }, [allRoles, searchFilters, userLocation]);

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
    const newSize = Math.max(0, Math.min(10, currentSize + change));
    
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
        philippine: Math.round(customRoleForm.estimatedSalary * 0.3) // Rough 70% savings estimate
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

  const getTotalSavings = () => {
    return Object.entries(selectedRoles).reduce((total, [roleId, isSelected]) => {
      if (!isSelected) return total;
      
      const role = allRoles.find(r => r.id === roleId);
      if (!role) return total;
      
      const size = teamSize[roleId] || 1;
      const savings = getSavingsForRole(role);
      
      // Use the average of entry and experienced savings for the total
      const averageSavings = (savings.entry + savings.experienced) / 2;
      return total + (averageSavings * size);
    }, 0);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <Users className="w-8 h-8 text-white" />
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

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col min-[468px]:flex-row gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
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
          const savings = getSavingsForRole(role);
          
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative h-full"
            >
              <div
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer h-full flex flex-col
                  ${isSelected 
                    ? 'border-brand-primary-500 bg-brand-primary-50 shadow-lg' 
                    : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-md'
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
                {userLocation && (
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                    <div className="text-center mb-3">
                      <span className="text-sm font-semibold text-green-800">
                        {searchFilters.savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost Comparison
                        <span className="block text-xs text-green-600">
                          Calculated for {currentTeamSize} team {currentTeamSize === 1 ? 'member' : 'members'}
                        </span>
                      </span>
                </div>

                    {/* Location vs Philippines Comparison */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700 font-medium">Local Rate:</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-900">
                            {(() => {
                              const effectiveCountry = getEffectiveCountry(userLocation, manualLocation);
                              const roleSalaryData = role.id ? rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison] : null;
                              const localSalaryData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
                              
                              if (localSalaryData) {
                                const entryRate = localSalaryData.entry.total * currentTeamSize;
                                const experiencedRate = localSalaryData.experienced.total * currentTeamSize;
                                const averageRate = (entryRate + experiencedRate) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageRate / 12)
                                  : averageRate;
                                
                                return `${getEffectiveCurrencySymbol(userLocation, manualLocation)}${displayRate.toLocaleString()}`;
                              } else if ((role as any).estimatedSalary) {
                                const entryEstimate = (role as any).estimatedSalary.local * 0.8 * currentTeamSize;
                                const experiencedEstimate = (role as any).estimatedSalary.local * 1.2 * currentTeamSize;
                                const averageEstimate = (entryEstimate + experiencedEstimate) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageEstimate / 12)
                                  : averageEstimate;
                                
                                return `${getEffectiveCurrencySymbol(userLocation, manualLocation)}${displayRate.toLocaleString()}`;
                              }
                              
                              return `${getEffectiveCurrencySymbol(userLocation, manualLocation)}0`;
                            })()}
                          </div>
                          <div className="text-xs text-green-600">
                            
                          </div>
                        </div>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700 font-medium">Philippines Rate:</span>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-900">
                            {(() => {
                              const roleSalaryData = role.id ? rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison] : null;
                              const philippineSalaryData = roleSalaryData?.PH;
                              
                              if (philippineSalaryData) {
                                const entryRate = philippineSalaryData.entry.total * currentTeamSize;
                                const experiencedRate = philippineSalaryData.experienced.total * currentTeamSize;
                                const averageRate = (entryRate + experiencedRate) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageRate / 12)
                                  : averageRate;
                                
                                return `₱${displayRate.toLocaleString()}`;
                              } else if ((role as any).estimatedSalary) {
                                const entryEstimate = (role as any).estimatedSalary.philippine * 0.8 * currentTeamSize;
                                const experiencedEstimate = (role as any).estimatedSalary.philippine * 1.2 * currentTeamSize;
                                const averageEstimate = (entryEstimate + experiencedEstimate) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageEstimate / 12)
                                  : averageEstimate;
                                
                                return `₱${displayRate.toLocaleString()}`;
                              }
                              
                              return `₱0`;
                            })()}
                          </div>
                          <div className="text-xs text-green-600">
                            {(() => {
                              const roleSalaryData = role.id ? rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison] : null;
                              const philippineSalaryData = roleSalaryData?.PH;
                              
                              if (philippineSalaryData) {
                                const entryRate = philippineSalaryData.entry.total * currentTeamSize;
                                const experiencedRate = philippineSalaryData.experienced.total * currentTeamSize;
                                const averageRate = (entryRate + experiencedRate) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageRate / 12)
                                  : averageRate;
                                
                                // Get user's effective currency
                                const effectiveCountry = getEffectiveCountry(userLocation, manualLocation);
                                let targetCurrency: string;
                                
                                if (manualLocation?.country) {
                                  targetCurrency = getCurrencyByCountry(manualLocation.country);
                                } else if (userLocation?.currency) {
                                  targetCurrency = userLocation.currency;
                                } else {
                                  targetCurrency = 'USD';
                                }
                                
                                // Convert PHP to user's currency
                                const phpMultiplier = getCurrencyMultiplier('PHP');
                                const targetMultiplier = getCurrencyMultiplier(targetCurrency);
                                
                                // Convert: PHP → USD → Target Currency
                                const usdEquivalent = displayRate / phpMultiplier;
                                const targetEquivalent = Math.round(usdEquivalent * targetMultiplier);
                                
                                const currencySymbol = getCurrencySymbol(targetCurrency);
                                return `≈ ${currencySymbol}${targetEquivalent.toLocaleString()}`;
                              }
                              
                              return '';
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-green-300 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-green-800">Your Savings:</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {(() => {
                                const savings = getSavingsForRole(role);
                                const entryTotal = savings.entry * currentTeamSize;
                                const experiencedTotal = savings.experienced * currentTeamSize;
                                const averageTotal = (entryTotal + experiencedTotal) / 2;
                                const displayRate = searchFilters.savingsView === 'monthly' 
                                  ? Math.round(averageTotal / 12)
                                  : averageTotal;
                                
                                return `${getEffectiveCurrencySymbol(userLocation, manualLocation)}${displayRate.toLocaleString()}`;
                              })()}
                            </div>
                            <div className="text-xs text-green-600">
                              {(() => {
                                const savings = getSavingsForRole(role);
                                const effectiveCountry = getEffectiveCountry(userLocation, manualLocation);
                                const roleSalaryData = role.id ? rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison] : null;
                                const localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
                                
                                if (localData) {
                                  const entryPercentage = Math.round((savings.entry / localData.entry.total) * 100);
                                  const experiencedPercentage = Math.round((savings.experienced / localData.experienced.total) * 100);
                                  const averagePercentage = Math.round((entryPercentage + experiencedPercentage) / 2);
                                  return `${averagePercentage}% savings`;
                                }
                                
                                return '';
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Size Selector */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: "easeOut",
                      height: { duration: 0.3 },
                      opacity: { duration: 0.2 }
                    }}
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
                          disabled={currentTeamSize >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
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
                Selection Summary
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neural-blue-600">
                  {Object.values(selectedRoles).filter(Boolean).length}
                </div>
                <div className="text-sm text-neural-blue-600">Roles Selected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-quantum-purple-600">
                  {getTotalTeamSize()}
                </div>
                <div className="text-sm text-neural-blue-600">Total Team Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyber-green-600">
                  {getEffectiveCurrencySymbol(userLocation, manualLocation)}
                  {searchFilters.savingsView === 'monthly' 
                    ? Math.round(getTotalSavings() / 12).toLocaleString()
                    : getTotalSavings().toLocaleString()
                  }
                </div>
                <div className="text-sm text-neural-blue-600">
                  {searchFilters.savingsView === 'monthly' ? 'Monthly' : 'Annual'} Savings
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 