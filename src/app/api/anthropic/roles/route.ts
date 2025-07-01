import { NextRequest, NextResponse } from 'next/server';
import { getCurrencySymbol } from '@/utils/currency';
import { 
  ROLES, 
  EXPERIENCE_LEVELS_DATA,
  getStaticRoles,
  getStaticRolesSalaryComparison,
  getRoleSalaryForCountry,
  getRoleSalaryWithUSAFallback
} from '@/utils/rolesData';
import { LocationData } from '@/types/location';
import { promises as fs } from 'fs';
import path from 'path';

// Type for the request body
interface RolesRequest {
  location: LocationData;
  requestType?: 'roles' | 'salary' | 'all';
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
function buildCacheKey(location: LocationData, requestType: string) {
  return `${location.country || ''}|${location.countryName || ''}|${location.currency || ''}|${requestType}`;
}

// Helper function to generate AI prompt based on rolesData.ts structure
function generateAIPrompt(location: LocationData, requestType: 'roles' | 'salary' | 'all') {
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
  const staticSalary = getStaticRolesSalaryComparison();

  // Generate role list for prompt based on ROLES structure (only the 3 main roles)
  const roleEntries = Object.entries(staticRoles);
  const roleList = roleEntries.map(([id, role]) => `${role.title} (${id})`).join('\n   - ');

  // Generate JSON template based on ROLES structure from rolesData.ts
  const jsonTemplate = roleEntries.map(([id, role]) => {
    return `    "${id}": {
      "icon": "[${countryName}-specific emoji icon]",
      "description": "[Enhanced description for ${countryName} market]",
      "tasks": [
        {
          "id": "[${countryName}-specific-task-1]",
          "name": "[${countryName}-specific task name 1]",
          "tooltip": "[${countryName}-specific task description 1]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-2]",
          "name": "[${countryName}-specific task name 2]",
          "tooltip": "[${countryName}-specific task description 2]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-3]",
          "name": "[${countryName}-specific task name 3]",
          "tooltip": "[${countryName}-specific task description 3]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-4]",
          "name": "[${countryName}-specific task name 4]",
          "tooltip": "[${countryName}-specific task description 4]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-5]",
          "name": "[${countryName}-specific task name 5]",
          "tooltip": "[${countryName}-specific task description 5]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-6]",
          "name": "[${countryName}-specific task name 6]",
          "tooltip": "[${countryName}-specific task description 6]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-7]",
          "name": "[${countryName}-specific task name 7]",
          "tooltip": "[${countryName}-specific task description 7]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-8]",
          "name": "[${countryName}-specific task name 8]",
          "tooltip": "[${countryName}-specific task description 8]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-9]",
          "name": "[${countryName}-specific task name 9]",
          "tooltip": "[${countryName}-specific task description 9]",
          "complexity": "[low/medium/high]"
        },
        {
          "id": "[${countryName}-specific-task-10]",
          "name": "[${countryName}-specific task name 10]",
          "tooltip": "[${countryName}-specific task description 10]",
          "complexity": "[low/medium/high]"
        }
      ],
      "experienceLevels": [
        {
          "description": "[${countryName}-specific entry level description]",
          "bestFor": "[${countryName}-specific entry level best for]"
        },
        {
          "description": "[${countryName}-specific mid level description]",
          "bestFor": "[${countryName}-specific mid level best for]"
        },
        {
          "description": "[${countryName}-specific senior level description]",
          "bestFor": "[${countryName}-specific senior level best for]"
        }
      ],
      "salary": {
        "${countryName}": {
          "entry": { "base": [${countryName} entry base salary], "total": [${countryName} entry total], "benefits": [${countryName} entry benefits], "taxes": [${countryName} entry taxes] },
          "moderate": { "base": [${countryName} moderate base salary], "total": [${countryName} moderate total], "benefits": [${countryName} moderate benefits], "taxes": [${countryName} moderate taxes] },
          "experienced": { "base": [${countryName} experienced base salary], "total": [${countryName} experienced total], "benefits": [${countryName} experienced benefits], "taxes": [${countryName} experienced taxes] }
        },
        "Philippines": {
          "entry": { "base": [Philippines entry base salary], "total": [Philippines entry total], "benefits": [Philippines entry benefits], "taxes": [Philippines entry taxes] },
          "moderate": { "base": [Philippines moderate base salary], "total": [Philippines moderate total], "benefits": [Philippines moderate benefits], "taxes": [Philippines moderate taxes] },
          "experienced": { "base": [Philippines experienced base salary], "total": [Philippines experienced total], "benefits": [Philippines experienced benefits], "taxes": [Philippines experienced taxes] }
        }
      }
    }`;
  }).join(',\n');

  // Generate salary template based on SALARY_DATA structure from rolesData.ts
  const salaryTemplate = roleEntries.map(([id]) => {
    return `    "${id}": {
      "${countryName}": {
        "entry": { "base": [${countryName} entry base salary], "total": [${countryName} entry total], "benefits": [${countryName} entry benefits], "taxes": [${countryName} entry taxes] },
        "moderate": { "base": [${countryName} moderate base salary], "total": [${countryName} moderate total], "benefits": [${countryName} moderate benefits], "taxes": [${countryName} moderate taxes] },
        "experienced": { "base": [${countryName} experienced base salary], "total": [${countryName} experienced total], "benefits": [${countryName} experienced benefits], "taxes": [${countryName} experienced taxes] }
      },
      "Philippines": { 
        "entry": { "base": 300000, "total": 390000, "benefits": 60000, "taxes": 90000 },
        "moderate": { "base": 420000, "total": 546000, "benefits": 84000, "taxes": 126000 },
        "experienced": { "base": 600000, "total": 780000, "benefits": 120000, "taxes": 180000 }
      }
    }`;
  }).join(',\n');

  let prompt: string;

  if (requestType === 'all') {
    prompt = `You are a property management industry expert specializing in ${countryName}. Generate comprehensive data for the ${countryName} market as of ${currentDate}.

CONTEXT:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}
- Target: Property management companies considering offshore teams

EXISTING ROLES TO ENHANCE:
${roleList}

TASK: Generate ALL data types - enhanced role definitions and location-specific salary data for ${countryName}.

REQUIREMENTS:
1. ROLE DEFINITIONS: Enhance descriptions, skills, and keywords for ${countryName} market
2. SALARY DATA: Generate current ${currentDate} market rates for ${countryName} vs Philippines
3. Keep role titles EXACTLY as specified - do NOT modify titles
4. Use realistic ${countryName} market rates in ${currency}
5. Keep Philippines rates as specified (PHP)

Respond with ONLY a valid JSON object in this exact format:
{
  "roles": {
${jsonTemplate}
  },
  "rolesSalaryComparison": {
${salaryTemplate}
  }
}`;
  } else if (requestType === 'roles') {
    prompt = `You are a property management industry expert specializing in ${countryName}. Enhance the existing role definitions for the ${countryName} market as of ${currentDate}.

CONTEXT:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}

EXISTING ROLES TO ENHANCE:
${roleList}

TASK: Generate enhanced role definitions for ${countryName}.

REQUIREMENTS:
1. Enhance descriptions for ${countryName} market context
2. Generate ${countryName}-specific required and optional skills
3. Create ${countryName}-relevant search keywords
4. Keep role titles EXACTLY as specified - do NOT modify titles

Respond with ONLY a valid JSON object in this exact format:
{
  "roles": {
${jsonTemplate}
  }
}`;
  } else { // salary
    prompt = `You are a property management industry expert specializing in ${countryName}. Generate location-specific salary data for ${countryName} as of ${currentDate}.

CONTEXT:
- Country: ${countryName}
- Currency: ${currency} (${currencySymbol})
- Current Date: ${currentDate}

EXISTING ROLES:
${roleList}

TASK: Generate current ${countryName} salary data vs Philippines comparison.

REQUIREMENTS:
1. Generate current ${currentDate} market rates for ${countryName} in ${currency}
2. Include entry, moderate, experienced levels for each role
3. Provide base, total, benefits, taxes breakdown
4. Keep Philippines rates as specified (PHP)
5. Use realistic ${countryName} market rates

Respond with ONLY a valid JSON object in this exact format:
{
  "rolesSalaryComparison": {
${salaryTemplate}
  }
}`;
  }

  return {
    prompt,
    roleEntries,
    roleList,
    jsonTemplate,
    salaryTemplate
  };
}

export async function POST(request: NextRequest) {
  console.log('🚀 [ROLES] API endpoint called');
  
  try {
    const body: RolesRequest = await request.json();
    const { location, requestType = 'all' } = body;

    console.log('📥 [ROLES] Request received:', {
      location: location?.country,
      countryName: location?.countryName,
      currency: location?.currency,
      requestType,
      timestamp: new Date().toISOString()
    });

    if (!location?.country) {
      console.log('❌ [ROLES] Missing location data');
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    const cacheKey = buildCacheKey(location, requestType);
    const cache = await loadCache();
    const cached = cache[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('💾 [ROLES] Returning cached data for:', location.country, 'requestType:', requestType);
      return NextResponse.json({ ...cached.data, cache: true });
    }

    console.log('🔄 [ROLES] No cache hit, proceeding with AI generation');

    const countryName = location.countryName || location.country;
    const currency = location.currency || 'USD';
    const currencySymbol = getCurrencySymbol(currency);

    console.log('🌍 [ROLES] Processing roles request for:', {
      country: location.country,
      countryName,
      currency,
      requestType
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
    const promptData = generateAIPrompt(location, requestType);

    console.log(`🤖 [ROLES] Calling Anthropic API for ${requestType} generation for country:`, countryName);
    
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
        max_tokens: requestType === 'all' ? 8000 : 4000,
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
    const staticSalary = getStaticRolesSalaryComparison();
    const requiredRoles = Object.keys(staticRoles);
    const rolesWithSalaryData = Object.keys(staticRoles); // Only main 3 roles have salary data

    let responseData: any = {
      success: true,
      ai: true,
      location: location,
      generatedAt: new Date().toISOString(),
      requestType
    };

    // Handle roles data
    if (requestType === 'roles' || requestType === 'all') {
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
          enhancedRoles[roleId] = Object.assign({}, enhancedRoles[roleId], aiRole, {
            // Preserve static data that shouldn't be overridden
            tasks: enhancedRoles[roleId].tasks,
            experienceLevels: enhancedRoles[roleId].experienceLevels,
            salary: enhancedRoles[roleId].salary
          });
        }
      }

      responseData.roles = enhancedRoles;
    }

    // Handle salary data (only for main 3 roles that have salary data)
    if (requestType === 'salary' || requestType === 'all') {
      const salaryData = parsedData.rolesSalaryComparison;
      if (!salaryData) {
        return NextResponse.json({ error: 'Missing salary data' }, { status: 500 });
      }

      // Validate salary data structure (only for roles with salary data)
      for (const roleId of rolesWithSalaryData) {
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

      // Merge AI-generated salary data with static data from rolesData.ts
      const enhancedSalary = Object.assign({}, staticSalary) as any;
      for (const [roleId, aiSalary] of Object.entries(salaryData)) {
        if (enhancedSalary[roleId as keyof typeof enhancedSalary]) {
          enhancedSalary[roleId as keyof typeof enhancedSalary] = Object.assign({}, enhancedSalary[roleId as keyof typeof enhancedSalary], aiSalary);
        }
      }

      responseData.rolesSalaryComparison = enhancedSalary;
    }

    console.log(`✅ [ROLES] ${requestType} data generated and validated successfully for ${countryName}`);
    console.log('📊 [ROLES] Response includes:', {
      roles: requestType === 'roles' || requestType === 'all' ? Object.keys(responseData.roles || {}) : 'N/A',
      salaryComparison: requestType === 'salary' || requestType === 'all' ? Object.keys(responseData.rolesSalaryComparison || {}) : 'N/A',
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
    const staticSalary = getStaticRolesSalaryComparison();
    
    console.log('📊 [ROLES] Fallback response includes:', {
      roles: Object.keys(staticRoles),
      salaryComparison: Object.keys(staticSalary),
      currency: 'USD',
      currencySymbol: '$',
      fallback: true
    });
    
    return NextResponse.json({
      roles: staticRoles,
      rolesSalaryComparison: staticSalary,
      success: true,
      location: fallbackLocation,
      generatedAt: new Date().toISOString(),
      requestType: 'all',
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
          currency: value.data.currency,
          requestType: value.data.requestType
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