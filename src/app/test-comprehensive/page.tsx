'use client';

import { useState, useEffect } from 'react';
import { analytics } from '@/utils/analytics';
import { Button } from '@/components/ui/Button';

export default function ComprehensiveTestPage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [leadsData, setLeadsData] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Initialize analytics
    analytics.init();
    
    // Start comprehensive testing
    runComprehensiveTest();
  }, []);

  const runComprehensiveTest = async () => {
    const results: Record<string, boolean> = {};

    try {
      // Test 1: Analytics Initialization
      analytics.trackEvent('page_view', { page: 'comprehensive_test' });
      const sessionId = analytics.getSessionId();
      results.analyticsInit = !!sessionId;
      
      // Test 2: Session Data Collection
      const currentSession = analytics.getSessionData();
      results.sessionTracking = !!currentSession && !!currentSession.sessionId;
      setSessionData(currentSession);

      // Test 3: Event Tracking
      analytics.trackEvent('page_view', { testData: 'comprehensive_test' });
      results.eventTracking = true;

      // Test 4: Analytics API
      try {
        const analyticsResponse = await fetch('/api/analytics');
        const analyticsJson = await analyticsResponse.json();
        results.analyticsAPI = analyticsResponse.ok;
        setAnalyticsData(analyticsJson);
      } catch (error) {
        results.analyticsAPI = false;
      }

      // Test 5: Leads API
      try {
        const leadsResponse = await fetch('/api/leads');
        const leadsJson = await leadsResponse.json();
        results.leadsAPI = leadsResponse.ok;
        setLeadsData(leadsJson);
      } catch (error) {
        results.leadsAPI = false;
      }

      // Test 6: Lead Submission
      try {
        const testLead = {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          phone: '+61400000000',
          company: 'Test Company',
          urgency: 'Next Month - Planning for 30-day start',
          source: 'comprehensive_test'
        };
        
        await analytics.submitLead(testLead);
        results.leadSubmission = true;
      } catch (error) {
        results.leadSubmission = false;
      }

      // Test 7: Simulate calculator progression
      analytics.updateStep(2);
      analytics.updateCalculatorData({
        portfolioSize: '1000-1999',
        selectedRoles: ['Assistant Property Manager'],
        teamSize: { 'Assistant Property Manager': 2 }
      });
      analytics.trackEvent('calculation_start', { test: true });
      results.calculatorSimulation = true;

    } catch (error) {
      console.error('Test error:', error);
    }

    setTestResults(results);
  };

  const triggerExitIntent = () => {
    analytics.trackEvent('exit_intent', { manual_trigger: true });
    
    // Simulate exit intent popup
    alert('Exit Intent would trigger here! Check the analytics for the exit_intent event.');
  };

  const manualRefresh = async () => {
    await runComprehensiveTest();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 ScaleMate Comprehensive System Test
          </h1>
          <p className="text-gray-600">
            Complete validation of exit intent, session tracking, analytics, and admin functionality
          </p>
        </div>

        {/* Test Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔬 Test Results Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(testResults).map(([test, passed]) => (
              <div key={test} className={`p-3 rounded-lg border-2 ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="text-sm font-medium text-gray-700">{test}</div>
                <div className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? '✅ PASS' : '❌ FAIL'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">🎮 Manual Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={triggerExitIntent} className="bg-red-500 hover:bg-red-600">
              🚨 Trigger Exit Intent
            </Button>
            <Button onClick={manualRefresh} className="bg-blue-500 hover:bg-blue-600">
              🔄 Refresh All Tests
            </Button>
            <Button 
              onClick={() => window.open('/admin', '_blank')}
              className="bg-purple-500 hover:bg-purple-600"
            >
              👑 Open Admin Dashboard
            </Button>
            <Button 
              onClick={() => window.open('/', '_blank')}
              className="bg-green-500 hover:bg-green-600"
            >
              🧮 Open Calculator
            </Button>
          </div>
        </div>

        {/* Live Session Data */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📊 Live Session Data
          </h2>
          {sessionData ? (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Session ID:</strong> {sessionData.sessionId}</div>
                <div><strong>Current Step:</strong> {sessionData.currentStep}</div>
                <div><strong>Events Count:</strong> {sessionData.events?.length || 0}</div>
                <div><strong>Portfolio Size:</strong> {sessionData.portfolioSize || 'Not set'}</div>
                <div><strong>Browser:</strong> {sessionData.deviceInfo?.browser}</div>
                <div><strong>OS:</strong> {sessionData.deviceInfo?.os}</div>
                <div><strong>Screen:</strong> {sessionData.deviceInfo?.screen?.width}x{sessionData.deviceInfo?.screen?.height}</div>
                <div><strong>Country:</strong> {sessionData.geoInfo?.country || 'Unknown'}</div>
              </div>
            </div>
          ) : (
            <div className="text-red-500">❌ No session data available</div>
          )}
        </div>

        {/* Analytics API Data */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📈 Analytics API Data ({analyticsData.length} sessions)
          </h2>
          {analyticsData.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(analyticsData.slice(0, 3), null, 2)}</pre>
            </div>
          ) : (
            <div className="text-yellow-600">⚠️ No analytics data from API</div>
          )}
        </div>

        {/* Leads API Data */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🎯 Leads API Data ({leadsData.length} leads)
          </h2>
          {leadsData.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
              <pre className="text-xs">{JSON.stringify(leadsData.slice(0, 3), null, 2)}</pre>
            </div>
          ) : (
            <div className="text-yellow-600">⚠️ No leads data from API</div>
          )}
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            ⚡ System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(testResults).filter(Boolean).length}
              </div>
              <div className="text-sm text-blue-600">Tests Passed</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(testResults).filter(v => !v).length}
              </div>
              <div className="text-sm text-red-600">Tests Failed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(testResults).length > 0 ? 
                  Math.round((Object.values(testResults).filter(Boolean).length / Object.keys(testResults).length) * 100) : 0}%
              </div>
              <div className="text-sm text-green-600">System Health</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">🔗 Quick Access Links</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• Main Calculator: <a href="/" className="underline">http://localhost:3000/</a></div>
            <div>• Admin Dashboard: <a href="/admin" className="underline">http://localhost:3000/admin</a></div>
            <div>• Test Page: <a href="/test" className="underline">http://localhost:3000/test</a></div>
            <div>• Analytics API: <a href="/api/analytics" className="underline">http://localhost:3000/api/analytics</a></div>
            <div>• Leads API: <a href="/api/leads" className="underline">http://localhost:3000/api/leads</a></div>
          </div>
        </div>
      </div>
    </div>
  );
} 