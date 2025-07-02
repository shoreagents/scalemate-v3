import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import { 
  ROLES, 
  EXPERIENCE_LEVELS_DATA,
  getStaticRoles,
  getRoleSalaryForCountry,
  getRoleSalaryWithUSAFallback
} from '@/utils/rolesData';
import { LocationData } from '@/types/location';
import { promises as fs } from 'fs';
import path from 'path';

// Type for the request body
interface RolesRequest {
  location: LocationData;
}

// File-based cache for development
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const CACHE_DIR = path.join(process.cwd(), '.cache');
const CACHE_FILE = path.join(CACHE_DIR, 'roles-cache.json');

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
    
    console.log(`📂 [ROLES] Loaded ${Object.keys(validCache).length} valid cache entries`);
    return validCache;
  } catch (error) {
    console.log('📂 [ROLES] No existing cache file, starting fresh');
    return {};
  }
}

// Save cache to file
async function saveCache(cache: CacheData) {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
    console.log(`💾 [ROLES] Saved ${Object.keys(cache).length} cache entries`);
  } catch (error) {
    console.error('❌ [ROLES] Failed to save cache:', error);
  }
}

// Helper to build cache key
function buildCacheKey(location: LocationData) {
  return `${location.country || ''}|${location.countryName || ''}|${location.currency || ''}`;
}

