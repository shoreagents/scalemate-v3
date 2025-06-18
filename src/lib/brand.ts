import { ScaleMateBrand } from '@/types/brand';

export const SCALEMATE_BRAND: ScaleMateBrand = {
  identity: {
    name: 'ScaleMate',
    tagline: 'Scale Smart. Save More. Succeed Faster.',
    mission: 'Empowering businesses to unlock their potential through intelligent offshore scaling.',
    values: [
      'Innovation through Intelligence',
      'Transparency in Every Calculation', 
      'Excellence in Execution',
      'Partnership for Growth'
    ]
  },

  visual: {
    name: 'ScaleMate Design System',
    tagline: 'Intelligent. Elegant. Interactive.',
    description: 'A design system built for the future of offshore scaling.',
    
    colors: {
      primary: {
        50: '#f0f4ff',
        100: '#e0e7ff',
        200: '#c7d2fe',
        300: '#a5b4fc',
        400: '#818cf8',
        500: '#6366f1', // Main brand color
        600: '#4f46e5',
        700: '#4338ca',
        800: '#3730a3',
        900: '#312e81',
        950: '#1e1b4b'
      },
      secondary: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f5d0fe',
        300: '#f0abfc',
        400: '#e879f9',
        500: '#d946ef', // Accent color
        600: '#c026d3',
        700: '#a21caf',
        800: '#86198f',
        900: '#701a75',
        950: '#4a044e'
      },
      accent: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Success/growth color
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16'
      },
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
        950: '#0a0a0a'
      }
    },

    typography: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      }
    },

    spacing: {
      px: '1px',
      0: '0px',
      0.5: '0.125rem',
      1: '0.25rem',
      1.5: '0.375rem',
      2: '0.5rem',
      2.5: '0.625rem',
      3: '0.75rem',
      3.5: '0.875rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      7: '1.75rem',
      8: '2rem',
      9: '2.25rem',
      10: '2.5rem',
      11: '2.75rem',
      12: '3rem',
      14: '3.5rem',
      16: '4rem',
      18: '4.5rem',
      20: '5rem',
      24: '6rem',
      28: '7rem',
      32: '8rem',
      36: '9rem',
      40: '10rem',
      44: '11rem',
      48: '12rem',
      52: '13rem',
      56: '14rem',
      60: '15rem',
      64: '16rem',
      72: '18rem',
      80: '20rem',
      88: '22rem',
      96: '24rem',
      100: '25rem',
      112: '28rem',
      128: '32rem'
    },

    animations: {
      fadeIn: 'fadeIn 0.5s ease-in-out',
      slideUp: 'slideUp 0.4s ease-out',
      slideDown: 'slideDown 0.4s ease-out',
      slideRight: 'slideRight 0.4s ease-out',
      scaleIn: 'scaleIn 0.3s ease-out',
      bounceGentle: 'bounceGentle 2s infinite',
      glow: 'glow 2s ease-in-out infinite alternate',
      gradient: 'gradient 3s ease infinite',
      float: 'float 6s ease-in-out infinite',
      shimmer: 'shimmer 2s linear infinite'
    },

    shadows: {
      glow: '0 0 20px rgba(99, 102, 241, 0.3)',
      glowLg: '0 0 40px rgba(99, 102, 241, 0.4)',
      innerGlow: 'inset 0 0 20px rgba(99, 102, 241, 0.1)',
      brand: '0 10px 40px rgba(99, 102, 241, 0.2)',
      brandLg: '0 20px 60px rgba(99, 102, 241, 0.3)'
    },

    components: {
      button: {
        primary: {
          default: 'bg-brand-primary-500 text-white border-brand-primary-500',
          hover: 'bg-brand-primary-600 border-brand-primary-600 shadow-glow',
          active: 'bg-brand-primary-700 border-brand-primary-700 scale-95',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
        },
        secondary: {
          default: 'bg-brand-secondary-500 text-white border-brand-secondary-500',
          hover: 'bg-brand-secondary-600 border-brand-secondary-600 shadow-glow',
          active: 'bg-brand-secondary-700 border-brand-secondary-700 scale-95',
          focus: 'ring-2 ring-brand-secondary-300 ring-offset-2',
          disabled: 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
        },
        accent: {
          default: 'bg-brand-accent-500 text-white border-brand-accent-500',
          hover: 'bg-brand-accent-600 border-brand-accent-600 shadow-glow',
          active: 'bg-brand-accent-700 border-brand-accent-700 scale-95',
          focus: 'ring-2 ring-brand-accent-300 ring-offset-2',
          disabled: 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
        },
        ghost: {
          default: 'bg-transparent text-brand-primary-600 border-transparent',
          hover: 'bg-brand-primary-50 text-brand-primary-700',
          active: 'bg-brand-primary-100 text-brand-primary-800 scale-95',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'text-neutral-400 cursor-not-allowed'
        },
        outline: {
          default: 'bg-transparent text-brand-primary-600 border-brand-primary-300',
          hover: 'bg-brand-primary-50 border-brand-primary-400',
          active: 'bg-brand-primary-100 border-brand-primary-500 scale-95',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'text-neutral-400 border-neutral-300 cursor-not-allowed'
        },
        destructive: {
          default: 'bg-red-500 text-white border-red-500',
          hover: 'bg-red-600 border-red-600 shadow-glow',
          active: 'bg-red-700 border-red-700 scale-95',
          focus: 'ring-2 ring-red-300 ring-offset-2',
          disabled: 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
        }
      },
      card: {
        primary: {
          default: 'bg-white border border-neutral-200 shadow-sm',
          hover: 'shadow-brand border-brand-primary-200',
          active: 'shadow-brand-lg border-brand-primary-300 scale-[0.98]',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        },
        secondary: {
          default: 'bg-brand-primary-50 border border-brand-primary-100',
          hover: 'bg-brand-primary-100 border-brand-primary-200 shadow-brand',
          active: 'bg-brand-primary-200 border-brand-primary-300 scale-[0.98]',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        },
        accent: {
          default: 'bg-gradient-to-br from-brand-primary-500 to-brand-secondary-500 text-white',
          hover: 'shadow-brand-lg scale-[1.02]',
          active: 'scale-[0.98]',
          focus: 'ring-2 ring-white ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        },
        ghost: {
          default: 'bg-transparent border-transparent',
          hover: 'bg-neutral-50 border-neutral-100',
          active: 'bg-neutral-100 border-neutral-200 scale-[0.98]',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        },
        outline: {
          default: 'bg-transparent border border-neutral-300',
          hover: 'border-brand-primary-300 shadow-sm',
          active: 'border-brand-primary-400 scale-[0.98]',
          focus: 'ring-2 ring-brand-primary-300 ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        },
        destructive: {
          default: 'bg-red-50 border border-red-200',
          hover: 'bg-red-100 border-red-300 shadow-sm',
          active: 'bg-red-200 border-red-400 scale-[0.98]',
          focus: 'ring-2 ring-red-300 ring-offset-2',
          disabled: 'opacity-50 cursor-not-allowed'
        }
      },
      input: {
        primary: {
          default: 'bg-white border border-neutral-300 text-neutral-900',
          hover: 'border-brand-primary-400',
          active: 'border-brand-primary-500',
          focus: 'border-brand-primary-500 ring-2 ring-brand-primary-200',
          disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
        },
        secondary: {
          default: 'bg-brand-primary-50 border border-brand-primary-200 text-brand-primary-900',
          hover: 'border-brand-primary-300',
          active: 'border-brand-primary-400',
          focus: 'border-brand-primary-500 ring-2 ring-brand-primary-200',
          disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
        },
        accent: {
          default: 'bg-white border border-brand-accent-300 text-neutral-900',
          hover: 'border-brand-accent-400',
          active: 'border-brand-accent-500',
          focus: 'border-brand-accent-500 ring-2 ring-brand-accent-200',
          disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
        },
        ghost: {
          default: 'bg-transparent border-transparent text-neutral-900',
          hover: 'bg-neutral-50',
          active: 'bg-neutral-100',
          focus: 'bg-white border-brand-primary-500 ring-2 ring-brand-primary-200',
          disabled: 'text-neutral-500 cursor-not-allowed'
        },
        outline: {
          default: 'bg-transparent border border-neutral-300 text-neutral-900',
          hover: 'border-brand-primary-400',
          active: 'border-brand-primary-500',
          focus: 'border-brand-primary-500 ring-2 ring-brand-primary-200',
          disabled: 'text-neutral-500 border-neutral-300 cursor-not-allowed'
        },
        destructive: {
          default: 'bg-white border border-red-300 text-neutral-900',
          hover: 'border-red-400',
          active: 'border-red-500',
          focus: 'border-red-500 ring-2 ring-red-200',
          disabled: 'bg-neutral-100 text-neutral-500 cursor-not-allowed'
        }
      }
    }
  },

  voice: {
    tone: 'confident',
    personality: [
      'Intelligent and data-driven',
      'Transparent and trustworthy', 
      'Innovation-focused',
      'Results-oriented',
      'Partnership-minded'
    ],
    messaging: {
      headlines: [
        'Scale Your Business. Multiply Your Success.',
        'Intelligent Offshore Scaling Made Simple.',
        'Transform Your Operations. Amplify Your Growth.',
        'The Smart Way to Scale Globally.',
        'Unlock Your Business Potential with ScaleMate.'
      ],
      taglines: [
        'Scale Smart. Save More. Succeed Faster.',
        'Your Intelligent Scaling Partner.',
        'Growth Without Limits.',
        'Scaling Made Intelligent.'
      ],
      callsToAction: [
        'Calculate Your Savings',
        'Start Your Scaling Journey',
        'Unlock Your Potential',
        'Get Your Free Analysis',
        'Scale Smarter Today'
      ]
    }
  },

  logo: {
    primary: '/logo/scalemate-logo.svg',
    mark: '/logo/scalemate-mark.svg',
    wordmark: '/logo/scalemate-wordmark.svg',
    variants: {
      light: '/logo/scalemate-light.svg',
      dark: '/logo/scalemate-dark.svg',
      monochrome: '/logo/scalemate-mono.svg'
    }
  },

  icons: {
    style: 'outline',
    weight: 'medium',
    size: {
      xs: '1rem',
      sm: '1.25rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem'
    }
  },

  motion: {
    variants: {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: {
          duration: 0.3,
          easing: 'ease-out'
        }
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: {
          duration: 0.4,
          easing: 'ease-out'
        }
      },
      scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
        transition: {
          duration: 0.3,
          easing: 'ease-out'
        }
      },
      float: {
        initial: { y: 0 },
        animate: { y: [-10, 10, -10] },
        transition: {
          duration: 6,
          repeat: Infinity,
          easing: 'ease-in-out'
        }
      }
    },
    defaultVariant: 'fadeIn',
    stagger: 0.1
  }
} as const;

