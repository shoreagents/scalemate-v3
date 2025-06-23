'use client';

import React from 'react';
import { motion } from 'framer-motion';

import { SCALEMATE_BRAND } from '@/lib/brand';

interface LogoProps {
  variant?: 'primary' | 'mark' | 'wordmark';
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
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.2
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
      className={`${sizeMap[size]} w-auto`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Logo Mark - Stylized "S" with growth arrow */}
      <motion.g
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.5 }}
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
          transition={{ duration: 1, delay: 0.8 }}
        />
      </motion.g>

      {/* Wordmark */}
      {variant !== 'mark' && (
        <motion.g
          initial={animated ? { opacity: 0, y: 20 } : false}
          animate={animated ? { opacity: 1, y: 0 } : false}
          transition={{ duration: 0.8, delay: 0.4 }}
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

  const LogoMark = () => (
    <svg
      viewBox="0 0 48 48"
      className={`${sizeMap[size]} w-auto`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        initial={animated ? { pathLength: 0 } : false}
        animate={animated ? { pathLength: 1 } : false}
        transition={{ duration: 1.5 }}
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
          transition={{ duration: 1, delay: 0.8 }}
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

  const LogoComponent = variant === 'mark' ? LogoMark : ScaleMateLogo;

  if (!interactive && !animated) {
    return (
      <div className={`inline-flex items-center ${className || ''}`}>
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
      className={`inline-flex items-center cursor-pointer select-none ${className || ''}`}
    >
      <LogoComponent />
    </motion.div>
  );
}; 