import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import { ROLES } from '@/utils/rolesData';

// Type for the request body
interface RolesRequest {
  location: {
    country: string;
    countryName?: string;
    region?: string;
    city?: string;
    currency?: string;
  };
  requestType?: 'both';
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
    const countryKey = userCountry || 'United States'; // Use country name directly
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
  let requestType = 'both'; // Default to both for efficiency
  try {
    const body: RolesRequest = await request.json();
    const { location, requestType: bodyRequestType = 'both' } = body;
    requestType = bodyRequestType;

    if (!location?.country) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    console.log('🌍 Effective location for roles:', {
      country: location.country,
      countryName,
      currency,
      source: 'auto-detected'
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ Missing ANTHROPIC_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    let prompt: string;

    if (requestType === 'both') {
      const currentDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });

      const roleInfo = generateRoleInfoForPrompt(location.country);

      console.log('🔧 Dynamic role info generated:', {
        roleCount: roleInfo.roleCount,
        roleIds: roleInfo.roleIds,
        roleList: roleInfo.roleList
      });

      prompt = `You are a property management industry expert. Generate both location-specific role definitions AND comprehensive salary data for ${countryName} as of ${currentDate}.

Context:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}
- Target: Property management companies considering offshore teams

Generate BOTH:

1. ROLE DEFINITIONS for ${countryName} property management market:
${roleInfo.roleList}

2. SALARY DATA for ${countryName} vs Philippines comparison:
   - Each role with entry, moderate, experienced levels
   - Include base, total, benefits, taxes for each level
   - Use current ${currentDate} market rates
   - ${countryName} salaries in ${currency}
   - Philippines salaries in PHP for comparison

IMPORTANT: Role titles must be exactly as specified - do NOT modify these titles.

Respond with ONLY a valid JSON object in this exact format:
{
  "roles": {
${roleInfo.jsonTemplate}
  },
  "rolesSalaryComparison": {
${roleInfo.salaryTemplate}
  }
}`;
    } else {
      return NextResponse.json(
        { error: 'Only "both" request type is supported' },
        { status: 400 }
      );
    }

    console.log(`🤖 Calling Anthropic API for roles and salary generation...`);
    
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
        max_tokens: 6000, // Always 6000 for 'both' request type
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
      return NextResponse.json(
        { error: 'Failed to generate roles and salary data' },
        { status: 500 }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    console.log('✅ Anthropic API response received');

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
      return NextResponse.json(
        { error: 'Failed to parse generated data' },
        { status: 500 }
      );
    }

    // Validate the structure for 'both' request type
    const roleInfo = generateRoleInfoForPrompt(location.country);
    const requiredRoles = roleInfo.roleIds;
    
    // Check roles
    const rolesData = parsedData.roles;
    if (!rolesData) {
      return NextResponse.json({ error: 'Missing roles data' }, { status: 500 });
    }
    
    for (const roleId of requiredRoles) {
      if (!rolesData[roleId]) {
        console.error(`❌ Missing role: ${roleId}`);
        return NextResponse.json(
          { error: `Missing role data for ${roleId}` },
          { status: 500 }
        );
      }
    }

    // Check salary data
    const salaryData = parsedData.rolesSalaryComparison;
    if (!salaryData) {
      return NextResponse.json({ error: 'Missing salary data' }, { status: 500 });
    }

          // Validate that all required roles have both country and PH salary data
      for (const roleId of requiredRoles) {
        if (!salaryData[roleId]) {
          throw new Error(`Missing salary data for role: ${roleId}`);
        }
        
        const roleSalary = salaryData[roleId];
                  const requiredCountries = [countryName, 'Philippines'];
        
        for (const country of requiredCountries) {
          if (!roleSalary[country]) {
            throw new Error(`Missing salary data for ${roleId} in country: ${country}`);
          }
          
          const countryData = roleSalary[country];
          const requiredLevels = ['entry', 'moderate', 'experienced'];
          
          for (const level of requiredLevels) {
            if (!countryData[level]) {
              throw new Error(`Missing ${level} level data for ${roleId} in ${country}`);
            }
            
            const levelData = countryData[level];
            const requiredFields = ['base', 'total', 'benefits', 'taxes'];
            
            for (const field of requiredFields) {
              if (typeof levelData[field] !== 'number') {
                throw new Error(`Invalid ${field} for ${roleId} ${level} in ${country}`);
              }
            }
          }
        }
      }

    console.log('✅ Roles and salary data generated and validated successfully');

    // Return both roles and salary data
    const responseData = {
      success: true,
      location: location,
      generatedAt: new Date().toISOString(),
      roles: parsedData.roles,
      rolesSalaryComparison: parsedData.rolesSalaryComparison
    };

    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`❌ ${requestType} API error:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 