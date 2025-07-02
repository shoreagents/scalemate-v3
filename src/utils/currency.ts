/**
 * Currency utilities for ScaleMate
 * Can be used in both client and server environments
 * 
 * Flow: Live API → Static fallback data
 */

// Cache for live exchange rates (24-hour cache)
interface ExchangeRateCache {
  rates: Record<string, number>;
  timestamp: number;
  baseCurrency: string;
}

const EXCHANGE_RATE_CACHE_KEY = 'scalemate-exchange-rates';
const EXCHANGE_RATE_CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

// Exchange rate precision configuration
const EXCHANGE_RATE_DECIMAL_PLACES = 4; // Round to 4 decimal places (0.01764 → 0.0177)
                                         // 4 decimal places provides good precision for accurate calculations
                                         // Examples: PHP to USD ≈ 0.0180, EUR to USD ≈ 1.0850

/**
 * Round exchange rate to consistent decimal places for precise calculations
 * Examples: 0.01764 → 0.0177, 1.23456789 → 1.2346
 */
function roundExchangeRate(rate: number): number {
  const multiplier = Math.pow(10, EXCHANGE_RATE_DECIMAL_PLACES);
  return (rate * multiplier) / multiplier;
}

// Load cached exchange rates from localStorage
function loadExchangeRateCache(): ExchangeRateCache | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    
    const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (!cached) return null;
    
    const parsed: ExchangeRateCache = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - parsed.timestamp < EXCHANGE_RATE_CACHE_DURATION) {
      return parsed;
    }
    
    // Cache expired, remove it
    localStorage.removeItem(EXCHANGE_RATE_CACHE_KEY);
    return null;
  } catch (error) {
    console.warn('⚠️ Failed to load exchange rate cache:', error);
    return null;
  }
}

// Save exchange rates to localStorage cache
function saveExchangeRateCache(cache: ExchangeRateCache): void {
  try {
    if (typeof localStorage === 'undefined') return;
    
    localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(cache));
    console.log('💾 Cached live exchange rates for 24 hours');
  } catch (error) {
    console.warn('⚠️ Failed to save exchange rate cache:', error);
  }
}

/**
 * Fetch live exchange rates from free APIs
 * Uses multiple fallback endpoints for reliability
 */
