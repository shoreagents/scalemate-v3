'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  MapPin, 
  Globe, 
  Wifi, 
  Clock, 
  DollarSign, 
  Shield, 
  Monitor, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { fetchIPLocation } from '@/utils/locationApi';
import { IPLocationData } from '@/types/location';

// Use IPLocationData directly for this test page
type LocationData = IPLocationData;

export default function LocationTestPage() {
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await fetchIPLocation();
      setLocationData(data);
      console.log('📍 Complete location data:', data);
    } catch (error) {
      console.error('Failed to fetch location:', error);
      setError(`Failed to fetch location: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const LocationField = ({ 
    label, 
    value, 
    icon: Icon, 
    fieldName 
  }: { 
    label: string; 
    value: string | number; 
    icon: any; 
    fieldName: string; 
  }) => (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-500" />
        <div>
          <div className="text-sm font-medium text-blue-900">{label}</div>
          <div className="text-sm text-blue-700">{value}</div>
        </div>
      </div>
      <button
        onClick={() => copyToClipboard(String(value), fieldName)}
        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
        title="Copy to clipboard"
      >
        {copiedField === fieldName ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );

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
              <Globe className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-display-3 gradient-text-neural font-display">
              Location Test Page
            </h1>
          </div>
          <p className="text-body-large text-neural-blue-600 max-w-2xl mx-auto">
            Comprehensive location information using ipapi.co service
          </p>
          
          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link href="/test">
              <Button variant="quantum-secondary">
                Back to Tests
              </Button>
            </Link>
            <Button
              onClick={fetchLocation}
              disabled={isLoading}
              leftIcon={isLoading ? <Wifi className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            >
              {isLoading ? 'Refreshing...' : 'Refresh Location'}
            </Button>
          </div>
        </motion.div>

        {/* Status Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <Card className="p-6">
            <>
              <div className="flex items-center justify-center gap-3 mb-4">
                {isLoading ? (
                  <>
                    <div className="animate-spin">
                      <Wifi className="w-6 h-6 text-blue-500" />
                    </div>
                    <span className="text-lg font-medium text-blue-700">
                      Detecting your location...
                    </span>
                  </>
                ) : error ? (
                  <>
                    <Globe className="w-6 h-6 text-red-500" />
                    <span className="text-lg font-medium text-red-700">
                      {error}
                    </span>
                  </>
                ) : locationData ? (
                  <>
                    <MapPin className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-medium text-green-700">
                      Location detected successfully
                    </span>
                  </>
                ) : null}
              </div>
            </>
          </Card>
        </motion.div>

        {/* Location Data Display */}
        {locationData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="p-8">
              <>
                <h2 className="text-2xl font-bold text-neural-blue-900 mb-8 text-center">
                  Complete Location Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Location */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neural-blue-800 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Geographic Location
                    </h3>
                    <LocationField 
                      label="IP Address" 
                      value={locationData.ip} 
                      icon={Shield} 
                      fieldName="ip" 
                    />
                    <LocationField 
                      label="City" 
                      value={locationData.city} 
                      icon={MapPin} 
                      fieldName="city" 
                    />
                    <LocationField 
                      label="Region/State" 
                      value={locationData.region} 
                      icon={MapPin} 
                      fieldName="region" 
                    />
                    <LocationField 
                      label="Country" 
                      value={locationData.country_name} 
                      icon={Globe} 
                      fieldName="country" 
                    />
                    <LocationField 
                      label="Country Code" 
                      value={locationData.country_code} 
                      icon={Globe} 
                      fieldName="countryCode" 
                    />
                    {locationData.postal && (
                      <LocationField 
                        label="Postal Code" 
                        value={locationData.postal} 
                        icon={MapPin} 
                        fieldName="postal" 
                      />
                    )}
                  </div>

                  {/* Technical Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-neural-blue-800 mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Technical Information
                    </h3>
                    <LocationField 
                      label="Coordinates" 
                      value={`${locationData.latitude}, ${locationData.longitude}`} 
                      icon={MapPin} 
                      fieldName="coordinates" 
                    />
                    <LocationField 
                      label="Timezone" 
                      value={locationData.timezone} 
                      icon={Clock} 
                      fieldName="timezone" 
                    />
                    {locationData.utc_offset && (
                      <LocationField 
                        label="UTC Offset" 
                        value={locationData.utc_offset} 
                        icon={Clock} 
                        fieldName="utcOffset" 
                      />
                    )}
                    <LocationField 
                      label="Currency" 
                      value={`${locationData.currency_name} (${locationData.currency})`} 
                      icon={DollarSign} 
                      fieldName="currency" 
                    />
                    <LocationField 
                      label="Languages" 
                      value={locationData.languages} 
                      icon={Globe} 
                      fieldName="languages" 
                    />
                    {locationData.country_calling_code && (
                      <LocationField 
                        label="Calling Code" 
                        value={locationData.country_calling_code} 
                        icon={Globe} 
                        fieldName="callingCode" 
                      />
                    )}
                  </div>

                  {/* Network Information */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-lg font-semibold text-neural-blue-800 mb-4 flex items-center gap-2">
                      <Wifi className="w-5 h-5" />
                      Network Information
                    </h3>
                    <LocationField 
                      label="Organization/ISP" 
                      value={locationData.org} 
                      icon={Monitor} 
                      fieldName="org" 
                    />
                    {locationData.asn && (
                      <LocationField 
                        label="ASN" 
                        value={locationData.asn} 
                        icon={Monitor} 
                        fieldName="asn" 
                      />
                    )}
                    {locationData.country_tld && (
                      <LocationField 
                        label="Country TLD" 
                        value={locationData.country_tld} 
                        icon={Globe} 
                        fieldName="tld" 
                      />
                    )}
                  </div>
                </div>

                {/* Raw JSON Display */}
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neural-blue-800 mb-4">
                    Raw JSON Response
                  </h3>
                  <div className="bg-neutral-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    <pre>{JSON.stringify(locationData, null, 2)}</pre>
                  </div>
                </div>
              </>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
} 