'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormData, CalculationResult, CalculatorStep, RoleId, CustomTask } from '@/types';
import { calculateSavings } from '@/utils/calculations';
import { DEFAULT_FORM_DATA } from '@/utils/quoteCalculatorData';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { StepIndicator } from '@/components/calculator/StepIndicator';
import { PortfolioStep } from './steps/PortfolioStep';
import { RoleSelectionStep } from './steps/RoleSelectionStep';
import { TaskSelectionStep } from './steps/TaskSelectionStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ResultsStep } from './steps/ResultsStep';
import { useExitIntentContext } from '@/components/providers/ExitIntentProvider';
import { analytics } from '@/utils/analytics';
import { 
  ArrowLeft, 
  ArrowRight, 
  Calculator,
  TrendingUp,
  Users,
  Brain,
  Sparkles,
  Zap,
  Cpu,
  Target,
  Home,
  MapPin,
  Globe,
  Wifi,
  Edit3,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

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

interface OffshoreCalculatorProps {
  className?: string;
  onComplete?: (results: CalculationResult) => void;
  onStepChange?: (step: CalculatorStep) => void;
}

export function OffshoreCalculator({ 
  className = '', 
  onComplete,
  onStepChange 
}: OffshoreCalculatorProps) {
  // Generate unique session ID
  function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const [formData, setFormData] = useState<FormData>({
    ...DEFAULT_FORM_DATA,
    sessionId: generateSessionId(),
    startedAt: new Date(),
    lastUpdatedAt: new Date()
  });
  
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  
  // Location tracking state
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Manual location override state
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState<ManualLocation | null>(null);
  const [tempLocation, setTempLocation] = useState<ManualLocation>({
    country: '',
    region: '',
    city: ''
  });

  // Use global exit intent context
  const exitIntentContext = useExitIntentContext();

  // Expanded countries and their regions/states
  const countryRegions = {
    'United States': ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
    'United Kingdom': ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    'Canada': ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon'],
    'Australia': ['Australian Capital Territory', 'New South Wales', 'Northern Territory', 'Queensland', 'South Australia', 'Tasmania', 'Victoria', 'Western Australia'],
    'Germany': ['Baden-Württemberg', 'Bavaria', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hesse', 'Lower Saxony', 'Mecklenburg-Vorpommern', 'North Rhine-Westphalia', 'Rhineland-Palatinate', 'Saarland', 'Saxony', 'Saxony-Anhalt', 'Schleswig-Holstein', 'Thuringia'],
    'France': ['Auvergne-Rhône-Alpes', 'Bourgogne-Franche-Comté', 'Brittany', 'Centre-Val de Loire', 'Corsica', 'Grand Est', 'Hauts-de-France', 'Île-de-France', 'Normandy', 'Nouvelle-Aquitaine', 'Occitanie', 'Pays de la Loire', 'Provence-Alpes-Côte d\'Azur'],
    'Netherlands': ['Drenthe', 'Flevoland', 'Friesland', 'Gelderland', 'Groningen', 'Limburg', 'North Brabant', 'North Holland', 'Overijssel', 'South Holland', 'Utrecht', 'Zeeland'],
    'Singapore': ['Central Region', 'East Region', 'North Region', 'Northeast Region', 'West Region'],
    'India': ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'],
    'Brazil': ['Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal', 'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul', 'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí', 'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia', 'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'],
    'Mexico': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
    'Japan': ['Aichi', 'Akita', 'Aomori', 'Chiba', 'Ehime', 'Fukui', 'Fukuoka', 'Fukushima', 'Gifu', 'Gunma', 'Hiroshima', 'Hokkaido', 'Hyogo', 'Ibaraki', 'Ishikawa', 'Iwate', 'Kagawa', 'Kagoshima', 'Kanagawa', 'Kochi', 'Kumamoto', 'Kyoto', 'Mie', 'Miyagi', 'Miyazaki', 'Nagano', 'Nagasaki', 'Nara', 'Niigata', 'Oita', 'Okayama', 'Okinawa', 'Osaka', 'Saga', 'Saitama', 'Shiga', 'Shimane', 'Shizuoka', 'Tochigi', 'Tokushima', 'Tokyo', 'Tottori', 'Toyama', 'Wakayama', 'Yamagata', 'Yamaguchi', 'Yamanashi'],
    'China': ['Anhui', 'Beijing', 'Chongqing', 'Fujian', 'Gansu', 'Guangdong', 'Guangxi', 'Guizhou', 'Hainan', 'Hebei', 'Heilongjiang', 'Henan', 'Hubei', 'Hunan', 'Inner Mongolia', 'Jiangsu', 'Jiangxi', 'Jilin', 'Liaoning', 'Ningxia', 'Qinghai', 'Shaanxi', 'Shandong', 'Shanghai', 'Shanxi', 'Sichuan', 'Tianjin', 'Tibet', 'Xinjiang', 'Yunnan', 'Zhejiang'],
    'South Africa': ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'],
    'Italy': ['Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna', 'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardy', 'Marche', 'Molise', 'Piedmont', 'Puglia', 'Sardinia', 'Sicily', 'Trentino-Alto Adige', 'Tuscany', 'Umbria', 'Valle d\'Aosta', 'Veneto'],
    'Spain': ['Andalusia', 'Aragon', 'Asturias', 'Balearic Islands', 'Basque Country', 'Canary Islands', 'Cantabria', 'Castile and León', 'Castile-La Mancha', 'Catalonia', 'Ceuta', 'Extremadura', 'Galicia', 'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarre', 'Valencia'],
    'Argentina': ['Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán'],
    'New Zealand': ['Auckland', 'Bay of Plenty', 'Canterbury', 'Gisborne', 'Hawke\'s Bay', 'Manawatu-Wanganui', 'Marlborough', 'Nelson', 'Northland', 'Otago', 'Southland', 'Taranaki', 'Tasman', 'Waikato', 'Wellington', 'West Coast'],
    'Norway': ['Agder', 'Innlandet', 'Møre og Romsdal', 'Nordland', 'Oslo', 'Rogaland', 'Troms og Finnmark', 'Trøndelag', 'Vestfold og Telemark', 'Vestland', 'Viken'],
    'Sweden': ['Blekinge', 'Dalarna', 'Gävleborg', 'Gotland', 'Halland', 'Jämtland', 'Jönköping', 'Kalmar', 'Kronoberg', 'Norrbotten', 'Örebro', 'Östergötland', 'Skåne', 'Södermanland', 'Stockholm', 'Uppsala', 'Värmland', 'Västerbotten', 'Västernorrland', 'Västmanland', 'Västra Götaland'],
    'Denmark': ['Capital Region', 'Central Denmark', 'North Denmark', 'Region Zealand', 'Southern Denmark'],
    'Finland': ['Åland', 'Central Finland', 'Central Ostrobothnia', 'Kainuu', 'Kanta-Häme', 'Karelia', 'Kymenlaakso', 'Lapland', 'North Karelia', 'Northern Ostrobothnia', 'Northern Savonia', 'Ostrobothnia', 'Päijät-Häme', 'Pirkanmaa', 'Satakunta', 'South Karelia', 'Southern Ostrobothnia', 'Southern Savonia', 'Southwest Finland', 'Tavastia Proper', 'Uusimaa'],
    'Switzerland': ['Aargau', 'Appenzell Ausserrhoden', 'Appenzell Innerrhoden', 'Basel-Landschaft', 'Basel-Stadt', 'Bern', 'Fribourg', 'Geneva', 'Glarus', 'Graubünden', 'Jura', 'Lucerne', 'Neuchâtel', 'Nidwalden', 'Obwalden', 'Schaffhausen', 'Schwyz', 'Solothurn', 'St. Gallen', 'Thurgau', 'Ticino', 'Uri', 'Valais', 'Vaud', 'Zug', 'Zurich'],
    'Belgium': ['Antwerp', 'Brussels', 'East Flanders', 'Flemish Brabant', 'Hainaut', 'Liège', 'Limburg', 'Luxembourg', 'Namur', 'Walloon Brabant', 'West Flanders'],
    'Austria': ['Burgenland', 'Carinthia', 'Lower Austria', 'Salzburg', 'Styria', 'Tirol', 'Upper Austria', 'Vienna', 'Vorarlberg'],
    'Portugal': ['Aveiro', 'Beja', 'Braga', 'Bragança', 'Castelo Branco', 'Coimbra', 'Évora', 'Faro', 'Guarda', 'Leiria', 'Lisboa', 'Portalegre', 'Porto', 'Santarém', 'Setúbal', 'Viana do Castelo', 'Vila Real', 'Viseu'],
    'Ireland': ['Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'],
    'Other': ['Please specify in region field']
  };

  // Get effective location (manual override or auto-detected)
  const getEffectiveLocation = () => {
    if (manualLocation) {
      return {
        city: manualLocation.city,
        region: manualLocation.region,
        country_name: manualLocation.country
      };
    }
    return locationData;
  };

  // Handle location edit save
  const saveLocationEdit = () => {
    if (tempLocation.country) {
      setManualLocation({ 
        country: tempLocation.country,
        region: '', // Set empty since we're using country-only now
        city: ''    // Set empty since we're using country-only now
      });
      setIsEditingLocation(false);
      console.log('📍 Location manually overridden:', { country: tempLocation.country });
    }
  };

  // Handle location edit cancel
  const cancelLocationEdit = () => {
    const currentLocation = getEffectiveLocation();
    setTempLocation({
      country: manualLocation?.country || currentLocation?.country_name || '',
      region: manualLocation?.region || currentLocation?.region || '',
      city: manualLocation?.city || currentLocation?.city || ''
    });
    setIsEditingLocation(false);
  };

  // Start editing location
  const startLocationEdit = () => {
    const currentLocation = getEffectiveLocation();
    setTempLocation({
      country: manualLocation?.country || currentLocation?.country_name || '',
      region: manualLocation?.region || currentLocation?.region || '',
      city: manualLocation?.city || currentLocation?.city || ''
    });
    setIsEditingLocation(true);
  };

  // Reset to auto-detected location
  const resetToAutoLocation = () => {
    setManualLocation(null);
    setIsEditingLocation(false);
    console.log('📍 Location reset to auto-detected');
  };

  // Fetch location data using ipapi
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setIsLoadingLocation(true);
        setLocationError(null);
        
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: LocationData = await response.json();
        setLocationData(data);
        
        console.log('📍 Location detected:', data);
      } catch (error) {
        console.error('Failed to fetch location:', error);
        setLocationError('Unable to detect location');
        analytics.trackEvent('error', { type: 'location_error', error: error?.toString() });
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.3 }
    }
  };

  // Initialize analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      analytics.init();
      analytics.trackEvent('page_view', { 
        step: 1,
        url: window.location.href
      });
      console.log('📊 Analytics initialized with session:', analytics.getSessionId());
    }
  }, []);

  // Disable global exit intent when user completes the calculator
  useEffect(() => {
    if (formData.currentStep === 5 && calculationResult) {
      exitIntentContext.disable();
      console.log('🎯 Calculator completed - exit intent disabled');
    }
  }, [formData.currentStep, calculationResult, exitIntentContext]);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev: FormData) => {
      const updated = { ...prev, ...updates, lastUpdatedAt: new Date() };
      
      // Track analytics for significant updates
      if (updates.currentStep && updates.currentStep !== prev.currentStep) {
        analytics.updateStep(updates.currentStep);
        analytics.trackEvent('step_start', { step: updates.currentStep });
        onStepChange?.(updates.currentStep);
      }
      
      if (updates.portfolioSize && updates.portfolioSize !== prev.portfolioSize) {
        analytics.trackEvent('portfolio_select', { portfolioSize: updates.portfolioSize });
      }
      
      // Update analytics with calculator data
      analytics.updateCalculatorData({
        portfolioSize: updated.portfolioSize,
        selectedRoles: Object.keys(updated.selectedRoles).filter(role => updated.selectedRoles[role as RoleId]),
        teamSize: updated.teamSize
      });
      
      return updated;
    });
  };

  const nextStep = () => {
    if (formData.currentStep < 5) {
      updateFormData({ currentStep: (formData.currentStep + 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const prevStep = () => {
    if (formData.currentStep > 1) {
      updateFormData({ currentStep: (formData.currentStep - 1) as CalculatorStep });
      // Scroll to top of the page to show the new step
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const calculateSavingsAsync = async () => {
    setIsCalculating(true);
    analytics.trackEvent('calculation_start', formData);
    
    try {
      // Processing stages simulation
      const processingStages = [
        'Initializing calculation...',
        'Analyzing portfolio data...',
        'Processing role requirements...',
        'Calculating cost savings...',
        'Optimizing team structure...',
        'Generating recommendations...',
        'Finalizing results...'
      ];

      for (let i = 0; i < processingStages.length; i++) {
        setProcessingStage(processingStages[i]!);
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      }
      
      const result = calculateSavings(formData);
      setCalculationResult(result);
      setProcessingStage('');
      
      // Advance to step 5 (results) after calculation is complete
      updateFormData({ currentStep: 5 });
      // Scroll to top to show the step indicator and results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      analytics.trackEvent('calculation_complete', { 
        result
      });
      onComplete?.(result);
    } catch (error) {
      console.error('Calculation error:', error);
      analytics.trackEvent('error', { type: 'calculation_error', error: error?.toString() });
    } finally {
      setIsCalculating(false);
      setProcessingStage('');
    }
  };

  const restartCalculator = () => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      sessionId: generateSessionId(),
      startedAt: new Date(),
      lastUpdatedAt: new Date()
    });
    setCalculationResult(null);
    // Scroll to top to show step 1 and step indicator
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    analytics.trackEvent('calculator_restart');
    exitIntentContext.reset();
  };

  const canProceedFromStep = (step: CalculatorStep): boolean => {
    switch (step) {
      case 1: return formData.portfolioSize !== '';
      case 2: return Object.values(formData.selectedRoles).some(Boolean);
      case 3: return Object.values(formData.selectedTasks).some(Boolean) || 
                     Object.values(formData.customTasks).some((tasks: any) => Array.isArray(tasks) && tasks.length > 0);
      case 4: {
        // NEW: Multi-level experience validation
        const selectedRoles = Object.entries(formData.selectedRoles)
          .filter(([_, selected]: [string, boolean]) => selected)
          .map(([roleId]: [string, boolean]) => roleId);
        
        // Check if all selected roles have complete experience distribution
        return selectedRoles.every((roleId: string) => {
          const distribution = formData.roleExperienceDistribution?.[roleId];
          return distribution && distribution.isComplete;
        });
      }
      default: return true;
    }
  };

  const renderStep = () => {
    switch (formData.currentStep) {
      case 1:
        return (
          <PortfolioStep
            value={formData.portfolioSize}
            manualData={formData.manualPortfolioData}
            locationData={locationData}
            isLoadingLocation={isLoadingLocation}
            locationError={locationError}
            isEditingLocation={isEditingLocation}
            manualLocation={manualLocation}
            tempLocation={tempLocation}
            countryRegions={countryRegions}
            onLocationEditStart={startLocationEdit}
            onLocationEditSave={saveLocationEdit}
            onLocationEditCancel={cancelLocationEdit}
            onLocationReset={resetToAutoLocation}
            onTempLocationChange={setTempLocation}
            getEffectiveLocation={getEffectiveLocation}
            onChange={(portfolioSize, manualData) => updateFormData({ 
              portfolioSize, 
              ...(manualData !== undefined && { manualPortfolioData: manualData })
            })}
          />
        );
      case 2:
        return (
          <RoleSelectionStep
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            onChange={(selectedRoles, teamSize, customRoles, userLocation) => updateFormData({ 
              selectedRoles, 
              teamSize, 
              customRoles: customRoles || {},
              ...(userLocation !== undefined && { userLocation })
            })}
          />
        );
      case 3:
        return (
          <TaskSelectionStep
            selectedRoles={formData.selectedRoles}
            selectedTasks={formData.selectedTasks}
            customTasks={formData.customTasks}
            onChange={(selectedTasks, customTasks) => updateFormData({ selectedTasks, customTasks })}
          />
        );
      case 4:
        return (
          <ExperienceStep
            value={formData.experienceLevel}
            selectedRoles={formData.selectedRoles}
            customRoles={formData.customRoles || {}}
            teamSize={formData.teamSize}
            roleExperienceLevels={formData.roleExperienceLevels || {}}
            roleExperienceDistribution={formData.roleExperienceDistribution || {}}
            {...(formData.userLocation && { userLocation: formData.userLocation })}
            onChange={(experienceLevel) => updateFormData({ experienceLevel })}
            onRoleExperienceChange={(roleExperienceLevels) => updateFormData({ roleExperienceLevels })}
            onRoleExperienceDistributionChange={(roleExperienceDistribution) => updateFormData({ roleExperienceDistribution })}
            onCalculate={calculateSavingsAsync}
            isCalculating={isCalculating}
          />
        );
      case 5:
        return (
          <ResultsStep
            result={calculationResult!}
            formData={formData}
            onRestart={restartCalculator}
          />
        );
      default:
        return null;
    }
  };

  const getStepTitle = (step: CalculatorStep): string => {
    const titles = {
      1: 'Portfolio Size',
      2: 'Team Roles',
      3: 'Task Selection', 
      4: 'Experience Level',
      5: 'Your Results'
    };
    return titles[step] || 'Unknown Step';
  };

  const getStepIcon = (step: CalculatorStep) => {
    const icons = {
      1: TrendingUp,
      2: Users,
      3: Target,
      4: Calculator,
      5: Sparkles
    };
    const IconComponent = icons[step] || Calculator;
    return <IconComponent className="h-5 w-5" />;
  };

  const getStepDescription = (step: CalculatorStep): string => {
    const descriptions = {
      1: 'Tell us about your property portfolio size and management structure',
      2: 'Select the roles you want to offshore and team size requirements',
      3: 'Choose specific tasks for each role to get accurate cost projections',
      4: 'Set experience requirements to match your quality standards',
      5: 'Your comprehensive savings breakdown and implementation guide'
    };
    return descriptions[step] || '';
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 pattern-neural-grid opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-neural-blue-400/10 to-quantum-purple-400/10 rounded-full blur-3xl animate-neural-float pointer-events-none" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
              >
        {/* Calculator Title */}
        <div className="mb-8 text-center">
          <h1 className="text-display-3 gradient-text-neural font-display leading-tight">
            Offshore Scaling Calculator
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="my-12 -mx-[50vw] ml-[calc(-50vw+50%)] mr-[calc(-50vw+50%)] px-[50vw] pl-[calc(50vw-50%+1.5rem)] pr-[calc(50vw-50%+1.5rem)] lg:pl-[calc(50vw-50%+2rem)] lg:pr-[calc(50vw-50%+2rem)] pt-8 pb-2 bg-neural-blue-50/30 border-y border-neural-blue-100/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neural-blue-300/20 to-transparent animate-neural-shimmer" />
          <div className="absolute inset-0 bg-gradient-to-br from-neural-blue-400/10 via-quantum-purple-400/15 to-cyber-green-400/10 animate-neural-pulse" />
          <div className="relative z-10">
            <StepIndicator 
              currentStep={formData.currentStep} 
              completedSteps={[]}
            />
          </div>
        </div>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isCalculating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neural-blue-900/80 backdrop-blur-lg z-50 flex items-center justify-center"
            >
              <Card 
                variant="quantum-glass" 
                className="p-12 text-center max-w-md mx-4"
                aiPowered={true}
                neuralGlow={true}
              >
                <>
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-neural-primary rounded-full flex items-center justify-center shadow-neural-glow">
                      <Calculator className="h-8 w-8 text-white animate-neural-pulse" />
                    </div>
                    
                    <h3 className="text-headline-3 gradient-text-neural mb-2 font-display">
                      Calculating Your Savings
                    </h3>
                    
                    <motion.p 
                      key={processingStage}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-neural-blue-600 font-medium"
                    >
                      {processingStage}
                    </motion.p>
                  </div>
                  
                  {/* Processing dots */}
                  <div className="loading-neural-dots justify-center">
                    <div className="animate-neural-pulse"></div>
                    <div className="animate-neural-pulse [animation-delay:0.2s]"></div>
                    <div className="animate-neural-pulse [animation-delay:0.4s]"></div>
                  </div>
                </>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {formData.currentStep < 5 && (
          <Card 
            variant="neural-elevated" 
            className="mt-8 p-6"
            hoverLift={false}
          >
            <>
              {/* Desktop Layout */}
              <div className="hidden sm:flex items-center justify-between">
              <div className="flex items-center gap-4">
                {formData.currentStep === 1 ? (
                  <Link href="/">
                    <Button
                      variant="quantum-secondary"
                      leftIcon={<Home className="h-4 w-4" />}
                      className="w-40 h-12"
                    >
                      Back to Home
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="quantum-secondary"
                    onClick={prevStep}
                    leftIcon={<ArrowLeft className="h-4 w-4" />}
                    className="w-40 h-12"
                  >
                    Previous
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-sm text-neural-blue-600 font-medium">
                  Step {formData.currentStep} of 5
                </div>
                
                {formData.currentStep < 4 && (
                  <Button
                    variant="neural-primary"
                    onClick={nextStep}
                    disabled={!canProceedFromStep(formData.currentStep)}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                    className="w-40 h-12"
                  >
                    Continue
                  </Button>
                )}
                
                {formData.currentStep === 4 && (
                  <Button
                    variant="neural-primary"
                    onClick={calculateSavingsAsync}
                    disabled={isCalculating || !canProceedFromStep(4)}
                    className="w-40 h-12"
                  >
                    {isCalculating ? 'Calculating...' : 'Calculate Savings'}
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Layout (stacked vertically) */}
            <div className="flex sm:hidden flex-col items-center gap-4">
              {/* Step counter at top */}
              <div className="text-sm text-neural-blue-600 font-medium">
                Step {formData.currentStep} of 5
              </div>
              
              {/* Continue button */}
              {formData.currentStep < 4 && (
                <Button
                  variant="neural-primary"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(formData.currentStep)}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  className="w-full h-12"
                >
                  Continue
                </Button>
              )}
              
              {/* Calculate button for step 4 */}
              {formData.currentStep === 4 && (
                <Button
                  variant="neural-primary"
                  onClick={calculateSavingsAsync}
                  disabled={isCalculating || !canProceedFromStep(4)}
                  className="w-full h-12"
                >
                  {isCalculating ? 'Calculating...' : 'Calculate My Detailed Savings'}
                </Button>
              )}
              
              {/* Back/Previous button at bottom */}
              {formData.currentStep === 1 ? (
                <Link href="/" className="w-full">
                  <Button
                    variant="quantum-secondary"
                    leftIcon={<Home className="h-4 w-4" />}
                    className="w-full h-12"
                  >
                    Back to Home
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="quantum-secondary"
                  onClick={prevStep}
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                  className="w-full h-12"
                >
                  Previous
                </Button>
              )}
            </div>
            </>
          </Card>
        )}
      </motion.div>
    </div>
  );
} 