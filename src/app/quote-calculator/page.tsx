'use client';

import { OffshoreCalculator } from '@/components/calculator/OffshoreCalculator';

export default function CalculatorPage() {

  return (
    <div className="py-12 relative">
      {/* Background pattern */}
      <div className="fixed inset-0 pattern-neural-grid opacity-10 pointer-events-none" />
      
      <div className="px-6 mx-auto max-w-7xl lg:px-8 relative z-10">
        <OffshoreCalculator 
          className="mb-12"
        />
      </div>
    </div>
  );
} 