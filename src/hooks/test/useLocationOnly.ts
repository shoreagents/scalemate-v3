import { useState, useEffect } from 'react';

interface LocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  currency: string;
}

interface IpInfo {
  detectedIp: string;
  actualIp: string;
  isLocalIP: boolean;
  detectedAt: string;
  source: string;
  fromCache?: boolean;
}

interface UseLocationOnlyReturn {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  ipInfo: IpInfo | null;
  refetch: () => void;
}

async function getLocationFromIP(): Promise<{ location: LocationData; ipInfo: IpInfo }> {
  try {
    // Use our IP location API endpoint (which calls ipapi.co server-side)
    const response = await fetch('/api/ip-location');
    const data = await response.json();
    
    if (data.success && data.location) {
      return {
        location: data.location,
        ipInfo: {
          detectedIp: data.detectedIp,
          actualIp: data.actualIp,
          isLocalIP: data.isLocalIP,
          detectedAt: data.detectedAt,
          source: data.source,
          fromCache: data.fromCache
        }
      };
    } else {
      throw new Error(data.error || 'Failed to get location');
    }
  } catch (error) {
    console.error('Error fetching location:', error);
    // Fallback to Australia as default
    return {
      location: {
        country: 'Australia',
        region: 'New South Wales',
        city: 'Sydney', 
        timezone: 'Australia/Sydney',
        currency: 'AUD'
      },
      ipInfo: {
        detectedIp: 'Unknown',
        actualIp: 'Unknown',
        isLocalIP: false,
        detectedAt: new Date().toISOString(),
        source: 'Fallback',
        fromCache: false
      }
    };
  }
}

export function useLocationOnly(): UseLocationOnlyReturn {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldRefetch, setShouldRefetch] = useState(0);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { location: locationData, ipInfo: ipInfoData } = await getLocationFromIP();
      setLocation(locationData);
      setIpInfo(ipInfoData);

      console.log('📍 Location detected:', locationData);
      console.log('🌐 IP Info:', ipInfoData);

    } catch (err) {
      console.error('Error fetching location:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount and when refetch is called
  useEffect(() => {
    fetchLocation();
  }, [shouldRefetch]);

  const refetch = () => {
    setShouldRefetch(prev => prev + 1);
  };

  return {
    location,
    ipInfo,
    isLoading,
    error,
    refetch
  };
} 