import { useState, useCallback } from 'react';
import { FormData, CalculationResult } from '@/types/calculator';

export interface AIInsight {
  insight: string;
  type: string;
  generatedAt: string;
}

interface UseAIInsightsReturn {
  insights: Record<string, AIInsight>;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  generateInsight: (
    formData: FormData, 
    calculationResult: CalculationResult, 
    insightType: string
  ) => Promise<void>;
  clearInsight: (insightType: string) => void;
  hasInsight: (insightType: string) => boolean;
}

export function useAIInsights(): UseAIInsightsReturn {
  const [insights, setInsights] = useState<Record<string, AIInsight>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateInsight = useCallback(async (
    formData: FormData,
    calculationResult: CalculationResult,
    insightType: string
  ) => {
    // Set loading state
    setLoading(prev => ({ ...prev, [insightType]: true }));
    setErrors(prev => ({ ...prev, [insightType]: '' }));

    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          calculationResult,
          insightType
        }),
      });

      if (!response.ok) {
        throw new Error(`AI insights request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setInsights(prev => ({
          ...prev,
          [insightType]: {
            insight: data.insight,
            type: data.type,
            generatedAt: data.generatedAt
          }
        }));
      } else {
        throw new Error(data.error || 'Failed to generate insight');
      }
    } catch (error) {
      console.error('AI Insights Error:', error);
      setErrors(prev => ({
        ...prev,
        [insightType]: error instanceof Error ? error.message : 'Failed to generate insight'
      }));
    } finally {
      setLoading(prev => ({ ...prev, [insightType]: false }));
    }
  }, []);

  const clearInsight = useCallback((insightType: string) => {
    setInsights(prev => {
      const newInsights = { ...prev };
      delete newInsights[insightType];
      return newInsights;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[insightType];
      return newErrors;
    });
  }, []);

  const hasInsight = useCallback((insightType: string) => {
    return !!insights[insightType];
  }, [insights]);

  return {
    insights,
    loading,
    errors,
    generateInsight,
    clearInsight,
    hasInsight
  };
} 