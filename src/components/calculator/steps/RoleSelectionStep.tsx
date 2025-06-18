'use client';

import { motion } from 'framer-motion';
import { RoleId } from '@/types';
import { SALARY_DATA } from '@/utils/constants';
import { Users, TrendingUp, DollarSign, Plus, Minus } from 'lucide-react';

interface RoleSelectionStepProps {
  selectedRoles: Record<RoleId, boolean>;
  teamSize: Record<RoleId, number>;
  onChange: (selectedRoles: Record<RoleId, boolean>, teamSize: Record<RoleId, number>) => void;
}

const ROLES = [
  {
    id: 'assistantPropertyManager' as RoleId,
    title: 'Assistant Property Manager',
    description: 'Handle tenant applications, lease renewals, maintenance coordination, and compliance documentation.',
    icon: '🏢',
    color: 'brand-primary',
    keyTasks: [
      'Tenant Application Screening',
      'Lease Renewal Processing', 
      'Maintenance Coordination',
      'Compliance Documentation'
    ],
    avgSalaryAU: 75000,
    avgSalaryPH: 18000,
    complexity: 'Medium'
  },
  {
    id: 'leasingCoordinator' as RoleId,
    title: 'Leasing Coordinator',
    description: 'Manage inquiries, coordinate property tours, process applications, and conduct market research.',
    icon: '🗝️',
    color: 'brand-secondary',
    keyTasks: [
      'Inquiry Response Management',
      'Virtual Tour Coordination',
      'Application Processing',
      'Market Research & Pricing'
    ],
    avgSalaryAU: 68000,
    avgSalaryPH: 15000,
    complexity: 'Medium'
  },
  {
    id: 'marketingSpecialist' as RoleId,
    title: 'Marketing Specialist',
    description: 'Create property marketing content, manage social media, analyze performance, and optimize campaigns.',
    icon: '📈',
    color: 'brand-accent',
    keyTasks: [
      'Property Marketing Content',
      'Social Media Management',
      'Performance Analytics',
      'Campaign Optimization'
    ],
    avgSalaryAU: 72000,
    avgSalaryPH: 18000,
    complexity: 'Medium-High'
  }
];

export function RoleSelectionStep({ selectedRoles, teamSize, onChange }: RoleSelectionStepProps) {
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
    <div className="max-w-4xl mx-auto">
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
          Select the property management roles you'd like to move offshore. 
          You can adjust team sizes for each role.
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {ROLES.map((role) => {
          const isSelected = selectedRoles[role.id];
          const currentTeamSize = teamSize[role.id] || 0;
          const savings = (role.avgSalaryAU - role.avgSalaryPH) * currentTeamSize;
          
          return (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <div
                className={`
                  p-6 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${isSelected 
                    ? `border-${role.color}-500 bg-${role.color}-50 shadow-lg` 
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
                    className={`absolute top-4 right-4 w-6 h-6 rounded-full bg-${role.color}-500 flex items-center justify-center`}
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Role Header */}
                <div className="mb-4">
                  <div className="text-4xl mb-2">{role.icon}</div>
                  <h3 className={`
                    text-xl font-bold mb-1
                    ${isSelected ? `text-${role.color}-700` : 'text-neutral-900'}
                  `}>
                    {role.title}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {role.description}
                  </p>
                </div>

                {/* Key Tasks */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">Key Tasks:</h4>
                  <ul className="space-y-1">
                    {role.keyTasks.slice(0, 3).map((task, index) => (
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

                {/* Savings Preview */}
                <div className="mb-4 p-3 rounded-lg bg-white/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-500">Potential Savings</span>
                    <span className="text-xs text-neutral-500">Per Person/Year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-600">
                      ${(role.avgSalaryAU - role.avgSalaryPH).toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {Math.round(((role.avgSalaryAU - role.avgSalaryPH) / role.avgSalaryAU) * 100)}% savings
                    </span>
                  </div>
                </div>

                {/* Team Size Selector */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-neutral-200 pt-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Team Size:</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamSizeChange(role.id, -1);
                          }}
                          className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-colors
                            ${currentTeamSize > 1 
                              ? `bg-${role.color}-100 text-${role.color}-600 hover:bg-${role.color}-200` 
                              : 'bg-neutral-100 text-neutral-400'
                            }
                          `}
                          disabled={currentTeamSize <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-8 text-center font-bold text-neutral-900">
                          {currentTeamSize}
                        </span>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTeamSizeChange(role.id, 1);
                          }}
                          className={`
                            w-8 h-8 rounded-full bg-${role.color}-100 text-${role.color}-600 
                            hover:bg-${role.color}-200 flex items-center justify-center transition-colors
                          `}
                          disabled={currentTeamSize >= 10}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {currentTeamSize > 0 && (
                      <div className="mt-2 text-center">
                        <div className="text-sm text-neutral-600">
                          Total Savings: 
                          <span className="font-bold text-green-600 ml-1">
                            ${savings.toLocaleString()}/year
                          </span>
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

      {/* Summary Card */}
      {Object.values(selectedRoles).some(Boolean) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-gradient-to-r from-brand-primary-50 to-brand-secondary-50 border border-brand-primary-200"
        >
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-neutral-900 mb-2">
              Selection Summary
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-primary-600">
                {Object.values(selectedRoles).filter(Boolean).length}
              </div>
              <div className="text-sm text-neutral-600">Roles Selected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-secondary-600">
                {getTotalTeamSize()}
              </div>
              <div className="text-sm text-neutral-600">Total Team Members</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                ${getTotalSavings().toLocaleString()}
              </div>
              <div className="text-sm text-neutral-600">Annual Savings</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Help Text */}
      <div className="mt-8 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-secondary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-brand-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </div>
  );
} 