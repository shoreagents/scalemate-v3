'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, CalculationResult, CalculatorStep, RoleId, ExperienceLevel, CustomRole, CustomTask, RoleExperienceDistribution, ManualPortfolioData, PortfolioSize, PortfolioIndicator, LocationData } from '@/types';
import { ManualLocation, IPLocationData, getCountryFromCode, createLocationDataFromManual } from '@/types/location';
import { calculateSavings } from '@/utils/calculations';
import { useQuoteCalculatorData } from '@/hooks/useQuoteCalculatorData';
import { getDisplayCurrencyByCountryWithAPIFallback, getCurrencySymbol } from '@/utils/currency';
import type { LocalMultiCountryRoleSalaryData } from '@/utils/calculations';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepIndicator } from '@/components/calculator/StepIndicator';
import { PortfolioStep } from './steps/PortfolioStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TaskSelectionStep } from './steps/TaskSelectionStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ResultsStep } from './steps/ResultsStep';
import { useExitIntentContext } from '@/components/providers/ExitIntentProvider';
import { analytics } from '@/utils/analytics';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calculator,
  TrendingUp,
  Users,
  Sparkles,
  Target,
  Home,
  Globe
} from 'lucide-react';
import Link from 'next/link';



interface OffshoreCalculatorProps {
  className?: string;
  onComplete?: (results: CalculationResult) => void;
  onStepChange?: (step: CalculatorStep) => void;
}

// Helper functions moved outside component to prevent recreation on every render
const getCurrencyFromCountry = (country: string, isAPIFailed: boolean = false) => {
  return getDisplayCurrencyByCountryWithAPIFallback(country, isAPIFailed);
};

const getCurrencySymbolFromCountry = (country: string): string => {
  const currency = getCurrencyFromCountry(country);
  return getCurrencySymbol(currency);
};

// Location cache using localStorage for persistence across renders
const CACHE_KEY = 'scalemate_location_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedLocation = (): IPLocationData | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const { data, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if ((now - timestamp) < CACHE_DURATION) {
      console.log('🔄 Using cached location data');
      return data;
    } else {
      // Cache expired, remove it
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  } catch {
    return null;
  }
};

const setCachedLocation = (data: IPLocationData): void => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // localStorage might be disabled, ignore
  }
};

