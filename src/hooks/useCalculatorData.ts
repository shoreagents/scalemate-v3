import { useState, useEffect, useCallback } from 'react';

interface LocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  currency: string;
}

interface PortfolioIndicator {
  min: number;
  max: number;
  tier: 'growing' | 'large' | 'major' | 'enterprise';
  description: string;
  recommendedTeamSize: {
    assistantPropertyManager: number;
    leasingCoordinator: number;
    marketingSpecialist: number;
  };
      averageRevenue: { min: number; max: number };
    implementationComplexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
    marketInsights?: string;
  }

type PortfolioSize = '500-999' | '1000-1999' | '2000-4999' | '5000+';

interface CalculatorDataResponse {
  success: boolean;
  location: LocationData;
  portfolioData: Record<PortfolioSize, PortfolioIndicator>;
  generatedAt: string;
  generatedBy: 'claude-ai' | 'fallback';
  note?: string;
  error?: string;
}

interface UseCalculatorDataReturn {
  location: LocationData | null;
  portfolioData: Record<PortfolioSize, PortfolioIndicator> | null;
  isLoading: boolean;
  error: string | null;
  isAIGenerated: boolean;
  refetch: () => void;
}

export function useCalculatorData(): UseCalculatorDataReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [portfolioData, setPortfolioData] = useState<Record<PortfolioSize, PortfolioIndicator> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🌍 Fetching location-specific calculator data...');
      
      const response = await fetch('/api/calculator-data');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CalculatorDataResponse = await response.json();
      
      if (data.location && data.portfolioData) {
        setLocation(data.location);
        setPortfolioData(data.portfolioData);
        setIsAIGenerated(data.generatedBy === 'claude-ai');
        
        console.log('✅ Calculator data loaded:', {
          location: `${data.location.city}, ${data.location.country}`,
          isAI: data.generatedBy === 'claude-ai',
          portfolioKeys: Object.keys(data.portfolioData)
        });
      } else {
        throw new Error(data.error || 'Failed to get calculator data');
      }
    } catch (err) {
      console.error('Error fetching calculator data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsAIGenerated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch data on mount and when refetch is called
  useEffect(() => {
    fetchData();
  }, [fetchData, shouldRefetch]);

  const refetch = () => {
    setShouldRefetch(prev => prev + 1);
  };

  return {
    location,
    portfolioData,
    isLoading,
    error,
    isAIGenerated,
    refetch
  };
} 