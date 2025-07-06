import { useState, useEffect } from 'react';
import { FormData, CalculationResult } from '@/types';

interface ImplementationPlan {
  executiveSummary: string;
  detailedPlan: {
    phase: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
    keyActivities: string[];
    risks: string[];
    mitigations: string[];
  }[];
  claudeAIGuide?: {
    setupSteps: {
      step: string;
      description: string;
      instructions: string[];
      tips: string[];
    }[];
    jobDescriptionTemplates: {
      role: string;
      template: string;
      claudePrompt: string;
    }[];
    trainingProcesses: {
      process: string;
      description: string;
      claudePrompts: string[];
      expectedOutcomes: string[];
    }[];
    workflowAutomation: {
      workflow: string;
      description: string;
      claudeIntegration: string;
      benefits: string[];
    }[];
  };
  resourceRequirements: {
    internalTeam: string[];
    externalSupport: string[];
    toolsAndSystems: string[];
    budgetConsiderations: string[];
  };
  timeline: {
    phase: string;
    startWeek: number;
    duration: string;
    milestones: string[];
  }[];
  riskAssessment: {
    risk: string;
    impact: 'Low' | 'Medium' | 'High';
    probability: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }[];
  successMetrics: {
    metric: string;
    target: string;
    measurement: string;
  }[];
  nextSteps: string[];
}

interface UseImplementationPlanResult {
  implementationPlan: ImplementationPlan | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useImplementationPlan(
  formData: FormData, 
  calculationResult: CalculationResult,
  shouldFetch: boolean = true
): UseImplementationPlanResult {
  const [implementationPlan, setImplementationPlan] = useState<ImplementationPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchImplementationPlan = async () => {
    if (!shouldFetch) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/implementation-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          calculationResult
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.implementationPlan) {
        setImplementationPlan(data.implementationPlan);
      } else {
        throw new Error('Failed to generate implementation plan');
      }
    } catch (err) {
      console.error('Error fetching implementation plan:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetch && formData && calculationResult) {
      fetchImplementationPlan();
    }
  }, [shouldFetch, formData.sessionId, calculationResult?.totalSavings]); // Re-fetch when these key values change

  const refetch = () => {
    fetchImplementationPlan();
  };

  return {
    implementationPlan,
    isLoading,
    error,
    refetch
  };
} 