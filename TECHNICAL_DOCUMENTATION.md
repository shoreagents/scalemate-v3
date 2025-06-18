# 🔧 ScaleMate - Technical Documentation

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [File Structure](#file-structure)
3. [Component Architecture](#component-architecture)
4. [Data Flow](#data-flow)
5. [API Documentation](#api-documentation)
6. [Analytics System](#analytics-system)
7. [Lead Generation](#lead-generation)
8. [Pitch Deck System](#pitch-deck-system)
9. [State Management](#state-management)
10. [Styling System](#styling-system)
11. [Performance Optimizations](#performance-optimizations)
12. [Deployment Guide](#deployment-guide)

## 🏗️ Architecture Overview

### **Application Architecture**
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 App Router                    │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript)  │  Backend (API Routes)     │
│  ├─ Calculator Components       │  ├─ Analytics API         │
│  ├─ Admin Dashboard            │  ├─ Leads API             │
│  ├─ Pitch Deck Generator       │  ├─ Implementation API    │
│  └─ Analytics Tracking         │  └─ File-based Storage    │
├─────────────────────────────────────────────────────────────┤
│                    Data Layer                               │
│  ├─ JSON File Storage (/data)   │  ├─ Constants & Types     │
│  ├─ Session Management         │  └─ Utility Functions     │
└─────────────────────────────────────────────────────────────┘
```

### **Technology Stack**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0+
- **Animations**: Framer Motion 10.0+
- **Icons**: Lucide React
- **AI Integration**: Claude API (Anthropic)
- **Storage**: File-based JSON storage

## 📁 File Structure

```
scalemate-v3/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── admin/              # Admin dashboard
│   │   ├── api/                # API routes
│   │   │   ├── analytics/      # Analytics endpoints
│   │   │   ├── leads/          # Lead management
│   │   │   └── implementation-plan/ # AI implementation
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── admin/              # Admin-specific components
│   │   ├── calculator/         # Calculator components
│   │   │   ├── steps/          # Individual step components
│   │   │   └── OffshoreCalculator.tsx
│   │   ├── ui/                 # Reusable UI components
│   │   └── modals/             # Modal components
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── hooks/                  # Custom React hooks
├── data/                       # Data storage
│   ├── analytics.json          # Analytics data
│   └── leads.json              # Lead data
├── public/                     # Static assets
└── docs/                       # Documentation
```

## 🧩 Component Architecture

### **Core Components**

#### **OffshoreCalculator.tsx**
Main calculator wrapper component that manages the multi-step flow.

```typescript
interface CalculatorState {
  currentStep: number;
  formData: FormData;
  result: CalculationResult | null;
  sessionId: string;
}

const OffshoreCalculator: React.FC = () => {
  // State management
  // Step progression logic
  // Analytics tracking
  // Form data handling
}
```

#### **ResultsStep.tsx**
Comprehensive results display with tabbed interface.

```typescript
interface ResultsStepProps {
  result: CalculationResult;
  formData: FormData;
  onRestart: () => void;
}

// Features:
// - Overview & Analysis tab
// - Implementation Plan tab
// - Pitch Deck tab (6 slides)
// - Cost breakdown visualization
// - Risk assessment
// - Timeline planning
```

#### **Admin Dashboard Components**
```typescript
// AdminDashboard.tsx - Main dashboard layout
// AnalyticsChart.tsx - Charts and visualizations
// LeadTable.tsx - Lead management interface
// MetricsCard.tsx - Key performance indicators
```

### **UI Component System**

#### **Card Component**
```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
}

// Usage: Flexible container with consistent styling
<Card variant="elevated" padding="lg">
  <CardContent />
</Card>
```

#### **Button Component**
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

// Features:
// - Multiple variants and sizes
// - Loading states with spinners
// - Icon support
// - Accessibility features
```

## 🔄 Data Flow

### **Calculator Flow**
```
User Input → Form Validation → State Update → Analytics Tracking → Results Calculation → Display Results
```

### **Analytics Flow**
```
User Action → Event Capture → Data Processing → Storage → Dashboard Display
```

### **Lead Generation Flow**
```
User Behavior → Trigger Detection → Modal Display → Form Submission → Lead Scoring → Storage
```

## 🛠️ API Documentation

### **Analytics API (`/api/analytics`)**

#### **POST /api/analytics**
Track user analytics events.

```typescript
interface AnalyticsPayload {
  sessionId: string;
  currentStep: number;
  eventCount: number;
  deviceInfo: {
    userAgent: string;
    screen: { width: number; height: number };
    viewport: { width: number; height: number };
    isMobile: boolean;
    isTablet: boolean;
    browser: string;
    os: string;
  };
  geoInfo?: {
    country: string;
    region: string;
    city: string;
    timezone: string;
  };
}

// Response: 200 OK with confirmation
```

#### **GET /api/analytics**
Retrieve analytics data for admin dashboard.

```typescript
interface AnalyticsResponse {
  sessions: AnalyticsSession[];
  totalSessions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  topCountries: CountryData[];
  deviceBreakdown: DeviceData[];
  stepCompletionRates: StepData[];
}
```

### **Leads API (`/api/leads`)**

#### **POST /api/leads**
Submit new lead information.

```typescript
interface LeadPayload {
  email: string;
  firstName: string;
  company: string;
  urgency: 'immediate' | 'next-quarter' | 'exploring';
  sessionId: string;
  source: 'exit_intent' | 'form_completion';
}

// Auto-generated fields:
// - leadId: unique identifier
// - leadScore: calculated score (0-100)
// - timestamp: submission time
```

#### **GET /api/leads**
Retrieve lead data for admin dashboard.

```typescript
interface LeadsResponse {
  leads: Lead[];
  totalLeads: number;
  averageLeadScore: number;
  conversionRate: number;
  leadsBySource: SourceData[];
  leadsByUrgency: UrgencyData[];
}
```

### **Implementation Plan API (`/api/implementation-plan`)**

#### **POST /api/implementation-plan**
Generate AI-powered implementation plan.

```typescript
interface ImplementationRequest {
  formData: FormData;
  result: CalculationResult;
}

interface ImplementationResponse {
  plan: {
    phases: Phase[];
    timeline: string;
    keyMilestones: Milestone[];
    riskMitigation: RiskItem[];
    recommendations: string[];
  };
}
```

## 📊 Analytics System

### **Data Collection**
```typescript
// Analytics tracking implementation
const trackAnalytics = async (data: AnalyticsPayload) => {
  try {
    // Device detection
    const deviceInfo = getDeviceInfo();
    
    // Geographic detection (IP-based)
    const geoInfo = await getGeoInfo();
    
    // Session management
    const sessionId = getOrCreateSessionId();
    
    // Event tracking
    const eventData = {
      ...data,
      deviceInfo,
      geoInfo,
      sessionId,
      timestamp: new Date().toISOString()
    };
    
    await fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  } catch (error) {
    console.error('Analytics tracking failed:', error);
  }
};
```

### **Key Metrics Tracked**
- **Session Management**: Unique sessions, duration, page views
- **User Journey**: Step progression, completion rates, drop-off points
- **Geographic Data**: Country, region, city distribution
- **Device Analytics**: Browser, OS, screen resolution, mobile vs desktop
- **Engagement**: Time on page, interaction events, scroll depth

### **Data Storage Structure**
```json
{
  "sessions": [
    {
      "sessionId": "unique-session-id",
      "startTime": "2024-01-15T10:30:00Z",
      "lastActivity": "2024-01-15T10:45:00Z",
      "events": [
        {
          "timestamp": "2024-01-15T10:30:00Z",
          "currentStep": 1,
          "eventCount": 1,
          "deviceInfo": { ... },
          "geoInfo": { ... }
        }
      ]
    }
  ]
}
```

## 🎯 Lead Generation System

### **Lead Capture Triggers**
```typescript
// Exit intent detection
const handleExitIntent = (event: MouseEvent) => {
  if (event.clientY <= 0 && !hasShownExitIntent) {
    showLeadCaptureModal();
    setHasShownExitIntent(true);
  }
};

// Time-based triggers
useEffect(() => {
  const timer = setTimeout(() => {
    if (shouldShowTimeBasedModal()) {
      showLeadCaptureModal();
    }
  }, 60000); // 1 minute

  return () => clearTimeout(timer);
}, []);

// Scroll-based triggers
const handleScroll = () => {
  const scrollPercentage = getScrollPercentage();
  if (scrollPercentage > 75 && !hasShownScrollModal) {
    showLeadCaptureModal();
    setHasShownScrollModal(true);
  }
};
```

### **Lead Scoring Algorithm**
```typescript
const calculateLeadScore = (lead: LeadData, session: AnalyticsSession): number => {
  let score = 0;
  
  // Engagement scoring (0-40 points)
  const engagementScore = Math.min(40, session.events.length * 2);
  score += engagementScore;
  
  // Company size indicators (0-30 points)
  const companyScore = assessCompanySize(lead.company);
  score += companyScore;
  
  // Urgency assessment (0-30 points)
  const urgencyScores = {
    'immediate': 30,
    'next-quarter': 20,
    'exploring': 10
  };
  score += urgencyScores[lead.urgency] || 0;
  
  // Form completion quality (0-20 points)
  const completionScore = assessFormCompletion(lead);
  score += completionScore;
  
  return Math.min(100, score);
};
```

## 🎨 Pitch Deck System

### **Slide Generation**
```typescript
interface PitchSlide {
  id: number;
  title: string;
  content: React.ReactNode;
  data?: any;
}

const generatePitchDeck = (result: CalculationResult, formData: FormData): PitchSlide[] => {
  return [
    {
      id: 1,
      title: "Executive Summary",
      content: <ExecutiveSummarySlide result={result} formData={formData} />
    },
    {
      id: 2,
      title: "Financial Impact",
      content: <FinancialImpactSlide result={result} />
    },
    {
      id: 3,
      title: "Team Structure",
      content: <TeamStructureSlide result={result} />
    },
    {
      id: 4,
      title: "Implementation Roadmap",
      content: <RoadmapSlide result={result} />
    },
    {
      id: 5,
      title: "Risk Assessment",
      content: <RiskAssessmentSlide result={result} />
    },
    {
      id: 6,
      title: "Recommendations",
      content: <RecommendationsSlide result={result} />
    }
  ];
};
```

### **Slide Components**
Each slide is a self-contained React component with:
- **Professional styling** with consistent branding
- **Data visualization** using charts and metrics
- **Interactive elements** for engagement
- **Export capabilities** for presentation use

## 🔧 State Management

### **Calculator State**
```typescript
interface CalculatorState {
  currentStep: number;
  formData: FormData;
  result: CalculationResult | null;
  sessionId: string;
  isLoading: boolean;
  errors: Record<string, string>;
}

// State management using React hooks
const useCalculatorState = () => {
  const [state, setState] = useState<CalculatorState>(initialState);
  
  const updateFormData = (stepData: Partial<FormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...stepData }
    }));
  };
  
  const nextStep = () => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(5, prev.currentStep + 1)
    }));
  };
  
  return { state, updateFormData, nextStep, /* other methods */ };
};
```

### **Analytics State**
```typescript
// Global analytics context
const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionId] = useState(() => generateSessionId());
  const [eventCount, setEventCount] = useState(0);
  
  const trackEvent = useCallback(async (eventData: Partial<AnalyticsPayload>) => {
    setEventCount(prev => prev + 1);
    await trackAnalytics({
      sessionId,
      eventCount: eventCount + 1,
      ...eventData
    });
  }, [sessionId, eventCount]);
  
  return (
    <AnalyticsContext.Provider value={{ sessionId, trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
};
```

## 🎨 Styling System

### **Tailwind Configuration**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        secondary: {
          500: '#d946ef',
          600: '#c026d3',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
};
```

### **Component Styling Patterns**
```typescript
// Consistent styling with variants
const cardVariants = {
  default: 'bg-white border border-gray-200 rounded-lg shadow-sm',
  elevated: 'bg-white border border-gray-200 rounded-lg shadow-lg',
  bordered: 'bg-white border-2 border-gray-300 rounded-lg'
};

const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  outline: 'border border-primary-600 text-primary-600 hover:bg-primary-50'
};
```

## ⚡ Performance Optimizations

### **Code Splitting**
```typescript
// Dynamic imports for better performance
const AdminDashboard = dynamic(() => import('./components/admin/AdminDashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

const PitchDeckModal = dynamic(() => import('./components/modals/PitchDeckModal'), {
  loading: () => <div>Loading...</div>
});
```

### **Image Optimization**
```typescript
// Next.js Image component usage
import Image from 'next/image';

<Image
  src="/chart-example.png"
  alt="Cost comparison chart"
  width={800}
  height={400}
  priority={false}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### **Caching Strategy**
```typescript
// API route caching
export async function GET() {
  const data = await getAnalyticsData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

## 🚀 Deployment Guide

### **Environment Setup**
```bash
# Production environment variables
CLAUDE_API_KEY=your_production_claude_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### **Build Process**
```bash
# Install dependencies
npm ci

# Build application
npm run build

# Start production server
npm start
```

### **Vercel Deployment**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **Docker Deployment**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## 🔍 Monitoring & Debugging

### **Error Handling**
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
    // Send to monitoring service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}
```

### **Logging System**
```typescript
// Structured logging
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // Send to monitoring service
  },
  analytics: (event: string, data?: any) => {
    console.log(`[ANALYTICS] ${event}`, data);
  }
};
```

## 🔐 Security Considerations

### **Input Validation**
```typescript
// Form validation with Zod
import { z } from 'zod';

const leadSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  company: z.string().min(1, 'Company name is required'),
  urgency: z.enum(['immediate', 'next-quarter', 'exploring'])
});

// API route validation
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = leadSchema.parse(body);
    // Process validated data
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
```

### **Rate Limiting**
```typescript
// Simple rate limiting implementation
const rateLimiter = new Map();

const checkRateLimit = (ip: string, limit: number = 10) => {
  const now = Date.now();
  const windowStart = now - 60000; // 1 minute window
  
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => time > windowStart);
  
  if (recentRequests.length >= limit) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
};
```

## 📈 Analytics & Metrics

### **Key Performance Indicators**
- **User Engagement**: Session duration, page views, interaction events
- **Conversion Rates**: Step completion, lead generation, form submissions
- **Technical Performance**: Page load times, API response times, error rates
- **Business Metrics**: Lead quality scores, geographic distribution, device usage

### **Monitoring Dashboard**
The admin dashboard provides real-time insights into:
- Active user sessions
- Geographic user distribution
- Device and browser analytics
- Step completion funnel
- Lead generation performance
- System health metrics

---

## 🤝 Contributing to Technical Documentation

When contributing to the technical documentation:

1. **Keep it current** - Update docs when making code changes
2. **Be specific** - Include code examples and exact configurations
3. **Test examples** - Ensure all code snippets work as documented
4. **Cross-reference** - Link related sections and external resources
5. **Version changes** - Document breaking changes and migration paths

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: ScaleMate Development Team 