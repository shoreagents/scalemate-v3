'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Plus, 
  Minus, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { 
  calculateMultiLevelSavings, 
  calculateMultiLevelLocalCost, 
  calculateMultiLevelPhilippinesCost,
  calculateRoleLevelSavings,
  calculateIndividualLevelDisplay,
  calculateRoleBreakdownDisplay,
  calculateTotalPhilippinesCostConverted,
  calculateTotalSavingsPercentage,
  formatCostForView
} from '@/utils/calculations';
import { 
  getDirectExchangeRate, 
  getCurrencySymbol, 
  getDisplayCurrencyByCountry,
  getDisplayCurrencyByCountryWithAPIFallback
} from '@/utils/currency';
import { 
  ExperienceLevel, 
  RoleExperienceDistribution, 
  CustomRole,
  LocationData,
  ManualLocation
} from '@/types';
import { ROLES } from '@/utils/rolesData';

interface ExperienceStepProps {
  selectedRoles: Record<string, boolean>;
  customRoles: Record<string, CustomRole>;
  teamSize: Record<string, number>;
  roleExperienceDistribution: Record<string, RoleExperienceDistribution>;
  userLocation?: LocationData;
  manualLocation?: ManualLocation | null;
  roles?: any;
  onRoleExperienceDistributionChange: (roleExperienceDistribution: Record<string, RoleExperienceDistribution>) => void;
  onCalculate: () => void;
  isCalculating: boolean;
  isUsingDynamicRoles?: boolean;
}