async function fetchLiveExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number> | null> {
  const base = baseCurrency.toUpperCase();
  
  // API endpoints in order of preference
  const apis = [
    // Primary: Fawaz Ahmed (completely free, no API key)
    {
      url: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${base.toLowerCase()}.json`,
      parser: (data: any) => data[base.toLowerCase()]
    },
    // Fallback 1: Cloudflare mirror
    {
      url: `https://latest.currency-api.pages.dev/v1/currencies/${base.toLowerCase()}.json`,
      parser: (data: any) => data[base.toLowerCase()]
    },
    // Fallback 2: ExchangeRate.host
    {
      url: `https://api.exchangerate.host/latest?base=${base}`,
      parser: (data: any) => data.rates
    }
  ];

  for (const api of apis) {
    try {
      console.log(`🌐 Fetching live exchange rates from API (base: ${base})`);
      
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout for better UX
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rates = api.parser(data);
      
      if (rates && typeof rates === 'object') {
        console.log(`✅ Successfully fetched live exchange rates from API (${Object.keys(rates).length} currencies)`);
        
        // Cache the successful result
        const cacheEntry: ExchangeRateCache = {
          rates,
          timestamp: Date.now(),
          baseCurrency: base
        };
        saveExchangeRateCache(cacheEntry);
        
        return rates;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to fetch from ${api.url}:`, error);
      continue; // Try next API
    }
  }
  
  console.log('❌ All live exchange rate APIs failed, falling back to static data');
  return null;
}

/**
 * Get live exchange rate multiplier for a currency
 * NOW: Uses only live API - no static fallback
 * Throws error if all APIs fail
 */
export async function getLiveExchangeRateMultiplier(targetCurrency: string, baseCurrency: string = 'USD'): Promise<number> {
  const target = targetCurrency.toUpperCase();
  const base = baseCurrency.toUpperCase();
  
  // If same currency, return 1
  if (target === base) return 1.0;
  
  try {
    // First check cache
    const cached = loadExchangeRateCache();
    if (cached && cached.baseCurrency === base) {
              const cachedRate = cached.rates[target.toLowerCase()];
        if (cachedRate) {
          console.log(`📊 Using cached exchange rate: ${base} → ${target} = ${cachedRate}`);
          return cachedRate;
        }
    }
    
    // Fetch live rates
    const liveRates = await fetchLiveExchangeRates(base);
    if (liveRates) {
      const liveRate = liveRates[target.toLowerCase()];
      if (liveRate) {
        console.log(`🌐 Using live exchange rate: ${base} → ${target} = ${liveRate}`);
        return liveRate;
      }
    }
  } catch (error) {
    console.warn('⚠️ Error fetching live exchange rates:', error);
  }
  
  // No static fallback - throw error
  console.error('❌ All currency APIs failed, cannot provide exchange rate');
  throw new Error(`Unable to get exchange rate for ${base} to ${target}. Please check your internet connection and try again.`);
}

/**
 * Clear exchange rate cache (useful for testing or manual refresh)
 */
export function clearExchangeRateCache(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(EXCHANGE_RATE_CACHE_KEY);
      console.log('🗑️ Exchange rate cache cleared');
    }
  } catch (error) {
    console.warn('⚠️ Failed to clear exchange rate cache:', error);
  }
}

// Direct exchange rate cache
const directRateCache = new Map<string, { rate: number; timestamp: number }>();
const directRatePromises = new Map<string, Promise<number>>();
const DIRECT_RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get direct exchange rate between two currencies
 * This avoids using USD as an intermediary for more accurate conversions
 * NOW: Uses only live API with caching
 */
export async function getDirectExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  const cacheKey = `${fromCurrency}-${toCurrency}`;
  const cached = directRateCache.get(cacheKey);
  
  // Return cached rate if it's still valid
  if (cached && (Date.now() - cached.timestamp) < DIRECT_RATE_CACHE_DURATION) {
    console.log('💾 Using cached direct rate:', fromCurrency, 'to', toCurrency, '=', cached.rate);
    return cached.rate;
  }
  
  // Check if there's already a pending request for this currency pair
  const existingPromise = directRatePromises.get(cacheKey);
  if (existingPromise) {
    console.log('⏳ Waiting for existing request:', fromCurrency, 'to', toCurrency);
    return existingPromise;
  }
  
  console.log('🔄 Attempting direct conversion from', fromCurrency, 'to', toCurrency);
  
  // Create a promise for this request and store it
  const apiPromise = (async (): Promise<number> => {
  const apis = [
    // Primary: Free currency API (different URL structure)
    {
      url: `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`,
      parser: (data: any) => data[fromCurrency.toLowerCase()][toCurrency.toLowerCase()]
    },
    // Fallback: Alternative free API
    {
      url: `https://api.exchangerate-api.com/v4/latest/${fromCurrency.toUpperCase()}`,
      parser: (data: any) => data.rates[toCurrency.toUpperCase()]
    },
    // Additional fallback: ExchangeRate.host
    {
      url: `https://api.exchangerate.host/latest?base=${fromCurrency.toUpperCase()}`,
      parser: (data: any) => data.rates[toCurrency.toUpperCase()]
    }
  ];

  for (const api of apis) {
    try {
      console.log('📡 Trying API:', api.url);
      const response = await fetch(api.url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        console.log('❌ API failed:', api.url, response.status);
        continue;
      }
      
      const data = await response.json();
      const rate = api.parser(data);
      
      if (rate && typeof rate === 'number' && !isNaN(rate) && rate > 0) {
        console.log('✅ Got live rate:', rate);
        // Cache the successful rate (keeping full precision)
        const fullPrecisionRate = rate;
        directRateCache.set(cacheKey, { rate: fullPrecisionRate, timestamp: Date.now() });
        return fullPrecisionRate;
      }
    } catch (error) {
      console.warn(`Failed to fetch direct rate from ${api.url}:`, error);
      continue;
    }
  }

  // If all APIs fail, throw error - no static fallback
  throw new Error(`All currency APIs failed for ${fromCurrency} to ${toCurrency} conversion`);
})();

// Store the promise and clean it up when done
directRatePromises.set(cacheKey, apiPromise);
apiPromise.finally(() => {
  directRatePromises.delete(cacheKey);
});

return apiPromise;
}

/**
 * Get the best available exchange rate multiplier
 * NOW: Uses only live API - no static fallback
 * Throws error if all APIs fail
 */
