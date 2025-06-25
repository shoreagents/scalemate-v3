'use client';

import React from 'react';
import { Loader2, Brain, Zap, Target, Sparkles } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  const getVariantStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden transition-all duration-300';
    
    const variantClasses = {
      // Neural Design System Variants
      'neural-primary': 'bg-gradient-to-r from-neural-blue-500 via-quantum-purple-500 to-neural-blue-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-neural-blue-500/50 bg-[length:200%_100%]',
      'quantum-secondary': 'bg-neural-blue-50 text-neural-blue-700 border-2 border-neural-blue-200 shadow-sm hover:bg-gradient-to-r hover:from-neural-blue-100 hover:via-neural-blue-50 hover:to-neural-blue-100 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-quantum-purple-500/50',
      'cyber-success': 'bg-gradient-to-r from-cyber-green-500 via-cyber-green-600 to-cyber-green-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-cyber-green-500/50 bg-[length:200%_100%]',
      'matrix-energy': 'bg-gradient-to-r from-matrix-orange-500 via-matrix-orange-600 to-matrix-orange-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-matrix-orange-500/50 bg-[length:200%_100%]',
      'neural-ghost': 'bg-transparent text-neural-blue-600 border-transparent hover:bg-gradient-to-r hover:from-neural-blue-50 hover:via-neural-blue-100 hover:to-neural-blue-50 hover:text-neural-blue-700 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-neural-blue-500/50',
      'quantum-outline': 'bg-transparent text-quantum-purple-600 border-2 border-quantum-purple-300 hover:bg-gradient-to-r hover:from-quantum-purple-50 hover:via-quantum-purple-100 hover:to-quantum-purple-50 hover:border-quantum-purple-400 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-quantum-purple-500/50',
      'ai-destructive': 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-red-500/50 bg-[length:200%_100%]',
      
      // Legacy variants for backward compatibility
      primary: 'bg-gradient-to-r from-neural-blue-500 via-quantum-purple-500 to-neural-blue-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-neural-blue-500/50 bg-[length:200%_100%]',
      secondary: 'bg-neural-blue-50 text-neural-blue-700 border-2 border-neural-blue-200 shadow-sm hover:bg-gradient-to-r hover:from-neural-blue-100 hover:via-neural-blue-50 hover:to-neural-blue-100 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-quantum-purple-500/50',
      accent: 'bg-gradient-to-r from-cyber-green-500 via-cyber-green-600 to-cyber-green-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-cyber-green-500/50 bg-[length:200%_100%]',
      ghost: 'bg-transparent text-neural-blue-600 border-transparent hover:bg-gradient-to-r hover:from-neural-blue-50 hover:via-neural-blue-100 hover:to-neural-blue-50 hover:text-neural-blue-700 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-neural-blue-500/50',
      outline: 'bg-transparent text-quantum-purple-600 border-2 border-quantum-purple-300 hover:bg-gradient-to-r hover:from-quantum-purple-50 hover:via-quantum-purple-100 hover:to-quantum-purple-50 hover:border-quantum-purple-400 hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-quantum-purple-500/50',
      destructive: 'bg-gradient-to-r from-red-500 via-red-600 to-red-500 text-white border-0 shadow-lg hover:bg-[length:200%_100%] hover:animate-gradient-x focus:ring-red-500/50 bg-[length:200%_100%]'
    };

    return combineClasses(
      baseStyles, 
      variantClasses[variant]
    );
  };

  const getProcessingIcon = () => {
    if (aiProcessing) return <Brain className="h-4 w-4" />;
    if (loading) return <Loader2 className="h-4 w-4" />;
    return null;
  };

  return (
    <button
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
        <span className="mr-2 -ml-1 relative z-10">
          {getProcessingIcon() || leftIcon}
        </span>
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
        <span className="ml-1 relative z-10">
          <Sparkles className="h-3 w-3 opacity-70" />
        </span>
      )}
      
      {/* Right icon */}
      {rightIcon && !loading && !aiProcessing && (
        <span className="ml-2 -mr-1 relative z-10">
          {rightIcon}
        </span>
      )}
    </button>
  );
}; 