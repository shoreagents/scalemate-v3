'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Check, X, ChevronDown, MapPinIcon } from 'lucide-react';
import { fetchCountries, searchCountries, type Country } from '@/utils/locationApi';
import { ManualLocation } from '@/types/location';
import { Button } from '@/components/ui/Button';

interface EnhancedLocationSelectorProps {
  initialLocation?: ManualLocation;
  onLocationChange: (location: ManualLocation) => void;
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
  
  const [selectedLocation, setSelectedLocation] = useState<ManualLocation>(
    initialLocation || { country: '' }
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
      country: countryName
    }));
    setSearchQuery(''); // Clear search when country is selected
    setShowCountryDropdown(false);
  };

  const isValid = selectedLocation.country;

  return (
    <div className="w-full">
      {/* Search and Buttons in Same Row */}
      <div className="flex items-center gap-3">
        {/* Country Search/Dropdown */}
        <div className="relative flex-1">
          <div className="relative group">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            <input
              type="text"
              value={showCountryDropdown ? searchQuery : (selectedLocation.country || searchQuery)}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
                setShowCountryDropdown(true);
                
                // Only clear selection if user is actively typing and it's different
                if (value && value !== selectedLocation.country) {
                  setSelectedLocation(prev => ({ ...prev, country: '' }));
                }
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => {
                // Delay hiding dropdown to allow for clicks
                setTimeout(() => setShowCountryDropdown(false), 150);
              }}
              placeholder="Search countries..."
              disabled={disabled}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!box-shadow-none focus:border-blue-500 active:!outline-none active:!ring-0 active:!shadow-none disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200"
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
                (searchQuery ? filteredCountries : countries).map(country => (
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

        {/* Action Buttons */}
        <Button
          onClick={onCancel}
          disabled={disabled}
          variant="quantum-secondary"
          size="neural-md"
          leftIcon={<X className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={!isValid || disabled}
          variant="neural-primary"
          size="neural-md"
          leftIcon={<Check className="w-4 h-4" />}
          className="whitespace-nowrap"
        >
          Save Location
        </Button>
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