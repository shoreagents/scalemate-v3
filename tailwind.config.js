/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Neural Blue Palette - Primary AI Brand
        'neural-blue': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0066FF',   // Main neural brand color
          600: '#0052CC',
          700: '#0047B8',
          800: '#003D9A',
          900: '#00337A',
          950: '#001F4D',
        },
        // Quantum Purple Palette - AI Intelligence
        'quantum-purple': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#6B46C1',   // Main quantum color
          600: '#553C9A',
          700: '#4C1D95',
          800: '#3B1A7A',
          900: '#2D1B69',
          950: '#1E1B4B',
        },
        // Cyber Green Palette - Success & Growth
        'cyber-green': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',   // Main success color
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22',
        },
        // Matrix Orange Palette - Energy & Action
        'matrix-orange': {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',   // Main energy color
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
          950: '#451A03',
        },
        // Backward compatibility aliases
        'brand-primary': {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#0066FF',
          600: '#0052CC',
          700: '#0047B8',
          800: '#003D9A',
          900: '#00337A',
          950: '#001F4D'
        },
        'brand-secondary': {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#6B46C1',
          600: '#553C9A',
          700: '#4C1D95',
          800: '#3B1A7A',
          900: '#2D1B69',
          950: '#1E1B4B'
        },
        'brand-accent': {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
          950: '#022C22'
        },
        brand: {
          primary: {
            50: '#EFF6FF',
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#0066FF',
            600: '#0052CC',
            700: '#0047B8',
            800: '#003D9A',
            900: '#00337A',
            950: '#001F4D'
          },
          secondary: {
            50: '#F5F3FF',
            100: '#EDE9FE',
            200: '#DDD6FE',
            300: '#C4B5FD',
            400: '#A78BFA',
            500: '#6B46C1',
            600: '#553C9A',
            700: '#4C1D95',
            800: '#3B1A7A',
            900: '#2D1B69',
            950: '#1E1B4B'
          },
          accent: {
            50: '#ECFDF5',
            100: '#D1FAE5',
            200: '#A7F3D0',
            300: '#6EE7B7',
            400: '#34D399',
            500: '#10B981',
            600: '#059669',
            700: '#047857',
            800: '#065F46',
            900: '#064E3B',
            950: '#022C22'
          }
        },
        // Enhanced Neutral grays
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
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      },
      spacing: {
        // AI-Enhanced spacing scale
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem'
      },
      animation: {
        // Neural Animations
        'neural-fade-in': 'neuralFadeIn 0.5s ease-in-out',
        'neural-slide-up': 'neuralSlideUp 0.4s ease-out',
        'neural-slide-down': 'neuralSlideDown 0.4s ease-out',
        'neural-slide-right': 'neuralSlideRight 0.4s ease-out',
        'neural-scale-in': 'neuralScaleIn 0.3s ease-out',
        'neural-pulse': 'neuralPulse 3s ease-in-out infinite',
        'neural-shimmer': 'neuralShimmer 2s infinite',
        'neural-float': 'neuralFloat 6s ease-in-out infinite',
        'neural-glow': 'neuralGlow 2s ease-in-out infinite alternate',
        'neural-processing': 'neuralProcessing 2s infinite',
        
        // Quantum Animations
        'quantum-pulse': 'quantumPulse 4s ease-in-out infinite',
        'quantum-morph': 'quantumMorph 8s ease-in-out infinite',
        
        // Cyber Animations
        'cyber-scan': 'cyberScan 3s ease-in-out infinite',
        'cyber-boost': 'cyberBoost 0.5s ease-out',
        
        // Matrix Animations
        'matrix-rain': 'matrixRain 20s linear infinite',
        'matrix-pulse': 'matrixPulse 1s ease-in-out infinite',
        
        // AI Processing Animations
        'ai-think': 'aiThink 1.5s ease-in-out infinite',
        'ai-process': 'aiProcess 2s ease-in-out infinite',
        
        // Legacy animations (for backward compatibility)
        'fade-in': 'neuralFadeIn 0.5s ease-in-out',
        'slide-up': 'neuralSlideUp 0.4s ease-out',
        'scale-in': 'neuralScaleIn 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'glow': 'neuralGlow 2s ease-in-out infinite alternate',
        'gradient': 'gradient 3s ease infinite',
        'float': 'neuralFloat 6s ease-in-out infinite',
        'shimmer': 'neuralShimmer 2s linear infinite'
      },
      keyframes: {
        // Neural Keyframes
        neuralFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        neuralSlideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        neuralSlideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        neuralSlideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        neuralScaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        neuralPulse: {
          '0%, 100%': { 
            opacity: '0.5', 
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(0, 102, 255, 0.4)'
          },
          '50%': { 
            opacity: '1', 
            transform: 'scale(1.05)',
            boxShadow: '0 0 20px 10px rgba(0, 102, 255, 0.1)'
          },
        },
        neuralShimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        neuralFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        neuralGlow: {
          '0%': { boxShadow: '0 0 20px rgba(0, 102, 255, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(0, 102, 255, 0.6)' },
        },
        neuralProcessing: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        
        // Quantum Keyframes
        quantumPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.1)' },
        },
        quantumMorph: {
          '0%, 100%': { borderRadius: '16px' },
          '25%': { borderRadius: '32px' },
          '50%': { borderRadius: '8px' },
          '75%': { borderRadius: '24px' },
        },
        
        // Cyber Keyframes
        cyberScan: {
          '0%': { 
            backgroundPosition: '-100% 0',
            opacity: '0'
          },
          '50%': { 
            backgroundPosition: '0% 0',
            opacity: '1'
          },
          '100%': { 
            backgroundPosition: '100% 0',
            opacity: '0'
          },
        },
        cyberBoost: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        
        // Matrix Keyframes
        matrixRain: {
          '0%': { transform: 'translateY(-100vh)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        matrixPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' },
        },
        
        // AI Processing Keyframes
        aiThink: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        aiProcess: {
          '0%': { 
            background: 'linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.1), transparent)',
            transform: 'translateX(-100%)'
          },
          '100%': { 
            background: 'linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.1), transparent)',
            transform: 'translateX(100%)'
          },
        },
        
        // Legacy keyframes (for backward compatibility)
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-brand': 'linear-gradient(135deg, var(--tw-gradient-stops))',
        'gradient-neural-primary': 'linear-gradient(135deg, #0066FF, #6B46C1)',
        'gradient-neural-secondary': 'linear-gradient(135deg, #3385FF, #8B5CF6)',
        'gradient-neural-subtle': 'linear-gradient(135deg, rgba(0, 102, 255, 0.1), rgba(107, 70, 193, 0.1))',
        'gradient-success': 'linear-gradient(135deg, #10B981, #059669)',
        'gradient-energy': 'linear-gradient(135deg, #F59E0B, #D97706)',
        'mesh-gradient': 'radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%), radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%)',
        'neural-mesh': 'radial-gradient(at 40% 20%, hsla(228,100%,74%,1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,1) 0px, transparent 50%), radial-gradient(at 80% 50%, hsla(340,100%,76%,1) 0px, transparent 50%), radial-gradient(at 0% 100%, hsla(22,100%,77%,1) 0px, transparent 50%), radial-gradient(at 80% 100%, hsla(242,100%,70%,1) 0px, transparent 50%), radial-gradient(at 0% 0%, hsla(343,100%,76%,1) 0px, transparent 50%)'
      },
      backgroundSize: {
        '200%': '200%',
        '300%': '300%',
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'neural-glow': '0 0 20px rgba(0, 102, 255, 0.3)',
        'quantum-glow': '0 0 20px rgba(107, 70, 193, 0.3)',
        'cyber-glow': '0 0 20px rgba(16, 185, 129, 0.3)',
        'matrix-glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'neural-lg': '0 20px 40px rgba(0, 102, 255, 0.2)',
        'ai-processing': '0 0 30px rgba(0, 102, 255, 0.4)',
        
        // Legacy shadows (for backward compatibility)
        'glow': '0 0 20px rgba(0, 102, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 102, 255, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(0, 102, 255, 0.1)',
        'brand': '0 10px 40px rgba(0, 102, 255, 0.2)',
        'brand-lg': '0 20px 60px rgba(0, 102, 255, 0.3)'
      }
    }
  },
  plugins: []
} 