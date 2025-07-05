'use client';

import { useState, useEffect, useCallback } from 'react';
import { FormData, CalculatorStep } from '@/types';

const CALCULATOR_CACHE_KEY = 'scalemate_calculator_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface CachedCalculatorData {
  formData: FormData;
  timestamp: number;
  sessionId: string;
}

interface UseCalculatorCacheReturn {
  hasCachedData: boolean;
  showRestorePopup: boolean;
  cachedStep: CalculatorStep | null;
  saveToCache: (formData: FormData) => void;
  loadFromCache: () => FormData | null;
  clearCache: () => void;
  restoreFromCache: () => FormData;
  dismissRestorePopup: () => void;
  isCheckingCache: boolean;
}

export function useCalculatorCache(): UseCalculatorCacheReturn {
  const [hasCachedData, setHasCachedData] = useState(false);
  const [showRestorePopup, setShowRestorePopup] = useState(false);
  const [cachedStep, setCachedStep] = useState<CalculatorStep | null>(null);
  const [isCheckingCache, setIsCheckingCache] = useState(true);

  // Check for cached data on mount
  useEffect(() => {
    const checkCachedData = () => {
      try {
        const cached = localStorage.getItem(CALCULATOR_CACHE_KEY);
        if (!cached) {
          setHasCachedData(false);
          setIsCheckingCache(false);
          return;
        }

        const parsed: CachedCalculatorData = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is still valid
        if ((now - parsed.timestamp) < CACHE_DURATION) {
          setHasCachedData(true);
          setCachedStep(parsed.formData.currentStep);
          
          // Show popup if user has made progress (beyond step 1)
          if (parsed.formData.currentStep > 1 || parsed.formData.completedSteps.length > 0) {
            setShowRestorePopup(true);
          }
        } else {
          // Cache expired, remove it
          localStorage.removeItem(CALCULATOR_CACHE_KEY);
          setHasCachedData(false);
        }
      } catch (error) {
        console.error('Error checking calculator cache:', error);
        setHasCachedData(false);
      } finally {
        setIsCheckingCache(false);
      }
    };

    checkCachedData();
  }, []);

  const saveToCache = useCallback((formData: FormData) => {
    try {
      const cacheData: CachedCalculatorData = {
        formData: {
          ...formData,
          lastUpdatedAt: new Date()
        },
        timestamp: Date.now(),
        sessionId: formData.sessionId
      };
      
      localStorage.setItem(CALCULATOR_CACHE_KEY, JSON.stringify(cacheData));
      setHasCachedData(true);
      setCachedStep(formData.currentStep);
      console.log('💾 Calculator data saved to cache:', { step: formData.currentStep, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error saving calculator cache:', error);
    }
  }, []);

  const loadFromCache = useCallback((): FormData | null => {
    try {
      const cached = localStorage.getItem(CALCULATOR_CACHE_KEY);
      if (!cached) return null;

      const parsed: CachedCalculatorData = JSON.parse(cached);
      const now = Date.now();

      if ((now - parsed.timestamp) < CACHE_DURATION) {
        // Convert date strings back to Date objects
        const formData = {
          ...parsed.formData,
          startedAt: new Date(parsed.formData.startedAt),
          lastUpdatedAt: new Date(parsed.formData.lastUpdatedAt)
        };
        
        return formData;
      } else {
        localStorage.removeItem(CALCULATOR_CACHE_KEY);
        return null;
      }
    } catch (error) {
      console.error('Error loading calculator cache:', error);
      return null;
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(CALCULATOR_CACHE_KEY);
      setHasCachedData(false);
      setCachedStep(null);
      setShowRestorePopup(false);
    } catch (error) {
      console.error('Error clearing calculator cache:', error);
    }
  }, []);

  const restoreFromCache = useCallback((): FormData => {
    const cachedData = loadFromCache();
    if (!cachedData) {
      throw new Error('No cached data available');
    }
    
    // Clear the cache after restoring
    clearCache();
    return cachedData;
  }, [loadFromCache, clearCache]);

  const dismissRestorePopup = useCallback(() => {
    setShowRestorePopup(false);
  }, []);

  return {
    hasCachedData,
    showRestorePopup,
    cachedStep,
    saveToCache,
    loadFromCache,
    clearCache,
    restoreFromCache,
    dismissRestorePopup,
    isCheckingCache
  };
} 