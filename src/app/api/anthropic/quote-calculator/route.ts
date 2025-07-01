import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import {
  getStaticPortfolioIndicators
} from '@/utils/quoteCalculatorData';
import { LocationData } from '@/types/location';
import { promises as fs } from 'fs';
import path from 'path';

// Type for the request body
interface PortfolioIndicatorRequest {
  location: LocationData;
  requestType?: 'portfolio';
}

// File-based cache for development
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'quote-calculator-cache.json');

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.warn('⚠️ Could not create cache directory:', error);
  }
}

// Cache entry type
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Cache type
type CacheData = Record<string, CacheEntry>;

// Load cache from file
async function loadCache(): Promise<CacheData> {
  try {
    await ensureCacheDir();
    const data = await fs.readFile(CACHE_FILE, 'utf8');
    const cache: CacheData = JSON.parse(data);
    
    // Filter out expired entries
    const now = Date.now();
    const validEntries = Object.entries(cache).filter(([key, value]) => {
      return now - value.timestamp < CACHE_TTL;
    });
    
    const validCache = Object.fromEntries(validEntries);
    
    // Save back the filtered cache
    await fs.writeFile(CACHE_FILE, JSON.stringify(validCache, null, 2));
    
    console.log(`📂 [QUOTE-CALCULATOR] Loaded ${Object.keys(validCache).length} valid cache entries`);
    return validCache;
  } catch (error) {
    console.log('📂 [QUOTE-CALCULATOR] No existing cache file, starting fresh');
    return {};
  }
}

// Save cache to file
async function saveCache(cache: CacheData) {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`💾 [QUOTE-CALCULATOR] Saved ${Object.keys(cache).length} cache entries`);
  } catch (error) {
    console.error('❌ [QUOTE-CALCULATOR] Failed to save cache:', error);
  }
}

// Clear cache function
async function clearCache() {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify({}, null, 2));
    console.log('🗑️ [QUOTE-CALCULATOR] Cache cleared');
  } catch (error) {
    console.error('❌ [QUOTE-CALCULATOR] Failed to clear cache:', error);
  }
}



// Helper to build cache key
function buildCacheKey(location: LocationData) {
  return `${location.country || ''}|${location.countryName || ''}|${location.currency || ''}`;
}

function generatePortfolioPrompt(location: LocationData) {
  const countryName = location.countryName || location.country;
  const currency = location.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Portfolio size categories to generate (AI will determine actual property count ranges)
  const sizeCategories = [
    'small',
    'medium', 
    'large',
    'enterprise'
  ];

  // JSON template for the prompt (AI generates actual property count ranges)
  const jsonTemplate = sizeCategories.map(category => {
    return `    "${category}": {
      "min": [minimum property count for ${category} portfolio in ${countryName}],
      "max": [maximum property count for ${category} portfolio in ${countryName}],
      "description": "[${countryName}-specific description for ${category} portfolio in English]",
      "recommendedTeamSize": {
        "assistantPropertyManager": [number based on ${countryName} market],
        "leasingCoordinator": [number based on ${countryName} market],
        "marketingSpecialist": [number based on ${countryName} market]
      },
      "averageRevenue": { "min": [min revenue in ${currency} for ${category}], "max": [max revenue in ${currency} for ${category}] }
    }`;
  }).join(',\n');

  return `You are a property management industry expert specializing in ${countryName}. Generate portfolio indicators for the ${countryName} market as of ${currentDate}.

CONTEXT:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}
- Target: Property management companies considering offshore teams

PORTFOLIO CATEGORIES:
- small (entry-level portfolios)
- medium (growing portfolios) 
- large (established portfolios)
- enterprise (major portfolios)

TASK: Generate portfolio indicators for each category, including:
1. min/max property counts based on ${countryName} market conditions
2. ${countryName}-specific descriptions in English
3. recommendedTeamSize based on ${countryName} market needs
4. averageRevenue ranges in ${currency}

IMPORTANT: 
- Generate realistic property count ranges for ${countryName} market - do NOT use fixed ranges like 500-999. Consider local market conditions, property management industry size, and typical portfolio sizes in ${countryName}.
- All descriptions must be written in English, even for non-English speaking countries.

Do NOT include tier or implementationComplexity in your response.

Respond with ONLY a valid JSON object in this exact format:
{
${jsonTemplate}
}`;
}

