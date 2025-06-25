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
import { getCurrencyMultiplier, getBestExchangeRateMultiplier } from './currency';
import { Country } from '@/types/location';

/**
 * Helper function to get salary data with currency conversion
 */
const getSalaryData = (roleId: RoleId, userCountry?: string) => {
  const multiCountryData = ROLES_SALARY_COMPARISON[roleId];
  if (!multiCountryData) {
    console.warn(`No salary data found for role: ${roleId}`);
    return null;
  }

  // Default to United States if no country specified
  const effectiveCountry = (userCountry || 'United States') as Country;
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
 */
export const calculateSavings = async (
  formData: FormData,
  portfolioIndicators: PortfolioIndicator[],
  userLocation?: LocationData
): Promise<CalculationResult> => {
  if (!formData.roles?.length) {
    return {
      totalSavings: 0,
      savingsPercentage: 0,
      roleSavings: [],
      portfolioIndicators: []
    };
  }

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
    const roleSalaryData = getSalaryData(roleId, userLocation?.country);
    
    if (!roleData || !roleSalaryData) {
      console.warn(`Missing data for role: ${roleId}`);
      return;
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
          const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(userLocation?.currency || 'AUD');
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
      const usdToLocal = phpToUsd * await getBestExchangeRateMultiplier(userLocation?.currency || 'AUD');
      philippineCost = usdToLocal * teamSize;
    }

    // Count selected tasks for this role
    const selectedTasksForRole = Object.keys(formData.selectedTasks)
      .filter(taskKey => taskKey.startsWith(roleId) && formData.selectedTasks[taskKey])
      .length;

    // Count custom tasks for this role
    const customTasksForRole = formData.customTasks[roleId]?.length || 0;

    // Calculate task complexity multiplier
    const selectedTasks = roleData.tasks.filter((task: Task) => 
      formData.selectedTasks[`${roleId}-${task.id}`]
    );
    
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
  const portfolioTier = getPortfolioTier(formData, portfolioIndicators);

  // Calculate lead score
  const leadScore = calculateLeadScore(formData, totalSavings, totalTeamSize, portfolioIndicators);

  // Calculate ROI
  const estimatedROI = calculateROI(totalSavings, totalPhilippineCost);

  // Calculate implementation timeline
  const implementationTimeline = calculateImplementationTimeline(totalTeamSize, portfolioTier);

  // Assess overall risk
  const riskAssessment = assessOverallRisk(formData, breakdown, portfolioTier);

  return {
    totalSavings,
    totalAustralianCost,
    totalPhilippineCost,
    breakdown,
    portfolioTier,
    leadScore,
    selectedTasksCount: totalSelectedTasks,
    customTasksCount: totalCustomTasks,
    totalTeamSize,
    averageSavingsPercentage,
    estimatedROI,
    implementationTimeline,
    riskAssessment
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
  
  let portfolioScore = portfolioScoring[formData.portfolioSize as PortfolioSize] || 0;
  
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