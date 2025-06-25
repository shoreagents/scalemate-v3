// Location and geographic types for the ScaleMate application

// Country code to Country name mapping for IP geolocation (internal use only)
// This maps ANY country code to full name (not just supported countries)
const COUNTRY_CODE_TO_COUNTRY: Record<string, string> = {
  // Supported countries (used by app)
  'US': 'United States',
  'AU': 'Australia',
  'CA': 'Canada',
  'GB': 'United Kingdom',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  
  // Additional common countries (for translation only)
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'IE': 'Ireland',
  'PT': 'Portugal',
  'GR': 'Greece',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
  'BG': 'Bulgaria',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'SK': 'Slovakia',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'LU': 'Luxembourg',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'IS': 'Iceland',
  'LI': 'Liechtenstein',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'VA': 'Vatican City',
  'AD': 'Andorra',
  
  // Asia Pacific
  'JP': 'Japan',
  'KR': 'South Korea',
  'CN': 'China',
  'IN': 'India',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'PH': 'Philippines',
  'MY': 'Malaysia',
  'ID': 'Indonesia',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'MO': 'Macao',
  
  // Americas
  'MX': 'Mexico',
  'BR': 'Brazil',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BO': 'Bolivia',
  'EC': 'Ecuador',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'GT': 'Guatemala',
  'HN': 'Honduras',
  'SV': 'El Salvador',
  'NI': 'Nicaragua',
  'BZ': 'Belize',
  'JM': 'Jamaica',
  'TT': 'Trinidad and Tobago',
  'BB': 'Barbados',
  'GD': 'Grenada',
  'LC': 'Saint Lucia',
  'VC': 'Saint Vincent and the Grenadines',
  'AG': 'Antigua and Barbuda',
  'KN': 'Saint Kitts and Nevis',
  'DM': 'Dominica',
  
  // Middle East & Africa
  'AE': 'United Arab Emirates',
  'SA': 'Saudi Arabia',
  'IL': 'Israel',
  'TR': 'Turkey',
  'EG': 'Egypt',
  'ZA': 'South Africa',
  'NG': 'Nigeria',
  'KE': 'Kenya',
  'GH': 'Ghana',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'DZ': 'Algeria',
  'LY': 'Libya',
  'SD': 'Sudan',
  'ET': 'Ethiopia',
  'UG': 'Uganda',
  'TZ': 'Tanzania',
  'ZW': 'Zimbabwe',
  'BW': 'Botswana',
  'ZM': 'Zambia',
  'MW': 'Malawi',
  'MZ': 'Mozambique',
  'AO': 'Angola',
  'NA': 'Namibia',
  'SZ': 'Eswatini',
  'LS': 'Lesotho',
  
  // Others
  'RU': 'Russia',
  'UA': 'Ukraine',
  'BY': 'Belarus',
  'MD': 'Moldova',
  'GE': 'Georgia',
  'AM': 'Armenia',
  'AZ': 'Azerbaijan',
  'KZ': 'Kazakhstan',
  'UZ': 'Uzbekistan',
  'KG': 'Kyrgyzstan',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'MN': 'Mongolia'
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
  asn?: string;
  country_calling_code?: string;
  country_tld?: string;
  postal?: string;
  utc_offset?: string;
}

// Manual location selection interface
export interface ManualLocation {
  country: string;
  currency: string;
  city?: string;
  region?: string;
  latitude?: number;
  longitude?: number;
}

// Standardized location data for the app
export type LocationData = {
  country: string;
  countryName: string;
  currency: string;
  currencySymbol: string;
  detected: boolean;
  ipAddress?: string;
};

// **UTILITY FUNCTIONS** - Centralized location handling

/**
 * Convert country code to full country name using the mapping
 * Returns null if country code is not in our supported mapping
 */
export function getCountryFromCode(countryCode: string): string | null {
  return COUNTRY_CODE_TO_COUNTRY[countryCode] || null;
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
    country: manual.country,
    countryName: manual.country,
    currency: getCurrencyFromCountry(manual.country),
    currencySymbol: getCurrencySymbolFromCountry(manual.country),
    detected: false
  };
} 