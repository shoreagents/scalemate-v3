'use client';

import { motion } from 'framer-motion';
import { PortfolioSize } from '@/types';
import { PORTFOLIO_INDICATORS } from '@/utils/calculator/data';
import { useCalculatorData } from '@/hooks/useCalculatorData';
import { Card } from '@/components/ui/Card';
import { Building, Users, Target, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface PortfolioStepProps {
  value: PortfolioSize | '';
  onChange: (value: PortfolioSize) => void;
}

export function PortfolioStep({ value, onChange }: PortfolioStepProps) {
  const { 
    location, 
    portfolioData,
    isLoading, 
    error,
    isAIGenerated,
    refetch
  } = useCalculatorData();

  const descriptionsRef = useRef<HTMLParagraphElement[]>([]);

  // Equalize description heights
  useEffect(() => {
    if (!isLoading && descriptionsRef.current.length > 0) {
      // Reset heights first
      descriptionsRef.current.forEach(desc => {
        desc.style.height = 'auto';
      });
      
      // Calculate max height
      const maxHeight = Math.max(
        ...descriptionsRef.current.map(desc => desc.scrollHeight)
      );
      
      // Set all descriptions to max height
      descriptionsRef.current.forEach(desc => {
        desc.style.height = `${maxHeight}px`;
      });
    }
  }, [isLoading, portfolioData]);

  // Animation variants - same as home page
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Use AI-generated portfolio data if available, otherwise fallback to static data
  const dataSource = portfolioData || PORTFOLIO_INDICATORS;
  
  const portfolioOptions = Object.entries(dataSource).map(([size, data]) => ({
    value: size as PortfolioSize,
    label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
    ...data
  }));

  return (
    <div className="mx-auto" style={{ maxWidth: '100%' }}>
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <motion.div 
          className="flex items-center justify-center gap-3 mb-4"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-headline-1 text-neutral-900">
            What's your portfolio size?
          </h2>
        </motion.div>
        
        <motion.p 
          className="text-body-large text-neutral-600"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          Select the range that best matches your current property portfolio. This helps us 
          recommend the optimal team structure for your business.
        </motion.p>
      </motion.div>

      {/* Portfolio Options */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {isLoading ? (
          // Skeleton cards while loading
          Array.from({ length: 4 }).map((_, index) => (
            <motion.div
              key={`skeleton-${index}`}
              variants={fadeInUp}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              className="relative"
            >
              <div className="w-full h-full p-6 rounded-xl border-2 border-neutral-200 bg-white">
                {/* Skeleton for Portfolio Size */}
                <div className="mb-3">
                  <div className="h-6 bg-neutral-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-neutral-150 rounded animate-pulse w-3/4"></div>
                </div>

                {/* Skeleton for Description */}
                <div className="mb-4">
                  <div className="h-3 bg-neutral-150 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-neutral-150 rounded animate-pulse mb-1 w-5/6"></div>
                  <div className="h-3 bg-neutral-150 rounded animate-pulse w-2/3"></div>
                </div>

                {/* Skeleton for Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-neutral-100">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-neutral-150 rounded animate-pulse w-3/4 mx-auto"></div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-neutral-100">
                    <div className="h-4 bg-neutral-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-neutral-150 rounded animate-pulse w-3/4 mx-auto"></div>
                  </div>
                </div>

                {/* Skeleton for Revenue Range */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <div className="h-3 bg-neutral-150 rounded animate-pulse w-1/3"></div>
                  <div className="h-3 bg-neutral-150 rounded animate-pulse w-1/4"></div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          portfolioOptions.map((option, index) => {
          const isSelected = value === option.value;
          
          return (
            <motion.div
              key={option.value}
                variants={fadeInUp}
                transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                className="relative h-full"
            >
                <div
                  tabIndex={0}
                  data-portfolio={option.value}
                  className={`h-full cursor-pointer transition-all duration-200 relative overflow-hidden rounded-2xl p-8 grid grid-rows-[auto_auto_1fr_auto] border ${isSelected 
                    ? 'bg-brand-primary-50 shadow border-brand-primary-400' 
                    : 'bg-white border-brand-primary-100 shadow hover:bg-brand-primary-25 hover:border-brand-primary-200 hover:shadow-neural-glow focus:shadow-neural-glow focus:border-brand-primary-300'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChange(option.value);
                    }
                  }}
                >

                {/* Portfolio Size */}
                <div className="mb-3">
                    <div className="text-xl font-bold mb-1 text-neutral-900">
                    {option.label}
                  </div>
                    <div className="text-sm font-medium uppercase tracking-wider text-neutral-500">
                    {option.tier} Portfolio
                  </div>
                </div>

                {/* Description */}
                  <p 
                    ref={(el) => {
                      if (el) descriptionsRef.current[index] = el;
                    }}
                    className="text-sm text-neutral-600 mb-4"
                  >
                  {option.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-center mb-1">
                        <Users className={`w-4 h-4 mr-1 ${
                          option.implementationComplexity === 'basic' ? 'text-green-600' :
                          option.implementationComplexity === 'intermediate' ? 'text-yellow-600' :
                          option.implementationComplexity === 'advanced' ? 'text-orange-600' :
                          option.implementationComplexity === 'enterprise' ? 'text-red-600' :
                          'text-brand-secondary-500'
                        }`} />
                      <span className="text-sm font-medium text-neutral-900">
                        {Object.values(option.recommendedTeamSize).reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">Team Size</div>
                  </div>
                  
                    <div className="text-center p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                    <div className="flex items-center justify-center mb-1">
                        <span className={`text-sm font-medium capitalize ${
                          option.implementationComplexity === 'basic' ? 'text-green-700' :
                          option.implementationComplexity === 'intermediate' ? 'text-yellow-700' :
                          option.implementationComplexity === 'advanced' ? 'text-orange-700' :
                          option.implementationComplexity === 'enterprise' ? 'text-red-700' :
                          'text-neutral-900'
                        }`}>
                        {option.implementationComplexity}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">Complexity</div>
                  </div>
                </div>

                {/* Revenue Range */}
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                  <span>Revenue Range:</span>
                  <span className="font-medium">
                    {(location?.currency && location.currency !== 'Unknown') ? location.currency : '$'}{(option.averageRevenue.min / 1000000).toFixed(1)}M - {(location?.currency && location.currency !== 'Unknown') ? location.currency : '$'}{(option.averageRevenue.max / 1000000).toFixed(1)}M
                  </span>
                </div>

                </div>
            </motion.div>
          );
          })
        )}
      </motion.div>

      {/* Help Text */}
      <div className="mt-8 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-brand-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-brand-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-neutral-900 mb-1">
              Don't see your exact size?
            </h4>
            <p className="text-sm text-neutral-600">
              Choose the closest option. Our calculations will provide accurate estimates regardless 
              of your exact portfolio size within the selected range.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 