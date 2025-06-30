import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import { ROLES } from '@/utils/rolesData';

// Type for the request body
interface CombinedRequest {
  location: {
    country: string;
    countryName?: string;
    region?: string;
    city?: string;
    currency?: string;
  };
  portfolioSizes?: string[];
}

// Helper function to dynamically generate role information for prompts
function generateRoleInfoForPrompt(userCountry?: string) {
  const roleEntries = Object.entries(ROLES);
  
  // Generate role list for prompt
  const roleList = roleEntries.map(([id, role]) => `${role.title} (${id})`).join('\n   - ');
  
  // Generate JSON template dynamically
  const jsonTemplate = roleEntries.map(([id, role]) => {
    return `    "${id}": {
      "id": "${id}",
      "title": "${role.title}",
      "icon": "${role.icon}",
      "description": "[Description relevant to {countryName} market]",
      "category": "${role.category}",
      "type": "predefined",
      "color": "${role.color}",
      "requiredSkills": ["[skill1]", "[skill2]", "[skill3]", "[skill4]"],
      "optionalSkills": ["[skill1]", "[skill2]", "[skill3]"],
      "searchKeywords": ["[keyword1]", "[keyword2]", "[keyword3]", "[keyword4]", "[keyword5]", "[keyword6]", "[keyword7]"]
    }`;
  }).join(',\n');
  
  // Generate salary template dynamically for user's country + Philippines
  const salaryTemplate = roleEntries.map(([id]) => {
    const countryKey = userCountry || 'United States';
    return `    "${id}": {
      "${countryKey}": {
        "entry": { "base": 50000, "total": 65000, "benefits": 10000, "taxes": 15000 },
        "moderate": { "base": 65000, "total": 84500, "benefits": 13000, "taxes": 19500 },
        "experienced": { "base": 85000, "total": 110500, "benefits": 17000, "taxes": 25500 }
      },
      "Philippines": { 
        "entry": { "base": 300000, "total": 390000, "benefits": 60000, "taxes": 90000 },
        "moderate": { "base": 420000, "total": 546000, "benefits": 84000, "taxes": 126000 },
        "experienced": { "base": 600000, "total": 780000, "benefits": 120000, "taxes": 180000 }
      }
    }`;
  }).join(',\n');
  
  return {
    roleList,
    jsonTemplate,
    salaryTemplate,
    roleIds: Object.keys(ROLES),
    roleCount: roleEntries.length
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CombinedRequest = await request.json();
    const { location, portfolioSizes = ['small', 'medium', 'large'] } = body;

    if (!location?.country) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ ANTHROPIC_API_KEY environment variable is not set');
      return NextResponse.json(
        { 
          error: 'Failed to generate combined data',
          details: 'API configuration missing'
        },
        { status: 500 }
      );
    }

    const countryName = location.countryName;
    const country = location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    // Safety check: countryName is required for AI prompts
    if (!countryName) {
      return NextResponse.json(
        { error: 'countryName is required for generating data' },
        { status: 400 }
      );
    }

    console.log(`🚀 Calling combined API for location: ${countryName}`);

    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const roleInfo = generateRoleInfoForPrompt(location.country);

    const prompt = `You are a property management industry expert. Generate comprehensive location-specific data for ${countryName} as of ${currentDate}.

Context:
- Country: ${countryName}
- Market Type: ${country}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}
- Target: Property management companies considering offshore teams

Generate ALL THREE data sets:

1. PORTFOLIO INDICATORS for ${countryName} property management market:
   - Small portfolios (1-50 properties): Revenue ranges, typical services, market characteristics
   - Medium portfolios (51-200 properties): Revenue ranges, typical services, market characteristics  
   - Large portfolios (201+ properties): Revenue ranges, typical services, market characteristics
   - Consider local market conditions, property values, rental rates, and management fees

2. ROLE DEFINITIONS for ${countryName} property management market:
${roleInfo.roleList}

3. SALARY DATA for ${countryName} vs Philippines comparison:
   - Each role with entry, moderate, experienced levels
   - Include base, total, benefits, taxes for each level
   - Use current ${currentDate} market rates
   - ${countryName} salaries in ${currency}
   - Philippines salaries in PHP for comparison

IMPORTANT: 
- Role titles must be exactly as specified - do NOT modify these titles
- Portfolio revenue ranges should be in ${currency} and reflect realistic ${countryName} market conditions
- All data should be current as of ${currentDate}

Respond with ONLY a valid JSON object in this exact format:
{
  "portfolioIndicators": {
    "small": {
      "averageRevenue": { "min": [realistic_min_in_${currency}], "max": [realistic_max_in_${currency}] },
      "description": "[Description of small portfolio characteristics in ${countryName}]",
      "typicalServices": ["[service1]", "[service2]", "[service3]", "[service4]"],
      "averageProperties": [realistic_number],
      "marketCharacteristics": ["[characteristic1]", "[characteristic2]", "[characteristic3]"]
    },
    "medium": {
      "averageRevenue": { "min": [realistic_min_in_${currency}], "max": [realistic_max_in_${currency}] },
      "description": "[Description of medium portfolio characteristics in ${countryName}]",
      "typicalServices": ["[service1]", "[service2]", "[service3]", "[service4]", "[service5]"],
      "averageProperties": [realistic_number],
      "marketCharacteristics": ["[characteristic1]", "[characteristic2]", "[characteristic3]"]
    },
    "large": {
      "averageRevenue": { "min": [realistic_min_in_${currency}], "max": [realistic_max_in_${currency}] },
      "description": "[Description of large portfolio characteristics in ${countryName}]",
      "typicalServices": ["[service1]", "[service2]", "[service3]", "[service4]", "[service5]", "[service6]"],
      "averageProperties": [realistic_number],
      "marketCharacteristics": ["[characteristic1]", "[characteristic2]", "[characteristic3]", "[characteristic4]"]
    }
  },
  "roles": {
${roleInfo.jsonTemplate}
  },
  "rolesSalaryComparison": {
${roleInfo.salaryTemplate}
  }
}`;

    console.log(`🤖 Calling Anthropic API for combined data generation...`);
    
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
        max_tokens: 8000, // Increased for combined response
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
      console.error('❌ Anthropic API error:', anthropicResponse.status, errorText);
      return NextResponse.json(
        { 
          error: `Anthropic API error: ${anthropicResponse.status}`,
          details: errorText
        },
        { status: 500 }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    console.log('✅ Anthropic API response received for combined data');

    // Parse the JSON response
    try {
      // Clean the response - remove any markdown formatting
      let cleanedContent = generatedContent;
      if (cleanedContent.includes('```json')) {
        cleanedContent = cleanedContent.split('```json')[1].split('```')[0];
      } else if (cleanedContent.includes('```')) {
        cleanedContent = cleanedContent.split('```')[1];
      }
      
      const parsedData = JSON.parse(cleanedContent.trim());
      
      // Validate the response structure
      if (!parsedData.portfolioIndicators || !parsedData.roles || !parsedData.rolesSalaryComparison) {
        throw new Error('Invalid response structure - missing required data sets');
      }

      console.log('✅ Combined data parsed successfully:', {
        portfolioSizes: Object.keys(parsedData.portfolioIndicators),
        roleCount: Object.keys(parsedData.roles).length,
        salaryDataCount: Object.keys(parsedData.rolesSalaryComparison).length
      });

      return NextResponse.json(parsedData);

    } catch (parseError) {
      console.error('❌ Failed to parse combined API response:', parseError);
      console.error('Raw response:', generatedContent);
      
      return NextResponse.json(
        { 
          error: 'Failed to parse combined data response',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('❌ Combined API endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 