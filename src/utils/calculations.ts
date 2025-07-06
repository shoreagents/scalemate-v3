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
import { ROLES, TASK_COMPLEXITY_MULTIPLIERS } from './rolesData';
import { getBestExchangeRateMultiplier, getDirectExchangeRate, getCurrencySymbol, getDisplayCurrencyByCountry, getDisplayCurrencyByCountryWithAPIFallback } from './currency';
import { ManualLocation } from '@/types/location';

/**
 * Precise number formatting that preserves exact decimal values without rounding
 * Truncates instead of rounding to show the true mathematical result
 */
function formatNumberPrecise(num: number, options: { 
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
  currency?: boolean;
  showDecimals?: boolean;
} = {}): string {
  const { maximumFractionDigits = 3, minimumFractionDigits = 0, showDecimals = true } = options;
  
  if (!showDecimals) {
    // Truncate instead of round to show exact mathematical result
    // Ensure no floating-point precision issues by using Math.trunc
    const truncated = Math.trunc(Number(num));
    return truncated.toLocaleString();
  }
  
  // Convert to string to avoid floating point precision issues
  const numStr = num.toString();
  const [integerPart, decimalPart = ''] = numStr.split('.');
  
  // Parse integer part with thousand separators
  const formattedInteger = parseInt(integerPart || '0').toLocaleString();
  
  if (!decimalPart || minimumFractionDigits === 0 && maximumFractionDigits === 0) {
    return formattedInteger;
  }
  
  // Truncate decimal part to desired precision without rounding
  const truncatedDecimal = decimalPart.slice(0, maximumFractionDigits);
  
  if (truncatedDecimal.length === 0) {
    return formattedInteger;
  }
  
  // Pad with zeros if needed for minimum fraction digits
  const paddedDecimal = truncatedDecimal.padEnd(minimumFractionDigits, '0');
  
  return `${formattedInteger}.${paddedDecimal}`;
}

/**
 * Helper function to extract salary data from nested roles.salary structure
 * This replaces the separate rolesSalaryComparison structure
 */
const getSalaryDataFromRoles = (roles: any, roleId: string) => {
  const role = roles?.[roleId];
  return role?.salary || null;
};

/**
 * Helper function to get salary data with currency conversion
 * Now accepts dynamic salary data from AI API
 */
