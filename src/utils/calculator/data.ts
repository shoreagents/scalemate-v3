import { 
  RoleId, 
  RoleSalaryData, 
  PortfolioSize, 
  PortfolioIndicator, 
  Role,
  TaskComplexity,
  UrgencyLevel,
  Task
} from '@/types';

// Salary data with proper typing - Based on 2024 Australian market rates
export const SALARY_DATA: Readonly<Record<RoleId, RoleSalaryData>> = {
  assistantPropertyManager: {
    australian: {
      entry: { base: 45000, total: 72000 },
      moderate: { base: 58000, total: 93000 },
      experienced: { base: 75000, total: 120000 }
    },
    philippine: {
      entry: { base: 8000, total: 10000 },
      moderate: { base: 12000, total: 14000 },
      experienced: { base: 18000, total: 22000 }
    }
  },
  leasingCoordinator: {
    australian: {
      entry: { base: 52000, total: 83000 },
      moderate: { base: 68000, total: 109000 },
      experienced: { base: 85000, total: 136000 }
    },
    philippine: {
      entry: { base: 10000, total: 12000 },
      moderate: { base: 15000, total: 18000 },
      experienced: { base: 22000, total: 26000 }
    }
  },
  marketingSpecialist: {
    australian: {
      entry: { base: 55000, total: 88000 },
      moderate: { base: 72000, total: 115000 },
      experienced: { base: 95000, total: 152000 }
    },
    philippine: {
      entry: { base: 12000, total: 14000 },
      moderate: { base: 18000, total: 22000 },
      experienced: { base: 28000, total: 34000 }
    }
  }
} as const;

// Portfolio indicators
export const PORTFOLIO_INDICATORS: Readonly<Record<PortfolioSize, PortfolioIndicator>> = {
  '500-999': {
    min: 500,
    max: 999,
    tier: 'growing',
    description: 'Perfect for testing offshore teams',
    recommendedTeamSize: {
      assistantPropertyManager: 1,
      leasingCoordinator: 1,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 500000, max: 1500000 },
    implementationComplexity: 'basic'
  },
  '1000-1999': {
    min: 1000,
    max: 1999,
    tier: 'large',
    description: 'Ideal for full team implementation',
    recommendedTeamSize: {
      assistantPropertyManager: 2,
      leasingCoordinator: 2,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 1500000, max: 4000000 },
    implementationComplexity: 'intermediate'
  },
  '2000-4999': {
    min: 2000,
    max: 4999,
    tier: 'major',
    description: 'Multiple teams across departments',
    recommendedTeamSize: {
      assistantPropertyManager: 3,
      leasingCoordinator: 2,
      marketingSpecialist: 2
    },
    averageRevenue: { min: 4000000, max: 15000000 },
    implementationComplexity: 'advanced'
  },
  '5000+': {
    min: 5000,
    max: 99999,
    tier: 'enterprise',
    description: 'Full offshore operation',
    recommendedTeamSize: {
      assistantPropertyManager: 5,
      leasingCoordinator: 3,
      marketingSpecialist: 3
    },
    averageRevenue: { min: 15000000, max: 100000000 },
    implementationComplexity: 'enterprise'
  }
} as const;

