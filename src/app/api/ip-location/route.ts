import { NextRequest, NextResponse } from 'next/server';

interface LocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  currency: string;
}

// Simple in-memory cache to reduce API calls
const locationCache = new Map<string, { data: LocationData; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

async function getLocationFromIP(ip: string): Promise<{location: LocationData, actualIp?: string}> {
  try {
    // Check cache first
    const cached = locationCache.get(ip);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`Using cached location for IP: ${ip}`);
      return { location: cached.data };
    }
    
    // If it's a local/reserved IP, use ipapi.co without IP parameter to detect public IP
    const isLocalIP = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '8.8.8.8';
    
    // Try multiple services if one fails
    const services = [
      {
        name: 'ipapi.co',
        url: isLocalIP ? 'https://ipapi.co/json/' : `https://ipapi.co/${ip}/json/`,
        parser: (data: any) => ({
          location: {
            country: data.country_name || 'Unknown',
            region: data.region || 'Unknown',
            city: data.city || 'Unknown',
            timezone: data.timezone || 'Unknown',
            currency: data.currency || 'Unknown'
          },
          actualIp: data.ip || undefined
        })
      },
      {
        name: 'ip-api.com',
        url: isLocalIP ? 'http://ip-api.com/json/' : `http://ip-api.com/json/${ip}`,
        parser: (data: any) => {
          // ip-api.com doesn't provide currency, so map from country
          const countryCurrencyMap: { [key: string]: string } = {
            'United States': 'USD',
            'Canada': 'CAD',
            'United Kingdom': 'GBP',
            'Australia': 'AUD',
            'Germany': 'EUR',
            'France': 'EUR',
            'Italy': 'EUR',
            'Spain': 'EUR',
            'Netherlands': 'EUR',
            'Japan': 'JPY',
            'China': 'CNY',
            'India': 'INR',
            'Brazil': 'BRL',
            'Mexico': 'MXN',
            'South Africa': 'ZAR',
            'New Zealand': 'NZD',
            'Singapore': 'SGD',
            'Switzerland': 'CHF',
            'Sweden': 'SEK',
            'Norway': 'NOK',
            'Denmark': 'DKK',
            'Philippines': 'PHP'
          };
          
          const currency = countryCurrencyMap[data.country] || 'Unknown';
          
          return {
            location: {
              country: data.country || 'Unknown',
              region: data.regionName || 'Unknown',
              city: data.city || 'Unknown',
              timezone: data.timezone || 'Unknown',
              currency: currency
            },
            actualIp: data.query || undefined
          };
        }
      }
    ];

    let lastError = null;
    
    for (const service of services) {
      try {
        console.log(`Trying ${service.name}: ${service.url} (original IP: ${ip})`);
        
        // Set up timeout using AbortController
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(service.url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'ScaleMate/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          // More detailed error handling for rate limiting
          if (response.status === 429) {
            throw new Error(`Rate limited by ${service.name} (429) - too many requests`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`${service.name} response:`, data);
        
        // Check for service-specific errors
        if (service.name === 'ipapi.co' && (data.error === true || data.error)) {
          throw new Error(`ipapi.co error: ${JSON.stringify(data)}`);
        }
        
        if (service.name === 'ip-api.com' && data.status === 'fail') {
          throw new Error(`ip-api.com error: ${data.message}`);
        }
        
        const result = service.parser(data);
        console.log(`Successfully parsed location from ${service.name}:`, result);
        
        // Cache the successful result
        locationCache.set(ip, { data: result.location, timestamp: Date.now() });
        
        return result;
        
      } catch (error) {
        console.error(`${service.name} failed:`, error);
        lastError = error;
        continue; // Try next service
      }
    }
    
    // If all services failed, check if it was due to rate limiting
    const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
    const isRateLimited = errorMessage.includes('Rate limited') || errorMessage.includes('429');
    
    if (isRateLimited) {
      console.log('All services rate limited, using unknown fallback');
      const fallbackLocation: LocationData = {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown', 
        timezone: 'Unknown',
        currency: 'Unknown'
      };
      
      // Cache the fallback briefly to avoid immediate retry
      locationCache.set(ip, { data: fallbackLocation, timestamp: Date.now() });
      return { location: fallbackLocation };
    }
    
    // If all services failed, throw the last error
    throw lastError;
    
  } catch (error) {
    console.error('Error fetching location from ipapi.co:', error);
    // Return unknown values instead of fallback
    return {
      location: {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown',
        timezone: 'Unknown',
        currency: 'Unknown'
      }
    };
  }
}

export async function GET(request: NextRequest) {
  // Get user's IP address (moved outside try block for error handling)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? (forwarded.split(',')[0] || '8.8.8.8').trim() : 
             realIp || 
             '8.8.8.8'; // Fallback IP for development

  // Check if this is a local IP
  const isLocalIP = ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '8.8.8.8';

  try {
    console.log('IP Detection:', {
      forwarded,
      realIp,
      finalIp: ip,
      isLocalIP,
      headers: Object.fromEntries(request.headers.entries())
    });

    // Get location data only (no AI calls)
    const { location, actualIp } = await getLocationFromIP(ip);
    console.log('Final location result:', location);

    return NextResponse.json({
      success: true,
      location,
      detectedIp: ip,
      actualIp: actualIp || (isLocalIP ? 'Auto-detected from local IP' : ip),
      isLocalIP,
      detectedAt: new Date().toISOString(),
      source: 'ipapi.co',
      fromCache: false
    });

  } catch (error) {
    console.error('IP Location API error:', error);
    
    // Return unknown data instead of fallback
    const unknownLocation: LocationData = {
      country: 'Unknown',
      region: 'Unknown', 
      city: 'Unknown',
      timezone: 'Unknown',
      currency: 'Unknown'
    };

    return NextResponse.json({
      success: false,
      location: unknownLocation,
      detectedIp: ip,
      actualIp: ip,
      isLocalIP,
      detectedAt: new Date().toISOString(),
      source: 'error',
      error: 'Failed to detect location'
    });
  }
} 