export async function getBestExchangeRateMultiplier(targetCurrency: string, baseCurrency: string = 'USD'): Promise<number> {
  try {
    // Try to get direct exchange rate first
    const directRate = await getDirectExchangeRate(baseCurrency, targetCurrency);
    return directRate;
  } catch (error) {
    console.error('❌ All currency APIs failed, cannot provide exchange rate:', error);
    throw new Error(`Unable to get exchange rate for ${baseCurrency} to ${targetCurrency}. Please check your internet connection and try again.`);
  }
}

// Helper function to get currency symbol from currency code
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    // Major Global Currencies
    'USD': '$',       // United States Dollar
    'EUR': '€',       // Euro
    'GBP': '£',       // British Pound
    'JPY': '¥',       // Japanese Yen
    'CNY': '¥',       // Chinese Yuan
    'CHF': 'CHF',     // Swiss Franc
    
    // Asia-Pacific
    'AUD': 'A$',      // Australian Dollar
    'CAD': 'C$',      // Canadian Dollar
    'NZD': 'NZ$',     // New Zealand Dollar
    'SGD': 'S$',      // Singapore Dollar
    'HKD': 'HK$',     // Hong Kong Dollar
    'KRW': '₩',       // South Korean Won
    'PHP': '₱',       // Philippine Peso
    'THB': '฿',       // Thai Baht
    'MYR': 'RM',      // Malaysian Ringgit
    'IDR': 'Rp',      // Indonesian Rupiah
    'VND': '₫',       // Vietnamese Dong
    'TWD': 'NT$',     // Taiwan Dollar
    'INR': '₹',       // Indian Rupee
    'PKR': '₨',       // Pakistani Rupee
    'BDT': '৳',       // Bangladeshi Taka
    'LKR': 'Rs',      // Sri Lankan Rupee
    'NPR': 'Rs',      // Nepalese Rupee
    'BTN': 'Nu',      // Bhutanese Ngultrum
    'MVR': 'Rf',      // Maldivian Rufiyaa
    'MMK': 'K',       // Myanmar Kyat
    'LAK': '₭',       // Lao Kip
    'KHR': '៛',       // Cambodian Riel
    'BND': 'B$',      // Brunei Dollar
    'MOP': 'MOP$',    // Macanese Pataca
    'FJD': 'FJ$',     // Fijian Dollar
    'PGK': 'K',       // Papua New Guinea Kina
    'SBD': 'SI$',     // Solomon Islands Dollar
    'VUV': 'VT',      // Vanuatu Vatu
    'TOP': 'T$',      // Tongan Paʻanga
    'WST': 'WS$',     // Samoan Tala
    'NCF': 'F',       // CFP Franc
    'XPF': 'F',       // CFP Franc
    
    // Europe
    'NOK': 'kr',      // Norwegian Krone
    'SEK': 'kr',      // Swedish Krona
    'DKK': 'kr',      // Danish Krone
    'ISK': 'kr',      // Icelandic Krona
    'PLN': 'zł',      // Polish Zloty
    'CZK': 'Kč',      // Czech Koruna
    'HUF': 'Ft',      // Hungarian Forint
    'RON': 'lei',     // Romanian Leu
    'BGN': 'лв',      // Bulgarian Lev
    'HRK': 'kn',      // Croatian Kuna
    'RSD': 'дин',     // Serbian Dinar
    'BAM': 'KM',      // Bosnia and Herzegovina Convertible Mark
    'MKD': 'ден',     // Macedonian Denar
    'ALL': 'L',       // Albanian Lek
    'MDL': 'L',       // Moldovan Leu
    'UAH': '₴',       // Ukrainian Hryvnia
    'BYN': 'Br',      // Belarusian Ruble
    'RUB': '₽',       // Russian Ruble
    'GEL': '₾',       // Georgian Lari
    'AMD': '֏',       // Armenian Dram
    'AZN': '₼',       // Azerbaijani Manat
    'TRY': '₺',       // Turkish Lira
    'CYP': '£',       // Cyprus Pound (legacy)
    
    // Middle East & Africa
    'ILS': '₪',       // Israeli Shekel
    'JOD': 'JD',      // Jordanian Dinar
    'LBP': 'ل.ل',     // Lebanese Pound
    'SYP': '£S',      // Syrian Pound
    'IRR': '﷼',       // Iranian Rial
    'IQD': 'ع.د',     // Iraqi Dinar
    'SAR': '﷼',       // Saudi Riyal
    'AED': 'د.إ',     // UAE Dirham
    'QAR': '﷼',       // Qatari Riyal
    'KWD': 'د.ك',     // Kuwaiti Dinar
    'BHD': '.د.ب',    // Bahraini Dinar
    'OMR': '﷼',       // Omani Rial
    'YER': '﷼',       // Yemeni Rial
    'EGP': '£E',      // Egyptian Pound
    'SDG': 'ج.س',     // Sudanese Pound
    'LYD': 'ل.د',     // Libyan Dinar
    'TND': 'د.ت',     // Tunisian Dinar
    'DZD': 'د.ج',     // Algerian Dinar
    'MAD': 'د.م.',    // Moroccan Dirham
    'ZAR': 'R',       // South African Rand
    'BWP': 'P',       // Botswanan Pula
    'NAD': 'N$',      // Namibian Dollar
    'SZL': 'E',       // Swazi Lilangeni
    'LSL': 'M',       // Lesotho Loti
    'ZMW': 'ZK',      // Zambian Kwacha
    'ZWL': 'Z$',      // Zimbabwean Dollar
    'MWK': 'MK',      // Malawian Kwacha
    'MZN': 'MT',      // Mozambican Metical
    'MGA': 'Ar',      // Malagasy Ariary
    'MUR': '₨',       // Mauritian Rupee
    'SCR': '₨',       // Seychellois Rupee
    'KES': 'KSh',     // Kenyan Shilling
    'UGX': 'USh',     // Ugandan Shilling
    'TZS': 'TSh',     // Tanzanian Shilling
    'RWF': 'FRw',     // Rwandan Franc
    'BIF': 'FBu',     // Burundian Franc
    'ETB': 'Br',      // Ethiopian Birr
    'ERN': 'Nfk',     // Eritrean Nakfa
    'DJF': 'Fdj',     // Djiboutian Franc
    'SOS': 'S',       // Somali Shilling
    'NGN': '₦',       // Nigerian Naira
    'GHS': '₵',       // Ghanaian Cedi
    'XOF': 'CFA',     // West African CFA Franc
    'XAF': 'FCFA',    // Central African CFA Franc
    'CVE': '$',       // Cape Verdean Escudo
    'GMD': 'D',       // Gambian Dalasi
    'GNF': 'FG',      // Guinean Franc
    'LRD': 'L$',      // Liberian Dollar
    'SLL': 'Le',      // Sierra Leonean Leone
    'CDF': 'FC',      // Congolese Franc
    'AOA': 'Kz',      // Angolan Kwanza
    'STN': 'Db',      // São Tomé and Príncipe Dobra
    
    // Americas
    'BRL': 'R$',      // Brazilian Real
    'MXN': '$',       // Mexican Peso
    'ARS': '$',       // Argentine Peso
    'CLP': '$',       // Chilean Peso
    'COP': '$',       // Colombian Peso
    'PEN': 'S/',      // Peruvian Sol
    'UYU': '$U',      // Uruguayan Peso
    'PYG': '₲',       // Paraguayan Guarani
    'BOB': 'Bs',      // Bolivian Boliviano
    'VES': 'Bs.S',    // Venezuelan Bolívar Soberano
    'GYD': 'G$',      // Guyanese Dollar
    'SRD': '$',       // Surinamese Dollar
    'GTQ': 'Q',       // Guatemalan Quetzal
    'BZD': 'BZ$',     // Belize Dollar
    'HNL': 'L',       // Honduran Lempira
    'NIO': 'C$',      // Nicaraguan Córdoba
    'CRC': '₡',       // Costa Rican Colón
    'PAB': 'B/.',     // Panamanian Balboa
    'DOP': 'RD$',     // Dominican Peso
    'HTG': 'G',       // Haitian Gourde
    'JMD': 'J$',      // Jamaican Dollar
    'BBD': 'Bds$',    // Barbadian Dollar
    'TTD': 'TT$',     // Trinidad and Tobago Dollar
    'XCD': 'EC$',     // East Caribbean Dollar
    'AWG': 'ƒ',       // Aruban Florin
    'ANG': 'ƒ',       // Netherlands Antillean Guilder
    'CUP': '$',       // Cuban Peso
    'BSD': 'B$',      // Bahamian Dollar
    'BMD': 'BD$',     // Bermudian Dollar
    'KYD': 'CI$',     // Cayman Islands Dollar
  };
  
  return symbols[currencyCode] || '$';
}

