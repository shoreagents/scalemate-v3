import { 
  FormData, 
  CalculationResult, 
  RoleSavings, 
  RoleId, 
  ExperienceLevel,
  BusinessTier,
  PortfolioSize,
  Task,
  RoleExperienceDistribution,
  PortfolioIndicator,
  LocationData
} from '@/types';
import { 
  TASK_COMPLEXITY_MULTIPLIERS
} from './dataQuoteCalculator';
import { ROLES, ROLES_SALARY_COMPARISON } from './rolesData';
import { getCurrencyMultiplier, getBestExchangeRateMultiplier, getDirectExchangeRate, getCurrencySymbol } from './currency';
import { ManualLocation } from '@/types/location';

// Rename the local type
export type LocalMultiCountryRoleSalaryData = {
  [country: string]: {
    entry: { base: number; total: number };
    moderate: { base: number; total: number };
    experienced: { base: number; total: number };
  };
  Philippines: {
    entry: { base: number; total: number };
    moderate: { base: number; total: number };
    experienced: { base: number; total: number };
  };
};

/**
 * Helper function to get salary data with currency conversion
 * Now accepts dynamic salary data from AI API
 */
const getSalaryData = (
  roleId: RoleId, 
  userCountry?: string, 
  dynamicSalaryData?: Readonly<Record<string, LocalMultiCountryRoleSalaryData>>
) => {
  // Use dynamic data if available, otherwise fall back to static data
  const salaryDataSource: Record<string, LocalMultiCountryRoleSalaryData> = dynamicSalaryData || (ROLES_SALARY_COMPARISON as unknown as Record<string, LocalMultiCountryRoleSalaryData>);
  const multiCountryData = salaryDataSource[roleId];
  
  if (!multiCountryData) {
    console.warn(`No salary data found for role: ${roleId}`);
    return null;
  }

  // Default to United States if no country specified
  const effectiveCountry = (userCountry || 'United States') as string;
  const countryData = multiCountryData[effectiveCountry];
  const philippineData = multiCountryData.Philippines;
  
  if (!countryData || !philippineData) {
    console.warn(`Missing salary data for ${effectiveCountry} or PH for role: ${roleId}`);
    return null;
  }

  return {
    local: {
      entry: { base: countryData.entry.base, total: countryData.entry.total },
      moderate: { base: countryData.moderate.base, total: countryData.moderate.total },
      experienced: { base: countryData.experienced.base, total: countryData.experienced.total }
    },
    philippine: {
      entry: { base: philippineData.entry.base, total: philippineData.entry.total },
      moderate: { base: philippineData.moderate.base, total: philippineData.moderate.total },
      experienced: { base: philippineData.experienced.base, total: philippineData.experienced.total }
    }
  };
};

/**
 * Main calculation engine - calculates savings for offshore team scaling
 * Updated to handle multi-level experience distribution per role and location-based salaries
 * Now accepts dynamic salary data from AI API
 */
