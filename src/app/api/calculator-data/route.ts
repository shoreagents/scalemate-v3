import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Portfolio data cache to reduce AI costs during testing
interface CachedPortfolioData {
  portfolioData: Record<PortfolioSize, PortfolioIndicator>;
  location: LocationData;
  generatedAt: string;
  generatedBy: 'claude-ai';
  note: string;
}

// Use global object to persist cache across Next.js development reloads
const globalForCache = globalThis as unknown as {
  portfolioCache: Map<string, { data: CachedPortfolioData; timestamp: number }> | undefined;
};

const portfolioCache = globalForCache.portfolioCache ?? new Map<string, { data: CachedPortfolioData; timestamp: number }>();

if (process.env.NODE_ENV === 'development') {
  globalForCache.portfolioCache = portfolioCache;
}

const PORTFOLIO_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getPortfolioCacheKey(location: LocationData, ip: string): string {
  // Create cache key based on location + IP for cost optimization
  // Used with both actual public IP (primary) and detected IP (fallback) for max cache hits
  return `${location.country}_${location.region}_${location.city}_${ip}`;
}

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

type PortfolioSize = string; // Dynamic location-based ranges (e.g. "100-299", "500-999", etc.)

async function getLocationFromIP(request: NextRequest): Promise<LocationData> {
  try {
    // Use our robust ip-location API instead of duplicating logic
    const baseUrl = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const ipLocationUrl = `${protocol}://${baseUrl}/api/ip-location`;
    
    console.log('🔗 Calling ip-location API:', ipLocationUrl);
    
    // Forward the original headers for IP detection
    const response = await fetch(ipLocationUrl, {
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'user-agent': request.headers.get('user-agent') || 'ScaleMate-Portfolio/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`IP location API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.location) {
      console.log('✅ Location from ip-location API:', data.location);
      return data.location;
    } else {
      throw new Error(data.error || 'Failed to get location from ip-location API');
    }
  } catch (error) {
    console.error('Error calling ip-location API:', error);
    
    // Return unknown location - will be handled by portfolio generation
    const unknownLocation: LocationData = {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      timezone: 'Unknown',
      currency: 'Unknown'
    };
    
    console.log('⚠️ Using unknown location fallback');
    return unknownLocation;
  }
}

async function generateLocationSpecificPortfolio(location: LocationData): Promise<Record<PortfolioSize, PortfolioIndicator>> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  // If location data is mostly unknown, use global/generic approach
  const isLocationUnknown = location.country === 'Unknown' || location.city === 'Unknown';
  const locationContext = isLocationUnknown 
    ? "global property management market" 
    : `${location.city}, ${location.region}, ${location.country}`;

  const prompt = `
You are a property management industry expert. Generate accurate, market-researched portfolio data for ${locationContext}.

IMPORTANT: Research current property management market data for this specific location including:
- Average property management fees (% of rental income)
- Typical annual rental yields
- Local property management fee structures
- Cost of living and salary expectations
- Common property types and market segments

Create 4 portfolio size tiers:
- Growing - Perfect for testing offshore teams
- Large - Ideal for full team implementation  
- Major - Multiple teams across departments
- Enterprise - Full offshore operation

Calculate revenue based on:
- Local property management fees (typically 6-12% of rental income annually)
- Average rental prices for the location
- Property mix (residential/commercial split)
- Use local currency and realistic market rates

Use this JSON structure:

{
  "[range1]": {
    "min": [number],
    "max": [number], 
    "tier": "growing",
    "description": "[Location-specific description mentioning local property types and market conditions]",
    "recommendedTeamSize": {
      "assistantPropertyManager": [number],
      "leasingCoordinator": [number],
      "marketingSpecialist": [number]
    },
    "averageRevenue": { 
      "min": [realistic amount based on market research], 
      "max": [realistic amount based on market research] 
    },
    "implementationComplexity": "basic",
    "marketInsights": "[Brief note about local market characteristics]"
  },
  "[range2]": { 
    "tier": "large", 
    "implementationComplexity": "intermediate",
    "marketInsights": "[Location-specific insights]",
    ... 
  },
  "[range3]": { 
    "tier": "major", 
    "implementationComplexity": "advanced",
    "marketInsights": "[Location-specific insights]",
    ... 
  },
  "[range4]": { 
    "tier": "enterprise", 
    "implementationComplexity": "enterprise",
    "marketInsights": "[Location-specific insights]",
    ... 
  }
}

CRITICAL: Ensure revenue figures reflect actual local property management market rates. Research current data before generating figures.

Return ONLY the JSON object with 4 portfolio tiers, no additional text.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      temperature: 0.3,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const response = message.content[0]?.type === 'text' ? 
      (message.content[0] as any).text : 
      null;

    if (!response) {
      throw new Error('No response from Claude');
    }

    // Parse the JSON response
    const portfolioData = JSON.parse(response);
    
    // Validate the structure - expect 4 tiers with proper structure
    const portfolioKeys = Object.keys(portfolioData);
    if (portfolioKeys.length !== 4) {
      throw new Error(`Expected 4 portfolio tiers, got ${portfolioKeys.length}`);
    }

    const expectedTiers = ['growing', 'large', 'major', 'enterprise'];
    const foundTiers = portfolioKeys.map(key => portfolioData[key]?.tier).filter(Boolean);
    
    for (const tier of expectedTiers) {
      if (!foundTiers.includes(tier)) {
        throw new Error(`Missing required tier: ${tier}`);
      }
    }

    // Validate each portfolio has required fields
    for (const key of portfolioKeys) {
      const portfolio = portfolioData[key];
      if (!portfolio.min || !portfolio.max || !portfolio.tier || !portfolio.description) {
        throw new Error(`Portfolio ${key} missing required fields`);
      }
    }

    return portfolioData;

  } catch (error) {
    console.error('Claude AI generation failed:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🌍 Starting location-based portfolio generation...');
    console.log('📊 Current cache size:', portfolioCache.size);
    
    // Step 1: Get location from IP (FREE)
    const location = await getLocationFromIP(request);
    console.log('📍 Location detected:', location);
    
    // If location is unknown, skip AI and use static data to save costs
    if (location.country === 'Unknown') {
      console.log('⚠️ Location unknown, skipping AI to save costs - using static data');
      const { fallbackPortfolioData } = await import('@/utils/calculator/data');
      
      return NextResponse.json({
        success: true,
        portfolioData: fallbackPortfolioData,
        location,
        generatedAt: new Date().toISOString(),
        generatedBy: 'static-fallback',
        note: 'Used generic global portfolio ranges (location unknown)',
        fromCache: false,
        cacheKey: null
      });
    }

    // Step 2: Check cache first to save AI costs (dual cache strategy)
    // Note: We check both actual public IP and detected IP for maximum cache hits
    const ipResponse = await fetch(`${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host') || 'localhost:3000'}/api/ip-location`, {
      headers: {
        'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
        'x-real-ip': request.headers.get('x-real-ip') || '',
        'user-agent': request.headers.get('user-agent') || 'ScaleMate-Cache/1.0'
      }
    });
    
    const ipData = await ipResponse.json();
    const detectedIp = ipData.detectedIp || '127.0.0.1';
    const actualIp = ipData.actualIp || detectedIp;
    
    console.log(`🔍 Cache strategy: detected=${detectedIp}, actual=${actualIp}, isLocal=${ipData.isLocalIP}`);
    
    // Try cache with actual IP first (preferred)
    const primaryCacheKey = getPortfolioCacheKey(location, actualIp);
    console.log(`🔑 Primary cache key: "${primaryCacheKey}"`);
    let cached = portfolioCache.get(primaryCacheKey);
    let cacheSource = 'actualIP';
    
    console.log(`🎯 Primary cache lookup result:`, cached ? 'HIT' : 'MISS');
    
    // Fallback to detected IP cache if actual IP cache miss (backwards compatibility)
    if (!cached && actualIp !== detectedIp) {
      const fallbackCacheKey = getPortfolioCacheKey(location, detectedIp);
      console.log(`🔑 Fallback cache key: "${fallbackCacheKey}"`);
      cached = portfolioCache.get(fallbackCacheKey);
      cacheSource = 'detectedIP';
      console.log(`🔄 Primary cache miss, trying fallback cache with detected IP`);
      console.log(`🎯 Fallback cache lookup result:`, cached ? 'HIT' : 'MISS');
    }
    
    if (cached && Date.now() - cached.timestamp < PORTFOLIO_CACHE_DURATION) {
      const ageHours = Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60));
      const expiresInHours = Math.round((PORTFOLIO_CACHE_DURATION - (Date.now() - cached.timestamp)) / (1000 * 60 * 60));
      
      console.log(`💾 Using cached portfolio data for ${location.city}, ${location.country} (${cacheSource}: ${cacheSource === 'actualIP' ? actualIp : detectedIp})`);
      console.log(`⏰ Cache age: ${ageHours}h, expires in: ${expiresInHours}h`);
      
      return NextResponse.json({
        success: true,
        ...cached.data,
        fromCache: true,
        cacheSource: cacheSource,
        cacheAge: `${ageHours} hours`,
        cacheExpiresAt: new Date(cached.timestamp + PORTFOLIO_CACHE_DURATION).toISOString()
      });
    } else if (cached) {
      console.log(`⚠️ Cache entry found but expired, age: ${Math.round((Date.now() - cached.timestamp) / (1000 * 60 * 60))}h`);
    }
    
    // Step 3: Generate portfolio data with Claude (PAID) - only for known locations
    console.log(`🤖 Generating NEW portfolio data for: ${location.city}, ${location.country} (ActualIP: ${actualIp})`);
    const portfolioData = await generateLocationSpecificPortfolio(location);
    console.log('✅ Portfolio data generated successfully');
    
    // Cache the successful result to save future AI costs
    const responseData: CachedPortfolioData = {
      location,
      portfolioData,
      generatedAt: new Date().toISOString(),
      generatedBy: 'claude-ai',
      note: `Customized for ${location.city}, ${location.country}`
    };
    
    // Store in cache with actual IP as primary key
    portfolioCache.set(primaryCacheKey, { data: responseData, timestamp: Date.now() });
    console.log(`💾 Cached portfolio data for ${location.city}, ${location.country} (ActualIP: ${actualIp}) - expires in 24h`);
    console.log(`🔑 Stored with primary key: "${primaryCacheKey}"`);
    
    // Also store with detected IP if different (for backwards compatibility)
    if (actualIp !== detectedIp) {
      const fallbackCacheKey = getPortfolioCacheKey(location, detectedIp);
      portfolioCache.set(fallbackCacheKey, { data: responseData, timestamp: Date.now() });
      console.log(`💾 Also cached with detected IP (${detectedIp}) for backwards compatibility`);
      console.log(`🔑 Stored with fallback key: "${fallbackCacheKey}"`);
    }
    
    console.log(`📊 Cache size after storage: ${portfolioCache.size}`);

    return NextResponse.json({
      success: true,
      ...responseData,
      fromCache: false,
      cacheExpiresAt: new Date(Date.now() + PORTFOLIO_CACHE_DURATION).toISOString()
    });

  } catch (error) {
    console.error('Calculator Data API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate calculator data',
      generatedAt: new Date().toISOString()
    });
  }
} 