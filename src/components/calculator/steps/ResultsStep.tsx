'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationResult, FormData, RoleId } from '@/types';
import { ROLES } from '@/utils/quoteCalculatorData';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useImplementationPlan } from '@/hooks/useImplementationPlan';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Clock, 
  Shield, 
  Target,
  Download,
  Share2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Trophy,
  Globe,
  Star,
  ChevronDown,
  ChevronUp,
  Calculator,
  FileText,
  Lightbulb,
  Brain,
  Loader2,
  RefreshCw,
  ExternalLink,
  ClipboardList,
  TrendingDown,
  MessageSquare,
  Presentation,
  Eye,
  BarChart,
  TrendingUpIcon
} from 'lucide-react';

interface ResultsStepProps {
  result: CalculationResult;
  formData: FormData;
  onRestart: () => void;
}

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  color: string;
  delay?: number;
}

function ResultCard({ icon, title, value, subtitle, color, delay = 0 }: ResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className={`p-6 border-l-4 ${color} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group bg-white h-full`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${color.replace('border-l-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-body-small font-medium text-neural-blue-600 mb-1">{title}</p>
            <p className="text-headline-3 font-bold text-neural-blue-900">{value}</p>
            {subtitle && (
              <p className="text-caption text-neural-blue-700 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface RoleBreakdownProps {
  breakdown: Record<RoleId, any>;
  formData: FormData;
  isExpanded: boolean;
  onToggle: () => void;
}

function RoleBreakdown({ breakdown, formData, isExpanded, onToggle }: RoleBreakdownProps) {
  const breakdownArray = Object.values(breakdown);

  // Helper function to get experience distribution for a role
  const getExperienceDistribution = (roleId: string) => {
    return formData.roleExperienceDistribution?.[roleId] || null;
  };

  // Helper function to get experience level colors
  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'entry': return 'text-green-700 bg-green-100';
      case 'moderate': return 'text-blue-700 bg-blue-100';
      case 'experienced': return 'text-purple-700 bg-purple-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Card className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 lg:p-3 bg-neural-blue-100 rounded-xl shadow-sm group-hover:bg-neural-blue-200 transition-colors duration-300">
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-neural-blue-600" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-neutral-900">Role-by-Role Breakdown</h3>
              <p className="text-sm lg:text-base text-neutral-600 hidden sm:block">Detailed savings analysis for each role</p>
              <p className="text-xs text-neutral-600 sm:hidden">Tap to expand details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center text-sm text-neutral-500">
              <span className="mr-2">{breakdownArray.length} roles</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 lg:w-6 lg:h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
            ) : (
              <ChevronDown className="w-5 h-5 lg:w-6 lg:h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="mt-6 space-y-4">
                {breakdownArray.map((role, index) => {
                  const roleData = ROLES[role.roleId as RoleId];
                  if (!roleData) return null;
                  return (
                    <motion.div
                      key={role.roleId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="p-4 lg:p-5 border border-neural-blue-100 bg-white/60 backdrop-blur-sm rounded-xl hover:border-neural-blue-300 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Mobile-first header */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 lg:p-3 rounded-xl shadow-sm ${roleData.color.replace('bg-', 'bg-').replace('-600', '-100')} group-hover:scale-105 transition-transform duration-300`}>
                            <span className="text-lg lg:text-xl">{roleData.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base lg:text-lg font-bold text-neutral-900 truncate">{role.roleName}</h4>
                            <p className="text-sm text-neutral-600">{role.teamSize} team member{role.teamSize > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right sm:text-left lg:text-right">
                          <p className="text-lg lg:text-xl font-bold text-cyber-green-600">
                            ${role.savings.toLocaleString()}
                          </p>
                          <p className="text-sm text-neutral-600">
                            {role.savingsPercentage.toFixed(1)}% savings/year
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Experience Distribution Display */}
                      {(() => {
                        const experienceDistribution = getExperienceDistribution(role.roleId);
                        return (
                          <div className="space-y-4">
                            {/* Enhanced Cost Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <p className="text-red-700 font-medium text-xs">Current Cost</p>
                          </div>
                          <p className="font-bold text-red-800 text-base">${role.australianCost.toLocaleString()}</p>
                          <p className="text-xs text-red-600 mt-1">Australian workforce</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-cyber-green-50 to-cyber-green-100 border border-cyber-green-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-cyber-green-500 rounded-full"></div>
                            <p className="text-cyber-green-700 font-medium text-xs">Offshore Cost</p>
                          </div>
                          <p className="font-bold text-cyber-green-800 text-base">${role.philippineCost.toLocaleString()}</p>
                          <p className="text-xs text-cyber-green-600 mt-1">Philippine workforce</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-neural-blue-50 to-neural-blue-100 border border-neural-blue-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-neural-blue-500 rounded-full"></div>
                            <p className="text-neural-blue-700 font-medium text-xs">Core Tasks</p>
                          </div>
                          <p className="font-bold text-neural-blue-800 text-base">{role.selectedTasksCount}</p>
                          <p className="text-xs text-neural-blue-600 mt-1">Standard tasks</p>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <p className="text-amber-700 font-medium text-xs">Implementation</p>
                          </div>
                          <p className="font-bold text-amber-800 text-base">{role.estimatedImplementationTime}</p>
                          <p className="text-xs text-amber-600 mt-1">days to deploy</p>
                        </div>
                      </div>

                            {/* Enhanced Multi-Level Experience Breakdown */}
                            {experienceDistribution && experienceDistribution.totalAssigned > 0 && (
                              <div className="p-4 bg-gradient-to-r from-neural-blue-50/30 to-quantum-purple-50/30 rounded-xl border border-neural-blue-100">
                                <h5 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  Team Composition ({experienceDistribution.totalAssigned} members)
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  {experienceDistribution.entry > 0 && (
                                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 sm:mx-auto rounded-xl ${getExperienceLevelColor('entry')} flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0`}>
                                        <span className="text-base sm:text-lg font-bold">{experienceDistribution.entry}</span>
                                      </div>
                                      <div className="flex-1 sm:flex-none">
                                        <div className="text-sm sm:text-xs font-medium text-neutral-700">Entry Level</div>
                                        <div className="text-xs text-neutral-500">Fresh talent</div>
                                      </div>
                                    </div>
                                  )}
                                  {experienceDistribution.moderate > 0 && (
                                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 sm:mx-auto rounded-xl ${getExperienceLevelColor('moderate')} flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0`}>
                                        <span className="text-base sm:text-lg font-bold">{experienceDistribution.moderate}</span>
                                      </div>
                                      <div className="flex-1 sm:flex-none">
                                        <div className="text-sm sm:text-xs font-medium text-neutral-700">Mid-Level</div>
                                        <div className="text-xs text-neutral-500">Experienced</div>
                                      </div>
                                    </div>
                                  )}
                                  {experienceDistribution.experienced > 0 && (
                                    <div className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-0">
                                      <div className={`w-10 h-10 sm:w-12 sm:h-12 sm:mx-auto rounded-xl ${getExperienceLevelColor('experienced')} flex items-center justify-center mb-0 sm:mb-2 flex-shrink-0`}>
                                        <span className="text-base sm:text-lg font-bold">{experienceDistribution.experienced}</span>
                                      </div>
                                      <div className="flex-1 sm:flex-none">
                                        <div className="text-sm sm:text-xs font-medium text-neutral-700">Senior Level</div>
                                        <div className="text-xs text-neutral-500">Leadership</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Experience Distribution Bar */}
                                <div className="mt-3">
                                  <div className="flex rounded-full overflow-hidden h-3 bg-neutral-200">
                                    {experienceDistribution.entry > 0 && (
                                      <div 
                                        className="bg-green-500 transition-all duration-500"
                                        style={{ width: `${(experienceDistribution.entry / experienceDistribution.totalAssigned) * 100}%` }}
                                        title={`${experienceDistribution.entry} Entry Level (${Math.round((experienceDistribution.entry / experienceDistribution.totalAssigned) * 100)}%)`}
                                      />
                                    )}
                                    {experienceDistribution.moderate > 0 && (
                                      <div 
                                        className="bg-blue-500 transition-all duration-500"
                                        style={{ width: `${(experienceDistribution.moderate / experienceDistribution.totalAssigned) * 100}%` }}
                                        title={`${experienceDistribution.moderate} Mid-Level (${Math.round((experienceDistribution.moderate / experienceDistribution.totalAssigned) * 100)}%)`}
                                      />
                                    )}
                                    {experienceDistribution.experienced > 0 && (
                                      <div 
                                        className="bg-purple-500 transition-all duration-500"
                                        style={{ width: `${(experienceDistribution.experienced / experienceDistribution.totalAssigned) * 100}%` }}
                                        title={`${experienceDistribution.experienced} Senior Level (${Math.round((experienceDistribution.experienced / experienceDistribution.totalAssigned) * 100)}%)`}
                                      />
                                    )}
                                  </div>
                                  <div className="flex justify-between text-xs text-neutral-500 mt-1">
                                    <span>Entry</span>
                                    <span>Mid</span>
                                    <span>Senior</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}

                      {role.riskFactors && role.riskFactors.length > 0 && (
                        <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span className="text-body-small font-medium text-amber-800">Risk Considerations</span>
                          </div>
                          <ul className="text-caption text-amber-700 space-y-2">
                            {role.riskFactors.map((factor: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 flex-shrink-0"></span>
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export function ResultsStep({ result, formData, onRestart }: ResultsStepProps) {
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(false);
  const [showImplementationPlan, setShowImplementationPlan] = useState(false);
  const [showAIPlan, setShowAIPlan] = useState(false);
  type TabType = 'overview' | 'implementation' | 'pitch';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [savingsView, setSavingsView] = useState<'annual' | 'monthly'>('annual');

  // Fetch Claude-generated implementation plan
  const { implementationPlan, isLoading: isPlanLoading, error: planError, refetch } = useImplementationPlan(
    formData,
    result,
    true // Auto-fetch on component mount
  );

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (percentage: number) => `${percentage.toFixed(1)}%`;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (level: 'Low' | 'Medium' | 'High') => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl border-2 border-neural-blue-500 bg-neural-blue-500 flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-display-2 font-display font-bold text-neural-blue-900">
            Your Offshore Scaling Results
          </h2>
        </div>
        <p className="text-body-large text-neural-blue-700 max-w-3xl mx-auto">
          Here's your comprehensive analysis of potential savings and implementation strategy
        </p>
      </motion.div>

      {/* Enhanced Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="flex justify-center"
      >
        {/* Desktop Tab Navigation */}
        <div className="hidden md:block bg-white/80 backdrop-blur-sm border border-neural-blue-200 rounded-2xl p-1 shadow-lg">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden lg:inline">Overview & Analysis</span>
              <span className="lg:hidden">Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('implementation')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'implementation'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span className="hidden lg:inline">Implementation Plan</span>
              <span className="lg:hidden">Plan</span>
            </button>
            
            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg transform scale-105'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden lg:inline">Pitch Deck</span>
              <span className="lg:hidden">Pitch</span>
            </button>
          </div>
        </div>

        {/* Mobile Tab Buttons */}
        <div className="md:hidden w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-sm border border-neural-blue-200 rounded-2xl p-1 shadow-lg">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg'
                    : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Overview
              </button>
              
              <button
                onClick={() => setActiveTab('implementation')}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeTab === 'implementation'
                    ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg'
                    : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                Plan
              </button>
              
              <button
                onClick={() => setActiveTab('pitch')}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-medium transition-all duration-300 ${
                  activeTab === 'pitch'
                    ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-lg'
                    : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
                }`}
              >
                <Presentation className="w-4 h-4" />
                Pitch
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Comprehensive Key Metrics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="p-6 lg:p-8 bg-gradient-to-br from-white via-neural-blue-50/30 to-cyber-green-50/30 border-2 border-neural-blue-200 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-xl bg-neural-blue-100 shadow-sm">
              <BarChart3 className="w-6 h-6 text-neural-blue-600" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-bold text-neural-blue-900">Key Performance Metrics</h3>
              <p className="text-sm lg:text-base text-neural-blue-700">
                Comprehensive overview of financial benefits and timeline
              </p>
            </div>
          </div>

          {/* Main Metrics Grid - Top 3 Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
             {/* Savings with Toggle */}
             <div className="bg-gradient-to-br from-cyber-green-50 to-cyber-green-100 rounded-2xl p-6 border-l-4 border-l-cyber-green-500 hover:shadow-lg transition-all duration-300 group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 rounded-xl bg-cyber-green-200 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                   <DollarSign className="w-6 h-6 text-cyber-green-700" />
                 </div>
                 <div className="flex-1">
                   <h4 className="text-sm font-bold text-cyber-green-800">
                     {savingsView === 'annual' ? 'Annual Savings' : 'Monthly Savings'}
                   </h4>
                   <p className="text-xs text-cyber-green-600">
                     {savingsView === 'annual' ? 'Total yearly benefit' : 'Recurring monthly benefit'}
                   </p>
                 </div>
               </div>
               
               {/* Toggle Switch */}
               <div className="flex justify-center mb-4">
                 <div className="relative flex bg-gradient-to-r from-cyber-green-200 via-cyber-green-300 to-cyber-green-200 rounded-xl p-1 shadow-lg">
                   <button
                     onClick={() => setSavingsView('annual')}
                     className={`relative px-4 py-1 text-sm font-bold rounded-lg transition-all duration-300 ${
                       savingsView === 'annual'
                         ? 'bg-gradient-to-br from-white via-cyber-green-50 to-white text-cyber-green-800 shadow-lg transform translate-y-[-1px]'
                         : 'text-cyber-green-700 hover:text-cyber-green-800 hover:bg-white/30'
                     }`}
                   >
                     Annual
                   </button>
                   <button
                     onClick={() => setSavingsView('monthly')}
                     className={`relative px-4 py-1 text-sm font-bold rounded-lg transition-all duration-300 ${
                       savingsView === 'monthly'
                         ? 'bg-gradient-to-br from-white via-cyber-green-50 to-white text-cyber-green-800 shadow-lg transform translate-y-[-1px]'
                         : 'text-cyber-green-700 hover:text-cyber-green-800 hover:bg-white/30'
                     }`}
                   >
                     Monthly
                   </button>
                 </div>
               </div>

               <div className="space-y-2">
                 <p className="text-3xl font-bold text-cyber-green-800 text-center">
                   {savingsView === 'annual' 
                     ? formatCurrency(result.totalSavings)
                     : formatCurrency(Math.round(result.totalSavings / 12))
                   }
                 </p>
                 <div className="flex items-center justify-center gap-2">
                   <div className="flex items-center gap-1">
                     <TrendingDown className="w-4 h-4 text-cyber-green-600" />
                     <span className="text-sm font-medium text-cyber-green-700">{formatPercentage(result.averageSavingsPercentage)}</span>
                   </div>
                   <span className="text-xs text-cyber-green-600">cost reduction</span>
                 </div>
                 <div className="pt-2 border-t border-cyber-green-200">
                   {savingsView === 'annual' ? (
                     <>
                       <div className="flex justify-between text-xs">
                         <span className="text-cyber-green-600">Quarterly:</span>
                         <span className="font-medium text-cyber-green-700">{formatCurrency(Math.round(result.totalSavings / 4))}</span>
                       </div>
                       <div className="flex justify-between text-xs mt-1">
                         <span className="text-cyber-green-600">Semi-Annual:</span>
                         <span className="font-medium text-cyber-green-700">{formatCurrency(Math.round(result.totalSavings / 2))}</span>
                       </div>
                     </>
                   ) : (
                     <>
                       <div className="flex justify-between text-xs">
                         <span className="text-cyber-green-600">Weekly:</span>
                         <span className="font-medium text-cyber-green-700">{formatCurrency(Math.round(result.totalSavings / 52))}</span>
                       </div>
                       <div className="flex justify-between text-xs mt-1">
                         <span className="text-cyber-green-600">Daily:</span>
                         <span className="font-medium text-cyber-green-700">{formatCurrency(Math.round(result.totalSavings / 365))}</span>
                       </div>
                     </>
                   )}
                 </div>
               </div>
             </div>

             {/* Team Structure */}
             <div className="bg-gradient-to-br from-neural-blue-50 to-neural-blue-100 rounded-2xl p-6 border-l-4 border-l-neural-blue-500 hover:shadow-lg transition-all duration-300 group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 rounded-xl bg-neural-blue-200 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                   <Users className="w-6 h-6 text-neural-blue-700" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-neural-blue-800">Team Scaling</h4>
                   <p className="text-xs text-neural-blue-600">Offshore workforce size</p>
                 </div>
               </div>
                                <div className="space-y-2">
                   <p className="text-lg text-neural-blue-800 text-center">
                     <span className="font-bold text-neural-blue-900">{result.totalTeamSize}</span> team members across <span className="font-bold text-neural-blue-900">{Object.keys(result.breakdown).length}</span> different roles
                   </p>
                 <div className="pt-2 border-t border-neural-blue-200">
                   {/* Table Headers */}
                   <div className="grid grid-cols-[1fr,auto] gap-4 mb-2 pb-1 border-b border-neural-blue-200">
                     <div className="text-xs font-bold text-neural-blue-800 uppercase tracking-wide">ROLE</div>
                     <div className="text-xs font-bold text-neural-blue-800 uppercase tracking-wide text-right">MEMBERS</div>
                   </div>
                   {/* Table Rows */}
                   <div className="space-y-1">
                     {Object.values(result.breakdown).map((role: any, index: number) => (
                       <div key={index} className="grid grid-cols-[1fr,auto] gap-4 text-xs">
                         <span className="text-neural-blue-600">{role.roleName}</span>
                         <span className="font-medium text-neural-blue-700 text-right">{role.teamSize}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>



             {/* Implementation Timeline */}
             <div className="bg-gradient-to-br from-matrix-orange-50 to-matrix-orange-100 rounded-2xl p-6 border-l-4 border-l-matrix-orange-500 hover:shadow-lg transition-all duration-300 group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 rounded-xl bg-matrix-orange-200 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                   <Clock className="w-6 h-6 text-matrix-orange-700" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-matrix-orange-800">Implementation Timeline</h4>
                   <p className="text-xs text-matrix-orange-600">Start to fully operational team</p>
                 </div>
               </div>
               
               {/* Total Time Display */}
               <div className="text-center mb-4">
                 <p className="text-3xl font-bold text-matrix-orange-800">{result.implementationTimeline.fullImplementation}</p>
                 <div className="flex items-center justify-center gap-2">
                   <Zap className="w-4 h-4 text-matrix-orange-600" />
                   <span className="text-sm font-medium text-matrix-orange-700">weeks total</span>
                 </div>
               </div>

               {/* Phase Timeline */}
               <div className="space-y-3">
                 {/* Phase 1: Planning */}
                 <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                   <div className="w-6 h-6 rounded-full bg-matrix-orange-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-matrix-orange-800">Setup & Planning</span>
                       <span className="text-xs text-matrix-orange-700">{result.implementationTimeline.planning} weeks</span>
                     </div>
                     <p className="text-xs text-matrix-orange-600">Process documentation & role definition</p>
                   </div>
                 </div>

                 {/* Phase 2: Hiring */}
                 <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                   <div className="w-6 h-6 rounded-full bg-matrix-orange-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-matrix-orange-800">Recruitment</span>
                       <span className="text-xs text-matrix-orange-700">{result.implementationTimeline.hiring} weeks</span>
                     </div>
                     <p className="text-xs text-matrix-orange-600">Interview & hire your team members</p>
                   </div>
                 </div>

                 {/* Phase 3: Training */}
                 <div className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                   <div className="w-6 h-6 rounded-full bg-matrix-orange-600 text-white text-xs font-bold flex items-center justify-center">3</div>
                   <div className="flex-1">
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-matrix-orange-800">Training & Integration</span>
                       <span className="text-xs text-matrix-orange-700">{result.implementationTimeline.training} weeks</span>
                     </div>
                     <p className="text-xs text-matrix-orange-600">Onboarding & skills development</p>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Investment Returns - Full Width Section */}
           <div className="mb-8">
             <div className="bg-gradient-to-br from-quantum-purple-50 to-quantum-purple-100 rounded-2xl p-6 border-l-4 border-l-quantum-purple-500 hover:shadow-lg transition-all duration-300 group">
               <div className="flex items-center gap-3 mb-4">
                 <div className="p-3 rounded-xl bg-quantum-purple-200 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                   <TrendingUp className="w-6 h-6 text-quantum-purple-700" />
                 </div>
                 <div>
                   <h4 className="text-sm font-bold text-quantum-purple-800">Investment Returns</h4>
                   <p className="text-xs text-quantum-purple-600">Your offshore investment performance</p>
                 </div>
               </div>
               <div className="space-y-4">
                 {/* Investment Flow */}
                 <div className="bg-white/60 rounded-xl p-4 border border-quantum-purple-200">
                   <div className="grid grid-cols-3 gap-4 items-center">
                     {/* You Invest */}
                     <div className="text-center">
                       <div className="text-xs text-quantum-purple-600 mb-1">You Invest</div>
                       <div className="text-lg font-bold text-quantum-purple-800">
                         {formatCurrency(Math.round(result.totalPhilippineCost * 1.2))}
                       </div>
                       <div className="text-xs text-quantum-purple-600 mt-1">Initial cost</div>
                     </div>
                     
                     {/* Arrow */}
                     <div className="text-center">
                       <div className="flex items-center justify-center">
                         <div className="text-2xl text-quantum-purple-500">→</div>
                       </div>
                       <div className="text-xs text-quantum-purple-600 mt-1">Generates</div>
                     </div>
                     
                     {/* You Get Back */}
                     <div className="text-center">
                       <div className="text-xs text-quantum-purple-600 mb-1">You Save</div>
                       <div className="text-lg font-bold text-green-700">
                         {formatCurrency(result.totalSavings)}
                       </div>
                       <div className="text-xs text-quantum-purple-600 mt-1">Annual savings</div>
                     </div>
                   </div>
                 </div>
                 
                 {/* ROI Summary & Key Details - Single Row */}
                 <div className="grid grid-cols-3 gap-4 text-center">
                   {/* ROI Summary */}
                   <div className="bg-white/60 rounded-xl p-3 border border-quantum-purple-200">
                     <div className="text-xs text-quantum-purple-600 mb-1">Your Return on Investment</div>
                     <div className="text-xl font-bold text-quantum-purple-800">
                       {result.estimatedROI.toFixed(0)}% Annual Return
                     </div>
                     <div className="text-xs text-quantum-purple-600 mt-1">
                       Every $1 returns ${(result.estimatedROI / 100).toFixed(2)}
                     </div>
                   </div>
                   
                   {/* Payback Time */}
                   <div className="bg-white/60 rounded-xl p-3 border border-quantum-purple-200">
                     <div className="text-xs text-quantum-purple-600 mb-1">Payback Time</div>
                     <div className="text-xl font-bold text-quantum-purple-800">5 Months</div>
                     <div className="text-xs text-quantum-purple-600 mt-1">Investment recovery</div>
                   </div>
                   
                   {/* Investment Grade */}
                   <div className="bg-white/60 rounded-xl p-3 border border-quantum-purple-200">
                     <div className="text-xs text-quantum-purple-600 mb-1">Investment Grade</div>
                     <div className="text-xl font-bold text-quantum-purple-800">
                       {(() => {
                         const roi = result.estimatedROI / 100;
                         if (roi >= 5.0) return 'Exceptional';
                         if (roi >= 3.0) return 'Excellent';
                         if (roi >= 2.0) return 'Good';
                         if (roi >= 1.5) return 'Fair';
                         if (roi >= 1.0) return 'Modest';
                         return 'Poor';
                       })()}
                     </div>
                     <div className="text-xs text-quantum-purple-600 mt-1">Quality rating</div>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Explanatory Text */}
           <div className="mt-8 p-6 bg-white/80 backdrop-blur-sm rounded-xl border border-neural-blue-200">
             <p className="text-neural-blue-800 leading-relaxed">
               Your offshore scaling strategy shows promising results across all key metrics. With an annual savings of {formatCurrency(result.totalSavings)} ({formatPercentage(result.averageSavingsPercentage)} cost reduction), 
               the plan demonstrates strong financial viability. The implementation timeline of {result.implementationTimeline.fullImplementation} weeks ensures a measured approach to building your team of {result.totalTeamSize} members across {Object.keys(result.breakdown).length} specialized roles. 
               The exceptional ROI of {result.estimatedROI.toFixed(1)}x, combined with a rapid break-even point in Week {Math.ceil(result.implementationTimeline.fullImplementation / 2)}, indicates a highly effective scaling strategy.
             </p>
           </div>

        </Card>
      </motion.div>

      {/* Enhanced Team Composition Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="p-6 bg-gradient-to-br from-neural-blue-50/50 to-quantum-purple-50/50 border border-neural-blue-100 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-headline-3 font-bold text-neural-blue-900 mb-2">
              Complete Team Overview
            </h3>
            <p className="text-body-small text-neural-blue-700">
              Your optimized offshore team configuration and experience distribution
            </p>
          </div>

          {(() => {
            // Calculate total experience distribution across all roles
            let totalEntry = 0, totalModerate = 0, totalExperienced = 0;
            Object.keys(result.breakdown).forEach(roleId => {
              const distribution = formData.roleExperienceDistribution?.[roleId];
              if (distribution) {
                totalEntry += distribution.entry;
                totalModerate += distribution.moderate;
                totalExperienced += distribution.experienced;
              }
            });

            const totalMembers = totalEntry + totalModerate + totalExperienced;

            return (
              <div className="space-y-6">
                {/* Overall Experience Distribution */}
                {totalMembers > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-3 shadow-sm">
                        <div>
                          <div className="text-2xl font-bold">{totalEntry}</div>
                          <div className="text-xs">Entry</div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-green-700 mb-1">Entry Level</h4>
                      <p className="text-sm text-neutral-600">Fresh talent, cost-effective</p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        {Math.round((totalEntry / totalMembers) * 100)}% of team
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3 shadow-sm">
                        <div>
                          <div className="text-2xl font-bold">{totalModerate}</div>
                          <div className="text-xs">Mid</div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-blue-700 mb-1">Mid-Level</h4>
                      <p className="text-sm text-neutral-600">Experienced professionals</p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        {Math.round((totalModerate / totalMembers) * 100)}% of team
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-20 h-20 mx-auto rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3 shadow-sm">
                        <div>
                          <div className="text-2xl font-bold">{totalExperienced}</div>
                          <div className="text-xs">Senior</div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-purple-700 mb-1">Senior Level</h4>
                      <p className="text-sm text-neutral-600">Leadership & expertise</p>
                      <p className="text-xs text-purple-600 font-medium mt-1">
                        {Math.round((totalExperienced / totalMembers) * 100)}% of team
                      </p>
                    </div>
                  </div>
                )}

                {/* Visual Distribution Bar */}
                {totalMembers > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-700">Team Distribution</span>
                      <span className="text-neutral-600">{totalMembers} total members</span>
                    </div>
                    <div className="flex rounded-full overflow-hidden h-4 bg-neutral-200 shadow-inner">
                      {totalEntry > 0 && (
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 transition-all duration-700"
                          style={{ width: `${(totalEntry / totalMembers) * 100}%` }}
                          title={`${totalEntry} Entry Level members (${Math.round((totalEntry / totalMembers) * 100)}%)`}
                        />
                      )}
                      {totalModerate > 0 && (
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                          style={{ width: `${(totalModerate / totalMembers) * 100}%` }}
                          title={`${totalModerate} Mid-Level members (${Math.round((totalModerate / totalMembers) * 100)}%)`}
                        />
                      )}
                      {totalExperienced > 0 && (
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-700"
                          style={{ width: `${(totalExperienced / totalMembers) * 100}%` }}
                          title={`${totalExperienced} Senior Level members (${Math.round((totalExperienced / totalMembers) * 100)}%)`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      </motion.div>

      {/* Enhanced Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 lg:p-3 bg-neural-blue-100 rounded-xl shadow-sm">
              <PieChart className="w-5 h-5 lg:w-6 lg:h-6 text-neural-blue-600" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-neutral-900">Cost Comparison</h3>
              <p className="text-sm lg:text-base text-neutral-600">Australian vs Philippine workforce costs</p>
            </div>
          </div>

          {/* Mobile-first layout */}
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            {/* Current Cost */}
            <div className="relative">
              <div className="p-4 lg:p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-red-200 rounded-full">
                    <Globe className="w-6 h-6 lg:w-8 lg:h-8 text-red-600" />
                  </div>
                </div>
                <p className="text-xs lg:text-sm font-medium text-red-800 mb-2">Current Australian Cost</p>
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-red-600 mb-1">
                  {formatCurrency(result.totalAustralianCost)}
                </p>
                <p className="text-xs lg:text-sm text-red-600">per year</p>
              </div>
            </div>

            {/* Savings Arrow - Hidden on mobile, shown on desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-8 h-8 lg:w-10 lg:h-10 text-neural-blue-400 mx-auto mb-3" />
                </motion.div>
                <div className="px-4 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-cyber-green-100 to-cyber-green-200 text-cyber-green-800 rounded-full shadow-md">
                  <p className="text-sm lg:text-base font-bold">Save {formatPercentage(result.averageSavingsPercentage)}</p>
                </div>
              </div>
            </div>

            {/* Mobile Savings Badge */}
            <div className="lg:hidden flex justify-center">
              <div className="px-6 py-3 bg-gradient-to-r from-cyber-green-100 to-cyber-green-200 text-cyber-green-800 rounded-full shadow-md">
                <p className="text-base font-bold flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Save {formatPercentage(result.averageSavingsPercentage)}
                </p>
              </div>
            </div>

            {/* Offshore Cost */}
            <div className="relative">
              <div className="p-4 lg:p-6 bg-gradient-to-br from-cyber-green-50 to-cyber-green-100 border border-cyber-green-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-2 bg-cyber-green-200 rounded-full">
                    <Globe className="w-6 h-6 lg:w-8 lg:h-8 text-cyber-green-600" />
                  </div>
                </div>
                <p className="text-xs lg:text-sm font-medium text-cyber-green-800 mb-2">Offshore Philippine Cost</p>
                <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-cyber-green-600 mb-1">
                  {formatCurrency(result.totalPhilippineCost)}
                </p>
                <p className="text-xs lg:text-sm text-cyber-green-600">per year</p>
              </div>
              
              {/* Mobile savings badge overlay */}
              <div className="lg:hidden absolute -top-2 -right-2">
                <div className="w-8 h-8 bg-cyber-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Total Savings Summary */}
          <div className="mt-6 p-4 bg-gradient-to-r from-cyber-green-50 to-emerald-50 border border-cyber-green-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyber-green-100 rounded-lg">
                  <Star className="w-5 h-5 text-cyber-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-cyber-green-800">Your Annual Savings</p>
                  <p className="text-xs text-cyber-green-600">By switching to offshore talent</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl lg:text-2xl font-bold text-cyber-green-700">
                  {formatCurrency(result.totalSavings)}
                </p>
                <p className="text-xs lg:text-sm text-cyber-green-600">
                  {formatPercentage(result.averageSavingsPercentage)} reduction
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Role Breakdown */}
      <RoleBreakdown 
        breakdown={result.breakdown}
              formData={formData}
        isExpanded={isBreakdownExpanded}
        onToggle={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
      />

      {/* AI-Generated Implementation Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65, duration: 0.5 }}
      >
        <Card className="p-6 border-2 border-neural-blue-200 bg-gradient-to-br from-neural-blue-50 to-quantum-purple-50 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setShowAIPlan(!showAIPlan)}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm group-hover:bg-neural-blue-200 transition-colors duration-300">
                <Brain className="w-6 h-6 text-neural-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-headline-3 font-bold text-neutral-900">AI-Generated Implementation Plan</h3>
                  <span className="px-3 py-1 text-caption font-medium bg-gradient-to-r from-neural-blue-100 to-quantum-purple-100 text-neural-blue-700 rounded-full shadow-sm">
                    Powered by Claude AI
                  </span>
                </div>
                <p className="text-body-small text-neutral-600">
                  {isPlanLoading ? 'Generating customized plan...' : 'Detailed roadmap tailored to your specific requirements'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isPlanLoading && (
                <Loader2 className="w-5 h-5 text-neural-blue-600 animate-spin" />
              )}
              {planError && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    refetch();
                  }}
                  className="text-neutral-500 hover:text-neural-blue-600 transition-colors duration-300"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              )}
              {showAIPlan ? (
                <ChevronUp className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
              ) : (
                <ChevronDown className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {showAIPlan && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6">
                  {isPlanLoading && (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 text-neural-blue-600 animate-spin mx-auto mb-4" />
                        <p className="text-body text-neutral-600">Generating your personalized implementation plan...</p>
                        <p className="text-body-small text-neutral-500 mt-2">This may take a few moments</p>
                      </div>
                    </div>
                  )}

                  {planError && (
                    <div className="text-center py-12">
                      <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                      <p className="text-body text-neutral-600 mb-4">Unable to generate implementation plan</p>
                      <Button variant="outline" onClick={refetch} className="flex items-center gap-2 border-neural-blue-200 text-neural-blue-600 hover:bg-neural-blue-50">
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                      </Button>
                    </div>
                  )}

                  {implementationPlan && (
                    <div className="space-y-6">
                      {/* Executive Summary */}
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-neural-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="text-body-large font-bold text-neutral-900 mb-4 flex items-center gap-2">
                          <FileText className="w-6 h-6 text-neural-blue-600" />
                          Executive Summary
                        </h4>
                        <p className="text-body text-neutral-700 leading-relaxed">{implementationPlan.executiveSummary}</p>
                      </div>

                      {/* Detailed Plan */}
                      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-neural-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <h4 className="text-body-large font-bold text-neutral-900 mb-6 flex items-center gap-2">
                          <ClipboardList className="w-6 h-6 text-neural-blue-600" />
                          Implementation Phases
                        </h4>
                        <div className="space-y-6">
                          {implementationPlan.detailedPlan.map((phase, index) => (
                            <div key={index} className="border border-neural-blue-100 bg-gradient-to-br from-white to-neural-blue-50/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                              <div className="flex items-center justify-between mb-4">
                                <h5 className="text-body-large font-bold text-neutral-900">{phase.phase}</h5>
                                <span className="text-body-small font-medium text-neural-blue-700 bg-neural-blue-100 px-3 py-1 rounded-full shadow-sm">
                                  {phase.duration}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-body-small">
                                <div className="bg-white/70 p-4 rounded-lg">
                                  <h6 className="text-body font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-cyber-green-600" />
                                    Objectives
                                  </h6>
                                  <ul className="space-y-2">
                                    {phase.objectives.map((obj, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-neutral-600">
                                        <span className="w-1 h-1 bg-cyber-green-600 rounded-full mt-2 flex-shrink-0"></span>
                                        {obj}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-white/70 p-4 rounded-lg">
                                  <h6 className="text-body font-bold text-neutral-800 mb-3 flex items-center gap-2">
                                    <ArrowRight className="w-4 h-4 text-neural-blue-600" />
                                    Key Activities
                                  </h6>
                                  <ul className="space-y-2">
                                    {phase.keyActivities.map((activity, idx) => (
                                      <li key={idx} className="flex items-start gap-2 text-neutral-600">
                                        <span className="w-1 h-1 bg-neural-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                                        {activity}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      {implementationPlan.riskAssessment && implementationPlan.riskAssessment.length > 0 && (
                        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-neural-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <h4 className="text-body-large font-bold text-neutral-900 mb-6 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-neural-blue-600" />
                            Risk Assessment & Mitigation
                          </h4>
                          <div className="space-y-4">
                            {implementationPlan.riskAssessment.map((risk, index) => (
                              <div key={index} className="border border-neural-blue-100 bg-gradient-to-br from-white to-neural-blue-50/20 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="flex items-start justify-between mb-3">
                                  <h5 className="text-body font-bold text-neutral-900">{risk.risk}</h5>
                                  <div className="flex gap-2">
                                    <span className={`text-caption font-medium px-3 py-1 rounded-full ${getRiskColor(risk.impact)}`}>
                                      {risk.impact} Impact
                                    </span>
                                    <span className={`text-caption font-medium px-3 py-1 rounded-full ${getRiskColor(risk.probability)}`}>
                                      {risk.probability} Probability
                                    </span>
                                  </div>
                                </div>
                                <p className="text-body-small text-neutral-600">
                                  <strong className="text-neural-blue-700">Mitigation:</strong> {risk.mitigation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Claude AI Guide */}
                      {implementationPlan.claudeAIGuide && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-600" />
                            Complete Claude AI Setup Guide for Offshore Teams
                          </h4>
                          
                          {/* Setup Steps */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-800 mb-3">🚀 Getting Started with Claude AI</h5>
                            <div className="space-y-4">
                              {implementationPlan.claudeAIGuide.setupSteps.map((step, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h6 className="font-semibold text-gray-900 mb-2">{step.step}</h6>
                                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                                         <div>
                                       <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Instructions</div>
                                       <ul className="space-y-1">
                                         {step.instructions.map((instruction, idx) => (
                                           <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                             <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                             {instruction}
                                           </li>
                                         ))}
                                       </ul>
                                     </div>
                                     <div>
                                       <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Pro Tips</div>
                                      <ul className="space-y-1">
                                        {step.tips.map((tip, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                            {tip}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Job Description Templates */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-800 mb-3">📋 AI-Powered Job Description Templates</h5>
                            <div className="space-y-4">
                              {implementationPlan.claudeAIGuide.jobDescriptionTemplates.map((template, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h6 className="font-semibold text-gray-900 mb-2">{template.role}</h6>
                                  <p className="text-sm text-gray-600 mb-3">{template.template}</p>
                                                                     <div className="bg-gray-50 p-3 rounded border">
                                     <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Claude Prompt Template</div>
                                     <p className="text-xs text-gray-600 font-mono">{template.claudePrompt}</p>
                                   </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Training Processes */}
                          <div className="mb-6">
                            <h5 className="font-medium text-gray-800 mb-3">🎓 AI-Enhanced Training Programs</h5>
                            <div className="space-y-4">
                              {implementationPlan.claudeAIGuide.trainingProcesses.map((process, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h6 className="font-semibold text-gray-900 mb-2">{process.process}</h6>
                                  <p className="text-sm text-gray-600 mb-3">{process.description}</p>
                                                                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                     <div>
                                       <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Claude Prompts</div>
                                       <div className="space-y-2">
                                         {process.claudePrompts.map((prompt, idx) => (
                                           <div key={idx} className="bg-gray-50 p-2 rounded border">
                                             <p className="text-xs text-gray-600">{prompt}</p>
                                           </div>
                                         ))}
                                       </div>
                                     </div>
                                     <div>
                                       <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Expected Outcomes</div>
                                      <ul className="space-y-1">
                                        {process.expectedOutcomes.map((outcome, idx) => (
                                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                            <Target className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                            {outcome}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Workflow Automation */}
                          <div>
                            <h5 className="font-medium text-gray-800 mb-3">⚡ Claude AI Workflow Automation</h5>
                            <div className="space-y-4">
                              {implementationPlan.claudeAIGuide.workflowAutomation.map((workflow, index) => (
                                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                                  <h6 className="font-semibold text-gray-900 mb-2">{workflow.workflow}</h6>
                                  <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
                                                                     <div className="mb-3">
                                     <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Implementation Guide</div>
                                     <div className="bg-gray-50 p-3 rounded border">
                                       <p className="text-xs text-gray-600">{workflow.claudeIntegration}</p>
                                     </div>
                                   </div>
                                   <div>
                                     <div className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2 block">Key Benefits</div>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                      {workflow.benefits.map((benefit, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                          <Zap className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                          {benefit}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Next Steps */}
                      <div className="bg-white p-6 rounded-lg border border-indigo-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Target className="w-5 h-5 text-indigo-600" />
                          Immediate Next Steps
                        </h4>
                        <div className="space-y-2">
                          {implementationPlan.nextSteps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full flex items-center justify-center">
                                {index + 1}
                              </span>
                              <p className="text-gray-700">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-headline-3 font-bold text-neutral-900">Risk Assessment</h3>
              <p className="text-body-small text-neutral-600">Implementation considerations and mitigation strategies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRiskLevelColor(result.riskAssessment.level)}`}>
                <Activity className="w-4 h-4" />
                {result.riskAssessment.level.charAt(0).toUpperCase() + result.riskAssessment.level.slice(1)} Risk
              </div>
              
              <h4 className="text-body-large font-bold text-neutral-900 mb-4">Risk Factors</h4>
              <ul className="space-y-3">
                {result.riskAssessment.factors.map((factor, index) => (
                  <li key={index} className="flex items-start gap-3 text-body-small text-neutral-600 p-3 bg-amber-50/50 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-body-large font-bold text-neutral-900 mb-4">Mitigation Strategies</h4>
              <ul className="space-y-3">
                {result.riskAssessment.mitigationStrategies.map((strategy, index) => (
                  <li key={index} className="flex items-start gap-3 text-body-small text-neutral-600 p-3 bg-cyber-green-50/50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-cyber-green-500 mt-0.5 flex-shrink-0" />
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Implementation Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setShowImplementationPlan(!showImplementationPlan)}
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm group-hover:bg-neural-blue-200 transition-colors duration-300">
                <Calendar className="w-6 h-6 text-neural-blue-600" />
              </div>
              <div>
                <h3 className="text-headline-3 font-bold text-neutral-900">Implementation Timeline</h3>
                <p className="text-body-small text-neutral-600">Step-by-step deployment plan</p>
              </div>
            </div>
            {showImplementationPlan ? (
              <ChevronUp className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
            ) : (
              <ChevronDown className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
            )}
          </div>

          <AnimatePresence>
            {showImplementationPlan && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 space-y-6">
                  {[
                    { 
                      phase: 'Planning & Setup', 
                      duration: result.implementationTimeline.planning, 
                      icon: <FileText className="w-6 h-6" />,
                      color: 'bg-neural-blue-100 text-neural-blue-600',
                      description: 'Strategy development, requirements gathering, team structure planning'
                    },
                    { 
                      phase: 'Hiring & Recruitment', 
                      duration: result.implementationTimeline.hiring, 
                      icon: <Users className="w-6 h-6" />,
                      color: 'bg-cyber-green-100 text-cyber-green-600',
                      description: 'Candidate sourcing, interviews, background checks, offer negotiations'
                    },
                    { 
                      phase: 'Training & Onboarding', 
                      duration: result.implementationTimeline.training, 
                      icon: <Lightbulb className="w-6 h-6" />,
                      color: 'bg-quantum-purple-100 text-quantum-purple-600',
                      description: 'System training, process documentation, cultural integration'
                    },
                    { 
                      phase: 'Full Implementation', 
                      duration: result.implementationTimeline.fullImplementation, 
                      icon: <Zap className="w-6 h-6" />,
                      color: 'bg-matrix-orange-100 text-matrix-orange-600',
                      description: 'Complete transition, performance monitoring, optimization'
                    }
                  ].map((phase, index) => (
                    <motion.div
                      key={phase.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-center gap-4 p-5 border border-neural-blue-100 bg-gradient-to-br from-white to-neural-blue-50/20 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                    >
                      <div className={`p-4 rounded-xl shadow-sm ${phase.color}`}>
                        {phase.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-body-large font-bold text-neutral-900">{phase.phase}</h4>
                          <span className="text-body-small font-medium text-neural-blue-700 bg-neural-blue-100 px-3 py-1 rounded-full">
                            {phase.duration} week{phase.duration > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-body-small text-neutral-600">{phase.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>







          </motion.div>
        )}

        {activeTab === 'implementation' && (
          <motion.div
            key="implementation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* AI-Generated Implementation Plan */}
            <Card className="p-6 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Brain className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">AI-Generated Implementation Plan</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                      Powered by Claude AI
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {isPlanLoading ? 'Generating customized plan...' : 'Detailed roadmap tailored to your specific requirements'}
                  </p>
                </div>
              </div>

              {isPlanLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Claude AI is analyzing your requirements...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                </div>
              )}

              {planError && (
                <div className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Unable to Generate Plan</h4>
                  <p className="text-gray-600 mb-4">There was an issue generating your implementation plan.</p>
                  <Button
                    variant="outline"
                    onClick={refetch}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                </div>
              )}

              {implementationPlan && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-white p-6 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Executive Summary
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{implementationPlan.executiveSummary}</p>
                  </div>

                  {/* Detailed Plan */}
                  <div className="bg-white p-6 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-indigo-600" />
                      Implementation Phases
                    </h4>
                    <div className="space-y-4">
                      {implementationPlan.detailedPlan.map((phase, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-900">{phase.phase}</h5>
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {phase.duration}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h6 className="font-medium text-gray-800 mb-2">Objectives</h6>
                              <ul className="space-y-1">
                                {phase.objectives.map((obj, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                                    {obj}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h6 className="font-medium text-gray-800 mb-2">Key Activities</h6>
                              <ul className="space-y-1">
                                {phase.keyActivities.map((activity, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-gray-600">
                                    <ArrowRight className="w-3 h-3 text-blue-500 mt-1 flex-shrink-0" />
                                    {activity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Steps */}
                  <div className="bg-white p-6 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Immediate Next Steps
                    </h4>
                    <div className="space-y-2">
                      {implementationPlan.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 text-sm font-medium rounded-full flex items-center justify-center">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'pitch' && (
          <motion.div
            key="pitch"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Pitch Deck Header */}
            <Card className="p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium mb-4">
                  <Presentation className="w-4 h-4" />
                  Executive Pitch Deck
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Present Your Offshore Scaling Strategy
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  A professional presentation to communicate the business case for offshore scaling to stakeholders, 
                  board members, or investors.
                </p>
              </div>
            </Card>

            {/* Pitch Deck Slides */}
            <div className="grid gap-6">
              {/* Slide 1: Executive Summary */}
              <Card className="p-6 border-l-4 border-l-blue-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Executive Summary</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">The Opportunity</h5>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            Save {formatCurrency(result.totalSavings)} annually
                          </li>
                          <li className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                            Scale team to {result.totalTeamSize} members
                          </li>
                          <li className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                            Achieve {result.estimatedROI.toFixed(1)}x ROI
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Strategic Benefits</h5>
                        <ul className="space-y-2 text-gray-600">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            Access to specialized talent
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            24/7 operational capability
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                            Competitive market advantage
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 2: Financial Impact */}
              <Card className="p-6 border-l-4 border-l-green-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Financial Impact</h4>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-semibold text-red-800 mb-2">Current Australian Costs</h5>
                        <p className="text-2xl font-bold text-red-600">{formatCurrency(result.totalAustralianCost)}</p>
                        <p className="text-sm text-red-600">per year</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-semibold text-green-800 mb-2">Offshore Costs</h5>
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(result.totalPhilippineCost)}</p>
                        <p className="text-sm text-green-600">per year</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">Annual Savings</h5>
                        <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.totalSavings)}</p>
                        <p className="text-sm text-blue-600">{formatPercentage(result.averageSavingsPercentage)} reduction</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 3: Team Structure */}
              <Card className="p-6 border-l-4 border-l-purple-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Proposed Team Structure</h4>
                                         <div className="grid md:grid-cols-2 gap-4">
                       {Object.entries(result.breakdown).map(([roleId, breakdown]) => {
                         const role = ROLES[roleId as RoleId];
                         if (!role) return null;
                         
                         return (
                           <div key={roleId} className="border border-gray-200 rounded-lg p-4">
                             <div className="flex items-center gap-3 mb-2">
                               <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                                 <Users className="w-4 h-4" />
                               </div>
                               <div>
                                 <h5 className="font-semibold text-gray-900">{role.title}</h5>
                                 <p className="text-sm text-gray-600">{breakdown.teamSize} position{breakdown.teamSize > 1 ? 's' : ''}</p>
                               </div>
                             </div>
                             <div className="text-sm space-y-1">
                               <div className="flex justify-between">
                                 <span className="text-gray-600">Australian Cost:</span>
                                 <span className="font-medium text-red-600">{formatCurrency(breakdown.australianCost)}</span>
                               </div>
                               <div className="flex justify-between">
                                 <span className="text-gray-600">Offshore Cost:</span>
                                 <span className="font-medium text-green-600">{formatCurrency(breakdown.philippineCost)}</span>
                               </div>
                               <div className="flex justify-between border-t pt-1">
                                 <span className="text-gray-600">Savings:</span>
                                 <span className="font-bold text-blue-600">{formatCurrency(breakdown.savings)}</span>
                               </div>
                             </div>
                           </div>
                         );
                       })}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 4: Implementation Timeline */}
              <Card className="p-6 border-l-4 border-l-orange-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Implementation Roadmap</h4>
                    <div className="space-y-4">
                      {[
                        { 
                          phase: 'Planning & Setup', 
                          duration: result.implementationTimeline.planning, 
                          color: 'bg-blue-100 text-blue-600',
                          description: 'Strategy development and requirements gathering'
                        },
                        { 
                          phase: 'Hiring & Recruitment', 
                          duration: result.implementationTimeline.hiring, 
                          color: 'bg-green-100 text-green-600',
                          description: 'Candidate sourcing and selection process'
                        },
                        { 
                          phase: 'Training & Onboarding', 
                          duration: result.implementationTimeline.training, 
                          color: 'bg-purple-100 text-purple-600',
                          description: 'System training and cultural integration'
                        },
                        { 
                          phase: 'Full Implementation', 
                          duration: result.implementationTimeline.fullImplementation, 
                          color: 'bg-orange-100 text-orange-600',
                          description: 'Complete transition and optimization'
                        }
                      ].map((phase, index) => (
                        <div key={phase.phase} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${phase.color}`}>
                            Week {index === 0 ? '1' : index === 1 ? result.implementationTimeline.planning + 1 : index === 2 ? result.implementationTimeline.planning + result.implementationTimeline.hiring + 1 : result.implementationTimeline.planning + result.implementationTimeline.hiring + result.implementationTimeline.training + 1}-{
                              index === 0 ? result.implementationTimeline.planning : 
                              index === 1 ? result.implementationTimeline.planning + result.implementationTimeline.hiring :
                              index === 2 ? result.implementationTimeline.planning + result.implementationTimeline.hiring + result.implementationTimeline.training :
                              result.implementationTimeline.fullImplementation
                            }
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{phase.phase}</h5>
                            <p className="text-sm text-gray-600">{phase.description}</p>
                          </div>
                          <div className="text-sm font-medium text-gray-600">
                            {phase.duration} week{phase.duration > 1 ? 's' : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 5: Risk Assessment */}
              <Card className="p-6 border-l-4 border-l-amber-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Risk Assessment & Mitigation</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRiskLevelColor(result.riskAssessment.level)}`}>
                          <Shield className="w-4 h-4" />
                          {result.riskAssessment.level.charAt(0).toUpperCase() + result.riskAssessment.level.slice(1)} Risk Level
                        </div>
                        <h5 className="font-semibold text-gray-800 mb-2">Identified Risks</h5>
                        <ul className="space-y-2">
                          {result.riskAssessment.factors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Mitigation Strategies</h5>
                        <ul className="space-y-2">
                          {result.riskAssessment.mitigationStrategies.map((strategy, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Slide 6: Call to Action */}
              <Card className="p-6 border-l-4 border-l-indigo-500">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-lg">
                    6
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Recommendation & Next Steps</h4>
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                      <h5 className="text-lg font-semibold text-gray-900 mb-3">Strategic Recommendation</h5>
                      <p className="text-gray-700 mb-4">
                        Based on our analysis, implementing an offshore scaling strategy will deliver significant cost savings 
                        of {formatCurrency(result.totalSavings)} annually while maintaining operational excellence and enabling 
                        accelerated growth.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Immediate Actions</h6>
                          <ul className="space-y-1 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full flex items-center justify-center">1</span>
                              Approve offshore scaling initiative
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full flex items-center justify-center">2</span>
                              Begin detailed implementation planning
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-5 h-5 bg-indigo-100 text-indigo-600 text-xs font-medium rounded-full flex items-center justify-center">3</span>
                              Initiate recruitment process
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-semibold text-gray-800 mb-2">Expected Timeline</h6>
                          <p className="text-sm text-gray-600 mb-2">
                            Full implementation: <strong>{result.implementationTimeline.fullImplementation} weeks</strong>
                          </p>
                          <p className="text-sm text-gray-600">
                            ROI realization: <strong>Within 6 months</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>


          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Action Buttons with StepIndicator Style Background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="mt-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-8 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
        <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {/* Download Button Container */}
            <Button 
              variant="primary" 
              leftIcon={<Download className="w-5 h-5" />}
              className="w-full sm:w-[256px] px-6 py-3 bg-neural-blue-500 hover:bg-neural-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Download Complete Report
            </Button>
            
            {/* Start New Calculation + Share Icon Container */}
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <Button 
                variant="outline" 
                onClick={onRestart} 
                leftIcon={<Calculator className="w-5 h-5" />}
                className="flex-1 sm:min-w-[200px] sm:flex-initial px-6 py-3 border-2 border-neural-blue-300 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-400 hover:-translate-y-0.5 transition-all duration-300"
              >
                Start New Calculation
              </Button>
              <Button 
                variant="secondary" 
                className="w-12 h-12 p-3 border-2 border-neural-blue-200 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-300 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center flex-shrink-0"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ScaleMate Pitch Section - Why Do It Yourself? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="bg-white border border-neural-blue-100 rounded-2xl p-6 sm:p-8 relative shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div className="relative z-10">
                          <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-cyber-green-500 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6 shadow-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  <span className="text-base sm:text-body-large font-bold text-white">Why Do It Yourself?</span>
                </div>
                <h3 className="text-xl sm:text-display-2 font-display font-bold mb-4 text-neural-blue-900">
                  ScaleMate Has <span className="text-cyber-green-500">Everything</span> You Need
                </h3>
                <p className="text-base sm:text-body-large text-neural-blue-700 max-w-3xl mx-auto px-4 sm:px-0">
                  Stop struggling with setup, training, and management. We've thought of everything so you don't have to.
                </p>
              </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
              <div className="bg-neural-blue-50 rounded-2xl p-4 sm:p-6 hover:bg-neural-blue-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neural-blue-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">Role Builders</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Pre-built role descriptions, skill requirements, and performance metrics for every property management position.</p>
              </div>

              <div className="bg-cyber-green-50 rounded-2xl p-4 sm:p-6 hover:bg-cyber-green-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyber-green-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">Readiness Assessment</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Comprehensive evaluation tools to ensure your team and processes are ready for offshore scaling.</p>
              </div>

              <div className="bg-quantum-purple-50 rounded-2xl p-4 sm:p-6 hover:bg-quantum-purple-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-quantum-purple-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">Advanced AI Training</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Claude AI integration with custom prompts, workflows, and automation specifically for property management.</p>
              </div>

              <div className="bg-matrix-orange-50 rounded-2xl p-4 sm:p-6 hover:bg-matrix-orange-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-matrix-orange-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">Advanced Culture Training</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Deep market knowledge training for Australian property management culture, tenant expectations, and business practices.</p>
              </div>

              <div className="bg-neural-blue-50 rounded-2xl p-4 sm:p-6 hover:bg-neural-blue-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-neural-blue-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">Offshore Team Mastery</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Proven frameworks for managing Philippine offshore teams, communication protocols, and performance optimization.</p>
              </div>

              <div className="bg-cyber-green-50 rounded-2xl p-4 sm:p-6 hover:bg-cyber-green-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyber-green-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-base sm:text-body-large font-bold mb-2 text-neural-blue-900">10X Growth System</h4>
                <p className="text-neural-blue-700 text-sm sm:text-body-small">Complete methodology combining AI automation with offshore talent to achieve exponential business growth.</p>
              </div>
            </div>

            {/* Main CTA */}
            <div className="text-center">
              <div className="bg-neural-blue-50 border border-neural-blue-200 rounded-2xl p-6 sm:p-8 mb-6 shadow-lg">
                <h4 className="text-xl sm:text-headline-2 font-display font-bold mb-4 text-neural-blue-900">
                  There's Nothing We Haven't Thought Of
                </h4>
                <p className="text-base sm:text-body-large text-neural-blue-700 mb-6">
                  We combine cutting-edge AI with proven offshore team strategies to deliver everything you need for explosive growth.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-cyber-green-600">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-body font-bold">FREE to Sign Up</span>
                  </div>
                  <div className="flex items-center gap-2 text-neural-blue-600">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-body font-bold">Advanced Features Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-quantum-purple-600">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-body font-bold">Complete Done-For-You Service</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full sm:w-auto bg-cyber-green-500 hover:bg-cyber-green-600 text-white font-bold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-2xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl">
                    🚀 Start Your 10X Journey FREE
                  </button>
                  
                  <p className="text-sm sm:text-body-small text-neural-blue-700">
                    Join thousands of property managers already scaling with ScaleMate
                  </p>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-cyber-green-50 border border-cyber-green-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-cyber-green-500 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h5 className="text-headline-3 font-bold text-cyber-green-700">Success is on the Other Side!</h5>
                </div>
                <p className="text-body text-neural-blue-700">
                  Stop doing it the hard way. Let ScaleMate handle the complexity while you focus on growing your business.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 