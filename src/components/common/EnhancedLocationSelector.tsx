'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Check, X, ChevronDown, MapPinIcon } from 'lucide-react';
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
    <div className="w-full">
      {/* Responsive Search and Buttons Layout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Country Search/Dropdown */}
        <div className="relative flex-1 min-w-0">
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
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
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
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto left-0 right-0">
              {isLoadingCountries ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                  Loading countries...
                </div>
              ) : (searchQuery ? filteredCountries : countries).length === 0 ? (
                <div className="p-3 sm:p-4 text-center text-gray-500 text-sm">
                  No countries found
                </div>
              ) : (
                (searchQuery ? filteredCountries : countries).map(country => (
                  <button
                    key={country.cca2}
                    onClick={() => handleCountrySelect(country.name.common)}
                    onMouseDown={(e) => e.preventDefault()} // Prevent blur on click
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-center justify-between group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {country.name.common}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {country.region} • {country.subregion}
                      </div>
                    </div>
                    {selectedLocation.country === country.name.common && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons - Responsive Layout */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:flex-shrink-0">
          <button
            onClick={onCancel}
            disabled={disabled}
            className="px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onSave}
            disabled={!isValid || disabled}
            className="px-4 py-3 bg-gradient-to-r from-neural-blue-500 to-quantum-purple-500 text-white text-sm font-medium rounded-lg hover:from-neural-blue-600 hover:to-quantum-purple-600 hover:shadow-neural-glow disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 order-1 sm:order-2 shadow-lg disabled:shadow-none"
          >
            <Check className="w-4 h-4" />
            <span>Save Location</span>
          </button>
        </div>
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