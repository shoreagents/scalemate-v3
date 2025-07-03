'use client';

import { motion } from 'framer-motion';
import { Globe, MapPin, Edit3 } from 'lucide-react';
import { LocationSelector } from '@/components/common/LocationSelector';
import { Button } from '@/components/ui/Button';
import { ManualLocation, IPLocationData } from '@/types/location';
import { getDisplayCurrencyByCountry } from '@/hooks/useQuoteCalculatorData';

interface LocationStepProps {
  locationData?: IPLocationData | null;
  isLoadingLocation?: boolean;
  locationError?: string | null;
  isEditingLocation?: boolean;
  manualLocation?: ManualLocation | null;
  tempLocation?: ManualLocation;
  onLocationEditStart?: () => void;
  onLocationEditSave?: () => void;
  onLocationEditCancel?: () => void;
  onLocationReset?: () => void;
  onTempLocationChange?: (location: ManualLocation) => void;
  getEffectiveLocation?: () => IPLocationData | { country_name: string; country: string; currency: string; currencySymbol: string; } | null | undefined;
}

export function LocationStep({
  locationData,
  isLoadingLocation = false,
  locationError,
  isEditingLocation = false,
  manualLocation,
  tempLocation,
  onLocationEditStart,
  onLocationEditSave,
  onLocationEditCancel,
  onLocationReset,
  onTempLocationChange,
  getEffectiveLocation
}: LocationStepProps) {
  
  // Memoized callback for location changes to prevent infinite loops
  const handleLocationChange = (location: { country: string }) => {
    onTempLocationChange?.({
      country: location.country,
      currency: getDisplayCurrencyByCountry(location.country)
    });
  };
  
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h2 className="text-headline-1 text-neutral-900">
              Location
            </h2>
          </div>
          
          <p className="text-body-large text-neutral-600">
            We'll use this to show you accurate cost comparisons and savings calculations in your local currency.
          </p>
        </div>
      </div>

      {/* Location Selection Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {/* Location Section with Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full p-16 rounded-xl bg-neural-blue-50/30 border border-neural-blue-100/50 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          
          <div className="relative z-10">
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold text-neutral-900 mb-8">
                Where is your business primarily located?
              </h3>
                </div>
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Location Display or Error/Loading */}
              {getEffectiveLocation?.() ? (
                <>
                  {/* Location Display */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neural-blue-200 shadow-sm">
                    <span className="text-lg">🌏</span>
                    <span className="font-medium text-neutral-900">
                        {getEffectiveLocation?.()?.country_name}
                    </span>
                  </div>
                  
                  {/* Change Button */}
                  <button
                    onClick={onLocationEditStart}
                    className="px-4 py-2 text-neural-blue-600 hover:text-neural-blue-700 transition-colors font-medium flex items-center gap-2 border border-neural-blue-300 rounded-lg hover:bg-neural-blue-100 bg-white shadow-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    Change Location
                  </button>
                
                {manualLocation && (
                  <button
                    onClick={onLocationReset}
                      className="text-sm text-neutral-500 hover:text-neutral-700 underline transition-colors"
                  >
                      Use Current Location
                  </button>
                )}
                </>
            ) : (
                <>
                  {/* Error or Loading State */}
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-neutral-200">
                    {isLoadingLocation ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-neural-blue-500 border-t-transparent"></div>
                    ) : null}
                    {isLoadingLocation ? (
                      <span className="text-neutral-700 font-medium">
                        Detecting your location...
                      </span>
                    ) : (
                      <span className="text-neutral-700 font-medium">
                        {locationError || 'Unable to detect location'}
                  </span>
                    )}
                </div>
                  
                  {/* Set Location Manually Button - Always Visible */}
                  <Button
                  onClick={onLocationEditStart}
                    variant="neural-primary"
                >
                  Set Location Manually
                  </Button>
                </>
            )}
          </div>
          
          {/* Location Edit Modal */}
          {isEditingLocation && (
              <div className="mt-6">
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-lg">
                  <LocationSelector
                    initialLocation={tempLocation || { country: '', currency: getDisplayCurrencyByCountry('') }}
                    onLocationChange={handleLocationChange}
                onCancel={onLocationEditCancel || (() => {})}
                onSave={onLocationEditSave || (() => {})}
                showPreview={false}
              />
                </div>
              </div>
            )}
          </div>
            </motion.div>
      </motion.div>
    </div>
  );
} 