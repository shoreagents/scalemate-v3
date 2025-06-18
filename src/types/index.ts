// Export all types for easy importing
export * from './calculator';
export * from './analytics';
export * from './brand';

// Re-export commonly used types with aliases
export type {
  FormData as CalculatorFormData,
  CalculationResult as SavingsCalculation,
  ContactInfo as UserContactInfo,
  ValidationError as FormError
} from './calculator';

export type {
  AnalyticsEvent as TrackingEvent,
  SessionSummary as UserSession
} from './analytics'; 