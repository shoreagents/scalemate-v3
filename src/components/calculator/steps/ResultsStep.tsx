'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
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


export function ResultsStep() {
  const [activeTab, setActiveTab] = useState<'overview' | 'implementation' | 'pitch'>('overview');
  
  // Generate static implementation plan data
  const implementationPlan = {
    detailedPlan: [
      {
        phase: "Phase 1: Foundation Setup",
        duration: "Weeks 1-4",
        objectives: ["Establish offshore infrastructure", "Set up communication protocols", "Begin recruitment process"],
        keyActivities: ["Office space preparation", "Technology setup", "Initial interviews"]
      },
      {
        phase: "Phase 2: Team Onboarding", 
        duration: "Weeks 5-8",
        objectives: ["Onboard selected team members", "Complete training programs", "Establish workflows"],
        keyActivities: ["Training delivery", "Process documentation", "Workflow implementation"]
      }
    ],
    riskAssessment: [
      {
        risk: "Communication barriers",
        impact: "Medium",
        probability: "Low",
        mitigation: "Establish clear communication protocols and regular check-ins"
      },
      {
        risk: "Quality control issues",
        impact: "High", 
        probability: "Medium",
        mitigation: "Implement rigorous training and quality assurance processes"
      },
      {
        risk: "Cultural differences",
        impact: "Medium",
        probability: "Medium", 
        mitigation: "Provide cultural training and assign cultural liaisons"
      }
    ],
    claudeAIGuide: {
      setupSteps: [
        {
          step: "Initial Setup",
          description: "Configure Claude AI for property management tasks",
          instructions: ["Create Claude AI account", "Set up API access", "Configure initial prompts"],
          tips: ["Start with simple tasks", "Test thoroughly before deployment"]
        }
      ],
      jobDescriptionTemplates: [
        {
          role: "Assistant Property Manager",
          template: "Remote property management assistant with AI integration",
          claudePrompt: "Create a detailed job description for offshore property management role"
        }
      ],
      trainingProcesses: [
        {
          process: "AI Training Program",
          description: "Comprehensive training for AI-assisted property management",
          claudePrompts: ["Generate training materials", "Create assessment questions"],
          expectedOutcomes: ["Improved efficiency", "Better tenant communication"]
        }
      ],
      workflowAutomation: [
        {
          workflow: "Tenant Communication",
          description: "Automated tenant response system",
          claudeIntegration: "Integrate Claude AI for intelligent responses",
          benefits: ["24/7 availability", "Consistent communication quality"]
        }
      ]
    }
  };

  // Helper function for risk color coding
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-100';
      case 'medium': return 'text-yellow-700 bg-yellow-100';
      case 'high': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '1400px' }}>
        {/* Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
              <TrendingUp className="lucide lucide-trending-up w-5 h-5 text-white" />
          </div>
            <h2 className="text-headline-1 text-neutral-900">
            Your Offshore Scaling Results
          </h2>
        </div>
          
          <p className="text-body-large text-neutral-600">
            Here's your comprehensive analysis of potential savings and implementation strategy.
        </p>
        </div>
      </div>


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
        <div className="mt-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full min-w-0"
            >
              <div className="bg-white border border-neural-blue-100 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-8 relative shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full min-w-0 overflow-hidden">
                <div className="relative z-10">
                  <div className="text-center mb-3 sm:mb-4 lg:mb-8">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 lg:gap-3 bg-cyber-green-500 rounded-full px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 mb-2 sm:mb-3 lg:mb-6 shadow-lg">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 lg:w-6 lg:h-6 text-white" />
                      <span className="text-xs sm:text-sm lg:text-body-large font-bold text-white">Why Do It Yourself?</span>
            </div>
                    <h3 className="text-base sm:text-lg lg:text-display-2 font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-neural-blue-900">
                      ScaleMate Has <span className="text-cyber-green-500">Everything</span> You Need
                    </h3>
                    <p className="text-xs sm:text-sm lg:text-body-large text-neural-blue-700 max-w-3xl mx-auto px-1.5 sm:px-2 lg:px-0">
                      Stop struggling with setup, training, and management. We've thought of everything so you don't have to.
                    </p>
          </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-10">
                    <div className="bg-neural-blue-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-neural-blue-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-neural-blue-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                 </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">Role Builders</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Pre-built role descriptions, skill requirements, and performance metrics for every property management position.</p>
               </div>
               
                    <div className="bg-cyber-green-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-cyber-green-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-cyber-green-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                 </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">Readiness Assessment</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Comprehensive evaluation tools to ensure your team and processes are ready for offshore scaling.</p>
               </div>

                    <div className="bg-quantum-purple-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-quantum-purple-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-quantum-purple-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <Brain className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                   </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">Advanced AI Training</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Claude AI integration with custom prompts, workflows, and automation specifically for property management.</p>
             </div>

                    <div className="bg-matrix-orange-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-matrix-orange-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-matrix-orange-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                 </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">Advanced Culture Training</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Deep market knowledge training for Australian property management culture, tenant expectations, and business practices.</p>
                 </div>

                    <div className="bg-neural-blue-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-neural-blue-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-neural-blue-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                           </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">Offshore Team Mastery</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Proven frameworks for managing Philippine offshore teams, communication protocols, and performance optimization.</p>
             </div>

                    <div className="bg-cyber-green-50 rounded-lg sm:rounded-2xl p-3 sm:p-4 lg:p-6 hover:bg-cyber-green-100 hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-md">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-cyber-green-500 rounded-lg sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg">
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                 </div>
                      <h4 className="text-sm sm:text-base lg:text-body-large font-bold mb-1 sm:mb-2 text-neural-blue-900">10X Growth System</h4>
                      <p className="text-neural-blue-700 text-xs sm:text-sm lg:text-body-small">Complete methodology combining AI automation with offshore talent to achieve exponential business growth.</p>
                 </div>
               </div>
               
                  {/* Main CTA */}
                     <div className="text-center">
                    <div className="bg-neural-blue-50 border border-neural-blue-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 shadow-lg">
                      <h4 className="text-lg sm:text-xl lg:text-headline-2 font-display font-bold mb-3 sm:mb-4 text-neural-blue-900">
                        There's Nothing We Haven't Thought Of
                      </h4>
                      <p className="text-sm sm:text-base lg:text-body-large text-neural-blue-700 mb-4 sm:mb-6">
                        We combine cutting-edge AI with proven offshore team strategies to deliver everything you need for explosive growth.
                      </p>
                      
                      <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 justify-center items-center mb-4 sm:mb-6">
                        <div className="flex items-center gap-1 sm:gap-2 text-cyber-green-600">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm lg:text-body font-bold">FREE to Sign Up</span>
                       </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-neural-blue-600">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm lg:text-body font-bold text-center">Advanced Features Available</span>
                     </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-quantum-purple-600">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm lg:text-body font-bold text-center">Complete Done-For-You Service</span>
                     </div>
                   </div>
                   
                      <div className="space-y-3 sm:space-y-4">
                        <button className="w-full sm:w-auto bg-cyber-green-500 hover:bg-cyber-green-600 text-white font-bold text-sm xs:text-base sm:text-lg lg:text-xl px-3 xs:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-2xl hover:-translate-y-0.5 transition-all duration-300 shadow-lg hover:shadow-xl">
                          <span className="inline-block">🚀 Start Your 10X Journey FREE</span>
                        </button>
                        
                        <p className="text-xs sm:text-sm lg:text-body-small text-neural-blue-700 px-2 xs:px-0">
                          Join thousands of property managers already scaling with ScaleMate
                        </p>
                       </div>
                     </div>
                     
                    {/* Success Message */}
                    <div className="bg-cyber-green-50 border border-cyber-green-200 rounded-lg sm:rounded-2xl p-4 sm:p-6 shadow-lg">
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-cyber-green-500 rounded-full flex items-center justify-center shadow-md">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
                       </div>
                        <h5 className="text-base sm:text-lg lg:text-headline-3 font-bold text-cyber-green-700">Success is on the Other Side!</h5>
                     </div>
                      <p className="text-sm sm:text-base lg:text-body text-neural-blue-700">
                        Stop doing it the hard way. Let ScaleMate handle the complexity while you focus on growing your business.
             </p>
           </div>
              </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'implementation' && (
            <div className="space-y-6">
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
                  <p className="text-body text-neutral-700 leading-relaxed">
                    Based on your 5000+ portfolio and team requirements, implementing an offshore development strategy can deliver significant cost savings of $98,000 annually. This implementation plan provides a structured approach to transition your assistantPropertyManager roles offshore while maintaining quality and productivity. The plan focuses on risk mitigation, clear communication protocols, and measurable success metrics to ensure a smooth transition over 20 weeks.
                  </p>
                  </Card>
                </motion.div>

                <motion.div
                  id="implementation-phases"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <Card className="p-3 xs:p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                    <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 lg:mb-6">
                      <div className="p-2 xs:p-2.5 lg:p-3 bg-neural-blue-100 rounded-lg xs:rounded-xl shadow-sm">
                        <ClipboardList className="w-5 h-5 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-neural-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                    <h3 className="text-lg xs:text-xl lg:text-headline-3 font-bold text-neutral-900">Weekly Phases Plan</h3>
                        <p className="text-xs xs:text-sm lg:text-body-small text-neutral-600">Detailed step-by-step implementation roadmap</p>
                      </div>
                    </div>
                    <div className="space-y-4 xs:space-y-5 lg:space-y-6">
                      {implementationPlan.detailedPlan.map((phase, index) => (
                        <div key={index} className="border border-neural-blue-100 bg-gradient-to-br from-white to-neural-blue-50/30 rounded-lg xs:rounded-xl p-3 xs:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                          {/* Phase Header - Mobile Responsive */}
                          <div className="mb-3 xs:mb-4">
                            {/* Mobile Layout - Stacked */}
                            <div className="block sm:hidden">
                              <h5 className="text-base xs:text-lg font-bold text-neutral-900 mb-2">{phase.phase}</h5>
                              <span className="inline-block text-xs xs:text-sm font-medium text-neural-blue-700 bg-neural-blue-100 px-2.5 xs:px-3 py-1 rounded-full shadow-sm">
                                {phase.duration}
                              </span>
                            </div>
                            
                            {/* Desktop Layout - Horizontal */}
                            <div className="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
                              <h5 className="text-lg lg:text-body-large font-bold text-neutral-900 min-w-0">{phase.phase}</h5>
                              <span className="text-sm lg:text-body-small font-medium text-neural-blue-700 bg-neural-blue-100 px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                                {phase.duration}
                              </span>
                            </div>
                          </div>
                          
                          {/* Content Grid - Mobile First */}
                          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
                            {/* Objectives Section */}
                            <div className="bg-white/70 p-3 xs:p-4 rounded-lg">
                              <h6 className="text-sm xs:text-base lg:text-body font-bold text-neutral-800 mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyber-green-600 flex-shrink-0" />
                                Objectives
                              </h6>
                              <ul className="space-y-1.5 xs:space-y-2">
                                {phase.objectives.map((obj, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs xs:text-sm lg:text-body-small text-neutral-600">
                                    <span className="w-1 h-1 bg-cyber-green-600 rounded-full mt-1.5 xs:mt-2 flex-shrink-0"></span>
                                    <span className="leading-relaxed">{obj}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            {/* Key Activities Section */}
                            <div className="bg-white/70 p-3 xs:p-4 rounded-lg">
                              <h6 className="text-sm xs:text-base lg:text-body font-bold text-neutral-800 mb-2 xs:mb-3 flex items-center gap-1.5 xs:gap-2">
                                <ArrowRight className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-neural-blue-600 flex-shrink-0" />
                                Key Activities
                              </h6>
                              <ul className="space-y-1.5 xs:space-y-2">
                                {phase.keyActivities.map((activity, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-xs xs:text-sm lg:text-body-small text-neutral-600">
                                    <span className="w-1 h-1 bg-neural-blue-600 rounded-full mt-1.5 xs:mt-2 flex-shrink-0"></span>
                                    <span className="leading-relaxed">{activity}</span>
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

                  <motion.div
                    id="risk-mitigation"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Card className="p-3 xs:p-4 sm:p-5 lg:p-6 bg-white/80 backdrop-blur-sm border border-neural-blue-100 shadow-lg hover:shadow-neural-glow transition-all duration-300">
                      <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 lg:mb-6">
                        <div className="p-2 xs:p-2.5 lg:p-3 bg-amber-100 rounded-lg xs:rounded-xl shadow-sm">
                          <Shield className="w-5 h-5 xs:w-5 xs:h-5 lg:w-6 lg:h-6 text-amber-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg xs:text-xl lg:text-headline-3 font-bold text-neutral-900">Risk Mitigation</h3>
                          <p className="text-xs xs:text-sm lg:text-body-small text-neutral-600">Specific implementation risks and detailed mitigation strategies</p>
                        </div>
                      </div>
                      <div className="space-y-3 xs:space-y-4">
                        {implementationPlan.riskAssessment.map((risk, index) => (
                          <div key={index} className="border border-neural-blue-100 bg-gradient-to-br from-white to-neural-blue-50/20 rounded-lg xs:rounded-xl p-3 xs:p-4 lg:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
                            {/* Mobile Layout - Stacked */}
                            <div className="block sm:hidden">
                              <h5 className="text-sm xs:text-base font-bold text-neutral-900 mb-3 leading-tight">{risk.risk}</h5>
                              <div className="flex flex-col gap-2 mb-3">
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full self-start ${getRiskColor(risk.impact)}`}>
                                  {risk.impact} Impact
                                </span>
                                <span className={`text-xs font-medium px-2.5 py-1 rounded-full self-start ${getRiskColor(risk.probability)}`}>
                                  {risk.probability} Probability
                                </span>
                              </div>
                              <p className="text-xs xs:text-sm text-neutral-600 leading-relaxed">
                                <strong className="text-neural-blue-700">Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>

                            {/* Desktop Layout - Horizontal */}
                            <div className="hidden sm:block">
                              <div className="flex items-start justify-between mb-3 gap-4">
                                <h5 className="text-base lg:text-body font-bold text-neutral-900 min-w-0">{risk.risk}</h5>
                                <div className="flex gap-2 flex-shrink-0">
                                  <span className={`text-xs lg:text-caption font-medium px-3 py-1 rounded-full whitespace-nowrap ${getRiskColor(risk.impact)}`}>
                                    {risk.impact} Impact
                                  </span>
                                  <span className={`text-xs lg:text-caption font-medium px-3 py-1 rounded-full whitespace-nowrap ${getRiskColor(risk.probability)}`}>
                                    {risk.probability} Probability
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm lg:text-body-small text-neutral-600">
                                <strong className="text-neural-blue-700">Mitigation:</strong> {risk.mitigation}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                    
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
                  
                </div>
        )}

        {activeTab === 'pitch' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white border border-neural-blue-100 rounded-lg sm:rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Pitch Deck Content</h3>
                <p className="text-neutral-600">Pitch deck content will go here...</p>
                </div>
          </motion.div>
        )}
            </div>
  </div>
  );
}
