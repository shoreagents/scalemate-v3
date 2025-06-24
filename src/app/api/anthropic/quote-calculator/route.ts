import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';

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
  requestType?: 'portfolio' | 'roles' | 'salary';
}



export async function POST(request: NextRequest) {
  let requestType = 'portfolio'; // Default value for error handling
  try {
    const body: PortfolioIndicatorRequest = await request.json();
    const { location, requestType: bodyRequestType = 'portfolio' } = body;
    requestType = bodyRequestType;

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
          error: `Failed to generate ${requestType} data`,
          details: 'API configuration missing'
        },
        { status: 500 }
      );
    }

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    let prompt: string;
    let responseKey: string;
    
    if (requestType === 'roles') {
      responseKey = 'roles';
      prompt = `You are a property management industry expert. Generate location-specific role definitions for ${countryName}.

Context:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Target: Property management companies considering offshore teams

Based on ${countryName}'s property management market and job requirements, create realistic role definitions for property management positions. Consider:
- Local property management practices and regulations
- Cultural communication styles and expectations
- Technology adoption in the region
- Market maturity and business practices
- Required skills based on local market conditions

Generate enhanced role definitions for these key property management positions:
1. Assistant Property Manager
2. Leasing Coordinator  
3. Marketing Specialist

Requirements:
1. Titles should reflect local market terminology
2. Descriptions should be relevant to ${countryName} property management practices
3. Skills should reflect local market needs and technology adoption
4. Categories should be appropriate for the market structure
5. Search keywords should include local terminology

Respond with ONLY a valid JSON object in this exact format:
{
  "roles": {
    "assistantPropertyManager": {
      "id": "assistantPropertyManager",
      "title": "[Local market appropriate title]",
      "icon": "🏢",
      "description": "[Description relevant to ${countryName} market practices]",
      "category": "property-management",
      "type": "predefined",
      "color": "brand-primary",
      "requiredSkills": ["[skill1]", "[skill2]", "[skill3]", "[skill4]"],
      "optionalSkills": ["[skill1]", "[skill2]", "[skill3]"],
      "searchKeywords": ["[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]", "[keyword5]", "[keyword6]", "[keyword7]"]
    },
    "leasingCoordinator": {
      "id": "leasingCoordinator",
      "title": "[Local market appropriate title]",
      "icon": "🗝️",
      "description": "[Description relevant to ${countryName} leasing practices]",
      "category": "leasing",
      "type": "predefined",
      "color": "brand-secondary",
      "requiredSkills": ["[skill1]", "[skill2]", "[skill3]", "[skill4]"],
      "optionalSkills": ["[skill1]", "[skill2]", "[skill3]"],
      "searchKeywords": ["[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]", "[keyword5]", "[keyword6]", "[keyword7]"]
    },
    "marketingSpecialist": {
      "id": "marketingSpecialist",
      "title": "[Local market appropriate title]",
      "icon": "📈",
      "description": "[Description relevant to ${countryName} marketing practices]",
      "category": "marketing",
      "type": "predefined",
      "color": "brand-accent",
      "requiredSkills": ["[skill1]", "[skill2]", "[skill3]", "[skill4]"],
      "optionalSkills": ["[skill1]", "[skill2]", "[skill3]"],
      "searchKeywords": ["[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]", "[keyword5]", "[keyword6]", "[keyword7]"]
    }
  }
}`;
    } else if (requestType === 'salary') {
      responseKey = 'rolesSalaryComparison';
      prompt = `You are a property management industry expert. Generate location-specific salary data for ${countryName}.

Context:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Target: Property management salary benchmarking

Based on ${countryName}'s employment market, generate realistic salary data for property management roles. Consider:
- Local salary standards and employment costs
- Tax rates and benefit structures
- Market competitiveness
- Experience level variations
- Total employment cost including benefits and taxes

Generate salary data for these roles with experience levels (entry, moderate, experienced):
1. Assistant Property Manager
2. Leasing Coordinator
3. Marketing Specialist

Requirements:
1. Base salaries should reflect current ${countryName} market rates
2. Total costs should include realistic benefits and taxes
3. Benefits should reflect local employment practices
4. Tax calculations should be appropriate for ${countryName}
5. All figures in ${currency}

Respond with ONLY a valid JSON object in this exact format:
{
  "rolesSalaryComparison": {
    "assistantPropertyManager": {
      "${location.country}": {
        "entry": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "moderate": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "experienced": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] }
      }
    },
    "leasingCoordinator": {
      "${location.country}": {
        "entry": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "moderate": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "experienced": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] }
      }
    },
    "marketingSpecialist": {
      "${location.country}": {
        "entry": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "moderate": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] },
        "experienced": { "base": [number], "total": [number], "benefits": [number], "taxes": [number] }
      }
    }
  }
}`;
    } else {
      responseKey = 'portfolioIndicators';
      prompt = `You are a property management industry expert. Generate location-specific portfolio indicators for ${countryName}.

Context:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
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
    }

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
    if (!portfolioData[responseKey]) {
      throw new Error(`Invalid response structure from Anthropic: missing ${responseKey}`);
    }

    // Add manual portfolio option for portfolio requests only
    if (requestType === 'portfolio') {
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
    }

    console.log(`✅ Generated dynamic ${requestType} data for ${countryName}`);
    
    return NextResponse.json(portfolioData);

  } catch (error) {
    console.error(`Error generating ${requestType || 'portfolio'} data:`, error);
    
    return NextResponse.json(
      { 
        error: `Failed to generate ${requestType || 'portfolio'} data`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 