// Helper function to detect currency based on country name
export function getCurrencyByCountry(countryName: string): string {
  const countryCurrencyMap: Record<string, string> = {
    // North America
    'United States': 'USD',
    'United States of America': 'USD',
    'USA': 'USD',
    'US': 'USD',
    'Canada': 'CAD',
    'Mexico': 'MXN',
    'Greenland': 'DKK',
    
    // Central America & Caribbean
    'Guatemala': 'GTQ',
    'Belize': 'BZD',
    'El Salvador': 'USD',
    'Honduras': 'HNL',
    'Nicaragua': 'NIO',
    'Costa Rica': 'CRC',
    'Panama': 'PAB',
    'Cuba': 'CUP',
    'Jamaica': 'JMD',
    'Haiti': 'HTG',
    'Dominican Republic': 'DOP',
    'Puerto Rico': 'USD',
    'Trinidad and Tobago': 'TTD',
    'Barbados': 'BBD',
    'Bahamas': 'BSD',
    'Antigua and Barbuda': 'XCD',
    'Saint Kitts and Nevis': 'XCD',
    'Dominica': 'XCD',
    'Saint Lucia': 'XCD',
    'Saint Vincent and the Grenadines': 'XCD',
    'Grenada': 'XCD',
    'Aruba': 'AWG',
    'Curaçao': 'ANG',
    'Sint Maarten': 'ANG',
    'Bermuda': 'BMD',
    'Cayman Islands': 'KYD',
    
    // South America
    'Brazil': 'BRL',
    'Argentina': 'ARS',
    'Chile': 'CLP',
    'Colombia': 'COP',
    'Peru': 'PEN',
    'Venezuela': 'VES',
    'Ecuador': 'USD',
    'Bolivia': 'BOB',
    'Paraguay': 'PYG',
    'Uruguay': 'UYU',
    'Guyana': 'GYD',
    'Suriname': 'SRD',
    'French Guiana': 'EUR',
    
    // Europe
    'United Kingdom': 'GBP',
    'UK': 'GBP',
    'Great Britain': 'GBP',
    'England': 'GBP',
    'Scotland': 'GBP',
    'Wales': 'GBP',
    'Northern Ireland': 'GBP',
    'Ireland': 'EUR',
    'Germany': 'EUR',
    'France': 'EUR',
    'Spain': 'EUR',
    'Italy': 'EUR',
    'Netherlands': 'EUR',
    'Belgium': 'EUR',
    'Austria': 'EUR',
    'Portugal': 'EUR',
    'Finland': 'EUR',
    'Luxembourg': 'EUR',
    'Slovenia': 'EUR',
    'Slovakia': 'EUR',
    'Estonia': 'EUR',
    'Latvia': 'EUR',
    'Lithuania': 'EUR',
    'Malta': 'EUR',
    'Cyprus': 'EUR',
    'Greece': 'EUR',
    'Switzerland': 'CHF',
    'Norway': 'NOK',
    'Sweden': 'SEK',
    'Denmark': 'DKK',
    'Iceland': 'ISK',
    'Poland': 'PLN',
    'Czech Republic': 'CZK',
    'Hungary': 'HUF',
    'Romania': 'RON',
    'Bulgaria': 'BGN',
    'Croatia': 'HRK',
    'Serbia': 'RSD',
    'Bosnia and Herzegovina': 'BAM',
    'Montenegro': 'EUR',
    'North Macedonia': 'MKD',
    'Albania': 'ALL',
    'Kosovo': 'EUR',
    'Moldova': 'MDL',
    'Ukraine': 'UAH',
    'Belarus': 'BYN',
    'Russia': 'RUB',
    'Georgia': 'GEL',
    'Armenia': 'AMD',
    'Azerbaijan': 'AZN',
    'Turkey': 'TRY',
    
    // Asia
    'China': 'CNY',
    'Japan': 'JPY',
    'South Korea': 'KRW',
    'North Korea': 'KPW',
    'Mongolia': 'MNT',
    'Taiwan': 'TWD',
    'Hong Kong': 'HKD',
    'Macau': 'MOP',
    'India': 'INR',
    'Pakistan': 'PKR',
    'Bangladesh': 'BDT',
    'Sri Lanka': 'LKR',
    'Nepal': 'NPR',
    'Bhutan': 'BTN',
    'Maldives': 'MVR',
    'Afghanistan': 'AFN',
    'Iran': 'IRR',
    'Iraq': 'IQD',
    'Syria': 'SYP',
    'Lebanon': 'LBP',
    'Jordan': 'JOD',
    'Israel': 'ILS',
    'Palestine': 'ILS',
    'Saudi Arabia': 'SAR',
    'UAE': 'AED',
    'United Arab Emirates': 'AED',
    'Qatar': 'QAR',
    'Kuwait': 'KWD',
    'Bahrain': 'BHD',
    'Oman': 'OMR',
    'Yemen': 'YER',
    'Kazakhstan': 'KZT',
    'Uzbekistan': 'UZS',
    'Turkmenistan': 'TMT',
    'Kyrgyzstan': 'KGS',
    'Tajikistan': 'TJS',
    'Thailand': 'THB',
    'Vietnam': 'VND',
    'Laos': 'LAK',
    'Cambodia': 'KHR',
    'Myanmar': 'MMK',
    'Malaysia': 'MYR',
    'Singapore': 'SGD',
    'Brunei': 'BND',
    'Indonesia': 'IDR',
    'Philippines': 'PHP',
    'Timor-Leste': 'USD',
    
    // Oceania
    'Australia': 'AUD',
    'New Zealand': 'NZD',
    'Papua New Guinea': 'PGK',
    'Fiji': 'FJD',
    'Solomon Islands': 'SBD',
    'Vanuatu': 'VUV',
    'New Caledonia': 'XPF',
    'French Polynesia': 'XPF',
    'Samoa': 'WST',
    'Tonga': 'TOP',
    'Kiribati': 'AUD',
    'Tuvalu': 'AUD',
    'Nauru': 'AUD',
    'Palau': 'USD',
    'Marshall Islands': 'USD',
    'Micronesia': 'USD',
    
    // Africa
    'Egypt': 'EGP',
    'Libya': 'LYD',
    'Tunisia': 'TND',
    'Algeria': 'DZD',
    'Morocco': 'MAD',
    'Sudan': 'SDG',
    'South Sudan': 'SSP',
    'Ethiopia': 'ETB',
    'Eritrea': 'ERN',
    'Djibouti': 'DJF',
    'Somalia': 'SOS',
    'Kenya': 'KES',
    'Uganda': 'UGX',
    'Tanzania': 'TZS',
    'Rwanda': 'RWF',
    'Burundi': 'BIF',
    'South Africa': 'ZAR',
    'Namibia': 'NAD',
    'Botswana': 'BWP',
    'Zimbabwe': 'ZWL',
    'Zambia': 'ZMW',
    'Malawi': 'MWK',
    'Mozambique': 'MZN',
    'Madagascar': 'MGA',
    'Mauritius': 'MUR',
    'Seychelles': 'SCR',
    'Comoros': 'KMF',
    'Lesotho': 'LSL',
    'Eswatini': 'SZL',
    'Swaziland': 'SZL',
    'Angola': 'AOA',
    'Democratic Republic of the Congo': 'CDF',
    'Republic of the Congo': 'XAF',
    'Central African Republic': 'XAF',
    'Chad': 'XAF',
    'Cameroon': 'XAF',
    'Equatorial Guinea': 'XAF',
    'Gabon': 'XAF',
    'São Tomé and Príncipe': 'STN',
    'Nigeria': 'NGN',
    'Ghana': 'GHS',
    'Ivory Coast': 'XOF',
    'Burkina Faso': 'XOF',
    'Mali': 'XOF',
    'Niger': 'XOF',
    'Senegal': 'XOF',
    'Guinea-Bissau': 'XOF',
    'Guinea': 'GNF',
    'Sierra Leone': 'SLL',
    'Liberia': 'LRD',
    'Togo': 'XOF',
    'Benin': 'XOF',
    'Cape Verde': 'CVE',
    'Gambia': 'GMD',
    'Mauritania': 'MRU'
  };
  
  return countryCurrencyMap[countryName] || 'USD';
}

