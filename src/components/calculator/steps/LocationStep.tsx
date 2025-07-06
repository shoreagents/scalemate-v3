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
    <div >
      {/* Header */}
      <div className="text-center mb-12">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl border-2 border-neural-blue-500 bg-gradient-to-br from-neural-blue-500 to-quantum-purple-500 flex items-center justify-center shadow-neural-glow">
              <MapPin className="lucide lucide-users w-5 h-5 text-white" />
            </div>
            <h2 className="text-headline-1 text-neutral-900">
              Where is your business located?
            </h2>
          </div>
          
          <p className="text-body-large text-neutral-600">
            We'll use this to show you accurate cost comparisons and savings calculations in your local currency.
          </p>
        </div>
      </div>

      {/* Location Selection Section */}
      <div className="w-full">
        {/* Location Section with Background */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto p-6 rounded-xl border h-full flex flex-col border-neutral-200 bg-white"
        >
          
          <div className="relative z-10">
            
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* Location Display or Error/Loading */}
              {getEffectiveLocation?.() ? (
                <>
                  {/* Location Display */}
                  <div className="flex-1 flex items-center justify-center gap-2 px-6 h-16 min-w-[320px] text-lg bg-white rounded-lg border border-neural-blue-200 shadow-sm">
                    <span className="text-2xl">🌏</span>
                    <span className="font-medium text-neutral-900 text-center">
                        {getEffectiveLocation?.()?.country_name}
                    </span>
                  </div>
                  
                  {/* Change Button */}
                  <Button
                    onClick={onLocationEditStart}
                    variant="quantum-secondary"
                    size="neural-lg"
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    className="px-6 h-16 whitespace-nowrap flex-shrink-0 w-full md:w-auto"
                  >
                    Change Location
                  </Button>
                  
                
                {manualLocation && (
                  <button
                    onClick={onLocationReset}
                      className="text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
                  >
                      Use Current Location
                  </button>
                )}
                </>
            ) : (
                <>
                  {/* Error State */}
                  <div className="flex-1 flex items-center justify-center gap-2 px-6 h-16 min-w-[320px] text-lg bg-white rounded-lg border border-neural-blue-200 shadow-sm">
                    <span className="text-2xl">🌏</span>
                    <span className="font-medium text-neutral-900 text-center">
                      {locationError || 'Unable to detect location'}
                    </span>
                  </div>
                  
                  {/* Set Location Manually Button - Always Visible */}
                  <Button
                  onClick={onLocationEditStart}
                    variant="neural-primary"
                    size="neural-lg"
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    className="px-6 h-16 whitespace-nowrap flex-shrink-0 w-full md:w-auto"
                  >
                    Set Location Manually
                  </Button>
                </>
            )}
          </div>
          
          {/* Location Edit Modal */}
          {isEditingLocation && (
              <div className="mt-6">
                <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
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


             {/* Why We Need Location */}
          <div className="mt-8 p-8 bg-gradient-to-r from-neural-blue-50 to-quantum-purple-50 rounded-xl border border-neural-blue-100 mx-auto">
            <h3 className="text-xl font-semibold text-neural-blue-900 mb-6 flex items-center justify-center gap-3">
              <Globe className="w-6 h-6" />
              Why do we need your location?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base text-neural-blue-700">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-neural-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>Show accurate salary comparisons</span>
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
    </div>
  );
} 