'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OffshoreCalculator } from '@/components/calculator/OffshoreCalculator';
import { FormData, CalculationResult, CalculatorStep } from '@/types';
import { analytics } from '@/utils/analytics';
import { 
  Calculator, 
  TestTube, 
  Activity,
  Users,
  TrendingUp,
  Zap,
  RefreshCw,
  Home,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function ComprehensiveTestPage() {
  const [isCalculatorVisible, setIsCalculatorVisible] = useState(true);
  const [completedResults, setCompletedResults] = useState<CalculationResult | null>(null);
  const [currentStep, setCurrentStep] = useState<CalculatorStep>(1);
  const [testMetrics, setTestMetrics] = useState({
    startTime: Date.now(),
    stepsCompleted: 0,
    calculationsRun: 0,
    errorsEncountered: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { page: 'comprehensive-test' });
    }
  }, []);

  const handleCalculatorComplete = (results: CalculationResult) => {
    setCompletedResults(results);
    setTestMetrics(prev => ({
      ...prev,
      calculationsRun: prev.calculationsRun + 1
    }));
    analytics.trackEvent('calculation_complete', { 
      testPage: 'comprehensive',
      results 
    });
  };

  const handleStepChange = (step: CalculatorStep) => {
    setCurrentStep(step);
    setTestMetrics(prev => ({
      ...prev,
      stepsCompleted: Math.max(prev.stepsCompleted, step)
    }));
  };

  const resetCalculator = () => {
    setIsCalculatorVisible(false);
    setCompletedResults(null);
    setCurrentStep(1);
    
    // Force re-render of calculator
    setTimeout(() => {
      setIsCalculatorVisible(true);
      setTestMetrics(prev => ({
        ...prev,
        startTime: Date.now()
      }));
    }, 100);
  };

  const getTestDuration = () => {
    const duration = Date.now() - testMetrics.startTime;
    return Math.round(duration / 1000);
  };

  const getCompletionPercentage = () => {
    return Math.round((testMetrics.stepsCompleted / 5) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue-50 via-quantum-purple-50 to-cyber-green-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-neural-primary rounded-xl shadow-neural-glow">
              <TestTube className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-display-3 gradient-text-neural font-display">
              Comprehensive Calculator Test
            </h1>
          </div>
          <p className="text-body-large text-neural-blue-600 max-w-2xl mx-auto">
            Full-featured testing environment for the offshore scaling calculator with real-time metrics and analytics tracking
          </p>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/test">
              <Button variant="quantum-secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to Tests
              </Button>
            </Link>
            <Link href="/">
              <Button variant="quantum-secondary" leftIcon={<Home className="w-4 h-4" />}>
                Home
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Test Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neural-blue-900 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Test Metrics
                </h2>
                <Button
                  onClick={resetCalculator}
                  variant="quantum-secondary"
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                >
                  Reset Calculator
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentStep}</div>
                  <div className="text-xs text-blue-500">Current Step</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{getCompletionPercentage()}%</div>
                  <div className="text-xs text-green-500">Completion</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{testMetrics.calculationsRun}</div>
                  <div className="text-xs text-purple-500">Calculations</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-orange-600">{getTestDuration()}s</div>
                  <div className="text-xs text-orange-500">Duration</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{testMetrics.errorsEncountered}</div>
                  <div className="text-xs text-red-500">Errors</div>
                </div>
              </div>
            </>
          </Card>
        </motion.div>

        {/* Test Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
            <>
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    Testing Instructions
                  </h3>
                  <ul className="space-y-2 text-blue-700 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Complete all 5 steps of the calculator workflow
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Test different portfolio sizes and role combinations
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Monitor real-time metrics and analytics tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Use reset button to test multiple calculation scenarios
                    </li>
                  </ul>
                </div>
              </div>
            </>
          </Card>
        </motion.div>

        {/* Results Display */}
        <AnimatePresence>
          {completedResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Calculation Complete!
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        ${completedResults.totalSavings?.toLocaleString() || 'N/A'}
                      </div>
                      <div className="text-sm text-green-700">Annual Savings</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {completedResults.totalTeamSize || 'N/A'}
                      </div>
                      <div className="text-sm text-green-700">Team Members</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                                             <div className="text-2xl font-bold text-green-600">
                         {completedResults.portfolioTier || 'N/A'}
                       </div>
                       <div className="text-sm text-green-700">Portfolio Tier</div>
                    </div>
                  </div>
                </>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calculator Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-1 bg-gradient-to-br from-white to-neutral-50">
            <>
              {isCalculatorVisible && (
                <OffshoreCalculator
                  onComplete={handleCalculatorComplete}
                  onStepChange={handleStepChange}
                  className="rounded-lg overflow-hidden"
                />
              )}
            </>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 