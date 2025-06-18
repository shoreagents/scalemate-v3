'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RoleId, ExperienceLevel } from '@/types';
import { ROLES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';
import { Check, Users, DollarSign, Clock, Award, Target, Lightbulb, GraduationCap } from 'lucide-react';

interface ExperienceStepProps {
  value: ExperienceLevel | '';
  selectedRoles: Record<RoleId, boolean>;
  teamSize: Record<RoleId, number>;
  onChange: (value: ExperienceLevel) => void;
  onCalculate: () => void;
  isCalculating: boolean;
}

export function ExperienceStep({ 
  value, 
  selectedRoles, 
  teamSize, 
  onChange, 
  onCalculate, 
  isCalculating 
}: ExperienceStepProps) {
  
  const activeRoles = Object.entries(selectedRoles)
    .filter(([_, isSelected]) => isSelected)
    .map(([roleId]) => roleId as RoleId);

  const totalTeamMembers = activeRoles.reduce((total, roleId) => total + teamSize[roleId], 0);

  const experienceLevels: Array<{
    level: ExperienceLevel;
    title: string;
    icon: React.ReactNode;
    description: string;
    details: string;
    pros: string[];
    timeToProductivity: string;
    salaryRange: string;
    bestFor: string;
    color: string;
  }> = [
    {
      level: 'entry',
      title: 'Entry Level',
      icon: <Lightbulb className="w-8 h-8" />,
      description: 'Fresh graduates and professionals with 0-2 years of experience',
      details: 'Perfect for businesses looking to build a cost-effective team while providing growth opportunities.',
      pros: [
        'Most cost-effective option',
        'High motivation and eagerness to learn',
        'Fresh perspectives and adaptability',
        'Long-term growth potential'
      ],
      timeToProductivity: '2-3 months',
      salaryRange: '$12,000 - $18,000 annually',
      bestFor: 'Standard processes, routine tasks, growing businesses',
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      level: 'moderate',
      title: 'Mid-Level',
      icon: <Target className="w-8 h-8" />,
      description: 'Professionals with 2-5 years of experience and proven skills',
      details: 'The sweet spot of experience and cost - capable of handling complex tasks with minimal supervision.',
      pros: [
        'Proven track record and reliability',
        'Can work independently',
        'Mentoring capability for junior staff',
        'Balanced cost-to-value ratio'
      ],
      timeToProductivity: '4-6 weeks',
      salaryRange: '$18,000 - $25,000 annually',
      bestFor: 'Complex processes, team leadership, established businesses',
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      level: 'experienced',
      title: 'Senior Level',
      icon: <Award className="w-8 h-8" />,
      description: 'Seasoned professionals with 5+ years and specialized expertise',
      details: 'Top-tier talent ready to drive results from day one with strategic thinking and leadership skills.',
      pros: [
        'Immediate productivity and impact',
        'Strategic thinking and problem-solving',
        'Leadership and team development',
        'Industry expertise and best practices'
      ],
      timeToProductivity: '1-2 weeks',
      salaryRange: '$25,000 - $35,000 annually',
      bestFor: 'Strategic initiatives, complex projects, rapid scaling',
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    }
  ];

  const getEstimatedSavings = (level: ExperienceLevel) => {
    const baseSavings = {
      entry: 70000,
      moderate: 85000,
      experienced: 100000
    };
    return baseSavings[level] * totalTeamMembers;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-16 h-16 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Choose Experience Level</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Select the experience level that best fits your needs and budget for your offshore team.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
          <Users className="w-4 h-4 mr-2" />
          Building team of {totalTeamMembers} member{totalTeamMembers > 1 ? 's' : ''} across {activeRoles.length} role{activeRoles.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Experience Level Options */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {experienceLevels.map((option, index) => {
          const isSelected = value === option.level;
          const estimatedSavings = getEstimatedSavings(option.level);

          return (
            <motion.div
              key={option.level}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'transform scale-105 shadow-lg ring-2 ring-indigo-500' 
                  : 'hover:shadow-md hover:transform hover:scale-102'
              }`}
              onClick={() => onChange(option.level)}
            >
              <div className={`p-6 rounded-xl border-2 h-full ${
                isSelected ? option.color.replace('50', '100').replace('200', '300') : option.color
              }`}>
                {/* Selection Indicator */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-white' : 'bg-white/70'}`}>
                    {option.icon}
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                <p className="text-sm mb-4 opacity-90">{option.description}</p>
                <p className="text-xs mb-4 opacity-75">{option.details}</p>

                {/* Key Metrics */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Time to Productivity
                    </span>
                    <span className="font-medium">{option.timeToProductivity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Salary Range
                    </span>
                    <span className="font-medium">{option.salaryRange}</span>
                  </div>
                </div>

                {/* Estimated Savings */}
                <div className="bg-white/70 p-3 rounded-lg mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      ${estimatedSavings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600">Annual savings estimate</div>
                  </div>
                </div>

                {/* Best For */}
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Best for:</h4>
                  <p className="text-xs opacity-75">{option.bestFor}</p>
                </div>

                {/* Pros */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Key advantages:</h4>
                  <ul className="space-y-1">
                    {option.pros.slice(0, 3).map((pro, proIndex) => (
                      <li key={proIndex} className="text-xs opacity-75 flex items-start">
                        <span className="text-green-500 mr-1">•</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200"
        >
          <h3 className="font-semibold text-gray-900 mb-4">Your Selection Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{value.charAt(0).toUpperCase() + value.slice(1)}</div>
              <div className="text-sm text-gray-600">Experience Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalTeamMembers}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${getEstimatedSavings(value).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Annual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {experienceLevels.find(l => l.level === value)?.timeToProductivity}
              </div>
              <div className="text-sm text-gray-600">To Productivity</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Calculate Button */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Button
            onClick={onCalculate}
            disabled={isCalculating}
            className="px-8 py-4 text-lg"
            size="lg"
          >
            {isCalculating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Calculating Your Savings...
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5 mr-2" />
                Calculate My Detailed Savings
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Get your personalized offshore scaling report
          </p>
        </motion.div>
      )}
    </div>
  );
} 