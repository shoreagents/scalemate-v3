import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import {
  getStaticPortfolioIndicators
} from '@/utils/quoteCalculatorData';
import { LocationData } from '@/types/location';

// Type for the request body
interface PortfolioIndicatorRequest {
  location: LocationData;
  requestType?: 'portfolio';
}

// Simple in-memory cache (for demonstration; use Redis for production)
const aiCache = new Map();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

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

  // Portfolio sizes to generate
  const sizes = [
    '500-999',
    '1000-1999',
    '2000-4999',
    '5000+',
    'manual'
  ];

  // JSON template for the prompt (remove tier and implementationComplexity)
  const jsonTemplate = sizes.map(size => {
    return `    "${size}": {
      "min": [minimum property count for ${size}],
      "max": [maximum property count for ${size}],
      "description": "[${countryName}-specific description for ${size}]",
      "recommendedTeamSize": {
        "assistantPropertyManager": [number],
        "leasingCoordinator": [number],
        "marketingSpecialist": [number]
      },
      "averageRevenue": { "min": [min revenue in ${currency}], "max": [max revenue in ${currency}] }
    }`;
  }).join(',\n');

  return `You are a property management industry expert specializing in ${countryName}. Generate portfolio indicators for the ${countryName} market as of ${currentDate}.

CONTEXT:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}
- Target: Property management companies considering offshore teams

PORTFOLIO SIZES:
- 500-999
- 1000-1999
- 2000-4999
- 5000+
- manual (custom size)

TASK: Generate portfolio indicators for each size, including min/max, description, recommendedTeamSize, and averageRevenue. Do NOT include tier or implementationComplexity in your response.

Respond with ONLY a valid JSON object in this exact format:
{
${jsonTemplate}
}`;
}

export async function POST(request: NextRequest) {
  try {
    const body: PortfolioIndicatorRequest = await request.json();
    const { location, requestType = 'portfolio' } = body;

    if (!location?.country) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const cacheKey = buildCacheKey(location);
    const cached = aiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ ...cached.data, cache: true });
    }

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
      // Build AI prompt
      const prompt = generatePortfolioPrompt(location);
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
        return NextResponse.json(
          { error: 'API configuration error' },
          { status: 500 }
        );
      }

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
          console.error('❌ Anthropic API error:', errorText);
          throw new Error('Failed to generate portfolio data');
        }

        const anthropicData = await anthropicResponse.json();
        const generatedContent = anthropicData.content[0].text;

        // Extract JSON from the response
        let parsedData;
        try {
          const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsedData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('No JSON found in response');
          }
        } catch (parseError) {
          console.error('❌ Failed to parse Anthropic response:', parseError);
          throw new Error('Failed to parse generated data');
        }

        // Inject static tier and implementationComplexity
        const staticData = getStaticPortfolioIndicators();
        const sizes = ['500-999', '1000-1999', '2000-4999', '5000+', 'manual'];
        for (const size of sizes) {
          if (parsedData[size] && staticData[size]) {
            parsedData[size].tier = staticData[size].tier;
            parsedData[size].implementationComplexity = staticData[size].implementationComplexity;
          }
        }

        // Set cache
        aiCache.set(cacheKey, { data: {
          portfolioIndicators: parsedData,
          success: true,
          location: location,
          generatedAt: new Date().toISOString(),
          requestType,
          currency,
          currencySymbol,
          ai: true
        }, timestamp: Date.now() });

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
        console.error('❌ Error getting AI portfolio data:', error);
        // Fallback to static data
        console.log('🔄 Falling back to static portfolio data');
        const staticData = getStaticPortfolioIndicators();
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
    return NextResponse.json(
      { error: `Unknown request type: ${requestType}. Only 'portfolio' is supported.` },
      { status: 400 }
    );

  } catch (error) {
    console.error(`❌ Quote-calculator API error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 