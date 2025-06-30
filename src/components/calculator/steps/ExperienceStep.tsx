'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExperienceLevel, CustomRole, LocationData, RoleExperienceDistribution } from '@/types';
import { ManualLocation } from '@/types/location';
import { ROLES } from '@/utils/rolesData';
import { ADDITIONAL_PROPERTY_ROLES } from '@/utils/rolesData';
import { Button } from '@/components/ui/Button';
import { Check, Users, DollarSign, Clock, Award, Target, Lightbulb, GraduationCap, ChevronDown, ChevronUp, BarChart3, Plus, Minus } from 'lucide-react';
import { getDirectExchangeRate, getCurrencySymbol, getCurrencyByCountry } from '@/utils/currency';

interface ExperienceStepProps {
  value: ExperienceLevel | ''; // Legacy single level for backward compatibility
  selectedRoles: Record<string, boolean>;
  customRoles: Record<string, CustomRole>;
  teamSize: Record<string, number>;
  roleExperienceLevels: Record<string, ExperienceLevel>; // Deprecated
  roleExperienceDistribution: Record<string, RoleExperienceDistribution>;
  userLocation?: LocationData;
  manualLocation?: ManualLocation | null;
  onChange: (value: ExperienceLevel) => void; // Legacy single level handler
  onRoleExperienceChange: (roleExperienceLevels: Record<string, ExperienceLevel>) => void; // Deprecated
  onRoleExperienceDistributionChange: (roleExperienceDistribution: Record<string, RoleExperienceDistribution>) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

export function ExperienceStep({ 
  value, 
  selectedRoles, 
  customRoles,
  teamSize, 
  roleExperienceLevels,
  roleExperienceDistribution,
  userLocation,
  manualLocation,
  onChange, 
  onRoleExperienceChange,
  onRoleExperienceDistributionChange,
  onCalculate, 
  isCalculating 
}: ExperienceStepProps) {
  const [savingsView, setSavingsView] = useState<'annual' | 'monthly'>('annual');
  
  // Store PHP to local currency exchange rate
  const [phpToLocalRate, setPhpToLocalRate] = useState<number>(0.018); // Fallback rate

  // Currency handling function - same pattern as RoleSelectionStep
  // Note: Manual location takes priority over auto-detected location
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

  // Get effective location (manual takes priority)
  const effectiveLocation = React.useMemo(() => {
    if (manualLocation?.country) {
      // Convert manual location to LocationData format
      return {
        country: manualLocation.country,
        countryName: manualLocation.country,
        currency: getCurrencyByCountry(manualLocation.country),
        currencySymbol: getCurrencySymbol(getCurrencyByCountry(manualLocation.country)),
        detected: false
      } as LocationData;
    }
    return userLocation;
  }, [userLocation, manualLocation]);
  
  // Get exchange rate on mount and when location changes
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const targetCurrency = effectiveLocation?.currency || 'USD';
        const rate = await getDirectExchangeRate('PHP', targetCurrency);
        setPhpToLocalRate(rate);
      } catch (error) {
        console.warn('Failed to get exchange rate, using fallback:', error);
      }
    };
    
    fetchExchangeRate();
  }, [effectiveLocation?.currency]);

  // Function to get role-specific salary for display - Shows Philippines data and converted amount
  const getRoleSalaryForLevel = (roleId: string, level: ExperienceLevel): string => {
    const role = allRoles.find(r => r.id === roleId);
    
    if (role && 'salaryData' in role && role.salaryData) {
      // Always use Philippines data for salary range display
      const philippinesSalaryData = role.salaryData.Philippines?.[level];
      if (philippinesSalaryData) {
        const phpSalary = philippinesSalaryData.base;
        
        // Show both Philippines salary and converted amount
        if (effectiveLocation) {
          const convertedSalary = Math.round(phpSalary * phpToLocalRate);
          return `₱${phpSalary.toLocaleString()} (${effectiveLocation.currencySymbol}${convertedSalary.toLocaleString()})`;
        } else {
          // Fallback to USD conversion if no location
          const usdSalary = Math.round(phpSalary * phpToLocalRate);
          return `₱${phpSalary.toLocaleString()} ($${usdSalary.toLocaleString()})`;
        }
      }
    }
    
    // Fallback for custom roles or roles without salary data - show both currencies
    const fallbackSalariesPHP = {
      entry: 300000,
      moderate: 420000,
      experienced: 600000
    };
    
    const phpAmount = fallbackSalariesPHP[level];
    if (effectiveLocation) {
      const convertedAmount = Math.round(phpAmount * phpToLocalRate);
      return `₱${phpAmount.toLocaleString()} (${effectiveLocation.currencySymbol}${convertedAmount.toLocaleString()})`;
    } else {
      const usdAmount = Math.round(phpAmount * phpToLocalRate);
      return `₱${phpAmount.toLocaleString()} ($${usdAmount.toLocaleString()})`;
    }
  };

  // Get all available roles (predefined + additional + custom)
  const allRoles = React.useMemo(() => {
    const predefinedRoles = Object.values(ROLES);
    const additionalRoles = Object.entries(ADDITIONAL_PROPERTY_ROLES).map(([id, roleData]) => ({
      id,
      title: roleData.title || '',
      icon: roleData.icon || '📋',
      description: roleData.description || '',
      estimatedSalary: {
        local: 60000, // Default estimate
        philippine: 18000
      }
    }));
    const customRolesList = Object.values(customRoles);
    
    return [...predefinedRoles, ...additionalRoles, ...customRolesList];
  }, [customRoles]);

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
          salaryData: role && 'salaryData' in role ? role.salaryData : undefined,
          estimatedSalary: role && 'estimatedSalary' in role ? role.estimatedSalary : undefined
        };
      });
  }, [selectedRoles, allRoles, teamSize, roleExperienceDistribution]);

  const totalTeamMembers = activeRoles.reduce((total, role) => total + role.teamSize, 0);
  const totalAssignedMembers = activeRoles.reduce((total, role) => total + role.distribution.totalAssigned, 0);

  const experienceLevels: Array<{
    level: ExperienceLevel;
    title: string;
    icon: React.ReactNode;
    description: string;
    details: string;
    pros: string[];
    timeToProductivity: string;
    salaryRange: string;
    bestFor: string;
    color: string;
    gradientFrom: string;
    gradientTo: string;
  }> = [
    {
      level: 'entry',
      title: 'Entry Level',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Fresh graduates and professionals with 0-2 years of experience',
      details: 'Perfect for businesses looking to build a cost-effective team while providing growth opportunities.',
      pros: [
        'Most cost-effective option',
        'High motivation and eagerness to learn',
        'Fresh perspectives and adaptability',
        'Long-term growth potential'
      ],
      timeToProductivity: '2-3 months',
      salaryRange: '', // Now dynamically calculated per role
      bestFor: 'Standard processes, routine tasks, growing businesses',
      color: 'text-gray-700',
      gradientFrom: 'from-gray-50',
      gradientTo: 'to-gray-200'
    },
    {
      level: 'moderate',
      title: 'Mid Level',
      icon: <Target className="w-5 h-5" />,
      description: 'Professionals with 2-5 years of experience and proven skills',
      details: 'The sweet spot of experience and cost - capable of handling complex tasks with minimal supervision.',
      pros: [
        'Proven track record and reliability',
        'Can work independently',
        'Mentoring capability for junior staff',
        'Balanced cost-to-value ratio'
      ],
      timeToProductivity: '4-6 weeks',
      salaryRange: '', // Now dynamically calculated per role
      bestFor: 'Complex processes, team leadership, established businesses',
      color: 'text-blue-700',
      gradientFrom: 'from-blue-50',
      gradientTo: 'to-cyan-50'
    },
    {
      level: 'experienced',
      title: 'Senior Level',
      icon: <Award className="w-5 h-5" />,
      description: 'Seasoned professionals with 5+ years and specialized expertise',
      details: 'Top-tier talent ready to drive results from day one with strategic thinking and leadership skills.',
      pros: [
        'Immediate productivity and impact',
        'Strategic thinking and problem-solving',
        'Leadership and team development',
        'Industry expertise and best practices'
      ],
      timeToProductivity: '1-2 weeks',
      salaryRange: '', // Now dynamically calculated per role
      bestFor: 'Strategic initiatives, complex projects, rapid scaling',
      color: 'text-purple-700',
      gradientFrom: 'from-purple-50',
      gradientTo: 'to-violet-50'
    }
  ];

  const updateRoleDistribution = (roleId: string, level: ExperienceLevel, count: number) => {
    const currentDistribution = roleExperienceDistribution[roleId] || {
      entry: 0,
      moderate: 0,
      experienced: 0,
      totalAssigned: 0,
      totalRequired: teamSize[roleId] || 1,
      isComplete: false
    };

    const newDistribution = {
      ...currentDistribution,
      [level]: Math.max(0, count)
    };

    // Recalculate totals
    newDistribution.totalAssigned = newDistribution.entry + newDistribution.moderate + newDistribution.experienced;
    newDistribution.isComplete = newDistribution.totalAssigned === newDistribution.totalRequired;

    const newRoleExperienceDistribution = {
      ...roleExperienceDistribution,
      [roleId]: newDistribution
    };

    onRoleExperienceDistributionChange(newRoleExperienceDistribution);
  };

  const getSavingsForRole = (role: any, experienceLevel: ExperienceLevel) => {
    if (!effectiveLocation) return 0;
    
    if (role.salaryData) {
      const localSalary = role.salaryData[effectiveLocation.country]?.[experienceLevel]?.base || 0;
      const philippineSalaryPHP = role.salaryData.Philippines?.[experienceLevel]?.base || 0;
      
      // Convert Philippines salary from PHP to user's local currency for comparison
      const philippineSalaryConverted = Math.round(philippineSalaryPHP * phpToLocalRate);
      
      return localSalary - philippineSalaryConverted;
    } else if (role.estimatedSalary) {
      // For custom roles, adjust based on experience level
      const multipliers = { entry: 0.8, moderate: 1.0, experienced: 1.3 };
      const adjustedLocal = role.estimatedSalary.local * multipliers[experienceLevel];
      const adjustedPhilippine = role.estimatedSalary.philippine * multipliers[experienceLevel];
      return adjustedLocal - adjustedPhilippine;
    }
    
    return 0;
  };

  const getTotalSavings = () => {
    return activeRoles.reduce((total, role) => {
      const roleData = allRoles.find(r => r.id === role.id);
      if (!roleData) return total;
      
      let roleSavings = 0;
      roleSavings += getSavingsForRole(roleData, 'entry') * role.distribution.entry;
      roleSavings += getSavingsForRole(roleData, 'moderate') * role.distribution.moderate;
      roleSavings += getSavingsForRole(roleData, 'experienced') * role.distribution.experienced;
      
      return total + roleSavings;
    }, 0);
  };

  const getTotalLocalCost = () => {
    if (!effectiveLocation) return 0;
    
    return activeRoles.reduce((total, role) => {
      const roleData = allRoles.find(r => r.id === role.id);
      if (!roleData) return total;
      
      let roleCost = 0;
      
      if ('salaryData' in roleData && roleData.salaryData) {
        // Entry level cost
        const entryLocalSalary = (roleData.salaryData as any)[effectiveLocation.country]?.entry?.base || 0;
        roleCost += entryLocalSalary * role.distribution.entry;
        
        // Moderate level cost
        const moderateLocalSalary = (roleData.salaryData as any)[effectiveLocation.country]?.moderate?.base || 0;
        roleCost += moderateLocalSalary * role.distribution.moderate;
        
        // Experienced level cost
        const experiencedLocalSalary = (roleData.salaryData as any)[effectiveLocation.country]?.experienced?.base || 0;
        roleCost += experiencedLocalSalary * role.distribution.experienced;
      }
      
      return total + roleCost;
    }, 0);
  };

  const getTotalPhilippinesCost = () => {
    return activeRoles.reduce((total, role) => {
      const roleData = allRoles.find(r => r.id === role.id);
      if (!roleData) return total;
      
      let roleCost = 0;
      
      if ('salaryData' in roleData && roleData.salaryData) {
        // Entry level cost
        const entryPhpSalary = roleData.salaryData.Philippines?.entry?.base || 0;
        roleCost += entryPhpSalary * role.distribution.entry;
        
        // Moderate level cost
        const moderatePhpSalary = roleData.salaryData.Philippines?.moderate?.base || 0;
        roleCost += moderatePhpSalary * role.distribution.moderate;
        
        // Experienced level cost
        const experiencedPhpSalary = roleData.salaryData.Philippines?.experienced?.base || 0;
        roleCost += experiencedPhpSalary * role.distribution.experienced;
      }
      
      return total + roleCost;
    }, 0);
  };

  const getTotalPhilippinesCostConverted = () => {
    const phpCost = getTotalPhilippinesCost();
    return Math.round(phpCost * phpToLocalRate);
  };

  const getCompletionPercentage = () => {
    const completeRoles = activeRoles.filter(role => role.distribution.isComplete).length;
    return activeRoles.length > 0 ? (completeRoles / activeRoles.length) * 100 : 0;
  };

  const allRolesConfigured = activeRoles.length > 0 && activeRoles.every(role => role.distribution.isComplete);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">Experience Level</h2>
        </div>
        <p className="text-body-large text-neutral-600 mb-4">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white border-2 rounded-xl p-6 shadow-sm transition-all duration-200 ${
                distribution.isComplete 
                  ? 'border-green-200 bg-green-50/30' 
                  : unassignedCount < 0 
                    ? 'border-red-200 bg-red-50/30'
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
                      Total Team Size: {role.teamSize} member{role.teamSize !== 1 ? 's' : ''}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {experienceLevels.map((option) => {
                  const currentCount = distribution[option.level];
                  const savings = roleData ? getSavingsForRole(roleData, option.level) : 0;
                  const totalSavingsForLevel = savings * currentCount;
                  const canDecrease = currentCount > 0;
                  const canIncrease = distribution.totalAssigned < distribution.totalRequired;

                  return (
                    <div key={option.level} className={`p-4 rounded-lg border-2 bg-gradient-to-br ${option.gradientFrom} ${option.gradientTo}`}>
                      {/* Experience Level Header */}
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className={`text-xl ${option.color}`}>{option.icon}</span>
                        <h5 className={`font-bold text-lg ${option.color} mb-1`}>{option.title}</h5>
                      </div>
                      <div className="bg-white/70 p-2 rounded text-left flex flex-col justify-center min-h-0 mb-6">
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
                      {effectiveLocation && currentCount > 0 && (
                        <div className="bg-white/80 p-3 rounded-lg text-center border border-green-200">
                          {/* Header */}
                          <div className="text-center mb-4">
                            <span className="text-sm font-semibold text-green-800">
                              {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost Comparison
                              <span className="block text-xs text-green-600">
                                Calculated for {currentCount} {option.level === 'entry' ? 'Entry' : option.level === 'moderate' ? 'Mid' : 'Senior'} {currentCount === 1 ? 'Level' : 'Level'} {currentCount === 1 ? 'Member' : 'Members'}
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
                                  {effectiveLocation?.countryName || 'United States'} Rate:
                                </span>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-green-900">
                                    {effectiveLocation.currencySymbol}
                                    {(() => {
                                      if (roleData && 'salaryData' in roleData && roleData.salaryData) {
                                        const localSalary = (roleData.salaryData as any)[effectiveLocation.country]?.[option.level]?.base || 0;
                                        const totalLocalCost = localSalary * currentCount;
                                        return (savingsView === 'monthly' ? Math.round(totalLocalCost / 12) : totalLocalCost).toLocaleString();
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
                                    if (roleData && 'salaryData' in roleData && roleData.salaryData) {
                                      const phpSalary = roleData.salaryData.Philippines?.[option.level]?.base || 0;
                                      const totalPhpCost = phpSalary * currentCount;
                                      return (savingsView === 'monthly' ? Math.round(totalPhpCost / 12) : totalPhpCost).toLocaleString();
                                    }
                                    return '0';
                                  })()}
                                </div>
                                <div className="text-xs text-green-600">
                                  {(() => {
                                    if (roleData && 'salaryData' in roleData && roleData.salaryData) {
                                      const phpSalary = roleData.salaryData.Philippines?.[option.level]?.base || 0;
                                      const convertedSalary = Math.round(phpSalary * phpToLocalRate);
                                      const totalConvertedCost = convertedSalary * currentCount;
                                      return `≈ ${effectiveLocation.currencySymbol}${(savingsView === 'monthly' ? Math.round(totalConvertedCost / 12) : totalConvertedCost).toLocaleString()}`;
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
                                    {effectiveLocation.currencySymbol}
                            {savingsView === 'monthly' 
                              ? Math.round(totalSavingsForLevel / 12).toLocaleString()
                              : totalSavingsForLevel.toLocaleString()
                            }
                          </div>
                                  <div className="text-xs text-green-600">
                                    {(() => {
                                      let localSalary = 0;
                                      let offshoreSalary = 0;
                                      if (roleData && 'type' in roleData && roleData.type === 'predefined' && 'salaryData' in roleData && roleData.salaryData) {
                                        localSalary = ((roleData.salaryData as any)[effectiveLocation.country]?.[option.level]?.base || 0) * currentCount;
                                        offshoreSalary = Math.round((roleData.salaryData.Philippines?.[option.level]?.base || 0) * phpToLocalRate) * currentCount;
                                      } else if (roleData && 'type' in roleData && roleData.type === 'custom' && 'estimatedSalary' in roleData) {
                                        const multipliers = { entry: 0.8, moderate: 1.0, experienced: 1.3 };
                                        localSalary = roleData.estimatedSalary.local * multipliers[option.level] * currentCount;
                                        offshoreSalary = roleData.estimatedSalary.philippine * multipliers[option.level] * currentCount;
                                      }
                                      if (localSalary > 0) {
                                        const percent = ((localSalary - offshoreSalary) / localSalary) * 100;
                                        return `${percent.toFixed(1)}% Savings`;
                                      }
                                      return '0.0% Savings';
                                    })()}
                                  </div>
                                </div>
                              </div>
                          </div>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {allRolesConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <h3 className="text-lg font-bold text-green-800 mb-2">All Roles Configured</h3>
              <p className="text-sm text-green-700">
                Perfect! All {activeRoles.length} role{activeRoles.length !== 1 ? 's' : ''} have been fully assigned. You may still make adjustments above.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!allRolesConfigured && activeRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-6"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <h3 className="text-lg font-bold text-orange-800 mb-2">Complete All Role Assignments</h3>
              <p className="text-sm text-orange-700">
                Please finish assigning experience levels so we can properly calculate your savings.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Consolidated Savings Summary */}
      <AnimatePresence>
        {getCompletionPercentage() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6 rounded-xl bg-gradient-to-r from-neural-blue-50/50 to-quantum-purple-50/50 border border-neural-blue-100/50 relative overflow-hidden"
        >
            {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          
          <div className="relative z-10">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-neural-blue-900">
                Selection Summary
              </h3>
                <p className="text-sm text-neutral-600">
                  Your complete offshore team configuration and savings breakdown
                </p>
              </div>
              
              {/* Role Breakdown - move to top of summary */}
              {getCompletionPercentage() > 0 && (
                <div className="space-y-3 mb-6">
                  <h4 className="text-sm text-gray-600 font-bold mb-2 text-center">Roles Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeRoles.filter(role => role.distribution.totalAssigned > 0).map((role) => {
                      const roleData = allRoles.find(r => r.id === role.id);
                      let totalRoleSavings = 0;
                      if (roleData) {
                        totalRoleSavings += getSavingsForRole(roleData, 'entry') * role.distribution.entry;
                        totalRoleSavings += getSavingsForRole(roleData, 'moderate') * role.distribution.moderate;
                        totalRoleSavings += getSavingsForRole(roleData, 'experienced') * role.distribution.experienced;
                      }
                      return (
                        <div key={role.id} className="bg-white/70 p-3 rounded-lg">
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{role.icon}</span>
                              <div className="font-medium text-sm text-neutral-900">{role.title}</div>
                            </div>
                            <div className="text-xs text-neutral-600">
                              {role.distribution.entry > 0 && `${role.distribution.entry} Entry Level`}
                              {role.distribution.entry > 0 && (role.distribution.moderate > 0 || role.distribution.experienced > 0) && ' | '}
                              {role.distribution.moderate > 0 && `${role.distribution.moderate} Mid Level`}
                              {role.distribution.moderate > 0 && role.distribution.experienced > 0 && ' | '}
                              {role.distribution.experienced > 0 && `${role.distribution.experienced} Senior Level`}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm mb-2">
                            <div className="text-gray-600 text-left">Local Rate{effectiveLocation && effectiveLocation.countryName ? ` (${effectiveLocation.countryName})` : ''}:</div>
                            <div className="text-green-900 text-right font-bold">
                              {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                              {(() => {
                                let local = 0;
                                if (roleData && 'salaryData' in roleData && roleData.salaryData && effectiveLocation) {
                                  local += ((roleData.salaryData as any)[effectiveLocation.country]?.entry?.base || 0) * role.distribution.entry;
                                  local += ((roleData.salaryData as any)[effectiveLocation.country]?.moderate?.base || 0) * role.distribution.moderate;
                                  local += ((roleData.salaryData as any)[effectiveLocation.country]?.experienced?.base || 0) * role.distribution.experienced;
                                }
                                return local.toLocaleString();
                              })()}
                            </div>
                            <div className="text-gray-600 text-left">Philippines Rate:</div>
                            <div className="text-blue-900 text-right font-bold">
                              ₱
                              {(() => {
                                let php = 0;
                                if (roleData && 'salaryData' in roleData && roleData.salaryData) {
                                  php += (roleData.salaryData.Philippines?.entry?.base || 0) * role.distribution.entry;
                                  php += (roleData.salaryData.Philippines?.moderate?.base || 0) * role.distribution.moderate;
                                  php += (roleData.salaryData.Philippines?.experienced?.base || 0) * role.distribution.experienced;
                                }
                                return php.toLocaleString();
                              })()}
                            </div>
                            <div className="text-gray-600 text-left">Annual Savings:</div>
                            <div className="text-green-600 text-right font-bold">
                              {effectiveLocation ? (effectiveLocation.currencySymbol || '$') : '$'}
                              {savingsView === 'monthly' 
                                ? Math.round(totalRoleSavings / 12).toLocaleString()
                                : totalRoleSavings.toLocaleString()
                              }
                              <span className="block text-xs text-neutral-600 font-normal">{savingsView === 'monthly' ? 'Monthly' : 'Annual'} savings</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-bold">
                    {effectiveLocation?.countryName || 'United States'} {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    {effectiveLocation?.currencySymbol || '$'}
                    {savingsView === 'monthly' 
                      ? Math.round(getTotalLocalCost() / 12).toLocaleString()
                      : getTotalLocalCost().toLocaleString()
                    }
          </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-bold">
                    Philippines {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Cost
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    ₱{savingsView === 'monthly' 
                      ? Math.round(getTotalPhilippinesCost() / 12).toLocaleString()
                      : getTotalPhilippinesCost().toLocaleString()
                    }
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    ≈ {effectiveLocation?.currencySymbol || '$'}
                    {savingsView === 'monthly' 
                      ? Math.round(getTotalPhilippinesCostConverted() / 12).toLocaleString()
                      : getTotalPhilippinesCostConverted().toLocaleString()
                    } {effectiveLocation?.currency || 'USD'}
                  </div>
              </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 font-bold">
                    Total {savingsView === 'monthly' ? 'Monthly' : 'Annual'} Savings
                  </div>
                <div className="text-2xl font-bold text-cyber-green-600">
                    {effectiveLocation?.currencySymbol || '$'}
                    {savingsView === 'monthly' 
                      ? Math.round(getTotalSavings() / 12).toLocaleString()
                      : getTotalSavings().toLocaleString()
                    }
            </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
} 