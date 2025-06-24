'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SCALEMATE_BRAND } from '@/lib/brand';

interface LogoProps {
  variant?: 'primary' | 'mark' | 'wordmark' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  interactive?: boolean;
  className?: string;
}

const sizeMap = {
  xs: 'h-6',
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-20'
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'primary',
  size = 'md',
  animated = true,
  interactive = true,
  className
}) => {
  const logoVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: 0.1
      }
    }
  };

  const ScaleMateLogo = () => (
    <svg
      viewBox="0 0 200 48"
      className={cn(sizeMap[size], 'w-auto')}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Logo Mark - Stylized "S" with growth arrow */}
      <motion.g
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Main S shape */}
        <path
          d="M12 8c-4.4 0-8 3.6-8 8s3.6 8 8 8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4H8"
          stroke="url(#brandGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* Growth arrow */}
        <motion.path
          d="M28 12l8 8m0 0l-8 8m8-8H20"
          stroke="url(#accentGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : false}
          animate={animated ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
      </motion.g>

      {/* Wordmark */}
      {variant !== 'mark' && (
        <motion.g
          initial={animated ? { opacity: 0, x: -20 } : false}
          animate={animated ? { opacity: 1, x: 0 } : false}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          <text
            x="50"
            y="30"
            className="font-display font-bold text-2xl"
            fill="url(#textGradient)"
          >
            ScaleMate
          </text>
        </motion.g>
      )}

      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SCALEMATE_BRAND.visual.colors.primary[500]} />
          <stop offset="100%" stopColor={SCALEMATE_BRAND.visual.colors.secondary[500]} />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SCALEMATE_BRAND.visual.colors.accent[400]} />
          <stop offset="100%" stopColor={SCALEMATE_BRAND.visual.colors.accent[600]} />
        </linearGradient>
        <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SCALEMATE_BRAND.visual.colors.primary[600]} />
          <stop offset="100%" stopColor={SCALEMATE_BRAND.visual.colors.secondary[600]} />
        </linearGradient>
      </defs>
    </svg>
  );

  const LogoBadge = () => (
    <div className={cn(
      'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 rounded-xl flex items-center justify-center relative overflow-hidden shadow-neural-glow',
      size === 'xs' && 'h-8 w-32 px-3',
      size === 'sm' && 'h-10 w-40 px-4', 
      size === 'md' && 'h-12 w-48 px-4',
      size === 'lg' && 'h-14 w-56 px-5',
      size === 'xl' && 'h-16 w-64 px-6'
    )}>
      <span className={cn(
        'text-white font-display font-bold relative z-10',
        size === 'xs' && 'text-sm',
        size === 'sm' && 'text-base',
        size === 'md' && 'text-xl',
        size === 'lg' && 'text-2xl',
        size === 'xl' && 'text-3xl'
      )}>
        ScaleMate
      </span>
      {animated && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "linear"
          }}
        />
      )}
    </div>
  );

  const LogoMark = () => (
    <svg
      viewBox="0 0 48 48"
      className={cn(sizeMap[size], 'w-auto')}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <path
          d="M12 8c-4.4 0-8 3.6-8 8s3.6 8 8 8h8c2.2 0 4 1.8 4 4s-1.8 4-4 4H8"
          stroke="url(#brandGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <motion.path
          d="M28 12l8 8m0 0l-8 8m8-8H20"
          stroke="url(#accentGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0, opacity: 0 } : false}
          animate={animated ? { pathLength: 1, opacity: 1 } : false}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        />
      </motion.g>
      <defs>
        <linearGradient id="brandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SCALEMATE_BRAND.visual.colors.primary[500]} />
          <stop offset="100%" stopColor={SCALEMATE_BRAND.visual.colors.secondary[500]} />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={SCALEMATE_BRAND.visual.colors.accent[400]} />
          <stop offset="100%" stopColor={SCALEMATE_BRAND.visual.colors.accent[600]} />
        </linearGradient>
      </defs>
    </svg>
  );

  const LogoComponent = 
    variant === 'mark' ? LogoMark : 
    variant === 'badge' ? LogoBadge :
    ScaleMateLogo;

  if (!interactive && !animated) {
    return (
      <div className={cn('inline-flex items-center', className)}>
        <LogoComponent />
      </div>
    );
  }

  return (
    <motion.div
      variants={logoVariants}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      whileHover={interactive ? "hover" : {}}
      whileTap={interactive ? "tap" : {}}
      className={cn(
        'inline-flex items-center cursor-pointer select-none',
        className
      )}
    >
      <LogoComponent />
    </motion.div>
  );
}; 