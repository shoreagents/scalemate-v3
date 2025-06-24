'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExperienceLevel, CustomRole, LocationData, RoleExperienceDistribution } from '@/types';
import { ENHANCED_SALARY_DATA, ENHANCED_PROPERTY_ROLES, ADDITIONAL_PROPERTY_ROLES } from '@/utils/dataQuoteCalculator';
import { Button } from '@/components/ui/Button';
import { Check, Users, DollarSign, Clock, Award, Target, Lightbulb, GraduationCap, ChevronDown, ChevronUp, BarChart3, Plus, Minus } from 'lucide-react';

interface ExperienceStepProps {
  value: ExperienceLevel | ''; // Legacy single level for backward compatibility
  selectedRoles: Record<string, boolean>;
  customRoles: Record<string, CustomRole>;
  teamSize: Record<string, number>;
  roleExperienceLevels: Record<string, ExperienceLevel>; // Deprecated
  roleExperienceDistribution: Record<string, RoleExperienceDistribution>;
  userLocation?: LocationData;
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
  onChange, 
  onRoleExperienceChange,
  onRoleExperienceDistributionChange,
  onCalculate, 
  isCalculating 
}: ExperienceStepProps) {
  
  // Get all available roles (predefined + additional + custom)
  const allRoles = React.useMemo(() => {
    const predefinedRoles = Object.values(ENHANCED_PROPERTY_ROLES);
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
      salaryRange: '$12,000 - $18,000',
      bestFor: 'Standard processes, routine tasks, growing businesses',
      color: 'text-green-700',
      gradientFrom: 'from-green-50',
      gradientTo: 'to-emerald-50'
    },
    {
      level: 'moderate',
      title: 'Mid-Level',
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
      salaryRange: '$18,000 - $25,000',
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
      salaryRange: '$25,000 - $35,000',
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
    if (!userLocation) return 0;
    
    if (role.salaryData) {
      const localSalary = role.salaryData[userLocation.country]?.[experienceLevel]?.total || 0;
      const philippineSalary = role.salaryData.PH?.[experienceLevel]?.total || 0;
      return localSalary - philippineSalary;
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
          <h2 className="text-headline-1 text-neutral-900">Distribute Experience Levels</h2>
        </div>
        <p className="text-body-large text-neutral-600 mb-4">
          Assign team members to different experience levels for each role. Mix and match to optimize your team composition.
        </p>
        
        {/* Progress Indicator */}
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm text-neutral-600 mb-2">
            <span>Configuration Progress</span>
            <span>{Math.round(getCompletionPercentage())}% Complete</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getCompletionPercentage()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Role-by-Role Experience Distribution */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-neutral-900 text-center">
          Configure Each Role ({activeRoles.length} role{activeRoles.length !== 1 ? 's' : ''})
        </h3>
        
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
                
                {/* Assignment Status */}
                <div className="text-right">
                  <div className={`text-sm font-medium ${
                    distribution.isComplete 
                      ? 'text-green-600' 
                      : unassignedCount < 0 
                        ? 'text-red-600'
                        : 'text-orange-600'
                  }`}>
                    {distribution.isComplete 
                      ? '✓ Complete' 
                      : unassignedCount < 0 
                        ? `${Math.abs(unassignedCount)} over-assigned`
                        : `${unassignedCount} unassigned`}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {distribution.totalAssigned} of {distribution.totalRequired} assigned
                  </div>
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
                      <div className="text-center mb-4">
                        <div className={`p-3 rounded-lg bg-white/80 ${option.color} mx-auto w-fit mb-2`}>
                          {option.icon}
                        </div>
                        <h5 className={`font-bold text-lg ${option.color} mb-1`}>{option.title}</h5>
                        <p className="text-xs text-neutral-600 leading-tight">{option.description}</p>
                      </div>

                      {/* Counter Controls */}
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <button
                          onClick={() => updateRoleDistribution(role.id, option.level, currentCount - 1)}
                          disabled={!canDecrease}
                          className="w-10 h-10 rounded-full border-2 border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <div className="w-16 h-16 rounded-full bg-white/90 border-2 border-neutral-200 flex items-center justify-center">
                          <span className="text-2xl font-bold text-neutral-800">{currentCount}</span>
                        </div>
                        <button
                          onClick={() => updateRoleDistribution(role.id, option.level, currentCount + 1)}
                          disabled={!canIncrease}
                          className="w-10 h-10 rounded-full border-2 border-neutral-300 bg-white hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Key Details */}
                      <div className="space-y-2 mb-4">
                        <div className="bg-white/70 p-2 rounded text-center">
                          <div className="flex items-center justify-center text-xs text-neutral-600 mb-1">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{option.timeToProductivity}</span>
                          </div>
                          <div className="flex items-center justify-center text-xs text-neutral-600">
                            <DollarSign className="w-3 h-3 mr-1" />
                            <span>{option.salaryRange}</span>
                          </div>
                        </div>
                        <div className="text-xs text-neutral-600 text-center px-2">
                          <strong>Best for:</strong> {option.bestFor}
                        </div>
                      </div>

                      {/* Savings for This Level */}
                      {userLocation && currentCount > 0 && totalSavingsForLevel > 0 && (
                        <div className="bg-white/80 p-3 rounded-lg text-center border border-green-200">
                          <div className="text-lg font-bold text-green-600 mb-1">
                            {userLocation.currencySymbol}{totalSavingsForLevel.toLocaleString()}
                          </div>
                          <div className="text-xs text-neutral-600">
                            {currentCount} member{currentCount !== 1 ? 's' : ''} × {userLocation.currencySymbol}{savings.toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600 font-medium">Annual savings</div>
                        </div>
                      )}

                      {/* Empty State */}
                      {currentCount === 0 && (
                        <div className="bg-white/50 p-3 rounded-lg text-center border border-dashed border-neutral-300">
                          <div className="text-sm text-neutral-500">No members assigned</div>
                          <div className="text-xs text-neutral-400 mt-1">Click + to add</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Message */}
              <div className="mt-4">
                {distribution.isComplete ? (
                  <div className="p-3 rounded-lg text-sm bg-green-100 text-green-800 border border-green-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>✅ Assignment Complete - All {distribution.totalRequired} members assigned</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      Can decrease, no more increases
                    </div>
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg text-sm ${
                    unassignedCount < 0 
                      ? 'bg-red-100 text-red-800 border border-red-200' 
                      : 'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    {unassignedCount < 0 
                      ? `⚠️ Please reduce assignments by ${Math.abs(unassignedCount)} member${Math.abs(unassignedCount) !== 1 ? 's' : ''}`
                      : `📝 Please assign ${unassignedCount} more member${unassignedCount !== 1 ? 's' : ''} to complete this role`}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

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
                <h3 className="text-xl font-bold text-neural-blue-900 mb-2">
                  Consolidated Team Summary
                </h3>
                <p className="text-sm text-neutral-600">
                  Your complete offshore team configuration and savings breakdown
                </p>
              </div>
              
              {/* Summary Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-neural-blue-600">{activeRoles.length}</div>
                  <div className="text-sm text-neutral-600">Roles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-quantum-purple-600">{totalAssignedMembers}</div>
                  <div className="text-sm text-neutral-600">Assigned Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyber-green-600">
                    {userLocation?.currencySymbol || '$'}{getTotalSavings().toLocaleString()}
                  </div>
                  <div className="text-sm text-neutral-600">Annual Savings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-neural-blue-600">
                    {Math.round(getCompletionPercentage())}%
                  </div>
                  <div className="text-sm text-neutral-600">Complete</div>
                </div>
              </div>

              {/* Role Breakdown */}
              {getCompletionPercentage() > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-neutral-900 text-center">Role Breakdown</h4>
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
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{role.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-neutral-900 truncate">{role.title}</div>
                              <div className="text-xs text-neutral-600">
                                {role.distribution.entry > 0 && `${role.distribution.entry} Entry`}
                                {role.distribution.entry > 0 && (role.distribution.moderate > 0 || role.distribution.experienced > 0) && ', '}
                                {role.distribution.moderate > 0 && `${role.distribution.moderate} Mid`}
                                {role.distribution.moderate > 0 && role.distribution.experienced > 0 && ', '}
                                {role.distribution.experienced > 0 && `${role.distribution.experienced} Senior`}
                              </div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-600">
                              {userLocation?.currencySymbol || '$'}{totalRoleSavings.toLocaleString()}
                            </div>
                            <div className="text-xs text-neutral-600">Annual savings</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion Status & Calculate Button */}
      <AnimatePresence>
        {allRolesConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            {/* All Complete Indicator */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-green-800">All Roles Configured!</h3>
              </div>
              <p className="text-sm text-green-700">
                Perfect! All {activeRoles.length} role{activeRoles.length !== 1 ? 's' : ''} have been completely assigned. 
                You can still make adjustments above, or proceed to calculate your savings.
              </p>
            </div>

            <Button
              onClick={onCalculate}
              disabled={isCalculating}
              className="w-full sm:w-auto px-8 py-4 text-lg shadow-lg"
              size="lg"
            >
              {isCalculating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Calculating...
                </>
              ) : (
                'Calculate My Detailed Savings'
              )}
            </Button>
            <p className="text-sm text-neutral-500 mt-2">
              Get your personalized offshore scaling report with detailed experience-level analysis
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incomplete Roles Indicator */}
      <AnimatePresence>
        {!allRolesConfigured && activeRoles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-orange-800">Complete All Role Assignments</h3>
              </div>
              <p className="text-sm text-orange-700">
                Please finish assigning team members to all experience levels before proceeding to calculate your savings.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 