'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoleId, CustomTask, TaskComplexity } from '@/types';
import { ROLES, ROLE_TASKS } from '@/utils/calculator';
import { Button } from '@/components/ui/Button';
import { Plus, Check, ChevronDown, ChevronUp, Info, X, Sparkles } from 'lucide-react';

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
  const [customTaskInputs, setCustomTaskInputs] = useState<Record<RoleId, { description: string; complexity: TaskComplexity }>>({
    assistantPropertyManager: { description: '', complexity: 'medium' },
    leasingCoordinator: { description: '', complexity: 'medium' },
    marketingSpecialist: { description: '', complexity: 'medium' },
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
    if (!input?.description.trim()) return;

    const newCustomTask: CustomTask = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
      [roleId]: { description: '', complexity: 'medium' }
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

  const updateCustomTaskInput = (roleId: RoleId, field: 'description' | 'complexity', value: string) => {
    setCustomTaskInputs(prev => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Tasks to Offshore</h2>
        <p className="text-gray-600">
          Choose which tasks you'd like to offshore for each role. You can also add custom tasks.
        </p>
        {getTotalSelectedTasks() > 0 && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
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
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
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
                                  ? 'border-indigo-300 bg-indigo-50 ring-2 ring-indigo-100' 
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                              onClick={() => handleTaskToggle(roleId, task.id)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                  <div className="flex items-center space-x-3">
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                      isSelected 
                                        ? 'border-indigo-500 bg-indigo-500' 
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
                          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <input
                              type="text"
                              placeholder="Describe the custom task..."
                              value={customTaskInputs[roleId]?.description || ''}
                              onChange={(e) => updateCustomTaskInput(roleId, 'description', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <div className="flex items-center space-x-3">
                              <select
                                value={customTaskInputs[roleId]?.complexity || 'medium'}
                                onChange={(e) => updateCustomTaskInput(roleId, 'complexity', e.target.value as TaskComplexity)}
                                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="low">Low Complexity</option>
                                <option value="medium">Medium Complexity</option>
                                <option value="high">High Complexity</option>
                              </select>
                              <Button
                                onClick={() => handleAddCustomTask(roleId)}
                                disabled={!customTaskInputs[roleId]?.description.trim()}
                                className="px-4 py-2"
                              >
                                Add Task
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setShowAddCustom(prev => ({ ...prev, [roleId]: false }))}
                                className="px-4 py-2"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            onClick={() => setShowAddCustom(prev => ({ ...prev, [roleId]: true }))}
                            className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Custom Task for {role.title}
                          </Button>
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
          className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200"
        >
          <h3 className="font-semibold text-gray-900 mb-3">Selection Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{getTotalSelectedTasks()}</div>
              <div className="text-sm text-gray-600">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{activeRoles.length}</div>
              <div className="text-sm text-gray-600">Active Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(customTasks).reduce((sum, tasks) => sum + tasks.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Custom Tasks</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 