// Task definitions for each role
export const ROLE_TASKS: Readonly<Record<RoleId, readonly Task[]>> = {
  assistantPropertyManager: [
    {
      id: 'apm-tenant-screening',
      name: 'Tenant Application Screening',
      aiAdvantage: 'AI-enhanced background checks and risk assessment',
      timeSaved: '60% faster processing',
      tooltip: 'Automate reference checks, income verification, and risk scoring for faster tenant approvals.',
      complexity: 'medium',
      category: 'administrative',
      skillLevel: 3
    },
    {
      id: 'apm-maintenance-coordination',
      name: 'Maintenance Coordination',
      aiAdvantage: 'Smart scheduling and contractor matching',
      timeSaved: '45% reduction in coordination time',
      tooltip: 'AI matches maintenance requests with best-fit contractors and optimizes scheduling.',
      complexity: 'medium',
      category: 'coordination',
      skillLevel: 3
    },
    {
      id: 'apm-lease-renewals',
      name: 'Lease Renewal Processing',
      aiAdvantage: 'Automated renewal calculations and notifications',
      timeSaved: '70% faster lease processing',
      tooltip: 'Automatically calculate rent increases, generate renewal documents, and track responses.',
      complexity: 'low',
      category: 'administrative',
      skillLevel: 2
    },
    {
      id: 'apm-compliance-tracking',
      name: 'Compliance Documentation',
      aiAdvantage: 'Real-time compliance monitoring',
      timeSaved: '50% reduction in compliance tasks',
      tooltip: 'Track regulatory requirements, automate compliance reporting, and flag potential issues.',
      complexity: 'high',
      category: 'administrative',
      skillLevel: 4
    }
  ],
  leasingCoordinator: [
    {
      id: 'lc-inquiry-management',
      name: 'Inquiry Response Management',
      aiAdvantage: 'AI-powered response automation',
      timeSaved: '80% faster response times',
      tooltip: 'Automatically respond to common inquiries with personalized, AI-generated responses.',
      complexity: 'low',
      category: 'communication',
      skillLevel: 2
    },
    {
      id: 'lc-property-tours',
      name: 'Virtual Tour Coordination',
      aiAdvantage: 'Smart scheduling and follow-up automation',
      timeSaved: '65% more efficient scheduling',
      tooltip: 'AI schedules tours based on availability and automatically follows up with prospects.',
      complexity: 'medium',
      category: 'coordination',
      skillLevel: 3
    },
    {
      id: 'lc-application-processing',
      name: 'Application Processing',
      aiAdvantage: 'Automated document verification',
      timeSaved: '75% faster application processing',
      tooltip: 'AI verifies documents, checks information accuracy, and flags incomplete applications.',
      complexity: 'medium',
      category: 'administrative',
      skillLevel: 3
    },
    {
      id: 'lc-market-analysis',
      name: 'Market Research & Pricing',
      aiAdvantage: 'Real-time market data analysis',
      timeSaved: '90% faster market insights',
      tooltip: 'AI analyzes market trends, competitor pricing, and suggests optimal rental rates.',
      complexity: 'high',
      category: 'analysis',
      skillLevel: 4
    }
  ],
  marketingSpecialist: [
    {
      id: 'ms-content-creation',
      name: 'Property Marketing Content',
      aiAdvantage: 'AI-generated property descriptions',
      timeSaved: '85% faster content creation',
      tooltip: 'Generate compelling property descriptions, social media posts, and marketing materials.',
      complexity: 'medium',
      category: 'marketing',
      skillLevel: 3
    },
    {
      id: 'ms-social-media',
      name: 'Social Media Management',
      aiAdvantage: 'Automated posting and engagement',
      timeSaved: '70% reduction in manual posting',
      tooltip: 'Schedule posts, respond to comments, and analyze engagement across all platforms.',
      complexity: 'low',
      category: 'marketing',
      skillLevel: 2
    },
    {
      id: 'ms-ad-campaigns',
      name: 'Digital Advertising Campaigns',
      aiAdvantage: 'AI-optimized ad targeting',
      timeSaved: '60% better campaign performance',
      tooltip: 'Create, optimize, and manage digital ad campaigns with AI-powered targeting.',
      complexity: 'high',
      category: 'marketing',
      skillLevel: 4
    },
    {
      id: 'ms-analytics-reporting',
      name: 'Marketing Analytics',
      aiAdvantage: 'Intelligent insights and recommendations',
      timeSaved: '80% faster report generation',
      tooltip: 'Generate comprehensive marketing reports with AI-driven insights and recommendations.',
      complexity: 'high',
      category: 'analysis',
      skillLevel: 4
    }
  ]
} as const;

// Role definitions
export const ROLES: Readonly<Record<RoleId, Role>> = {
  assistantPropertyManager: {
    id: 'assistantPropertyManager',
    title: 'Assistant Property Manager',
    icon: '🏢',
    description: 'Handles day-to-day property operations, tenant relations, and administrative tasks.',
    color: 'brand-primary',
    tasks: ROLE_TASKS.assistantPropertyManager,
    averageSalary: {
      australian: 72000,
      philippine: 14000
    },
    requiredSkills: ['Property Management', 'Tenant Relations', 'Administrative Skills', 'Communication'],
    optionalSkills: ['Maintenance Coordination', 'Compliance Knowledge', 'Basic Accounting']
  },
  leasingCoordinator: {
    id: 'leasingCoordinator',
    title: 'Leasing Coordinator',
    icon: '🤝',
    description: 'Manages leasing activities, prospect communication, and application processing.',
    color: 'brand-secondary',
    tasks: ROLE_TASKS.leasingCoordinator,
    averageSalary: {
      australian: 83000,
      philippine: 18000
    },
    requiredSkills: ['Sales Skills', 'Customer Service', 'Application Processing', 'Market Knowledge'],
    optionalSkills: ['Marketing Skills', 'CRM Software', 'Negotiation Skills']
  },
  marketingSpecialist: {
    id: 'marketingSpecialist',
    title: 'Marketing Specialist',
    icon: '📈',
    description: 'Creates marketing campaigns, manages digital presence, and analyzes market trends.',
    color: 'brand-accent',
    tasks: ROLE_TASKS.marketingSpecialist,
    averageSalary: {
      australian: 88000,
      philippine: 22000
    },
    requiredSkills: ['Digital Marketing', 'Content Creation', 'Analytics', 'Social Media'],
    optionalSkills: ['Graphic Design', 'SEO/SEM', 'Video Production', 'Data Analysis']
  }
} as const;

