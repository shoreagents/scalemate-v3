# Location-Based Portfolio Data Setup

This guide explains how to set up and use the new location-based portfolio data feature powered by Anthropic's Claude AI.

## 🌍 Feature Overview

The ScaleMate calculator now uses your IP address to detect your location and provides:

- **Location-specific portfolio recommendations** tailored to your country/region
- **Market insights** including property values, rental yields, and competition levels
- **Localized business factors** such as regulations, cultural considerations, and currency
- **AI-powered data generation** using Claude AI for accurate market analysis

## 🚀 Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# Anthropic Claude AI API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 2. Get Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env.local` file

### 3. Install Dependencies

The required packages are already installed:
- `@anthropic-ai/sdk` - Anthropic Claude API client

## 🛠 How It Works

### API Endpoints

#### `/api/geolocation`
- **Method**: GET
- **Description**: Detects user location via IP and generates location-specific portfolio data
- **Response**: Location data + AI-generated market insights

### Location Detection Flow

1. **IP Detection**: Extract user's IP from request headers
2. **Geolocation**: Use ipapi.co to convert IP to location data
3. **AI Generation**: Send location to Claude AI for market analysis
4. **Fallback**: Use static data if AI generation fails

### Data Structure

```typescript
interface LocationData {
  country: string;
  region: string;
  city: string;
  timezone: string;
  currency: string;
}

interface MarketData {
  portfolioSizes: {
    [key: string]: {
      min: number;
      max: number;
      tier: 'growing' | 'large' | 'major' | 'enterprise';
      description: string;
      recommendedTeamSize: Record<string, number>;
      averageRevenue: { min: number; max: number };
      implementationComplexity: string;
      localMarketFactors: string[];
      regulatoryConsiderations: string[];
    };
  };
  marketInsights: {
    averagePropertyValue: number;
    rentalYield: number;
    marketGrowth: number;
    competitionLevel: string;
    regulatoryEnvironment: string;
  };
  localizationFactors: {
    currency: string;
    timezone: string;
    businessHours: string;
    culturalConsiderations: string[];
    legalRequirements: string[];
  };
}
```

## 🧩 Components

### `useLocationBasedData` Hook

Custom hook that provides:
- **Location detection**
- **Portfolio data loading**
- **Error handling**
- **Loading states**
- **Refetch capability**

Usage:
```typescript
const {
  portfolioSizes,
  location,
  marketInsights,
  localizationFactors,
  isLoading,
  error,
  isAIGenerated,
  refetch
} = useLocationBasedData();
```

### Updated Components

#### `PortfolioStep.tsx`
- Now uses location-based data when available
- Shows location indicator and AI badge
- Displays local market factors
- Uses local currency formatting

## 🧪 Testing

### Test Page: `/test-location`

A comprehensive test page that displays:
- **Location detection status**
- **AI generation indicator**
- **Market insights dashboard**
- **Localization factors**
- **Portfolio data comparison**

### Testing Different Locations

To test different locations:
1. Use VPN to change your IP location
2. Use the refresh button on test page
3. Check browser network tab for API responses
4. Verify Claude AI generation vs fallback data

## 🌐 Supported Regions

### Primary Support
- **Australia** - Full market data and regulations
- **United States** - State-specific considerations
- **United Kingdom** - UK market insights
- **Canada** - Canadian property market data

### Global Fallback
- All other regions receive AI-generated data based on available market information
- Currency conversion and timezone adjustments
- Generic best practices and considerations

## 🔧 Configuration Options

### API Timeouts
- Geolocation API: 5 seconds
- Claude AI API: 10 seconds
- Fallback activation on timeout

### Rate Limiting
- Implement client-side caching
- Session-based data storage
- Graceful degradation to static data

### Error Handling
- Network failures → Static data
- API rate limits → Cached data
- Invalid responses → Fallback data

## 📊 Analytics

Track the following metrics:
- Location detection success rate
- AI generation vs fallback usage
- User interaction with location-specific features
- Regional performance variations

## 🚀 Deployment Considerations

### Environment Variables
Ensure `ANTHROPIC_API_KEY` is set in production

### IP Detection
- Works with Vercel/Netlify deployment
- Handles proxy headers correctly
- Fallback to development IP in local environment

### Performance
- Client-side caching for 30 minutes
- Lazy loading of location data
- Progressive enhancement approach

## 🔮 Future Enhancements

1. **Database Storage**: Cache generated data for popular locations
2. **Admin Override**: Manual market data updates
3. **A/B Testing**: Compare AI vs static data performance
4. **Multi-language**: Localized descriptions and factors
5. **Real Estate APIs**: Integration with live market data sources

## 🐛 Troubleshooting

### Common Issues

**Location not detected:**
- Check IP detection in browser network tab
- Verify ipapi.co service status
- Use test page to debug location data

**AI generation failing:**
- Verify Anthropic API key
- Check API quota and rate limits
- Monitor Claude API status page

**Static fallback always used:**
- Check environment variables
- Verify API endpoint accessibility
- Review browser console for errors

### Debug Mode

Enable debug logging by adding to `.env.local`:
```bash
DEBUG_LOCATION_API=true
```

This will log detailed information about:
- IP detection process
- Geolocation API responses
- Claude AI prompts and responses
- Fallback data selection 