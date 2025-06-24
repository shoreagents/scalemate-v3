'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { PortfolioSize, ManualPortfolioData, RevenueRange } from '@/types';
import { PORTFOLIO_INDICATORS, REVENUE_RANGES, detectBusinessTier } from '@/utils/quoteCalculatorData';
import { Building, TrendingUp, Users, Target, Edit3, Calculator, ChevronDown, Sparkles, CheckCircle, ArrowRight, Zap, ArrowLeft, BarChart3, MapPin, Globe, Wifi, Check, X } from 'lucide-react';
import { EnhancedLocationSelector } from '@/components/common/EnhancedLocationSelector';

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
  currency: string;
  currency_name: string;
  languages: string;
  org: string;
}

interface ManualLocation {
  country: string;
  region: string;
  city: string;
}

interface PortfolioStepProps {
  value: PortfolioSize | '';
  manualData?: ManualPortfolioData | undefined;
  locationData?: LocationData | null;
  isLoadingLocation?: boolean;
  locationError?: string | null;
  isEditingLocation?: boolean;
  manualLocation?: ManualLocation | null;
  tempLocation?: ManualLocation;
  countryRegions?: { [key: string]: string[] };
  onLocationEditStart?: () => void;
  onLocationEditSave?: () => void;
  onLocationEditCancel?: () => void;
  onLocationReset?: () => void;
  onTempLocationChange?: (location: ManualLocation) => void;
  getEffectiveLocation?: () => LocationData | { city: string; region: string; country_name: string; } | null | undefined;
  onChange: (value: PortfolioSize | '', manualData?: ManualPortfolioData | undefined) => void;
}

export function PortfolioStep({ 
  value, 
  manualData, 
  locationData,
  isLoadingLocation = false,
  locationError,
  isEditingLocation = false,
  manualLocation,
  tempLocation,
  countryRegions = {},
  onLocationEditStart,
  onLocationEditSave,
  onLocationEditCancel,
  onLocationReset,
  onTempLocationChange,
  getEffectiveLocation,
  onChange 
}: PortfolioStepProps) {
  const [showPreciseInput, setShowPreciseInput] = useState(value === 'manual');
  const [manualInput, setManualInput] = useState<ManualPortfolioData>(
    manualData || {
      propertyCount: 0,
      currentTeamSize: 0,
      revenueRange: 'prefer-not-to-disclose'
    }
  );

  const portfolioOptions = Object.entries(PORTFOLIO_INDICATORS)
    .filter(([size]) => size !== 'manual')
    .map(([size, data]) => ({
    value: size as PortfolioSize,
    label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
    ...data
  }));

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
    
    // Auto-detect tier if we have enough data
    if (updated.propertyCount > 0 && updated.currentTeamSize > 0) {
      updated.autoDetectedTier = detectBusinessTier(updated);
    }
    
    setManualInput(updated);
    onChange('manual', updated);
  };

  const handleBackToQuickSelect = () => {
    setShowPreciseInput(false);
    onChange('');
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
        <div className="mb-6">
          <h2 className="text-headline-1 text-neutral-900 text-center">
            Tell us about your property portfolio
          </h2>
        </div>
        
        {/* Location Section with Background */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6 max-w-4xl mx-auto">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-neutral-900 mb-2">
              Where is your property management business primarily located?
            </h3>
            <p className="text-neutral-600">
              We'll use this to show you accurate cost comparisons and savings calculations in your local currency.
            </p>
          </div>
          
          {/* Horizontal Location Row */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {isLoadingLocation ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Wifi className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-neutral-700 font-medium">
                  Detecting your location...
                </span>
              </div>
            ) : locationError && !isLoadingLocation && !manualLocation ? (
              <>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
                  <Globe className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700 font-medium">
                    {locationError}
                  </span>
                </div>
                <button
                  onClick={onLocationEditStart}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Set Location Manually
                </button>
              </>
            ) : (getEffectiveLocation?.()) ? (
              <>
                {/* Location Display */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-blue-200 shadow-sm">
                  <span className="text-lg">🌏</span>
                  <span className="font-medium text-neutral-900">
                    {getEffectiveLocation?.()?.country_name}
                  </span>
                </div>
                
                {/* Change Button */}
                <button
                  onClick={onLocationEditStart}
                  className="px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium flex items-center gap-2 border border-blue-300 rounded-lg hover:bg-blue-100 bg-white shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Change Location
                </button>
                
                {manualLocation && (
                  <button
                    onClick={onLocationReset}
                    className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors"
                  >
                    Reset to auto-detected
                  </button>
                )}
              </>
            ) : null}
          </div>
          
          {/* Location Edit Modal */}
          {isEditingLocation && (
            <div className="mt-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg">
                <EnhancedLocationSelector
                  {...(tempLocation && tempLocation.country && {
                    initialLocation: {
                      country: tempLocation.country,
                      region: tempLocation.region,
                      city: tempLocation.city
                    }
                  })}
                  onLocationChange={(location: { country: string; region: string; city: string }) => {
                    onTempLocationChange?.({
                      country: location.country,
                      region: location.region,
                      city: location.city
                    });
                  }}
                  onCancel={onLocationEditCancel || (() => {})}
                  onSave={onLocationEditSave || (() => {})}
                  showPreview={false}
                />
              </div>
            </div>
          )}
        </div>
        
        <p className="text-body-large text-neutral-600">
          Select a range or provide exact details for more accurate recommendations and savings calculations.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!showPreciseInput ? (
          <motion.div
            key="quick-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Preset Portfolio Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-8">
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

                         {/* Need More Precision Card */}
             <div className="max-w-2xl mx-auto">
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
          </motion.div>
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
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 transition-all duration-200 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Properties</h4>
                </div>
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

              {/* Team Size Card */}
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 transition-all duration-200 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Team Size</h4>
                </div>
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
                <p className="text-xs text-neutral-500 mt-2">
                  Include all property management staff
                </p>
              </div>

              {/* Revenue Range Card */}
              <div className="bg-white rounded-xl border-2 border-neutral-200 p-6 transition-all duration-200 hover:border-brand-primary-300 hover:bg-brand-primary-25">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-brand-primary-600" />
                  <h4 className="text-lg font-semibold text-neutral-900">Revenue</h4>
                </div>
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
            </div>

            {/* Auto-detected Tier */}
            {manualInput.autoDetectedTier && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm"
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

                                     {/* Back to Quick Select Button */}
            <div className="mt-6 max-w-2xl mx-auto">
               <button
                 onClick={handleBackToQuickSelect}
                 className="w-full p-6 rounded-xl border-2 border-dashed border-neural-blue-300 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 hover:border-neural-blue-400 hover:from-neural-blue-100 hover:to-quantum-purple-100 transition-all duration-200 group"
               >
                 <div className="flex items-center justify-between">
                   <div className="text-left">
                     <h3 className="text-lg font-bold text-neural-blue-900 mb-1">
                       Back to quick select
                     </h3>
                     <p className="text-sm text-neural-blue-600">
                       Choose from our pre-defined portfolio size ranges instead
                     </p>
                   </div>
                   <ArrowLeft className="w-5 h-5 text-neural-blue-500 group-hover:-translate-x-1 transition-transform duration-200" />
                 </div>
               </button>
      </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 