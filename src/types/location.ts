// Location and geographic types for the ScaleMate application

// Supported countries for savings comparison
export type Country = 'Australia' | 'United States' | 'Canada' | 'United Kingdom' | 'New Zealand' | 'Singapore';

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