'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationResult, FormData, RoleId } from '@/types';
import { ROLES } from '@/utils/constants';
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
      <Card className={`p-6 border-l-4 ${color} hover:shadow-neural-glow transition-all duration-300 group bg-white/80 backdrop-blur-sm h-full`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${color.replace('border-l-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-body-small font-medium text-neural-blue-600 mb-1">{title}</p>
            <p className="text-headline-3 font-bold text-neutral-900">{value}</p>
            {subtitle && (
              <p className="text-caption text-neutral-600 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface RoleBreakdownProps {
  breakdown: Record<RoleId, any>;
  isExpanded: boolean;
  onToggle: () => void;
}

function RoleBreakdown({ breakdown, isExpanded, onToggle }: RoleBreakdownProps) {
  const breakdownArray = Object.values(breakdown);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.5 }}
    >
      <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
        <div 
          className="flex items-center justify-between cursor-pointer group"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm group-hover:bg-neural-blue-200 transition-colors duration-300">
              <BarChart3 className="w-6 h-6 text-neural-blue-600" />
            </div>
            <div>
              <h3 className="text-headline-3 font-bold text-neutral-900">Role-by-Role Breakdown</h3>
              <p className="text-body-small text-neutral-600">Detailed savings analysis for each role</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
          ) : (
            <ChevronDown className="w-6 h-6 text-neural-blue-400 group-hover:text-neural-blue-600 transition-colors duration-300" />
          )}
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
                      className="p-5 border border-neural-blue-100 bg-white/60 backdrop-blur-sm rounded-xl hover:border-neural-blue-300 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-xl shadow-sm ${roleData.color.replace('bg-', 'bg-').replace('-600', '-100')} group-hover:scale-105 transition-transform duration-300`}>
                            <span className="text-xl">{roleData.icon}</span>
                          </div>
                          <div>
                            <h4 className="text-body-large font-bold text-neutral-900">{role.roleName}</h4>
                            <p className="text-body-small text-neutral-600">{role.teamSize} team member{role.teamSize > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-body-large font-bold text-cyber-green-600">
                            ${role.savings.toLocaleString()}/year
                          </p>
                          <p className="text-body-small text-neutral-600">
                            {role.savingsPercentage.toFixed(1)}% savings
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-body-small">
                        <div className="p-3 bg-neural-blue-50/50 rounded-lg">
                          <p className="text-neutral-600 mb-1">Australian Cost</p>
                          <p className="font-bold text-neutral-900">${role.australianCost.toLocaleString()}/year</p>
                        </div>
                        <div className="p-3 bg-cyber-green-50/50 rounded-lg">
                          <p className="text-neutral-600 mb-1">Philippine Cost</p>
                          <p className="font-bold text-neutral-900">${role.philippineCost.toLocaleString()}/year</p>
                        </div>
                        <div className="p-3 bg-quantum-purple-50/50 rounded-lg">
                          <p className="text-neutral-600 mb-1">Tasks Selected</p>
                          <p className="font-bold text-neutral-900">{role.selectedTasksCount} tasks</p>
                        </div>
                        <div className="p-3 bg-matrix-orange-50/50 rounded-lg">
                          <p className="text-neutral-600 mb-1">Implementation</p>
                          <p className="font-bold text-neutral-900">{role.estimatedImplementationTime} days</p>
                        </div>
                      </div>

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
  const [activeTab, setActiveTab] = useState<'overview' | 'implementation' | 'pitch'>('overview');

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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyber-green-100 text-cyber-green-800 rounded-full text-sm font-medium mb-6">
          <Trophy className="w-4 h-4" />
          Calculation Complete
        </div>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">
            Your Offshore Scaling Results
          </h2>
        </div>
        <p className="text-body-large text-neutral-600 max-w-3xl mx-auto">
          Here's your comprehensive analysis of potential savings and implementation strategy
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex justify-center"
      >
        {/* Desktop Tab Navigation */}
        <div className="hidden sm:block bg-white/80 backdrop-blur-sm border border-neural-blue-100 rounded-xl p-1 shadow-lg">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Overview & Analysis
            </button>
            
            {/* Divider */}
            <div className="w-px bg-neural-blue-200 mx-1 my-2"></div>
            
            <button
              onClick={() => setActiveTab('implementation')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'implementation'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Implementation Plan
            </button>
            
            {/* Divider */}
            <div className="w-px bg-neural-blue-200 mx-1 my-2"></div>
            
            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow'
                  : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-50'
              }`}
            >
              <Presentation className="w-4 h-4" />
              Pitch Deck
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        <div className="sm:hidden w-full">
          <div className="relative">
            <div className="absolute left-5 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
              {activeTab === 'overview' && <BarChart3 className="w-5 h-5 text-neural-blue-600" />}
              {activeTab === 'implementation' && <ClipboardList className="w-5 h-5 text-neural-blue-600" />}
              {activeTab === 'pitch' && <Presentation className="w-5 h-5 text-neural-blue-600" />}
            </div>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as 'overview' | 'implementation' | 'pitch')}
              className="w-full bg-white/80 backdrop-blur-sm border border-neural-blue-200 rounded-xl pl-14 pr-12 py-4 text-base font-medium text-neural-blue-700 shadow-lg appearance-none cursor-pointer focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 transition-all duration-300"
            >
              <option value="overview">Overview & Analysis</option>
              <option value="implementation">Implementation Plan</option>
              <option value="pitch">Pitch Deck</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-neural-blue-500 pointer-events-none" />
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
            {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        <ResultCard
          icon={<DollarSign className="w-6 h-6 text-neural-blue-600" />}
          title="Total Annual Savings"
          value={formatCurrency(result.totalSavings)}
          subtitle={`${formatPercentage(result.averageSavingsPercentage)} average savings`}
          color="border-l-neural-blue-500"
          delay={0.1}
        />
        <ResultCard
          icon={<Users className="w-6 h-6 text-neural-blue-600" />}
          title="Team Size"
          value={`${result.totalTeamSize} members`}
          subtitle={`Across ${Object.keys(result.breakdown).length} roles`}
          color="border-l-neural-blue-500"
          delay={0.2}
        />
        <ResultCard
          icon={<TrendingUp className="w-6 h-6 text-neural-blue-600" />}
          title="ROI Estimate"
          value={`${result.estimatedROI.toFixed(1)}x`}
          subtitle="Return on investment"
          color="border-l-neural-blue-500"
          delay={0.3}
        />
        <ResultCard
          icon={<Clock className="w-6 h-6 text-neural-blue-600" />}
          title="Implementation"
          value={`${result.implementationTimeline.fullImplementation} weeks`}
          subtitle="Full deployment timeline"
          color="border-l-neural-blue-500"
          delay={0.4}
        />
      </div>

      {/* Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
              <PieChart className="w-6 h-6 text-neural-blue-600" />
            </div>
            <div>
              <h3 className="text-headline-3 font-bold text-neutral-900">Cost Comparison</h3>
              <p className="text-body-small text-neutral-600">Australian vs Philippine workforce costs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Globe className="w-10 h-10 text-red-600 mx-auto mb-3" />
                <p className="text-body-small font-medium text-red-800 mb-2">Australian Workforce</p>
                <p className="text-headline-3 font-bold text-red-600">
                  {formatCurrency(result.totalAustralianCost)}
                </p>
                <p className="text-caption text-red-600 mt-1">per year</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <ArrowRight className="w-10 h-10 text-neural-blue-400 mx-auto mb-3" />
                <div className="px-6 py-3 bg-gradient-to-r from-cyber-green-100 to-cyber-green-200 text-cyber-green-800 rounded-full shadow-md">
                  <p className="text-body-large font-bold">Save {formatPercentage(result.averageSavingsPercentage)}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="p-6 bg-gradient-to-br from-cyber-green-50 to-cyber-green-100 border border-cyber-green-200 rounded-xl mb-3 shadow-sm hover:shadow-md transition-shadow duration-300">
                <Globe className="w-10 h-10 text-cyber-green-600 mx-auto mb-3" />
                <p className="text-body-small font-medium text-cyber-green-800 mb-2">Philippine Workforce</p>
                <p className="text-headline-3 font-bold text-cyber-green-600">
                  {formatCurrency(result.totalPhilippineCost)}
                </p>
                <p className="text-caption text-cyber-green-600 mt-1">per year</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Role Breakdown */}
      <RoleBreakdown 
        breakdown={result.breakdown}
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





      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <Card className="p-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Ready to Get Started?
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Turn These Savings Into Reality
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Connect with our offshore scaling experts to implement your personalized strategy 
              and start saving {formatCurrency(result.totalSavings)} annually.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg" className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Get Implementation Plan
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule Consultation
              </Button>
            </div>
          </div>
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

      {/* Universal Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
      >
        {/* Download Button Container */}
        <Button 
          variant="primary" 
          leftIcon={<Download className="w-5 h-5" />}
          className="w-[256px] px-6 py-3 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 hover:from-neural-blue-600 hover:to-quantum-purple-600 shadow-neural-glow hover:shadow-lg transition-all duration-300"
        >
          Download Complete Report
        </Button>
        
        {/* Start New Calculation + Share Icon Container */}
        <div className="flex gap-2 items-center">
          <Button 
            variant="outline" 
            onClick={onRestart} 
            leftIcon={<Calculator className="w-5 h-5" />}
            className="min-w-[200px] px-6 py-3 border-2 border-neural-blue-300 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-400 transition-all duration-300"
          >
            Start New Calculation
          </Button>
          <Button 
            variant="secondary" 
            className="w-12 h-12 p-3 border-neural-blue-200 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-300 transition-all duration-300 flex items-center justify-center flex-shrink-0"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      {/* ScaleMate Pitch Section - Why Do It Yourself? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <div className="bg-gradient-to-br from-neural-blue-900 via-quantum-purple-900 to-neural-blue-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-neural-glow">
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-900/50 via-quantum-purple-900/50 to-neural-blue-800/50"></div>
          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-6 border border-white/20">
                <Zap className="w-6 h-6 text-cyber-green-400" />
                <span className="text-body-large font-bold">Why Do It Yourself?</span>
              </div>
              <h3 className="text-display-2 font-bold mb-4">
                ScaleMate Has <span className="text-cyber-green-400">Everything</span> You Need
              </h3>
              <p className="text-body-large text-white/90 max-w-3xl mx-auto">
                Stop struggling with setup, training, and management. We've thought of everything so you don't have to.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-neural-blue-400 to-quantum-purple-400 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">Role Builders</h4>
                <p className="text-white/80 text-body-small">Pre-built role descriptions, skill requirements, and performance metrics for every property management position.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-green-400 to-cyber-green-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">Readiness Assessment</h4>
                <p className="text-white/80 text-body-small">Comprehensive evaluation tools to ensure your team and processes are ready for offshore scaling.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-quantum-purple-400 to-neural-blue-400 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">Advanced AI Training</h4>
                <p className="text-white/80 text-body-small">Claude AI integration with custom prompts, workflows, and automation specifically for property management.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-matrix-orange-400 to-matrix-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">Advanced Culture Training</h4>
                <p className="text-white/80 text-body-small">Deep market knowledge training for Australian property management culture, tenant expectations, and business practices.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-neural-blue-400 to-cyber-green-400 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">Offshore Team Mastery</h4>
                <p className="text-white/80 text-body-small">Proven frameworks for managing Philippine offshore teams, communication protocols, and performance optimization.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-cyber-green-400 to-matrix-orange-400 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-body-large font-bold mb-2">10X Growth System</h4>
                <p className="text-white/80 text-body-small">Complete methodology combining AI automation with offshore talent to achieve exponential business growth.</p>
              </div>
            </div>

            {/* Main CTA */}
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-6">
                <h4 className="text-headline-2 font-bold mb-4">
                  There's Nothing We Haven't Thought Of
                </h4>
                <p className="text-body-large text-white/90 mb-6">
                  We combine cutting-edge AI with proven offshore team strategies to deliver everything you need for explosive growth.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-cyber-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-body font-bold">FREE to Sign Up</span>
                  </div>
                  <div className="flex items-center gap-2 text-neural-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-body font-bold">Advanced Features Available</span>
                  </div>
                  <div className="flex items-center gap-2 text-quantum-purple-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-body font-bold">Complete Done-For-You Service</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-cyber-green-400 to-matrix-orange-500 text-white font-bold text-xl px-12 py-4 rounded-full hover:from-cyber-green-300 hover:to-matrix-orange-400 transform hover:scale-105 transition-all duration-300 shadow-neural-glow">
                    🚀 Start Your 10X Journey FREE
                  </button>
                  
                  <p className="text-body-small text-white/70">
                    Join thousands of property managers already scaling with ScaleMate
                  </p>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-gradient-to-r from-cyber-green-500/20 to-cyber-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-cyber-green-400/30 shadow-lg">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-cyber-green-400 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <h5 className="text-headline-3 font-bold text-cyber-green-400">Success is on the Other Side!</h5>
                </div>
                <p className="text-body text-white/90">
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