import { NextRequest, NextResponse } from 'next/server';

// Access the global cache used by the main route
const globalForCache = globalThis as unknown as {
  portfolioCache: Map<string, { data: any; timestamp: number }> | undefined;
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const ip = url.searchParams.get('ip');

    // For debugging - let's call the main calculator-data endpoint to populate cache
    if (action === 'test') {
      console.log('🧪 Testing cache by calling main endpoint...');
      
      const baseUrl = request.headers.get('host') || 'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const calculatorUrl = `${protocol}://${baseUrl}/api/calculator-data`;
      
      try {
        const response = await fetch(calculatorUrl, {
          headers: {
            'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
            'x-real-ip': request.headers.get('x-real-ip') || '',
            'user-agent': 'Cache-Test/1.0'
          }
        });
        
        const data = await response.json();
        
        return NextResponse.json({
          success: true,
          message: "Called main endpoint to test cache",
          mainEndpointResponse: {
            success: data.success,
            fromCache: data.fromCache,
            cacheSource: data.cacheSource,
            location: data.location,
            generatedAt: data.generatedAt
          }
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Failed to call main endpoint',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    if (action === 'debug') {
      const cache = globalForCache.portfolioCache;
      const cacheEntries = cache ? Array.from(cache.keys()) : [];
      
      return NextResponse.json({
        success: true,
        message: "Cache debugging info",
        nodeEnv: process.env.NODE_ENV,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
        timestamp: new Date().toISOString(),
        cacheStatus: {
          exists: !!cache,
          size: cache?.size || 0,
          keys: cacheEntries.slice(0, 5), // Show first 5 cache keys
          totalKeys: cacheEntries.length
        },
        note: "Using global cache that persists across Next.js development reloads",
        instructions: [
          "Use ?action=test to trigger main endpoint and create cache entry",
          "Use ?action=clear to clear cache",
          "Use ?action=stats to see detailed cache stats"
        ]
      });
    }

    if (action === 'clear') {
      const cache = globalForCache.portfolioCache;
      if (cache) {
        const oldSize = cache.size;
        cache.clear();
        return NextResponse.json({
          success: true,
          message: `Cache cleared successfully - removed ${oldSize} entries`,
          clearedAt: new Date().toISOString()
        });
      } else {
        return NextResponse.json({
          success: true,
          message: "No cache to clear",
          clearedAt: new Date().toISOString()
        });
      }
    }

    if (action === 'stats') {
      const cache = globalForCache.portfolioCache;
      if (cache && cache.size > 0) {
        const entries = Array.from(cache.entries());
        const now = Date.now();
        const stats = entries.map(([key, value]) => ({
          key,
          ageHours: Math.round((now - value.timestamp) / (1000 * 60 * 60)),
          location: `${value.data.location.city}, ${value.data.location.country}`,
          generatedAt: value.data.generatedAt
        }));

        return NextResponse.json({
          success: true,
          message: "Cache statistics",
          cacheSize: cache.size,
          entries: stats,
          oldestEntry: stats.reduce((oldest, current) => 
            current.ageHours > oldest.ageHours ? current : oldest
          ),
          newestEntry: stats.reduce((newest, current) => 
            current.ageHours < newest.ageHours ? current : newest
          )
        });
      } else {
        return NextResponse.json({
          success: true,
          message: "Cache is empty",
          cacheSize: 0
        });
      }
    }

    // Default response
    const cache = globalForCache.portfolioCache;
    const cacheStats = {
      message: "Cache management endpoint",
      currentCacheSize: cache?.size || 0,
      note: "Global cache persists across Next.js development reloads",
      instructions: [
        "Add ?action=test to test cache by calling main endpoint",
        "Add ?action=debug to see debugging info",
        "Add ?action=clear to clear all cache",
        "Add ?action=stats to see detailed cache statistics"
      ]
    };

    return NextResponse.json(cacheStats);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to manage cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cache = globalForCache.portfolioCache;
    if (cache) {
      const oldSize = cache.size;
      cache.clear();
      return NextResponse.json({
        success: true,
        message: `Cache cleared via DELETE - removed ${oldSize} entries`,
        clearedAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: true,
        message: "No cache to clear",
        clearedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to clear cache'
    });
  }
} 