import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FormData, CalculationResult, RoleId } from '@/types';

interface ImplementationPlanRequest {
  formData: FormData;
  calculationResult: CalculationResult;
}

interface ImplementationPlan {
  executiveSummary: string;
  detailedPlan: {
    phase: string;
    duration: string;
    objectives: string[];
    deliverables: string[];
    keyActivities: string[];
    risks: string[];
    mitigations: string[];
  }[];
  claudeAIGuide: {
    setupSteps: {
      step: string;
      description: string;
      instructions: string[];
      tips: string[];
    }[];
    jobDescriptionTemplates: {
      role: string;
      template: string;
      claudePrompt: string;
    }[];
    trainingProcesses: {
      process: string;
      description: string;
      claudePrompts: string[];
      expectedOutcomes: string[];
    }[];
    workflowAutomation: {
      workflow: string;
      description: string;
      claudeIntegration: string;
      benefits: string[];
    }[];
  };
  resourceRequirements: {
    internalTeam: string[];
    externalSupport: string[];
    toolsAndSystems: string[];
    budgetConsiderations: string[];
  };
  timeline: {
    phase: string;
    startWeek: number;
    duration: string;
    milestones: string[];
  }[];
  riskAssessment: {
    risk: string;
    impact: 'Low' | 'Medium' | 'High';
    probability: 'Low' | 'Medium' | 'High';
    mitigation: string;
  }[];
  successMetrics: {
    metric: string;
    target: string;
    measurement: string;
  }[];
  nextSteps: string[];
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { formData, calculationResult }: ImplementationPlanRequest = await request.json();

    // Build context for Claude
    const selectedRoles = Object.keys(formData.selectedRoles).filter(key => formData.selectedRoles[key as RoleId]);
    
    const context = `
    Company Context:
    - Portfolio Size: ${formData.portfolioSize || 'Not specified'}
    - Experience Level: ${formData.experienceLevel || 'Not specified'}
    - Team Size: ${calculationResult.totalTeamSize || 'Not specified'}
    - Selected Roles: ${selectedRoles.join(', ')}
    
    Financial Analysis:
    - Total Annual Savings: $${calculationResult.totalSavings?.toLocaleString() || '0'}
    - Total Australian Cost: $${calculationResult.totalAustralianCost?.toLocaleString() || '0'}
    - Total Philippine Cost: $${calculationResult.totalPhilippineCost?.toLocaleString() || '0'}
    - Average Savings Percentage: ${calculationResult.averageSavingsPercentage || 0}%
    - Estimated ROI: ${calculationResult.estimatedROI || 0}%
    - Lead Score: ${calculationResult.leadScore || 0}
    `;

    const prompt = `
    As an expert offshore development consultant, create a comprehensive, actionable implementation plan for transitioning to offshore development based on the following client information:

    ${context}

    Generate a detailed JSON response that includes a comprehensive Claude AI setup guide for managing offshore teams. The response should include:

    1. Executive summary and implementation phases
    2. A complete Claude AI guide with setup steps, job description templates, training processes, and workflow automation
    3. Risk assessment and success metrics
    4. Immediate next steps

    Focus on practical, actionable steps they can implement immediately, with special emphasis on using Claude AI to streamline offshore team management.
    `;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      
      // Parse the JSON response from Claude
      let implementationPlan: ImplementationPlan;
      try {
        // Extract JSON from the response (Claude might wrap it in markdown)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : responseText;
        implementationPlan = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Failed to parse Claude response:', parseError);
        // Fallback implementation plan
        implementationPlan = createFallbackPlan(formData, calculationResult);
      }

      return NextResponse.json({
        success: true,
        implementationPlan
      });
    } catch (claudeError) {
      console.error('Claude API error:', claudeError);
      // Return fallback plan on Claude API error
      const fallbackPlan = createFallbackPlan(formData, calculationResult);
      
      return NextResponse.json({
        success: true,
        implementationPlan: fallbackPlan,
        note: 'Generated using fallback template due to API limitations'
      });
    }

  } catch (error) {
    console.error('Implementation plan generation error:', error);
    
    // Return fallback plan on error
    const { formData, calculationResult } = await request.json();
    const fallbackPlan = createFallbackPlan(formData, calculationResult);
    
    return NextResponse.json({
      success: true,
      implementationPlan: fallbackPlan,
      note: 'Generated using fallback template due to API limitations'
    });
  }
}

