'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleId, CustomTask, TaskComplexity, LocationData, ManualLocation } from '@/types';
import { ROLES } from '@/utils/rolesData';
import { Button } from '@/components/ui/Button';
import { Plus, Check, CheckSquare, ChevronDown, ChevronUp, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface TaskSelectionStepProps {
  selectedRoles: Record<RoleId, boolean>;
  selectedTasks: Record<string, boolean>;
  customTasks: Record<RoleId, readonly CustomTask[]>;
  onChange: (selectedTasks: Record<string, boolean>, customTasks: Record<RoleId, readonly CustomTask[]>) => void;
  
  // Dynamic roles data
  roles?: Record<string, any>;
  isLoadingRoles?: boolean;
  rolesError?: string | null;
  isUsingDynamicRoles?: boolean;
  
  // Location data for AI indicator
  userLocation?: LocationData;
  manualLocation?: ManualLocation | null;
}

export function TaskSelectionStep({ 
  selectedRoles, 
  selectedTasks, 
  customTasks, 
  onChange,
  
  // Dynamic roles data
  roles,
  isLoadingRoles = false,
  rolesError = null,
  isUsingDynamicRoles = false,
  
  // Location data for AI indicator
  userLocation,
  manualLocation
}: TaskSelectionStepProps) {
  // Helper function to get role data from all sources
  const getRoleData = (roleId: RoleId) => {
    console.log('🔍 [TaskSelectionStep] Getting role data for:', roleId, {
      rolesExists: !!roles,
      rolesCount: roles ? Object.keys(roles).length : 0,
      isUsingDynamicRoles,
      isLoadingRoles
    });
    
    // Use dynamic roles if available, otherwise fall back to static ROLES
    const availableRoles = roles || ROLES;
    
    if (roleId in availableRoles) {
      const enhancedRole = availableRoles[roleId as keyof typeof availableRoles];
      console.log('✅ [TaskSelectionStep] Found role data with tasks:', {
        roleId,
        tasksCount: enhancedRole.tasks?.length || 0,
        isDynamic: !!roles
      });
      return enhancedRole;
    }
    
    // Fallback for unknown roles
    console.log('📋 [TaskSelectionStep] Using fallback data for unknown role:', roleId);
    return {
      id: roleId,
      title: `${roleId} Role`,
      icon: '📋',
      description: 'Custom role',
      tasks: [],
      category: 'custom'
    };
  };

  const [expandedRoles, setExpandedRoles] = useState<Record<RoleId, boolean>>({
    assistantPropertyManager: true,
    leasingCoordinator: false,
    marketingSpecialist: false,
  });
  const [showAddCustom, setShowAddCustom] = useState<Record<RoleId, boolean>>({
    assistantPropertyManager: false,
    leasingCoordinator: false,
    marketingSpecialist: false,
  });
  const [customTaskInputs, setCustomTaskInputs] = useState<Record<RoleId, { name: string; description: string; complexity: TaskComplexity }>>({
    assistantPropertyManager: { name: '', description: '', complexity: 'medium' },
    leasingCoordinator: { name: '', description: '', complexity: 'medium' },
    marketingSpecialist: { name: '', description: '', complexity: 'medium' },
  });

  // Pagination state for each role
  const [taskPage, setTaskPage] = useState<Record<RoleId, number>>({
    assistantPropertyManager: 0,
    leasingCoordinator: 0,
    marketingSpecialist: 0,
  });

  const TASKS_PER_PAGE = 5;

  const activeRoles = Object.entries(selectedRoles)
    .filter(([, isSelected]) => isSelected)
    .map(([roleId]) => roleId as RoleId);

  const toggleRole = (roleId: RoleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  const handleTaskToggle = (roleId: RoleId, taskId: string) => {
    const taskKey = `${roleId}-${taskId}`;
    const newSelectedTasks = {
      ...selectedTasks,
      [taskKey]: !selectedTasks[taskKey]
    };
    onChange(newSelectedTasks, customTasks);
  };

  const handleAddCustomTask = (roleId: RoleId) => {
    const input = customTaskInputs[roleId];
    if (!input?.name.trim() || !input?.description.trim()) return;

    const newCustomTask: CustomTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      name: input.name.trim(),
      description: input.description.trim(),
      estimatedComplexity: input.complexity,
      createdAt: new Date(),
    };

    const updatedCustomTasks = {
      ...customTasks,
      [roleId]: [...(customTasks[roleId] || []), newCustomTask]
    };

    onChange(selectedTasks, updatedCustomTasks);
    
    // Reset input
    setCustomTaskInputs(prev => ({
      ...prev,
      [roleId]: { name: '', description: '', complexity: 'medium' }
    }));
    setShowAddCustom(prev => ({ ...prev, [roleId]: false }));
  };

  const handleRemoveCustomTask = (roleId: RoleId, taskId: string) => {
    const updatedCustomTasks = {
      ...customTasks,
      [roleId]: customTasks[roleId]?.filter(task => task.id !== taskId) || []
    };
    onChange(selectedTasks, updatedCustomTasks);
  };

  const updateCustomTaskInput = (roleId: RoleId, field: 'name' | 'description' | 'complexity', value: string | TaskComplexity) => {
    setCustomTaskInputs(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        name: prev[roleId]?.name || '',
        description: prev[roleId]?.description || '',
        complexity: prev[roleId]?.complexity || 'medium',
        [field]: value
      }
    }));
  };

  const getSelectedTasksCount = (roleId: RoleId) => {
    const role = getRoleData(roleId);
    const standardTasks = role.tasks ? role.tasks.filter((task: any) => 
      selectedTasks[`${roleId}-${task.id}`]
    ).length : 0;
    const customTasksCount = customTasks[roleId]?.length || 0;
    return standardTasks + customTasksCount;
  };

  const getTotalSelectedTasks = () => {
    return activeRoles.reduce((total, roleId) => total + getSelectedTasksCount(roleId), 0);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'administrative': return '📋';
      case 'communication': return '💬';
      case 'marketing': return '📈';
      case 'analysis': return '🔍';
      case 'coordination': return '🤝';
      default: return '⚡';
    }
  };

  const getComplexityBadge = (complexity: TaskComplexity) => {
    switch (complexity) {
      case 'low':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center">
            Easy Task
          </span>
        );
      case 'medium':
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full flex items-center">
            Standard Task
          </span>
        );
      case 'high':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full flex items-center">
            Complex Task
          </span>
        );
      default:
        return null;
    }
  };

  // Pagination functions
  const getPaginatedTasks = (roleId: RoleId) => {
    const role = getRoleData(roleId);
    const currentPage = taskPage[roleId] || 0;
    const startIndex = currentPage * TASKS_PER_PAGE;
    const endIndex = startIndex + TASKS_PER_PAGE;
    
    return role.tasks ? role.tasks.slice(startIndex, endIndex) : [];
  };

  const getTotalPages = (roleId: RoleId) => {
    const role = getRoleData(roleId);
    return role.tasks ? Math.ceil(role.tasks.length / TASKS_PER_PAGE) : 0;
  };

  const goToNextPage = (roleId: RoleId) => {
    const totalPages = getTotalPages(roleId);
    const currentPage = taskPage[roleId] || 0;
    if (currentPage < totalPages - 1) {
      setTaskPage(prev => ({ ...prev, [roleId]: currentPage + 1 }));
    }
  };

  const goToPreviousPage = (roleId: RoleId) => {
    const currentPage = taskPage[roleId] || 0;
    if (currentPage > 0) {
      setTaskPage(prev => ({ ...prev, [roleId]: currentPage - 1 }));
    }
  };

  if (activeRoles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🚀</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Roles Selected</h3>
        <p className="text-gray-600">Please go back and select at least one role to continue.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h2 className="text-headline-1 text-neutral-900">Task Selection</h2>
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
          Choose which tasks you'd like to offshore for each role. You can also add custom tasks.
        </p>
      </div>

      {/* Role Task Lists */}
      <div className="space-y-4">
        {activeRoles.map((roleId) => {
          const role = getRoleData(roleId);
          const isExpanded = expandedRoles[roleId];
          const selectedCount = getSelectedTasksCount(roleId);

          return (
            <motion.div
              key={roleId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              {/* Role Header */}
              <button
                onClick={() => toggleRole(roleId)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{role.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{role.title}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedCount > 0 && (
                    <span className="px-2 py-1 bg-neural-blue-100 text-neural-blue-700 text-xs font-medium rounded-full">
                      {selectedCount} Selected Tasks
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Task List */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      {/* Standard Tasks */}
                      <div className="space-y-3">
                        {getPaginatedTasks(roleId).map((task: any) => {
                          const taskKey = `${roleId}-${task.id}`;
                          const isSelected = selectedTasks[taskKey];

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`p-4 border rounded-lg cursor-pointer ${
                                isSelected 
                                  ? 'border-neural-blue-500 bg-neural-blue-50 ring-2 ring-neural-blue-100 shadow-lg' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleTaskToggle(roleId, task.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      isSelected 
                                        ? 'border-neural-blue-500 bg-neural-blue-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                                    </div>
                                    {getComplexityBadge(task.complexity)}
                                  </div>
                                  
                                  <div className="ml-8">
                                    <p className="text-sm text-gray-600">{task.tooltip}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* Pagination Navigation */}
                      {getTotalPages(roleId) > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              Page {(taskPage[roleId] || 0) + 1} of {getTotalPages(roleId)}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({role.tasks?.length || 0} total tasks)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPreviousPage(roleId);
                              }}
                              disabled={(taskPage[roleId] || 0) === 0}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNextPage(roleId);
                              }}
                              disabled={(taskPage[roleId] || 0) >= getTotalPages(roleId) - 1}
                              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Custom Tasks */}
                      {customTasks[roleId] && customTasks[roleId].length > 0 && (
                        <div className="space-y-3">
                          <h5 className="font-medium text-gray-900 border-t pt-4">Custom Tasks</h5>
                          {customTasks[roleId].map((task) => (
                            <div
                              key={task.id}
                              className="p-4 border border-purple-200 bg-purple-50 rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-2 flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                                    {getComplexityBadge(task.estimatedComplexity)}
                                  </div>
                                  <p className="text-sm text-gray-700">{task.description}</p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveCustomTask(roleId, task.id);
                                  }}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Custom Task */}
                      <div className="border-t pt-4">
                        {showAddCustom[roleId] ? (
                          <div className="space-y-4 p-6 bg-gradient-to-r from-neural-blue-25 to-quantum-purple-25 rounded-xl border border-neural-blue-200">
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-neural-blue-700 mb-2">
                                  Task Name
                                </label>
                                <input
                                  type="text"
                                  placeholder="Enter task name..."
                                  value={customTaskInputs[roleId]?.name || ''}
                                  onChange={(e) => updateCustomTaskInput(roleId, 'name', e.target.value)}
                                  className="w-full px-4 py-3 border border-neural-blue-200 rounded-lg focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-neural-blue-700 mb-2">
                                  Task Description
                                </label>
                                <textarea
                                  placeholder="Describe what this task involves..."
                                  value={customTaskInputs[roleId]?.description || ''}
                                  onChange={(e) => updateCustomTaskInput(roleId, 'description', e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-3 border border-neural-blue-200 rounded-lg focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 bg-white resize-none"
                                />
                              </div>
                                                              <div>
                                  <label className="block text-sm font-medium text-neural-blue-700 mb-2">
                                    Task Complexity Level
                                  </label>
                                  <select
                                    value={customTaskInputs[roleId]?.complexity || 'medium'}
                                    onChange={(e) => updateCustomTaskInput(roleId, 'complexity', e.target.value as TaskComplexity)}
                                    className="w-full px-4 py-3 border border-neural-blue-200 rounded-lg focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 bg-white"
                                  >
                                    <option value="low">Easy</option>
                                    <option value="medium">Standard</option>
                                    <option value="high">Complex</option>
                                  </select>
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddCustom(prev => ({ ...prev, [roleId]: false }));
                                  }}
                                  className="px-4 py-2"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddCustomTask(roleId);
                                  }}
                                  disabled={!customTaskInputs[roleId]?.name.trim() || !customTaskInputs[roleId]?.description.trim()}
                                  className="px-6 py-2 bg-cyber-green-500 hover:bg-cyber-green-600 text-white"
                                >
                                  Add Task
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddCustom(prev => ({ ...prev, [roleId]: true }));
                            }}
                            className="w-full p-6 rounded-xl border-2 border-dashed border-neural-blue-300 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 hover:border-neural-blue-400 hover:from-neural-blue-100 hover:to-quantum-purple-100 group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="text-left">
                                <h3 className="text-lg font-bold text-neural-blue-900 mb-1">
                                  Need something specific?
                                </h3>
                                <p className="text-sm text-neural-blue-600">
                                  Add custom tasks tailored to your {role.title} role requirements
                                </p>
                              </div>
                              <Plus className="w-5 h-5 text-neural-blue-500 group-hover:translate-x-1" />
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {getTotalSelectedTasks() > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl bg-neural-blue-50/30 border border-neural-blue-100/50 relative overflow-hidden"
        >
          {/* Moving glow effects */}
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
                <div className="text-sm text-gray-600 font-bold">Total Tasks</div>
                <div className="text-2xl font-bold text-neural-blue-600">{getTotalSelectedTasks()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-bold">Active Roles</div>
                <div className="text-2xl font-bold text-quantum-purple-600">{activeRoles.length}</div>
              </div>
              <div>
              <div className="text-sm text-gray-600 font-bold">Custom Tasks</div>
                <div className="text-2xl font-bold text-cyber-green-600">
                  {Object.values(customTasks).reduce((sum, tasks) => sum + tasks.length, 0)}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 