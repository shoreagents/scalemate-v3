'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioSize, ManualPortfolioData, PortfolioIndicator } from '@/types';

import { useQuoteCalculatorData, getDisplayCurrencyByCountry, getCurrencySymbol } from '@/hooks/useQuoteCalculatorData';
import { getDisplayCurrencyByCountryWithAPIFallback } from '@/utils/currency';
import { Building, TrendingUp, Users, ChevronDown, ArrowRight, Zap, ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LocationData, ManualLocation } from '@/types/location';

interface PortfolioStepProps {
  value: PortfolioSize | '';
  manualData?: ManualPortfolioData | undefined;
  onChange: (value: PortfolioSize | '', manualData?: ManualPortfolioData | undefined, portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>) => void;
  showPortfolioGridSkeleton?: boolean;
  
  // Data passed from parent to avoid duplicate API calls
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  isLoadingIndicators?: boolean;
  portfolioCurrency?: string;
  portfolioCurrencySymbol?: string;
  isUsingDynamicData?: boolean;
  
  // Location data for currency handling
  userLocation?: LocationData;
  manualLocation?: ManualLocation | null;
}

export function PortfolioStep({ 
  value, 
  manualData, 
  onChange,
  showPortfolioGridSkeleton = false,
  
  // Data from parent
  portfolioIndicators,
  isLoadingIndicators = false,
  portfolioCurrency,
  portfolioCurrencySymbol,
  isUsingDynamicData,
  
  // Location data
  userLocation,
  manualLocation
}: PortfolioStepProps) {
  
  const [showPreciseInput, setShowPreciseInput] = useState(value === 'manual');
  const [manualInput, setManualInput] = useState<ManualPortfolioData>(
    manualData || {
      propertyCount: 0,
      currentTeamSize: 0
    }
  );

  // Portfolio indicators now passed as props from parent to avoid duplicate API calls

  const portfolioOptions = Object.entries(portfolioIndicators)
    .filter(([size]) => size !== 'manual')
    .map(([size, data]) => ({
    value: size as PortfolioSize,
    label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
    ...data
  }));

  // Currency handling function - same pattern as RoleSelectionStep
  const getEffectiveCurrencySymbol = (userLocation?: LocationData, manualLocation?: ManualLocation | null) => {
    let currency: string;
    
    // Manual location takes priority over auto-detected location
    if (manualLocation?.country) {
      currency = getDisplayCurrencyByCountryWithAPIFallback(manualLocation.country, !isUsingDynamicData);
    } 
    // Fallback to auto-detected location if no manual selection
    else if (userLocation?.currency) {
      currency = userLocation.currency;
    }
    // Default fallback
    else {
      currency = 'USD';
    }
    
    return getCurrencySymbol(currency);
  };

  const handlePresetSelection = (portfolioSize: PortfolioSize) => {
    setShowPreciseInput(false);
    onChange(portfolioSize);
  };

  const handleShowPreciseInput = () => {
    setShowPreciseInput(true);
    onChange('manual', manualInput);
  };

  const handleManualInputChange = (field: keyof ManualPortfolioData, value: any) => {
    const updated = { ...manualInput, [field]: value };
    setManualInput(updated);
    onChange('manual', updated);
  };

  const handleBackToQuickSelect = () => {
    setShowPreciseInput(false);
    onChange('');
  };

  const getPortfolioIconColor = (tier: string) => {
    switch (tier) {
      case 'growing': return 'text-emerald-500';
      case 'large': return 'text-blue-500';
      case 'major': return 'text-purple-500';
      case 'enterprise': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  // Generate dynamic revenue options from portfolio indicators
  const getRevenueOptions = () => {
    // Use effective currency symbol (same logic as RoleSelectionStep)
    const currencySymbol = getEffectiveCurrencySymbol(userLocation, manualLocation);
    
    // Start with prefer not to disclose option
    const options: Array<{ value: number | null; label: string }> = [
      { value: null, label: 'Prefer not to disclose' }
    ];

    // Generate options based on portfolioIndicators averageRevenue
    const sortedIndicators = Object.entries(portfolioIndicators)
      .filter(([size]) => size !== 'manual')
      .sort((a, b) => a[1].min - b[1].min);

    let highestMax = 0;
    for (const [, indicator] of sortedIndicators) {
      if (indicator.averageRevenue.max > highestMax) {
        highestMax = indicator.averageRevenue.max;
      }
    }

    // Generate revenue ranges
    const ranges = [
      { min: 0, max: 100000, label: `Under ${currencySymbol}100k` },
      { min: 100000, max: 500000, label: `${currencySymbol}100k - ${currencySymbol}500k` },
      { min: 500000, max: 1000000, label: `${currencySymbol}500k - ${currencySymbol}1M` },
      { min: 1000000, max: 5000000, label: `${currencySymbol}1M - ${currencySymbol}5M` },
      { min: 5000000, max: 10000000, label: `${currencySymbol}5M - ${currencySymbol}10M` },
      { min: 10000000, max: highestMax, label: `Over ${currencySymbol}10M` }
    ];

    return [...options, ...ranges.map(range => ({ value: range.min, label: range.label }))];
  };

  return (
    <div className="mx-auto" style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-headline-1 text-neutral-900">
              Portfolio Size
            </h2>
            {/* AI Indicator beside title */}
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isUsingDynamicData 
                ? 'bg-purple-50 border border-purple-200'
                : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isLoadingIndicators 
                  ? 'bg-purple-500 animate-pulse'
                  : isUsingDynamicData 
                    ? 'bg-purple-500'
                    : 'bg-gray-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                isUsingDynamicData 
                  ? 'text-purple-700'
                  : 'text-gray-700'
              }`}>
                Powered by AI
              </span>
            </div>
          </div>
          
          <p className="text-body-large text-neutral-600">
            Tell us about your property portfolio size and management structure.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
        </motion.div>
        
        <div className="text-center mt-8 mb-6">
          {/* Instructional text removed as requested */}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showPreciseInput ? (
          <div key="quick-select">
            {/* Preset Portfolio Options or Skeleton */}
            {showPortfolioGridSkeleton ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 auto-rows-fr">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative h-full">
                    <div className="w-full h-full p-6 rounded-xl border-2 border-neutral-200 bg-white flex flex-col">
                      {/* Portfolio Size - Fixed Height */}
                      <div className="mb-4">
                        <div className="h-6 bg-gray-200 rounded mb-1 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
                      </div>
                      {/* Description - Auto-adjusting Container */}
                      <div className="flex-1 mb-4">
                        <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                      </div>
                      {/* Stats Grid - Fixed Position */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 rounded-lg bg-white/80">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse" />
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/80">
                          <div className="flex items-center justify-center mb-1">
                            <div className="w-4 h-4 bg-gray-200 rounded mr-1 animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-20 mx-auto animate-pulse" />
                        </div>
                      </div>
                      {/* Revenue Range - Fixed Position at Bottom */}
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 auto-rows-fr">
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
                          w-full h-full p-6 rounded-xl border-2 text-left flex flex-col
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
                        {/* Portfolio Size - Fixed Height */}
                        <div className="mb-4">
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
                        {/* Description - Auto-adjusting Container */}
                        <div className="flex-1 mb-4 flex items-start">
                          <p className="text-sm text-neutral-600 leading-relaxed">
                            {option.description}
                          </p>
                        </div>
                        {/* Stats Grid - Fixed Position */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center p-3 rounded-lg bg-white/80">
                            <div className="flex items-center justify-center mb-1">
                              <Users className={`w-4 h-4 mr-1 ${getPortfolioIconColor(option.tier)}`} />
                              <span className="text-sm font-medium text-neutral-900">
                                {Object.values(option.recommendedTeamSize).reduce((a, b) => a + b, 0)}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">Team Size</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/80">
                            <div className="flex items-center justify-center mb-1">
                              <Zap className={`w-4 h-4 mr-1 flex-shrink-0 ${getPortfolioIconColor(option.tier)}`} />
                              <span className="text-sm font-medium text-neutral-900 capitalize">
                                {option.implementationComplexity}
                              </span>
                            </div>
                            <div className="text-xs text-neutral-500">Complexity</div>
                          </div>
                        </div>
                        {/* Revenue Range - Fixed Position at Bottom */}
                        <div className="pt-3 border-t border-neutral-100 text-xs text-neutral-500">
                          <span>Revenue Range:</span>
                          <div className="font-bold mt-1">
                            {getEffectiveCurrencySymbol(userLocation, manualLocation)}{option.averageRevenue.min.toLocaleString(undefined, { maximumFractionDigits: 0 })} - {getEffectiveCurrencySymbol(userLocation, manualLocation)}{option.averageRevenue.max.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
            {/* Need More Precision Card */}
            <button
              onClick={handleShowPreciseInput}
              className="w-full p-6 rounded-xl border-2 border-dashed border-neural-blue-300 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 hover:border-neural-blue-400 hover:from-neural-blue-100 hover:to-quantum-purple-100 transition-colors transition-background duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-lg font-bold text-neural-blue-900 mb-1">
                    Want more accurate results?
                  </h3>
                  <p className="text-sm text-neural-blue-600">
                    Tell us your exact numbers for personalized recommendations and precise savings estimates
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-neural-blue-500 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </button>
          </div>
        ) : (
          <motion.div
            key="precise-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-primary-600" />
                <h3 className="text-xl font-bold text-neutral-900">Precise Portfolio Details</h3>
              </div>
              <p className="text-sm text-neutral-600">
                Provide your exact numbers for the most accurate analysis and recommendations.
              </p>
            </div>

            {/* Three Input Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Property Count Card */}
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Property Count</h4>
                </div>
                <input
                  type="number"
                  value={manualInput.propertyCount || ''}
                  onChange={(e) => handleManualInputChange('propertyCount', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-neutral-300 rounded-lg text-lg font-medium text-neutral-900 focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 transition-colors"
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-neutral-500 mt-2">Total properties under management</p>
              </div>

              {/* Current Team Size Card */}
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Current Team Size</h4>
                </div>
                <input
                  type="number"
                  value={manualInput.currentTeamSize || ''}
                  onChange={(e) => handleManualInputChange('currentTeamSize', parseInt(e.target.value) || 0)}
                  className="w-full p-3 border border-neutral-300 rounded-lg text-lg font-medium text-neutral-900 focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 transition-colors"
                  placeholder="0"
                  min="0"
                />
                <p className="text-sm text-neutral-500 mt-2">Full-time employees currently</p>
              </div>

              {/* Annual Revenue Card */}
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Annual Revenue</h4>
                </div>
                <select
                  value={manualInput.annualRevenue || ''}
                  onChange={(e) => handleManualInputChange('annualRevenue', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full p-3 border border-neutral-300 rounded-lg text-lg font-medium text-neutral-900 focus:border-brand-primary-500 focus:ring-2 focus:ring-brand-primary-200 transition-colors"
                >
                  <option value="">Select range...</option>
                  {getRevenueOptions().map((option) => (
                    <option key={option.label} value={option.value || ''}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-neutral-500 mt-2">Annual revenue range</p>
              </div>
            </div>

            {/* Back to Quick Select Button */}
            <div className="text-center">
              <button
                onClick={handleBackToQuickSelect}
                className="text-brand-primary-600 hover:text-brand-primary-700 font-medium flex items-center gap-2 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Quick Select
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 