export const calculateSavings = async (
  formData: FormData,
  portfolioIndicators: PortfolioIndicator[],
  userLocation?: LocationData,
  dynamicSalaryData?: Readonly<Record<string, LocalMultiCountryRoleSalaryData>>
): Promise<CalculationResult> => {
  if (!Object.keys(formData.selectedRoles || {}).length) {
    return {
      totalSavings: 0,
      breakdown: {},
      portfolioTier: 'growing',
      leadScore: 0,
      selectedTasksCount: 0,
      customTasksCount: 0,
      totalTeamSize: 0,
      averageSavingsPercentage: 0,
      estimatedROI: 0,
      implementationTimeline: { planning: 0, hiring: 0, training: 0, fullImplementation: 0 },
      riskAssessment: { level: 'low', factors: [], mitigationStrategies: [] },
      totalAustralianCost: 0,
      totalPhilippineCost: 0
    };
  }

  console.log('🧮 calculateSavings called with:', {
    userCountry: userLocation?.country,
    hasDynamicData: !!dynamicSalaryData,
    dynamicDataKeys: dynamicSalaryData ? Object.keys(dynamicSalaryData) : []
  });

  const selectedRoles = Object.entries(formData.selectedRoles)
    .filter(([_, selected]) => selected)
    .map(([roleId]) => roleId as RoleId);

  let totalAustralianCost = 0;
  let totalPhilippineCost = 0;
  let totalSelectedTasks = 0;
  let totalCustomTasks = 0;
  let totalTeamSize = 0;

  const breakdown: Record<RoleId, RoleSavings> = {} as Record<RoleId, RoleSavings>;
  
  // Calculate savings for each selected role
  for (const roleId of selectedRoles) {
    const teamSize = formData.teamSize[roleId] || 1;
    const roleData = ROLES[roleId as keyof typeof ROLES];
    const roleSalaryData = getSalaryData(roleId, userLocation?.country, dynamicSalaryData);
    
    if (!roleData || !roleSalaryData) {
      console.warn(`Missing data for role: ${roleId}`);
      return {
        totalSavings: 0,
        breakdown: {},
        portfolioTier: 'growing',
        leadScore: 0,
        selectedTasksCount: 0,
        customTasksCount: 0,
        totalTeamSize: 0,
        averageSavingsPercentage: 0,
        estimatedROI: 0,
        implementationTimeline: { planning: 0, hiring: 0, training: 0, fullImplementation: 0 },
        riskAssessment: { level: 'low', factors: [], mitigationStrategies: [] },
        totalAustralianCost: 0,
        totalPhilippineCost: 0
      };
    }

    // Get experience distribution for this role
    const experienceDistribution = formData.roleExperienceDistribution?.[roleId];
    
    let australianCost = 0;
    let philippineCost = 0;
    let weightedExperienceLevel: ExperienceLevel = 'moderate'; // Default for legacy support
    
    if (experienceDistribution && experienceDistribution.isComplete) {
      // NEW: Multi-level experience calculation
      const experienceLevels: ExperienceLevel[] = ['entry', 'moderate', 'experienced'];
      let totalWeightedValue = 0;
      let totalMembers = 0;
      
      for (const level of experienceLevels) {
        const memberCount = experienceDistribution[level];
        if (memberCount > 0) {
          const localSalary = roleSalaryData.local[level];
          const philippineSalary = roleSalaryData.philippine[level];
          
          australianCost += localSalary.total * memberCount;
          
          // Convert Philippine salary from PHP to user's local currency using live API
          const phpToUsd = philippineSalary.total / await getBestExchangeRateMultiplier('PHP');
          const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(userLocation?.currency || 'USD');
          philippineCost += usdToLocal * memberCount;
          
          // Calculate weighted experience level for risk assessment
          const levelWeight = level === 'entry' ? 1 : level === 'moderate' ? 2 : 3;
          totalWeightedValue += levelWeight * memberCount;
          totalMembers += memberCount;
        }
      }
      
      // Determine weighted experience level for legacy compatibility
      if (totalMembers > 0) {
        const avgWeight = totalWeightedValue / totalMembers;
        weightedExperienceLevel = avgWeight <= 1.5 ? 'entry' : avgWeight <= 2.5 ? 'moderate' : 'experienced';
      }
    } else {
      // FALLBACK: Use legacy single experience level or default
      const experienceLevel = formData.experienceLevel as ExperienceLevel || 'moderate';
      weightedExperienceLevel = experienceLevel;
      
      const localSalary = roleSalaryData.local[experienceLevel];
      const philippineSalary = roleSalaryData.philippine[experienceLevel];
      
      australianCost = localSalary.total * teamSize;
      
      // Convert Philippine salary from PHP to user's local currency using live API
      const phpToUsd = philippineSalary.total / await getBestExchangeRateMultiplier('PHP');
      const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(userLocation?.currency || 'USD');
      philippineCost = usdToLocal * teamSize;
    }

    // Count selected tasks for this role
    const selectedTasksForRole = Object.keys(formData.selectedTasks)
      .filter(taskKey => taskKey.startsWith(roleId) && formData.selectedTasks[taskKey])
      .length;

    // Count custom tasks for this role
    const customTasksForRole = formData.customTasks[roleId]?.length || 0;

    // Calculate task complexity multiplier
    let selectedTasks: Task[] = [];
    if ('tasks' in roleData && Array.isArray((roleData as any).tasks)) {
      selectedTasks = (roleData as any).tasks.filter((task: Task) => 
        formData.selectedTasks[`${roleId}-${task.id}`]
      );
    }
    
    const averageComplexity = selectedTasks.length > 0 
      ? selectedTasks.reduce((sum, task) => sum + TASK_COMPLEXITY_MULTIPLIERS[task.complexity], 0) / selectedTasks.length
      : 1.0;

    // Custom tasks complexity multiplier
    const customComplexityMultiplier = customTasksForRole > 0 
      ? TASK_COMPLEXITY_MULTIPLIERS.custom 
      : 1.0;

    // Final complexity factor (weighted average)
    const totalTasks = selectedTasksForRole + customTasksForRole;
    const complexityFactor = totalTasks > 0 
      ? (averageComplexity * selectedTasksForRole + customComplexityMultiplier * customTasksForRole) / totalTasks
      : 1.0;

    // Apply complexity factor to Philippine costs (more complex = higher cost)
    const adjustedPhilippineCost = philippineCost * complexityFactor;

    // Calculate savings
    const savings = australianCost - adjustedPhilippineCost;
    const savingsPercentage = australianCost > 0 ? (savings / australianCost) * 100 : 0;

    // Estimate implementation time (days)
    const implementationTime = calculateImplementationTimeMultiLevel(
      teamSize, 
      totalTasks, 
      experienceDistribution || { 
        entry: 0, 
        moderate: teamSize, 
        experienced: 0, 
        totalAssigned: teamSize, 
        totalRequired: teamSize, 
        isComplete: true 
      }
    );

    // Assess risk factors
    const riskFactors = assessRiskFactorsMultiLevel(
      roleId, 
      teamSize, 
      totalTasks, 
      experienceDistribution,
      weightedExperienceLevel
    );

    breakdown[roleId] = {
      roleId,
      roleName: roleData.title,
      teamSize,
      experienceLevel: weightedExperienceLevel,
      australianCost,
      philippineCost: adjustedPhilippineCost,
      savings,
      savingsPercentage,
      selectedTasksCount: selectedTasksForRole,
      customTasksCount: customTasksForRole,
      taskComplexity: complexityFactor,
      estimatedImplementationTime: implementationTime,
      riskFactors
    };

    totalAustralianCost += australianCost;
    totalPhilippineCost += adjustedPhilippineCost;
    totalSelectedTasks += selectedTasksForRole;
    totalCustomTasks += customTasksForRole;
    totalTeamSize += teamSize;
  }

  const totalSavings = totalAustralianCost - totalPhilippineCost;
  const averageSavingsPercentage = totalAustralianCost > 0 
    ? (totalSavings / totalAustralianCost) * 100 
    : 0;

  // Get portfolio tier
  const portfolioTier = (portfolioIndicators && !Array.isArray(portfolioIndicators))
    ? getPortfolioTier(formData, portfolioIndicators)
    : 'growing';

  // Calculate lead score
  const leadScore = (portfolioIndicators && !Array.isArray(portfolioIndicators))
    ? calculateLeadScore(formData, totalSavings, totalTeamSize, portfolioIndicators)
    : calculateLeadScore(formData, totalSavings, totalTeamSize, undefined);

  // Calculate ROI
  const estimatedROI = calculateROI(totalSavings, totalPhilippineCost);

  // Calculate implementation timeline
  const implementationTimeline = calculateImplementationTimeline(totalTeamSize, portfolioTier);

  // Assess overall risk
  const riskAssessment = assessOverallRisk(formData, breakdown, portfolioTier);

  return {
    totalSavings,
    breakdown,
    portfolioTier,
    leadScore,
    selectedTasksCount: totalSelectedTasks,
    customTasksCount: totalCustomTasks,
    totalTeamSize,
    averageSavingsPercentage,
    estimatedROI,
    implementationTimeline,
    riskAssessment,
    totalAustralianCost,
    totalPhilippineCost
  };
};

