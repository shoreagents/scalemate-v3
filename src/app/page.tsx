'use client';

import { useState } from 'react';
import { OffshoreCalculator } from '@/components/calculator/OffshoreCalculator';
import { CalculationResult } from '@/types';

export default function HomePage() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const handleStartCalculator = () => {
    setShowCalculator(true);
  };

  const handleCalculatorComplete = (result: CalculationResult) => {
    setCalculationResult(result);
  };

  if (showCalculator) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-brand-primary-50 via-white to-brand-secondary-50 py-12">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <OffshoreCalculator 
            onComplete={handleCalculatorComplete}
            className="mb-12"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-primary-50 via-white to-brand-secondary-50">
      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 mx-auto max-w-7xl lg:px-8">
        <div className="absolute inset-0 bg-mesh-gradient opacity-30" />
        
        <div className="relative z-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="p-4 rounded-2xl bg-white/80 backdrop-blur-md shadow-brand">
              <div className="h-12 w-48 bg-gradient-to-r from-brand-primary-500 to-brand-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ScaleMate</span>
              </div>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-display-2 gradient-text mb-6 text-balance">
            Scale Smart. Save More.
            <br />
            Succeed Faster.
          </h1>

          <p className="text-body-large text-neutral-600 mb-8 max-w-2xl mx-auto text-balance">
            Discover the exact savings you'll unlock by scaling your property management team offshore. 
            Get your personalized analysis in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button 
              onClick={handleStartCalculator}
              className="btn-primary interactive-scale"
            >
              Calculate Your Savings
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            
            <button className="btn-ghost interactive-scale">
              Watch Demo
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              100% Free Calculator
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Email Required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Instant Results
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-6 py-16 mx-auto max-w-7xl lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-headline-1 text-neutral-900 mb-4">
            Intelligent Offshore Scaling
          </h2>
          <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
            Our smart calculator analyzes your portfolio size, team structure, and tasks to deliver 
            precise savings projections.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature Card 1 */}
          <div className="card-elevated interactive-lift">
            <div className="w-12 h-12 rounded-lg bg-brand-primary-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-headline-3 text-neutral-900 mb-2">Portfolio Analysis</h3>
            <p className="text-body text-neutral-600">
              Input your portfolio size and get tailored recommendations for your offshore team structure.
            </p>
          </div>

          {/* Feature Card 2 */}
          <div className="card-elevated interactive-lift">
            <div className="w-12 h-12 rounded-lg bg-brand-secondary-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-headline-3 text-neutral-900 mb-2">Role Optimization</h3>
            <p className="text-body text-neutral-600">
              Select from property management roles and see precise cost savings for each position.
            </p>
          </div>

          {/* Feature Card 3 */}
          <div className="card-elevated interactive-lift">
            <div className="w-12 h-12 rounded-lg bg-brand-accent-100 flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-brand-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-headline-3 text-neutral-900 mb-2">Instant Results</h3>
            <p className="text-body text-neutral-600">
              Get detailed savings breakdown, ROI projections, and implementation timelines instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-16 mx-auto max-w-7xl lg:px-8 bg-brand-primary-50">
        <div className="text-center">
          <h2 className="text-headline-2 text-neutral-900 mb-8">
            Trusted by Property Management Leaders
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
              <span className="text-neutral-500 font-medium">Company 1</span>
            </div>
            <div className="h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
              <span className="text-neutral-500 font-medium">Company 2</span>
            </div>
            <div className="h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
              <span className="text-neutral-500 font-medium">Company 3</span>
            </div>
            <div className="h-12 bg-neutral-200 rounded-lg flex items-center justify-center">
              <span className="text-neutral-500 font-medium">Company 4</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 mx-auto max-w-7xl lg:px-8">
        <div className="card-brand text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-headline-1 mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-body-large mb-8 opacity-90">
              Join thousands of property managers who've already discovered their offshore scaling potential.
            </p>
            <button 
              onClick={handleStartCalculator}
              className="bg-white text-brand-primary-600 hover:bg-brand-primary-50 px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Start Your Free Analysis
              <svg className="inline-block ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
} 