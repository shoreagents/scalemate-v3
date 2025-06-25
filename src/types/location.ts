// Location and geographic types for the ScaleMate application

// Supported countries for savings comparison
export type Country = 'Australia' | 'United States' | 'Canada' | 'United Kingdom' | 'New Zealand' | 'Singapore';

// Valid countries array derived from Country type
export const VALID_COUNTRIES: readonly Country[] = ['Australia', 'United States', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore'] as const;

// Country code to Country name mapping for IP geolocation
export const COUNTRY_CODE_TO_COUNTRY: Record<string, Country> = {
  'US': 'United States',
  'AU': 'Australia',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'NZ': 'New Zealand',
  'SG': 'Singapore'
} as const;

// IP geolocation API response format (from ipapi.co)
export interface IPLocationData {
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

// Standardized location data for the app
export type LocationData = {
  country: Country;
  countryName: string;
  currency: string;
  currencySymbol: string;
  detected: boolean;
  ipAddress?: string;
};

// Manual location selection interface
export interface ManualLocation {
  country: string;
}

// Location context for API calls (flexible format)
export interface LocationContext {
  country: string;
  countryName?: string | undefined;
  region?: string | undefined;
  city?: string | undefined;
  currency?: string | undefined;
} 

// **UTILITY FUNCTIONS** - Centralized location handling

/**
 * Type guard to check if a string is a valid Country
 */
export function isValidCountry(country: string): country is Country {
  return VALID_COUNTRIES.includes(country as Country);
}

/**
 * Convert country code to full country name using the mapping
 */
export function getCountryFromCode(countryCode: string): Country {
  return COUNTRY_CODE_TO_COUNTRY[countryCode] || 'United States';
}

/**
 * Get effective country from manual or auto-detected location data
 * Manual location takes priority over auto-detected location
 */
export function getEffectiveCountry(userLocation?: LocationData, manualLocation?: ManualLocation | null): Country {
  // Manual location takes priority
  if (manualLocation?.country && isValidCountry(manualLocation.country)) {
    return manualLocation.country;
  }
  
  // Fallback to auto-detected location
  if (userLocation?.country) {
    return userLocation.country;
  }
  
  // Default fallback
  return 'United States';
}

/**
 * Create standardized LocationData from manual selection
 */
export function createLocationDataFromManual(
  manual: ManualLocation,
  getCurrencyFromCountry: (country: string) => string,
  getCurrencySymbolFromCountry: (country: string) => string
): LocationData {
  return {
    country: isValidCountry(manual.country) ? manual.country : 'United States',
    countryName: manual.country,
    currency: getCurrencyFromCountry(manual.country),
    currencySymbol: getCurrencySymbolFromCountry(manual.country),
    detected: false
  };
} 