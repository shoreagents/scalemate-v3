import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Calculator, Brain } from 'lucide-react';
import { Card } from './Card';

interface LoadingSpinnerProps {
  /** Loading variant style */
  variant?: 'dots' | 'spinner' | 'overlay' | 'minimal';
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Main loading text */
  text?: string;
  /** Subtitle text */
  subtext?: string;
  /** Custom icon for overlay variant */
  icon?: React.ReactNode;
  /** Whether to show the spinner */
  show?: boolean;
  /** Custom className */
  className?: string;
  /** Background blur for overlay */
  backgroundBlur?: boolean;
}

export function LoadingSpinner({
  variant = 'spinner',
  size = 'md',
  text,
  subtext,
  icon,
  show = true,
  className = '',
  backgroundBlur = true
}: LoadingSpinnerProps) {
  if (!show) return null;

  const sizeClasses = {
    sm: {
      spinner: 'w-4 h-4',
      dots: 'w-1 h-1',
      text: 'text-sm',
      subtext: 'text-xs',
      iconContainer: 'w-8 h-8',
      icon: 'w-4 h-4'
    },
    md: {
      spinner: 'w-6 h-6',
      dots: 'w-1.5 h-1.5',
      text: 'text-base',
      subtext: 'text-sm',
      iconContainer: 'w-12 h-12',
      icon: 'w-6 h-6'
    },
    lg: {
      spinner: 'w-8 h-8',
      dots: 'w-2 h-2',
      text: 'text-lg',
      subtext: 'text-base',
      iconContainer: 'w-16 h-16',
      icon: 'w-8 h-8'
    },
    xl: {
      spinner: 'w-12 h-12',
      dots: 'w-2.5 h-2.5',
      text: 'text-xl',
      subtext: 'text-lg',
      iconContainer: 'w-20 h-20',
      icon: 'w-10 h-10'
    }
  };

  const currentSize = sizeClasses[size];

  // Dots variant
  if (variant === 'dots') {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {text && (
          <span className={`${currentSize.text} text-neural-blue-700 font-medium`}>
            {text}
          </span>
        )}
        <div className="inline-flex gap-1">
          <div className={`${currentSize.dots} bg-neural-blue-500 rounded-full animate-neural-pulse`} />
          <div className={`${currentSize.dots} bg-neural-blue-500 rounded-full animate-neural-pulse [animation-delay:0.2s]`} />
          <div className={`${currentSize.dots} bg-neural-blue-500 rounded-full animate-neural-pulse [animation-delay:0.4s]`} />
        </div>
      </div>
    );
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className={`${currentSize.spinner} text-neural-blue-600 animate-spin`} />
        {text && (
          <span className={`${currentSize.text} text-neural-blue-700 font-medium`}>
            {text}
          </span>
        )}
      </div>
    );
  }

  // Spinner variant (centered in container)
  if (variant === 'spinner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex flex-col items-center justify-center p-8 ${className}`}
      >
        <div className={`${currentSize.iconContainer} mx-auto mb-4 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 rounded-full flex items-center justify-center shadow-neural-glow`}>
          {icon || <Loader2 className={`${currentSize.icon} text-white animate-spin`} />}
        </div>
        
        {text && (
          <h3 className={`${currentSize.text} font-bold text-neural-blue-900 mb-2 text-center`}>
            {text}
          </h3>
        )}
        
        {subtext && (
          <p className={`${currentSize.subtext} text-neural-blue-600 text-center max-w-md`}>
            {subtext}
          </p>
        )}
      </motion.div>
    );
  }

  // Overlay variant (full-screen)
  if (variant === 'overlay') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            backgroundBlur ? 'bg-neural-blue-900/80 backdrop-blur-lg' : 'bg-neural-blue-900/90'
          }`}
        >
          <Card 
            variant="quantum-glass" 
            className="p-12 text-center max-w-md mx-4"
            aiPowered={true}
            neuralGlow={true}
          >
            <div className="mb-6">
              <div className={`${currentSize.iconContainer} mx-auto mb-4 bg-gradient-neural-primary rounded-full flex items-center justify-center shadow-neural-glow`}>
                {icon || <Calculator className={`${currentSize.icon} text-white animate-neural-pulse`} />}
              </div>
              
              {text && (
                <h3 className="text-headline-3 gradient-text-neural mb-2 font-display">
                  {text}
                </h3>
              )}
              
              {subtext && (
                <motion.p
                  key={subtext}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-neural-blue-600 font-medium"
                >
                  {subtext}
                </motion.p>
              )}
            </div>
            
            {/* Processing dots */}
            <div className="loading-neural-dots justify-center">
              <div className="animate-neural-pulse"></div>
              <div className="animate-neural-pulse [animation-delay:0.2s]"></div>
              <div className="animate-neural-pulse [animation-delay:0.4s]"></div>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
}

// Pre-configured variants for common use cases
export const CalculatingSpinner = (props: Partial<LoadingSpinnerProps>) => (
  <LoadingSpinner
    variant="overlay"
    size="lg"
    icon={<Calculator className="w-8 h-8 text-white animate-neural-pulse" />}
    text="Calculating Your Savings"
    {...props}
  />
);

export const AIProcessingSpinner = (props: Partial<LoadingSpinnerProps>) => (
  <LoadingSpinner
    variant="spinner"
    size="lg"
    icon={<Brain className="w-6 h-6 text-white animate-neural-pulse" />}
    text="AI Processing"
    subtext="Claude AI is analyzing your requirements..."
    {...props}
  />
);

export const SimpleLoadingDots = (props: Partial<LoadingSpinnerProps>) => (
  <LoadingSpinner
    variant="dots"
    size="sm"
    {...props}
  />
);

export const InlineSpinner = (props: Partial<LoadingSpinnerProps>) => (
  <LoadingSpinner
    variant="minimal"
    size="sm"
    {...props}
  />
); 