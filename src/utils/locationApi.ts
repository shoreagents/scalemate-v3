// Location API utilities for fetching countries
import { IPLocationData } from '@/types/location';

export interface Country {
  name: {
    common: string;
    official: string;
  };
  cca2: string;
  cca3: string;
  region: string;
  subregion?: string;
  capital?: string[];
  population: number;
}

// Cache for countries to avoid repeated API calls
let countriesCache: Country[] | null = null;

/**
 * Fetch all countries from REST Countries API
 */
export async function fetchCountries(): Promise<Country[]> {
  if (countriesCache) {
    return countriesCache;
  }

  try {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2,cca3,region,subregion,capital,population');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const countries: Country[] = await response.json();
    
    // Sort countries alphabetically by common name
    countriesCache = countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    
    console.log('📍 Fetched', countriesCache.length, 'countries from REST Countries API');
    return countriesCache;
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    return [];
  }
}

/**
 * Get all countries as a simple list of country names
 */
export async function getAllCountryNames(): Promise<string[]> {
  const countries = await fetchCountries();
  return countries.map(country => country.name.common);
}

/**
 * Search countries by name (fuzzy search)
 */
export function searchCountries(query: string, countries: Country[]): Country[] {
  if (!query.trim()) return countries;
  
  const searchTerm = query.toLowerCase();
  return countries.filter(country => 
    country.name.common.toLowerCase().includes(searchTerm) ||
    country.name.official.toLowerCase().includes(searchTerm)
  );
}

/**
 * Fetch user's location based on IP address using ipapi.co
 * Falls back to US if detection fails
 */
export async function fetchIPLocation(): Promise<IPLocationData> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: IPLocationData = await response.json();
    console.log('📍 IP-based location detected:', data.country_name, `(${data.country_code})`);
    return data;
  } catch (error) {
    console.error('Failed to fetch IP location:', error);
    // Return US fallback data
    return {
      ip: '',
      city: '',
      region: '',
      country_name: 'United States',
      country_code: 'US',
      timezone: 'America/New_York',
      latitude: 0,
      longitude: 0,
      currency: 'USD',
      currency_name: 'US Dollar',
      languages: 'en-US',
      org: ''
    };
  }
} 