/**
 * Calculate implementation time for a specific role (legacy single experience level)
 */
const calculateImplementationTime = (
  teamSize: number, 
  totalTasks: number, 
  experienceLevel: ExperienceLevel
): number => {
  const baseTime = 30; // 30 days base
  const teamSizeMultiplier = Math.log(teamSize + 1) * 10; // logarithmic scaling
  const taskComplexityMultiplier = totalTasks * 2; // 2 days per task
  
  const experienceMultipliers = {
    entry: 1.3,     // 30% longer for entry level
    moderate: 1.0,  // baseline
    experienced: 0.8 // 20% faster for experienced
  };

  return Math.round(
    (baseTime + teamSizeMultiplier + taskComplexityMultiplier) * 
    experienceMultipliers[experienceLevel]
  );
};

/**
 * Calculate implementation time for multi-level experience distribution
 */
const calculateImplementationTimeMultiLevel = (
  teamSize: number, 
  totalTasks: number, 
  experienceDistribution: RoleExperienceDistribution
): number => {
  const baseTime = 30; // 30 days base
  const teamSizeMultiplier = Math.log(teamSize + 1) * 10; // logarithmic scaling
  const taskComplexityMultiplier = totalTasks * 2; // 2 days per task
  
  // Calculate weighted experience multiplier
  const experienceMultipliers = {
    entry: 1.3,     // 30% longer for entry level
    moderate: 1.0,  // baseline
    experienced: 0.8 // 20% faster for experienced
  };
  
  let weightedMultiplier = 1.0;
  const totalMembers = experienceDistribution.totalAssigned;
  
  if (totalMembers > 0) {
    weightedMultiplier = (
      (experienceDistribution.entry * experienceMultipliers.entry) +
      (experienceDistribution.moderate * experienceMultipliers.moderate) +
      (experienceDistribution.experienced * experienceMultipliers.experienced)
    ) / totalMembers;
  }

  return Math.round(
    (baseTime + teamSizeMultiplier + taskComplexityMultiplier) * weightedMultiplier
  );
};

/**
 * Assess risk factors for a specific role (legacy single experience level)
 */
const assessRiskFactors = (
  roleId: RoleId, 
  teamSize: number, 
  totalTasks: number, 
  experienceLevel: ExperienceLevel
): string[] => {
  const risks: string[] = [];

  // Team size risks
  if (teamSize > 3) {
    risks.push('Large team coordination complexity');
  }
  if (teamSize === 1) {
    risks.push('Single point of failure risk');
  }

  // Task complexity risks
  if (totalTasks > 6) {
    risks.push('High task complexity requires extensive training');
  }
  if (totalTasks === 0) {
    risks.push('Undefined scope may lead to underutilization');
  }

  // Experience level risks
  if (experienceLevel === 'entry') {
    risks.push('Entry-level staff require more supervision');
  }

  // Role-specific risks
  const roleSpecificRisks: Record<string, string[]> = {
    assistantPropertyManager: ['Compliance requirements vary by location'],
    leasingCoordinator: ['Customer interaction requires cultural training'],
    marketingSpecialist: ['Brand consistency requires clear guidelines']
  };

  const specificRisks = roleSpecificRisks[roleId];
  if (specificRisks) {
    risks.push(...specificRisks);
  }

  return risks;
};