const getSalaryData = (
  roleId: RoleId, 
  userCountry?: string, 
  dynamicRoles?: any
) => {
  // Use dynamic data if available, otherwise fall back to static data
  // Create salary data from ROLES structure for backward compatibility
  const staticSalaryData: Record<string, any> = {};
  Object.entries(ROLES).forEach(([roleId, role]) => {
    staticSalaryData[roleId] = role.salary;
  });
  
  // Extract salary data from roles structure
  const salaryDataSource: Record<string, any> = {};
  if (dynamicRoles) {
    Object.keys(dynamicRoles).forEach(roleId => {
      const salaryData = getSalaryDataFromRoles(dynamicRoles, roleId);
      if (salaryData) {
        salaryDataSource[roleId] = salaryData;
      }
    });
  }
  
  const finalSalaryData = Object.keys(salaryDataSource).length > 0 ? salaryDataSource : staticSalaryData;
  const multiCountryData = finalSalaryData[roleId];
  
  if (!multiCountryData) {
    console.warn(`No salary data found for role: ${roleId}`);
    return null;
  }

  // Default to United States if no country specified
  const effectiveCountry = (userCountry || 'United States') as string;
  
  // Get country data with USA fallback from the final salary data source
  let countryData = multiCountryData[effectiveCountry as keyof typeof multiCountryData];
  if (!countryData) {
    console.log('📊 No salary data for country:', effectiveCountry, '- falling back to USA data');
    countryData = multiCountryData["United States" as keyof typeof multiCountryData];
  }
  
  const philippineData = multiCountryData.Philippines;
  
  // Only return null if we can't get either country data (with fallback) or Philippine data
  if (!countryData) {
    console.warn(`Failed to get salary data for ${effectiveCountry} (with USA fallback) for role: ${roleId}`);
    return null;
  }
  
  if (!philippineData) {
    console.warn(`Missing Philippine salary data for role: ${roleId}`);
    return null;
  }

  return {
    local: countryData,
    philippine: philippineData
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
  dynamicRoles?: any
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
      totalLocalCost: 0,
      totalPhilippineCost: 0
    };
  }

  console.log('🧮 calculateSavings called with:', {
    userCountry: userLocation?.country,
    hasDynamicData: !!dynamicRoles,
    dynamicDataKeys: dynamicRoles ? Object.keys(dynamicRoles) : []
  });

  const selectedRoles = Object.entries(formData.selectedRoles)
    .filter(([_, selected]) => selected)
    .map(([roleId]) => roleId as RoleId);

  let totalLocalCost = 0;
  let totalPhilippineCost = 0;
  let totalSelectedTasks = 0;
  let totalCustomTasks = 0;
  let totalTeamSize = 0;

  const breakdown: Record<RoleId, RoleSavings> = {} as Record<RoleId, RoleSavings>;
  
  // Calculate savings for each selected role
  for (const roleId of selectedRoles) {
    const teamSize = formData.teamSize[roleId] || 1;
    const roleData = ROLES[roleId as keyof typeof ROLES];
    const roleSalaryData = getSalaryData(roleId, userLocation?.country, dynamicRoles);
    
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
        totalLocalCost: 0,
        totalPhilippineCost: 0
      };
    }

    // Get experience distribution for this role
    const experienceDistribution = formData.roleExperienceDistribution?.[roleId];
    
    let localCost = 0;
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
          
          localCost += localSalary.base * memberCount;
          
          // Convert Philippine salary from PHP to user's local currency using live API
          const phpToUsd = philippineSalary.base / await getBestExchangeRateMultiplier('PHP');
          const effectiveCurrency = getDisplayCurrencyByCountry(userLocation?.country || 'United States');
          const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(effectiveCurrency);
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
      
      localCost = localSalary.base * teamSize;
      
      // Convert Philippine salary from PHP to user's local currency using live API
      const phpToUsd = philippineSalary.base / await getBestExchangeRateMultiplier('PHP');
      const effectiveCurrency = getDisplayCurrencyByCountry(userLocation?.country || 'United States');
      const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(effectiveCurrency);
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
    const savings = localCost - adjustedPhilippineCost;
    const savingsPercentage = localCost > 0 ? (savings / localCost) * 100 : 0;

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
      localCost,
      philippineCost: adjustedPhilippineCost,
      savings,
      savingsPercentage,
      selectedTasksCount: selectedTasksForRole,
      customTasksCount: customTasksForRole,
      taskComplexity: complexityFactor,
      estimatedImplementationTime: implementationTime,
      riskFactors
    };

    totalLocalCost += localCost;
    totalPhilippineCost += adjustedPhilippineCost;
    totalSelectedTasks += selectedTasksForRole;
    totalCustomTasks += customTasksForRole;
    totalTeamSize += teamSize;
  }

  const totalSavings = totalLocalCost - totalPhilippineCost;
  const averageSavingsPercentage = totalLocalCost > 0 
    ? (totalSavings / totalLocalCost) * 100 
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
    totalLocalCost,
    totalPhilippineCost
  };
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

  return (baseTime + teamSizeMultiplier + taskComplexityMultiplier) * weightedMultiplier;
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

  return Math.min(100, score);
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
  
  return (totalSavings / totalInvestment) * 100;
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
    planning: basePlanningWeeks[portfolioTier] * teamSizeMultiplier,
    hiring: baseHiringWeeks[portfolioTier] * teamSizeMultiplier,
    training: baseTrainingWeeks[portfolioTier] * teamSizeMultiplier,
    fullImplementation: (basePlanningWeeks[portfolioTier] + baseHiringWeeks[portfolioTier] + baseTrainingWeeks[portfolioTier]) * 
      teamSizeMultiplier
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
  roles?: any
): {
  displayAmount: number;
  percentage: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  // Use display currency logic to ensure consistency with fallback data
  const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
  
  const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
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
      const entrySavings = localData.entry.base - (philippineData.entry.base * safeConversionRate);
    const moderateSavings = localData.moderate.base - (philippineData.moderate.base * safeConversionRate);
    const experiencedSavings = localData.experienced.base - (philippineData.experienced.base * safeConversionRate);
  
  const entryTotal = entrySavings * teamSize;
  const moderateTotal = moderateSavings * teamSize;
  const experiencedTotal = experiencedSavings * teamSize;
  const averageTotal = (entryTotal + moderateTotal + experiencedTotal) / 3;
  const displayAmount = savingsView === 'monthly' 
            ? averageTotal / 12
        : averageTotal;
  
  // Calculate percentage
  let percentage = '';
      const entryPercentage = (entrySavings / localData.entry.base) * 100;
    const experiencedPercentage = (experiencedSavings / localData.experienced.base) * 100;
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
  roles?: any
): {
  entry: number;
  moderate: number;
  experienced: number;
  range: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  // Use display currency logic to ensure consistency with fallback data
  const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
  
  const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
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
      const entry = localData.entry.base - (philippineData.entry.base * safeConversionRate);
    const moderate = localData.moderate.base - (philippineData.moderate.base * safeConversionRate);
    const experienced = localData.experienced.base - (philippineData.experienced.base * safeConversionRate);
  
  const average = (entry + moderate + experienced) / 3;
  
  return {
    entry: entry,
    moderate: moderate,
    experienced: experienced,
    range: `${getCurrencySymbol(effectiveCurrency)}${average}`
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
  roles?: any,
  savingsView: 'annual' | 'monthly' = 'annual',
  isUsingDynamicRoles?: boolean
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
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  
  // Check if we have salary data for this country
  const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
  const isCountrySupported = supportedCountries.includes(effectiveCountry);
  
  // Use display currency logic to ensure consistency with fallback data
  // For unsupported countries, use actual currency when AI is working, USD when AI fails
  const targetCurrency = getDisplayCurrencyByCountryWithAPIFallback(effectiveCountry, !isUsingDynamicRoles);
  
  try {
    // Get exchange rate once for all calculations
    const directRate = await getDirectExchangeRate('PHP', targetCurrency);
    console.log(`✅ Using live exchange rate: PHP to ${targetCurrency} = ${directRate}`);
    
    // Calculate rates for each role
    for (const role of allRoles) {
      if (role.id) {
        const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
        // Use dynamic salary data from AI API, with fallback to USA if country not found
        let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
        if (!localData) {
          console.log('📊 No salary data for country:', effectiveCountry, '- falling back to USA data from AI');
          localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
        }
        
        const philippineData = roleSalaryData?.Philippines;
        const currentTeamSize = teamSize[role.id] || 1;
        
        if (localData && philippineData) {
          // Local average multiplied by team size
                const entryLocal = localData.entry.base * currentTeamSize;
      const moderateLocal = localData.moderate.base * currentTeamSize;
      const experiencedLocal = localData.experienced.base * currentTeamSize;
          const avgLocal = (entryLocal + moderateLocal + experiencedLocal) / 3;
          
          // PH converted average multiplied by team size
          // Use exact mathematical calculation for each level
                const entryPH = philippineData.entry.base * directRate * currentTeamSize;
      const moderatePH = philippineData.moderate.base * directRate * currentTeamSize;
      const experiencedPH = philippineData.experienced.base * directRate * currentTeamSize;
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
    let totalPhilippinesCostPHP = 0;
    
    Object.entries(selectedRoles)
      .filter(([_, isSelected]) => isSelected)
      .forEach(([roleId]) => {
        const roleRate = roleRates[roleId];
        if (roleRate) {
          // Use truncated values to ensure mathematical consistency with displayed amounts
          const truncatedLocal = Math.trunc(roleRate.local);
          totalLocalCost += truncatedLocal;
        }
        
        // Calculate original PHP amount for summary
        const role = allRoles.find(r => r.id === roleId);
        const size = teamSize[roleId] || 1;
        const roleSalaryData = getSalaryDataFromRoles(roles, role?.id);
        const philippineData = roleSalaryData?.Philippines;
        if (philippineData) {
                  const entryPH = philippineData.entry.base * size;
        const moderatePH = philippineData.moderate.base * size;
        const experiencedPH = philippineData.experienced.base * size;
          const avgPH = (entryPH + moderatePH + experiencedPH) / 3;
          const displayRate = savingsView === 'monthly' 
            ? avgPH / 12
            : avgPH;
          // Use truncated value to ensure mathematical consistency with displayed amounts
          totalPhilippinesCostPHP += Math.trunc(displayRate);
        }
      });
    
    // Convert the TOTAL PHP amount once (not sum of individual conversions)
    // Use exact mathematical calculation and truncate to avoid any rounding
    const exactTotalConversion = totalPhilippinesCostPHP * directRate;
    const totalPhilippinesCost = Math.trunc(exactTotalConversion);
    const totalSavings = totalLocalCost - totalPhilippinesCost;
    
    const percentage = totalLocalCost > 0 ? (totalSavings / totalLocalCost) * 100 : 0;
    
    return {
      roleRates,
      summary: {
        totalLocalCost: totalLocalCost,
        totalPhilippinesCost: totalPhilippinesCost,
        totalSavings: totalSavings,
        percentage,
        totalPhilippinesCostPHP: totalPhilippinesCostPHP
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
  roles?: any
): Promise<{
  entry: number;
  moderate: number;
  experienced: number;
  range: string;
}> => {
  try {
    // Get effective country: manual location takes priority over auto-detected
    const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
    
    // Check if we have salary data for this country
    const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
    const isCountrySupported = supportedCountries.includes(effectiveCountry);
    
    // Use display currency logic to ensure consistency with fallback data
    // For unsupported countries, use actual currency when AI is working, USD when AI fails
    const targetCurrency = getDisplayCurrencyByCountryWithAPIFallback(effectiveCountry, false);
    
    if (role.type === 'predefined' && role.id && roles) {
      const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
      if (!roleSalaryData) {
        return {
          entry: 0,
          moderate: 0,
          experienced: 0,
          range: `$0`
        };
      }
      
      // Use dynamic salary data from AI API, with fallback to USA if country not found
      let localSalaryData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
      if (!localSalaryData) {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to USA data from AI');
        localSalaryData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
      }
      
      let philippineSalaryData = roleSalaryData.Philippines;
      
      if (localSalaryData && philippineSalaryData) {
        // Get direct exchange rate for PHP to target currency
        const directRate = await getDirectExchangeRate('PHP', targetCurrency);
        
        // Convert Philippine salaries to target currency
            const convertedEntryPH = philippineSalaryData.entry.base * directRate;
    const convertedModeratePH = philippineSalaryData.moderate.base * directRate;
    const convertedExperiencedPH = philippineSalaryData.experienced.base * directRate;
        
        // Calculate savings using converted amounts
            const entrySavings = localSalaryData.entry.base - convertedEntryPH;
    const moderateSavings = localSalaryData.moderate.base - convertedModeratePH;
    const experiencedSavings = localSalaryData.experienced.base - convertedExperiencedPH;
        
        return {
          entry: entrySavings,
          moderate: moderateSavings,
          experienced: experiencedSavings,
          range: `$${(entrySavings + moderateSavings + experiencedSavings) / 3}`
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
  roles?: any,
  savingsView: 'annual' | 'monthly' = 'annual'
): {
  localCost: string;
  philippineCost: string;
  philippineCostConverted?: string;
} => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  
  if (role.type === 'predefined' && role.id && roles) {
    const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
    if (!roleSalaryData) {
      return {
        localCost: '$0',
        philippineCost: '₱0'
      };
    }
    
    // Use dynamic salary data from AI API, with fallback to USA if country not found
    let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
    if (!localData) {
      console.log('📊 No salary data for country:', effectiveCountry, '- falling back to USA data from AI');
      localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
    }
    
    let philippineSalaryData = roleSalaryData.Philippines;
    
    if (localData && philippineSalaryData) {
      // Calculate local cost
          const entryRate = localData.entry.base * teamSize;
    const moderateRate = localData.moderate.base * teamSize;
    const experiencedRate = localData.experienced.base * teamSize;
      const averageRate = (entryRate + moderateRate + experiencedRate) / 3;
      const displayRate = savingsView === 'monthly' 
        ? averageRate / 12
        : averageRate;
      
      // Calculate Philippine cost
              const phEntryRate = philippineSalaryData.entry.base * teamSize;
        const phModerateRate = philippineSalaryData.moderate.base * teamSize;
        const phExperiencedRate = philippineSalaryData.experienced.base * teamSize;
      const phAverageRate = (phEntryRate + phModerateRate + phExperiencedRate) / 3;
      const phDisplayRate = savingsView === 'monthly' 
        ? phAverageRate / 12
        : phAverageRate;
      
      return {
        localCost: `$${formatNumberPrecise(displayRate, { showDecimals: false })}`,
        philippineCost: `₱${formatNumberPrecise(phDisplayRate, { showDecimals: false })}`
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
      ? averageEstimate / 12
      : averageEstimate;
    
    const phEntryEstimate = role.estimatedSalary.philippine * 0.8 * teamSize;
    const phModerateEstimate = role.estimatedSalary.philippine * teamSize;
    const phExperiencedEstimate = role.estimatedSalary.philippine * 1.2 * teamSize;
    const phAverageEstimate = (phEntryEstimate + phModerateEstimate + phExperiencedEstimate) / 3;
    const phDisplayRate = savingsView === 'monthly' 
      ? phAverageEstimate / 12
      : phAverageEstimate;
    
    return {
      localCost: `$${formatNumberPrecise(displayRate, { showDecimals: false })}`,
      philippineCost: `₱${formatNumberPrecise(phDisplayRate, { showDecimals: false })}`
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
  roles?: any
): number => {
  let totalSavings = 0;
  
  Object.entries(selectedRoles)
    .filter(([_, isSelected]) => isSelected)
    .forEach(([roleId]) => {
      const role = allRoles.find(r => r.id === roleId);
      const size = teamSize[roleId] || 1;
      if (!role) return;
      
      const savings = calculateIndividualRoleSavingsSync(role, userLocation, manualLocation, roles);
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
  roles?: any
): Promise<string> => {
  try {
    const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
    const philippineData = roleSalaryData?.Philippines;
    
    if (!philippineData) {
      return 'Converting...';
    }
    
    // Calculate the PHP amount for this role
    const entryRate = philippineData.entry.base * teamSize;
    const moderateRate = philippineData.moderate.base * teamSize;
    const experiencedRate = philippineData.experienced.base * teamSize;
    const averageRate = (entryRate + moderateRate + experiencedRate) / 3;
    const displayRate = savingsView === 'monthly' 
      ? averageRate / 12
      : averageRate;
    
    // Get direct exchange rate
    const directRate = await getDirectExchangeRate('PHP', targetCurrency);
    
    // Do exact mathematical calculation to avoid floating-point precision issues
    const exactConversion = displayRate * directRate;
    
    // Truncate to show exact mathematical result without any rounding
    const truncatedAmount = Math.trunc(exactConversion);
    
    return `≈ ${getCurrencySymbol(targetCurrency)}${truncatedAmount.toLocaleString()}`;
  } catch (error) {
    console.error('Error converting PHP for role:', role.id, error);
    return 'Converting...';
  }
};

/**
 * Calculate total savings for multi-level experience distribution
 * Used by ExperienceStep component
 */
export const calculateMultiLevelSavings = async (
  activeRoles: Array<{ id: string; distribution: RoleExperienceDistribution }>,
  allRoles: any[],
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any
): Promise<number> => {
  let totalSavings = 0;
  
  for (const role of activeRoles) {
    const roleData = allRoles.find(r => r.id === role.id);
    if (!roleData) continue;
    
    let roleSavings = 0;
    const distribution = role.distribution;
    
    // Get salary data
    const roleSalaryData = getSalaryDataFromRoles(roles, roleData.id);
    const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
    
    // Try to get local salary data, fall back to supported countries if not found
    let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
    if (!localData) {
      // Check if the country is one of our supported countries
      const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
      const fallbackCountry = supportedCountries.find(country => roleSalaryData?.[country as keyof typeof roleSalaryData]);
      
      if (fallbackCountry) {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to', fallbackCountry, 'data');
        localData = roleSalaryData?.[fallbackCountry as keyof typeof roleSalaryData];
      } else {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to US data');
        localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
      }
    }
    
    const philippineData = roleSalaryData?.Philippines;
    
    if (localData && philippineData) {
      // Calculate savings for each experience level based on distribution
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          const localSalary = localData[level].base;
          const philippineSalary = philippineData[level].base;
          
          // Convert Philippine salary from PHP to user's local currency using live API
          const phpToUsd = philippineSalary / await getBestExchangeRateMultiplier('PHP');
          const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
          const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(effectiveCurrency);
          
          const levelSavings = (localSalary - usdToLocal) * memberCount;
          roleSavings += levelSavings;
        }
      }
    } else if (roleData.estimatedSalary) {
      // For custom roles
      const baseLocalSalary = roleData.estimatedSalary.local;
      const basePhilippineSalary = roleData.estimatedSalary.philippine;
      
      // Convert Philippine salary using live API
      const phpToUsd = basePhilippineSalary / await getBestExchangeRateMultiplier('PHP');
      const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
      const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(effectiveCurrency);
      
      const multipliers = { entry: 0.8, moderate: 1.0, experienced: 1.2 };
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          const localSalary = baseLocalSalary * multipliers[level];
          const philippineSalary = usdToLocal * multipliers[level];
          const levelSavings = (localSalary - philippineSalary) * memberCount;
          roleSavings += levelSavings;
        }
      }
    }
    
    totalSavings += roleSavings;
  }
  
  return totalSavings;
};

/**
 * Calculate total local cost for multi-level experience distribution
 * Used by ExperienceStep component
 */
export const calculateMultiLevelLocalCost = (
  activeRoles: Array<{ id: string; distribution: RoleExperienceDistribution }>,
  allRoles: any[],
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any
): number => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  
  return activeRoles.reduce((total, role) => {
    const roleData = allRoles.find(r => r.id === role.id);
    if (!roleData) return total;
    
    let roleCost = 0;
    const distribution = role.distribution;
    
    // Get salary data
    const roleSalaryData = getSalaryDataFromRoles(roles, roleData.id);
    
    // Try to get local salary data, fall back to supported countries if not found
    let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
    if (!localData) {
      // Check if the country is one of our supported countries
      const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
      const fallbackCountry = supportedCountries.find(country => roleSalaryData?.[country as keyof typeof roleSalaryData]);
      
      if (fallbackCountry) {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to', fallbackCountry, 'data');
        localData = roleSalaryData?.[fallbackCountry as keyof typeof roleSalaryData];
      } else {
        console.log('📊 No salary data for country:', effectiveCountry, '- falling back to US data');
        localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
      }
    }
    
    if (localData) {
      // Calculate cost for each experience level based on distribution
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          const localSalary = localData[level].base;
          roleCost += localSalary * memberCount;
        }
      }
    } else if (roleData.estimatedSalary) {
      // For custom roles
      const baseSalary = roleData.estimatedSalary.local;
      const multipliers = { entry: 0.8, moderate: 1.0, experienced: 1.2 };
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          roleCost += (baseSalary * multipliers[level]) * memberCount;
        }
      }
    }
    
    return total + roleCost;
  }, 0);
};

/**
 * Calculate total Philippines cost for multi-level experience distribution
 * Used by ExperienceStep component
 */
export const calculateMultiLevelPhilippinesCost = (
  activeRoles: Array<{ id: string; distribution: RoleExperienceDistribution }>,
  allRoles: any[],
  roles?: any
): number => {
  return activeRoles.reduce((total, role) => {
    const roleData = allRoles.find(r => r.id === role.id);
    if (!roleData) return total;
    
    let roleCost = 0;
    const distribution = role.distribution;
    
    // Get salary data
    const roleSalaryData = getSalaryDataFromRoles(roles, roleData.id);
    const philippineData = roleSalaryData?.Philippines;
    
    if (philippineData) {
      // Calculate cost for each experience level based on distribution
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          const philippineSalary = philippineData[level].base;
          roleCost += philippineSalary * memberCount;
        }
      }
    } else if (roleData.estimatedSalary) {
      // For custom roles
      const baseSalary = roleData.estimatedSalary.philippine;
      const multipliers = { entry: 0.8, moderate: 1.0, experienced: 1.2 };
      for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
        const memberCount = distribution[level];
        if (memberCount > 0) {
          roleCost += (baseSalary * multipliers[level]) * memberCount;
        }
      }
    }
    
    return total + roleCost;
  }, 0);
};

/**
 * Calculate savings for a specific role and experience level
 * Used by ExperienceStep component
 */
export const calculateRoleLevelSavings = (
  role: any,
  experienceLevel: ExperienceLevel,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any
): number => {
  const savings = calculateIndividualRoleSavingsSync(role, userLocation, manualLocation, roles);
  return savings[experienceLevel];
};

/**
 * Calculate display information for individual experience level
 * Used by ExperienceStep component for individual level cards
 */
export const calculateIndividualLevelDisplay = async (
  role: any,
  experienceLevel: ExperienceLevel,
  memberCount: number,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any,
  savingsView: 'annual' | 'monthly' = 'annual'
): Promise<{
  localCost: number;
  philippineCost: number;
  philippineCostConverted: number;
  savings: number;
  savingsPercentage: number;
}> => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
  
  // Try to get local salary data, fall back to supported countries if not found
  let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
  if (!localData) {
    // Check if the country is one of our supported countries
    const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
    const fallbackCountry = supportedCountries.find(country => roleSalaryData?.[country as keyof typeof roleSalaryData]);
    
    if (fallbackCountry) {
      console.log('📊 No salary data for country:', effectiveCountry, '- falling back to', fallbackCountry, 'data');
      localData = roleSalaryData?.[fallbackCountry as keyof typeof roleSalaryData];
    } else {
      console.log('📊 No salary data for country:', effectiveCountry, '- falling back to US data');
      localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
    }
  }
  
  const philippineData = roleSalaryData?.Philippines;
  
  if (localData && philippineData) {
    const localSalary = localData[experienceLevel].base;
    const philippineSalary = philippineData[experienceLevel].base;
    
    const totalLocalCost = localSalary * memberCount;
    const totalPhilippineCost = philippineSalary * memberCount;
    
    // Convert using live API rate for accurate conversion
    const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
    let conversionRate: number;
    try {
      conversionRate = await getDirectExchangeRate('PHP', effectiveCurrency);
    } catch (error) {
      console.warn('Failed to get live exchange rate, using fallback:', error);
      // Fallback to static rate if API fails
      const staticRates: Record<string, number> = {
        'USD': 0.018, 'EUR': 0.017, 'GBP': 0.014, 'AUD': 0.027, 'CAD': 0.024, 'SGD': 0.024,
      };
      conversionRate = staticRates[effectiveCurrency] || staticRates['USD'] || 0.018;
    }
    
    // Use exact mathematical calculation and truncate to avoid rounding
    const exactConversion = totalPhilippineCost * conversionRate;
    const totalPhilippineCostConverted = Math.trunc(exactConversion);
    
    const savings = totalLocalCost - totalPhilippineCostConverted;
    const savingsPercentage = totalLocalCost > 0 ? (savings / totalLocalCost) * 100 : 0;
    
    // Apply monthly/annual conversion
    const monthlyDivisor = savingsView === 'monthly' ? 12 : 1;
    
    return {
      localCost: totalLocalCost / monthlyDivisor,
      philippineCost: totalPhilippineCost / monthlyDivisor,
      philippineCostConverted: totalPhilippineCostConverted / monthlyDivisor,
      savings: savings / monthlyDivisor,
      savingsPercentage
    };
  }
  
  // Fallback for custom roles or missing data
  return {
    localCost: 0,
    philippineCost: 0,
    philippineCostConverted: 0,
    savings: 0,
    savingsPercentage: 0
  };
};

/**
 * Calculate role breakdown display information
 * Used by ExperienceStep component for role summary cards
 */
export const calculateRoleBreakdownDisplay = async (
  role: any,
  distribution: RoleExperienceDistribution,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any,
  savingsView: 'annual' | 'monthly' = 'annual'
): Promise<{
  localCost: number;
  philippineCost: number;
  philippineCostConverted: number;
  savings: number;
  savingsPercentage: number;
}> => {
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
  
  // Try to get local salary data, fall back to supported countries if not found
  let localData = roleSalaryData?.[effectiveCountry as keyof typeof roleSalaryData];
  if (!localData) {
    // Check if the country is one of our supported countries
    const supportedCountries = ['Australia', 'Canada', 'United Kingdom', 'New Zealand', 'Singapore', 'Philippines', 'United States'];
    const fallbackCountry = supportedCountries.find(country => roleSalaryData?.[country as keyof typeof roleSalaryData]);
    
    if (fallbackCountry) {
      console.log('📊 No salary data for country:', effectiveCountry, '- falling back to', fallbackCountry, 'data');
      localData = roleSalaryData?.[fallbackCountry as keyof typeof roleSalaryData];
    } else {
      console.log('📊 No salary data for country:', effectiveCountry, '- falling back to US data');
      localData = roleSalaryData?.["United States" as keyof typeof roleSalaryData];
    }
  }
  
  const philippineData = roleSalaryData?.Philippines;
  
  if (localData && philippineData) {
    let totalLocalCost = 0;
    let totalPhilippineCost = 0;
    
    // Calculate costs for each experience level
    for (const level of ['entry', 'moderate', 'experienced'] as ExperienceLevel[]) {
      const memberCount = distribution[level];
      if (memberCount > 0) {
        totalLocalCost += localData[level].base * memberCount;
        totalPhilippineCost += philippineData[level].base * memberCount;
      }
    }
    
    // Convert using live API rate for accurate conversion
    const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
    let conversionRate: number;
    try {
      conversionRate = await getDirectExchangeRate('PHP', effectiveCurrency);
    } catch (error) {
      console.warn('Failed to get live exchange rate, using fallback:', error);
      // Fallback to static rate if API fails
      const staticRates: Record<string, number> = {
        'USD': 0.018, 'EUR': 0.017, 'GBP': 0.014, 'AUD': 0.027, 'CAD': 0.024, 'SGD': 0.024,
      };
      conversionRate = staticRates[effectiveCurrency] || staticRates['USD'] || 0.018;
    }
    
    // Use exact mathematical calculation and truncate to avoid rounding
    const exactConversion = totalPhilippineCost * conversionRate;
    const totalPhilippineCostConverted = Math.trunc(exactConversion);
    
    const savings = totalLocalCost - totalPhilippineCostConverted;
    const savingsPercentage = totalLocalCost > 0 ? (savings / totalLocalCost) * 100 : 0;
    
    // Apply monthly/annual conversion
    const monthlyDivisor = savingsView === 'monthly' ? 12 : 1;
    
    return {
      localCost: totalLocalCost / monthlyDivisor,
      philippineCost: totalPhilippineCost / monthlyDivisor,
      philippineCostConverted: totalPhilippineCostConverted / monthlyDivisor,
      savings: savings / monthlyDivisor,
      savingsPercentage
    };
  }
  
  // Fallback for custom roles or missing data
  return {
    localCost: 0,
    philippineCost: 0,
    philippineCostConverted: 0,
    savings: 0,
    savingsPercentage: 0
  };
};

/**
 * Get role salary display string for a specific level
 * Used by ExperienceStep component for salary display
 */
export const getRoleSalaryDisplay = async (
  role: any,
  experienceLevel: ExperienceLevel,
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  roles?: any
): Promise<string> => {
  const roleSalaryData = getSalaryDataFromRoles(roles, role.id);
  const philippineData = roleSalaryData?.Philippines;
  
  if (philippineData && philippineData[experienceLevel]) {
    const phpSalary = philippineData[experienceLevel].base;
    
    // Convert using live API rate for accurate conversion
    const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
    const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
    let conversionRate: number;
    try {
      conversionRate = await getDirectExchangeRate('PHP', effectiveCurrency);
    } catch (error) {
      console.warn('Failed to get live exchange rate, using fallback:', error);
      // Fallback to static rate if API fails
      const staticRates: Record<string, number> = {
        'USD': 0.018, 'EUR': 0.017, 'GBP': 0.014, 'AUD': 0.027, 'CAD': 0.024, 'SGD': 0.024,
      };
      conversionRate = staticRates[effectiveCurrency] || staticRates['USD'] || 0.018;
    }
    
    // Use exact mathematical calculation and truncate to avoid rounding
    const exactConversion = phpSalary * conversionRate;
    const convertedSalary = Math.trunc(exactConversion);
    
    const currencySymbol = getCurrencySymbol(effectiveCurrency);
    return `₱${formatNumberPrecise(phpSalary, { showDecimals: false })} (${currencySymbol}${formatNumberPrecise(convertedSalary, { showDecimals: false })})`;
  }
  
  // Fallback for custom roles or roles without salary data
  const fallbackSalariesPHP = {
    entry: 300000,
    moderate: 420000,
    experienced: 600000
  };
  
  const phpAmount = fallbackSalariesPHP[experienceLevel];
  const effectiveCountry = manualLocation?.country || userLocation?.country || 'United States';
  const effectiveCurrency = getDisplayCurrencyByCountry(effectiveCountry);
  let conversionRate: number;
  try {
    conversionRate = await getDirectExchangeRate('PHP', effectiveCurrency);
  } catch (error) {
    console.warn('Failed to get live exchange rate, using fallback:', error);
    // Fallback to static rate if API fails
    const staticRates: Record<string, number> = {
      'USD': 0.018, 'EUR': 0.017, 'GBP': 0.014, 'AUD': 0.027, 'CAD': 0.024, 'SGD': 0.024,
    };
    conversionRate = staticRates[effectiveCurrency] || staticRates['USD'] || 0.018;
  }
  
  // Use exact mathematical calculation and truncate to avoid rounding
  const exactConversion = phpAmount * conversionRate;
  const convertedAmount = Math.trunc(exactConversion);
  
  const currencySymbol = getCurrencySymbol(effectiveCurrency);
  return `₱${formatNumberPrecise(phpAmount, { showDecimals: false })} (${currencySymbol}${formatNumberPrecise(convertedAmount, { showDecimals: false })})`;
};

/**
 * Calculate total Philippines cost converted to local currency for display
 * Used by ExperienceStep component for total summary
 */
export const calculateTotalPhilippinesCostConverted = async (
  activeRoles: Array<{ id: string; distribution: RoleExperienceDistribution }>,
  allRoles: any[],
  userLocation?: LocationData,
  manualLocation?: ManualLocation | null,
  rolesSalaryComparison?: any
): Promise<number> => {
  const totalPhpCost = calculateMultiLevelPhilippinesCost(activeRoles, allRoles, rolesSalaryComparison);
  
  // Convert using live API rate for accurate conversion
  const effectiveCurrency = manualLocation?.currency || userLocation?.currency || 'USD';
  let conversionRate: number;
  try {
    conversionRate = await getDirectExchangeRate('PHP', effectiveCurrency);
  } catch (error) {
    console.warn('Failed to get live exchange rate, using fallback:', error);
    // Fallback to static rate if API fails
    const staticRates: Record<string, number> = {
      'USD': 0.018, 'EUR': 0.017, 'GBP': 0.014, 'AUD': 0.027, 'CAD': 0.024, 'SGD': 0.024,
    };
    conversionRate = staticRates[effectiveCurrency] || staticRates['USD'] || 0.018;
  }
  
  // Use exact mathematical calculation and truncate to avoid rounding
  const exactConversion = totalPhpCost * conversionRate;
  return Math.trunc(exactConversion);
};

/**
 * Calculate total savings percentage
 * Used for displaying savings percentage across all roles
 */
export const calculateTotalSavingsPercentage = (
  totalSavings: number,
  totalLocalCost: number
): number => {
  return totalLocalCost > 0 ? (totalSavings / totalLocalCost) * 100 : 0;
};

/**
 * Format cost amount for monthly or annual view
 * Handles the division by 12 for monthly view consistently
 */
export const formatCostForView = (
  amount: number,
  savingsView: 'annual' | 'monthly'
): number => {
  return savingsView === 'monthly' ? amount / 12 : amount;
};