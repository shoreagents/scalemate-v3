'use client';

import { motion } from 'framer-motion';
import { CalculatorStep } from '@/types';
import { 
  Building, 
  Users, 
  CheckSquare, 
  GraduationCap, 
  TrendingUp 
} from 'lucide-react';

interface StepIndicatorProps {
  currentStep: CalculatorStep;
  completedSteps: readonly CalculatorStep[];
  onStepClick?: (step: CalculatorStep) => void;
  className?: string;
}

const STEPS = [
  {
    number: 1,
    title: 'Portfolio Size',
    description: 'Select your property count',
    icon: Building
  },
  {
    number: 2,
    title: 'Team Roles',
    description: 'Choose roles to offshore',
    icon: Users
  },
  {
    number: 3,
    title: 'Task Selection',
    description: 'Select specific tasks',
    icon: CheckSquare
  },
  {
    number: 4,
    title: 'Experience Level',
    description: 'Set team experience',
    icon: GraduationCap
  },
  {
    number: 5,
    title: 'Results',
    description: 'View your savings',
    icon: TrendingUp
  }
] as const;

export function StepIndicator({ 
  currentStep, 
  completedSteps, 
  onStepClick, 
  className = '' 
}: StepIndicatorProps) {
  const isStepComplete = (step: CalculatorStep) => completedSteps.includes(step);
  const isStepCurrent = (step: CalculatorStep) => currentStep === step;
  const isStepClickable = (step: CalculatorStep) => 
    step <= currentStep || isStepComplete(step);

  return (
    <div className={`w-full mb-8 ${className}`}>
      {/* Desktop Step Indicator */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = isStepComplete(step.number as CalculatorStep);
          const isCurrent = isStepCurrent(step.number as CalculatorStep);
          const isClickable = isStepClickable(step.number as CalculatorStep);
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => isClickable && onStepClick?.(step.number as CalculatorStep)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200
                  ${isCurrent 
                    ? 'border-brand-primary-500 bg-brand-primary-500 text-white' 
                    : isComplete
                    ? 'border-brand-accent-500 bg-brand-accent-500 text-white'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-400'
                  }
                  ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                `}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Step Info */}
              <div className="ml-4 text-left">
                <div className={`
                  font-medium text-sm
                  ${isCurrent ? 'text-brand-primary-600' : 'text-neutral-600'}
                `}>
                  {step.title}
                </div>
                <div className="text-xs text-neutral-500">
                  {step.description}
                </div>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`
                    h-0.5 w-full transition-colors duration-200
                    ${isComplete ? 'bg-brand-accent-300' : 'bg-neutral-200'}
                  `} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Indicator */}
      <div className="md:hidden">
        <div className="flex items-center justify-center space-x-2 mb-4">
          {STEPS.map((step) => {
            const isComplete = isStepComplete(step.number as CalculatorStep);
            const isCurrent = isStepCurrent(step.number as CalculatorStep);
            
            return (
              <div
                key={step.number}
                className={`
                  w-3 h-3 rounded-full transition-colors duration-200
                  ${isCurrent 
                    ? 'bg-brand-primary-500' 
                    : isComplete
                    ? 'bg-brand-accent-500'
                    : 'bg-neutral-200'
                  }
                `}
              />
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="text-center">
          <div className="text-lg font-semibold text-neutral-900">
            {STEPS[currentStep - 1]?.title}
          </div>
          <div className="text-sm text-neutral-500">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
} 