/**
 * Assess risk factors for multi-level experience distribution
 */
const assessRiskFactorsMultiLevel = (
  roleId: RoleId, 
  teamSize: number, 
  totalTasks: number, 
  experienceDistribution: RoleExperienceDistribution | undefined,
  weightedExperienceLevel: ExperienceLevel
): string[] => {
  const risks: string[] = [];

  // Team size risks
  if (teamSize > 3) {
    risks.push('Large team coordination complexity');
  }
  if (teamSize === 1) {
    risks.push('Single point of failure risk');
  }

  // Task complexity risks
  if (totalTasks > 6) {
    risks.push('High task complexity requires extensive training');
  }
  if (totalTasks === 0) {
    risks.push('Undefined scope may lead to underutilization');
  }

  // Multi-level experience risks
  if (experienceDistribution) {
    const { entry, moderate, experienced, totalAssigned } = experienceDistribution;
    
    if (totalAssigned > 0) {
      const entryPercentage = (entry / totalAssigned) * 100;
      const experiencedPercentage = (experienced / totalAssigned) * 100;
      
      if (entryPercentage > 70) {
        risks.push('High percentage of entry-level staff requires extensive supervision');
      }
      if (entryPercentage > 0 && experienced === 0) {
        risks.push('No senior staff for mentoring and guidance');
      }
      if (experiencedPercentage > 80) {
        risks.push('Over-investment in senior staff may increase costs');
      }
      if (entry > 0 && moderate === 0 && experienced > 0) {
        risks.push('Missing mid-level staff for knowledge transfer');
      }
    }
  } else {
    // Fallback to single experience level assessment
    if (weightedExperienceLevel === 'entry') {
      risks.push('Entry-level staff require more supervision');
    }
  }

  // Role-specific risks
  const roleSpecificRisks: Record<string, string[]> = {
    assistantPropertyManager: ['Compliance requirements vary by location'],
    leasingCoordinator: ['Customer interaction requires cultural training'],
    marketingSpecialist: ['Brand consistency requires clear guidelines']
  };

  const specificRisks = roleSpecificRisks[roleId];
  if (specificRisks) {
    risks.push(...specificRisks);
  }

  return risks;
};

/**
 * Get portfolio tier from portfolio size or manual data
 */
const getPortfolioTier = (
  formData: FormData, 
  portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>
): BusinessTier => {
  if (formData.portfolioSize === 'manual' && formData.manualPortfolioData) {
    return 'growing'; // Manual portfolios default to growing tier
  }
  
  if (portfolioIndicators) {
    return portfolioIndicators[formData.portfolioSize as Exclude<PortfolioSize, 'manual'>]?.tier || 'growing';
  }
  
  // Fallback to default tier
  return 'growing';
};

/**
 * Calculate lead score (0-100)
 */
const calculateLeadScore = (
  formData: FormData, 
  totalSavings: number, 
  totalTeamSize: number,
  portfolioIndicators?: Record<PortfolioSize, PortfolioIndicator>
): number => {
  let score = 0;

  // Portfolio size scoring (0-30 points)
  const portfolioScoring = {
    '500-999': 15,
    '1000-1999': 25,
    '2000-4999': 30,
    '5000+': 30,
    'manual': 20 // Default score for manual input, can be adjusted based on tier
  };
  
  let portfolioScore = portfolioScoring[formData.portfolioSize as '500-999' | '1000-1999' | '2000-4999' | '5000+' | 'manual'] || 0;
  
  // If manual input, use default score for growing tier
  if (formData.portfolioSize === 'manual' && formData.manualPortfolioData) {
    portfolioScore = 15; // Default to growing tier score
  }
  
  score += portfolioScore;

  // Team size scoring (0-25 points)
  if (totalTeamSize >= 5) score += 25;
  else if (totalTeamSize >= 3) score += 20;
  else if (totalTeamSize >= 2) score += 15;
  else score += 10;

  // Savings potential scoring (0-25 points)
  if (totalSavings >= 300000) score += 25;
  else if (totalSavings >= 200000) score += 20;
  else if (totalSavings >= 100000) score += 15;
  else if (totalSavings >= 50000) score += 10;
  else score += 5;

  // Task selection scoring (0-20 points)
  const totalSelectedTasks = Object.values(formData.selectedTasks).filter(Boolean).length;
  const totalCustomTasks = Object.values(formData.customTasks).flat().length;
  const taskScore = Math.min(20, (totalSelectedTasks + totalCustomTasks) * 2);
  score += taskScore;

  return Math.min(100, Math.round(score));
};

/**
 * Calculate ROI percentage
 */
