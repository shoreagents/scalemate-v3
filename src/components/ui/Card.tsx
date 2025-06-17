'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Brain, Sparkles, Zap } from 'lucide-react';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  variant?: 'neural-elevated' | 'quantum-glass' | 'neural-gradient' | 'ai-feature' | 'cyber-data' | 'elevated' | 'glass' | 'brand';
  children: React.ReactNode;
  aiPowered?: boolean;
  neuralGlow?: boolean;
  quantumMorph?: boolean;
  hoverLift?: boolean;
  className?: string;
}

// Enhanced class combination function
function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function Card({ 
  variant = 'neural-elevated',
  children, 
  aiPowered = false,
  neuralGlow = false,
  quantumMorph = false,
  hoverLift = true,
  className = '', 
  ...props 
}: CardProps) {
  const neuralCardVariants = {
    initial: { 
      scale: 1, 
      y: 0,
      rotateX: 0
    },
    hover: { 
      scale: hoverLift ? 1.02 : 1,
      y: hoverLift ? -4 : 0,
      rotateX: quantumMorph ? 2 : 0,
      transition: { 
        duration: 0.3, 
        ease: "easeOut" 
      }
    },
    tap: {
      scale: 0.98,
      transition: { duration: 0.1 }
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'transition-all duration-300 relative';
    
    const variantClasses = {
      // Neural Design System Variants
      'neural-elevated': 'bg-white rounded-2xl border border-neural-blue-100 shadow-lg hover:shadow-neural-glow backdrop-blur-sm',
      'quantum-glass': 'bg-gradient-to-br from-white/90 to-neural-blue-50/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl hover:shadow-quantum-glow',
      'neural-gradient': 'bg-gradient-to-br from-neural-blue-500 via-quantum-purple-500 to-neural-blue-600 rounded-2xl text-white shadow-neural-glow hover:shadow-2xl',
      'ai-feature': 'bg-white border border-neural-blue-100 rounded-2xl p-8 shadow-md hover:shadow-neural-glow hover:border-neural-blue-300 overflow-hidden',
      'cyber-data': 'bg-gradient-to-br from-cyber-green-50 to-white border border-cyber-green-200 rounded-2xl shadow-md hover:shadow-cyber-glow',
      
      // Legacy variants for backward compatibility  
      'elevated': 'bg-white rounded-2xl border border-neural-blue-100 shadow-lg hover:shadow-neural-glow backdrop-blur-sm',
      'glass': 'bg-gradient-to-br from-white/90 to-neural-blue-50/80 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl hover:shadow-quantum-glow',
      'brand': 'bg-gradient-to-br from-neural-blue-500 via-quantum-purple-500 to-neural-blue-600 rounded-2xl text-white shadow-neural-glow hover:shadow-2xl'
    };

    return combineClasses(
      baseStyles,
      variantClasses[variant],
      neuralGlow && 'hover:shadow-neural-glow',
      quantumMorph && 'animate-quantum-morph'
    );
  };

  return (
    <motion.div
      variants={neuralCardVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      className={combineClasses(
        getVariantStyles(),
        className
      )}
      {...props}
    >
      {/* AI gradient overlay for feature cards */}
      {variant === 'ai-feature' && (
        <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-50/50 to-quantum-purple-50/50 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      )}
      
      {/* Neural shimmer effect */}
      {neuralGlow && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-500/5 to-transparent animate-neural-shimmer rounded-2xl" />
      )}
      
      {/* AI-powered indicator */}
      {aiPowered && (
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white text-xs font-medium rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Brain className="h-3 w-3 animate-neural-pulse" />
            <span>AI-Powered</span>
          </motion.div>
        </div>
      )}
      
      {/* Card content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Quantum morph indicator */}
      {quantumMorph && (
        <div className="absolute bottom-2 right-2 z-10">
          <Sparkles className="h-4 w-4 text-quantum-purple-400 animate-neural-pulse opacity-60" />
        </div>
      )}
    </motion.div>
  );
} 