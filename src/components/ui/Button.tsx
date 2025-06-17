'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
  glow?: boolean;
}

const sizeStyles = {
  sm: 'px-3 py-2 text-xs font-medium',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-medium',
  xl: 'px-8 py-4 text-lg font-semibold'
};

// Simple class combination function
function combineClasses(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  fullWidth = false,
  glow = false,
  className,
  disabled,
  ...props
}) => {
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeInOut" }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    loading: {
      scale: [1, 1.02, 1],
      transition: { 
        duration: 1.5, 
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    initial: { rotate: 0 },
    hover: { 
      rotate: loading ? 360 : 0,
      transition: { 
        duration: loading ? 1 : 0.3,
        repeat: loading ? Infinity : 0,
        ease: "linear"
      }
    }
  };

  const getVariantStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg border transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-brand-primary-500 text-white border-brand-primary-500 hover:bg-brand-primary-600 hover:border-brand-primary-600 active:bg-brand-primary-700 active:border-brand-primary-700 focus:ring-brand-primary-300',
      secondary: 'bg-brand-primary-50 text-brand-primary-700 border-brand-primary-200 hover:bg-brand-primary-100 hover:border-brand-primary-300 active:bg-brand-primary-200 active:border-brand-primary-400 focus:ring-brand-primary-300',
      accent: 'bg-brand-accent-500 text-white border-brand-accent-500 hover:bg-brand-accent-600 hover:border-brand-accent-600 active:bg-brand-accent-700 active:border-brand-accent-700 focus:ring-brand-accent-300',
      ghost: 'bg-transparent text-brand-primary-600 border-transparent hover:bg-brand-primary-50 hover:text-brand-primary-700 active:bg-brand-primary-100 active:text-brand-primary-800 focus:ring-brand-primary-300',
      outline: 'bg-transparent text-brand-primary-600 border-brand-primary-300 hover:bg-brand-primary-50 hover:border-brand-primary-400 active:bg-brand-primary-100 active:border-brand-primary-500 focus:ring-brand-primary-300',
      destructive: 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600 active:bg-red-700 active:border-red-700 focus:ring-red-300'
    };

    return combineClasses(
      baseStyles, 
      variantClasses[variant],
      glow && 'hover:shadow-lg'
    );
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={!disabled && !loading ? "hover" : "initial"}
      whileTap={!disabled && !loading ? "tap" : "initial"}
      animate={loading ? "loading" : "initial"}
      className={combineClasses(
        getVariantStyles(),
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && !loading && (
        <motion.span
          variants={iconVariants}
          className="mr-2 -ml-1"
        >
          {leftIcon}
        </motion.span>
      )}
      
      {loading && (
        <motion.span
          variants={iconVariants}
          className="mr-2 -ml-1"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
        </motion.span>
      )}
      
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
      
      {rightIcon && !loading && (
        <motion.span
          variants={iconVariants}
          className="ml-2 -mr-1"
        >
          {rightIcon}
        </motion.span>
      )}
    </motion.button>
  );
}; 