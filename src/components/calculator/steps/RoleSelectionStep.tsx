'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { RoleId, Country, LocationData, CustomRole, RoleCategory } from '@/types';
import { ENHANCED_SALARY_DATA, COUNTRY_DATA, ENHANCED_PROPERTY_ROLES, ADDITIONAL_PROPERTY_ROLES, detectUserLocation } from '@/utils/dataQuoteCalculator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Users, 
  Search, 
  Plus, 
  Minus, 
  Globe, 
  TrendingUp, 
  DollarSign, 
  MapPin,
  Sparkles,
  Filter,
  Star,
  Building,
  Key,
  BarChart3
} from 'lucide-react';

interface RoleSelectionStepProps {
  selectedRoles: Record<string, boolean>;
  customRoles: Record<string, CustomRole>;
  teamSize: Record<string, number>;
  userLocation?: LocationData;
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
}

export function RoleSelectionStep({ 
  selectedRoles, 
  customRoles,
  teamSize, 
  userLocation,
  onChange 
}: RoleSelectionStepProps) {
  const [searchFilters, setSearchFilters] = useState<RoleSearchFilters>({
    query: '',
    showCustomRoles: true,
    sortBy: 'savings'
  });
  const [showCustomRoleForm, setShowCustomRoleForm] = useState(false);
  const [customRoleForm, setCustomRoleForm] = useState({
    title: '',
    description: '',
    estimatedSalary: 50000
  });
  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(userLocation || null);

  // Helper function to calculate savings for a role
  const getSavingsForRole = (role: any) => {
    if (!detectedLocation) return 0;
    
    if (role.type === 'predefined' && role.salaryData) {
      const localSalary = role.salaryData[detectedLocation.country]?.moderate?.total || 0;
      const philippineSalary = role.salaryData.PH?.moderate?.total || 0;
      return localSalary - philippineSalary;
    } else if (role.estimatedSalary) {
      return role.estimatedSalary.local - role.estimatedSalary.philippine;
    }
    
    return 0;
  };

  // Auto-detect location on component mount
  useEffect(() => {
    if (!detectedLocation) {
      detectUserLocation().then(location => {
        setDetectedLocation(location);
        onChange(selectedRoles, teamSize, customRoles, location);
      });
    }
  }, []);

  // All available roles (predefined + additional + custom)
  const allRoles = useMemo(() => {
    const predefinedRoles = Object.values(ENHANCED_PROPERTY_ROLES);
    const additionalRoles = Object.entries(ADDITIONAL_PROPERTY_ROLES).map(([id, roleData]: [string, any]) => ({
      id,
      title: roleData.title || '',
      icon: roleData.icon || '📋',
      description: roleData.description || '',
      category: roleData.category || 'custom',
      type: 'predefined' as const,
      color: 'neutral',
      searchKeywords: roleData.searchKeywords || [],
      estimatedSalary: {
        local: 60000, // Default estimate
        philippine: 18000
      }
    }));
    const customRolesList = Object.values(customRoles);
    
    return [...predefinedRoles, ...additionalRoles, ...customRolesList];
  }, [customRoles]);

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
          return bSavings - aSavings;
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
  }, [allRoles, searchFilters, detectedLocation]);

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
    
    onChange(newSelectedRoles, newTeamSize, customRoles, detectedLocation || undefined);
  };

  const handleTeamSizeChange = (roleId: string, change: number) => {
    const currentSize = teamSize[roleId] || 0;
    const newSize = Math.max(0, Math.min(10, currentSize + change));
    
    const newTeamSize = {
      ...teamSize,
      [roleId]: newSize
    };
    
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: newSize > 0
    };
    
    onChange(newSelectedRoles, newTeamSize, customRoles, detectedLocation || undefined);
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
    
    onChange(selectedRoles, teamSize, newCustomRoles, detectedLocation || undefined);
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
      const savings = getSavingsForRole(role) * size;
      return total + savings;
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

      {/* Location Display */}
      {detectedLocation && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-900">
                  Calculating savings for: {detectedLocation.countryName}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {detectedLocation.currency}
                </span>
              </div>
              <p className="text-sm text-blue-600">
                {detectedLocation.detected ? 'Auto-detected from your location' : 'Default location - change anytime'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
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
            className="px-6 py-3 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white rounded-lg hover:shadow-neural-glow transition-all duration-200 flex items-center gap-2 font-medium"
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
          <select
            value={searchFilters.sortBy}
            onChange={(e) => setSearchFilters(prev => ({ 
              ...prev, 
              sortBy: e.target.value as any
            }))}
            className="px-3 py-1 border border-neutral-300 rounded-md text-sm"
          >
            <option value="savings">Highest Savings</option>
            <option value="name">Name A-Z</option>
            <option value="recent">Recently Added</option>
          </select>

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
                Estimated Local Salary ({detectedLocation?.currencySymbol || '$'})
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
          const currentTeamSize = teamSize[role.id] || 0;
          const savings = getSavingsForRole(role) * currentTeamSize;
          
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
                {detectedLocation && (
                  <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                    <div className="text-center mb-3">
                      <span className="text-sm font-semibold text-green-800">Annual Cost Comparison</span>
                </div>

                    {/* Location vs Philippines Comparison */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700 font-medium">{detectedLocation.countryName} Rate:</span>
                        <span className="text-sm font-bold text-green-900">
                          {detectedLocation.currencySymbol}{(getSavingsForRole(role) + ((role as any).salaryData?.PH?.moderate?.total || (role as any).estimatedSalary?.philippine || 18000)).toLocaleString()}
                        </span>
                  </div>
                  <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700 font-medium">Philippines Rate:</span>
                        <span className="text-sm font-bold text-green-900">
                          {detectedLocation.currencySymbol}{((role as any).salaryData?.PH?.moderate?.total || (role as any).estimatedSalary?.philippine || 18000).toLocaleString()}
                    </span>
                      </div>
                      <div className="border-t border-green-300 pt-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-green-800">Your Savings:</span>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              {detectedLocation.currencySymbol}{getSavingsForRole(role).toLocaleString()}
                            </div>
                            <div className="text-xs text-green-600">
                              {Math.round((getSavingsForRole(role) / (getSavingsForRole(role) + ((role as any).salaryData?.PH?.moderate?.total || (role as any).estimatedSalary?.philippine || 18000))) * 100)}% savings
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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-cyber-green-200 pt-4 bg-cyber-green-25 -mx-6 px-6 pb-2 rounded-b-xl"
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
                            ${currentTeamSize > 1 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-neutral-100 text-neutral-400'
                            }
                          `}
                          disabled={currentTeamSize <= 1}
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
                    
                    {currentTeamSize > 0 && savings > 0 && (
                      <div className="mt-3 p-3 bg-cyber-green-100 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm font-medium text-cyber-green-700 mb-1">
                            Total Savings
                          </div>
                          <div className="text-lg font-bold text-cyber-green-800">
                            {detectedLocation?.currencySymbol || '$'}{savings.toLocaleString()}/year
                          </div>
                        </div>
                      </div>
                    )}
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
                  {detectedLocation?.currencySymbol || '$'}{getTotalSavings().toLocaleString()}
                </div>
                <div className="text-sm text-neural-blue-600">Annual Savings</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 