// Helper function to generate AI prompt based on rolesData.ts structure
function generateAIPrompt(location: LocationData) {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const countryName = location.countryName || location.country;
  const currency = location.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  // Get static data as reference from rolesData.ts
  const staticRoles = getStaticRoles();

  // Generate role list for prompt based on ROLES structure (only the 3 main roles)
  const roleEntries = Object.entries(staticRoles);
  const roleList = roleEntries.map(([id, role]) => `${role.title} (${id})`).join('\n   - ');

  // Generate JSON template for ONLY dynamic fields that AI should generate
  const jsonTemplate = roleEntries.map(([id, role]) => {
    return `    "${id}": {
      "icon": "[emoji for ${role.title}]",
      "description": "[local market role description]",
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
          "bestFor": "[entry level best for]"
        },
        {
          "description": "[mid level description]", 
          "bestFor": "[mid level best for]"
        },
        {
          "description": "[senior level description]",
          "bestFor": "[senior level best for]"
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
  }).join(',\n');

  const prompt = `You are a property management industry expert specializing in ${countryName}. Generate comprehensive, market-accurate role data.

Context: ${countryName}, ${currency} (${currencySymbol}), ${currentDate}

Generate country-specific data for these property management roles:
   - ${roleList}

Critical Requirements:
1. Role descriptions: Include local regulations, market conditions, and compliance requirements
2. Tasks (10 per role): Focus on ${countryName}-specific laws, practices, and regulatory requirements
3. Experience levels: Tailor descriptions and "best for" scenarios to local work culture and career progression
4. Salaries: Research current ${countryName} market rates (compare against Philippines baseline) - ALL ANNUAL/YEARLY amounts
5. Icons: Select emojis that universally represent each role's primary function

Data Quality Standards:
- Use official property management terminology for ${countryName}
- Reference actual local regulations and industry standards
- Ensure salary figures reflect current market reality (${currentDate}) as ANNUAL amounts
- Make task complexity ratings realistic for each activity
- Align experience descriptions with local hiring practices
- All salary components (base, total, benefits, taxes) must be ANNUAL (per year) figures

Return ONLY valid JSON in this exact format:
{
  "roles": {
${jsonTemplate}
  }
}`;

  return {
    prompt
  };
}

export async function POST(request: NextRequest) {
  console.log('🚀 [ROLES] API endpoint called');
  
  try {
    const body: RolesRequest = await request.json();
    const { location } = body;

    console.log('📥 [ROLES] Request received:', {
      location: location?.country,
      countryName: location?.countryName,
      currency: location?.currency,
      timestamp: new Date().toISOString()
    });

    if (!location?.country) {
      console.log('❌ [ROLES] Missing location data');
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const cacheKey = buildCacheKey(location);
    const cache = await loadCache();
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('💾 [ROLES] Returning cached data for:', location.country);
      return NextResponse.json({ ...cached.data, cache: true });
    }

    console.log('🔄 [ROLES] No cache hit, proceeding with AI generation');

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    console.log('🌍 [ROLES] Processing roles request for:', {
      country: location.country,
      countryName,
      currency
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('❌ [ROLES] Missing ANTHROPIC_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Generate AI prompt based on rolesData.ts structure
    const promptData = generateAIPrompt(location);

    console.log(`🤖 [ROLES] Calling Anthropic API for role generation for country:`, countryName);
    
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
      console.error('❌ [ROLES] Anthropic API error:', errorText);
      throw new Error('Failed to generate data');
    }

    console.log('✅ [ROLES] Anthropic API call successful');
    
    const anthropicData = await anthropicResponse.json();
    const generatedContent = anthropicData.content[0].text;

    console.log('📄 [ROLES] Received AI response, length:', generatedContent.length);

    // Extract JSON from the response
    let parsedData;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
        console.log('✅ [ROLES] Successfully parsed AI response JSON');
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ [ROLES] Failed to parse Anthropic response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse generated data' },
        { status: 500 }
      );
    }

    // Validate and merge with static data from rolesData.ts
    const staticRoles = getStaticRoles();
    const requiredRoles = Object.keys(staticRoles);

    let responseData: any = {
      success: true,
      ai: true,
      location: location,
      generatedAt: new Date().toISOString()
    };

    // Handle roles data
    const rolesData = parsedData.roles;
    if (!rolesData) {
      return NextResponse.json({ error: 'Missing roles data' }, { status: 500 });
    }

    // Validate all required roles are present
    for (const roleId of requiredRoles) {
      if (!rolesData[roleId]) {
        console.error(`❌ Missing role: ${roleId}`);
        return NextResponse.json(
          { error: `Missing role data for ${roleId}` },
          { status: 500 }
        );
      }
    }

    // Merge AI-generated roles with static data from rolesData.ts
    const enhancedRoles = Object.assign({}, staticRoles) as any;
    for (const [roleId, aiRole] of Object.entries(rolesData)) {
      if (enhancedRoles[roleId]) {
        // First, merge the main role data (description, tasks, salary, etc.)
        enhancedRoles[roleId] = Object.assign({}, enhancedRoles[roleId], aiRole);
        
        // Special handling for experienceLevels: merge AI content with static structure
        const staticExperienceLevels = (staticRoles as any)[roleId].experienceLevels;
        const aiExperienceLevels = (aiRole as any).experienceLevels;
        
        if (staticExperienceLevels && aiExperienceLevels && Array.isArray(aiExperienceLevels)) {
          const mergedExperienceLevels = staticExperienceLevels.map((staticLevel: any, index: number) => {
            const aiLevel = aiExperienceLevels[index];
            if (aiLevel) {
              // Merge AI-generated description and bestFor with static structure
              return {
                ...staticLevel,
                description: aiLevel.description || staticLevel.description,
                bestFor: aiLevel.bestFor || staticLevel.bestFor
              };
            }
            return staticLevel;
          });
          
          enhancedRoles[roleId].experienceLevels = mergedExperienceLevels;
        }
        
        // Note: description, tasks, salary are AI-generated and country-specific
        // Only structural fields (id, title, icon, category, type, color) are preserved from static data
        // Experience levels now properly merge AI content with static structure
      }
    }

    responseData.roles = enhancedRoles;

    console.log(`✅ [ROLES] Role data generated and validated successfully for ${countryName}`);
    console.log('📊 [ROLES] Response includes:', {
      roles: Object.keys(responseData.roles || {}),
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
    console.error(`❌ [ROLES] API error:`, error);
    
    // Fallback to static data when AI fails
    const body: RolesRequest = await request.json();
    const { location: fallbackLocation } = body;
    const fallbackCountryName = fallbackLocation?.countryName || fallbackLocation?.country || 'Unknown';
    console.log('🔄 [ROLES] Falling back to static roles data for:', fallbackCountryName);
    const staticRoles = getStaticRoles();
    
    console.log('📊 [ROLES] Fallback response includes:', {
      roles: Object.keys(staticRoles),
      currency: 'USD',
      currencySymbol: '$',
      fallback: true
    });
    
    return NextResponse.json({
      roles: staticRoles,
      success: true,
      location: fallbackLocation,
      generatedAt: new Date().toISOString(),
      currency: 'USD',
      currencySymbol: '$',
      fallback: true
    });
  }
}

// Clear cache function
async function clearCache() {
  try {
    await ensureCacheDir();
    await fs.writeFile(CACHE_FILE, JSON.stringify({}, null, 2));
    console.log('🗑️ [ROLES] Cache cleared');
  } catch (error) {
    console.error('❌ [ROLES] Failed to clear cache:', error);
  }
}

// Cache management endpoint for development
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear') {
      await clearCache();
      console.log('🗑️ [ROLES] Cache cleared via API');
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
    console.error('❌ [ROLES] Cache management error:', error);
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
    console.error('❌ [ROLES] Cache status error:', error);
    return NextResponse.json(
      { error: 'Cache status failed' },
      { status: 500 }
    );
  }
}