const calculateROI = (totalSavings: number, totalPhilippineCost: number): number => {
  if (totalPhilippineCost === 0) return 0;
  
  // ROI = (Savings / Investment) * 100
  // Investment includes Philippine salaries + setup costs (estimated 20% of first year)
  const setupCosts = totalPhilippineCost * 0.2;
  const totalInvestment = totalPhilippineCost + setupCosts;
  
  return Math.round((totalSavings / totalInvestment) * 100);
};

/**
 * Calculate implementation timeline in weeks
 */
const calculateImplementationTimeline = (
  totalTeamSize: number, 
  portfolioTier: BusinessTier
) => {
  const basePlanningWeeks = {
    growing: 2,
    large: 3,
    major: 4,
    enterprise: 6
  };

  const baseHiringWeeks = {
    growing: 3,
    large: 4,
    major: 6,
    enterprise: 8
  };

  const baseTrainingWeeks = {
    growing: 2,
    large: 3,
    major: 4,
    enterprise: 6
  };

  // Scale based on team size
  const teamSizeMultiplier = Math.min(2, 1 + (totalTeamSize - 1) * 0.2);

  return {
    planning: Math.round(basePlanningWeeks[portfolioTier] * teamSizeMultiplier),
    hiring: Math.round(baseHiringWeeks[portfolioTier] * teamSizeMultiplier),
    training: Math.round(baseTrainingWeeks[portfolioTier] * teamSizeMultiplier),
    fullImplementation: Math.round(
      (basePlanningWeeks[portfolioTier] + baseHiringWeeks[portfolioTier] + baseTrainingWeeks[portfolioTier]) * 
      teamSizeMultiplier
    )
  };
};

/**
 * Assess overall risk level
 */
const assessOverallRisk = (
  formData: FormData,
  breakdown: Record<RoleId, RoleSavings>,
  portfolioTier: BusinessTier
) => {
  const riskFactors: string[] = [];
  const mitigationStrategies: string[] = [];

  // Portfolio tier risks
  if (portfolioTier === 'enterprise') {
    riskFactors.push('Large-scale implementation complexity');
    mitigationStrategies.push('Phased rollout approach with pilot teams');
  }

  // Team composition risks
  const totalTeamSize = Object.values(breakdown).reduce((sum, role) => sum + role.teamSize, 0);
  if (totalTeamSize > 5) {
    riskFactors.push('Large offshore team management challenges');
    mitigationStrategies.push('Dedicated offshore team lead and regular communication protocols');
  }

  // Experience level risks
  if (formData.experienceLevel === 'entry') {
    riskFactors.push('Entry-level staff require more oversight');
    mitigationStrategies.push('Enhanced training program and mentorship structure');
  }

  // Task complexity risks
  const hasHighComplexityTasks = Object.values(breakdown).some(role => role.taskComplexity > 1.1);
  if (hasHighComplexityTasks) {
    riskFactors.push('Complex task requirements need careful handover');
    mitigationStrategies.push('Detailed process documentation and extended training period');
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskFactors.length >= 3) riskLevel = 'high';
  else if (riskFactors.length >= 2) riskLevel = 'medium';

  return {
    level: riskLevel,
    factors: riskFactors,
    mitigationStrategies
  };
};

/**
 * Calculate display savings for a role with team size
 */
export const calculateDisplaySavings = (
  role: any,
  teamSize: number,
  savingsView: 'annual' | 'monthly',
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any
): {
  displayAmount: number;
  percentage: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  const effectiveCurrency = manualLocation?.currency || userLocation?.currency || 'USD';
  
  const roleSalaryData = rolesSalaryComparison?.[role.id as keyof typeof rolesSalaryComparison];
  const localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
  const philippineData = roleSalaryData?.Philippines;
  
  if (!localData || !philippineData) {
    return {
      displayAmount: 0,
      percentage: ''
    };
  }
  
  // Use more accurate static conversion rates
  const staticRates: Record<string, number> = {
    'USD': 0.018, // PHP to USD
    'EUR': 0.017, // PHP to EUR
    'GBP': 0.014, // PHP to GBP
    'AUD': 0.027, // PHP to AUD
    'CAD': 0.024, // PHP to CAD
    'SGD': 0.024, // PHP to SGD
  };
  
  const conversionRate = staticRates[effectiveCurrency] || staticRates['USD'];
  
  // Calculate savings using converted amounts
  const safeConversionRate = conversionRate ?? 0;
  const entrySavings = localData.entry.total - (philippineData.entry.total * safeConversionRate);
  const moderateSavings = localData.moderate.total - (philippineData.moderate.total * safeConversionRate);
  const experiencedSavings = localData.experienced.total - (philippineData.experienced.total * safeConversionRate);
  
  const entryTotal = entrySavings * teamSize;
  const moderateTotal = moderateSavings * teamSize;
  const experiencedTotal = experiencedSavings * teamSize;
  const averageTotal = (entryTotal + moderateTotal + experiencedTotal) / 3;
  const displayAmount = savingsView === 'monthly' 
    ? Math.round(averageTotal / 12)
    : Math.round(averageTotal);
  
  // Calculate percentage
  let percentage = '';
  const entryPercentage = (entrySavings / localData.entry.total) * 100;
  const experiencedPercentage = (experiencedSavings / localData.experienced.total) * 100;
  const averagePercentage = (entryPercentage + experiencedPercentage) / 2;
  percentage = `${averagePercentage.toFixed(1)}% savings`;
  
  return {
    displayAmount,
    percentage
  };
};