function createFallbackPlan(formData: FormData, calculationResult: CalculationResult): ImplementationPlan {
  const selectedRoles = Object.keys(formData.selectedRoles).filter(key => formData.selectedRoles[key as RoleId]);

  return {
    executiveSummary: `Based on your ${formData.portfolioSize || 'property management'} portfolio and team requirements, implementing an offshore development strategy can deliver significant cost savings of $${calculationResult.totalSavings?.toLocaleString() || '0'} annually. This implementation plan provides a structured approach to transition your ${selectedRoles.join(', ')} roles offshore while maintaining quality and productivity. The plan focuses on risk mitigation, clear communication protocols, and measurable success metrics to ensure a smooth transition over ${calculationResult.implementationTimeline?.fullImplementation || 6} weeks.`,
    
    detailedPlan: [
      {
        phase: "Planning & Setup",
        duration: `${calculationResult.implementationTimeline?.planning || 4} weeks`,
        objectives: [
          "Define project scope and requirements",
          "Establish communication protocols",
          "Set up development infrastructure"
        ],
        deliverables: [
          "Project requirements document",
          "Communication framework",
          "Development environment setup"
        ],
        keyActivities: [
          "Conduct stakeholder alignment meetings",
          "Create detailed job descriptions for offshore roles",
          "Set up project management tools and workflows"
        ],
        risks: [
          "Unclear requirements leading to scope creep",
          "Communication barriers"
        ],
        mitigations: [
          "Invest time in detailed documentation",
          "Establish regular check-in schedules"
        ]
      },
      {
        phase: "Team Recruitment & Onboarding",
        duration: `${calculationResult.implementationTimeline?.hiring || 6} weeks`,
        objectives: [
          "Recruit qualified offshore team members",
          "Complete comprehensive onboarding",
          "Establish working relationships"
        ],
        deliverables: [
          "Fully staffed offshore team",
          "Completed onboarding documentation",
          "Initial project assignments"
        ],
        keyActivities: [
          "Screen and interview candidates",
          "Conduct technical assessments",
          "Provide company and project training"
        ],
        risks: [
          "Difficulty finding qualified candidates",
          "Cultural integration challenges"
        ],
        mitigations: [
          "Work with experienced offshore partners",
          "Implement cultural orientation programs"
        ]
      },
      {
        phase: "Pilot Project Execution",
        duration: `${calculationResult.implementationTimeline?.training || 8} weeks`,
        objectives: [
          "Execute a pilot project successfully",
          "Validate processes and workflows",
          "Build confidence in offshore capabilities"
        ],
        deliverables: [
          "Completed pilot project",
          "Process optimization recommendations",
          "Performance metrics report"
        ],
        keyActivities: [
          "Execute pilot project with close monitoring",
          "Gather feedback from all stakeholders",
          "Refine processes based on learnings"
        ],
        risks: [
          "Pilot project delays or quality issues",
          "Stakeholder resistance to change"
        ],
        mitigations: [
          "Choose a well-defined, lower-risk pilot project",
          "Maintain transparent communication throughout"
        ]
      }
          ],
     
     claudeAIGuide: {
       setupSteps: [
         {
           step: "Claude AI Setup for Property Management",
           description: `Set up Claude AI to assist your ${formData.portfolioSize || 'property management'} portfolio with ${calculationResult.totalTeamSize} offshore team members`,
           instructions: [
             "Visit claude.ai and create an account using your property management business email",
             "Choose Claude Pro ($20/month) for handling large property portfolios and team coordination",
             "Set up your profile with property management industry focus",
             "Create dedicated workspaces for different property types and team functions"
           ],
           tips: [
             `With ${formData.portfolioSize || 'your'} portfolio size, Claude Pro will handle your volume needs`,
             "Use your company domain email for better team collaboration",
             "Start with tenant communication templates before expanding to other areas"
           ]
         },
         {
           step: "Property Management Workflow Integration", 
           description: "Integrate Claude with your existing property management systems",
           instructions: [
             "Connect Claude API to your property management software (PropertyTree, Palace, etc.)",
             "Set up automated tenant communication workflows",
             "Create maintenance request processing templates",
             "Establish lease document generation and review processes"
           ],
           tips: [
             "Start with high-volume, repetitive tasks like tenant inquiries",
             "Test all integrations with a small property subset first",
             "Maintain compliance with local tenancy laws in all automated responses"
           ]
         },
         {
           step: "Offshore Team Claude Training",
           description: `Train your ${calculationResult.totalTeamSize} offshore team members to use Claude effectively`,
           instructions: [
             "Provide Claude access to all offshore property management staff",
             "Create role-specific Claude prompt libraries for each team member",
             "Establish Claude usage guidelines and best practices",
             "Set up regular training sessions on advanced Claude features"
           ],
           tips: [
             "Focus training on property management specific prompts and workflows",
             "Create shared prompt templates for consistency across the team",
             "Monitor usage to identify which team members need additional support"
           ]
         }
       ],
       jobDescriptionTemplates: [
         {
           role: `Offshore Property Manager (${formData.portfolioSize || 'Portfolio'} Specialist)`,
           template: `We are seeking an experienced Property Manager to join our offshore team managing ${formData.portfolioSize || 'multiple'} properties. You'll handle tenant relations, maintenance coordination, and property inspections while working closely with our Australian head office. Experience with Australian property management software and tenancy laws required.`,
           claudePrompt: `Create a detailed job description for an offshore property manager position managing ${formData.portfolioSize || 'a significant'} property portfolio. Include: tenant relationship management, lease administration, maintenance coordination, property inspections, rent collection, compliance with Australian tenancy laws, experience with property management software (PropertyTree, Palace, etc.), strong English communication skills, and ability to work Australian business hours. Salary range: $25,000-$35,000 AUD annually.`
         },
         {
           role: "Offshore Leasing Consultant",
           template: "Join our team as an Offshore Leasing Consultant specializing in tenant acquisition and retention. You'll handle property inquiries, conduct virtual inspections, process applications, and manage the entire leasing lifecycle for our Australian property portfolio.",
           claudePrompt: `Generate a job description for an offshore leasing consultant role. Include: property marketing and advertising, tenant screening and application processing, virtual property tours, lease negotiation, move-in coordination, tenant retention strategies, knowledge of Australian rental market, experience with online property platforms (Domain, realestate.com.au), and customer service excellence. Focus on digital marketing skills and virtual communication capabilities.`
         },
         {
           role: "Offshore Maintenance Coordinator",
           template: "We're looking for a detail-oriented Maintenance Coordinator to manage property maintenance requests and coordinate with local contractors across our Australian property portfolio. This role requires excellent organizational skills and experience with maintenance management systems.",
           claudePrompt: `Create a comprehensive job description for an offshore maintenance coordinator position. Cover: maintenance request processing and prioritization, contractor coordination and scheduling, cost estimation and budget management, emergency response protocols, preventive maintenance planning, vendor relationship management, work order tracking, compliance with Australian building standards, and experience with maintenance management software. Include problem-solving skills and ability to work with local Australian contractors.`
         }
       ],
       trainingProcesses: [
         {
           process: "Property Management Onboarding",
           description: `Comprehensive property management training for your ${calculationResult.totalTeamSize} offshore team members`,
           claudePrompts: [
             `Create a 3-week property management onboarding curriculum for new offshore team members joining a ${formData.portfolioSize || 'property management'} portfolio. Include: Australian tenancy laws, property management software training (PropertyTree/Palace), tenant communication standards, maintenance workflows, lease administration, and rent collection processes. Structure it week-by-week with practical exercises.`,
             `Generate a property management competency assessment for offshore team members. Include: tenancy law knowledge tests, software proficiency checks, tenant communication scenarios, maintenance request handling, and emergency response protocols. Provide scoring criteria and improvement plans.`,
             `Design a mentorship program pairing experienced Australian property managers with new offshore hires. Include: weekly check-ins, property portfolio walkthroughs, tenant interaction shadowing, and gradual responsibility transfer over 4 weeks.`
           ],
           expectedOutcomes: [
             "New offshore staff fully operational within 3 weeks",
             "Consistent application of Australian tenancy laws",
             "Proficiency in all property management software and tools",
             "Established support network with Australian mentors"
           ]
         },
         {
           process: "Australian Property Market Training",
           description: "Training on Australian property market and cultural considerations",
           claudePrompts: [
                           `Develop a comprehensive Australian property market training program for offshore staff. Cover: rental market trends, tenant expectations, Australian business culture, communication styles, legal compliance requirements, and local property management practices. Include region-specific information for your key markets.`,
             `Create tenant communication training materials specific to Australian cultural norms. Include: professional email templates, phone call etiquette, conflict resolution approaches, cultural sensitivity guidelines, and emergency communication protocols.`,
             `Design Australian property law and compliance training. Cover: residential tenancy acts, bond handling, rent increase procedures, property inspection requirements, dispute resolution processes, and fair trading regulations.`
           ],
           expectedOutcomes: [
             "Deep understanding of Australian property market dynamics",
             "Culturally appropriate tenant communication skills",
             "Full compliance with Australian property management laws",
             "Confidence in handling complex tenant situations"
           ]
         },
         {
           process: "Property Management Technology & Claude Integration",
           description: "Training on property management systems and Claude AI assistance",
           claudePrompts: [
             `Create a comprehensive training program for property management software integration with Claude AI. Include: automated tenant communication, maintenance request processing, lease document generation, rent collection follow-up, and property inspection report creation. Focus on ${formData.portfolioSize || 'portfolio'} scale operations.`,
             `Develop Claude AI prompt libraries specifically for property management tasks. Include: tenant inquiry responses, maintenance coordination prompts, lease agreement reviews, property marketing content, and performance reporting templates.`,
             `Generate property management KPI tracking and reporting training using Claude AI. Include: occupancy rate analysis, maintenance cost tracking, tenant satisfaction monitoring, rent collection performance, and portfolio growth metrics.`
           ],
           expectedOutcomes: [
             "Seamless integration of Claude AI into daily property management tasks",
             "Increased efficiency in tenant communication and documentation",
             "Automated reporting and performance tracking capabilities",
             "Consistent service quality across the entire property portfolio"
           ]
         }
       ],
       workflowAutomation: [
         {
           workflow: "Automated Tenant Communication",
           description: `Use Claude to handle routine tenant communications across your ${formData.portfolioSize || 'property'} portfolio`,
           claudeIntegration: `Set up Claude API integration with your property management software to automatically respond to common tenant inquiries, generate lease renewal notices, send maintenance updates, and create property inspection reports. Customize responses based on property type and tenant history.`,
           benefits: [
             "24/7 tenant communication capability",
             "Consistent, professional responses across all properties",
             "Reduced response time from hours to minutes",
             `Scalable communication handling for ${formData.portfolioSize || 'growing'} portfolios`
           ]
         },
         {
           workflow: "Maintenance Request Processing",
           description: "Automated maintenance request categorization and contractor coordination",
           claudeIntegration: `Integrate Claude with your maintenance management system to automatically categorize maintenance requests by urgency and type, generate work orders, coordinate with local contractors, and provide cost estimates. Include automated tenant updates throughout the process.`,
           benefits: [
             "Faster maintenance response times",
             "Consistent prioritization of urgent vs. routine maintenance",
             "Automated contractor scheduling and coordination",
             "Improved tenant satisfaction through better communication"
           ]
         },
         {
           workflow: "Lease Document Generation & Review",
           description: "Automated creation and review of lease agreements and property documents",
           claudeIntegration: `Use Claude to automatically generate lease agreements, property condition reports, bond lodgment forms, and compliance documents. Include automated review of existing leases for renewal opportunities and rent adjustment calculations based on market data.`,
           benefits: [
             "Consistent, legally compliant lease documentation",
             "Consistent documentation standards across projects",
             "Reduced documentation maintenance overhead",
             "Improved knowledge transfer and team onboarding"
           ]
         },
         {
           workflow: "Communication Enhancement",
           description: "AI-powered communication optimization for offshore teams",
           claudeIntegration: "Implement Claude to help offshore team members improve their written communication, generate meeting agendas, create status reports, and translate complex technical concepts into clear business language.",
           benefits: [
             "Improved communication clarity and professionalism",
             "Reduced language barriers and miscommunication",
             "More effective meetings and status updates",
             "Enhanced collaboration between offshore and onshore teams"
           ]
         }
       ]
     },
    
    resourceRequirements: {
      internalTeam: [
        "Project Manager to oversee transition",
        "Technical Lead for architecture guidance",
        "HR representative for team integration"
      ],
      externalSupport: [
        "Offshore development partner",
        "Legal counsel for contract review",
        "Cultural integration consultant"
      ],
      toolsAndSystems: [
        "Project management platform (Jira, Asana)",
        "Communication tools (Slack, Microsoft Teams)",
        "Code repository and CI/CD pipeline"
      ],
      budgetConsiderations: [
        `Monthly offshore team cost: $${calculationResult.totalPhilippineCost?.toLocaleString() || '0'}`,
        "Setup and infrastructure costs",
        "Training and onboarding expenses"
      ]
    },
    
    timeline: [
      {
        phase: "Planning & Setup",
        startWeek: 1,
        duration: `${calculationResult.implementationTimeline?.planning || 4} weeks`,
        milestones: ["Requirements finalized", "Infrastructure ready", "Processes documented"]
      },
      {
        phase: "Recruitment",
        startWeek: (calculationResult.implementationTimeline?.planning || 4) + 1,
        duration: `${calculationResult.implementationTimeline?.hiring || 6} weeks`,
        milestones: ["Team hired", "Onboarding completed", "First assignments given"]
      },
      {
        phase: "Pilot Execution",
        startWeek: (calculationResult.implementationTimeline?.planning || 4) + (calculationResult.implementationTimeline?.hiring || 6) + 1,
        duration: `${calculationResult.implementationTimeline?.training || 8} weeks`,
        milestones: ["Pilot project delivered", "Processes optimized", "Full-scale approval"]
      }
    ],
    
    riskAssessment: calculationResult.riskAssessment?.factors.map((factor, index) => ({
      risk: factor,
      impact: calculationResult.riskAssessment?.level === 'high' ? 'High' as const : 
              calculationResult.riskAssessment?.level === 'medium' ? 'Medium' as const : 'Low' as const,
      probability: index === 0 ? 'High' as const : index === 1 ? 'Medium' as const : 'Low' as const,
      mitigation: calculationResult.riskAssessment?.mitigationStrategies[index] || "Implement standard mitigation procedures"
    })) || [
      {
        risk: "Communication barriers due to time zones",
        impact: "Medium" as const,
        probability: "High" as const,
        mitigation: "Establish overlapping work hours and asynchronous communication protocols"
      },
      {
        risk: "Quality concerns with offshore deliverables",
        impact: "High" as const,
        probability: "Medium" as const,
        mitigation: "Implement robust code review processes and quality checkpoints"
      },
      {
        risk: "Internal team resistance to change",
        impact: "Medium" as const,
        probability: "Medium" as const,
        mitigation: "Involve internal team in planning and provide clear communication about benefits"
      }
    ],
    
    successMetrics: [
      {
        metric: "Cost Savings Achievement",
        target: `$${calculationResult.totalSavings?.toLocaleString() || '0'} annual savings`,
        measurement: "Monthly budget vs. actual cost tracking"
      },
      {
        metric: "Project Delivery Timeline",
        target: "Maintain or improve current delivery timelines",
        measurement: "Sprint velocity and milestone completion rates"
      },
      {
        metric: "Quality Standards",
        target: "Maintain current quality metrics or better",
        measurement: "Bug rates, code review scores, customer satisfaction"
      },
      {
        metric: "ROI Achievement",
        target: `${calculationResult.estimatedROI || 0}% return on investment`,
        measurement: "Quarterly financial analysis and cost-benefit tracking"
      }
    ],
    
    nextSteps: [
      "Schedule stakeholder alignment meeting within 1 week",
      "Begin documenting current processes and requirements",
      "Research and shortlist potential offshore development partners",
      "Prepare budget approval for offshore transition",
      "Identify pilot project candidates for initial offshore engagement"
    ]
  };
} 