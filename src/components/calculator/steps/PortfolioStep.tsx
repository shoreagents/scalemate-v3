'use client';

import { motion } from 'framer-motion';
import { PortfolioSize } from '@/types';
import { PORTFOLIO_INDICATORS } from '@/utils/calculator';
import { Building, TrendingUp, Users, Target } from 'lucide-react';

interface PortfolioStepProps {
  value: PortfolioSize | '';
  onChange: (value: PortfolioSize) => void;
}

export function PortfolioStep({ value, onChange }: PortfolioStepProps) {
  const portfolioOptions = Object.entries(PORTFOLIO_INDICATORS).map(([size, data]) => ({
    value: size as PortfolioSize,
    label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
    ...data
  }));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-headline-1 text-neutral-900">
            What's your portfolio size?
          </h2>
        </div>
        <p className="text-body-large text-neutral-600">
          Select the range that best matches your current property portfolio. This helps us 
          recommend the optimal team structure for your business.
        </p>
      </div>

      {/* Portfolio Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {portfolioOptions.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <motion.div
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative"
            >
              <button
                onClick={() => onChange(option.value)}
                className={`
                  w-full h-full p-6 rounded-xl border-2 text-left transition-all duration-200
                  ${isSelected 
                    ? 'border-brand-primary-500 bg-brand-primary-50 shadow-lg' 
                    : 'border-neutral-200 bg-white hover:border-brand-primary-300 hover:bg-brand-primary-25'
                  }
                `}
              >
                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-primary-500 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}

                {/* Portfolio Size */}
                <div className="mb-3">
                  <div className={`
                    text-xl font-bold mb-1
                    ${isSelected ? 'text-brand-primary-700' : 'text-neutral-900'}
                  `}>
                    {option.label}
                  </div>
                  <div className={`
                    text-sm font-medium uppercase tracking-wider
                    ${isSelected ? 'text-brand-primary-600' : 'text-neutral-500'}
                  `}>
                    {option.tier} Portfolio
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-neutral-600 mb-4">
                  {option.description}
                </p>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 rounded-lg bg-white/80">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-brand-secondary-500 mr-1" />
                      <span className="text-sm font-medium text-neutral-900">
                        {Object.values(option.recommendedTeamSize).reduce((a, b) => a + b, 0)}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500">Team Size</div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg bg-white/80">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="w-4 h-4 text-brand-accent-500 mr-1" />
                      <span className="text-sm font-medium text-neutral-900 capitalize">
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
                    ${(option.averageRevenue.min / 1000000).toFixed(1)}M - ${(option.averageRevenue.max / 1000000).toFixed(1)}M
                  </span>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

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