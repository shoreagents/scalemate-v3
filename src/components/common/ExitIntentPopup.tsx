'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Target, Calendar, Star, CheckCircle2, ArrowRight, ChevronDown } from 'lucide-react';

interface ExitIntentPopupProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (data: LeadData) => void;
  calculationResult?: {
    totalSavings: number;
    totalTeamSize: number;
    portfolioSize: string;
  } | undefined;
}

interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  urgency: 'ASAP - Need to start within 2 weeks' | 'Next Month - Planning for 30-day start' | 'Next Quarter - 60-90 day timeline' | 'Just Exploring - Future consideration';
  source: 'exit_intent';
  sessionId: string;
  calculatorData?: any;
}

export function ExitIntentPopup({ isVisible, onClose, onSubmit, calculationResult }: ExitIntentPopupProps) {
  const [formData, setFormData] = useState<Partial<LeadData>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    urgency: 'Next Month - Planning for 30-day start',
    source: 'exit_intent',
    sessionId: typeof window !== 'undefined' ? sessionStorage.getItem('calculatorSessionId') || '' : ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (field: keyof LeadData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.email) return;

    setIsSubmitting(true);
    
    try {
      const leadData: LeadData = {
        firstName: formData.firstName!,
        lastName: formData.lastName || '',
        email: formData.email!,
        phone: formData.phone || '',
        company: formData.company || '',
        urgency: formData.urgency!,
        source: 'exit_intent',
        sessionId: formData.sessionId!,
        calculatorData: calculationResult
      };

      await onSubmit(leadData);
      setIsSubmitted(true);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit lead:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md mx-4"
            >
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600 mb-4">
                  We'll be in touch within 24 hours to discuss your offshore scaling strategy.
                </p>
                <div className="text-sm text-gray-500">
                  Check your email for next steps...
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg my-8 sm:my-4"
            >
            <Card className="p-6 relative">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Wait! Don't Miss Out
                </h2>
                <p className="text-gray-600">
                  You're minutes away from transforming your property management operations.
                  {calculationResult && (
                    <span className="block mt-2 font-semibold text-green-600">
                      Save ${calculationResult.totalSavings.toLocaleString()}/year with {calculationResult.totalTeamSize} offshore team members
                    </span>
                  )}
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-blue-900">Free Strategy Call</div>
                  <div className="text-xs text-blue-600">Personalized plan</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-green-900">Proven Process</div>
                  <div className="text-xs text-green-600">100+ successful implementations</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-purple-900">Fast Results</div>
                  <div className="text-xs text-purple-600">Start saving in 30 days</div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+61 123 456 789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="ABC Property Management"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Implementation Timeline
                  </label>
                  <div className="relative">
                    <select
                      value={formData.urgency}
                      onChange={(e) => handleInputChange('urgency', e.target.value)}
                      className="w-full px-3 py-2 pr-8 border border-neural-blue-200 rounded-lg focus:ring-2 focus:ring-neural-blue-500 focus:border-neural-blue-500 bg-white appearance-none cursor-pointer"
                    >
                      <option value="ASAP - Need to start within 2 weeks">ASAP - Need to start within 2 weeks</option>
                      <option value="Next Month - Planning for 30-day start">Next Month - Planning for 30-day start</option>
                      <option value="Next Quarter - 60-90 day timeline">Next Quarter - 60-90 day timeline</option>
                      <option value="Just Exploring - Future consideration">Just Exploring - Future consideration</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neural-blue-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                  <Button
                    type="button"
                    variant="quantum-outline"
                    size="neural-md"
                    onClick={onClose}
                    className="flex-1 min-w-0"
                  >
                    Maybe Later
                  </Button>
                  <Button
                    type="submit"
                    variant="neural-primary"
                    size="neural-md"
                    disabled={isSubmitting || !formData.firstName || !formData.email}
                    className="flex-1 min-w-0"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Strategy Call'}
                  </Button>
                </div>
              </form>

              {/* Trust indicators */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    No spam, ever
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Unsubscribe anytime
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    Free consultation
                  </div>
                </div>
              </div>
            </Card>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 