/**
 * Get currency multiplier for revenue adjustments (STATIC FALLBACK)
 * Used for converting base USD revenue values to local currency equivalents
 * Updated with 2025 exchange rates - serves as fallback when live API fails
 * 
 * NOTE: Use getLiveExchangeRateMultiplier() for live rates with this as fallback
 */
export function getCurrencyMultiplier(currency: string): number {
  const multipliers: Record<string, number> = {
    // Major Global Currencies (2025 rates)
    'USD': 1.0,      // United States (base)
    'EUR': 0.92,     // European Union
    'GBP': 0.79,     // United Kingdom
    'JPY': 155.0,    // Japan
    'CNY': 7.25,     // China
    'CHF': 0.87,     // Switzerland
    
    // Asia-Pacific (2025 rates)
    'AUD': 1.58,     // Australia
    'CAD': 1.42,     // Canada
    'NZD': 1.73,     // New Zealand
    'SGD': 1.37,     // Singapore
    'HKD': 7.83,     // Hong Kong
    'KRW': 1380.0,   // South Korea
    'PHP': 58.5,     // Philippines
    'THB': 36.8,     // Thailand
    'MYR': 4.65,     // Malaysia
    'IDR': 16200.0,  // Indonesia
    'VND': 25400.0,  // Vietnam
    'TWD': 32.5,     // Taiwan
    'INR': 84.5,     // India
    'PKR': 280.0,    // Pakistan
    'BDT': 120.0,    // Bangladesh
    'LKR': 295.0,    // Sri Lanka
    'NPR': 135.0,    // Nepal
    'BTN': 84.5,     // Bhutan (pegged to INR)
    'MVR': 15.4,     // Maldives
    'MMK': 3500.0,   // Myanmar
    'LAK': 22000.0,  // Laos
    'KHR': 4150.0,   // Cambodia
    'BND': 1.37,     // Brunei
    'MOP': 8.05,     // Macau
    'FJD': 2.25,     // Fiji
    'PGK': 3.95,     // Papua New Guinea
    'SBD': 8.55,     // Solomon Islands
    'VUV': 125.0,    // Vanuatu
    'TOP': 2.35,     // Tonga
    'WST': 2.75,     // Samoa
    'XPF': 113.0,    // CFP Franc
    'NCF': 113.0,    // New Caledonia Franc
    
    // Europe (2025 rates)
    'NOK': 11.2,     // Norway
    'SEK': 11.5,     // Sweden
    'DKK': 6.85,     // Denmark
    'ISK': 140.0,    // Iceland
    'PLN': 4.15,     // Poland
    'CZK': 24.5,     // Czech Republic
    'HUF': 385.0,    // Hungary
    'RON': 4.75,     // Romania
    'BGN': 1.80,     // Bulgaria
    'HRK': 6.95,     // Croatia
    'RSD': 108.0,    // Serbia
    'BAM': 1.80,     // Bosnia and Herzegovina
    'MKD': 56.5,     // North Macedonia
    'ALL': 95.0,     // Albania
    'MDL': 18.2,     // Moldova
    'UAH': 41.5,     // Ukraine
    'BYN': 3.25,     // Belarus
    'RUB': 95.0,     // Russia
    'GEL': 2.85,     // Georgia
    'AMD': 405.0,    // Armenia
    'AZN': 1.70,     // Azerbaijan
    'TRY': 34.5,     // Turkey
    
    // Middle East & Africa (2025 rates)
    'ILS': 3.85,     // Israel
    'JOD': 0.709,    // Jordan
    'LBP': 89500.0,  // Lebanon
    'SYP': 13000.0,  // Syria
    'IRR': 42000.0,  // Iran
    'IQD': 1470.0,   // Iraq
    'SAR': 3.75,     // Saudi Arabia
    'AED': 3.67,     // UAE
    'QAR': 3.64,     // Qatar
    'KWD': 0.31,     // Kuwait
    'BHD': 0.377,    // Bahrain
    'OMR': 0.385,    // Oman
    'YER': 1540.0,   // Yemen
    'EGP': 49.5,     // Egypt
    'SDG': 600.0,    // Sudan
    'LYD': 4.85,     // Libya
    'TND': 3.15,     // Tunisia
    'DZD': 137.0,    // Algeria
    'MAD': 10.2,     // Morocco
    'ZAR': 19.8,     // South Africa
    'BWP': 14.2,     // Botswana
    'NAD': 19.8,     // Namibia
    'SZL': 19.8,     // Eswatini
    'LSL': 19.8,     // Lesotho
    'ZMW': 27.5,     // Zambia
    'ZWL': 6000.0,   // Zimbabwe
    'MWK': 1750.0,   // Malawi
    'MZN': 64.0,     // Mozambique
    'MGA': 4650.0,   // Madagascar
    'MUR': 46.5,     // Mauritius
    'SCR': 13.8,     // Seychelles
    'KES': 130.0,    // Kenya
    'UGX': 3850.0,   // Uganda
    'TZS': 2580.0,   // Tanzania
    'RWF': 1380.0,   // Rwanda
    'BIF': 2950.0,   // Burundi
    'ETB': 125.0,    // Ethiopia
    'ERN': 15.0,     // Eritrea
    'DJF': 178.0,    // Djibouti
    'SOS': 570.0,    // Somalia
    'NGN': 1520.0,   // Nigeria
    'GHS': 15.8,     // Ghana
    'XOF': 605.0,    // West African CFA Franc
    'XAF': 605.0,    // Central African CFA Franc
    'CVE': 101.5,    // Cape Verde
    'GMD': 68.0,     // Gambia
    'GNF': 8650.0,   // Guinea
    'LRD': 195.0,    // Liberia
    'SLL': 24500.0,  // Sierra Leone
    'CDF': 2750.0,   // Democratic Republic of Congo
    'AOA': 855.0,    // Angola
    'STN': 22.5,     // São Tomé and Príncipe
    'MRU': 39.5,     // Mauritania
    'KMF': 452.0,    // Comoros
    'SSP': 1300.0,   // South Sudan
    
    // Americas (2025 rates)
    'BRL': 6.15,     // Brazil
    'MXN': 20.5,     // Mexico
    'ARS': 1050.0,   // Argentina
    'CLP': 975.0,    // Chile
    'COP': 4250.0,   // Colombia
    'PEN': 3.75,     // Peru
    'UYU': 42.5,     // Uruguay
    'PYG': 7850.0,   // Paraguay
    'BOB': 6.92,     // Bolivia
    'VES': 45.0,     // Venezuela
    'GYD': 220.0,    // Guyana
    'SRD': 38.5,     // Suriname
    'GTQ': 7.75,     // Guatemala
    'BZD': 2.02,     // Belize
    'HNL': 25.2,     // Honduras
    'NIO': 37.0,     // Nicaragua
    'CRC': 525.0,    // Costa Rica
    'PAB': 1.0,      // Panama (pegged to USD)
    'DOP': 59.5,     // Dominican Republic
    'HTG': 155.0,    // Haiti
    'JMD': 158.0,    // Jamaica
    'BBD': 2.0,      // Barbados (pegged to USD)
    'TTD': 6.78,     // Trinidad and Tobago
    'XCD': 2.70,     // East Caribbean Dollar
    'AWG': 1.79,     // Aruba
    'ANG': 1.79,     // Netherlands Antilles
    'CUP': 24.0,     // Cuba
    'BSD': 1.0,      // Bahamas (pegged to USD)
    'BMD': 1.0,      // Bermuda (pegged to USD)
    'KYD': 0.82,     // Cayman Islands
    
    // Additional currencies
    'AFN': 70.0,     // Afghanistan
    'KZT': 475.0,    // Kazakhstan
    'UZS': 12800.0,  // Uzbekistan
    'TMT': 3.50,     // Turkmenistan
    'KGS': 89.5,     // Kyrgyzstan
    'TJS': 11.2,     // Tajikistan
    'KPW': 900.0,    // North Korea
    'MNT': 3450.0    // Mongolia
  };
  
  return multipliers[currency] || 1.0;
}