export function OffshoreCalculator({ 
  className = '', 
  onComplete,
  onStepChange 
}: OffshoreCalculatorProps) {
  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Default form data
  const getDefaultFormData = (): FormData => ({
    portfolioSize: '',
    selectedRoles: {
      assistantPropertyManager: false,
      leasingCoordinator: false,
      marketingSpecialist: false
    },
    customRoles: {},
    selectedTasks: {},
    customTasks: {
      assistantPropertyManager: [],
      leasingCoordinator: [],
      marketingSpecialist: []
    },
    experienceLevel: '',
    roleExperienceLevels: {},
    roleExperienceDistribution: {},
    teamSize: {
      assistantPropertyManager: 1,
      leasingCoordinator: 1,
      marketingSpecialist: 1
    },
    currentStep: 1 as const,
    completedSteps: [],
    sessionId: generateSessionId(),
    startedAt: new Date(),
    lastUpdatedAt: new Date(),
    // Add default US location data
    userLocation: {
      country: 'United States',
      countryName: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      detected: true
    }
  });

  const [formData, setFormData] = useState<FormData>(getDefaultFormData());
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  
  // Location tracking state
  const [locationData, setLocationData] = useState<IPLocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Manual location override state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(null);
  const [tempLocation, setTempLocation] = useState<ManualLocation>({
    country: '',
    currency: getCurrencyFromCountry('')
  });

  // Use global exit intent context
  const exitIntentContext = useExitIntentContext();

  // Compute effective location for the hook (stable reference)
  const computedLocationForHook = useMemo(() => {
    if (locationData) {
      const translatedCountry = getCountryFromCode(locationData.country_code);
      const countryName = translatedCountry || locationData.country_name || 'United States';
      
      // Use API-aware currency logic - use actual currency when AI is working
      // For now, assume API is working (will be updated when hook data is available)
      const displayCurrency = getDisplayCurrencyByCountryWithAPIFallback(countryName, false);
      
      // Create LocationData from IP data
      return {
        country: countryName,
        countryName: locationData.country_name || 'United States',
        currency: displayCurrency, // Use display currency instead of detected currency
        currencySymbol: getCurrencySymbol(displayCurrency),
        detected: true
      };
    }
    return null;
  }, [
    locationData?.country_code, 
    locationData?.country_name
  ]); // Remove currency dependency since we're using display currency

  // Load dynamic salary data based on current location
  const { 
    portfolioIndicators,
    portfolioCurrency,
    portfolioCurrencySymbol,
    roles,
    isLoadingRoles, 
    rolesError,
    isLoading: isLoadingPortfolio,
    isUsingDynamicRoles,
    isUsingDynamicData
  } = useQuoteCalculatorData(computedLocationForHook, manualLocation);

  // Get effective location (manual override or auto-detected)
  const getEffectiveLocation = useCallback(() => {
    if (manualLocation) {
      return {
        country_name: manualLocation.country,
        country: manualLocation.country,
        currency: getCurrencyFromCountry(manualLocation.country),
        currencySymbol: getCurrencySymbolFromCountry(manualLocation.country)
      };
    }
    return locationData;
  }, [manualLocation, locationData]);

  // Handle location edit save
  const saveLocationEdit = useCallback(() => {
    if (tempLocation.country) {
      const newManualLocation = { 
        country: tempLocation.country,
        currency: getCurrencyFromCountry(tempLocation.country)
      };
      setManualLocation(newManualLocation);
      setIsEditingLocation(false);
      
      console.log('📍 Location manually overridden:', { country: tempLocation.country });
    }
  }, [tempLocation.country]);

  // Helper to get effective location data for manual selection
  const getEffectiveLocationForManual = (manual: ManualLocation): LocationData => {
    return createLocationDataFromManual(manual, getCurrencyFromCountry, getCurrencySymbolFromCountry);
  };

  // Handle location edit cancel
  const cancelLocationEdit = useCallback(() => {
    const currentLocation = getEffectiveLocation();
    const country = manualLocation?.country || currentLocation?.country_name || '';
    setTempLocation({
      country,
      currency: getCurrencyFromCountry(country)
    });
    setIsEditingLocation(false);
  }, [getEffectiveLocation, manualLocation?.country]);

  // Start editing location
  const startLocationEdit = useCallback(() => {
    const currentLocation = getEffectiveLocation();
    const country = manualLocation?.country || currentLocation?.country_name || '';
    setTempLocation({
      country,
      currency: getCurrencyFromCountry(country)
    });
    setIsEditingLocation(true);
  }, [getEffectiveLocation, manualLocation?.country]);

  // Reset to auto-detected location
  const resetToAutoLocation = useCallback(() => {
    setManualLocation(null);
    setIsEditingLocation(false);
    console.log('📍 Reset to auto-detected location');
  }, []);

  // Fetch location data using ipapi (side-effect free with proper cleanup)
  useEffect(() => {
    let isCancelled = false;
    
    const fetchLocation = async () => {
      if (!isCancelled) {
        setIsLoadingLocation(true);
      }
      
      // Check cache first - this makes the effect idempotent
      const cachedData = getCachedLocation();
      if (cachedData) {
        if (!isCancelled) {
          // Add a small delay to show skeleton even for cached data
          await new Promise(resolve => setTimeout(resolve, 300));
          if (!isCancelled) {
            setLocationData(cachedData);
            setIsLoadingLocation(false);
            console.log('📍 Using cached location:', cachedData.country_name);
          }
        }
        return;
      }
      
      // Only fetch if we don't have cached data and we haven't been cancelled
      if (isCancelled) return;
      
      console.log('🔄 Starting location fetch...');
      try {
        if (!isCancelled) {
        setLocationError(null);
        }
        
        // Add a small delay to make skeleton visible
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (isCancelled) return;
        
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: IPLocationData = await response.json();
        
        if (isCancelled) return;
          
        // Cache the data for future renders
        setCachedLocation(data);
        
        setLocationData(data);
        console.log('📍 Location detected:', data.country_name);
      } catch (error) {
        if (isCancelled) return;
        
        console.error('Failed to fetch location:', error);
        setLocationError('Unable to detect location');
        analytics.trackEvent('error', { type: 'location_error', error: error?.toString() });
      } finally {
        if (!isCancelled) {
        setIsLoadingLocation(false);
        }
      }
    };

    fetchLocation();
    
    // Cleanup function to cancel the request if component unmounts
    return () => {
      isCancelled = true;
    };
  }, []); // Empty dependency array - only run on mount

  // Update formData.userLocation when auto-detected locationData changes
  useEffect(() => {
    if (locationData && !manualLocation) {
      const translatedCountry = getCountryFromCode(locationData.country_code);
      const countryName = translatedCountry || locationData.country_name || 'United States';
      
      // Use API-aware currency logic - use actual currency when AI is working
      const isAPIFailed = !isUsingDynamicData && !isUsingDynamicRoles;
      const displayCurrency = getDisplayCurrencyByCountryWithAPIFallback(countryName, isAPIFailed);
      
      const autoDetectedLocation = {
        country: countryName,
        countryName: locationData.country_name || 'United States',
        currency: displayCurrency, // Use display currency instead of detected currency
        currencySymbol: getCurrencySymbol(displayCurrency),
        detected: true
      };

      // Only update if it's different from current userLocation
      if (!formData.userLocation || 
          formData.userLocation.country !== autoDetectedLocation.country ||
          formData.userLocation.currency !== autoDetectedLocation.currency) {
        console.log('📍 Updating formData.userLocation with auto-detected location:', autoDetectedLocation.country);
        updateFormData({ userLocation: autoDetectedLocation });
      }
    }
  }, [locationData, manualLocation, formData.userLocation, isUsingDynamicData, isUsingDynamicRoles]);

  // Animation variants
  // const containerVariants = {
  //   hidden: { opacity: 0, y: 20 },
  //   visible: {
  //     opacity: 1,
  //     y: 0,
  //     transition: {
  //       duration: 0.6,
  //       ease: "easeOut",
  //       staggerChildren: 0.1
  //     }
  //   },
  //   exit: {
  //     opacity: 0,
  //     y: -20,
  //     transition: { duration: 0.3 }
  //   }
  // };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  // Skeleton Loader Components
  const PortfolioStepSkeleton = () => (
    <div className="mx-auto" style={{ maxWidth: '1400px' }}>
      {/* Skeleton for portfolio options only */}
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
      
      {/* Need More Precision Card - Show immediately */}
      <div className="max-w-2xl mx-auto">
        <div className="w-full p-6 rounded-xl border-2 border-dashed border-neural-blue-300 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-lg font-bold text-neural-blue-900 mb-1">
                Want more accurate results?
              </h3>
              <p className="text-sm text-neural-blue-600">
                Tell us your exact numbers for personalized recommendations and precise savings estimates
              </p>
            </div>
            <div className="w-5 h-5 text-neural-blue-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const RoleSelectionStepSkeleton = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
      </div>
      
      {/* Search and Filters Skeleton */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col min-[468px]:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-40 animate-pulse" />
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="flex-1"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="relative h-full">
            <div className="p-6 rounded-xl border-2 border-neutral-200 bg-white h-full flex flex-col">
              {/* Role Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse" />
                </div>
                <div className="h-5 bg-gray-200 rounded mb-1 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
              
              {/* Enhanced Savings Preview */}
              <div className="mb-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 mt-auto">
                <div className="text-center mb-3">
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="text-right">
                      <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                    </div>
                  </div>
                  <div className="border-t border-green-300 pt-2 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="text-right">
                        <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const TaskSelectionStepSkeleton = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
      </div>
      
      <div className="space-y-6">
        {[1, 2].map((role) => (
          <div key={role} className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="p-4 bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 bg-gray-200 rounded flex-1 animate-pulse" />
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((task) => (
                <div key={task} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded flex-1 animate-pulse" />
                  </div>
                  <div className="ml-8">
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ExperienceStepSkeleton = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-8 bg-gray-200 rounded-lg w-3/4 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto animate-pulse" />
      </div>
      
      <div className="space-y-6">
        {[1, 2].map((role) => (
          <div key={role} className="p-6 border border-neutral-200 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded flex-1 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((level) => (
                <div key={level} className="p-4 border border-neutral-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Initialize analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { 
        step: 1,
        url: window.location.href
      });
      console.log('📊 Analytics initialized with session:', analytics.getSessionId());
    }
  }, []);

  // Disable global exit intent when user completes the calculator
  useEffect(() => {
    if (formData.currentStep === 5 && calculationResult) {
      exitIntentContext.disable();
      console.log('🎯 Calculator completed - exit intent disabled');
    }
  }, [formData.currentStep, calculationResult, exitIntentContext]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev: FormData) => {
      const updated = { ...prev, ...updates, lastUpdatedAt: new Date() };
      
      // Track analytics for significant updates
      if (updates.currentStep && updates.currentStep !== prev.currentStep) {
        analytics.updateStep(updates.currentStep);
        analytics.trackEvent('step_start', { step: updates.currentStep });
        onStepChange?.(updates.currentStep);
      }
      
      if (updates.portfolioSize && updates.portfolioSize !== prev.portfolioSize) {
        analytics.trackEvent('portfolio_select', { portfolioSize: updates.portfolioSize });
      }
      
      // Update analytics with calculator data
      analytics.updateCalculatorData({
        portfolioSize: updated.portfolioSize,
        selectedRoles: Object.keys(updated.selectedRoles).filter(role => updated.selectedRoles[role as RoleId]),
        teamSize: updated.teamSize
      });
      
      return updated;
    });
  };

  const nextStep = () => {
    if (formData.currentStep < 5) {
      updateFormData({ currentStep: (formData.currentStep + 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (formData.currentStep > 1) {
      updateFormData({ currentStep: (formData.currentStep - 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const calculateSavingsAsync = async () => {
    setIsCalculating(true);
    analytics.trackEvent('calculation_start', formData);
    
    try {
      // Processing stages simulation
      const processingStages = [
        'Initializing calculation...',
        'Analyzing portfolio data...',
        'Processing role requirements...',
        'Calculating cost savings...',
        'Optimizing team structure...',
        'Generating recommendations...',
        'Finalizing results...'
      ];

      for (let i = 0; i < processingStages.length; i++) {
        setProcessingStage(processingStages[i]!);
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }
      
      console.log('🚀 OffshoreCalculator: Calling calculateSavings with dynamic data:', {
        hasDynamicRoles: !!roles,
        userLocation: formData.userLocation?.country,
        manualLocation: manualLocation?.country,
        isLoadingRoles,
        rolesError
      });
      
      const result = await calculateSavings(
        formData, 
        Object.values(formData.portfolioIndicators || {}),
        formData.userLocation || (manualLocation ? getEffectiveLocationForManual(manualLocation) : undefined),
        roles // Pass dynamic roles data from API (with embedded salary data)
      );
      setCalculationResult(result);
      setProcessingStage('');
      
      // Advance to step 5 (results) after calculation is complete
      updateFormData({ currentStep: 5 });
      analytics.trackEvent('calculation_complete', { 
        result
      });
      onComplete?.(result);
    } catch (error) {
      console.error('Calculation error:', error);
      analytics.trackEvent('error', { type: 'calculation_error', error: error?.toString() });
    } finally {
      setIsCalculating(false);
      setProcessingStage('');
    }
  };

  const restartCalculator = () => {
    setFormData({
      ...getDefaultFormData(),
      sessionId: generateSessionId(),
      startedAt: new Date(),
      lastUpdatedAt: new Date()
    });
    setCalculationResult(null);
    analytics.trackEvent('calculator_restart');
    exitIntentContext.reset();
  };

  const canProceedFromStep = (step: CalculatorStep): boolean => {
    switch (step) {
      case 1: return formData.portfolioSize !== '';
      case 2: return Object.values(formData.selectedRoles).some(Boolean);
      case 3: {
        // Check that each selected role has at least one checked task
        const selectedRoles = Object.entries(formData.selectedRoles)
          .filter(([, selected]: [string, boolean]) => selected)
          .map(([roleId]: [string, boolean]) => roleId);
        
        return selectedRoles.every((roleId: string) => {
          // Check if this role has any checked tasks
          const hasSelectedTasks = Object.entries(formData.selectedTasks).some(
            ([taskKey, isChecked]) => taskKey.startsWith(`${roleId}-`) && isChecked
          );
          
          // Check if this role has any custom tasks
          const hasCustomTasks = formData.customTasks[roleId] && formData.customTasks[roleId].length > 0;
          
          return hasSelectedTasks || hasCustomTasks;
        });
      }
      case 4: {
        // NEW: Multi-level experience validation
        const selectedRoles = Object.entries(formData.selectedRoles)
          .filter(([, selected]: [string, boolean]) => selected)
          .map(([roleId]: [string, boolean]) => roleId);
        
        // Check if all selected roles have complete experience distribution
        return selectedRoles.every((roleId: string) => {
          const distribution = formData.roleExperienceDistribution?.[roleId];
          return distribution && distribution.isComplete;
        });
      }
      default: return true;
    }
  };

  // Memoized onChange handler for PortfolioStep
  const handlePortfolioChange = useCallback((portfolioSize: string, manualData?: ManualPortfolioData, portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>) => {
    updateFormData({ 
      portfolioSize, 
      ...(manualData !== undefined && { manualPortfolioData: manualData }),
      ...(portfolioIndicators !== undefined && { portfolioIndicators })
    });
  }, []);

  // Memoized onChange handler for RoleSelectionStep
  const handleRoleSelectionChange = useCallback((selectedRoles: Record<string, boolean>, teamSize: Record<string, number>, customRoles: Record<string, CustomRole>, userLocation?: LocationData) => {
    updateFormData({ 
      selectedRoles, 
      teamSize, 
      customRoles: customRoles || {},
      ...(userLocation !== undefined && { userLocation })
    });
  }, []);

  // Memoized onChange handler for TaskSelectionStep
  const handleTaskSelectionChange = useCallback((selectedTasks: Record<string, boolean>, customTasks: Record<string, readonly CustomTask[]>) => {
    updateFormData({ selectedTasks, customTasks });
  }, []);

  // Memoized onChange handlers for ExperienceStep
  const handleExperienceChange = useCallback((experienceLevel: ExperienceLevel | '') => {
    updateFormData({ experienceLevel });
  }, []);

  const handleRoleExperienceChange = useCallback((roleExperienceLevels: Record<string, ExperienceLevel>) => {
    updateFormData({ roleExperienceLevels });
  }, []);

  const handleRoleExperienceDistributionChange = useCallback((roleExperienceDistribution: Record<string, RoleExperienceDistribution>) => {
    updateFormData({ roleExperienceDistribution });
  }, []);

  const renderStep = () => {
    // Debug logging (can be removed in production)
    // console.log('🔍 renderStep debug:', { isLoadingLocation, isLoadingPortfolio, currentStep: formData.currentStep });
    
    switch (formData.currentStep) {
      case 1:
        return (
          <PortfolioStep
            value={formData.portfolioSize}
            manualData={formData.manualPortfolioData}
            locationData={locationData}
            isLoadingLocation={isLoadingLocation}
            locationError={locationError}
            isEditingLocation={isEditingLocation}
            manualLocation={manualLocation}
            tempLocation={tempLocation}
            onLocationEditStart={startLocationEdit}
            onLocationEditSave={saveLocationEdit}
            onLocationEditCancel={cancelLocationEdit}
            onLocationReset={resetToAutoLocation}
            onTempLocationChange={setTempLocation}
            getEffectiveLocation={getEffectiveLocation}
            onChange={handlePortfolioChange}
            showPortfolioGridSkeleton={(isLoadingLocation || isLoadingPortfolio) && formData.currentStep === 1}
            portfolioIndicators={portfolioIndicators}
            isLoadingIndicators={isLoadingPortfolio}
            portfolioCurrency={portfolioCurrency}
            portfolioCurrencySymbol={portfolioCurrencySymbol}
            isUsingDynamicData={isUsingDynamicData}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            {...(manualLocation && { manualLocation })}
            onChange={handleRoleSelectionChange}
            roles={roles}
            isLoadingRoles={isLoadingRoles}
            rolesError={rolesError}
            isUsingDynamicRoles={isUsingDynamicRoles}
          />
        );
      case 3:
        return (
          <TaskSelectionStep
            selectedRoles={formData.selectedRoles}
            selectedTasks={formData.selectedTasks}
            customTasks={formData.customTasks}
            onChange={handleTaskSelectionChange}
            roles={roles}
            isLoadingRoles={isLoadingRoles}
            rolesError={rolesError}
            isUsingDynamicRoles={isUsingDynamicRoles}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            {...(manualLocation && { manualLocation })}
          />
        );
      case 4:
        return (
          <ExperienceStep
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            roleExperienceDistribution={formData.roleExperienceDistribution || {}}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            {...(manualLocation && { manualLocation })}
            roles={roles}
            onRoleExperienceDistributionChange={handleRoleExperienceDistributionChange}
            onCalculate={calculateSavingsAsync}
            isCalculating={isCalculating}
            isUsingDynamicRoles={isUsingDynamicRoles}
          />
        );
      case 5:
        return (
          <ResultsStep
            result={calculationResult!}
            formData={formData}
            onRestart={restartCalculator}
          />
        );
      default:
        return null;
    }
  };

  const getStepDescription = (step: CalculatorStep): string => {
    const descriptions = {
      1: 'Tell us about your property portfolio size and management structure',
      2: 'Select the roles you want to offshore and team size requirements',
      3: 'Choose specific tasks for each role to get accurate cost projections',
      4: 'Set experience requirements to match your quality standards',
      5: 'Your comprehensive savings breakdown and implementation guide'
    };
    return descriptions[step] || '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 pattern-neural-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neural-blue-400/10 to-quantum-purple-400/10 rounded-full blur-3xl animate-neural-float pointer-events-none" />
      
      <div className="relative z-10">
        {/* Calculator Header */}
        <div className="mb-8 px-8 py-12 text-center">
          <div className="mb-6">
            <h1 className="text-display-3 gradient-text-neural font-display leading-tight text-center">
              Offshore Scaling Calculator
            </h1>
          </div>
          
          <p className="text-body-large text-neural-blue-600 max-w-3xl mx-auto leading-relaxed">
            {getStepDescription(formData.currentStep)}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="my-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          <div className="relative z-10">
            <StepIndicator 
              currentStep={formData.currentStep} 
              completedSteps={[]}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {formData.currentStep < 5 && (
          <Card 
            variant="neural-elevated" 
            className="mt-8 p-6"
            hoverLift={false}
          >
            <>
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {formData.currentStep === 1 ? (
                    <Link href="/">
                      <Button
                        variant="quantum-secondary"
                        leftIcon={<Home className="h-4 w-4" />}
                        className="w-40 h-12"
                        disabled={isLoadingLocation}
                      >
                        Back to Home
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant="quantum-secondary"
                      onClick={prevStep}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                      className="w-40 h-12"
                      disabled={isLoadingRoles}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-sm text-neural-blue-600 font-medium">
                    Step {formData.currentStep} of 5
                  </div>
                  
                  {formData.currentStep < 4 && (
                    <Button
                      variant="neural-primary"
                      onClick={nextStep}
                      disabled={!canProceedFromStep(formData.currentStep) || isLoadingLocation || isLoadingRoles}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                      className="w-40 h-12"
                    >
                      Continue
                    </Button>
                  )}
                </div>
              </div>

              {/* Mobile Layout (stacked vertically) */}
              <div className="flex sm:hidden flex-col items-center gap-4">
                {/* Step counter at top */}
                <div className="text-sm text-neural-blue-600 font-medium">
                  Step {formData.currentStep} of 5
                </div>
                
                {/* Continue button */}
                {formData.currentStep < 4 && (
                  <Button
                    variant="neural-primary"
                    onClick={nextStep}
                    disabled={!canProceedFromStep(formData.currentStep) || isLoadingLocation || isLoadingRoles}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-full h-12"
                  >
                    Continue
                  </Button>
                )}
                
                {/* Back/Previous button at bottom */}
                {formData.currentStep === 1 ? (
                  <Link href="/" className="w-full">
                    <Button
                      variant="quantum-secondary"
                      leftIcon={<Home className="h-4 w-4" />}
                      className="w-full h-12"
                      disabled={isLoadingLocation}
                    >
                      Back to Home
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="quantum-secondary"
                    onClick={prevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    className="w-full h-12"
                    disabled={isLoadingRoles}
                  >
                    Previous
                  </Button>
                )}
              </div>
            </>
          </Card>
        )}
      </div>
    </div>
  );
} 