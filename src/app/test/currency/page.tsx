'use client';

import React, { useState, useEffect } from 'react';
import { 
  getCurrencySymbol, 
  getCurrencyByCountry, 
  getCurrencyMultiplier,
  getLiveExchangeRateMultiplier,
  getBestExchangeRateMultiplier,
  clearExchangeRateCache
} from '@/utils/currency';

interface TestResult {
  currency: string;
  symbol: string;
  staticRate: number;
  liveRate?: number;
  bestRate?: number;
  error?: string;
  duration?: number;
}

export default function CurrencyTestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([
    'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 'ZAR'
  ]);

  const testCurrencies = [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'BRL', 
    'ZAR', 'SGD', 'HKD', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF',
    'RUB', 'TRY', 'MXN', 'KRW', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'PKR'
  ];

  const testCountries = [
    { name: 'United States', expectedCurrency: 'USD' },
    { name: 'Germany', expectedCurrency: 'EUR' },
    { name: 'United Kingdom', expectedCurrency: 'GBP' },
    { name: 'Japan', expectedCurrency: 'JPY' },
    { name: 'Australia', expectedCurrency: 'AUD' },
    { name: 'Canada', expectedCurrency: 'CAD' },
    { name: 'Singapore', expectedCurrency: 'SGD' },
    { name: 'India', expectedCurrency: 'INR' },
    { name: 'Brazil', expectedCurrency: 'BRL' },
    { name: 'South Africa', expectedCurrency: 'ZAR' }
  ];

  const testAllCurrencies = async () => {
    setLoading(true);
    setResults([]);
    
    const testResults: TestResult[] = [];
    
    for (const currency of selectedCurrencies) {
      const startTime = Date.now();
      const result: TestResult = {
        currency,
        symbol: getCurrencySymbol(currency),
        staticRate: getCurrencyMultiplier(currency)
      };
      
      try {
        // Test live API
        result.liveRate = await getLiveExchangeRateMultiplier(currency, baseCurrency);
        
        // Test best rate function
        result.bestRate = await getBestExchangeRateMultiplier(currency, baseCurrency);
        
        result.duration = Date.now() - startTime;
      } catch (error) {
        result.error = error instanceof Error ? error.message : 'Unknown error';
        result.duration = Date.now() - startTime;
      }
      
      testResults.push(result);
      setResults([...testResults]); // Update UI progressively
    }
    
    setLoading(false);
  };

  const testCountryToCurrency = () => {
    const countryResults = testCountries.map(({ name, expectedCurrency }) => {
      const detectedCurrency = getCurrencyByCountry(name);
      return {
        country: name,
        expected: expectedCurrency,
        detected: detectedCurrency,
        correct: detectedCurrency === expectedCurrency
      };
    });
    
    console.log('Country to Currency Test Results:', countryResults);
    alert(`Country Test Results:\n${countryResults.map(r => 
      `${r.country}: ${r.detected} ${r.correct ? '✅' : '❌'}`
    ).join('\n')}`);
  };

  const clearCache = () => {
    clearExchangeRateCache();
    alert('Exchange rate cache cleared! Next test will fetch fresh data.');
  };

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies(prev => 
      prev.includes(currency) 
        ? prev.filter(c => c !== currency)
        : [...prev, currency]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Currency API Test Dashboard
          </h1>
          
          {/* Test Controls */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Currency
                </label>
                <select
                  value={baseCurrency}
                  onChange={(e) => setBaseCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {testCurrencies.map(currency => (
                    <option key={currency} value={currency}>
                      {currency} ({getCurrencySymbol(currency)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Currencies ({selectedCurrencies.length})
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {testCurrencies.map(currency => (
                    <label key={currency} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedCurrencies.includes(currency)}
                        onChange={() => toggleCurrency(currency)}
                        className="rounded"
                      />
                      <span>{currency} ({getCurrencySymbol(currency)})</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <button
                  onClick={testAllCurrencies}
                  disabled={loading || selectedCurrencies.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Testing...' : 'Test Exchange Rates'}
                </button>
                
                <button
                  onClick={testCountryToCurrency}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Test Country Detection
                </button>
                
                <button
                  onClick={clearCache}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>

          {/* Test Results */}
          {results.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Test Results ({results.length}/{selectedCurrencies.length})
              </h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Static Rate
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Live Rate
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Best Rate
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Difference
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={result.currency} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {result.currency}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.symbol}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.staticRate.toFixed(4)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.liveRate ? result.liveRate.toFixed(4) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.bestRate ? result.bestRate.toFixed(4) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {result.liveRate ? (
                            <span className={`${
                              Math.abs(result.liveRate - result.staticRate) > result.staticRate * 0.05
                                ? 'text-red-600 font-medium'
                                : 'text-green-600'
                            }`}>
                              {(((result.liveRate - result.staticRate) / result.staticRate) * 100).toFixed(2)}%
                            </span>
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {result.duration ? `${result.duration}ms` : 'N/A'}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          {result.error ? (
                            <span className="text-red-600">❌ Error</span>
                          ) : result.liveRate ? (
                            <span className="text-green-600">✅ Live</span>
                          ) : (
                            <span className="text-yellow-600">⚠️ Static</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-blue-500">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Testing Exchange Rates...
              </div>
            </div>
          )}

          {/* API Information */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              API Test Information
            </h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Live APIs:</strong> Fawaz Ahmed → Cloudflare → ExchangeRate.host</p>
              <p>• <strong>Cache:</strong> 24-hour localStorage cache for performance</p>
              <p>• <strong>Fallback:</strong> Static 2025 exchange rates if all APIs fail</p>
              <p>• <strong>Timeout:</strong> 5 seconds per API request</p>
              <p>• <strong>Base Currency:</strong> All rates converted from {baseCurrency}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 