/**
 * Synchronous version of calculateIndividualRoleSavings for use in display calculations
 */
export const calculateIndividualRoleSavingsSync = (
  role: any,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any
): {
  entry: number;
  moderate: number;
  experienced: number;
  range: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  const effectiveCurrency = manualLocation?.currency || userLocation?.currency || 'USD';
  
  const roleSalaryData = rolesSalaryComparison?.[role.id as keyof typeof rolesSalaryComparison];
  const localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
  const philippineData = roleSalaryData?.Philippines;
  
  if (!localData || !philippineData) {
    return {
      entry: 0,
      moderate: 0,
      experienced: 0,
      range: `${getCurrencySymbol(effectiveCurrency)}0`
    };
  }
  
  // Use more accurate static conversion rates
  const staticRates: Record<string, number> = {
    'USD': 0.018, // PHP to USD
    'EUR': 0.017, // PHP to EUR
    'GBP': 0.014, // PHP to GBP
    'AUD': 0.027, // PHP to AUD
    'CAD': 0.024, // PHP to CAD
    'SGD': 0.024, // PHP to SGD
  };
  
  const conversionRate = staticRates[effectiveCurrency] || staticRates['USD'];
  
  // Calculate savings using converted amounts
  const safeConversionRate = conversionRate ?? 0;
  const entry = localData.entry.total - (philippineData.entry.total * safeConversionRate);
  const moderate = localData.moderate.total - (philippineData.moderate.total * safeConversionRate);
  const experienced = localData.experienced.total - (philippineData.experienced.total * safeConversionRate);
  
  const average = (entry + moderate + experienced) / 3;
  
  return {
    entry: Math.round(entry),
    moderate: Math.round(moderate),
    experienced: Math.round(experienced),
    range: `${getCurrencySymbol(effectiveCurrency)}${Math.round(average).toLocaleString()}`
  };
};

/**
 * Centralized function to calculate all role rates and summary data
 * This replaces the scattered calculations in RoleSelectionStep
 * NOW: Uses only live API rates - no static fallback
 */
export const calculateAllRoleRatesAndSummary = async (
  allRoles: any[],
  selectedRoles: Record<string, boolean>,
  teamSize: Record<string, number>,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any,
  savingsView: 'annual' | 'monthly' = 'annual'
): Promise<{
  roleRates: Record<string, { local: number; phConverted: number }>;
  summary: {
    totalLocalCost: number;
    totalPhilippinesCost: number;
    totalSavings: number;
    percentage: number;
    totalPhilippinesCostPHP: number;
  };
  error?: string;
}> => {
  const roleRates: Record<string, { local: number; phConverted: number }> = {};
  const targetCurrency = manualLocation?.currency || userLocation?.currency || 'USD';
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  
  try {
    // Get exchange rate once for all calculations
    const directRate = await getDirectExchangeRate('PHP', targetCurrency);
    console.log(`✅ Using live exchange rate: PHP to ${targetCurrency} = ${directRate}`);
    
    // Calculate rates for each role
    for (const role of allRoles) {
      if (role.id) {
        const roleSalaryData = rolesSalaryComparison?.[role.id];
        const localData = roleSalaryData?.[effectiveCountry];
        const philippineData = roleSalaryData?.Philippines;
        const currentTeamSize = teamSize[role.id] || 1;
        
        if (localData && philippineData) {
          // Local average multiplied by team size
          const entryLocal = localData.entry.total * currentTeamSize;
          const moderateLocal = localData.moderate.total * currentTeamSize;
          const experiencedLocal = localData.experienced.total * currentTeamSize;
          const avgLocal = (entryLocal + moderateLocal + experiencedLocal) / 3;
          
          // PH converted average multiplied by team size
          const entryPH = philippineData.entry.total * directRate * currentTeamSize;
          const moderatePH = philippineData.moderate.total * directRate * currentTeamSize;
          const experiencedPH = philippineData.experienced.total * directRate * currentTeamSize;
          const avgPH = (entryPH + moderatePH + experiencedPH) / 3;
          
          // Apply monthly/annual conversion
          const monthlyDivisor = savingsView === 'monthly' ? 12 : 1;
          roleRates[role.id] = { 
            local: avgLocal / monthlyDivisor, 
            phConverted: avgPH / monthlyDivisor 
          };
        } else {
          roleRates[role.id] = { local: 0, phConverted: 0 };
        }
      }
    }
    
    // Calculate summary totals
    let totalLocalCost = 0;
    let totalPhilippinesCost = 0;
    let totalSavings = 0;
    let totalPhilippinesCostPHP = 0;
    
    Object.entries(selectedRoles)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([roleId]) => {
        const roleRate = roleRates[roleId];
        if (roleRate) {
          totalLocalCost += roleRate.local;
          totalPhilippinesCost += roleRate.phConverted;
          totalSavings += (roleRate.local - roleRate.phConverted);
        }
        
        // Calculate original PHP amount for summary
        const role = allRoles.find(r => r.id === roleId);
        const size = teamSize[roleId] || 1;
        const roleSalaryData = rolesSalaryComparison?.[role?.id];
        const philippineData = roleSalaryData?.Philippines;
        if (philippineData) {
          const entryPH = philippineData.entry.total * size;
          const moderatePH = philippineData.moderate.total * size;
          const experiencedPH = philippineData.experienced.total * size;
          const avgPH = (entryPH + moderatePH + experiencedPH) / 3;
          const displayRate = savingsView === 'monthly' 
            ? Math.round(avgPH / 12)
            : Math.round(avgPH);
          totalPhilippinesCostPHP += displayRate;
        }
      });
    
    const percentage = totalLocalCost > 0 ? (totalSavings / totalLocalCost) * 100 : 0;
    
    return {
      roleRates,
      summary: {
        totalLocalCost,
        totalPhilippinesCost,
        totalSavings,
        percentage,
        totalPhilippinesCostPHP
      }
    };
  } catch (error) {
    console.error('❌ Currency API failed:', error);
    return {
      roleRates: {},
      summary: {
        totalLocalCost: 0,
        totalPhilippinesCost: 0,
        totalSavings: 0,
        percentage: 0,
        totalPhilippinesCostPHP: 0
      },
      error: `Unable to get current exchange rates. Please check your internet connection and try again.`
    };
  }
};

