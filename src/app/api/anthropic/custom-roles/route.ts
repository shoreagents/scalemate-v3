import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import { 
  EXPERIENCE_LEVELS_DATA,
  getStaticRoles
} from '@/utils/rolesData';
import { LocationData } from '@/types/location';
import { promises as fs } from 'fs';
import path from 'path';
import pluralize from 'pluralize';

// Type for the request body
interface CustomRolesRequest {
  location: LocationData;
  customRoleName: string;
  customRoleDescription?: string;
}

// File-based cache for development
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'custom-roles-cache.json');

// Cache entry type
interface CacheEntry {
  data: any;
  timestamp: number;
}

// Cache type
type CacheData = Record<string, CacheEntry>;

// Ensure cache directory exists
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.warn('⚠️ Could not create cache directory:', error);
  }
}

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
    
    console.log(`📂 [CUSTOM-ROLES] Loaded ${Object.keys(validCache).length} valid cache entries`);
    return validCache;
  } catch (error) {
    console.log('📂 [CUSTOM-ROLES] No existing cache file, starting fresh');
    return {};
  }
}

// Save cache to file
async function saveCache(cache: CacheData) {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`💾 [CUSTOM-ROLES] Saved ${Object.keys(cache).length} cache entries`);
  } catch (error) {
    console.error('❌ [CUSTOM-ROLES] Failed to save cache:', error);
  }
}

