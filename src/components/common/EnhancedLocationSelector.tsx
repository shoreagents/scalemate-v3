'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Globe, Check, X, ChevronDown, MapPinIcon, Navigation } from 'lucide-react';
import { fetchCountries, searchCountries, type Country } from '@/utils/locationApi';

interface LocationData {
  country: string;
  region: string;
  city: string;
}

interface EnhancedLocationSelectorProps {
  initialLocation?: LocationData;
  onLocationChange: (location: LocationData) => void;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
  showPreview?: boolean;
}

export function EnhancedLocationSelector({
  initialLocation,
  onLocationChange,
  onCancel,
  onSave,
  disabled = false,
  showPreview = false
}: EnhancedLocationSelectorProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData>(
    initialLocation || { country: '', region: '', city: '' }
  );

  // Fetch countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const countriesData = await fetchCountries();
        console.log('Loaded countries:', countriesData.length, 'First few:', countriesData.slice(0, 3).map(c => c.name.common));
        setCountries(countriesData);
        setFilteredCountries(countriesData);
      } catch (error) {
        console.error('Failed to load countries:', error);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    loadCountries();
  }, []);

  // Update filtered countries when search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchCountries(searchQuery, countries);
      console.log('Search query:', searchQuery, 'Found:', filtered.length, 'countries');
      setFilteredCountries(filtered);
    } else {
      setFilteredCountries(countries);
    }
  }, [searchQuery, countries]);

  // Update parent component when location changes
  useEffect(() => {
    onLocationChange(selectedLocation);
  }, [selectedLocation, onLocationChange]);

  const handleCountrySelect = (countryName: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      country: countryName,
      region: '', // Reset region when country changes
      city: ''    // Reset city when country changes
    }));
    setSearchQuery(''); // Clear search when country is selected
    setShowCountryDropdown(false);
  };

  const isValid = selectedLocation.country;

  return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MapPinIcon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Set Your Location
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose your country for location-specific insights
        </p>
      </div>

            {/* Country Selection */}
      <div className="space-y-2">
        {/* Country Search/Dropdown */}
        <div className="relative">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery || selectedLocation.country}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setShowCountryDropdown(true);
                
                // If user types something different from selected country, clear the selection
                if (value !== selectedLocation.country) {
                  setSelectedLocation(prev => ({ ...prev, country: '', region: '', city: '' }));
                }
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown to allow for clicks
                setTimeout(() => setShowCountryDropdown(false), 150);
              }}
              placeholder="Search countries..."
              disabled={disabled}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              disabled={disabled}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Country Dropdown */}
          {showCountryDropdown && !disabled && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isLoadingCountries ? (
                <div className="p-4 text-center text-gray-500">
                  Loading countries...
                </div>
              ) : (searchQuery ? filteredCountries : countries).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No countries found
                </div>
              ) : (
                (searchQuery ? filteredCountries : countries).slice(0, 50).map(country => (
                  <button
                    key={country.cca2}
                    onClick={() => handleCountrySelect(country.name.common)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {country.name.common}
                      </div>
                      <div className="text-xs text-gray-500">
                        {country.region} • {country.subregion}
                      </div>
                    </div>
                    {selectedLocation.country === country.name.common && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          onClick={onCancel}
          disabled={disabled}
          className="px-6 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!isValid || disabled}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          <Check className="w-4 h-4" />
          Save Location
        </button>
      </div>

      {/* Selected Location Preview */}
      {isValid && showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-800 font-medium">
              {selectedLocation.country}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
} 