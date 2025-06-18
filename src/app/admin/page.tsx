'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Clock, 
  MapPin, 
  Smartphone, 
  Monitor,
  Eye,
  RefreshCw,
  Download,
  Calendar,
  Star,
  Target,
  AlertCircle
} from 'lucide-react';
import { SessionData, LeadSubmission } from '@/utils/analytics';

interface AdminStats {
  totalSessions: number;
  activeSessions: number;
  totalLeads: number;
  conversionRate: number;
  avgSessionDuration: number;
  topCountries: Array<{ country: string; count: number }>;
}

// Client-only time component to prevent hydration errors
function ClientTime({ date }: { date: string | Date }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span>...</span>;
  }

  return <span>{new Date(date).toLocaleString()}</span>;
}

export default function AdminDashboard() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [leads, setLeads] = useState<(LeadSubmission & { id: string })[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sessions' | 'leads'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, leadsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/leads')
      ]);

      const sessionsData = await sessionsRes.json();
      const leadsData = await leadsRes.json();

      setSessions(sessionsData);
      setLeads(leadsData);
      
      // Calculate stats
      calculateStats(sessionsData, leadsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (sessionsData: SessionData[], leadsData: any[]) => {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const activeSessions = sessionsData.filter(
      session => new Date(session.lastActivity) > fiveMinutesAgo
    ).length;

    const totalDuration = sessionsData.reduce((sum, session) => {
      const duration = (new Date(session.lastActivity).getTime() - new Date(session.startTime).getTime()) / 1000 / 60;
      return sum + duration;
    }, 0);

    const countryCount: Record<string, number> = {};
    sessionsData.forEach(session => {
      if (session.geoInfo?.country) {
        countryCount[session.geoInfo.country] = (countryCount[session.geoInfo.country] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countryCount)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalSessions: sessionsData.length,
      activeSessions,
      totalLeads: leadsData.length,
      conversionRate: sessionsData.length > 0 ? (leadsData.length / sessionsData.length) * 100 : 0,
      avgSessionDuration: sessionsData.length > 0 ? totalDuration / sessionsData.length : 0,
      topCountries
    });
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '<1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ScaleMate Admin</h1>
              <p className="text-gray-600 mt-1">
                Anonymous user tracking & lead management
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                Last updated: {mounted ? lastRefresh.toLocaleTimeString() : '...'}
              </div>
              <Button
                onClick={fetchData}
                variant="outline"
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'sessions', label: 'Sessions', icon: Users },
                { id: 'leads', label: 'Leads', icon: Mail }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Now</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeSessions}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Target className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Top Countries */}
            {stats && stats.topCountries.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
                <div className="space-y-3">
                  {stats.topCountries.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-semibold text-indigo-600">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{country.country}</span>
                      </div>
                      <span className="text-gray-600">{country.count} sessions</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {selectedTab === 'sessions' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Sessions Yet</h3>
                <p className="text-gray-500">Sessions will appear here when users visit the calculator.</p>
              </Card>
            ) : (
              sessions.map((session) => (
                <Card key={session.sessionId} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          Session {session.sessionId.slice(-8)}
                        </h3>
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                          Step {session.currentStep}
                        </span>
                        {new Date().getTime() - new Date(session.lastActivity).getTime() < 5 * 60 * 1000 && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          Started: <ClientTime date={session.startTime} />
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {session.geoInfo?.city}, {session.geoInfo?.country || 'Unknown'}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          {session.deviceInfo.isMobile ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
                          {session.deviceInfo.browser} on {session.deviceInfo.os}
                        </div>
                      </div>
                      
                      {session.portfolioSize && (
                        <div className="mt-2 text-sm text-gray-600">
                          Portfolio: {session.portfolioSize} properties
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      {session.events.length} events
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Leads Tab */}
        {selectedTab === 'leads' && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <Card className="p-8 text-center">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Leads Yet</h3>
                <p className="text-gray-500">Leads will appear here when users submit the exit intent form.</p>
              </Card>
            ) : (
              leads.map((lead) => (
                <Card key={lead.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeadScoreColor(lead.leadScore || 0)}`}>
                          Score: {lead.leadScore || 0}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {lead.source}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {lead.email}
                        </div>
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            {lead.phone}
                          </div>
                        )}
                        {lead.company && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4" />
                            {lead.company}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <ClientTime date={lead.timestamp} />
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <strong>Timeline:</strong> {lead.urgency}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
} 