export function ExperienceStep({ 
  selectedRoles, 
  customRoles,
  teamSize, 
  roleExperienceDistribution,
  userLocation,
  manualLocation,
  roles,
  onRoleExperienceDistributionChange,
  isUsingDynamicRoles = false
}: ExperienceStepProps) {
  const [savingsView, setSavingsView] = useState<'annual' | 'monthly'>('annual');
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [highlightIncompleteRoles, setHighlightIncompleteRoles] = useState(false);
  const incompleteRoleRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // State for async calculations
  const [individualLevelDisplays, setIndividualLevelDisplays] = useState<Record<string, Record<ExperienceLevel, any>>>({});
  const [roleBreakdownDisplays, setRoleBreakdownDisplays] = useState<Record<string, any>>({});
  const [totalPhilippinesCostConverted, setTotalPhilippinesCostConverted] = useState<number>(0);

  // Get effective location (manual takes priority)
  const effectiveLocation = React.useMemo(() => {
    if (manualLocation?.country) {
      // Convert manual location to LocationData format
      return {
        country: manualLocation.country,
        countryName: manualLocation.country,
        currency: getDisplayCurrencyByCountryWithAPIFallback(manualLocation.country, !isUsingDynamicRoles),
        currencySymbol: getCurrencySymbol(getDisplayCurrencyByCountryWithAPIFallback(manualLocation.country, !isUsingDynamicRoles)),
        detected: false
      } as LocationData;
    }
    return userLocation;
  }, [userLocation, manualLocation, isUsingDynamicRoles]);

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

  // Get all available roles (predefined + custom)
  const allRoles = React.useMemo(() => {
    // Use roles prop if available, otherwise fall back to static ROLES
    const availableRoles = roles || ROLES;
    const predefinedRoles = Object.values(availableRoles) as any[];
    const customRolesList = Object.values(customRoles);
    
    return [...predefinedRoles, ...customRolesList];
  }, [roles, customRoles]);

  // Get exchange rate on mount and when location changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const targetCurrency = effectiveLocation?.currency || 'USD';
        const rate = await getDirectExchangeRate('PHP', targetCurrency);
      } catch (error) {
        console.warn('Failed to get exchange rate, using fallback:', error);
      }
    };
    
    fetchExchangeRate();
  }, [effectiveLocation?.currency]);

  // Update roleExperienceDistribution when teamSize changes
  useEffect(() => {
    const updatedDistribution: Record<string, RoleExperienceDistribution> = {};
    let hasChanges = false;

    Object.entries(selectedRoles)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([roleId]) => {
        const currentDistribution = roleExperienceDistribution[roleId];
        const newTeamSize = teamSize[roleId] || 1;
        
        if (currentDistribution) {
          // If team size changed, update totalRequired and handle distribution
          if (currentDistribution.totalRequired !== newTeamSize) {
            let updatedDistributionForRole = {
              ...currentDistribution,
              totalRequired: newTeamSize
            };
            
            // If team size was reduced and totalAssigned exceeds new team size, reset distribution
            if (currentDistribution.totalAssigned > newTeamSize) {
              updatedDistributionForRole = {
                entry: 0,
                moderate: 0,
                experienced: 0,
                totalAssigned: 0,
                totalRequired: newTeamSize,
                isComplete: false
              };
            } else {
              // Recalculate isComplete based on new team size
              updatedDistributionForRole.isComplete = currentDistribution.totalAssigned === newTeamSize;
            }
            
            updatedDistribution[roleId] = updatedDistributionForRole;
            hasChanges = true;
          } else {
            // Keep existing distribution if team size hasn't changed
            updatedDistribution[roleId] = currentDistribution;
          }
        } else {
          // Create new distribution for newly selected roles
          updatedDistribution[roleId] = {
            entry: 0,
            moderate: 0,
            experienced: 0,
            totalAssigned: 0,
            totalRequired: newTeamSize,
            isComplete: false
          };
          hasChanges = true;
        }
      });

    // Only update if there are actual changes
    if (hasChanges) {
      onRoleExperienceDistributionChange(updatedDistribution);
    }
  }, [teamSize, selectedRoles, roleExperienceDistribution, onRoleExperienceDistributionChange]);

  // Get active roles (selected roles only)
  const activeRoles = React.useMemo(() => {
    return Object.entries(selectedRoles)
    .filter(([_, isSelected]) => isSelected)
      .map(([roleId]) => {
        const role = allRoles.find(r => r.id === roleId);
        const distribution = roleExperienceDistribution[roleId] || {
          entry: 0,
          moderate: 0,
          experienced: 0,
          totalAssigned: 0,
          totalRequired: teamSize[roleId] || 1,
          isComplete: false
        };
        
        return {
          id: roleId,
          title: role?.title || roleId,
          icon: role?.icon || '📋',
          teamSize: teamSize[roleId] || 1,
          distribution,
          salaryData: role && 'salary' in role ? role.salary : undefined,
          estimatedSalary: role && 'estimatedSalary' in role ? role.estimatedSalary : undefined
        };
      });
  }, [selectedRoles, allRoles, teamSize, roleExperienceDistribution]);

  // Helper function to get experience levels from roles
  const getExperienceLevels = (): any[] => {
    // Use dynamic roles if available, otherwise fall back to static ROLES
    const availableRoles = roles || ROLES;
    const firstRole = Object.values(availableRoles)[0] as any;
    return firstRole?.experienceLevels || [];
  };

  const updateRoleDistribution = (roleId: string, level: ExperienceLevel, count: number) => {
    const updatedDistribution = { ...roleExperienceDistribution };
    if (!updatedDistribution[roleId]) {
      updatedDistribution[roleId] = {
        entry: 0,
        moderate: 0,
        experienced: 0,
        totalAssigned: 0,
        totalRequired: teamSize[roleId] || 1,
        isComplete: false
      };
    }

    const currentDistribution = updatedDistribution[roleId];
    const oldCount = currentDistribution[level];
    const difference = count - oldCount;
    
    currentDistribution[level] = count;
    currentDistribution.totalAssigned += difference;
    currentDistribution.isComplete = currentDistribution.totalAssigned === currentDistribution.totalRequired;
    
    onRoleExperienceDistributionChange(updatedDistribution);
  };

  const getTotalSavings = async () => {
    const savings = await calculateMultiLevelSavings(activeRoles, allRoles, userLocation, manualLocation, roles);
    setTotalSavings(savings);
    return savings;
  };

  const allRolesConfigured = activeRoles.length > 0 && activeRoles.every(role => role.distribution.isComplete);

  // Update total savings when relevant data changes
  useEffect(() => {
    if (allRolesConfigured) {
      getTotalSavings();
    }
  }, [activeRoles, allRoles, userLocation, manualLocation, roles, allRolesConfigured]);

  const getTotalLocalCost = () => {
    return calculateMultiLevelLocalCost(activeRoles, allRoles, userLocation, manualLocation, roles);
  };

  const getTotalPhilippinesCost = () => {
    return calculateMultiLevelPhilippinesCost(activeRoles, allRoles, roles);
  };

  // Update async calculations when dependencies change
  useEffect(() => {
    const updateCalculations = async () => {
      try {
        // Update individual level displays
        const newIndividualDisplays: Record<string, Record<ExperienceLevel, any>> = {};
        const newRoleBreakdowns: Record<string, any> = {};
        
        for (const role of activeRoles) {
          const roleData = allRoles.find(r => r.id === role.id);
          if (!roleData) continue;
          // TypeScript assertion: roleData is guaranteed to exist after the null check
          const safeRoleData = roleData;
          
          // Individual level displays
          newIndividualDisplays[role.id] = {} as Record<ExperienceLevel, any>;
          for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
            const memberCount = role.distribution[level];
            if (memberCount > 0) {
              newIndividualDisplays[role.id]![level] = await calculateIndividualLevelDisplay(
                safeRoleData as any, 
                level, 
                memberCount, 
                userLocation, 
                manualLocation, 
                roles, 
                savingsView
              );
            }
          }
          
          // Role breakdown display
          newRoleBreakdowns[role.id] = await calculateRoleBreakdownDisplay(
            safeRoleData as any, 
            role.distribution, 
            userLocation, 
            manualLocation, 
            roles, 
            savingsView
          );
        }
        
        // Update total Philippines cost converted
        const totalConverted = await calculateTotalPhilippinesCostConverted(
          activeRoles, 
          allRoles, 
          userLocation, 
          manualLocation, 
          roles
        );
        
        setIndividualLevelDisplays(newIndividualDisplays);
        setRoleBreakdownDisplays(newRoleBreakdowns);
        setTotalPhilippinesCostConverted(totalConverted);
      } catch (error) {
        console.error('Error updating calculations:', error);
      }
    };
    
    updateCalculations();
      }, [activeRoles, userLocation, manualLocation, roles, savingsView]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">Distribute experience levels</h2>
        </div>
        <p className="text-body-large text-neutral-600 mb-12">
          Assign team members to different experience levels for each role. Mix and match to optimize your team composition.
        </p>
        
        {/* Progress and Savings View Row */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-neutral-900">
          Configure Each Role ({activeRoles.length} role{activeRoles.length !== 1 ? 's' : ''})
          </h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-neutral-600">View:</span>
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setSavingsView('annual')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  savingsView === 'annual'
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Annual
              </button>
              <button
                onClick={() => setSavingsView('monthly')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  savingsView === 'monthly'
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
        
      {/* Role-by-Role Experience Distribution */}
      <div className="space-y-6">
        {activeRoles.map((role, index) => {
          const roleData = allRoles.find(r => r.id === role.id);
          const distribution = role.distribution;
          const unassignedCount = distribution.totalRequired - distribution.totalAssigned;

          return (
            <motion.div
              key={role.id}
              ref={el => {
                if (!distribution.isComplete) incompleteRoleRefs.current[role.id] = el;
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white border rounded-xl p-6 shadow-sm transition-all duration-200 ${
                distribution.isComplete 
                  ? 'border-green-200 bg-green-50/30' 
                  : unassignedCount < 0 
                    ? 'border-red-200 bg-red-50/30'
                    : highlightIncompleteRoles && !distribution.isComplete
                      ? 'border-red-500'
                      : 'border-neutral-200'
              }`}
            >
              {/* Role Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{role.icon}</div>
                  <div>
                    <h4 className="text-lg font-semibold text-neutral-900">{role.title}</h4>
                    <p className="text-sm text-neutral-600">
                      Total Team Size: {role.teamSize} Member{role.teamSize !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Assigned Count Badge at Top */}
                <div className="flex justify-end mb-2">
                  {distribution.totalAssigned === distribution.totalRequired ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Completed
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm font-semibold">
                      {distribution.totalAssigned}/{distribution.totalRequired} Assigned
                    </span>
                  )}
                </div>
              </div>

              {/* Experience Level Distribution - 3 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {getExperienceLevels().map((option: any) => {
                  const currentCount = distribution[option.level as ExperienceLevel];
                  const savings = roleData ? calculateRoleLevelSavings(roleData, option.level, userLocation, manualLocation, roles) : 0;
                  const totalSavingsForLevel = savings * currentCount;
                  const canDecrease = currentCount > 0;
                  const canIncrease = distribution.totalAssigned < distribution.totalRequired;

                  // Determine background tint class based on level
                  let bgTint = '';
                  if (option.level === 'entry') bgTint = 'bg-gray-50';
                  else if (option.level === 'moderate') bgTint = 'bg-blue-50';
                  else if (option.level === 'experienced') bgTint = 'bg-purple-50';

                  return (
                    <div key={option.level} className={`p-4 rounded-lg border ${bgTint} shadow-sm`}>
                      {/* Experience Level Header (no gradient) */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className={`text-xl ${option.color}`}>{option.icon}</span>
                        <h5 className={`font-bold text-lg ${option.color} mb-1`}>{option.title}</h5>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg border text-left flex flex-col justify-center min-h-0 mb-6">
                        <p className="text-xs text-neutral-600 leading-tight">
                          <span className="font-bold">Description:</span> {option.description}
                          <br />
                          <span style={{ marginRight: '0.25rem', marginTop: '0.5rem', display: 'inline-block' }} className="font-bold">Best for:</span>{option.bestFor}
                        </p>
                      </div>

                      {/* Counter Controls */}
                      <div className="flex items-center justify-center gap-3 mt-6 mb-6">
                        <button
                          onClick={() => updateRoleDistribution(role.id, option.level, currentCount - 1)}
                          disabled={!canDecrease}
                          className="w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <div className="w-8 text-center font-bold text-cyber-green-700 text-2xl">
                          {currentCount}
                        </div>
                        <button
                          onClick={() => updateRoleDistribution(role.id, option.level, currentCount + 1)}
                          disabled={!canIncrease}
                          className="w-8 h-8 rounded-full bg-cyber-green-100 text-cyber-green-600 hover:bg-cyber-green-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Savings for This Level */}
                      <AnimatePresence>
                        {effectiveLocation && currentCount > 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white/80 p-3 rounded-lg text-center border border-green-200"
                          >
                            {/* Header */}
                            <div className="text-center mb-4">
                              <span className="text-sm font-semibold text-green-800">
                                {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost Comparison
                                <span className="block text-xs text-green-600">
                                  for {currentCount} {option.level === 'entry' ? 'Entry' : option.level === 'moderate' ? 'Mid' : 'Senior'} {currentCount === 1 ? 'Level' : 'Level'} {currentCount === 1 ? 'Member' : 'Members'}
                                </span>
                              </span>
                            </div>

                            {/* Salary Breakdown */}
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <div className="text-center mb-4">
                                  <span className="text-sm text-green-600 font-medium">Estimated Base Salary</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-green-700 font-medium">
                                    {getDisplayCountryName(userLocation, manualLocation)} Rate:
                                  </span>
                                  <div className="text-right">
                                    <div className="text-sm font-bold text-green-900">
                                      {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                                      {(() => {
                                        const display = individualLevelDisplays[role.id]?.[option.level as ExperienceLevel];
                                        if (display) {
                                          return display.localCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                                        }
                                        return '0';
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-green-700 font-medium">Philippines Rate:</span>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-green-900">
                                    ₱{(() => {
                                      const display = individualLevelDisplays[role.id]?.[option.level as ExperienceLevel];
                                      if (display) {
                                        return display.philippineCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                                      }
                                      return '0';
                                    })()}
                                  </div>
                                  <div className="text-xs text-green-600">
                                    {(() => {
                                      const display = individualLevelDisplays[role.id]?.[option.level as ExperienceLevel];
                                      if (display) {
                                        return `≈ ${effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}${display.philippineCostConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                                      }
                                      return '';
                                    })()}
                                  </div>
                                </div>
                              </div>
                              <div className="border-t border-green-300 pt-2 mt-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-green-800">Role Cost Savings:</span>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                                      {(() => {
                                        const display = individualLevelDisplays[role.id]?.[option.level as ExperienceLevel];
                                        if (display) {
                                          return display.savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                                        }
                                        return '0';
                                      })()}
                                    </div>
                                    <div className="text-xs text-green-600">
                                      {(() => {
                                        const display = individualLevelDisplays[role.id]?.[option.level as ExperienceLevel];
                                        if (display) {
                                          return `${display.savingsPercentage.toFixed(1)}% Savings`;
                                        }
                                        return '0.0% Savings';
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })}
              </div>

              {/* Per-Role Summary Card */}
              {(distribution.entry > 0 || distribution.moderate > 0 || distribution.experienced > 0) && (
                <div className="mt-4">
                  <div className="bg-white/80 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600 font-bold mb-3">Role Total Breakdown</div>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="min-h-[48px] flex flex-col justify-center items-center">
                          <div className="text-lg font-bold text-red-600 text-center">
                            {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                            {(() => {
                              const display = roleBreakdownDisplays[role.id];
                              if (display) {
                                return display.localCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                              }
                              return '0';
                            })()}
                          </div>
                          <div className="h-0" />
                        </div>
                        <div className="text-xs text-gray-600 font-bold">Local Cost</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold text-blue-600">
                          ₱{(() => {
                            const display = roleBreakdownDisplays[role.id];
                            if (display) {
                              return display.philippineCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                            }
                            return '0';
                          })()}
                        </div>
                        <div className="text-xs text-blue-500">
                          {(() => {
                            const display = roleBreakdownDisplays[role.id];
                            if (display) {
                              return `≈ ${effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}${display.philippineCostConverted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                            }
                            return '';
                          })()}
                        </div>
                        <div className="text-xs text-gray-600 font-bold mt-1">Philippines Cost</div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="text-lg font-bold text-cyber-green-600">
                          {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                          {(() => {
                            const display = roleBreakdownDisplays[role.id];
                            if (display) {
                              return display.savings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                            }
                            return '0';
                          })()}
                        </div>
                        <div className="text-xs text-cyber-green-500">
                          {(() => {
                            const display = roleBreakdownDisplays[role.id];
                            if (display) {
                              return `${display.savingsPercentage.toFixed(1)}% Savings`;
                            }
                            return '0.0% Savings';
                          })()}
                        </div>
                        <div className="text-xs text-gray-600 font-bold mt-1">Role Cost Savings</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Total Summary Card (matches RoleSelectionStep) */}
      {allRolesConfigured && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-neural-blue-50/30 border border-neural-blue-100/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          <div className="relative z-10">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-neural-blue-900">Total Summary</h3>
              <p className="text-sm text-neutral-600 mb-8">Your complete offshore team configuration and savings breakdown.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-center">
              <div className="lg:col-span-3">
                <div className="text-sm text-gray-600 font-bold text-center mb-2">Selected Experience Level</div>
                {(() => {
                  const rolesWithLevels = activeRoles.filter(role => {
                    const { entry, moderate, experienced } = role.distribution;
                    return entry || moderate || experienced;
                  });
                  // Split into rows of 3
                  const rows = [];
                  for (let i = 0; i < rolesWithLevels.length; i += 3) {
                    rows.push(rolesWithLevels.slice(i, i + 3));
                  }
                  return (
                    <div className="mb-4">
                      {rows.map((row, idx) => {
                        // If last row and fewer than 3, use flex justify-center
                        const isLast = idx === rows.length - 1;
                        const isFull = row.length === 3;
                        return isFull ? (
                          <div key={idx} className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-2">
                            {row.map(role => (
                              <div key={role.id} className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{role.icon}</span>
                                  <span className="font-medium text-gray-800">{role.title}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {role.distribution.entry > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium gap-1 border border-gray-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'entry')?.icon}</span>
                                      Entry Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-xs">{role.distribution.entry}</span>
                                    </span>
                                  )}
                                  {role.distribution.moderate > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium gap-1 border border-blue-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'moderate')?.icon}</span>
                                      Mid Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-700 font-bold text-xs">{role.distribution.moderate}</span>
                                    </span>
                                  )}
                                  {role.distribution.experienced > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium gap-1 border border-purple-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'experienced')?.icon}</span>
                                      Senior Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-purple-200 text-purple-700 font-bold text-xs">{role.distribution.experienced}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div key={idx} className="flex justify-center gap-4 mb-2">
                            {row.map(role => (
                              <div key={role.id} className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-lg">{role.icon}</span>
                                  <span className="font-medium text-gray-800">{role.title}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center">
                                  {role.distribution.entry > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-50 text-gray-700 text-xs font-medium gap-1 border border-gray-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'entry')?.icon}</span>
                                      Entry Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-700 font-bold text-xs">{role.distribution.entry}</span>
                                    </span>
                                  )}
                                  {role.distribution.moderate > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium gap-1 border border-blue-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'moderate')?.icon}</span>
                                      Mid Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-700 font-bold text-xs">{role.distribution.moderate}</span>
                                    </span>
                                  )}
                                  {role.distribution.experienced > 0 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-medium gap-1 border border-purple-200">
                                      <span className="mr-1">{getExperienceLevels().find((level: any) => level.level === 'experienced')?.icon}</span>
                                      Senior Level
                                      <span className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-purple-200 text-purple-700 font-bold text-xs">{role.distribution.experienced}</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold mb-2">{getDisplayCountryName(userLocation, manualLocation)} {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost</div>
                <div className="text-xl font-bold text-red-600">
                  {effectiveLocation?.currencySymbol || '$'}
                  {formatCostForView(getTotalLocalCost(), savingsView).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-red-500">&nbsp;</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold mb-2">Philippines {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost</div>
                <div className="text-xl font-bold text-blue-600">
                  ₱{formatCostForView(getTotalPhilippinesCost(), savingsView).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-blue-500">
                  ≈ {effectiveLocation?.currencySymbol || '$'}
                  {formatCostForView(totalPhilippinesCostConverted, savingsView).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold mb-2">{savingsView === 'monthly' ? 'Monthly' : 'Annual'} Savings</div>
                <div className="text-xl font-bold text-cyber-green-600">
                  {effectiveLocation?.currencySymbol || '$'}
                  {formatCostForView(getTotalLocalCost() - totalPhilippinesCostConverted, savingsView).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className="text-xs text-cyber-green-500">
                  {calculateTotalSavingsPercentage(getTotalLocalCost() - totalPhilippinesCostConverted, getTotalLocalCost()).toFixed(1)}% Savings
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
} 