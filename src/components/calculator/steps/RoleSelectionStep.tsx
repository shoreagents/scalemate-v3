'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleId } from '@/types';
import { ROLES } from '@/utils/calculator/data';
import { 
  Users, 
  Search, 
  Plus, 
  Minus, 
  TrendingUp, 
  DollarSign
} from 'lucide-react';

interface RoleSelectionStepProps {
  selectedRoles: Record<RoleId, boolean>;
  teamSize: Record<RoleId, number>;
  onChange: (selectedRoles: Record<RoleId, boolean>, teamSize: Record<RoleId, number>) => void;
}

interface RoleSearchFilters {
  query: string;
  sortBy: 'name' | 'savings';
}

export function RoleSelectionStep({ 
  selectedRoles, 
  teamSize, 
  onChange 
}: RoleSelectionStepProps) {
  const [searchFilters, setSearchFilters] = useState<RoleSearchFilters>({
    query: '',
    sortBy: 'savings'
  });

  // All available roles from static data
  const allRoles = Object.entries(ROLES).map(([id, role]) => ({
    ...role,
    id: id as RoleId
  }));

  // Filtered and sorted roles
  const filteredRoles = allRoles.filter(role => {
    if (searchFilters.query) {
      const query = searchFilters.query.toLowerCase();
      const searchableText = [
        role.title,
        role.description
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    return true;
  }).sort((a, b) => {
    switch (searchFilters.sortBy) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'savings':
        const aSavings = a.averageSalary.australian - a.averageSalary.philippine;
        const bSavings = b.averageSalary.australian - b.averageSalary.philippine;
        return bSavings - aSavings;
      default:
        return 0;
    }
  });

  const handleRoleToggle = (roleId: RoleId) => {
    const newSelectedRoles = {
      ...selectedRoles,
      [roleId]: !selectedRoles[roleId]
    };
    
    const newTeamSize = { ...teamSize };
    
    if (!selectedRoles[roleId]) {
      // Role is being selected - set default team size to 1
      newTeamSize[roleId] = teamSize[roleId] || 1;
    } else {
      // Role is being deselected - reset team size to 0
      newTeamSize[roleId] = 0;
    }
    
    onChange(newSelectedRoles, newTeamSize);
  };

  const handleTeamSizeChange = (roleId: RoleId, change: number) => {
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
      
      const role = ROLES[roleId as RoleId];
      if (!role) return total;
      
      const size = teamSize[roleId as RoleId] || 1;
      const savings = (role.averageSalary.australian - role.averageSalary.philippine) * size;
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
          Select the roles you want to include in your offshore team and specify team sizes.
        </p>
      </div>

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
          
          {/* Sort By */}
          <select
            value={searchFilters.sortBy}
            onChange={(e) => setSearchFilters(prev => ({ 
              ...prev, 
              sortBy: e.target.value as 'name' | 'savings'
            }))}
            className="px-3 py-3 border border-neutral-300 rounded-lg text-sm"
          >
            <option value="savings">Highest Savings</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredRoles.map((role) => {
          const isSelected = selectedRoles[role.id];
          const currentTeamSize = teamSize[role.id] || 0;
          const annualSavings = (role.averageSalary.australian - role.averageSalary.philippine) * currentTeamSize;

          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative h-full"
            >
              <div
                className={`
                  relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 h-full flex flex-col
                  ${isSelected 
                    ? 'border-brand-primary-500 bg-brand-primary-50 shadow-lg' 
                    : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:shadow-md'
                  }
                `}
                onClick={() => handleRoleToggle(role.id)}
              >
                {/* Selection Indicator */}
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

                {/* Savings Display */}
                <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                  <div className="text-center mb-3">
                    <span className="text-sm font-semibold text-green-800">Annual Cost Comparison</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">Australian Rate:</span>
                      <span className="text-sm font-bold text-green-900">
                        ${role.averageSalary.australian.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">Philippines Rate:</span>
                      <span className="text-sm font-bold text-green-900">
                        ${role.averageSalary.philippine.toLocaleString()}
                      </span>
                    </div>
                    <div className="border-t border-green-300 pt-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-green-800">Per Role Savings:</span>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            ${(role.averageSalary.australian - role.averageSalary.philippine).toLocaleString()}
                          </div>
                          <div className="text-xs text-green-600">
                            {(((role.averageSalary.australian - role.averageSalary.philippine) / role.averageSalary.australian) * 100).toFixed(0)}% savings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Size Controls */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
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
                            className="w-8 h-8 rounded-full border-2 border-cyber-green-300 bg-white hover:bg-cyber-green-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            className="w-8 h-8 rounded-full border-2 border-cyber-green-300 bg-white hover:bg-cyber-green-50 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={currentTeamSize >= 10}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {currentTeamSize > 0 && (
                        <div className="mt-3 p-3 bg-cyber-green-100 rounded-lg">
                          <div className="text-center">
                            <div className="text-sm font-medium text-cyber-green-700 mb-1">
                              Total Annual Savings for {currentTeamSize} {currentTeamSize === 1 ? 'person' : 'people'}
                            </div>
                            <div className="text-lg font-bold text-cyber-green-800">
                              ${annualSavings.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* No roles found */}
      {filteredRoles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No roles found</h3>
          <p className="text-neutral-600 mb-4">
            Try adjusting your search or browse all available roles.
          </p>
        </div>
      )}

      {/* Summary */}
      {getTotalTeamSize() > 0 && (
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
                Your Selected Team Summary
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
                  ${getTotalSavings().toLocaleString()}
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