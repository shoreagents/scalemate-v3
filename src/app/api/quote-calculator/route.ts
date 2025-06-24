import { NextRequest, NextResponse } from 'next/server';
import { PortfolioSize, PortfolioIndicator } from '@/types';

// Type for the request body
interface PortfolioIndicatorRequest {
  location: {
    country: string;
    countryName?: string;
    region?: string;
    city?: string;
    currency?: string;
  };
  portfolioSizes: string[];
}

// Helper function to get currency symbol
function getCurrencySymbol(currency?: string): string {
  const symbols: Record<string, string> = {
    'USD': '$',
    'AUD': 'A$',
    'CAD': 'C$',
    'GBP': '£',
    'EUR': '€',
    'NZD': 'NZ$',
    'SGD': 'S$',
    'PHP': '₱'
  };
  return symbols[currency || 'USD'] || '$';
}

// Helper function to get market context
function getMarketContext(countryName: string): string {
  const contexts: Record<string, string> = {
    'United States': 'large and diverse property management market with high technology adoption',
    'Australia': 'mature property management market with strong regulatory framework',
    'Canada': 'stable property market with growing technology adoption',
    'United Kingdom': 'established property management sector with increasing digitalization',
    'New Zealand': 'growing property market with emphasis on efficiency',
    'Singapore': 'highly regulated and technology-forward property management market',
    'Philippines': 'emerging property management market with cost-effective solutions focus'
  };
  
  return contexts[countryName] || 'developing property management market with growing offshore adoption';
}

export async function POST(request: NextRequest) {
  try {
    const body: PortfolioIndicatorRequest = await request.json();
    const { location, portfolioSizes } = body;

    if (!location?.country) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Check if API key is available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
      return NextResponse.json(
        { 
          error: 'Failed to generate portfolio indicators',
          details: 'API configuration missing'
        },
        { status: 500 }
      );
    }

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);
    const marketContext = getMarketContext(countryName);

    // Prepare the prompt for Anthropic
    const prompt = `You are a property management industry expert. Generate location-specific portfolio indicators for ${countryName}.

Context:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Market: ${marketContext}
- Target: Property management companies considering offshore teams

Based on ${countryName}'s property management market conditions, create 4 realistic portfolio size ranges that make sense for local companies, considering:
- Typical property management company sizes in ${countryName}
- Local market structure and competition
- Average properties per manager ratios
- Market maturity and business scale patterns

For each portfolio size range you create, provide realistic data considering ${countryName}'s:
- Property market conditions
- Average property values
- Labor costs
- Regulatory environment
- Technology adoption

Requirements:
1. Create 4 portfolio size ranges that reflect typical ${countryName} property management business sizes
2. Property count ranges should be realistic for the local market (e.g., smaller ranges for emerging markets, larger for mature markets)
3. Revenue ranges should reflect ${countryName} property market reality
4. Descriptions should be generic and describe current portfolio characteristics (what this portfolio size typically represents now), not future implementation plans
5. Team sizes should be generic and scale proportionally with portfolio size
6. Implementation complexity should reflect local market maturity

Respond with ONLY a valid JSON object in this exact format:
{
  "portfolioIndicators": {
    "[range1]": {
      "min": [realistic_min_for_local_market],
      "max": [realistic_max_for_local_market],
      "tier": "growing",
      "description": "[Generic description of current portfolio characteristics - what companies this size typically manage now]",
      "recommendedTeamSize": {
        "assistantPropertyManager": [number],
        "leasingCoordinator": [number],
        "marketingSpecialist": [number]
      },
      "averageRevenue": {
        "min": [realistic minimum in ${currency}],
        "max": [realistic maximum in ${currency}]
      },
      "implementationComplexity": "simple"
    },
    "[range2]": { ... },
    "[range3]": { ... },
    "[range4]": { ... }
  }
}

Tiers: "growing", "large", "major", "enterprise" (assign appropriately)
Complexity: "simple", "moderate", "complex", "enterprise" (assign based on local market maturity)
Portfolio range keys should be descriptive like "100-299", "300-999", "1000-2499", "2500+" - adjust numbers to fit ${countryName} market reality.`;

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
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
    }

    const anthropicData = await anthropicResponse.json();
    const responseText = anthropicData.content?.[0]?.text;

    if (!responseText) {
      throw new Error('No response text from Anthropic');
    }

    // Parse the JSON response
    let portfolioData;
    try {
      portfolioData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Anthropic response:', responseText);
      throw new Error('Invalid JSON response from Anthropic');
    }

    // Validate the response structure
    if (!portfolioData.portfolioIndicators) {
      throw new Error('Invalid response structure from Anthropic');
    }

    // Add manual portfolio option (always included for custom input)
    portfolioData.portfolioIndicators.manual = {
      min: 0,
      max: 99999,
      tier: 'growing',
      description: `Custom portfolio size with precise inputs - Optimized for ${countryName} market conditions`,
      recommendedTeamSize: {
        assistantPropertyManager: 1,
        leasingCoordinator: 1,
        marketingSpecialist: 1
      },
      averageRevenue: { min: 0, max: 100000000 },
      implementationComplexity: 'simple'
    };

    console.log(`✅ Generated dynamic portfolio indicators for ${countryName}`);
    
    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error('Error generating portfolio indicators:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to generate portfolio indicators',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 