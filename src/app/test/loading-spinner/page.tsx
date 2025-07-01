'use client';

import React, { useState } from 'react';
import { 
  LoadingSpinner, 
  CalculatingSpinner, 
  AIProcessingSpinner, 
  SimpleLoadingDots, 
  InlineSpinner 
} from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Calculator, Brain, Settings } from 'lucide-react';

export default function LoadingSpinnerTestPage() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [showCalculating, setShowCalculating] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue-50 to-quantum-purple-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neural-blue-900 mb-4">
            LoadingSpinner Component Test
          </h1>
          <p className="text-lg text-neural-blue-700">
            Testing all variants of the reusable LoadingSpinner component
          </p>
        </div>

        {/* Overlay Controls */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neural-blue-900 mb-4">Overlay Variants</h2>
          <div className="flex gap-4">
            <Button
              onClick={() => setShowOverlay(true)}
              leftIcon={<Settings className="w-4 h-4" />}
            >
              Show Custom Overlay
            </Button>
            <Button
              onClick={() => setShowCalculating(true)}
              leftIcon={<Calculator className="w-4 h-4" />}
              variant="neural-primary"
            >
              Show Calculating Overlay
            </Button>
          </div>
        </Card>

        {/* All Variants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Minimal Variant */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-neural-blue-900 mb-4">Minimal Variant</h3>
            <div className="space-y-4">
              <InlineSpinner text="Loading..." />
              <LoadingSpinner variant="minimal" size="sm" text="Small" />
              <LoadingSpinner variant="minimal" size="md" text="Medium" />
              <LoadingSpinner variant="minimal" size="lg" text="Large" />
            </div>
          </Card>

          {/* Dots Variant */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-neural-blue-900 mb-4">Dots Variant</h3>
            <div className="space-y-4">
              <SimpleLoadingDots />
              <LoadingSpinner variant="dots" size="sm" text="Processing" />
              <LoadingSpinner variant="dots" size="md" text="Calculating" />
              <LoadingSpinner variant="dots" size="lg" text="Analyzing" />
            </div>
          </Card>

          {/* Spinner Variant */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-neural-blue-900 mb-4">Spinner Variant</h3>
            <div className="space-y-6">
              <LoadingSpinner 
                variant="spinner" 
                size="sm" 
                text="Small Spinner"
                subtext="Loading data..."
              />
              <LoadingSpinner 
                variant="spinner" 
                size="md" 
                text="Medium Spinner"
                subtext="Processing request..."
                icon={<Calculator className="w-6 h-6 text-white animate-neural-pulse" />}
              />
            </div>
          </Card>

          {/* AI Processing Variant */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-neural-blue-900 mb-4">AI Processing Variant</h3>
            <AIProcessingSpinner />
          </Card>

          {/* Custom Icons */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-neural-blue-900 mb-4">Custom Icons</h3>
            <div className="space-y-6">
              <LoadingSpinner 
                variant="spinner" 
                size="md" 
                text="Brain Processing"
                subtext="AI thinking..."
                icon={<Brain className="w-6 h-6 text-white animate-neural-pulse" />}
              />
              <LoadingSpinner 
                variant="spinner" 
                size="lg" 
                text="Calculator"
                subtext="Computing results..."
                icon={<Calculator className="w-8 h-8 text-white animate-neural-pulse" />}
              />
            </div>
          </Card>
        </div>

        {/* Size Comparison */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neural-blue-900 mb-4">Size Comparison</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h4 className="text-sm font-medium text-neural-blue-700 mb-2">Small</h4>
              <LoadingSpinner variant="spinner" size="sm" text="Small" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-neural-blue-700 mb-2">Medium</h4>
              <LoadingSpinner variant="spinner" size="md" text="Medium" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-neural-blue-700 mb-2">Large</h4>
              <LoadingSpinner variant="spinner" size="lg" text="Large" />
            </div>
            <div className="text-center">
              <h4 className="text-sm font-medium text-neural-blue-700 mb-2">Extra Large</h4>
              <LoadingSpinner variant="spinner" size="xl" text="XL" />
            </div>
          </div>
        </Card>

        {/* Code Examples */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold text-neural-blue-900 mb-4">Usage Examples</h2>
          <div className="space-y-4 text-sm">
            <div className="bg-neural-blue-50 p-4 rounded-lg">
              <code className="block text-neural-blue-800">
                {`// Simple inline spinner
<InlineSpinner text="Loading..." />

// Dots with text
<SimpleLoadingDots />

// Full AI processing spinner
<AIProcessingSpinner />

// Calculating overlay
<CalculatingSpinner show={isCalculating} subtext="Processing stage..." />

// Custom spinner
<LoadingSpinner 
  variant="spinner" 
  size="lg" 
  text="Custom Loading"
  subtext="Please wait..."
  icon={<Brain className="w-8 h-8 text-white animate-neural-pulse" />}
/>`}
              </code>
            </div>
          </div>
        </Card>
      </div>

      {/* Test Overlays */}
      <LoadingSpinner
        variant="overlay"
        size="lg"
        text="Custom Overlay Test"
        subtext="This is a custom overlay spinner"
        show={showOverlay}
        icon={<Settings className="w-8 h-8 text-white animate-neural-pulse" />}
      />

      <CalculatingSpinner
        show={showCalculating}
        subtext="Computing your offshore savings..."
      />

      {/* Close overlay buttons (for testing) */}
      {showOverlay && (
        <div className="fixed bottom-4 right-4 z-[60]">
          <Button onClick={() => setShowOverlay(false)}>Close Overlay</Button>
        </div>
      )}

      {showCalculating && (
        <div className="fixed bottom-4 left-4 z-[60]">
          <Button onClick={() => setShowCalculating(false)}>Close Calculating</Button>
        </div>
      )}
    </div>
  );
} 