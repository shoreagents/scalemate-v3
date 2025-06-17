'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Users
} from 'lucide-react';

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
    return `sm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const [formData, setFormData] = useState<FormData>({
    ...DEFAULT_FORM_DATA,
    sessionId: generateSessionId(),
    startedAt: new Date(),
    lastUpdatedAt: new Date()
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Use global exit intent context
  const exitIntentContext = useExitIntentContext();

  // Initialize analytics tracking on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { 
        step: 1,
        url: window.location.href 
      });
      console.log('Analytics initialized with session:', analytics.getSessionId());
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
    }
  };

  const prevStep = () => {
    if (formData.currentStep > 1) {
      updateFormData({ currentStep: (formData.currentStep - 1) as CalculatorStep });
    }
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    analytics.trackEvent('calculation_start', formData);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = calculateSavings(formData);
      setCalculationResult(result);
      // Advance to step 5 (results) after calculation is complete
      updateFormData({ currentStep: 5 });
      analytics.trackEvent('calculation_complete', { result });
      onComplete?.(result);
    } catch (error) {
      console.error('Calculation error:', error);
      analytics.trackEvent('error', { type: 'calculation_error', error: error?.toString() });
    } finally {
      setIsCalculating(false);
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
      case 4: return formData.experienceLevel !== '';
      default: return true;
    }
  };

  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return (
          <PortfolioStep
            value={formData.portfolioSize}
            onChange={(portfolioSize) => updateFormData({ portfolioSize })}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            selectedRoles={formData.selectedRoles}
            teamSize={formData.teamSize}
            onChange={(selectedRoles, teamSize) => updateFormData({ selectedRoles, teamSize })}
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
            onChange={(experienceLevel) => updateFormData({ experienceLevel })}
            selectedRoles={formData.selectedRoles}
            teamSize={formData.teamSize}
            onCalculate={calculateResults}
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

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm rounded-full border border-neutral-200 mb-6"
        >
          <Calculator className="w-6 h-6 text-brand-primary-600" />
          <span className="font-medium text-neutral-700">ScaleMate Calculator</span>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4"
        >
          Discover Your <span className="text-gradient-primary">Offshore Scaling</span> Potential
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-neutral-600 max-w-2xl mx-auto"
        >
          Get your personalized analysis in minutes. See exactly how much you can save by scaling your property management team offshore.
        </motion.p>
      </div>

      {/* Progress Indicator */}
      {formData.currentStep < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <StepIndicator 
            currentStep={formData.currentStep} 
            completedSteps={formData.completedSteps}
          />
        </motion.div>
      )}

      {/* Main Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="overflow-hidden">
          <div className="p-8">
            {renderStep()}
          </div>

          {/* Navigation */}
          {formData.currentStep < 5 && (
            <div className="px-8 pb-8">
              <div className="flex justify-between items-center pt-6 border-t border-neutral-200">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={formData.currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-neutral-500">
                    Step {formData.currentStep} of 4
                  </div>

                  <Button
                    onClick={formData.currentStep === 4 ? calculateResults : nextStep}
                    disabled={!canProceedFromStep(formData.currentStep) || isCalculating}
                    loading={isCalculating}
                    className="flex items-center gap-2"
                  >
                    {formData.currentStep === 4 ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Calculate Savings
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Quick Preview for steps 2-4 */}
      {formData.currentStep > 1 && formData.currentStep < 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-6 rounded-xl bg-white/80 backdrop-blur-sm border border-neutral-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-brand-primary-600" />
            <h3 className="font-medium text-neutral-900">Quick Preview</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-primary-600">
                {formData.portfolioSize || '—'}
              </div>
              <div className="text-sm text-neutral-500">Portfolio Size</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-secondary-600">
                {Object.values(formData.selectedRoles).filter(Boolean).length || '—'}
              </div>
              <div className="text-sm text-neutral-500">Selected Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-brand-accent-600">
                {formData.experienceLevel || '—'}
              </div>
              <div className="text-sm text-neutral-500">Experience Level</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <div><strong>Session ID:</strong> {analytics.getSessionId()}</div>
          <div><strong>Current Step:</strong> {formData.currentStep}</div>
          <div><strong>Global Exit Intent:</strong> {exitIntentContext.hasShown ? 'Shown' : 'Waiting'}</div>
          <div><strong>Exit Popup:</strong> {exitIntentContext.isVisible ? 'Visible' : 'Hidden'}</div>
          <div><strong>Portfolio:</strong> {formData.portfolioSize}</div>
        </div>
      )}
    </div>
  );
} 