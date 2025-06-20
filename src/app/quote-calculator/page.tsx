'use client';

import { useState } from 'react';
import { OffshoreCalculator } from '@/components/calculator/OffshoreCalculator';
import { CalculationResult } from '@/types';

export default function CalculatorPage() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);

  const handleCalculatorComplete = (result: CalculationResult) => {
    setCalculationResult(result);
  };

  return (
    <div className="py-12 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 pattern-neural-grid opacity-10 pointer-events-none" />
      
      <div className="px-6 mx-auto max-w-7xl lg:px-8 relative z-10">
        <OffshoreCalculator 
          onComplete={handleCalculatorComplete}
          className="mb-12"
        />
      </div>
    </div>
  );
} 