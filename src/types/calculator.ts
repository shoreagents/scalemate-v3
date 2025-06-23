// Enum-like string literal types for better type safety
export type PortfolioSize = string; // e.g. "100-299", "500-999", "1000-2499", etc.
export type ExperienceLevel = 'entry' | 'moderate' | 'experienced';
export type RoleId = 'assistantPropertyManager' | 'leasingCoordinator' | 'marketingSpecialist';
export type BusinessTier = 'growing' | 'large' | 'major' | 'enterprise';
export type TaskComplexity = 'low' | 'medium' | 'high';
export type CalculatorStep = 1 | 2 | 3 | 4 | 5;

// Urgency options for premium signup
export type UrgencyLevel = 
  | 'ASAP - Need to start within 2 weeks'
  | 'Next Month - Planning for 30-day start'
  | 'Next Quarter - 60-90 day timeline'
  | 'Just Exploring - Future consideration';

// Phone number type with proper validation
export interface PhoneNumber {
  countryCode: string;  // e.g., "+61"
  number: string;       // e.g., "123456789"
  formatted: string;    // e.g., "+61 123 456 789"
  isValid: boolean;
}

// Contact information ONLY for premium signup (optional)
export interface ContactInfo {
  email: string;
  phone: PhoneNumber;
  company: string;
  urgency: UrgencyLevel;
  firstName?: string;
  lastName?: string;
  position?: string;
  companyWebsite?: string;
}

// Salary data structure
export interface SalaryData {
  readonly base: number;
  readonly total: number;
}

export interface RoleSalaryData {
  readonly australian: {
    readonly entry: SalaryData;
    readonly moderate: SalaryData;
    readonly experienced: SalaryData;
  };
  readonly philippine: {
    readonly entry: SalaryData;
    readonly moderate: SalaryData;
    readonly experienced: SalaryData;
  };
}

// Task definition
export interface Task {
  readonly id: string;
  readonly name: string;
  readonly aiAdvantage: string;
  readonly timeSaved: string;
  readonly tooltip: string;
  readonly complexity: TaskComplexity;
  readonly category: 'administrative' | 'communication' | 'marketing' | 'analysis' | 'coordination';
  readonly skillLevel: 1 | 2 | 3 | 4 | 5; // 1-5 skill level required
}

// Role definition
export interface Role {
  readonly id: RoleId;
  readonly title: string;
  readonly icon: string;
  readonly description: string;
  readonly color: string;
  readonly tasks: readonly Task[];
  readonly averageSalary: {
    readonly australian: number;
    readonly philippine: number;
  };
  readonly requiredSkills: readonly string[];
  readonly optionalSkills: readonly string[];
}

// Custom task added by user
export interface CustomTask {
  readonly id: string;
  readonly description: string;
  readonly estimatedComplexity: TaskComplexity;
  readonly aiSuggestion?: string;
  readonly createdAt: Date;
}

// Form data structure - ANONYMOUS FREE TOOL
export interface FormData {
  portfolioSize: PortfolioSize | '';
  selectedRoles: Record<RoleId, boolean>;
  selectedTasks: Record<string, boolean>; // key format: "roleId-taskId"
  customTasks: Record<RoleId, readonly CustomTask[]>;
  experienceLevel: ExperienceLevel | '';
  teamSize: Record<RoleId, number>;
  // NO email or contact info - anonymous until premium signup
  currentStep: CalculatorStep;
  completedSteps: readonly CalculatorStep[];
  startedAt: Date;
  lastUpdatedAt: Date;
  sessionId: string; // for anonymous tracking
}

// Calculation results
export interface RoleSavings {
  readonly roleId: RoleId;
  readonly roleName: string;
  readonly teamSize: number;
  readonly experienceLevel: ExperienceLevel;
  readonly australianCost: number;
  readonly philippineCost: number;
  readonly savings: number;
  readonly savingsPercentage: number;
  readonly selectedTasksCount: number;
  readonly customTasksCount: number;
  readonly taskComplexity: number;
  readonly estimatedImplementationTime: number; // days
  readonly riskFactors: readonly string[];
}

export interface CalculationResult {
  readonly totalSavings: number;
  readonly totalAustralianCost: number;
  readonly totalPhilippineCost: number;
  readonly breakdown: Record<RoleId, RoleSavings>;
  readonly portfolioTier: BusinessTier;
  readonly leadScore: number;
  readonly selectedTasksCount: number;
  readonly customTasksCount: number;
  readonly totalTeamSize: number;
  readonly averageSavingsPercentage: number;
  readonly estimatedROI: number;
  readonly implementationTimeline: {
    readonly planning: number; // weeks
    readonly hiring: number;   // weeks  
    readonly training: number; // weeks
    readonly fullImplementation: number; // weeks
  };
  readonly riskAssessment: {
    readonly level: 'low' | 'medium' | 'high';
    readonly factors: readonly string[];
    readonly mitigationStrategies: readonly string[];
  };
}

// Portfolio indicators
export interface PortfolioIndicator {
  readonly min: number;
  readonly max: number;
  readonly tier: BusinessTier;
  readonly description: string;
  readonly recommendedTeamSize: Record<RoleId, number>;
  readonly averageRevenue: {
    readonly min: number;
    readonly max: number;
      };
    readonly implementationComplexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  }

// Premium features
export interface PremiumFeature {
  readonly id: string;
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly value: string;
  readonly category: 'setup' | 'training' | 'support' | 'optimization' | 'guarantee';
  readonly deliveryTimeframe: string;
  readonly includedInTier: readonly ('basic' | 'premium' | 'enterprise')[];
}

// Tooltip data
export interface TooltipData {
  readonly id: string;
  readonly content: string;
  readonly type: 'static' | 'ai_generated';
  readonly context: string;
  readonly generatedAt?: Date;
  readonly cacheExpiresAt?: Date;
}

// Validation errors
export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface FormValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
  readonly warnings: readonly ValidationError[];
}

// Step completion status
export interface StepStatus {
  readonly step: CalculatorStep;
  readonly isCompleted: boolean;
  readonly isAccessible: boolean;
  readonly completedAt?: Date;
  readonly validationErrors: readonly ValidationError[];
} 