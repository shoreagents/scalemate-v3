'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  Zap,
  Users,
  CheckCircle2,
  Brain,
  Globe,
  MessageSquare
} from 'lucide-react';

export function ResultsStep() {

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


      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
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
    </div>
  );
}
