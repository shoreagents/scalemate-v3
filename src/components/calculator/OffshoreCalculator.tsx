'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, CalculationResult, CalculatorStep, RoleId, ExperienceLevel, CustomRole, CustomTask, RoleExperienceDistribution, ManualPortfolioData, PortfolioSize, PortfolioIndicator, LocationData } from '@/types';
import { ManualLocation, IPLocationData, getCountryFromCode, createLocationDataFromManual } from '@/types/location';
import { calculateSavings } from '@/utils/calculations';
import { useQuoteCalculatorData } from '@/hooks/useQuoteCalculatorData';
import { useCalculatorCache } from '@/hooks/useCalculatorCache';
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
  Globe,
} from 'lucide-react';
import { Brain } from 'phosphor-react';
import Link from 'next/link';
import { LocationStep } from './steps/LocationStep';
import { RestoreProgressPopup } from './RestoreProgressPopup';



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

  // Calculator cache functionality
  const {
    hasCachedData,
    showRestorePopup,
    cachedStep,
    saveToCache,
    loadFromCache,
    clearCache,
    restoreFromCache,
    dismissRestorePopup,
    isCheckingCache
  } = useCalculatorCache();

  const [canShowPopup, setCanShowPopup] = useState(false);

  useEffect(() => {
    if (!isCheckingCache) {
      const timer = setTimeout(() => setCanShowPopup(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isCheckingCache]);

  // Load cached data on mount
  useEffect(() => {
    const cachedData = loadFromCache();
    if (cachedData) {
      console.log('🔄 Restored calculator data from cache');
      setFormData(cachedData);
    }
  }, [loadFromCache]);

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
    isUsingDynamicData,
    isLoading
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
            setLocationData(cachedData);
            setIsLoadingLocation(false);
            console.log('📍 Using cached location:', cachedData.country_name);
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
    if (formData.currentStep === 6 && calculationResult) {
      exitIntentContext.disable();
      console.log('🎯 Calculator completed - exit intent disabled');
    }
  }, [formData.currentStep, calculationResult, exitIntentContext]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev: FormData) => {
      const updated = { ...prev, ...updates, lastUpdatedAt: new Date() };
      
      // Auto-save to cache
      saveToCache(updated);
      
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
    if (formData.currentStep < 6) {
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
      
      // Advance to step 6 (results) after calculation is complete
      updateFormData({ currentStep: 6 });
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
    clearCache(); // Clear the cache when restarting
    analytics.trackEvent('calculator_restart');
    exitIntentContext.reset();
  };

  const handleRestoreFromCache = () => {
    try {
      const restoredData = restoreFromCache();
      setFormData(restoredData);
      analytics.trackEvent('calculator_restore', { step: restoredData.currentStep });
      console.log('🔄 Restored calculator from cache');
    } catch (error) {
      console.error('Error restoring from cache:', error);
      // Fallback to restart if restore fails
      restartCalculator();
    }
  };

  const canProceedFromStep = (step: CalculatorStep): boolean => {
    switch (step) {
      case 1: // Location step
        return !!getEffectiveLocation();
      case 2: // Portfolio step
        return formData.portfolioSize !== '' || !!(formData.manualPortfolioData && Object.keys(formData.manualPortfolioData).length > 0);
      case 3: // Role selection step
        return Object.entries(formData.selectedRoles).some(([, selected]) => selected === true);
      case 4: // Task selection step
        // Check if each selected role has at least one task assigned
        const selectedRoleIds = Object.entries(formData.selectedRoles)
          .filter(([, selected]) => selected)
          .map(([roleId]) => roleId);
        
        if (selectedRoleIds.length === 0) return false;
        
        // For each selected role, check if it has at least one task
        return selectedRoleIds.every(roleId => {
          // Check if role has any selected predefined tasks
          const hasSelectedTasks = Object.entries(formData.selectedTasks)
            .some(([taskKey, selected]) => {
              const [taskRoleId] = taskKey.split('-');
              return taskRoleId === roleId && selected;
            });
          
          // Check if role has any custom tasks
          const hasCustomTasks = (formData.customTasks[roleId] || []).length > 0;
          
          return hasSelectedTasks || hasCustomTasks;
        });
      case 5: // Experience step
        return Object.keys(formData.roleExperienceDistribution).length > 0;
      default:
        return false;
    }
  };

  const handleStepClick = (step: CalculatorStep) => {
    // Only allow navigation to steps that are accessible
    // Users can go to any step up to the current step or completed steps
    if (step <= formData.currentStep || canProceedFromStep((step - 1) as CalculatorStep)) {
      updateFormData({ currentStep: step });
      onStepChange?.(step);
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
    switch (formData.currentStep) {
      case 1:
        return (
          <LocationStep
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
          />
        );
      case 2:
        return (
          <PortfolioStep
            value={formData.portfolioSize}
            manualData={formData.manualPortfolioData}
            onChange={handlePortfolioChange}
            portfolioIndicators={portfolioIndicators}
            isLoadingIndicators={isLoadingPortfolio}
            portfolioCurrency={portfolioCurrency}
            portfolioCurrencySymbol={portfolioCurrencySymbol}
            isUsingDynamicData={isUsingDynamicData}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            {...(manualLocation && { manualLocation })}
          />
        );
      case 3:
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
      case 4:
        return (
          <TaskSelectionStep
            selectedRoles={formData.selectedRoles}
            selectedTasks={formData.selectedTasks}
            customTasks={formData.customTasks}
            customRoles={formData.customRoles || {}}
            onChange={handleTaskSelectionChange}
            roles={roles}
            isLoadingRoles={isLoadingRoles}
            rolesError={rolesError}
            isUsingDynamicRoles={isUsingDynamicRoles}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            {...(manualLocation && { manualLocation })}
          />
        );
      case 5:
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
      case 6:
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
      1: 'Set your business location for accurate cost comparisons',
      2: 'Tell us about your property portfolio size and management structure',
      3: 'Select the roles you want to offshore and team size requirements',
      4: 'Choose specific tasks for each role to get accurate cost projections',
      5: 'Set experience requirements to match your quality standards',
      6: 'Your comprehensive savings breakdown and implementation guide'
    };
    return descriptions[step] || '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Restore Progress Popup */}
      {canShowPopup && (
        <RestoreProgressPopup
          isOpen={showRestorePopup}
          onRestore={handleRestoreFromCache}
          onRestart={restartCalculator}
          onDismiss={dismissRestorePopup}
          cachedStep={cachedStep || 1}
          cachedData={{
            ...(formData.portfolioSize && { portfolioSize: formData.portfolioSize }),
            selectedRolesCount: Object.values(formData.selectedRoles).filter(Boolean).length,
            ...(formData.userLocation?.country && { location: formData.userLocation.country }),
            ...(manualLocation?.country && !formData.userLocation?.country && { location: manualLocation.country })
          }}
        />
      )}

      {/* Background effects */}
      <div className="absolute inset-0 pattern-neural-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neural-blue-400/10 to-quantum-purple-400/10 rounded-full blur-3xl animate-neural-float pointer-events-none" />
      
      <div className="relative z-10">
        {/* Calculator Header */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <h1 className="text-display-3 gradient-text-neural font-display leading-tight text-center">
              Offshore Scaling Calculator
            </h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-300 ${
              isUsingDynamicData ? 'bg-purple-50 border-purple-200 shadow-[0_0_16px_4px_rgba(168,85,247,0.2)]' : 'bg-gray-50 border-gray-200'
            }`}>
              <Brain weight="duotone" className={`w-5 h-5 ${
                isUsingDynamicData ? 'text-purple-500' : 'text-gray-400'
              }`} />
              <span className={`text-xs font-medium ${
                isUsingDynamicData ? 'text-purple-700' : 'text-gray-700'
              }`}>
                Powered by AI
              </span>
            </div>
          </div>
          
        </div>

        {/* Step Indicator */}
        <div className="my-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+1.5rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          <div className="relative z-10">
            <StepIndicator 
              currentStep={formData.currentStep} 
              completedSteps={[]}
              onStepClick={handleStepClick}
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
        {formData.currentStep < 6 && (
          <div className="max-w-5xl mx-auto">
            <Card 
              variant="neural-elevated" 
              className="mt-8 p-6 hover:shadow-[0_0_24px_6px_rgba(59,130,246,0.18)] transition-all duration-300"
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
                      Step {formData.currentStep} of 6
                    </div>
                    
                    {formData.currentStep < 5 && (
                      <Button
                        variant="neural-primary"
                        onClick={nextStep}
                        disabled={!canProceedFromStep(formData.currentStep) || 
                                  (formData.currentStep === 1 ? isLoadingLocation : false)}
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
                    Step {formData.currentStep} of 6
                  </div>
                  
                  {/* Continue button */}
                  {formData.currentStep < 5 && (
                    <Button
                      variant="neural-primary"
                      onClick={nextStep}
                      disabled={!canProceedFromStep(formData.currentStep) || 
                                (formData.currentStep === 1 ? isLoadingLocation : false)}
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
          </div>
        )}
      </div>
    </div>
  );
} 