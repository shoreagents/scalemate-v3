'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PortfolioSize, ManualPortfolioData, PortfolioIndicator } from '@/types';
import { ManualLocation, IPLocationData } from '@/types/location';

import { useQuoteCalculatorData, getCurrencyByCountry, getCurrencySymbol } from '@/hooks/useQuoteCalculatorData';
import { Building, TrendingUp, Users, Edit3, ChevronDown, ArrowRight, Zap, ArrowLeft, BarChart3, Globe } from 'lucide-react';
import { LocationSelector } from '@/components/common/LocationSelector';
import { Button } from '@/components/ui/Button';

interface PortfolioStepProps {
  value: PortfolioSize | '';
  manualData?: ManualPortfolioData | undefined;
  locationData?: IPLocationData | null;
  isLoadingLocation?: boolean;
  locationError?: string | null;
  isEditingLocation?: boolean;
  manualLocation?: ManualLocation | null;
  tempLocation?: ManualLocation;

  onLocationEditStart?: () => void;
  onLocationEditSave?: () => void;
  onLocationEditCancel?: () => void;
  onLocationReset?: () => void;
  onTempLocationChange?: (location: ManualLocation) => void;
  getEffectiveLocation?: () => IPLocationData | { country_name: string; country: string; currency: string; currencySymbol: string; } | null | undefined;
  onChange: (value: PortfolioSize | '', manualData?: ManualPortfolioData | undefined, portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>) => void;
  showPortfolioGridSkeleton?: boolean;
  
  // Data passed from parent to avoid duplicate API calls
  portfolioIndicators: Record<PortfolioSize, PortfolioIndicator>;
  isLoadingIndicators?: boolean;
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

  onLocationEditStart,
  onLocationEditSave,
  onLocationEditCancel,
  onLocationReset,
  onTempLocationChange,
  getEffectiveLocation,
  onChange,
  showPortfolioGridSkeleton = false,
  
