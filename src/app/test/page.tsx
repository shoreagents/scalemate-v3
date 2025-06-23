'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ExitIntentPopup } from '@/components/common/ExitIntentPopup';
import { useExitIntent } from '@/hooks/useExitIntent';
import { analytics } from '@/utils/analytics';
import { 
  MapPin, 
  Globe, 
  TestTube, 
  Activity, 
  Zap, 
  Brain, 
  Home,
  ExternalLink,
  Play,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

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
    threshold: 200,
    delay: 2000,
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

  const testPages = [
    {
      title: 'Location Test',
      description: 'Comprehensive location tracking and IP geolocation testing using ipapi.co service',
      href: '/test/location' as const,
      icon: MapPin,
      color: 'blue' as const,
      features: ['IP Detection', 'Geolocation', 'Timezone Info', 'Currency Data']
    },
    {
      title: 'Comprehensive Test',
      description: 'Full-featured testing suite for all calculator components and functionality',
      href: '/test/comprehensive' as const,
      icon: TestTube,
      color: 'purple' as const,
      features: ['Calculator Testing', 'Component Tests', 'Integration Tests', 'Performance']
    }
  ];

  const testFeatures = [
    {
      title: 'Exit Intent Testing',
      description: 'Test exit intent popup functionality and triggers',
      icon: Zap,
      status: hasShown ? 'triggered' : 'ready',
      actions: [
        { label: 'Trigger Popup', action: manualTriggerExitIntent, variant: 'primary' },
        { label: 'Reset', action: resetExitIntent, variant: 'secondary' }
      ]
    },
    {
      title: 'Session Analytics',
      description: 'Monitor session tracking and analytics data',
      icon: Activity,
      status: sessionData ? 'active' : 'inactive',
      actions: [
        { label: 'Refresh Data', action: updateSessionData, variant: 'secondary' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neural-blue-50 via-quantum-purple-50 to-cyber-green-50">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-neural-primary rounded-xl shadow-neural-glow">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-display-3 gradient-text-neural font-display">
              Test Suite
            </h1>
          </div>
          <p className="text-body-large text-neural-blue-600 max-w-2xl mx-auto">
            Comprehensive testing environment for ScaleMate features, analytics, and integrations
          </p>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/">
              <Button variant="quantum-secondary" leftIcon={<Home className="w-4 h-4" />}>
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Test Pages Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-neural-blue-900 mb-6 text-center">
            Test Pages
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testPages.map((page, index) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="p-6 h-full flex flex-col">
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${page.color === 'blue' ? 'bg-blue-100' : 'bg-purple-100'}`}>
                        <page.icon className={`w-6 h-6 ${page.color === 'blue' ? 'text-blue-600' : 'text-purple-600'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-neural-blue-900 mb-2">
                          {page.title}
                        </h3>
                        <p className="text-neural-blue-600 text-sm leading-relaxed">
                          {page.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Features */}
                    <div className="mb-6 flex-1">
                      <h4 className="text-sm font-semibold text-neural-blue-800 mb-3">Features:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {page.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-neural-blue-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="mt-auto">
                      <Link href={page.href}>
                        <Button 
                          variant="neural-primary" 
                          className="w-full"
                          rightIcon={<ExternalLink className="w-4 h-4" />}
                        >
                          Open Test Page
                        </Button>
                      </Link>
                    </div>
                  </>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Test Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-neural-blue-900 mb-6 text-center">
            Interactive Tests
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {testFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="h-full"
              >
                <Card className="p-6 h-full">
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                        <feature.icon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-neural-blue-900">
                            {feature.title}
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            feature.status === 'active' || feature.status === 'triggered' 
                              ? 'bg-green-100 text-green-700' 
                              : feature.status === 'ready'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {feature.status}
                          </div>
                        </div>
                        <p className="text-neural-blue-600 text-sm leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      {feature.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={action.variant === 'primary' ? 'neural-primary' : 'quantum-secondary'}
                          onClick={action.action}
                          className="flex-1"
                          leftIcon={action.label === 'Trigger Popup' ? <Play className="w-4 h-4" /> : 
                                   action.label === 'Reset' ? <RotateCcw className="w-4 h-4" /> :
                                   <RefreshCw className="w-4 h-4" />}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Exit Intent Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
            <>
              <div className="flex items-start gap-4">
                <Info className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                    How to Test Exit Intent
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-yellow-700 text-sm">
                    <li>Wait 2 seconds after loading this page</li>
                    <li>Move your mouse to the very top of the browser window (address bar area)</li>
                    <li>The exit intent popup should appear automatically</li>
                    <li>Or click the "Trigger Popup" button for manual testing</li>
                  </ol>
                </div>
              </div>
            </>
          </Card>
        </motion.div>

        {/* Session Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <Card className="p-6">
            <>
              <h3 className="text-lg font-semibold text-neural-blue-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Session Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-blue-600 mb-1">Session ID</div>
                  <div className="text-sm font-mono text-blue-900 truncate">
                    {analytics.getSessionId() || 'Not initialized'}
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-green-600 mb-1">Exit Intent</div>
                  <div className="text-sm font-semibold text-green-900">
                    {hasShown ? 'Triggered' : 'Ready'}
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-purple-600 mb-1">Popup Status</div>
                  <div className="text-sm font-semibold text-purple-900">
                    {showExitPopup ? 'Visible' : 'Hidden'}
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="text-xs font-medium text-orange-600 mb-1">Analytics</div>
                  <div className="text-sm font-semibold text-orange-900">
                    {sessionData ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            </>
          </Card>
        </motion.div>

        {/* Session Data */}
        {sessionData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <>
                <h3 className="text-lg font-semibold text-neural-blue-900 mb-4">
                  Current Session Data
                </h3>
                <div className="bg-neutral-900 text-green-400 p-4 rounded-lg overflow-auto text-xs font-mono">
                  <pre>{JSON.stringify(sessionData, null, 2)}</pre>
                </div>
              </>
            </Card>
          </motion.div>
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