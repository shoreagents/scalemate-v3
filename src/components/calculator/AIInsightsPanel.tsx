'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, TrendingUp, Shield, DollarSign, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAIInsights } from '@/hooks/useAIInsights';
import { FormData, CalculationResult } from '@/types/calculator';

interface AIInsightsPanelProps {
  formData: FormData;
  calculationResult: CalculationResult;
  className?: string;
}

export function AIInsightsPanel({ formData, calculationResult, className }: AIInsightsPanelProps) {
  const { insights, loading, errors, generateInsight, hasInsight } = useAIInsights();

  const insightTypes = [
    {
      id: 'implementation_strategy',
      title: 'Implementation Strategy',
      icon: TrendingUp,
      description: 'Get AI-powered step-by-step implementation plan',
      color: 'from-neural-blue-500 to-neural-blue-600'
    },
    {
      id: 'risk_assessment',
      title: 'Risk Assessment',
      icon: Shield,
      description: 'AI analysis of potential risks and mitigation strategies',
      color: 'from-quantum-purple-500 to-quantum-purple-600'
    },
    {
      id: 'cost_optimization',
      title: 'Cost Optimization',
      icon: DollarSign,
      description: 'AI recommendations for additional cost savings',
      color: 'from-cyber-green-500 to-cyber-green-600'
    }
  ];

  const handleGenerateInsight = async (insightType: string) => {
    await generateInsight(formData, calculationResult, insightType);
  };

  return (
    <Card 
      variant="neural-elevated" 
      className={`p-6 ${className}`}
      aiPowered={true}
      neuralGlow={true}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 rounded-lg">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-headline-3 text-neural-blue-900 font-display">
            AI-Powered Insights
          </h3>
          <p className="text-body-small text-neural-blue-600">
            Get personalized recommendations based on your data
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {insightTypes.map((insightType) => (
          <motion.div
            key={insightType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="quantum-glass" className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-r ${insightType.color} rounded-lg`}>
                    <insightType.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-body font-semibold text-neural-blue-900">
                      {insightType.title}
                    </h4>
                    <p className="text-body-small text-neural-blue-600">
                      {insightType.description}
                    </p>
                  </div>
                </div>

                {!hasInsight(insightType.id) && (
                  <Button
                    variant="neural-primary"
                    size="neural-sm"
                    onClick={() => handleGenerateInsight(insightType.id)}
                    disabled={loading[insightType.id]}
                    aiAssisted={true}
                    leftIcon={
                      loading[insightType.id] ? 
                        <Loader2 className="h-3 w-3 animate-spin" /> : 
                        <Sparkles className="h-3 w-3" />
                    }
                  >
                    {loading[insightType.id] ? 'Generating...' : 'Generate'}
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {hasInsight(insightType.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 p-4 bg-neural-blue-50 rounded-lg"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <Brain className="h-4 w-4 text-neural-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-body-small font-medium text-neural-blue-800 mb-1">
                          AI Recommendation
                        </p>
                        <div className="text-body-small text-neural-blue-700 whitespace-pre-wrap">
                          {insights[insightType.id]?.insight}
                        </div>
                      </div>
                    </div>
                    <div className="text-caption text-neural-blue-500 mt-2">
                      Generated {insights[insightType.id]?.generatedAt ? 
                        new Date(insights[insightType.id]!.generatedAt).toLocaleString() : 
                        'Unknown time'}
                    </div>
                  </motion.div>
                )}

                {errors[insightType.id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-body-small text-red-700">
                      Failed to generate insight: {errors[insightType.id]}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-neural-blue-600" />
          <span className="text-body-small font-medium text-neural-blue-800">
            Powered by Claude AI
          </span>
        </div>
        <p className="text-caption text-neural-blue-600">
          These insights are generated using advanced AI analysis of your specific portfolio data 
          and industry best practices.
        </p>
      </div>
    </Card>
  );
} 