// Task complexity multipliers
export const TASK_COMPLEXITY_MULTIPLIERS: Readonly<Record<TaskComplexity | 'custom', number>> = {
  low: 0.9,
  medium: 1.0,
  high: 1.2,
  custom: 1.15
} as const;

// Urgency options
export const URGENCY_OPTIONS: readonly UrgencyLevel[] = [
  'ASAP - Need to start within 2 weeks',
  'Next Month - Planning for 30-day start',
  'Next Quarter - 60-90 day timeline',
  'Just Exploring - Future consideration'
] as const;

// Phone country codes
export const PHONE_COUNTRY_CODES = {
  AU: '+61',
  US: '+1',
  UK: '+44',
  CA: '+1',
  NZ: '+64',
  SG: '+65',
  HK: '+852',
  PH: '+63'
} as const;

// Default form values - ANONYMOUS
export const DEFAULT_FORM_DATA = {
  portfolioSize: '',
  selectedRoles: {
    assistantPropertyManager: false,
    leasingCoordinator: false,
    marketingSpecialist: false
  },
  selectedTasks: {},
  customTasks: {
    assistantPropertyManager: [],
    leasingCoordinator: [],
    marketingSpecialist: []
  },
  experienceLevel: '',
  teamSize: {
    assistantPropertyManager: 1, // Minimum 1 full-time staff
    leasingCoordinator: 1,       // Minimum 1 full-time staff
    marketingSpecialist: 1       // Minimum 1 full-time staff
  },
  // NO email field - completely anonymous
  currentStep: 1 as const,
  completedSteps: []
} as const;

// ScaleMate Brand Messaging
export const BRAND_MESSAGING = {
  tagline: 'Scale Smart. Save More. Succeed Faster.',
  headlines: [
    'Scale Your Business. Multiply Your Success.',
    'Intelligent Offshore Scaling Made Simple.',
    'Transform Your Operations. Amplify Your Growth.',
    'The Smart Way to Scale Globally.',
    'Unlock Your Business Potential with ScaleMate.'
  ],
  callsToAction: [
    'Calculate Your Savings',
    'Start Your Scaling Journey',
    'Unlock Your Potential',
    'Get Your Free Analysis',
    'Scale Smarter Today'
  ]
} as const;

// Fallback portfolio data when AI is unavailable or location is unknown
// This uses generic global ranges that work across most markets
export const fallbackPortfolioData: Record<string, PortfolioIndicator> = {
  "100-299": {
    min: 100,
    max: 299,
    tier: 'growing',
    description: "Entry-level portfolio perfect for new property managers getting started in the business. Focus on building systems and processes while maintaining high service quality.",
    recommendedTeamSize: {
      assistantPropertyManager: 1,
      leasingCoordinator: 1, 
      marketingSpecialist: 1
    },
    averageRevenue: { min: 50000, max: 150000 },
    implementationComplexity: 'basic'
  },
  "300-799": {
    min: 300,
    max: 799,
    tier: 'large',
    description: "Established portfolio requiring structured operations and specialized team members. Perfect balance of growth potential and manageable complexity.",
    recommendedTeamSize: {
      assistantPropertyManager: 2,
      leasingCoordinator: 2,
      marketingSpecialist: 1
    },
    averageRevenue: { min: 150000, max: 400000 },
    implementationComplexity: 'intermediate'
  },
  "800-1999": {
    min: 800,
    max: 1999,
    tier: 'major',
    description: "Major portfolio requiring advanced systems, dedicated teams, and sophisticated operational strategies. Significant market presence with complex coordination needs.",
    recommendedTeamSize: {
      assistantPropertyManager: 3,
      leasingCoordinator: 3,
      marketingSpecialist: 2
    },
    averageRevenue: { min: 400000, max: 1000000 },
    implementationComplexity: 'advanced'
  },
  "2000+": {
    min: 2000,
    max: 10000,
    tier: 'enterprise',
    description: "Enterprise-scale portfolio requiring comprehensive management infrastructure, multiple specialized teams, and enterprise-grade systems and processes.",
    recommendedTeamSize: {
      assistantPropertyManager: 5,
      leasingCoordinator: 4,
      marketingSpecialist: 3
    },
    averageRevenue: { min: 1000000, max: 5000000 },
    implementationComplexity: 'enterprise'
  }
}; 