export async function POST(request: NextRequest) {
  console.log('🚀 [QUOTE-CALCULATOR] API endpoint called');
  
  try {
    const body: PortfolioIndicatorRequest = await request.json();
    const { location, requestType = 'portfolio' } = body;

    console.log('📥 [QUOTE-CALCULATOR] Request received:', {
      location: location?.country,
      countryName: location?.countryName,
      currency: location?.currency,
      requestType,
      timestamp: new Date().toISOString()
    });

    if (!location?.country) {
      console.log('❌ [QUOTE-CALCULATOR] Missing location data');
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const cacheKey = buildCacheKey(location);
    const cache = await loadCache();
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('💾 [QUOTE-CALCULATOR] Returning cached data for:', location.country);
      return NextResponse.json({ ...cached.data, cache: true });
    }

    console.log('🔄 [QUOTE-CALCULATOR] No cache hit, proceeding with AI generation');

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    console.log('🌍 Processing quote-calculator request for:', {
      country: location.country,
      countryName,
      currency,
      requestType
    });

    if (requestType === 'portfolio') {
      console.log('🤖 [QUOTE-CALCULATOR] Starting AI generation for portfolio data');
      
      // Build AI prompt
      const prompt = generatePortfolioPrompt(location);
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('❌ [QUOTE-CALCULATOR] Missing ANTHROPIC_API_KEY environment variable');
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        );
      }

      console.log('🌐 [QUOTE-CALCULATOR] Calling Anthropic API for country:', countryName);
      
      try {
        // Call Anthropic API
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            temperature: 0.3,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        if (!anthropicResponse.ok) {
          const errorText = await anthropicResponse.text();
          console.error('❌ [QUOTE-CALCULATOR] Anthropic API error:', errorText);
          throw new Error('Failed to generate portfolio data');
        }

        console.log('✅ [QUOTE-CALCULATOR] Anthropic API call successful');
        
        const anthropicData = await anthropicResponse.json();
        const generatedContent = anthropicData.content[0].text;
        
        console.log('📄 [QUOTE-CALCULATOR] Received AI response, length:', generatedContent.length);

        // Extract JSON from the response
        let parsedData;
        try {
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
            console.log('✅ [QUOTE-CALCULATOR] Successfully parsed AI response JSON');
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('❌ [QUOTE-CALCULATOR] Failed to parse Anthropic response:', parseError);
          throw new Error('Failed to parse generated data');
        }

        // Inject static tier and implementationComplexity
        const staticData = getStaticPortfolioIndicators();
        const categories = ['small', 'medium', 'large', 'enterprise'] as const;
        
        // Map new categories to static data structure
        const categoryMapping: Record<string, keyof typeof staticData> = {
          'small': '500-999',
          'medium': '1000-1999', 
          'large': '2000-4999',
          'enterprise': '5000+'
        };
        
        for (const category of categories) {
          const staticKey = categoryMapping[category];
          if (parsedData[category] && staticKey && staticData[staticKey]) {
            parsedData[category].tier = staticData[staticKey].tier;
            parsedData[category].implementationComplexity = staticData[staticKey].implementationComplexity;
          }
        }

        // Set cache
        const cache = await loadCache();
        cache[cacheKey] = { data: {
          portfolioIndicators: parsedData,
          success: true,
          location: location,
          generatedAt: new Date().toISOString(),
          requestType,
          currency,
          currencySymbol,
          ai: true
        }, timestamp: Date.now() };
        await saveCache(cache);

        console.log('✅ [QUOTE-CALCULATOR] Successfully generated and cached AI data for:', countryName);
        console.log('📊 [QUOTE-CALCULATOR] Response includes:', {
          portfolioSizes: Object.keys(parsedData),
          currency,
          currencySymbol,
          ai: true
        });

        return NextResponse.json({
          portfolioIndicators: parsedData,
          success: true,
          location: location,
          generatedAt: new Date().toISOString(),
          requestType,
          currency,
          currencySymbol,
          ai: true
        });
      } catch (error) {
        console.error('❌ [QUOTE-CALCULATOR] Error getting AI portfolio data:', error);
        // Fallback to static data
        console.log('🔄 [QUOTE-CALCULATOR] Falling back to static portfolio data for:', countryName);
        const staticData = getStaticPortfolioIndicators();
        
        console.log('📊 [QUOTE-CALCULATOR] Fallback response includes:', {
          portfolioSizes: Object.keys(staticData),
          currency: 'USD',
          currencySymbol: '$',
          fallback: true
        });
        
        return NextResponse.json({
          portfolioIndicators: staticData,
          success: true,
          location: location,
          generatedAt: new Date().toISOString(),
          requestType,
          currency: 'USD',
          currencySymbol: '$',
          fallback: true
        });
      }
    }

    // Default response for unknown request types
    console.log('❌ [QUOTE-CALCULATOR] Unknown request type:', requestType);
    return NextResponse.json(
      { error: `Unknown request type: ${requestType}. Only 'portfolio' is supported.` },
      { status: 400 }
    );

  } catch (error) {
    console.error(`❌ [QUOTE-CALCULATOR] API error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cache management endpoint for development
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear') {
      await clearCache();
      console.log('🗑️ [QUOTE-CALCULATOR] Cache cleared via API');
      return NextResponse.json({ 
        success: true, 
        message: 'Cache cleared',
        cacheSize: 0 
      });
    }
    
    const cache = await loadCache();
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action. Use ?action=clear to clear cache.',
      cacheSize: Object.keys(cache).length 
    });
  } catch (error) {
    console.error('❌ [QUOTE-CALCULATOR] Cache management error:', error);
    return NextResponse.json(
      { error: 'Cache management failed' },
      { status: 500 }
    );
  }
}

// Cache status endpoint for development
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'status') {
      const cache = await loadCache();
      const cacheEntries = Object.entries(cache).map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        age: Date.now() - value.timestamp,
        data: {
          success: value.data.success,
          ai: value.data.ai,
          fallback: value.data.fallback,
          cache: value.data.cache,
          location: value.data.location?.country,
          countryName: value.data.location?.countryName,
          currency: value.data.currency
        }
      }));
      
      return NextResponse.json({ 
        success: true, 
        cacheSize: Object.keys(cache).length,
        cacheEntries,
        cacheTTL: CACHE_TTL,
        currentTime: Date.now()
      });
    }
    
    const cache = await loadCache();
    return NextResponse.json({ 
      success: false, 
      message: 'Invalid action. Use ?action=status to check cache.',
      cacheSize: Object.keys(cache).length 
    });
  } catch (error) {
    console.error('❌ [QUOTE-CALCULATOR] Cache status error:', error);
    return NextResponse.json(
      { error: 'Cache status failed' },
      { status: 500 }
    );
  }
} 