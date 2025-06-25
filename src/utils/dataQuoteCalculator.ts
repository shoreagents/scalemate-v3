import { 
  RoleId, 
  RoleSalaryData, 
  Role,
  TaskComplexity,
  Task,
  LocationData,
  EnhancedRole,
  RoleCategory
} from '@/types';
import { ROLES_SALARY_COMPARISON } from './rolesData';







// Additional searchable property management roles (predefined but not in original 3)
export const ADDITIONAL_PROPERTY_ROLES: Readonly<Record<string, Partial<EnhancedRole>>> = {
  maintenanceCoordinator: {
    id: 'maintenanceCoordinator',
    title: 'Maintenance Coordinator',
    icon: '🔧',
    description: 'Coordinates maintenance requests, vendor management, and property upkeep schedules.',
    category: 'maintenance',
    searchKeywords: ['maintenance', 'coordinator', 'repairs', 'vendors', 'work orders', 'facilities']
  },
  propertyAccountant: {
    id: 'propertyAccountant',
    title: 'Property Accountant',
    icon: '💰',
    description: 'Manages financial records, rent collection, budgeting, and financial reporting.',
    category: 'finance',
    searchKeywords: ['accountant', 'finance', 'accounting', 'rent collection', 'budgets', 'financial']
  },
  tenantRelationsSpecialist: {
    id: 'tenantRelationsSpecialist',
    title: 'Tenant Relations Specialist',
    icon: '🤝',
    description: 'Handles tenant communications, resolves conflicts, and manages resident satisfaction.',
    category: 'property-management',
    searchKeywords: ['tenant', 'relations', 'customer service', 'resident', 'communication', 'satisfaction']
  },
  propertyInspector: {
    id: 'propertyInspector',
    title: 'Property Inspector',
    icon: '🔍',
    description: 'Conducts property inspections, move-in/move-out assessments, and compliance checks.',
    category: 'property-management',
    searchKeywords: ['inspector', 'inspections', 'assessment', 'move-in', 'move-out', 'compliance']
  },
  leasingAgent: {
    id: 'leasingAgent',
    title: 'Leasing Agent',
    icon: '🏠',
    description: 'Shows properties, processes applications, and converts prospects into tenants.',
    category: 'leasing',
    searchKeywords: ['leasing', 'agent', 'showing', 'prospects', 'tours', 'sales', 'conversion']
  }
} as const;

// Location detection helper function
export const detectUserLocation = async (): Promise<LocationData> => {
  try {
    // In a real app, you'd use an IP geolocation service
    // For now, we'll return a default location consistent with the rest of the system (USD fallback)
    const defaultLocation: LocationData = {
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      detected: false
    };
    
    return defaultLocation;
  } catch (error) {
    console.error('Failed to detect location:', error);
    return {
      country: 'US',
      countryName: 'United States',
      currency: 'USD',
      currencySymbol: '$',
      detected: false
    };
  }
};

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

// Portfolio indicators are now dynamically generated based on location
// Static data moved to quoteCalculatorData.ts as fallback
// Use getPortfolioIndicators() from quoteCalculatorData instead
export { getPortfolioIndicators, getStaticPortfolioIndicators } from './quoteCalculatorData';

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
export const BASIC_ROLES: Readonly<Record<RoleId, Role>> = {
  assistantPropertyManager: {
    id: 'assistantPropertyManager',
    title: 'Assistant Property Manager',
    icon: '🏢',
    description: 'Handles day-to-day property operations, tenant relations, and administrative tasks.',
    color: 'brand-primary',
    tasks: ROLE_TASKS.assistantPropertyManager!,
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
    icon: '🗝️',
    description: 'Manages leasing activities, prospect communication, and application processing.',
    color: 'brand-secondary',
    tasks: ROLE_TASKS.leasingCoordinator!,
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
    tasks: ROLE_TASKS.marketingSpecialist!,
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
  low: 1,
  medium: 1.5,
  high: 2,
  custom: 1
} as const;





 