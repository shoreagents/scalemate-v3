'use client';

import React, { useState, useEffect } from 'react';
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
}

function RoleBreakdown({ breakdown, formData }: RoleBreakdownProps) {
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

  // Calculate total experience distribution across all roles
  let totalEntry = 0, totalModerate = 0, totalExperienced = 0;
  Object.keys(breakdown).forEach(roleId => {
    const distribution = formData.roleExperienceDistribution?.[roleId];
    if (distribution) {
      totalEntry += distribution.entry;
      totalModerate += distribution.moderate;
      totalExperienced += distribution.experienced;
    }
  });
  const totalMembers = totalEntry + totalModerate + totalExperienced;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <Card className="p-4 lg:p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 lg:p-3 bg-neural-blue-100 rounded-xl shadow-sm">
            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-neural-blue-600" />
          </div>
          <div>
            <h3 className="text-lg lg:text-xl font-bold text-neutral-900">Complete Team Overview & Role Breakdown</h3>
            <p className="text-sm lg:text-base text-neutral-600">Team composition and detailed savings analysis for each role</p>
          </div>
        </div>

        {/* Team Overview */}
        {totalMembers > 0 && (
          <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Your Team: {totalMembers} Members
                </h4>
                <p className="text-sm text-gray-600">Experience level breakdown</p>
              </div>
            </div>

            <div className="space-y-4">
              {totalEntry > 0 && (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      {totalEntry}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Entry Level</div>
                      <div className="text-sm text-gray-600">1-2 years experience</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.round((totalEntry / totalMembers) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">of your team</div>
                  </div>
                </div>
              )}

              {totalModerate > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      {totalModerate}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Mid-Level</div>
                      <div className="text-sm text-gray-600">3-5 years experience</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-blue-600">
                      {Math.round((totalModerate / totalMembers) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">of your team</div>
                  </div>
                </div>
              )}

              {totalExperienced > 0 && (
                <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-500 text-white rounded-lg flex items-center justify-center font-bold text-lg">
                      {totalExperienced}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Senior Level</div>
                      <div className="text-sm text-gray-600">6+ years experience</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-purple-600">
                      {Math.round((totalExperienced / totalMembers) * 100)}%
                    </div>
                    <div className="text-xs text-gray-500">of your team</div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Team Composition</span>
                  <span>{totalMembers} total members</span>
                </div>
                <div className="flex rounded-lg overflow-hidden h-3 bg-gray-200">
                  {totalEntry > 0 && (
                    <div 
                      className="bg-green-500"
                      style={{ width: `${(totalEntry / totalMembers) * 100}%` }}
                      title={`${totalEntry} Entry Level (${Math.round((totalEntry / totalMembers) * 100)}%)`}
                    />
                  )}
                  {totalModerate > 0 && (
                    <div 
                      className="bg-blue-500"
                      style={{ width: `${(totalModerate / totalMembers) * 100}%` }}
                      title={`${totalModerate} Mid-Level (${Math.round((totalModerate / totalMembers) * 100)}%)`}
                    />
                  )}
                  {totalExperienced > 0 && (
                    <div 
                      className="bg-purple-500"
                      style={{ width: `${(totalExperienced / totalMembers) * 100}%` }}
                      title={`${totalExperienced} Senior Level (${Math.round((totalExperienced / totalMembers) * 100)}%)`}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Role Breakdown Details */}
        <div className="space-y-4">
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

                <div className="space-y-4">
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

                  {(() => {
                    const experienceDistribution = getExperienceDistribution(role.roleId);
                    if (experienceDistribution && experienceDistribution.totalAssigned > 0) {
                      return (
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
                      );
                    }
                    return null;
                  })()}
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
      </Card>
    </motion.div>
  );
}

export function ResultsStep({ result, formData, onRestart }: ResultsStepProps) {
  const [showImplementationPlan, setShowImplementationPlan] = useState(false);
  const [showAIPlan, setShowAIPlan] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  type TabType = 'overview' | 'implementation' | 'pitch';
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [savingsView, setSavingsView] = useState<'annual' | 'monthly'>('annual');

  // Toggle tooltip every 15 seconds (loop)
  useEffect(() => {
    const toggleTooltip = () => {
      setShowTooltip(prev => !prev);
    };

    // Start the loop after initial 15 seconds
    const timer = setInterval(toggleTooltip, 15000);

    return () => clearInterval(timer);
  }, []);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100; // Adjust this value based on your header height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setShowTableOfContents(false); // Close TOC on mobile after navigation
    }
  };

  // Table of Contents sections based on active tab
  const getTableOfContents = () => {
    switch (activeTab) {
      case 'overview':
        return [
          { id: 'key-metrics', title: 'Key Performance Metrics', icon: <BarChart3 className="w-4 h-4" /> },
          { id: 'cost-comparison', title: 'Cost Comparison', icon: <PieChart className="w-4 h-4" /> },
          { id: 'role-breakdown', title: 'Complete Team Overview & Role Breakdown', icon: <BarChart3 className="w-4 h-4" /> },
        ];
      case 'implementation':
        return [
          { id: 'executive-summary', title: 'Executive Summary', icon: <FileText className="w-4 h-4" /> },
          { id: 'implementation-phases', title: 'Implementation Phases', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'business-risk-assessment', title: 'Business Risk Assessment', icon: <Shield className="w-4 h-4" /> },
          { id: 'risk-mitigation', title: 'Implementation Risk Mitigation', icon: <Shield className="w-4 h-4" /> },
          { id: 'ai-setup-guide', title: 'Claude AI Setup Guide', icon: <Brain className="w-4 h-4" /> },
          { id: 'next-steps', title: 'Next Steps', icon: <Target className="w-4 h-4" /> },
        ];
      case 'pitch':
        return [
          { id: 'pitch-header', title: 'Executive Pitch Deck', icon: <Presentation className="w-4 h-4" /> },
          { id: 'slide-1', title: 'Executive Summary', icon: <FileText className="w-4 h-4" /> },
          { id: 'slide-2', title: 'Financial Impact', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'slide-3', title: 'Team Structure', icon: <Users className="w-4 h-4" /> },
          { id: 'slide-4', title: 'Implementation Roadmap', icon: <Calendar className="w-4 h-4" /> },
          { id: 'slide-5', title: 'Risk Assessment', icon: <Shield className="w-4 h-4" /> },
          { id: 'slide-6', title: 'Recommendations', icon: <Target className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };
  return (
    <div className="relative">
      {/* Main Content Area - Keep centered */}
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
              onClick={() => {
                setActiveTab('overview');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
              onClick={() => {
                setActiveTab('implementation');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
              onClick={() => {
                setActiveTab('pitch');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
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
                onClick={() => {
                  setActiveTab('overview');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
                onClick={() => {
                  setActiveTab('implementation');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
                onClick={() => {
                  setActiveTab('pitch');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
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
        id="key-metrics"
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



      {/* Enhanced Cost Comparison */}
      <motion.div
        id="cost-comparison"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="p-6 bg-white border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
                <PieChart className="w-6 h-6 text-neural-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-neutral-900">Detailed Cost Analysis</h3>
                <p className="text-sm text-neutral-600">Complete breakdown of your potential savings</p>
              </div>
            </div>
            
            {/* Cost View Toggle */}
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

          {/* Main Cost Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                         {/* Australian Costs */}
             <div className="bg-gradient-to-br from-neural-blue-50 to-neural-blue-100 border-2 border-neural-blue-200 rounded-2xl p-6">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-neural-blue-100 rounded-xl">
                   <Globe className="w-6 h-6 text-neural-blue-600" />
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-neural-blue-800">Australian Workforce</h4>
                   <p className="text-sm text-neural-blue-600">Current market rates</p>
                 </div>
               </div>

                             <div className="space-y-4">
                 <div className="bg-white/60 border border-neural-blue-200 rounded-lg p-4">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-gray-700">
                       {savingsView === 'annual' ? 'Annual Cost' : 'Monthly Cost'}
                     </span>
                     <span className="text-xl font-bold text-neural-blue-600">
                       {savingsView === 'annual' 
                         ? formatCurrency(result.totalAustralianCost)
                         : formatCurrency(Math.round(result.totalAustralianCost / 12))
                       }
                     </span>
                   </div>
                 </div>

                 <div className="bg-white/60 border border-neural-blue-200 rounded-lg p-4">
                   <div className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</div>
                   <div className="space-y-2">
                     {Object.values(result.breakdown).map((role: any, index) => (
                       <div key={index} className="flex justify-between items-center text-xs">
                         <span className="text-gray-600">{role.roleName}</span>
                         <span className="font-medium text-neural-blue-600">
                           {savingsView === 'annual'
                             ? `${formatCurrency(role.australianCost)}/year`
                             : `${formatCurrency(Math.round(role.australianCost / 12))}/month`
                           }
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="bg-neural-blue-100 border border-neural-blue-300 rounded-lg p-3">
                   <div className="flex items-center gap-2 text-neural-blue-700">
                     <AlertTriangle className="w-4 h-4" />
                     <span className="text-xs font-medium">High operational costs impacting growth</span>
                   </div>
                 </div>
              </div>
            </div>

                         {/* Philippine Costs */}
             <div className="bg-gradient-to-br from-cyber-green-50 to-cyber-green-100 border-2 border-cyber-green-200 rounded-2xl p-6">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-cyber-green-100 rounded-xl">
                   <Globe className="w-6 h-6 text-cyber-green-600" />
                 </div>
                 <div>
                   <h4 className="text-lg font-bold text-cyber-green-800">Philippine Offshore</h4>
                   <p className="text-sm text-cyber-green-600">Optimized talent strategy</p>
                 </div>
               </div>

                             <div className="space-y-4">
                 <div className="bg-white/60 border border-cyber-green-200 rounded-lg p-4">
                   <div className="flex justify-between items-center">
                     <span className="text-sm font-medium text-gray-700">
                       {savingsView === 'annual' ? 'Annual Cost' : 'Monthly Cost'}
                     </span>
                     <span className="text-xl font-bold text-cyber-green-600">
                       {savingsView === 'annual' 
                         ? formatCurrency(result.totalPhilippineCost)
                         : formatCurrency(Math.round(result.totalPhilippineCost / 12))
                       }
                     </span>
                   </div>
                 </div>

                 <div className="bg-white/60 border border-cyber-green-200 rounded-lg p-4">
                   <div className="text-sm font-medium text-gray-700 mb-3">Cost Breakdown</div>
                   <div className="space-y-2">
                     {Object.values(result.breakdown).map((role: any, index) => (
                       <div key={index} className="flex justify-between items-center text-xs">
                         <span className="text-gray-600">{role.roleName}</span>
                         <span className="font-medium text-cyber-green-600">
                           {savingsView === 'annual'
                             ? `${formatCurrency(role.philippineCost)}/year`
                             : `${formatCurrency(Math.round(role.philippineCost / 12))}/month`
                           }
                         </span>
                       </div>
                     ))}
                   </div>
                 </div>

                 <div className="bg-cyber-green-100 border border-cyber-green-300 rounded-lg p-3">
                   <div className="flex items-center gap-2 text-cyber-green-700">
                     <CheckCircle2 className="w-4 h-4" />
                     <span className="text-xs font-medium">Access to top 1% talent at 60-80% savings</span>
                   </div>
                 </div>
              </div>
            </div>
          </div>

                     {/* Savings Summary & Projections */}
           <div className="bg-gradient-to-r from-cyber-green-50 to-cyber-green-100 border-2 border-cyber-green-200 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-3 bg-cyber-green-100 rounded-xl">
                 <TrendingUp className="w-6 h-6 text-cyber-green-600" />
               </div>
               <div>
                 <h4 className="text-lg font-bold text-cyber-green-800">Your Savings Impact</h4>
                 <p className="text-sm text-cyber-green-600">Financial benefits and projections</p>
               </div>
             </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
               {/* Annual Savings */}
               <div className="bg-white border border-cyber-green-200 rounded-xl p-4 text-center">
                 <div className="text-2xl font-bold text-cyber-green-600 mb-2">{formatCurrency(result.totalSavings)}</div>
                 <div className="text-sm font-medium text-gray-700 mb-1">Annual Savings</div>
                 <div className="text-xs text-cyber-green-600">{formatPercentage(result.averageSavingsPercentage)} reduction</div>
               </div>

               {/* Monthly Savings */}
               <div className="bg-white border border-cyber-green-200 rounded-xl p-4 text-center">
                 <div className="text-2xl font-bold text-cyber-green-600 mb-2">{formatCurrency(Math.round(result.totalSavings / 12))}</div>
                 <div className="text-sm font-medium text-gray-700 mb-1">Monthly Savings</div>
                 <div className="text-xs text-cyber-green-600">Recurring cash flow improvement</div>
               </div>

               {/* 3-Year Projection */}
               <div className="bg-white border border-cyber-green-200 rounded-xl p-4 text-center">
                 <div className="text-2xl font-bold text-cyber-green-600 mb-2">{formatCurrency(result.totalSavings * 3)}</div>
                 <div className="text-sm font-medium text-gray-700 mb-1">3-Year Savings</div>
                 <div className="text-xs text-cyber-green-600">Compound growth opportunity</div>
               </div>
             </div>

            
          </div>

                     {/* What This Means Section */}
           <div className="mt-6 p-6 bg-gradient-to-r from-neural-blue-50 to-neural-blue-100 border border-neural-blue-200 rounded-xl">
             <div className="flex items-start gap-3">
               <div className="p-2 bg-neural-blue-100 rounded-lg">
                 <Lightbulb className="w-5 h-5 text-neural-blue-600" />
               </div>
               <div className="flex-1">
                 <h5 className="text-lg font-bold text-neural-blue-800 mb-3">What This Means for Your Business</h5>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-cyber-green-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">Reinvest {formatCurrency(Math.round(result.totalSavings * 0.5))} annually into growth</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-cyber-green-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">Scale operations by {Math.round(result.averageSavingsPercentage)}% without cost increase</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-cyber-green-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">Improve profit margins significantly</span>
                     </div>
                   </div>
                   <div className="space-y-2">
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-neural-blue-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">Access specialized skills at lower cost</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-neural-blue-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">24/7 operations across time zones</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-neural-blue-500 rounded-full"></div>
                       <span className="text-sm text-gray-700">Competitive advantage through cost efficiency</span>
                     </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

              {/* Role Breakdown */}
        <div id="role-breakdown">
          <RoleBreakdown 
            breakdown={result.breakdown}
            formData={formData}
          />
        </div>













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
            {/* Loading/Error States */}
            {isPlanLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-12 text-center bg-gradient-to-br from-neural-blue-50 to-quantum-purple-50 border-2 border-neural-blue-200 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-neural-blue-600 animate-spin" />
                    <div>
                      <h3 className="text-2xl font-bold text-neural-blue-900 mb-2">Generating Implementation Plan</h3>
                      <p className="text-neural-blue-700 text-lg max-w-md mx-auto">
                        Claude AI is analyzing your requirements...
                      </p>
                      <p className="text-neural-blue-600 text-sm mt-2">This may take a few moments</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {planError && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="p-12 text-center bg-gradient-to-br from-amber-50 to-red-50 border-2 border-amber-200 shadow-lg">
                  <div className="flex flex-col items-center gap-4">
                    <AlertTriangle className="w-12 h-12 text-amber-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-amber-900 mb-2">Unable to Generate Plan</h3>
                      <p className="text-amber-700 text-lg max-w-md mx-auto mb-4">
                        There was an issue generating your implementation plan.
                      </p>
                      <Button
                        variant="outline"
                        onClick={refetch}
                        className="flex items-center gap-2 border-amber-600 text-amber-700 hover:bg-amber-50"
                      >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {implementationPlan && (
              <>
                {/* Executive Summary */}
                <motion.div
                  id="executive-summary"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
                        <FileText className="w-6 h-6 text-neural-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-headline-3 font-bold text-neutral-900">Executive Summary</h3>
                        <p className="text-body-small text-neutral-600">Strategic overview of your implementation approach</p>
                      </div>
                    </div>
                    <p className="text-body text-neutral-700 leading-relaxed">{implementationPlan.executiveSummary}</p>
                  </Card>
                </motion.div>

                {/* Implementation Phases */}
                <motion.div
                  id="implementation-phases"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
                        <ClipboardList className="w-6 h-6 text-neural-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-headline-3 font-bold text-neutral-900">Implementation Phases</h3>
                        <p className="text-body-small text-neutral-600">Detailed step-by-step implementation roadmap</p>
                      </div>
                    </div>
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
                  </Card>
                </motion.div>

                {/* Business Risk Assessment */}
                <motion.div
                  id="business-risk-assessment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
                        <Shield className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="text-headline-3 font-bold text-neutral-900">Business Risk Assessment</h3>
                        <p className="text-body-small text-neutral-600">Strategic risks and considerations for offshore scaling</p>
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

                {/* Implementation Risk Assessment & Mitigation */}
                {implementationPlan.riskAssessment && implementationPlan.riskAssessment.length > 0 && (
                  <motion.div
                    id="risk-mitigation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-amber-100 rounded-xl shadow-sm">
                          <Shield className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <h3 className="text-headline-3 font-bold text-neutral-900">Implementation Risk Mitigation</h3>
                          <p className="text-body-small text-neutral-600">Specific implementation risks and detailed mitigation strategies</p>
                        </div>
                      </div>
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
                    </Card>
                  </motion.div>
                )}

                {/* Claude AI Setup Guide */}
                {implementationPlan.claudeAIGuide && (
                  <motion.div
                    id="ai-setup-guide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
                          <Brain className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-headline-3 font-bold text-purple-900">Claude AI Setup Guide</h3>
                          <p className="text-body-small text-purple-700">Complete guide for integrating AI into your offshore operations</p>
                        </div>
                      </div>
                      
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
                    </Card>
                  </motion.div>
                )}

                {/* Next Steps */}
                <motion.div
                  id="next-steps"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <Card className="p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
                        <Target className="w-6 h-6 text-neural-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-headline-3 font-bold text-neutral-900">Immediate Next Steps</h3>
                        <p className="text-body-small text-neutral-600">Priority actions to begin your implementation</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {implementationPlan.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gradient-to-br from-neural-blue-50 to-cyber-green-50 rounded-xl border border-neural-blue-100">
                          <span className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-sm">
                            {index + 1}
                          </span>
                          <p className="text-body text-neutral-700 leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              </>
            )}
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
            <Card id="pitch-header" className="p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
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
              <Card id="slide-1" className="p-6 border-l-4 border-l-blue-500">
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
              <Card id="slide-2" className="p-6 border-l-4 border-l-green-500">
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
              <Card id="slide-3" className="p-6 border-l-4 border-l-purple-500">
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
              <Card id="slide-4" className="p-6 border-l-4 border-l-orange-500">
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
              <Card id="slide-5" className="p-6 border-l-4 border-l-amber-500">
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
              <Card id="slide-6" className="p-6 border-l-4 border-l-indigo-500">
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
    </div> {/* Close main content area */}

    {/* Floating Navigation Button */}
    <div className="fixed bottom-20 right-4 z-50 group/tooltip">
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        onClick={() => setShowTableOfContents(!showTableOfContents)}
        className="group bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white p-3 rounded-xl shadow-lg hover:shadow-neural-glow transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neural-blue-500/50 focus:ring-offset-2"
        aria-label="Quick navigation"
      >
        <svg 
          className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </motion.button>
      
      {/* Tooltip with breathing animation */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: [1, 1.05, 1],
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              opacity: { duration: 0.3, delay: 1 },
              scale: { 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: 1
              }
            }}
            className="absolute bottom-full right-0 mb-2 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-cyber-green-500 to-emerald-500 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
              Quick Navigation
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-cyber-green-500"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    {/* Navigation Popup */}
    <AnimatePresence>
      {showTableOfContents && (
        <>
          {/* Invisible overlay to close popup when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTableOfContents(false)}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-32 right-4 w-80 bg-white/95 backdrop-blur-lg border border-neural-blue-200 rounded-2xl shadow-2xl z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Tab Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-neural-blue-200">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-neural-blue-100 rounded-lg shadow-sm">
                    <svg 
                      className="w-5 h-5 text-neural-blue-600" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {activeTab === 'overview' && 'Overview & Analysis'}
                      {activeTab === 'implementation' && 'Implementation Plan'}
                      {activeTab === 'pitch' && 'Pitch Deck'}
                    </h3>
                    <p className="text-xs text-neutral-600">{getTableOfContents().length} sections</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTableOfContents(false)}
                  className="p-1 hover:bg-neural-blue-100 rounded-lg transition-colors duration-300"
                >
                  <ChevronDown className="w-5 h-5 text-neutral-500" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="mb-4">
                <div className="bg-neural-blue-50 rounded-lg p-1">
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => {
                        setActiveTab('overview');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-300 ${
                        activeTab === 'overview'
                          ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-sm'
                          : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-100'
                      }`}
                    >
                      <BarChart3 className="w-3 h-3" />
                      <span>Overview</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab('implementation');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-300 ${
                        activeTab === 'implementation'
                          ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-sm'
                          : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-100'
                      }`}
                    >
                      <ClipboardList className="w-3 h-3" />
                      <span>Plan</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveTab('pitch');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center justify-center gap-1 py-2 px-2 rounded-md text-xs font-medium transition-all duration-300 ${
                        activeTab === 'pitch'
                          ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-sm'
                          : 'text-neural-blue-600 hover:text-neural-blue-800 hover:bg-neural-blue-100'
                      }`}
                    >
                      <Presentation className="w-3 h-3" />
                      <span>Pitch</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {getTableOfContents().map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    onClick={() => scrollToSection(section.id)}
                    className="w-full flex items-center gap-3 p-3 text-left bg-white/70 hover:bg-neural-blue-50 border border-neural-blue-100 hover:border-neural-blue-300 rounded-lg transition-all duration-300 hover:shadow-sm group"
                  >
                    <div className="p-1.5 bg-neural-blue-100 group-hover:bg-neural-blue-200 rounded-md transition-colors duration-300 flex-shrink-0">
                      {React.cloneElement(section.icon, { className: "w-4 h-4" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 truncate group-hover:text-neural-blue-700 transition-colors duration-300">
                        {section.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-neutral-500">Section {index + 1}</span>
                        <ArrowRight className="w-3 h-3 text-neural-blue-400 group-hover:text-neural-blue-600 transition-all duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </motion.button>
                ))}
                
                {/* Start New Calculation Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: getTableOfContents().length * 0.03 + 0.1, duration: 0.3 }}
                  className="pt-3 mt-3 border-t border-gray-200"
                >
                                     <button
                     onClick={() => {
                       setShowTableOfContents(false);
                       onRestart();
                     }}
                     className="w-full flex items-center gap-3 p-3 text-left bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 hover:from-neural-blue-600 hover:to-quantum-purple-600 text-white rounded-lg transition-all duration-300 hover:shadow-neural-glow group"
                   >
                    <div className="p-1.5 bg-white/20 rounded-md transition-colors duration-300 flex-shrink-0">
                      <RefreshCw className="w-4 h-4" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <h4 className="text-sm font-medium text-white flex items-center gap-2">
                         Start New Calculation
                         <ArrowRight className="w-3 h-3 text-white/80 transition-all duration-300 group-hover:translate-x-0.5" />
                       </h4>
                     </div>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  </div>
  );
}
