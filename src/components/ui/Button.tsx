'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2, Brain, Zap, Target, Sparkles } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'neural-primary' | 'quantum-secondary' | 'cyber-success' | 'matrix-energy' | 'neural-ghost' | 'quantum-outline' | 'ai-destructive' | 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive';
  size?: 'neural-sm' | 'neural-md' | 'neural-lg' | 'neural-xl' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  aiProcessing?: boolean;
  neuralGlow?: boolean;
  quantumShimmer?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  aiAssisted?: boolean;
}

const sizeStyles = {
  'neural-sm': 'px-3 py-2 text-xs font-medium',
  'neural-md': 'px-4 py-2.5 text-sm font-medium',
  'neural-lg': 'px-6 py-3 text-base font-medium',
  'neural-xl': 'px-8 py-4 text-lg font-semibold',
  // Legacy sizes for backward compatibility
  sm: 'px-3 py-2 text-xs font-medium',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-semibold'
};

// Enhanced class combination function
function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'neural-primary',
  size = 'neural-md',
  loading = false,
  aiProcessing = false,
  neuralGlow = false,
  quantumShimmer = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  aiAssisted = false,
  className,
  disabled,
  ...props
}) => {
  const neuralButtonVariants = {
    initial: { scale: 1, y: 0 },
    hover: { 
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      y: 0,
      transition: { duration: 0.1 }
    },
    processing: {
      scale: [1, 1.02, 1],
      transition: { 
        duration: 2, 
        repeat: Infinity
      }
    }
  };

  const aiIconVariants = {
    initial: { rotate: 0, scale: 1 },
    hover: { 
      rotate: aiProcessing ? 360 : 0,
      scale: 1.1,
      transition: { 
        duration: aiProcessing ? 2 : 0.3,
        repeat: aiProcessing ? Infinity : 0
      }
    },
    processing: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity
      }
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl border transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';
    
    const variantClasses = {
      // Neural Design System Variants
      'neural-primary': 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white border-0 shadow-lg hover:from-neural-blue-600 hover:to-quantum-purple-600 hover:shadow-neural-glow focus:ring-neural-blue-500/50',
      'quantum-secondary': 'bg-neural-blue-50 text-neural-blue-700 border-2 border-neural-blue-200 shadow-sm hover:bg-neural-blue-100 hover:border-neural-blue-300 hover:shadow-md focus:ring-quantum-purple-500/50',
      'cyber-success': 'bg-gradient-to-r from-cyber-green-500 to-cyber-green-600 text-white border-0 shadow-lg hover:from-cyber-green-600 hover:to-cyber-green-700 hover:shadow-cyber-glow focus:ring-cyber-green-500/50',
      'matrix-energy': 'bg-gradient-to-r from-matrix-orange-500 to-matrix-orange-600 text-white border-0 shadow-lg hover:from-matrix-orange-600 hover:to-matrix-orange-700 hover:shadow-matrix-glow focus:ring-matrix-orange-500/50',
      'neural-ghost': 'bg-transparent text-neural-blue-600 border-transparent hover:bg-neural-blue-50 hover:text-neural-blue-700 hover:shadow-sm focus:ring-neural-blue-500/50',
      'quantum-outline': 'bg-transparent text-quantum-purple-600 border-2 border-quantum-purple-300 hover:bg-quantum-purple-50 hover:border-quantum-purple-400 hover:shadow-md focus:ring-quantum-purple-500/50',
      'ai-destructive': 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-red-500/30 focus:ring-red-500/50',
      
      // Legacy variants for backward compatibility
      primary: 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white border-0 shadow-lg hover:from-neural-blue-600 hover:to-quantum-purple-600 hover:shadow-neural-glow focus:ring-neural-blue-500/50',
      secondary: 'bg-neural-blue-50 text-neural-blue-700 border-2 border-neural-blue-200 shadow-sm hover:bg-neural-blue-100 hover:border-neural-blue-300 hover:shadow-md focus:ring-quantum-purple-500/50',
      accent: 'bg-gradient-to-r from-cyber-green-500 to-cyber-green-600 text-white border-0 shadow-lg hover:from-cyber-green-600 hover:to-cyber-green-700 hover:shadow-cyber-glow focus:ring-cyber-green-500/50',
      ghost: 'bg-transparent text-neural-blue-600 border-transparent hover:bg-neural-blue-50 hover:text-neural-blue-700 hover:shadow-sm focus:ring-neural-blue-500/50',
      outline: 'bg-transparent text-quantum-purple-600 border-2 border-quantum-purple-300 hover:bg-quantum-purple-50 hover:border-quantum-purple-400 hover:shadow-md focus:ring-quantum-purple-500/50',
      destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-lg hover:from-red-600 hover:to-red-700 hover:shadow-red-500/30 focus:ring-red-500/50'
    };

    return combineClasses(
      baseStyles, 
      variantClasses[variant],
      neuralGlow && 'hover:shadow-neural-glow',
      quantumShimmer && 'animate-neural-shimmer'
    );
  };

  const getProcessingIcon = () => {
    if (aiProcessing) return <Brain className="h-4 w-4" />;
    if (loading) return <Loader2 className="h-4 w-4" />;
    return null;
  };

  const shouldAnimate = !disabled && !loading && !aiProcessing;

  return (
    <motion.button
      variants={neuralButtonVariants}
      initial="initial"
      whileHover={shouldAnimate ? "hover" : "initial"}
      whileTap={shouldAnimate ? "tap" : "initial"}
      animate={aiProcessing ? "processing" : "initial"}
      className={combineClasses(
        getVariantStyles(),
        sizeStyles[size],
        fullWidth && 'w-full',
        aiProcessing && 'ai-processing',
        quantumShimmer && 'relative overflow-hidden',
        className
      )}
      disabled={disabled || loading || aiProcessing}
      {...props}
    >
      {/* Neural shimmer effect for quantum buttons */}
      {quantumShimmer && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-neural-shimmer" />
      )}
      
      {/* Left icon or processing indicator */}
      {(leftIcon || loading || aiProcessing) && (
        <motion.span
          variants={aiIconVariants}
          className="mr-2 -ml-1 relative z-10"
        >
          {getProcessingIcon() || leftIcon}
        </motion.span>
      )}
      
      {/* Button content */}
      <span className={combineClasses(
        'relative z-10',
        (loading || aiProcessing) && 'opacity-75'
      )}>
        {children}
      </span>
      
      {/* AI-assisted indicator */}
      {aiAssisted && !loading && !aiProcessing && (
        <motion.span
          className="ml-1 relative z-10"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles className="h-3 w-3 opacity-70" />
        </motion.span>
      )}
      
      {/* Right icon */}
      {rightIcon && !loading && !aiProcessing && (
        <motion.span
          variants={aiIconVariants}
          className="ml-2 -mr-1 relative z-10"
        >
          {rightIcon}
        </motion.span>
      )}
    </motion.button>
  );
}; 