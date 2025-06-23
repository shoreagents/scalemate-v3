'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { RoleId } from '@/types';
import { ROLES as STATIC_ROLE_DEFINITIONS } from '@/utils/calculator/data';
import { useCalculatorData } from '@/hooks/useCalculatorData';
import { Users, TrendingUp, DollarSign, Plus, Minus } from 'lucide-react';

interface RoleSelectionStepProps {
  selectedRoles: Record<RoleId, boolean>;
  teamSize: Record<RoleId, number>;
  onChange: (selectedRoles: Record<RoleId, boolean>, teamSize: Record<RoleId, number>) => void;
}

export function RoleSelectionStep({ selectedRoles, teamSize, onChange }: RoleSelectionStepProps) {
  const { 
    location, 
    portfolioData,
    roleData,
    isLoading, 
    error,
    isAIGenerated,
    refetch
  } = useCalculatorData();

  // Use API role data if available, fallback to static data
  const ROLE_DEFINITIONS = roleData || STATIC_ROLE_DEFINITIONS;

  // Create role display data from API or static definitions
const ROLES = Object.values(ROLE_DEFINITIONS).map(role => ({
  id: role.id,
  title: role.title,
  description: role.description,
  icon: role.icon,
  colors: {
    border: 'border-neural-blue-500',
    bg: 'bg-neural-blue-50',
    text: 'text-neural-blue-700',
    button: 'bg-neural-blue-100 text-neural-blue-600 hover:bg-neural-blue-200',
    indicator: 'bg-neural-blue-500'
  },
    keyTasks: STATIC_ROLE_DEFINITIONS[role.id as RoleId]?.tasks?.slice(0, 4).map((task: any) => task.name) || [], // Get first 4 task names from static data
    avgSalaryAU: role.averageSalary?.australian || 0,
    avgSalaryPH: role.averageSalary?.philippine || 0,
  complexity: 'Medium' // Default complexity for display
}));

  const handleRoleToggle = (roleId: RoleId) => {
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: !selectedRoles[roleId]
    };
    
    const newTeamSize = { ...teamSize };
    
    // If selecting role for first time, set default team size to 1
    if (!selectedRoles[roleId] && !teamSize[roleId]) {
      newTeamSize[roleId] = 1;
    }
    // If deselecting role, set team size to 0
    else if (selectedRoles[roleId]) {
      newTeamSize[roleId] = 0;
    }
    
    onChange(newSelectedRoles, newTeamSize);
  };

  const handleTeamSizeChange = (roleId: RoleId, change: number) => {
    const currentSize = teamSize[roleId] || 0;
    const newSize = Math.max(0, Math.min(10, currentSize + change)); // Min 0, Max 10
    
    const newTeamSize = {
      ...teamSize,
      [roleId]: newSize
    };
    
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: newSize > 0
    };
    
    onChange(newSelectedRoles, newTeamSize);
  };

  const getTotalTeamSize = () => {
    return Object.entries(selectedRoles).reduce((sum, [roleId, isSelected]) => {
      if (!isSelected) return sum;
      return sum + (teamSize[roleId as RoleId] || 0);
    }, 0);
  };

  const getTotalSavings = () => {
    return Object.entries(selectedRoles).reduce((total, [roleId, isSelected]) => {
      if (!isSelected) return total;
      
      const role = ROLES.find(r => r.id === roleId);
      if (!role) return total;
      
      const size = teamSize[roleId as RoleId] || 1;
      const savings = (role.avgSalaryAU - role.avgSalaryPH) * size;
      return total + savings;
    }, 0);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <motion.div 
          className="flex items-center justify-center gap-3 mb-4"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-headline-1 text-neutral-900">
            Which roles do you want to offshore?
          </h2>
        </motion.div>
        
        <motion.p 
          className="text-body-large text-neutral-600"
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Select the property management roles you'd like to offshore. You can adjust team sizes for each role.
        </motion.p>
      </motion.div>

      {/* Role Cards */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {ROLES.map((role, index) => {
          const isSelected = selectedRoles[role.id as RoleId];
          const currentTeamSize = teamSize[role.id as RoleId] || 0;
          const savings = (role.avgSalaryAU - role.avgSalaryPH) * currentTeamSize;
          
          return (
            <motion.div
              key={role.id}
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 }
              }}
              transition={{ 
                delay: index * 0.1, 
                duration: 0.6, 
                ease: "easeOut"
              }}
              className="relative h-full"
            >
              <div
                tabIndex={0}
                style={{ 
                  transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                className={`p-6 rounded-2xl cursor-pointer h-full flex flex-col border overflow-hidden ${isSelected 
                  ? 'bg-brand-primary-50 shadow border-brand-primary-400' 
                  : 'bg-white border-brand-primary-100 shadow hover:bg-brand-primary-25 hover:border-brand-primary-200 hover:shadow-neural-glow focus:shadow-neural-glow focus:border-brand-primary-300'
                }`}
                onClick={() => handleRoleToggle(role.id as RoleId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleRoleToggle(role.id as RoleId);
                  }
                }}
              >
                {/* Role Header */}
                <div className="mb-4">
                  <div className="text-4xl mb-2">{role.icon}</div>
                  <h3 className="text-xl font-bold mb-1 text-neutral-900">
                    {role.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {role.description}
                  </p>
                </div>

                {/* Key Tasks */}
                <div className="mb-4 flex-grow">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Tasks:</h4>
                  <ul className="space-y-1">
                    {role.keyTasks.slice(0, 3).map((task: string, index: number) => (
                      <li key={index} className="text-xs text-neutral-600 flex items-center">
                        <div className="w-1 h-1 rounded-full bg-neutral-400 mr-2" />
                        {task}
                      </li>
                    ))}
                    {role.keyTasks.length > 3 && (
                      <li className="text-xs text-neutral-500">
                        +{role.keyTasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                </div>

                {/* Team Size Selector */}
                {isSelected && (
                  <div className="border-t border-brand-primary-200 bg-brand-primary-25 -mx-6 px-6 pt-4 pb-2 rounded-b-2xl"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-primary-700">Team Size:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamSizeChange(role.id as RoleId, -1);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${currentTeamSize > 1 
                              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                              : 'bg-neutral-100 text-neutral-400'
                            }`}
                          disabled={currentTeamSize <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-bold text-brand-primary-700">
                          {currentTeamSize}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamSizeChange(role.id as RoleId, 1);
                          }}
                          className="w-8 h-8 rounded-full bg-brand-primary-100 text-brand-primary-600 hover:bg-brand-primary-200 flex items-center justify-center transition-colors"
                          disabled={currentTeamSize >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {currentTeamSize > 0 && (
                      <div className="mt-3 p-3 bg-brand-primary-100 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm font-medium text-brand-primary-700 mb-1">
                            Total Savings
                          </div>
                          <div className="text-lg font-bold text-brand-primary-800">
                            {(location?.currency && location.currency !== 'Unknown') ? location.currency : '$'}{savings.toLocaleString()}/year
                          </div>
                          <div className="text-xs text-brand-primary-600 mt-1">
                            {Math.round(((role.avgSalaryAU - role.avgSalaryPH) / role.avgSalaryAU) * 100)}% savings per person
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Help Text */}
      <div className="mt-8 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-brand-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">
              Need help choosing?
            </h4>
            <p className="text-sm text-neutral-600">
              Start with 1-2 roles that handle repetitive tasks. Assistant Property Managers and 
              Leasing Coordinators are popular first choices for offshore teams.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      {Object.values(selectedRoles).some(Boolean) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-brand-primary-50 border border-brand-primary-200"
        >
            <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-brand-primary-900 mb-2">
                Selection Summary
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
              <div className="text-2xl font-bold text-brand-primary-600">
                  {Object.values(selectedRoles).filter(Boolean).length}
                </div>
              <div className="text-sm text-brand-primary-600">Roles Selected</div>
              </div>
              <div>
              <div className="text-2xl font-bold text-brand-secondary-600">
                  {getTotalTeamSize()}
                </div>
              <div className="text-sm text-brand-primary-600">Total Team Members</div>
              </div>
              <div>
              <div className="text-2xl font-bold text-green-600">
                  ${getTotalSavings().toLocaleString()}
              </div>
              <div className="text-sm text-brand-primary-600">Annual Savings</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 