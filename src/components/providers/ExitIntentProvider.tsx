'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ExitIntentPopup } from '@/components/common/ExitIntentPopup';
import { useExitIntent } from '@/hooks/useExitIntent';
import { analytics } from '@/utils/analytics';

interface ExitIntentContextType {
  showPopup: () => void;
  hidePopup: () => void;
  isVisible: boolean;
  hasShown: boolean;
  disable: () => void;
  reset: () => void;
}

const ExitIntentContext = createContext<ExitIntentContextType | undefined>(undefined);

export function useExitIntentContext() {
  const context = useContext(ExitIntentContext);
  if (!context) {
    throw new Error('useExitIntentContext must be used within ExitIntentProvider');
  }
  return context;
}

interface ExitIntentProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function ExitIntentProvider({ children, enabled = true }: ExitIntentProviderProps) {
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [calculationResult, setCalculationResult] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);
    // Initialize analytics if not already done
    if (typeof window !== 'undefined') {
      analytics.init();
    }
  }, []);

  // Global exit intent detection
  const { hasShown, disable, reset } = useExitIntent({
    enabled: enabled && isClient && !showExitPopup,
    threshold: 10,
    delay: 3000,
    onExitIntent: () => {
      console.log('🚨 Global exit intent triggered!');
      analytics.trackEvent('exit_intent', { 
        page: window.location.pathname,
        timestamp: new Date().toISOString()
      });
      setShowExitPopup(true);
    }
  });

  const showPopup = () => {
    console.log('🚨 Manually showing exit popup');
    setShowExitPopup(true);
  };

  const hidePopup = () => {
    console.log('❌ Hiding exit popup');
    setShowExitPopup(false);
    analytics.trackEvent('exit_popup_close', {
      page: window.location.pathname
    });
  };

  const handleLeadSubmit = async (leadData: any) => {
    try {
      console.log('📧 Submitting lead from global popup:', leadData);
      await analytics.submitLead(leadData);
      analytics.trackEvent('form_submit', { 
        source: 'global_exit_intent', 
        page: window.location.pathname,
        leadData 
      });
      setShowExitPopup(false);
    } catch (error) {
      console.error('❌ Failed to submit lead:', error);
      analytics.trackEvent('error', { 
        type: 'lead_submission_error',
        page: window.location.pathname,
        error: error?.toString() 
      });
    }
  };

  const contextValue: ExitIntentContextType = {
    showPopup,
    hidePopup,
    isVisible: showExitPopup,
    hasShown,
    disable,
    reset
  };

  return (
    <ExitIntentContext.Provider value={contextValue}>
      {children}
      
      {/* Global Exit Intent Popup - only render on client */}
      {isClient && (
        <>
          <ExitIntentPopup
            isVisible={showExitPopup}
            onClose={hidePopup}
            onSubmit={handleLeadSubmit}
            calculationResult={calculationResult}
          />
          
          {/* Debug info in development - moved to bottom left */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white p-3 rounded-lg text-xs z-50 border border-neural-blue-600/30">
              <div><strong>🎯 Exit Intent:</strong> {hasShown ? 'Shown' : 'Waiting'}</div>
              <div><strong>👁️ Popup:</strong> {showExitPopup ? 'Visible' : 'Hidden'}</div>
              <div><strong>📍 Page:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'Unknown'}</div>
              <div><strong>📊 Session:</strong> {analytics.getSessionId()?.slice(-8) || 'None'}</div>
              <button 
                onClick={showPopup}
                className="mt-2 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors duration-200"
              >
                🚨 Test Popup
              </button>
            </div>
          )}
          
          {/* Back to Top Button - bottom right */}
          <div className="fixed bottom-4 right-4 z-50">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                analytics.trackEvent('back_to_top_click', { 
                  page: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
                });
              }}
              className="group bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white p-3 rounded-xl shadow-lg hover:shadow-neural-glow transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neural-blue-500/50 focus:ring-offset-2"
              aria-label="Back to top"
            >
              <svg 
                className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-200" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </>
      )}
    </ExitIntentContext.Provider>
  );
} 