// Helper functions for brand usage
type ColorNames = 'primary' | 'secondary' | 'accent' | 'neutral';
type ColorShades = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

export const getBrandColor = (color: string, shade: string = '500'): string => {
  const [colorName, shadeValue] = color.includes('-') ? color.split('-') : [color, shade];
  
  const colorMap = {
    primary: SCALEMATE_BRAND.visual.colors.primary,
    secondary: SCALEMATE_BRAND.visual.colors.secondary,
    accent: SCALEMATE_BRAND.visual.colors.accent,
    neutral: SCALEMATE_BRAND.visual.colors.neutral
  };

  if (!colorName || !shadeValue) return color;
  
  const validColors: ColorNames[] = ['primary', 'secondary', 'accent', 'neutral'];
  const validShades: ColorShades[] = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  
  if (validColors.indexOf(colorName as ColorNames) === -1 || validShades.indexOf(shadeValue as ColorShades) === -1) {
    return color;
  }

  const colorKey = colorName as ColorNames;
  const shadeKey = shadeValue as ColorShades;
  
  return colorMap[colorKey][shadeKey] || color;
};

export const getBrandSpacing = (size: string) => {
  return SCALEMATE_BRAND.visual.spacing[size as keyof typeof SCALEMATE_BRAND.visual.spacing] || size;
};

export const getBrandAnimation = (name: string) => {
  return SCALEMATE_BRAND.visual.animations[name as keyof typeof SCALEMATE_BRAND.visual.animations] || name;
};

export const getComponentVariant = (component: string, variant: string, state: string = 'default') => {
  const comp = SCALEMATE_BRAND.visual.components[component as keyof typeof SCALEMATE_BRAND.visual.components];
  return comp?.[variant as keyof typeof comp]?.[state as keyof typeof comp.primary] || '';
}; 