  // Data from parent
  portfolioIndicators,
  isLoadingIndicators = false
}: PortfolioStepProps) {
  
  // Debug logging (can be removed in production)
  // console.log('🔄 PortfolioStep render:', { isEditingLocation, manualLocation: manualLocation?.country || 'none' });

  const [showPreciseInput, setShowPreciseInput] = useState(value === 'manual');
  const [manualInput, setManualInput] = useState<ManualPortfolioData>(
    manualData || {
      propertyCount: 0,
      currentTeamSize: 0
    }
  );

  // Transform IPLocationData to LocationData with useMemo to prevent recreation
  const transformedLocationData = useMemo(() => {
    const result = locationData ? {
    country: locationData.country_code,
    countryName: locationData.country_name,
    currency: locationData.currency,
    currencySymbol: getCurrencySymbol(locationData.currency),
    detected: true
  } : locationData;

    // console.log('🔍 PortfolioStep transformedLocationData MEMO:', result?.countryName || 'none');
    
    return result;
  }, [locationData?.country_code, locationData?.country_name, locationData?.currency]);
  
  // Tracking effects (can be removed in production)
  // useEffect(() => { console.log('🔄 transformedLocationData changed:', transformedLocationData?.countryName || 'none'); }, [transformedLocationData]);
  // useEffect(() => { console.log('🔄 manualLocation changed:', manualLocation?.country || 'none'); }, [manualLocation]);

  // Memoized callback for location changes to prevent infinite loops
  const handleLocationChange = useCallback((location: { country: string }) => {
    onTempLocationChange?.({
      country: location.country,
      currency: getCurrencyByCountry(location.country)
    });
  }, [onTempLocationChange]);

  // Portfolio indicators now passed as props from parent to avoid duplicate API calls

  const portfolioOptions = Object.entries(portfolioIndicators)
    .filter(([size]) => size !== 'manual')
    .map(([size, data]) => ({
    value: size as PortfolioSize,
    label: `${data.min}${data.max === 99999 ? '+' : `-${data.max}`} Properties`,
    ...data
  }));

  // Note: Removed useEffect that called onChange when portfolioIndicators changed
  // This was causing infinite re-renders because the parent already has access to portfolioIndicators
  // via the useQuoteCalculatorData hook and doesn't need them passed back via onChange

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





  const getEffectiveCurrencySymbol = (locationData?: IPLocationData | null, manualLocation?: ManualLocation | null) => {
    // If portfolio indicators are still loading, return placeholder or loading state
    if (isLoadingIndicators) {
      return '$'; // Return default until API completes
    }
    
    // Disabled automatic currency detection from portfolio data as it's unreliable
    // Always use location-based detection for accuracy
    
    let currency: string;
    
    // Fallback to location-based detection
    // Manual location takes priority over auto-detected location
    if (manualLocation?.country) {
      currency = getCurrencyByCountry(manualLocation.country);
    } 
    // Fallback to auto-detected location if no manual selection
    else if (locationData?.currency) {
      currency = locationData.currency;
    }
    // Default fallback
    else {
      currency = 'USD';
    }
    
    return getCurrencySymbol(currency);
  };

  // Generate dynamic revenue options from portfolio indicators
  const getRevenueOptions = () => {
    const currencySymbol = getEffectiveCurrencySymbol(locationData, manualLocation);
    
    // Start with prefer not to disclose option
    const options: Array<{ value: number | null; label: string }> = [
      { value: null, label: 'Prefer not to disclose' }
    ];

    // Generate options based on portfolioIndicators averageRevenue
    const sortedIndicators = Object.entries(portfolioIndicators)
      .filter(([size]) => size !== 'manual')
      .sort((a, b) => a[1].min - b[1].min);

    let highestMax = 0;

    sortedIndicators.forEach(([size, indicator]) => {
      const minM = (indicator.averageRevenue.min / 1000000);
      const maxM = (indicator.averageRevenue.max / 1000000);
      
      // Track the highest maximum revenue for the + option
      if (indicator.averageRevenue.max > highestMax) {
        highestMax = indicator.averageRevenue.max;
      }
      
      // Create label based on actual averageRevenue from portfolio indicators - always show range
      const label = `${currencySymbol}${minM.toFixed(1)}M - ${currencySymbol}${maxM.toFixed(1)}M`;
      
      // Use the average of min and max as the stored value
      const avgRevenue = (indicator.averageRevenue.min + indicator.averageRevenue.max) / 2;
      
      options.push({ value: avgRevenue, label });
    });

    // Add "+ option" for amounts higher than the highest maximum
    if (highestMax > 0) {
      const highestMaxM = (highestMax / 1000000);
      const plusLabel = `${currencySymbol}${highestMaxM.toFixed(1)}M+`;
      // Use 1.5x the highest max as the stored value for the + option
      const plusValue = highestMax * 1.5;
      
      options.push({ value: plusValue, label: plusLabel });
    }

    return options;
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-xl bg-neural-blue-50/30 border border-neural-blue-100/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          
          <div className="relative z-10">
          <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-neural-blue-900 mb-2">
              Where is your property management business primarily located?
            </h3>
              <p className="text-sm text-gray-800">
              We'll use this to show you accurate cost comparisons and savings calculations in your local currency.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {/* Location Display or Error/Loading */}
            {getEffectiveLocation?.() ? (
              <>
                {/* Location Display */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neural-blue-200 shadow-sm">
                  <span className="text-lg">🌏</span>
                  <span className="font-medium text-neutral-900">
                    {getEffectiveLocation?.()?.country_name}
                  </span>
                </div>
                
                {/* Change Button */}
                <button
                  onClick={onLocationEditStart}
                    className="px-4 py-2 text-neural-blue-600 hover:text-neural-blue-700 transition-colors font-medium flex items-center gap-2 border border-neural-blue-300 rounded-lg hover:bg-neural-blue-100 bg-white shadow-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  Change Location
                </button>
                
                {manualLocation && (
                  <button
                    onClick={onLocationReset}
                    className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors"
                  >
                    Use Current Location
                  </button>
                )}
              </>
            ) : (
              <>
                {/* Error or Loading State */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
                  {isLoadingLocation ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-neural-blue-500 border-t-transparent"></div>
                  ) : null}
                  {isLoadingLocation ? (
                    <span className="text-neutral-700 font-medium">
                      Detecting your location...
                    </span>
                  ) : (
                    <span className="text-neutral-700 font-medium">
                      {locationError || 'Unable to detect location'}
                    </span>
                  )}
                </div>
                
                {/* Set Location Manually Button - Always Visible */}
                <Button
                  onClick={onLocationEditStart}
                  variant="neural-primary"
                >
                  Set Location Manually
                </Button>
              </>
            )}
          </div>
          
          {/* Location Edit Modal */}
          {isEditingLocation && (
            <div className="mt-6">
              <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg">
                <LocationSelector
                  initialLocation={tempLocation || { country: '', currency: getCurrencyByCountry('') }}
                    onLocationChange={handleLocationChange}
                  onCancel={onLocationEditCancel || (() => {})}
                  onSave={onLocationEditSave || (() => {})}
                  showPreview={false}
                />
              </div>
            </div>
          )}
        </div>
        </motion.div>
        
        <div className="text-center mt-8 mb-6">
          <p className="text-body-large text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          Select a range or provide exact details for more accurate recommendations and savings calculations.
        </p>
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
                          w-full h-full p-6 rounded-xl border-2 text-left transition-all duration-200 flex flex-col
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
                        <div className="flex items-center justify-between text-xs text-neutral-500 pt-3 border-t border-neutral-100">
                          <span>Revenue Range:</span>
                          <span className="font-medium">
                            {getEffectiveCurrencySymbol(locationData, manualLocation)}{(option.averageRevenue.min / 1000000).toFixed(1)}M - {getEffectiveCurrencySymbol(locationData, manualLocation)}{(option.averageRevenue.max / 1000000).toFixed(1)}M
                          </span>
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

              {/* Annual Revenue Card */}
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
                    value={manualInput.annualRevenue || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleManualInputChange('annualRevenue', value ? parseFloat(value) : undefined);
                    }}
                    className="w-full pl-4 pr-12 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary-500 focus:border-brand-primary-500 transition-colors appearance-none bg-white"
                  >
                    {getRevenueOptions().map(({ value, label }, index) => (
                      <option key={index} value={value || ''}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Based on your location's market data
                </p>
              </div>
            </div>



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