/**
 * Calculate individual role savings for display in role cards
 * This function handles real-time calculations for individual roles
 */
export const calculateIndividualRoleSavings = async (
  role: any,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any
): Promise<{
  entry: number;
  moderate: number;
  experienced: number;
  range: string;
}> => {
  try {
    // Get effective country: manual location takes priority over auto-detected
    const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
    const targetCurrency = manualLocation?.currency || userLocation?.currency || 'USD';
    
    if (role.type === 'predefined' && role.id && rolesSalaryComparison) {
      const roleSalaryData = rolesSalaryComparison[role.id as keyof typeof ROLES_SALARY_COMPARISON];
      if (!roleSalaryData) {
        return {
          entry: 0,
          moderate: 0,
          experienced: 0,
          range: `$0`
        };
      }
      
      // Try to get local salary data, fall back to US if not found
      let localSalaryData = roleSalaryData[effectiveCountry as keyof typeof roleSalaryData];
      if (!localSalaryData) {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to US data');
        localSalaryData = roleSalaryData["United States"];
      }
      
      let philippineSalaryData = roleSalaryData.Philippines;
      
      if (localSalaryData && philippineSalaryData) {
        // Get direct exchange rate for PHP to target currency
        const directRate = await getDirectExchangeRate('PHP', targetCurrency);
        
        // Convert Philippine salaries to target currency
        const convertedEntryPH = philippineSalaryData.entry.total * directRate;
        const convertedModeratePH = philippineSalaryData.moderate.total * directRate;
        const convertedExperiencedPH = philippineSalaryData.experienced.total * directRate;
        
        // Calculate savings using converted amounts
        const entrySavings = localSalaryData.entry.total - convertedEntryPH;
        const moderateSavings = localSalaryData.moderate.total - convertedModeratePH;
        const experiencedSavings = localSalaryData.experienced.total - convertedExperiencedPH;
        
        return {
          entry: entrySavings,
          moderate: moderateSavings,
          experienced: experiencedSavings,
          range: `$${Math.round((entrySavings + moderateSavings + experiencedSavings) / 3).toLocaleString()}`
        };
      }
    }
    
    // For custom roles, use the estimated salary directly
    if (role.estimatedSalary) {
      const directRate = await getDirectExchangeRate('PHP', targetCurrency);
      const convertedPhilippineSalary = role.estimatedSalary.philippine * directRate;
      const savings = role.estimatedSalary.local - convertedPhilippineSalary;
      
      return {
        entry: savings * 0.8,
        moderate: savings,
        experienced: savings * 1.2,
        range: `$${savings.toLocaleString()}`
      };
    }
  } catch (error) {
    console.error('Error calculating individual role savings:', error);
  }
  
  return {
    entry: 0,
    moderate: 0,
    experienced: 0,
    range: `$0`
  };
};

/**
 * Calculate role costs for display (local and Philippine rates)
 */