// Helper to build cache key
function buildCacheKey(location: LocationData, customRoleName: string) {
  // Normalize: lowercase, remove all spaces, singularize each word (same as duplicate check)
  const normalizeRoleName = (str: string) =>
    (str || '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => pluralize.singular(word))
      .join('')
      .trim();
  
  return `${location.country || ''}|${location.countryName || ''}|${location.currency || ''}|${normalizeRoleName(customRoleName)}`;
}

// Helper function to generate AI prompt for custom role
function generateCustomRoleAIPrompt(location: LocationData, customRoleName: string, customRoleDescription?: string) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const countryName = location.countryName || location.country;
  const currency = location.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Generate JSON template for the custom role
  const roleKey = customRoleName.toLowerCase().replace(/\s+/g, '');
  const jsonTemplate = `    "${roleKey}": {
      "icon": "[emoji for ${customRoleName}]",
      "description": "[local market role description for ${customRoleName}]",
      "tasks": [
        {"id": "[task-1]", "name": "[task 1]", "tooltip": "[description 1]", "complexity": "[low/medium/high]"},
        {"id": "[task-2]", "name": "[task 2]", "tooltip": "[description 2]", "complexity": "[low/medium/high]"},
        {"id": "[task-3]", "name": "[task 3]", "tooltip": "[description 3]", "complexity": "[low/medium/high]"},
        {"id": "[task-4]", "name": "[task 4]", "tooltip": "[description 4]", "complexity": "[low/medium/high]"},
        {"id": "[task-5]", "name": "[task 5]", "tooltip": "[description 5]", "complexity": "[low/medium/high]"},
        {"id": "[task-6]", "name": "[task 6]", "tooltip": "[description 6]", "complexity": "[low/medium/high]"},
        {"id": "[task-7]", "name": "[task 7]", "tooltip": "[description 7]", "complexity": "[low/medium/high]"},
        {"id": "[task-8]", "name": "[task 8]", "tooltip": "[description 8]", "complexity": "[low/medium/high]"},
        {"id": "[task-9]", "name": "[task 9]", "tooltip": "[description 9]", "complexity": "[low/medium/high]"},
        {"id": "[task-10]", "name": "[task 10]", "tooltip": "[description 10]", "complexity": "[low/medium/high]"}
      ],
      "experienceLevels": [
        {
          "description": "[entry level description]",
          "bestFor": "[entry level best for]",
          "timeToProductivity": "[entry level time to productivity, e.g. '1-2 weeks']"
        },
        {
          "description": "[mid level description]", 
          "bestFor": "[mid level best for]",
          "timeToProductivity": "[mid level time to productivity, e.g. '1 week']"
        },
        {
          "description": "[senior level description]",
          "bestFor": "[senior level best for]",
          "timeToProductivity": "[senior level time to productivity, e.g. 'Immediate']"
        }
      ],
      "salary": {
        "${countryName}": {
          "entry": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]},
          "moderate": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]},
          "experienced": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]}
        },
        "Philippines": {
          "entry": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]},
          "moderate": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]},
          "experienced": {"base": [annual amount], "total": [annual amount], "benefits": [annual amount], "taxes": [annual amount]}
        }
      }
    }`;

  const roleContext = customRoleDescription 
    ? `Custom Role: ${customRoleName}\nRole Description: ${customRoleDescription}`
    : `Custom Role: ${customRoleName}`;

  const prompt = `
You are a property management industry expert specializing in ${countryName}. Generate comprehensive, market-accurate data for a custom role.

Context: ${countryName}, ${currency} (${currencySymbol}), ${currentDate}
${roleContext}

Critical Requirements:
1. Role description: Include local regulations, market conditions, and compliance requirements specific to ${customRoleName}
2. Tasks (10): Focus on ${countryName}-specific laws, practices, and regulatory requirements for this role
3. Experience levels: Tailor descriptions, "best for" scenarios, and provide realistic "time to productivity" for ${customRoleName}
4. Salaries: Research current ${countryName} market rates (compare against Philippines baseline) - ALL ANNUAL/YEARLY amounts
5. Icon: Select an emoji that universally represents this role's primary function

Data Quality Standards:
- Use official property management terminology for ${countryName}
- Reference actual local regulations and industry standards
- Ensure salary figures reflect current market reality (${currentDate}) as ANNUAL amounts
- Make task complexity ratings realistic for each activity
- Align experience descriptions with local hiring practices
- For each experience level, provide realistic "time to productivity" based on local market expectations
- All salary components (base, total, benefits, taxes) must be ANNUAL (per year) figures

Respond ONLY in English.

Return ONLY valid JSON in this exact format:
{
  "roles": {
${jsonTemplate}
  }
}

IMPORTANT: The role key must be exactly "${roleKey}" (lowercase, no spaces).
`;

  return {
    prompt
  };
}

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 9);
  console.log(`🚀 [CUSTOM-ROLES] API endpoint called - Request ID: ${requestId}`);
  
  // Parse request body first
  let body: CustomRolesRequest;
  try {
    body = await request.json();
  } catch (parseError) {
    console.error('❌ [CUSTOM-ROLES] Failed to parse request body:', parseError);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const { location, customRoleName, customRoleDescription } = body;

  console.log(`📥 [CUSTOM-ROLES] Request received - Request ID: ${requestId}:`, {
    location: location?.country,
    countryName: location?.countryName,
    currency: location?.currency,
    customRoleName,
    customRoleDescription,
    timestamp: new Date().toISOString()
  });

  if (!location?.country) {
    console.log('❌ [CUSTOM-ROLES] Missing location data');
    return NextResponse.json(
      { error: 'Location is required' },
      { status: 400 }
    );
  }

  if (!customRoleName) {
    console.log('❌ [CUSTOM-ROLES] Missing custom role name');
    return NextResponse.json(
      { error: 'Custom role name is required' },
      { status: 400 }
    );
  }

  if (!customRoleDescription) {
    console.log('❌ [CUSTOM-ROLES] Missing custom role description');
    return NextResponse.json(
      { error: 'Custom role description is required' },
      { status: 400 }
    );
  }

  try {
    const cacheKey = buildCacheKey(location, customRoleName);
    const cache = await loadCache();
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`💾 [CUSTOM-ROLES] Returning cached data for: ${customRoleName} - Request ID: ${requestId}`);
      return NextResponse.json({ ...cached.data, cache: true });
    }

    console.log(`🔄 [CUSTOM-ROLES] No cache hit, proceeding with AI generation - Request ID: ${requestId}`);

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    console.log('🌍 [CUSTOM-ROLES] Processing custom role request for:', {
      country: location.country,
      countryName,
      currency,
      customRoleName
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ [CUSTOM-ROLES] Missing ANTHROPIC_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Generate AI prompt for custom role
    const promptData = generateCustomRoleAIPrompt(location, customRoleName, customRoleDescription);

    console.log(`🤖 [CUSTOM-ROLES] Calling Anthropic API for custom role generation:`, customRoleName);
    
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
        max_tokens: 8000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: promptData.prompt
          }
        ]
      })
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('❌ [CUSTOM-ROLES] Anthropic API error:', errorText);
      throw new Error('Failed to generate data');
    }

    console.log('✅ [CUSTOM-ROLES] Anthropic API call successful');
    
    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    console.log('📄 [CUSTOM-ROLES] Received AI response, length:', generatedContent.length);
    console.log('📄 [CUSTOM-ROLES] AI Response preview:', generatedContent.substring(0, 500));

    // Extract JSON from the response
    let parsedData;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ [CUSTOM-ROLES] Successfully parsed AI response JSON');
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ [CUSTOM-ROLES] Failed to parse Anthropic response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse generated data' },
        { status: 500 }
      );
    }

    // Validate and prepare response data
    const rolesData = parsedData.roles;
    if (!rolesData) {
      return NextResponse.json({ error: 'Missing roles data' }, { status: 500 });
    }

    // Get the generated custom role data
    const customRoleId = customRoleName.toLowerCase().replace(/\s+/g, '');
    console.log('🔍 [CUSTOM-ROLES] Looking for role data with ID:', customRoleId);
    console.log('🔍 [CUSTOM-ROLES] Available role keys:', Object.keys(rolesData));
    
    let customRoleData = rolesData[customRoleId];
    
    // If not found with exact ID, try to find by partial match
    if (!customRoleData) {
      const availableKeys = Object.keys(rolesData);
      const matchingKey = availableKeys.find(key => 
        key.toLowerCase().includes(customRoleId) || 
        customRoleId.includes(key.toLowerCase())
      );
      
      if (matchingKey) {
        console.log('🔍 [CUSTOM-ROLES] Found matching key:', matchingKey);
        customRoleData = rolesData[matchingKey];
      }
    }
    
    if (!customRoleData) {
      console.error(`❌ Missing custom role data for: ${customRoleId}`);
      console.error('❌ [CUSTOM-ROLES] Available keys:', Object.keys(rolesData));
      console.error('❌ [CUSTOM-ROLES] Parsed data structure:', JSON.stringify(parsedData, null, 2));
      return NextResponse.json(
        { error: `Missing role data for ${customRoleName}` },
        { status: 500 }
      );
    }

    // Merge AI-generated experienceLevels with static structure
    let mergedExperienceLevels: typeof EXPERIENCE_LEVELS_DATA = EXPERIENCE_LEVELS_DATA;
    if (customRoleData.experienceLevels && Array.isArray(customRoleData.experienceLevels)) {
      mergedExperienceLevels = ([0, 1, 2].map((index) => {
        const staticLevel = EXPERIENCE_LEVELS_DATA[index] || EXPERIENCE_LEVELS_DATA[0];
        const aiLevel = customRoleData.experienceLevels[index] || {};
        return {
          level: staticLevel.level,
          title: staticLevel.title,
          description: aiLevel.description || staticLevel.description,
          bestFor: aiLevel.bestFor || staticLevel.bestFor,
          color: staticLevel.color,
          timeToProductivity: aiLevel.timeToProductivity || staticLevel.timeToProductivity
        };
      }) as unknown) as typeof EXPERIENCE_LEVELS_DATA;
    }

    // Create enhanced role data with proper structure
    const enhancedCustomRole = {
      id: customRoleId,
      title: customRoleName,
      icon: customRoleData.icon || '⚡',
      description: customRoleData.description || customRoleName,
      category: 'custom' as const,
      type: 'custom' as const,
      color: 'brand-accent',
      salary: customRoleData.salary,
      tasks: customRoleData.tasks || [],
      experienceLevels: mergedExperienceLevels,
      createdAt: new Date().toISOString()
    };

    const responseData = {
      success: true,
      ai: true,
      location: location,
      generatedAt: new Date().toISOString(),
      customRole: enhancedCustomRole,
      currency,
      currencySymbol
    };

    console.log(`✅ [CUSTOM-ROLES] Custom role data generated successfully for ${customRoleName}`);
    console.log('📊 [CUSTOM-ROLES] Response includes:', {
      customRole: customRoleName,
      tasksCount: enhancedCustomRole.tasks.length,
      currency,
      currencySymbol,
      ai: true
    });

    // Cache the result
    cache[cacheKey] = {
      data: responseData,
      timestamp: Date.now()
    };
    await saveCache(cache);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error(`❌ [CUSTOM-ROLES] API error:`, error);
    
    // Fallback to basic custom role structure when AI fails
    // Note: We can't read request.json() again here, so we'll use the original variables
    const fallbackCountryName = location?.countryName || location?.country || 'Unknown';
    
    console.log('🔄 [CUSTOM-ROLES] Falling back to basic custom role structure for:', customRoleName);
    
    const basicCustomRole = {
      id: customRoleName.toLowerCase().replace(/\s+/g, ''),
      title: customRoleName,
      icon: '⚡',
      description: customRoleName,
      category: 'custom' as const,
      type: 'custom' as const,
      color: 'brand-accent',
      tasks: [],
      experienceLevels: EXPERIENCE_LEVELS_DATA,
      createdAt: new Date().toISOString()
    };
    
    console.log('📊 [CUSTOM-ROLES] Fallback response includes:', {
      customRole: customRoleName,
      currency: 'USD',
      currencySymbol: '$',
      fallback: true
    });
    
    return NextResponse.json({
      customRole: basicCustomRole,
      success: true,
      location: location,
      generatedAt: new Date().toISOString(),
      currency: 'USD',
      currencySymbol: '$',
      fallback: true
    });
  }
}

// Clear cache function
export async function DELETE(request: NextRequest) {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify({}, null, 2));
    console.log('🗑️ [CUSTOM-ROLES] Cache cleared');
    return NextResponse.json({ success: true, message: 'Cache cleared' });
  } catch (error) {
    console.error('❌ [CUSTOM-ROLES] Failed to clear cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}

// Get cache info
export async function GET(request: NextRequest) {
  try {
    const cache = await loadCache();
    const cacheEntries = Object.keys(cache);
    
    return NextResponse.json({
      cacheEntries: cacheEntries.length,
      entries: cacheEntries.slice(0, 10), // Show first 10 entries
      ttl: CACHE_TTL
    });
  } catch (error) {
    console.error('❌ [CUSTOM-ROLES] Failed to get cache info:', error);
    return NextResponse.json(
      { error: 'Failed to get cache info' },
      { status: 500 }
    );
  }
} 