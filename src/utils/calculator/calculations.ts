import { 
  FormData, 
  CalculationResult, 
  RoleSavings, 
  RoleId, 
  ExperienceLevel,
  BusinessTier,
  PortfolioSize,
  CustomTask,
  Task
} from '@/types';
import { 
  SALARY_DATA, 
  PORTFOLIO_INDICATORS, 
  TASK_COMPLEXITY_MULTIPLIERS, 
  ROLES 
} from './data';

/**
 * Main calculation engine - calculates savings for offshore team scaling
 */
export const calculateSavings = (formData: FormData): CalculationResult => {
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
  selectedRoles.forEach(roleId => {
    const teamSize = formData.teamSize[roleId];
    const experienceLevel = formData.experienceLevel as ExperienceLevel;
    
    // Get salary data for this role and experience level
    const roleSalaryData = SALARY_DATA[roleId];
    const australianSalary = roleSalaryData.australian[experienceLevel];
    const philippineSalary = roleSalaryData.philippine[experienceLevel];

    // Calculate base costs
    const australianCost = australianSalary.total * teamSize;
    const philippineCost = philippineSalary.total * teamSize;

    // Count selected tasks for this role
    const selectedTasksForRole = Object.keys(formData.selectedTasks)
      .filter(taskKey => taskKey.startsWith(roleId) && formData.selectedTasks[taskKey])
      .length;

    // Count custom tasks for this role
    const customTasksForRole = formData.customTasks[roleId]?.length || 0;

    // Calculate task complexity multiplier
    const roleData = ROLES[roleId];
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
    const savingsPercentage = (savings / australianCost) * 100;

    // Estimate implementation time (days)
    const implementationTime = calculateImplementationTime(teamSize, totalTasks, experienceLevel);

    // Assess risk factors
    const riskFactors = assessRiskFactors(roleId, teamSize, totalTasks, experienceLevel);

    breakdown[roleId] = {
      roleId,
      roleName: roleData.title,
      teamSize,
      experienceLevel,
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
  });

  const totalSavings = totalAustralianCost - totalPhilippineCost;
  const averageSavingsPercentage = totalAustralianCost > 0 
    ? (totalSavings / totalAustralianCost) * 100 
    : 0;

  // Get portfolio tier
  const portfolioTier = getPortfolioTier(formData.portfolioSize as PortfolioSize);

  // Calculate lead score
  const leadScore = calculateLeadScore(formData, totalSavings, totalTeamSize);

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
 * Calculate implementation time for a specific role
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
 * Assess risk factors for a specific role
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
  const roleSpecificRisks = {
    assistantPropertyManager: ['Compliance requirements vary by location'],
    leasingCoordinator: ['Customer interaction requires cultural training'],
    marketingSpecialist: ['Brand consistency requires clear guidelines']
  };

  risks.push(...roleSpecificRisks[roleId]);

  return risks;
};

/**
 * Get portfolio tier from portfolio size
 */
const getPortfolioTier = (portfolioSize: PortfolioSize): BusinessTier => {
  return PORTFOLIO_INDICATORS[portfolioSize]?.tier || 'growing';
};

/**
 * Calculate lead score (0-100)
 */
const calculateLeadScore = (
  formData: FormData, 
  totalSavings: number, 
  totalTeamSize: number
): number => {
  let score = 0;

  // Portfolio size scoring (0-30 points)
  const portfolioScoring = {
    '500-999': 15,
    '1000-1999': 25,
    '2000-4999': 30,
    '5000+': 30
  };
  score += portfolioScoring[formData.portfolioSize as PortfolioSize] || 0;

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