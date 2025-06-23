'use client';

import { useLocationOnly } from '@/hooks/test/useLocationOnly';
import { Card } from '@/components/ui/Card';
import { MapPin, Globe, Network } from 'lucide-react';

export default function LocationTestPage() {
  const {
    location,
    isLoading,
    error,
    ipInfo
  } = useLocationOnly();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Location Detection Test
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Testing IP-based location detection for the calculator
          </p>
        </div>

        {/* Status Cards */}
        <div className="flex justify-center mb-8">
          {/* Location Status - Only show if location is available */}
          {location && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
              {/* IP Information Card */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Network className="w-6 h-6 text-purple-500" />
                  <h3 className="text-lg font-semibold">IP Information</h3>
                </div>
                <div className="space-y-2">
                  <p><strong>Detected IP:</strong> {ipInfo?.detectedIp || 'N/A'}</p>
                  {ipInfo?.isLocalIP && (
                    <p className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                      ⚠️ Local IP detected - using public IP for geolocation
                    </p>
                  )}
                  {ipInfo?.actualIp && ipInfo.actualIp !== ipInfo.detectedIp && (
                    <p><strong>Public IP Used:</strong> {ipInfo.actualIp}</p>
                  )}
                  <p><strong>Source:</strong> {ipInfo?.source || 'N/A'}</p>
                  <p><strong>Detected At:</strong> {ipInfo?.detectedAt ? new Date(ipInfo.detectedAt).toLocaleTimeString() : 'N/A'}</p>
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600">
                      <strong>Cache Status:</strong> {ipInfo?.fromCache ? '✓ Cached' : '⚡ Fresh'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Environment:</strong> {ipInfo?.isLocalIP ? '🏠 Development' : '🌐 Production'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold">Location Detected</h3>
                </div>
                <div className="space-y-2">
                  <p><strong>City:</strong> {location.city}</p>
                  <p><strong>Region:</strong> {location.region}</p>
                  <p><strong>Country:</strong> {location.country}</p>
                  <p><strong>Currency:</strong> {location.currency}</p>
                  <p><strong>Timezone:</strong> {location.timezone}</p>
                </div>
              </Card>

              {/* API Status */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-semibold">API Status</h3>
                </div>
                {error ? (
                  <div className="text-red-600">
                    <p className="font-medium">Error occurred:</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : (
                  <div className="text-green-600">
                    <p className="font-medium">✓ IP geolocation successful</p>
                    <p className="text-sm">Service: {ipInfo?.source || 'Unknown'}</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        {/* Loading State - Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
            {/* IP Information Skeleton */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-18 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </Card>

            {/* Location Skeleton */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-14 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-18 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </Card>

            {/* API Status Skeleton */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
} 