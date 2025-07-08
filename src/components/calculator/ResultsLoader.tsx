import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator } from 'lucide-react';
import { Card } from '../ui/Card';

interface LoadingSpinnerProps {
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
  text,
  subtext,
  icon,
  show = true,
  className = '',
  backgroundBlur = true
}: LoadingSpinnerProps) {
  if (!show) return null;

  // Disable scroll when overlay is shown
  useEffect(() => {
    if (show) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [show]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[999999] flex items-center justify-center ${
          backgroundBlur ? 'bg-neural-blue-900/80 backdrop-blur-lg' : 'bg-neural-blue-900/90'
        }`}
        style={{ isolation: 'isolate' }}
      >
        <Card 
          variant="quantum-glass" 
          className="p-8 text-center w-[400px] h-[320px] flex flex-col justify-center items-center"
          aiPowered={true}
          neuralGlow={true}
        >
          {/* Main Content */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-neural-primary rounded-full flex items-center justify-center shadow-neural-glow">
              {icon || <Calculator className="w-10 h-10 text-white animate-neural-pulse" />}
            </div>
            
            {/* Fixed Heading */}
            <h2 className="text-3xl gradient-text-neural mb-1 font-display font-medium">
              Calculating Your Savings
            </h2>
            
            {/* Animated processing stage text */}
            <AnimatePresence mode="wait">
              {text && (
                <motion.h3
                  key={text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-s text-neural-blue-700 font-medium"
                >
                  {text}
                </motion.h3>
              )}
            </AnimatePresence>
            
            {subtext && (
              <motion.p
                key={subtext}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-neural-blue-600 text-center leading-tight"
              >
                {subtext}
              </motion.p>
            )}
          </div>
          
          {/* Processing dots at bottom */}
          <div className="flex justify-center items-center gap-1 mt-9">
            <div className="w-2 h-2 bg-neural-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-neural-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-neural-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

