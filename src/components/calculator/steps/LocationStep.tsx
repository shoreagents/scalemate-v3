'use client';

import { motion } from 'framer-motion';
import { Globe, Wifi, Edit3, MapPin } from 'lucide-react';
import { EnhancedLocationSelector } from '@/components/common/EnhancedLocationSelector';

interface LocationData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
  currency: string;
  currency_name: string;
  languages: string;
  org: string;
}

interface ManualLocation {
  country: string;
  region: string;
  city: string;
}

interface LocationStepProps {
  locationData?: LocationData | null;
  isLoadingLocation?: boolean;
  locationError?: string | null;
  isEditingLocation?: boolean;
  manualLocation?: ManualLocation | null;
  tempLocation?: ManualLocation;
  countryRegions?: { [key: string]: string[] };
  onLocationEditStart?: () => void;
  onLocationEditSave?: () => void;
  onLocationEditCancel?: () => void;
  onLocationReset?: () => void;
  onTempLocationChange?: (location: ManualLocation) => void;
  getEffectiveLocation?: () => LocationData | { city: string; region: string; country_name: string; } | null | undefined;
  onChange: (locationData: LocationData | null) => void;
}

export function LocationStep({
  locationData,
  isLoadingLocation = false,
  locationError,
  isEditingLocation = false,
  manualLocation,
  tempLocation,
  countryRegions = {},
  onLocationEditStart,
  onLocationEditSave,
  onLocationEditCancel,
  onLocationReset,
  onTempLocationChange,
  getEffectiveLocation,
  onChange
}: LocationStepProps) {
  
  return (
    <div className="mx-auto" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-neural-blue-100 rounded-xl shadow-sm">
              <MapPin className="w-6 h-6 text-neural-blue-600" />
            </div>
            <h2 className="text-headline-1 text-neutral-900">
              Where is your business located?
            </h2>
          </div>
          
          <p className="text-body-large text-neutral-600 max-w-2xl mx-auto">
            We'll use this to show you accurate cost comparisons and savings calculations in your local currency.
          </p>
        </div>
      </div>

      {/* Location Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-gradient-to-br from-neural-blue-50/50 via-white to-neural-blue-50/30 rounded-2xl p-8 border border-neural-blue-100 shadow-lg">
          
          {/* Location Status */}
          <div className="flex flex-col items-center justify-center gap-6 mb-8">
            {isLoadingLocation ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin">
                  <Wifi className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-neutral-700 font-medium text-base">
                  Detecting your location...
                </span>
              </div>
            ) : getEffectiveLocation?.() ? (
              <div className="flex flex-col items-center gap-6 w-full max-w-4xl">
                {/* Location Display and Change Button in Same Row */}
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                  {/* Location Display */}
                  <div className="flex items-center gap-4 px-8 bg-white rounded-xl border border-blue-200 shadow-sm flex-1 justify-center min-w-0 h-16 w-full md:w-auto">
                    <span className="text-3xl">🌏</span>
                    <div className="text-center">
                      <div className="font-semibold text-neutral-900 text-xl">
                        {getEffectiveLocation?.()?.country_name}
                      </div>
                      {!manualLocation && getEffectiveLocation?.()?.city && getEffectiveLocation?.()?.region && (
                        <div className="text-base text-neutral-600">
                          {getEffectiveLocation?.()?.city}, {getEffectiveLocation?.()?.region}
                        </div>
                      )}
                      {manualLocation && (
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          Manually selected
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Change Button */}
                  <button
                    onClick={onLocationEditStart}
                    className="px-6 text-blue-600 hover:text-blue-700 transition-colors font-medium flex items-center gap-2 border border-blue-300 rounded-xl hover:bg-blue-50 bg-white shadow-sm text-base whitespace-nowrap flex-shrink-0 h-16 w-full md:w-auto justify-center"
                  >
                    <Edit3 className="w-4 h-4" />
                    Change Location
                  </button>
                </div>
                
                {manualLocation && (
                  <button
                    onClick={onLocationReset}
                    className="text-sm text-blue-600 hover:text-blue-700 underline transition-colors font-medium"
                  >
                    Reset to auto-detected
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-4xl">
                <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-xl border border-neutral-200 flex-1 justify-center shadow-sm min-w-0 w-full md:w-auto">
                  <Globe className="w-5 h-5 text-neutral-500" />
                  <span className="text-neutral-700 font-medium text-base">
                    {locationError || "Unable to detect location"}
                  </span>
                </div>
                <button
                  onClick={onLocationEditStart}
                  className="px-6 py-4 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white rounded-xl hover:from-neural-blue-600 hover:to-quantum-purple-600 hover:shadow-neural-glow transition-all duration-200 font-medium text-base whitespace-nowrap flex-shrink-0 shadow-lg w-full md:w-auto justify-center"
                >
                  Set Location Manually
                </button>
              </div>
            )}
          </div>
          
          {/* Location Edit Modal */}
          {isEditingLocation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg"
            >
              <EnhancedLocationSelector
                {...(tempLocation && tempLocation.country && {
                  initialLocation: {
                    country: tempLocation.country,
                    region: tempLocation.region,
                    city: tempLocation.city
                  }
                })}
                onLocationChange={(location: { country: string; region: string; city: string }) => {
                  onTempLocationChange?.({
                    country: location.country,
                    region: location.region,
                    city: location.city
                  });
                }}
                onCancel={onLocationEditCancel || (() => {})}
                onSave={onLocationEditSave || (() => {})}
                showPreview={false}
              />
            </motion.div>
          )}

          {/* Why We Need Location */}
          <div className="mt-8 p-8 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 rounded-xl border border-neural-blue-100 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-neural-blue-900 mb-6 flex items-center justify-center gap-3">
              <Globe className="w-6 h-6" />
              Why do we need your location?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base text-neural-blue-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neural-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Show accurate salary comparisons in your local market</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neural-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Calculate savings in your local currency</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neural-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Provide region-specific recommendations</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neural-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Consider local regulatory requirements</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 