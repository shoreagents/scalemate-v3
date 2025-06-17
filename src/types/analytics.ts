import { CalculatorStep, RoleId, PortfolioSize, ExperienceLevel, TaskComplexity, UrgencyLevel, ValidationError } from './calculator';

// Event types with strict typing
export type AnalyticsEventType = 
  | 'session_started'
  | 'step_entered'
  | 'step_completed'
  | 'portfolio_selected'
  | 'role_selected'
  | 'role_deselected'
  | 'task_selected'
  | 'task_deselected'
  | 'custom_task_added'
  | 'custom_task_removed'
  | 'custom_task_ai_suggestion'
  | 'experience_selected'
  | 'team_size_selected'
  | 'tooltip_viewed'
  | 'tooltip_ai_generated'
  | 'calculation_completed'
  | 'results_viewed'
  | 'savings_amount_viewed'
  | 'premium_button_clicked'    // NEW: tracks interest
  | 'premium_modal_opened'
  | 'premium_modal_closed'
  | 'premium_signup_started'    // when they start filling form
  | 'premium_signup_completed'  // when they submit
  | 'premium_signup_abandoned'  // when they close modal
  | 'email_entered'            // ONLY in premium flow
  | 'phone_entered'            // ONLY in premium flow
  | 'form_validation_error'
  | 'user_drop_off'
  | 'page_visibility_change'
  | 'scroll_depth'
  | 'time_on_step'
  | 'calculator_restart'       // NEW: if they start over
  | 'error_occurred'
  | 'api_call_failed'
  | 'cache_hit'
  | 'cache_miss';

// Device and browser information
export interface DeviceInfo {
  readonly type: 'mobile' | 'tablet' | 'desktop';
  readonly os: string;
  readonly browser: string;
  readonly screenWidth: number;
  readonly screenHeight: number;
  readonly viewportWidth: number;
  readonly viewportHeight: number;
  readonly pixelRatio: number;
  readonly touchEnabled: boolean;
}

// Geographic information
export interface GeoInfo {
  readonly country?: string;
  readonly region?: string;
  readonly city?: string;
  readonly timezone?: string;
  readonly currency?: string;
}

// Traffic source information
export interface TrafficSource {
  readonly source: string;
  readonly medium: string;
  readonly campaign?: string;
  readonly term?: string;
  readonly content?: string;
  readonly referrer?: string;
}

// Event data structure - ANONYMOUS TRACKING
export interface EventData {
  // Step tracking
  readonly step?: CalculatorStep;
  readonly previousStep?: CalculatorStep;
  readonly timeOnStep?: number; // milliseconds
  
  // Role and task tracking
  readonly roleId?: RoleId;
  readonly roleName?: string;
  readonly taskId?: string;
  readonly taskName?: string;
  readonly taskComplexity?: TaskComplexity;
  readonly isCustomTask?: boolean;
  readonly customTaskDescription?: string;
  
  // Form data tracking
  readonly portfolioSize?: PortfolioSize;
  readonly experienceLevel?: ExperienceLevel;
  readonly teamSize?: number;
  readonly totalTeamSize?: number;
  
  // Calculation tracking
  readonly savingsAmount?: number;
  readonly savingsPercentage?: number;
  readonly leadScore?: number;
  readonly calculationTime?: number; // milliseconds
  
  // Tooltip tracking
  readonly tooltipType?: 'static' | 'ai_generated';
  readonly tooltipContext?: string;
  readonly tooltipGenerationTime?: number;
  
  // ONLY contact info if premium signup attempted
  readonly premiumSignupAttempted?: boolean;
  readonly email?: string; // only if they try premium
  readonly phone?: string; // only if they try premium
  readonly company?: string; // only if they try premium
  readonly urgency?: UrgencyLevel; // only if they try premium
  
  // Error tracking
  readonly errorMessage?: string;
  readonly errorStack?: string;
  readonly errorCode?: string;
  readonly validationErrors?: readonly ValidationError[];
  
  // Performance tracking
  readonly loadTime?: number;
  readonly apiResponseTime?: number;
  readonly renderTime?: number;
  
  // User behavior (anonymous)
  readonly scrollDepth?: number;
  readonly clickPosition?: { x: number; y: number };
  readonly pageVisibilityState?: 'visible' | 'hidden';
  
  // Technical details (anonymous)
  readonly userAgent?: string;
  readonly viewport?: string;
  readonly referrer?: string;
  readonly sessionDuration?: number;
  
  // Additional context
  readonly [key: string]: unknown;
}

// Analytics event structure
export interface AnalyticsEvent {
  readonly id: string;
  readonly sessionId: string;
  readonly eventType: AnalyticsEventType;
  readonly timestamp: number;
  readonly timeFromStart: number;
  readonly data: EventData;
  readonly device: DeviceInfo;
  readonly geo?: GeoInfo;
  readonly traffic: TrafficSource;
}

// Session summary - ANONYMOUS TRACKING
export interface SessionSummary {
  readonly sessionId: string;
  readonly startTime: number;
  readonly endTime?: number;
  readonly totalDuration: number;
  readonly eventsCount: number;
  readonly stepCompletions: Record<CalculatorStep, boolean>;
  readonly lastCompletedStep: CalculatorStep;
  readonly userJourney: readonly AnalyticsEventType[];
  readonly conversionStatus: 'started' | 'step_completed' | 'calculation_completed' | 'premium_interest' | 'premium_signup' | 'dropped_off';
  readonly dropOffPoint?: CalculatorStep;
  readonly leadScore: number;
  readonly totalSavingsViewed?: number;
  readonly rolesSelected: readonly RoleId[];
  readonly tasksSelected: number;
  readonly customTasksAdded: number;
  readonly tooltipsViewed: number;
  readonly errorsEncountered: number;
  readonly premiumInterest: boolean; // did they click premium button?
  readonly device: DeviceInfo;
  readonly traffic: TrafficSource;
  // NO personal information - all anonymous
}

// Analytics configuration
export interface AnalyticsConfig {
  readonly enabled: boolean;
  readonly debug: boolean;
  readonly batchSize: number;
  readonly flushInterval: number; // milliseconds
  readonly retryAttempts: number;
  readonly endpoints: {
    readonly events: string;
    readonly sessions: string;
  };
  readonly sampling: {
    readonly rate: number; // 0-1
    readonly rules: Record<AnalyticsEventType, number>;
  };
} 