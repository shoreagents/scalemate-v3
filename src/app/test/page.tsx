'use client';

import { useState, useEffect } from 'react';
import { ExitIntentPopup } from '@/components/common/ExitIntentPopup';
import { useExitIntent } from '@/hooks/useExitIntent';
import { analytics } from '@/utils/analytics';

export default function TestPage() {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  // Initialize analytics
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { page: 'test' });
      setSessionData(analytics.getSessionData());
    }
  }, []);

  // Exit intent hook with test settings
  const { hasShown, reset } = useExitIntent({
    enabled: true,
    threshold: 200, // Higher threshold for easier testing
    delay: 2000, // 2 seconds
    onExitIntent: () => {
      console.log('Exit intent triggered on test page!');
      analytics.trackEvent('exit_intent', { page: 'test' });
      setShowExitPopup(true);
    }
  });

  const manualTriggerExitIntent = () => {
    console.log('Manually triggering exit intent');
    setShowExitPopup(true);
  };

  const resetExitIntent = () => {
    reset();
    setShowExitPopup(false);
  };

  const updateSessionData = () => {
    setSessionData(analytics.getSessionData());
  };

  return (
    <div className="bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Exit Intent & Session Tracking Test</h1>
        
        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="space-x-4">
            <button
              onClick={manualTriggerExitIntent}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Trigger Exit Intent Popup
            </button>
            <button
              onClick={resetExitIntent}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Reset Exit Intent
            </button>
            <button
              onClick={updateSessionData}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Refresh Session Data
            </button>
          </div>
        </div>

        {/* Exit Intent Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">How to Test Exit Intent</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Wait 2 seconds after loading this page</li>
            <li>Move your mouse to the very top of the browser window (address bar area)</li>
            <li>The exit intent popup should appear automatically</li>
            <li>Or click the "Trigger Exit Intent Popup" button for manual testing</li>
          </ol>
        </div>

        {/* Session Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Session Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Session ID:</strong> {analytics.getSessionId() || 'Not initialized'}
            </div>
            <div>
              <strong>Exit Intent Shown:</strong> {hasShown ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Popup Visible:</strong> {showExitPopup ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Analytics Initialized:</strong> {sessionData ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        {/* Session Data */}
        {sessionData && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Current Session Data</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>
        )}

        {/* Exit Intent Popup */}
        <ExitIntentPopup
          isVisible={showExitPopup}
          onClose={() => {
            setShowExitPopup(false);
            analytics.trackEvent('exit_popup_close', { page: 'test' });
          }}
          onSubmit={async (leadData) => {
            try {
              console.log('Test lead submission:', leadData);
              await analytics.submitLead(leadData);
              analytics.trackEvent('form_submit', { source: 'exit_intent_test', leadData });
              setShowExitPopup(false);
              alert('Test lead submitted successfully!');
            } catch (error) {
              console.error('Failed to submit test lead:', error);
              alert('Failed to submit test lead');
            }
          }}
          calculationResult={{
            totalSavings: 75000,
            totalTeamSize: 3,
            portfolioSize: '1000-1999'
          }}
        />
      </div>
    </div>
  );
} 