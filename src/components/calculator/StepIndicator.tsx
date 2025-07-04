'use client';

import { motion } from 'framer-motion';
import { CalculatorStep } from '@/types';
import { 
  Building, 
  Users, 
  CheckSquare, 
  GraduationCap, 
  TrendingUp,
  Brain,
  Sparkles,
  MapPin
} from 'lucide-react';

interface StepIndicatorProps {
  currentStep: CalculatorStep;
  completedSteps?: readonly CalculatorStep[];
  onStepClick?: (step: CalculatorStep) => void;
  className?: string;
}

const STEPS = [
  {
    number: 1,
    title: 'Location',
    description: 'Set your business location',
    icon: MapPin,
    iconClass: 'scale-110'
  },
  {
    number: 2,
    title: 'Portfolio Size',
    description: 'Select your property count',
    icon: Building,
    iconClass: ''
  },
  {
    number: 3,
    title: 'Role Selection',
    description: 'Choose roles to offshore',
    icon: Users,
    iconClass: 'scale-105'
  },
  {
    number: 4,
    title: 'Task Selection',
    description: 'Select specific tasks',
    icon: CheckSquare,
    iconClass: ''
  },
  {
    number: 5,
    title: 'Experience Level',
    description: 'Set team experience',
    icon: GraduationCap,
    iconClass: 'scale-110'
  },
  {
    number: 6,
    title: 'Results',
    description: 'View your savings',
    icon: TrendingUp,
    iconClass: 'scale-105'
  }
] as const;

export function StepIndicator({ 
  currentStep, 
  completedSteps = [], 
  onStepClick, 
  className = '' 
}: StepIndicatorProps) {
  const isStepComplete = (step: CalculatorStep) => completedSteps.includes(step);
  const isStepCurrent = (step: CalculatorStep) => currentStep === step;
  const isStepClickable = (step: CalculatorStep) => 
    step <= currentStep || isStepComplete(step);

  return (
    <div className={`w-full mb-8 ${className}`}>
      {/* Neural Desktop Step Indicator (Large screens) */}
      <div className="hidden lg:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = isStepComplete(step.number as CalculatorStep);
          const isCurrent = isStepCurrent(step.number as CalculatorStep);
          const isClickable = isStepClickable(step.number as CalculatorStep);
          
          return (
            <motion.div 
              key={step.number} 
              className="flex items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Neural Step Circle */}
              <motion.button
                onClick={() => isClickable && onStepClick?.(step.number as CalculatorStep)}
                disabled={!isClickable}
                className={`
                  flex-none relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 shadow-md active:border-0 active:bg-white
                  aspect-square overflow-hidden p-0
                  ${isCurrent 
                    ? 'border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow' 
                    : isComplete
                    ? 'border-cyber-green-500 bg-gradient-to-br from-cyber-green-500 to-cyber-green-600 text-white shadow-cyber-glow'
                    : isClickable
                    ? 'border-neural-blue-200 bg-white text-neural-blue-400 hover:bg-gradient-to-br hover:from-neural-blue-500/20 hover:to-quantum-purple-500/20'
                    : 'border-neural-blue-200 bg-white text-neural-blue-400'
                  }
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}
              >
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-neural-shimmer rounded-xl" />
                )}
                <div className="flex items-center justify-center w-6 h-6">
                  <Icon className={`flex-shrink-0 relative z-10 ${step.iconClass}`} size={20} strokeWidth={1.5} />
                </div>
              </motion.button>

              {/* Neural Step Info */}
              <div className="ml-4 text-left">
                <div className={`
                  font-medium text-sm transition-colors duration-200 font-display
                  ${isCurrent ? 'text-neural-blue-600' : 'text-neural-blue-700'}
                `}>
                  {step.title}
                </div>
                <div className="text-xs text-neural-blue-500 mb-1">
                  {step.description}
                </div>
                <div className="text-xs text-neural-blue-400 font-medium">
                  Step {step.number} of {STEPS.length}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Neural Tablet Step Indicator (Medium screens) */}
      <div className="hidden md:flex lg:hidden items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isComplete = isStepComplete(step.number as CalculatorStep);
          const isCurrent = isStepCurrent(step.number as CalculatorStep);
          const isClickable = isStepClickable(step.number as CalculatorStep);
          
          return (
            <motion.div 
              key={step.number} 
              className="flex flex-col items-center flex-1 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Neural Step Circle */}
              <motion.button
                onClick={() => isClickable && onStepClick?.(step.number as CalculatorStep)}
                disabled={!isClickable}
                className={`
                  relative flex items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 shadow-md mb-2 active:border-0 active:bg-white
                  aspect-square overflow-hidden p-0
                  ${isCurrent 
                    ? 'border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow' 
                    : isComplete
                    ? 'border-cyber-green-500 bg-gradient-to-br from-cyber-green-500 to-cyber-green-600 text-white shadow-cyber-glow'
                    : isClickable
                    ? 'border-neural-blue-200 bg-white text-neural-blue-400 hover:bg-gradient-to-br hover:from-neural-blue-500/20 hover:to-quantum-purple-500/20'
                    : 'border-neural-blue-200 bg-white text-neural-blue-400'
                  }
                  ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                `}
              >
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-neural-shimmer rounded-xl" />
                )}
                <div className="flex items-center justify-center w-6 h-6">
                  <Icon className={`flex-shrink-0 relative z-10 ${step.iconClass}`} size={20} strokeWidth={1.5} />
                </div>
              </motion.button>

              {/* Neural Step Info */}
              <div className="text-center">
                <div className={`
                  font-medium text-xs transition-colors duration-200 font-display mb-1
                  ${isCurrent ? 'text-neural-blue-600' : 'text-neural-blue-700'}
                `}>
                  {step.title}
                </div>
                <div className="text-xs text-neural-blue-400 font-medium">
                  Step {step.number}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Neural Mobile Step Indicator (Small screens) */}
      <div className="md:hidden">
        {/* Current Step Info */}
        <div className="text-center mb-4">
          <div className="text-lg font-semibold text-neural-blue-900 font-display">
            {STEPS[currentStep - 1]?.title}
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 mb-3">
          {STEPS.map((step, index) => {
            const isComplete = isStepComplete(step.number as CalculatorStep);
            const isCurrent = isStepCurrent(step.number as CalculatorStep);
            
            return (
              <motion.div
                key={step.number}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  w-3 h-3 rounded-full transition-all duration-300 relative
                  ${isCurrent 
                    ? 'bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 shadow-neural-glow' 
                    : isComplete
                    ? 'bg-gradient-to-br from-cyber-green-500 to-cyber-green-600 shadow-cyber-glow'
                    : 'bg-neural-blue-200'
                  }
                `}
              >
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-neural-shimmer rounded-full" />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="text-sm text-neural-blue-600">
            Step {currentStep} of {STEPS.length}
          </div>
        </div>
      </div>
    </div>
  );
}