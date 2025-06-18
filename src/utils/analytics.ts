import { v4 as uuidv4 } from 'uuid';

// Types for analytics tracking
export interface SessionData {
  sessionId: string;
  startTime: Date;
  lastActivity: Date;
  currentStep: number;
  portfolioSize?: string;
  selectedRoles?: string[];
  teamSize?: Record<string, number>;
  calculationResult?: any;
  events: SessionEvent[];
  deviceInfo: DeviceInfo;
  geoInfo?: GeoInfo;
  referrer?: string;
  utmParams?: Record<string, string>;
}

export interface SessionEvent {
  timestamp: Date;
  type: 'page_view' | 'step_start' | 'step_complete' | 'role_select' | 'team_size_change' | 'calculation_complete' | 'exit_intent' | 'form_submit' | 'error' | 'portfolio_select' | 'calculation_start' | 'calculator_restart' | 'exit_popup_close';
  step?: number;
  data?: any;
  duration?: number;
}

export interface DeviceInfo {
  userAgent: string;
  screen: {
    width: number;
    height: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  isMobile: boolean;
  isTablet: boolean;
  browser: string;
  os: string;
}

export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
}

export interface LeadSubmission {
  sessionId: string;
  timestamp: Date;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  company?: string;
  urgency: string;
  source: string;
  calculatorData?: any;
  leadScore: number;
}

class AnalyticsTracker {
  private sessionData: SessionData | null = null;
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public init() {
    if (this.isInitialized) return;

    // Get or create session
    const existingSessionId = sessionStorage.getItem('calculatorSessionId');
    const sessionId = existingSessionId || uuidv4();
    
    if (!existingSessionId) {
      sessionStorage.setItem('calculatorSessionId', sessionId);
    }

    // Initialize session data
    this.sessionData = {
      sessionId,
      startTime: new Date(),
      lastActivity: new Date(),
      currentStep: 1,
      events: [],
      deviceInfo: this.getDeviceInfo(),
      referrer: document.referrer,
      utmParams: this.getUtmParams()
    };

    // Track initial page view
    this.trackEvent('page_view', { 
      url: window.location.href,
      title: document.title 
    });

    // Set up activity tracking
    this.setupActivityTracking();
    this.isInitialized = true;

    // Get geo info asynchronously
    this.getGeoInfo().then(geoInfo => {
      if (this.sessionData) {
        this.sessionData.geoInfo = geoInfo;
      }
    });
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    const screen = {
      width: window.screen.width,
      height: window.screen.height
    };
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    return {
      userAgent,
      screen,
      viewport,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      isTablet: /iPad|Tablet/.test(userAgent),
      browser: this.getBrowser(userAgent),
      os: this.getOS(userAgent)
    };
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getUtmParams(): Record<string, string> {
    const params = new URLSearchParams(window.location.search);
    const utmParams: Record<string, string> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      const value = params.get(param);
      if (value) {
        utmParams[param] = value;
      }
    });
    
    return utmParams;
  }

  private async getGeoInfo(): Promise<GeoInfo> {
    try {
      // Use a free IP geolocation service
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        country: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone
      };
    } catch (error) {
      console.warn('Failed to get geo info:', error);
      return {};
    }
  }

  private setupActivityTracking() {
    // Update last activity on user interaction
    const updateActivity = () => {
      if (this.sessionData) {
        this.sessionData.lastActivity = new Date();
      }
    };

    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Send data periodically
    setInterval(() => {
      this.sendSessionData();
    }, 30000); // Every 30 seconds

    // Send data before page unload
    window.addEventListener('beforeunload', () => {
      this.sendSessionData();
    });
  }

  public trackEvent(type: SessionEvent['type'], data?: any, duration?: number) {
    if (!this.sessionData) return;

    const event: SessionEvent = {
      timestamp: new Date(),
      type,
      step: this.sessionData.currentStep,
      data,
      ...(duration !== undefined && { duration })
    };

    this.sessionData.events.push(event);
    this.sessionData.lastActivity = new Date();

    // Send immediately for important events
    if (['calculation_complete', 'exit_intent', 'form_submit'].includes(type)) {
      this.sendSessionData();
    }
  }

  public updateStep(step: number) {
    if (!this.sessionData) return;
    
    this.sessionData.currentStep = step;
    this.trackEvent('step_start', { step });
  }

  public updateCalculatorData(data: Partial<SessionData>) {
    if (!this.sessionData) return;

    Object.assign(this.sessionData, data);
  }

  public async submitLead(leadData: Omit<LeadSubmission, 'sessionId' | 'timestamp' | 'leadScore'>): Promise<void> {
    const submission: LeadSubmission = {
      ...leadData,
      sessionId: this.sessionData?.sessionId || 'unknown',
      timestamp: new Date(),
      leadScore: this.calculateLeadScore(leadData)
    };

    this.trackEvent('form_submit', { source: leadData.source });

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      });
    } catch (error) {
      console.error('Failed to submit lead:', error);
      throw error;
    }
  }

  private calculateLeadScore(leadData: any): number {
    let score = 0;

    // Base score
    score += 20;

    // Portfolio size scoring
    if (this.sessionData?.portfolioSize) {
      const portfolioScores: Record<string, number> = {
        '500-999': 15,
        '1000-1999': 25,
        '2000-4999': 35,
        '5000+': 40
      };
      score += portfolioScores[this.sessionData.portfolioSize] || 0;
    }

    // Team size scoring
    const totalTeamSize = Object.values(this.sessionData?.teamSize || {}).reduce((sum, size) => sum + size, 0);
    score += Math.min(totalTeamSize * 5, 25);

    // Urgency scoring
    const urgencyScores: Record<string, number> = {
      'ASAP - Need to start within 2 weeks': 30,
      'Next Month - Planning for 30-day start': 25,
      'Next Quarter - 60-90 day timeline': 15,
      'Just Exploring - Future consideration': 5
    };
    score += urgencyScores[leadData.urgency] || 0;

    // Company provided
    if (leadData.company) score += 5;

    // Phone provided
    if (leadData.phone) score += 5;

    // Time spent on calculator
    const timeSpent = this.sessionData ? 
      (new Date().getTime() - this.sessionData.startTime.getTime()) / 1000 / 60 : 0;
    if (timeSpent > 2) score += 5;
    if (timeSpent > 5) score += 5;

    return Math.min(score, 100);
  }

  private async sendSessionData() {
    if (!this.sessionData) return;

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.sessionData)
      });
    } catch (error) {
      console.warn('Failed to send analytics data:', error);
    }
  }

  public getSessionId(): string | null {
    return this.sessionData?.sessionId || null;
  }

  public getSessionData(): SessionData | null {
    return this.sessionData;
  }
}

// Export singleton instance
export const analytics = new AnalyticsTracker(); 