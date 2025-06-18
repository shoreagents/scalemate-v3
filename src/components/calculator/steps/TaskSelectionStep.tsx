'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleId, CustomTask, TaskComplexity } from '@/types';
import { ROLES, ROLE_TASKS } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { Plus, Check, CheckSquare, ChevronDown, ChevronUp, Info, X, Sparkles } from 'lucide-react';

interface TaskSelectionStepProps {
  selectedRoles: Record<RoleId, boolean>;
  selectedTasks: Record<string, boolean>;
  customTasks: Record<RoleId, readonly CustomTask[]>;
  onChange: (selectedTasks: Record<string, boolean>, customTasks: Record<RoleId, readonly CustomTask[]>) => void;
}

export function TaskSelectionStep({ 
  selectedRoles, 
  selectedTasks, 
  customTasks, 
  onChange 
}: TaskSelectionStepProps) {
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

  const activeRoles = Object.entries(selectedRoles)
    .filter(([_, isSelected]) => isSelected)
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
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: input.name.trim(),
      description: input.description.trim(),
      estimatedComplexity: input.complexity || 'medium',
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

  const updateCustomTaskInput = (roleId: RoleId, field: 'name' | 'description' | 'complexity', value: string) => {
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
    const standardTasks = ROLE_TASKS[roleId].filter(task => 
      selectedTasks[`${roleId}-${task.id}`]
    ).length;
    const customTasksCount = customTasks[roleId]?.length || 0;
    return standardTasks + customTasksCount;
  };

  const getTotalSelectedTasks = () => {
    return activeRoles.reduce((total, roleId) => total + getSelectedTasksCount(roleId), 0);
  };

  const getComplexityColor = (complexity: TaskComplexity) => {
    switch (complexity) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <CheckSquare className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">Select Tasks to Offshore</h2>
        </div>
        <p className="text-body-large text-neutral-600">
          Choose which tasks you'd like to offshore for each role. You can also add custom tasks.
        </p>
        {getTotalSelectedTasks() > 0 && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-neural-blue-50 text-neural-blue-700 rounded-lg">
            <Sparkles className="w-4 h-4 mr-2" />
            {getTotalSelectedTasks()} tasks selected across {activeRoles.length} role{activeRoles.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Role Task Lists */}
      <div className="space-y-4">
        {activeRoles.map((roleId) => {
          const role = ROLES[roleId];
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
                    <p className="text-sm text-gray-600">
                      {selectedCount} of {role.tasks.length + (customTasks[roleId]?.length || 0)} tasks selected
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {selectedCount > 0 && (
                    <span className="px-2 py-1 bg-neural-blue-100 text-neural-blue-700 text-xs font-medium rounded-full">
                      {selectedCount} selected
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
                    transition={{ duration: 0.2 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 space-y-4">
                      {/* Standard Tasks */}
                      <div className="space-y-3">
                        {role.tasks.map((task) => {
                          const taskKey = `${roleId}-${task.id}`;
                          const isSelected = selectedTasks[taskKey];

                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-neural-blue-500 bg-neural-blue-50 ring-2 ring-neural-blue-100 shadow-lg' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleTaskToggle(roleId, task.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      isSelected 
                                        ? 'border-neural-blue-500 bg-neural-blue-500' 
                                        : 'border-gray-300'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-lg">{getCategoryIcon(task.category)}</span>
                                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(task.complexity)}`}>
                                      {task.complexity}
                                    </span>
                                  </div>
                                  
                                  <div className="ml-8 space-y-1">
                                    <p className="text-sm text-gray-600">{task.tooltip}</p>
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {task.aiAdvantage}
                                      </span>
                                      <span>⚡ {task.timeSaved}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

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
                                  <div className="flex items-center space-x-3 mb-2">
                                    <span className="text-lg">✨</span>
                                    <h4 className="font-medium text-gray-900">{task.name}</h4>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplexityColor(task.estimatedComplexity)}`}>
                                      {task.estimatedComplexity}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 ml-8">{task.description}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveCustomTask(roleId, task.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
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
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <label className="text-sm font-medium text-neural-blue-700">
                                  Complexity:
                                </label>
                                <div className="relative">
                                  <select
                                    value={customTaskInputs[roleId]?.complexity || 'medium'}
                                    onChange={(e) => updateCustomTaskInput(roleId, 'complexity', e.target.value as TaskComplexity)}
                                    className="px-3 py-2 pr-8 border border-neural-blue-200 rounded-lg focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 bg-white appearance-none cursor-pointer"
                                  >
                                    <option value="low">Low Complexity</option>
                                    <option value="medium">Medium Complexity</option>
                                    <option value="high">High Complexity</option>
                                  </select>
                                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neural-blue-400 pointer-events-none" />
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="ghost"
                                  onClick={() => setShowAddCustom(prev => ({ ...prev, [roleId]: false }))}
                                  className="px-4 py-2"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleAddCustomTask(roleId)}
                                  disabled={!customTaskInputs[roleId]?.name.trim() || !customTaskInputs[roleId]?.description.trim()}
                                  className="px-6 py-2 bg-cyber-green-500 hover:bg-cyber-green-600 text-white"
                                >
                                  Add Task
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddCustom(prev => ({ ...prev, [roleId]: true }))}
                            className="w-full p-4 border-2 border-dashed border-neural-blue-200 hover:border-neural-blue-300 bg-gradient-to-r from-neural-blue-25 to-quantum-purple-25 hover:from-neural-blue-50 hover:to-quantum-purple-50 rounded-xl transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-cyber-green-100 group-hover:bg-cyber-green-200 flex items-center justify-center transition-colors">
                                <Plus className="w-4 h-4 text-cyber-green-600" />
                              </div>
                              <span className="font-medium text-neural-blue-700 group-hover:text-neural-blue-800">
                                Add Custom Task for {role.title}
                              </span>
                            </div>
                          </motion.button>
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
                <div className="text-2xl font-bold text-neural-blue-600">{getTotalSelectedTasks()}</div>
                <div className="text-sm text-neural-blue-600">Total Tasks</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-quantum-purple-600">{activeRoles.length}</div>
                <div className="text-sm text-neural-blue-600">Active Roles</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-cyber-green-600">
                  {Object.values(customTasks).reduce((sum, tasks) => sum + tasks.length, 0)}
                </div>
                <div className="text-sm text-neural-blue-600">Custom Tasks</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 