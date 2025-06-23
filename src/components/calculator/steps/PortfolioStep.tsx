'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PortfolioSize, BusinessTier } from '@/types';
import { PORTFOLIO_INDICATORS } from '@/utils/calculator/data';
import { Building, Users, Target, Edit3, ChevronDown, CheckCircle, Sparkles } from 'lucide-react';

// Define missing types for manual portfolio data
type RevenueRange = 
  | 'under-1m'
  | '1m-5m'
  | '5m-10m'
  | '10m-25m'
  | '25m-50m'
  | '50m-100m'
  | 'over-100m'
  | 'prefer-not-to-disclose';

interface ManualPortfolioData {
  propertyCount: number;
  currentTeamSize: number;
  revenueRange: RevenueRange;
  autoDetectedTier?: BusinessTier;
}

// Define revenue ranges
const REVENUE_RANGES: Record<RevenueRange, { label: string }> = {
  'under-1m': { label: 'Under $1M' },
  '1m-5m': { label: '$1M - $5M' },
  '5m-10m': { label: '$5M - $10M' },
  '10m-25m': { label: '$10M - $25M' },
  '25m-50m': { label: '$25M - $50M' },
  '50m-100m': { label: '$50M - $100M' },
  'over-100m': { label: 'Over $100M' },
  'prefer-not-to-disclose': { label: 'Prefer not to disclose' }
};

// Business tier detection function
const detectBusinessTier = (data: ManualPortfolioData): BusinessTier => {
  if (data.propertyCount < 100) return 'growing';
  if (data.propertyCount < 500) return 'large';
  if (data.propertyCount < 2000) return 'major';
  return 'enterprise';
};

interface PortfolioStepProps {
  value: PortfolioSize | '';
  manualData?: ManualPortfolioData | undefined;
  onChange: (value: PortfolioSize | '', manualData?: ManualPortfolioData | undefined) => void;
}

export function PortfolioStep({ value, manualData, onChange }: PortfolioStepProps) {
  const [isManualMode, setIsManualMode] = useState(value === 'manual');
  const [manualInput, setManualInput] = useState<ManualPortfolioData>(
    manualData || {
      propertyCount: 0,
      currentTeamSize: 0,
      revenueRange: 'prefer-not-to-disclose'
    }
  );

  const portfolioOptions = Object.entries(PORTFOLIO_INDICATORS)
    .filter(([size]) => size !== 'manual')
    .map(([size, data]: [string, any]) => ({
      value: size as PortfolioSize,
      label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
      tier: data.tier,
      description: data.description,
      recommendedTeamSize: data.recommendedTeamSize || {},
      implementationComplexity: data.implementationComplexity,
      averageRevenue: data.averageRevenue || { min: 0, max: 0 }
    }));

  const handlePresetSelection = (portfolioSize: PortfolioSize) => {
    setIsManualMode(false);
    onChange(portfolioSize);
  };

  const handleModeSwitch = (toManualMode: boolean) => {
    // Avoid unnecessary state updates
    if (toManualMode === isManualMode) return;
    
    if (toManualMode) {
      setIsManualMode(true);
      onChange('manual', manualInput);
    } else {
      setIsManualMode(false);
      // Clear selection when switching back to quick select - no auto-selection
      onChange('');
    }
  };

  const handleManualInputChange = (field: keyof ManualPortfolioData, value: any) => {
    const updated = { ...manualInput, [field]: value };
    
    // Auto-detect tier if we have enough data
    if (updated.propertyCount > 0 && updated.currentTeamSize > 0) {
      updated.autoDetectedTier = detectBusinessTier(updated);
    }
    
    setManualInput(updated);
    onChange('manual', updated);
  };

  const getTierDisplayName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'growing': return 'text-green-600 bg-green-50 border-green-200';
      case 'large': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'major': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'enterprise': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '1400px' }}>
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
          Select a range or provide exact details for more accurate recommendations and savings calculations.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-white border border-neutral-200 rounded-lg p-1 flex">
          <button
            onClick={() => handleModeSwitch(false)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              !isManualMode 
                ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Quick Select
          </button>
          <button
            onClick={() => handleModeSwitch(true)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isManualMode 
                ? 'bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white shadow-neural-glow' 
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Precise Input
          </button>
        </div>
      </div>

      {!isManualMode ? (
        /* Preset Portfolio Options */
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
                  onClick={() => handlePresetSelection(option.value)}
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
                          {String(Object.values(option.recommendedTeamSize).reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0))}
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
      ) : (
        /* Manual Input Form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl border-2 border-neutral-200 p-8 shadow-lg transition-all duration-200 hover:border-brand-primary-300 hover:bg-brand-primary-25">
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Edit3 className="w-5 h-5 text-brand-primary-600" />
                <h3 className="text-xl font-bold text-neutral-900">Precise Portfolio Details</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Provide your exact numbers for the most accurate analysis and recommendations.
              </p>
            </div>

            <div className="space-y-6">
              {/* Property Count */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Number of Properties <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 1,250"
                  value={manualInput.propertyCount || ''}
                  onChange={(e) => handleManualInputChange('propertyCount', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors"
                />
              </div>

              {/* Current Team Size */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Current Team Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g., 8"
                  value={manualInput.currentTeamSize || ''}
                  onChange={(e) => handleManualInputChange('currentTeamSize', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  Include all property management staff (full-time and part-time)
                </p>
              </div>

              {/* Revenue Range */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Annual Revenue Range (Optional)
                </label>
                <div className="relative">
                  <select
                    value={manualInput.revenueRange}
                    onChange={(e) => handleManualInputChange('revenueRange', e.target.value as RevenueRange)}
                    className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors appearance-none bg-white"
                  >
                    {Object.entries(REVENUE_RANGES).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
              </div>

              {/* Auto-detected Tier */}
              {manualInput.autoDetectedTier && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="text-sm font-semibold text-green-800">
                          Business Tier Detected
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-green-700">
                          Your portfolio qualifies as:
                        </span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 shadow-sm ${getTierColor(manualInput.autoDetectedTier)}`}>
                          {getTierDisplayName(manualInput.autoDetectedTier)} Portfolio
                        </span>
                      </div>
                      <p className="text-xs text-green-600 leading-relaxed">
                        This classification helps us provide the most relevant recommendations, 
                        cost estimates, and implementation strategies tailored to your business size.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

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
              {isManualMode ? 'Why do we need this information?' : 'Need more precision?'}
            </h4>
            <p className="text-sm text-neutral-600">
              {isManualMode 
                ? 'Your exact portfolio size and team details help us provide accurate cost savings calculations and tailored implementation recommendations.'
                : 'Use "Precise Input" for exact property counts and team sizes to get the most accurate analysis and recommendations.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 