export const calculateRoleCosts = (
  role: any,
  teamSize: number,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any,
  savingsView: 'annual' | 'monthly' = 'annual'
): {
  localCost: string;
  philippineCost: string;
  philippineCostConverted?: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  
  if (role.type === 'predefined' && role.id && rolesSalaryComparison) {
    const roleSalaryData = rolesSalaryComparison[role.id as keyof typeof rolesSalaryComparison];
    if (!roleSalaryData) {
      return {
        localCost: '$0',
        philippineCost: '₱0'
      };
    }
    
    // Try to get local salary data, fall back to US if not found
    let localSalaryData = roleSalaryData[effectiveCountry as keyof typeof roleSalaryData];
    if (!localSalaryData) {
      localSalaryData = roleSalaryData["United States"];
    }
    
    let philippineSalaryData = roleSalaryData.Philippines;
    
    if (localSalaryData && philippineSalaryData) {
      // Calculate local cost
      const entryRate = localSalaryData.entry.total * teamSize;
      const moderateRate = localSalaryData.moderate.total * teamSize;
      const experiencedRate = localSalaryData.experienced.total * teamSize;
      const averageRate = (entryRate + moderateRate + experiencedRate) / 3;
      const displayRate = savingsView === 'monthly' 
        ? Math.round(averageRate / 12)
        : Math.round(averageRate);
      
      // Calculate Philippine cost
      const phEntryRate = philippineSalaryData.entry.total * teamSize;
      const phModerateRate = philippineSalaryData.moderate.total * teamSize;
      const phExperiencedRate = philippineSalaryData.experienced.total * teamSize;
      const phAverageRate = (phEntryRate + phModerateRate + phExperiencedRate) / 3;
      const phDisplayRate = savingsView === 'monthly' 
        ? Math.round(phAverageRate / 12)
        : Math.round(phAverageRate);
      
      return {
        localCost: `$${displayRate.toLocaleString()}`,
        philippineCost: `₱${phDisplayRate.toLocaleString()}`
      };
    }
  }
  
  // For custom roles
  if (role.estimatedSalary) {
    const entryEstimate = role.estimatedSalary.local * 0.8 * teamSize;
    const moderateEstimate = role.estimatedSalary.local * teamSize;
    const experiencedEstimate = role.estimatedSalary.local * 1.2 * teamSize;
    const averageEstimate = (entryEstimate + moderateEstimate + experiencedEstimate) / 3;
    const displayRate = savingsView === 'monthly' 
      ? Math.round(averageEstimate / 12)
      : Math.round(averageEstimate);
    
    const phEntryEstimate = role.estimatedSalary.philippine * 0.8 * teamSize;
    const phModerateEstimate = role.estimatedSalary.philippine * teamSize;
    const phExperiencedEstimate = role.estimatedSalary.philippine * 1.2 * teamSize;
    const phAverageEstimate = (phEntryEstimate + phModerateEstimate + phExperiencedEstimate) / 3;
    const phDisplayRate = savingsView === 'monthly' 
      ? Math.round(phAverageEstimate / 12)
      : Math.round(phAverageEstimate);
    
    return {
      localCost: `$${displayRate.toLocaleString()}`,
      philippineCost: `₱${phDisplayRate.toLocaleString()}`
    };
  }
  
  return {
    localCost: '$0',
    philippineCost: '₱0'
  };
};

/**
 * Calculate total savings for selected roles
 */
export const calculateTotalSavings = (
  selectedRoles: Record<string, boolean>,
  teamSize: Record<string, number>,
  allRoles: any[],
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any
): number => {
  let totalSavings = 0;
  
  Object.entries(selectedRoles)
    .filter(([_, isSelected]) => isSelected)
    .forEach(([roleId]) => {
      const role = allRoles.find(r => r.id === roleId);
      const size = teamSize[roleId] || 1;
      if (!role) return;
      
      const savings = calculateIndividualRoleSavingsSync(role, userLocation, manualLocation, rolesSalaryComparison);
      const entryTotal = savings.entry * size;
      const moderateTotal = savings.moderate * size;
      const experiencedTotal = savings.experienced * size;
      const averageTotal = (entryTotal + moderateTotal + experiencedTotal) / 3;
      totalSavings += averageTotal;
    });
  
  return totalSavings;
};

/**
 * Calculate PHP conversion display for a role
 * This handles the display conversion of PHP amounts to target currency
 */
export const calculatePhpConversionDisplay = async (
  role: any,
  teamSize: number,
  targetCurrency: string,
  savingsView: 'annual' | 'monthly',
  rolesSalaryComparison?: any
): Promise<string> => {
  try {
    const roleSalaryData = rolesSalaryComparison?.[role.id as keyof typeof rolesSalaryComparison];
    const philippineSalaryData = roleSalaryData?.Philippines;
    
    if (!philippineSalaryData) {
      return 'Converting...';
    }
    
    // Calculate the PHP amount for this role
    const entryRate = philippineSalaryData.entry.total * teamSize;
    const moderateRate = philippineSalaryData.moderate.total * teamSize;
    const experiencedRate = philippineSalaryData.experienced.total * teamSize;
    const averageRate = (entryRate + moderateRate + experiencedRate) / 3;
    const displayRate = savingsView === 'monthly' 
      ? Math.round(averageRate / 12)
      : Math.round(averageRate);
    
    // Get direct exchange rate
    const directRate = await getDirectExchangeRate('PHP', targetCurrency);
    const convertedAmount = Math.round(displayRate * directRate);
    
    return `≈ ${getCurrencySymbol(targetCurrency)}${convertedAmount.toLocaleString()} ${targetCurrency}`;
  } catch (error) {
    console.error('Error converting PHP for role:', role.id, error);
    return 'Converting...';
  }
};