/**
 * Get currency for display purposes - defaults to USD for unsupported countries
 * This ensures consistent display currency for countries without salary data
 */
export function getDisplayCurrencyByCountry(countryName: string): string {
  // List of supported countries with salary data
  const supportedCountries = [
    'Australia',
    'Canada',
    'United Kingdom',
    'New Zealand',
    'Singapore',
    'Philippines',
    'United States'
  ];
  
  // If country is supported, use its actual currency
  if (supportedCountries.includes(countryName)) {
    return getCurrencyByCountry(countryName);
  }
  
  // For unsupported countries, default to USD
  return 'USD';
}

/**
 * Get currency for display purposes - only falls back to USD when API fails
 * When API is working, uses actual country currency
 */
export function getDisplayCurrencyByCountryWithAPIFallback(countryName: string, isAPIFailed: boolean = false): string {
  // List of supported countries with salary data
  const supportedCountries = [
    'Australia',
    'Canada',
    'United Kingdom',
    'New Zealand',
    'Singapore',
    'Philippines',
    'United States'
  ];
  
  // If country is supported, use its actual currency
  if (supportedCountries.includes(countryName)) {
    return getCurrencyByCountry(countryName);
  }
  
  // For unsupported countries:
  // - If API is working: use actual country currency
  // - If API failed: fall back to USD
  if (isAPIFailed) {
    return 'USD';
  } else {
    return getCurrencyByCountry(countryName);
  }
} 