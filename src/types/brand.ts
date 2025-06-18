// ScaleMate Brand System Types
export interface BrandColors {
  readonly primary: {
    readonly 50: string;
    readonly 100: string;
    readonly 200: string;
    readonly 300: string;
    readonly 400: string;
    readonly 500: string; // Main brand
    readonly 600: string;
    readonly 700: string;
    readonly 800: string;
    readonly 900: string;
    readonly 950: string;
  };
  readonly secondary: {
    readonly 50: string;
    readonly 100: string;
    readonly 200: string;
    readonly 300: string;
    readonly 400: string;
    readonly 500: string; // Accent
    readonly 600: string;
    readonly 700: string;
    readonly 800: string;
    readonly 900: string;
    readonly 950: string;
  };
  readonly accent: {
    readonly 50: string;
    readonly 100: string;
    readonly 200: string;
    readonly 300: string;
    readonly 400: string;
    readonly 500: string; // Success
    readonly 600: string;
    readonly 700: string;
    readonly 800: string;
    readonly 900: string;
    readonly 950: string;
  };
  readonly neutral: {
    readonly 50: string;
    readonly 100: string;
    readonly 200: string;
    readonly 300: string;
    readonly 400: string;
    readonly 500: string;
    readonly 600: string;
    readonly 700: string;
    readonly 800: string;
    readonly 900: string;
    readonly 950: string;
  };
}

export interface BrandTypography {
  readonly fontFamily: {
    readonly sans: readonly string[];
    readonly display: readonly string[];
    readonly mono: readonly string[];
  };
  readonly fontSize: {
    readonly xs: readonly [string, { lineHeight: string }];
    readonly sm: readonly [string, { lineHeight: string }];
    readonly base: readonly [string, { lineHeight: string }];
    readonly lg: readonly [string, { lineHeight: string }];
    readonly xl: readonly [string, { lineHeight: string }];
    readonly '2xl': readonly [string, { lineHeight: string }];
    readonly '3xl': readonly [string, { lineHeight: string }];
    readonly '4xl': readonly [string, { lineHeight: string }];
    readonly '5xl': readonly [string, { lineHeight: string }];
    readonly '6xl': readonly [string, { lineHeight: string }];
    readonly '7xl': readonly [string, { lineHeight: string }];
    readonly '8xl': readonly [string, { lineHeight: string }];
    readonly '9xl': readonly [string, { lineHeight: string }];
  };
}

export interface BrandSpacing {
  readonly px: string;
  readonly 0: string;
  readonly 0.5: string;
  readonly 1: string;
  readonly 1.5: string;
  readonly 2: string;
  readonly 2.5: string;
  readonly 3: string;
  readonly 3.5: string;
  readonly 4: string;
  readonly 5: string;
  readonly 6: string;
  readonly 7: string;
  readonly 8: string;
  readonly 9: string;
  readonly 10: string;
  readonly 11: string;
  readonly 12: string;
  readonly 14: string;
  readonly 16: string;
  readonly 18: string;
  readonly 20: string;
  readonly 24: string;
  readonly 28: string;
  readonly 32: string;
  readonly 36: string;
  readonly 40: string;
  readonly 44: string;
  readonly 48: string;
  readonly 52: string;
  readonly 56: string;
  readonly 60: string;
  readonly 64: string;
  readonly 72: string;
  readonly 80: string;
  readonly 88: string;
  readonly 96: string;
  readonly 100: string;
  readonly 112: string;
  readonly 128: string;
}

export interface BrandAnimations {
  readonly fadeIn: string;
  readonly slideUp: string;
  readonly slideDown: string;
  readonly slideRight: string;
  readonly scaleIn: string;
  readonly bounceGentle: string;
  readonly glow: string;
  readonly gradient: string;
  readonly float: string;
  readonly shimmer: string;
}

export interface BrandShadows {
  readonly glow: string;
  readonly glowLg: string;
  readonly innerGlow: string;
  readonly brand: string;
  readonly brandLg: string;
}

export interface InteractiveVariant {
  readonly default: string;
  readonly hover: string;
  readonly active: string;
  readonly focus: string;
  readonly disabled: string;
}

export interface ComponentVariant {
  readonly primary: InteractiveVariant;
  readonly secondary: InteractiveVariant;
  readonly accent: InteractiveVariant;
  readonly ghost: InteractiveVariant;
  readonly outline: InteractiveVariant;
  readonly destructive: InteractiveVariant;
}

export interface BrandSystem {
  readonly name: string;
  readonly tagline: string;
  readonly description: string;
  readonly colors: BrandColors;
  readonly typography: BrandTypography;
  readonly spacing: BrandSpacing;
  readonly animations: BrandAnimations;
  readonly shadows: BrandShadows;
  readonly components: {
    readonly button: ComponentVariant;
    readonly card: ComponentVariant;
    readonly input: ComponentVariant;
  };
}

// Interactive element types
export type InteractionType = 
  | 'hover'
  | 'click'
  | 'focus'
  | 'drag'
  | 'pinch'
  | 'scroll'
  | 'keypress';

export interface InteractionEvent {
  readonly type: InteractionType;
  readonly target: string;
  readonly timestamp: number;
  readonly data?: Record<string, unknown>;
}

export interface AnimationConfig {
  readonly duration: number;
  readonly delay?: number;
  readonly easing: string;
  readonly repeat?: number | 'infinite';
  readonly direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
}

export interface MotionVariant {
  readonly initial: Record<string, unknown>;
  readonly animate: Record<string, unknown>;
  readonly exit?: Record<string, unknown>;
  readonly whileHover?: Record<string, unknown>;
  readonly whileTap?: Record<string, unknown>;
  readonly whileFocus?: Record<string, unknown>;
  readonly transition?: AnimationConfig;
}

export interface ComponentMotion {
  readonly variants: Record<string, MotionVariant>;
  readonly defaultVariant: string;
  readonly stagger?: number;
}

// Brand voice and personality
export interface BrandVoice {
  readonly tone: 'professional' | 'friendly' | 'confident' | 'innovative';
  readonly personality: readonly string[];
  readonly messaging: {
    readonly headlines: readonly string[];
    readonly taglines: readonly string[];
    readonly callsToAction: readonly string[];
  };
}

// Logo and iconography
export interface BrandLogo {
  readonly primary: string;
  readonly mark: string;
  readonly wordmark: string;
  readonly variants: {
    readonly light: string;
    readonly dark: string;
    readonly monochrome: string;
  };
}

export interface IconSystem {
  readonly style: 'outline' | 'filled' | 'duotone';
  readonly weight: 'thin' | 'light' | 'regular' | 'medium' | 'bold';
  readonly size: {
    readonly xs: string;
    readonly sm: string;
    readonly md: string;
    readonly lg: string;
    readonly xl: string;
  };
}

// Complete brand identity
export interface ScaleMateBrand {
  readonly identity: {
    readonly name: string;
    readonly tagline: string;
    readonly mission: string;
    readonly values: readonly string[];
  };
  readonly visual: BrandSystem;
  readonly voice: BrandVoice;
  readonly logo: BrandLogo;
  readonly icons: IconSystem;
  readonly motion: ComponentMotion;
} 