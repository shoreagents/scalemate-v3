'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, CalculationResult, CalculatorStep, RoleId } from '@/types';
import { calculateSavings } from '@/utils/calculations';
import { DEFAULT_FORM_DATA } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepIndicator } from '@/components/calculator/StepIndicator';
import { PortfolioStep } from './steps/PortfolioStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TaskSelectionStep } from './steps/TaskSelectionStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ResultsStep } from './steps/ResultsStep';
import { useExitIntentContext } from '@/components/providers/ExitIntentProvider';
import { analytics } from '@/utils/analytics';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calculator,
  TrendingUp,
  Users,
  Brain,
  Sparkles,
  Zap,
  Cpu,
  Target,
  Home
} from 'lucide-react';
import Link from 'next/link';

interface OffshoreCalculatorProps {
  className?: string;
  onComplete?: (results: CalculationResult) => void;
  onStepChange?: (step: CalculatorStep) => void;
}

export function OffshoreCalculator({ 
  className = '', 
  onComplete,
  onStepChange 
}: OffshoreCalculatorProps) {
  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const [formData, setFormData] = useState<FormData>({
    ...DEFAULT_FORM_DATA,
    sessionId: generateSessionId(),
    startedAt: new Date(),
    lastUpdatedAt: new Date()
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');

  // Use global exit intent context
  const exitIntentContext = useExitIntentContext();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  // Initialize analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { 
        step: 1,
        url: window.location.href
      });
      console.log('📊 Analytics initialized with session:', analytics.getSessionId());
    }
  }, []);

  // Disable global exit intent when user completes the calculator
  useEffect(() => {
    if (formData.currentStep === 5 && calculationResult) {
      exitIntentContext.disable();
      console.log('🎯 Calculator completed - exit intent disabled');
    }
  }, [formData.currentStep, calculationResult, exitIntentContext]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates, lastUpdatedAt: new Date() };
      
      // Track analytics for significant updates
      if (updates.currentStep && updates.currentStep !== prev.currentStep) {
        analytics.updateStep(updates.currentStep);
        analytics.trackEvent('step_start', { step: updates.currentStep });
        onStepChange?.(updates.currentStep);
      }
      
      if (updates.portfolioSize && updates.portfolioSize !== prev.portfolioSize) {
        analytics.trackEvent('portfolio_select', { portfolioSize: updates.portfolioSize });
      }
      
      // Update analytics with calculator data
      analytics.updateCalculatorData({
        portfolioSize: updated.portfolioSize,
        selectedRoles: Object.keys(updated.selectedRoles).filter(role => updated.selectedRoles[role as RoleId]),
        teamSize: updated.teamSize
      });
      
      return updated;
    });
  };

  const nextStep = () => {
    if (formData.currentStep < 5) {
      updateFormData({ currentStep: (formData.currentStep + 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (formData.currentStep > 1) {
      updateFormData({ currentStep: (formData.currentStep - 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateSavingsAsync = async () => {
    setIsCalculating(true);
    analytics.trackEvent('calculation_start', formData);
    
    try {
      // Processing stages simulation
      const processingStages = [
        'Initializing calculation...',
        'Analyzing portfolio data...',
        'Processing role requirements...',
        'Calculating cost savings...',
        'Optimizing team structure...',
        'Generating recommendations...',
        'Finalizing results...'
      ];

      for (let i = 0; i < processingStages.length; i++) {
        setProcessingStage(processingStages[i]!);
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }
      
      const result = calculateSavings(formData);
      setCalculationResult(result);
      setProcessingStage('');
      
      // Advance to step 5 (results) after calculation is complete
      updateFormData({ currentStep: 5 });
      analytics.trackEvent('calculation_complete', { 
        result
      });
      onComplete?.(result);
    } catch (error) {
      console.error('Calculation error:', error);
      analytics.trackEvent('error', { type: 'calculation_error', error: error?.toString() });
    } finally {
      setIsCalculating(false);
      setProcessingStage('');
    }
  };

  const restartCalculator = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      sessionId: generateSessionId(),
      startedAt: new Date(),
      lastUpdatedAt: new Date()
    });
    setCalculationResult(null);
    analytics.trackEvent('calculator_restart');
    exitIntentContext.reset();
  };

  const canProceedFromStep = (step: CalculatorStep): boolean => {
    switch (step) {
      case 1: return formData.portfolioSize !== '';
      case 2: return Object.values(formData.selectedRoles).some(Boolean);
      case 3: return Object.values(formData.selectedTasks).some(Boolean) || 
                     Object.values(formData.customTasks).some(tasks => tasks.length > 0);
      case 4: {
        // NEW: Multi-level experience validation
        const selectedRoles = Object.entries(formData.selectedRoles)
          .filter(([_, selected]) => selected)
          .map(([roleId]) => roleId);
        
        // Check if all selected roles have complete experience distribution
        return selectedRoles.every(roleId => {
          const distribution = formData.roleExperienceDistribution?.[roleId];
          return distribution && distribution.isComplete;
        });
      }
      default: return true;
    }
  };

  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return (
          <PortfolioStep
            value={formData.portfolioSize}
            manualData={formData.manualPortfolioData}
            onChange={(portfolioSize, manualData) => updateFormData({ 
              portfolioSize, 
              manualPortfolioData: manualData 
            })}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            userLocation={formData.userLocation}
            onChange={(selectedRoles, teamSize, customRoles, userLocation) => updateFormData({ 
              selectedRoles, 
              teamSize, 
              customRoles: customRoles || {},
              userLocation 
            })}
          />
        );
      case 3:
        return (
          <TaskSelectionStep
            selectedRoles={formData.selectedRoles}
            selectedTasks={formData.selectedTasks}
            customTasks={formData.customTasks}
            onChange={(selectedTasks, customTasks) => updateFormData({ selectedTasks, customTasks })}
          />
        );
      case 4:
        return (
          <ExperienceStep
            value={formData.experienceLevel}
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            roleExperienceLevels={formData.roleExperienceLevels || {}}
            roleExperienceDistribution={formData.roleExperienceDistribution || {}}
            userLocation={formData.userLocation}
            onChange={(experienceLevel) => updateFormData({ experienceLevel })}
            onRoleExperienceChange={(roleExperienceLevels) => updateFormData({ roleExperienceLevels })}
            onRoleExperienceDistributionChange={(roleExperienceDistribution) => updateFormData({ roleExperienceDistribution })}
            onCalculate={calculateSavingsAsync}
            isCalculating={isCalculating}
          />
        );
      case 5:
        return (
          <ResultsStep
            result={calculationResult!}
            formData={formData}
            onRestart={restartCalculator}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = (step: CalculatorStep): string => {
    const titles = {
      1: 'Portfolio Size',
      2: 'Team Roles',
      3: 'Task Selection', 
      4: 'Experience Level',
      5: 'Your Results'
    };
    return titles[step] || 'Unknown Step';
  };

  const getStepIcon = (step: CalculatorStep) => {
    const icons = {
      1: TrendingUp,
      2: Users,
      3: Target,
      4: Calculator,
      5: Sparkles
    };
    const IconComponent = icons[step] || Calculator;
    return <IconComponent className="h-5 w-5" />;
  };

  const getStepDescription = (step: CalculatorStep): string => {
    const descriptions = {
      1: 'Tell us about your property portfolio size and management structure',
      2: 'Select the roles you want to offshore and team size requirements',
      3: 'Choose specific tasks for each role to get accurate cost projections',
      4: 'Set experience requirements to match your quality standards',
      5: 'Your comprehensive savings breakdown and implementation guide'
    };
    return descriptions[step] || '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 pattern-neural-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neural-blue-400/10 to-quantum-purple-400/10 rounded-full blur-3xl animate-neural-float pointer-events-none" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {/* Calculator Header */}
        <div className="mb-8 px-8 py-12 text-center">
          {/* ScaleMate Badge */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="transition-transform hover:scale-105">
              <Card>
                <div className="h-12 w-48 bg-gradient-neural-primary rounded-xl flex items-center justify-center relative overflow-hidden cursor-pointer">
                  <span className="text-white font-display font-bold text-xl relative z-10">ScaleMate</span>
                </div>
              </Card>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-neural-primary rounded-xl shadow-neural-glow">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-display-3 gradient-text-neural font-display leading-tight">
              Offshore Scaling Calculator
            </h1>
          </div>
          
          <p className="text-body-large text-neural-blue-600 max-w-3xl mx-auto leading-relaxed">
            {getStepDescription(formData.currentStep)}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="my-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          <div className="relative z-10">
            <StepIndicator 
              currentStep={formData.currentStep} 
              completedSteps={[]}
            />
          </div>
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isCalculating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neural-blue-900/80 backdrop-blur-lg z-50 flex items-center justify-center"
            >
              <Card 
                variant="quantum-glass" 
                className="p-12 text-center max-w-md mx-4"
                aiPowered={true}
                neuralGlow={true}
              >
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-neural-primary rounded-full flex items-center justify-center shadow-neural-glow">
                    <Calculator className="h-8 w-8 text-white animate-neural-pulse" />
                  </div>
                  
                  <h3 className="text-headline-3 gradient-text-neural mb-2 font-display">
                    Calculating Your Savings
                  </h3>
                  
                  <motion.p 
                    key={processingStage}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-neural-blue-600 font-medium"
                  >
                    {processingStage}
                  </motion.p>
                </div>
                
                {/* Processing dots */}
                <div className="loading-neural-dots justify-center">
                  <div className="animate-neural-pulse"></div>
                  <div className="animate-neural-pulse [animation-delay:0.2s]"></div>
                  <div className="animate-neural-pulse [animation-delay:0.4s]"></div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {formData.currentStep < 5 && (
          <Card 
            variant="neural-elevated" 
            className="mt-8 p-6"
            hoverLift={false}
          >
            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-4">
                {formData.currentStep === 1 ? (
                  <Link href="/">
                    <Button
                      variant="quantum-secondary"
                      leftIcon={<Home className="h-4 w-4" />}
                      className="w-40 h-12"
                    >
                      Back to Home
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="quantum-secondary"
                    onClick={prevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    className="w-40 h-12"
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-neural-blue-600 font-medium">
                  Step {formData.currentStep} of 5
                </div>
                
                {formData.currentStep < 4 && (
                  <Button
                    variant="neural-primary"
                    onClick={nextStep}
                    disabled={!canProceedFromStep(formData.currentStep)}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-40 h-12"
                  >
                    Continue
                  </Button>
                )}
                
                {formData.currentStep === 4 && (
                  <Button
                    variant="neural-primary"
                    onClick={calculateSavingsAsync}
                    disabled={isCalculating || !canProceedFromStep(4)}
                    className="w-40 h-12"
                  >
                    {isCalculating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Calculating...
                      </>
                    ) : (
                      'Calculate Savings'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Layout (stacked vertically) */}
            <div className="flex sm:hidden flex-col items-center gap-4">
              {/* Step counter at top */}
              <div className="text-sm text-neural-blue-600 font-medium">
                Step {formData.currentStep} of 5
              </div>
              
              {/* Continue button */}
              {formData.currentStep < 4 && (
                <Button
                  variant="neural-primary"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(formData.currentStep)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full h-12"
                >
                  Continue
                </Button>
              )}
              
              {/* Calculate button for step 4 */}
              {formData.currentStep === 4 && (
                <Button
                  variant="neural-primary"
                  onClick={calculateSavingsAsync}
                  disabled={isCalculating || !canProceedFromStep(4)}
                  className="w-full h-12"
                >
                  {isCalculating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate My Detailed Savings'
                  )}
                </Button>
              )}
              
              {/* Back/Previous button at bottom */}
              {formData.currentStep === 1 ? (
                <Link href="/" className="w-full">
                  <Button
                    variant="quantum-secondary"
                    leftIcon={<Home className="h-4 w-4" />}
                    className="w-full h-12"
                  >
                    Back to Home
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="quantum-secondary"
                  onClick={prevStep}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  className="w-full h-12"
                >
                  Previous
                </Button>
              )}
            </div>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 