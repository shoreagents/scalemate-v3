import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { FormData, CalculationResult } from '@/types/calculator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { formData, calculationResult, insightType } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const prompt = generatePrompt(formData, calculationResult, insightType);

    const message = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Use Haiku for faster, cost-effective responses
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    const aiResponse = message.content[0]?.type === 'text' ? 
      (message.content[0] as any).text : 
      'Unable to generate response';

    return NextResponse.json({
      success: true,
      insight: aiResponse,
      type: insightType,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Insights API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    );
  }
}

function generatePrompt(formData: FormData, calculationResult: CalculationResult, insightType: string): string {
  const baseContext = `
Property Management Portfolio Analysis:
- Portfolio Size: ${formData.portfolioSize} properties
- Selected Roles: ${Object.keys(formData.selectedRoles).filter(role => formData.selectedRoles[role as keyof typeof formData.selectedRoles]).join(', ')}
- Total Team Size: ${Object.values(formData.teamSize).reduce((sum, size) => sum + size, 0)} people
- Experience Level: ${formData.experienceLevel}
- Annual Savings: $${calculationResult?.totalSavings?.toLocaleString() || 'N/A'}
- ROI: ${calculationResult?.estimatedROI || 'N/A'}%
`;

  switch (insightType) {
    case 'implementation_strategy':
      return `${baseContext}

Based on this property management portfolio data, provide a practical 4-step implementation strategy for offshore team scaling. Focus on:
1. Immediate next steps (first 30 days)
2. Team setup and training approach
3. Process optimization recommendations
4. Success metrics to track

Keep the response under 200 words and actionable.`;

    case 'risk_assessment':
      return `${baseContext}

Analyze potential risks and mitigation strategies for this offshore scaling plan. Consider:
1. Top 3 implementation risks
2. Mitigation strategies for each risk
3. Timeline considerations
4. Success probability assessment

Keep the response under 200 words and practical.`;

    case 'cost_optimization':
      return `${baseContext}

Provide cost optimization recommendations for this offshore team structure:
1. Areas for additional savings
2. Team size optimization suggestions
3. Phase-in approach to minimize risk
4. Budget allocation recommendations

Keep the response under 200 words and specific.`;

    default:
      return `${baseContext}

Provide personalized insights and recommendations for this offshore scaling plan. Include actionable next steps and key considerations for success.`;
  }
} 