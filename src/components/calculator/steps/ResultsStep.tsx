'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalculationResult, FormData, RoleId } from '@/types';
import { ROLES } from '@/utils/calculator';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AIInsightsPanel } from '../AIInsightsPanel';
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
  Lightbulb
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
      <Card className={`p-6 border-l-4 ${color} hover:shadow-lg transition-all duration-300 group`}>
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${color.replace('border-l-', 'bg-').replace('-500', '-100')} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
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
      <Card className="p-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Role-by-Role Breakdown</h3>
              <p className="text-sm text-gray-600">Detailed savings analysis for each role</p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
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
                  return (
                    <motion.div
                      key={role.roleId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${roleData.color.replace('bg-', 'bg-').replace('-600', '-100')}`}>
                            <span className="text-lg">{roleData.icon}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{role.roleName}</h4>
                            <p className="text-sm text-gray-600">{role.teamSize} team member{role.teamSize > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            ${role.savings.toLocaleString()}/year
                          </p>
                          <p className="text-sm text-gray-600">
                            {role.savingsPercentage.toFixed(1)}% savings
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Australian Cost</p>
                          <p className="font-semibold">${role.australianCost.toLocaleString()}/year</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Philippine Cost</p>
                          <p className="font-semibold">${role.philippineCost.toLocaleString()}/year</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tasks Selected</p>
                          <p className="font-semibold">{role.selectedTasksCount} tasks</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Implementation</p>
                          <p className="font-semibold">{role.estimatedImplementationTime} days</p>
                        </div>
                      </div>

                      {role.riskFactors && role.riskFactors.length > 0 && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">Risk Considerations</span>
                          </div>
                          <ul className="text-xs text-amber-700 space-y-1">
                            {role.riskFactors.map((factor: string, idx: number) => (
                              <li key={idx}>• {factor}</li>
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
          <Trophy className="w-4 h-4" />
          Calculation Complete
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Your Offshore Scaling Results
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Here's your comprehensive analysis of potential savings and implementation strategy
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ResultCard
          icon={<DollarSign className="w-6 h-6 text-green-600" />}
          title="Total Annual Savings"
          value={formatCurrency(result.totalSavings)}
          subtitle={`${formatPercentage(result.averageSavingsPercentage)} average savings`}
          color="border-l-green-500"
          delay={0.1}
        />
        <ResultCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          title="Team Size"
          value={`${result.totalTeamSize} members`}
          subtitle={`Across ${Object.keys(result.breakdown).length} roles`}
          color="border-l-blue-500"
          delay={0.2}
        />
        <ResultCard
          icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
          title="ROI Estimate"
          value={`${result.estimatedROI.toFixed(1)}x`}
          subtitle="Return on investment"
          color="border-l-purple-500"
          delay={0.3}
        />
        <ResultCard
          icon={<Clock className="w-6 h-6 text-orange-600" />}
          title="Implementation"
          value={`${result.implementationTimeline.fullImplementation} weeks`}
          subtitle="Full deployment timeline"
          color="border-l-orange-500"
          delay={0.4}
        />
      </div>

      {/* Cost Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <PieChart className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Cost Comparison</h3>
              <p className="text-sm text-gray-600">Australian vs Philippine workforce costs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-3">
                <Globe className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-red-800">Australian Workforce</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(result.totalAustralianCost)}
                </p>
                <p className="text-xs text-red-600">per year</p>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <ArrowRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full">
                  <p className="text-lg font-bold">Save {formatPercentage(result.averageSavingsPercentage)}</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
                <Globe className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-green-800">Philippine Workforce</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(result.totalPhilippineCost)}
                </p>
                <p className="text-xs text-green-600">per year</p>
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

      {/* Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
              <p className="text-sm text-gray-600">Implementation considerations and mitigation strategies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4 ${getRiskLevelColor(result.riskAssessment.level)}`}>
                <Activity className="w-4 h-4" />
                {result.riskAssessment.level.charAt(0).toUpperCase() + result.riskAssessment.level.slice(1)} Risk
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-3">Risk Factors</h4>
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
              <h4 className="font-semibold text-gray-900 mb-3">Mitigation Strategies</h4>
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
        </Card>
      </motion.div>

      {/* Implementation Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="p-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowImplementationPlan(!showImplementationPlan)}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Implementation Timeline</h3>
                <p className="text-sm text-gray-600">Step-by-step deployment plan</p>
              </div>
            </div>
            {showImplementationPlan ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
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
                <div className="mt-6 space-y-4">
                  {[
                    { 
                      phase: 'Planning & Setup', 
                      duration: result.implementationTimeline.planning, 
                      icon: <FileText className="w-5 h-5" />,
                      color: 'bg-blue-100 text-blue-600',
                      description: 'Strategy development, requirements gathering, team structure planning'
                    },
                    { 
                      phase: 'Hiring & Recruitment', 
                      duration: result.implementationTimeline.hiring, 
                      icon: <Users className="w-5 h-5" />,
                      color: 'bg-green-100 text-green-600',
                      description: 'Candidate sourcing, interviews, background checks, offer negotiations'
                    },
                    { 
                      phase: 'Training & Onboarding', 
                      duration: result.implementationTimeline.training, 
                      icon: <Lightbulb className="w-5 h-5" />,
                      color: 'bg-purple-100 text-purple-600',
                      description: 'System training, process documentation, cultural integration'
                    },
                    { 
                      phase: 'Full Implementation', 
                      duration: result.implementationTimeline.fullImplementation, 
                      icon: <Zap className="w-5 h-5" />,
                      color: 'bg-orange-100 text-orange-600',
                      description: 'Complete transition, performance monitoring, optimization'
                    }
                  ].map((phase, index) => (
                    <motion.div
                      key={phase.phase}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                    >
                      <div className={`p-3 rounded-lg ${phase.color}`}>
                        {phase.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900">{phase.phase}</h4>
                          <span className="text-sm font-medium text-gray-600">
                            {phase.duration} week{phase.duration > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.5 }}
      >
        <AIInsightsPanel 
          formData={formData} 
          calculationResult={result}
          className="mb-8"
        />
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <Button variant="primary" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Download Report
        </Button>
        <Button variant="secondary" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          Share Results
        </Button>
        <Button variant="ghost" onClick={onRestart} className="flex items-center gap-2">
          <Calculator className="w-4 h-4" />
          Start New Calculation
        </Button>
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
    </div>
  );
} 