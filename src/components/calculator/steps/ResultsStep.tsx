'use client';

import React from 'react';

export function ResultsStep() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">Results</h1>
                      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Summary</h2>
        <p>Annual Savings: $12,000</p>
        <p>Local Cost: $30,000</p>
        <p>Philippines Cost: $18,000</p>
                                </div>
                      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Team Breakdown</h2>
        <ul>
          <li className="mb-1"><strong>Role 1:</strong> 2 members</li>
          <li className="mb-1"><strong>Role 2:</strong> 1 member</li>
                                  </ul>
                </div>
                <button
        className="mt-6 px-4 py-2 bg-gray-900 text-white"
                >
        Restart Calculator
                </button>
  </div>
  );
}
