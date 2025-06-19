import { useState, useEffect, useCallback } from 'react';

interface ExitIntentOptions {
  enabled: boolean;
  threshold: number; // pixels from top
  delay: number; // minimum time on page before showing (ms)
  onExitIntent: () => void;
}

export function useExitIntent({
  enabled = true,
  threshold = 10, // Reduced to 10px for easier triggering
  delay = 3000, // Reduced to 3 seconds
  onExitIntent
}: ExitIntentOptions) {
  const [hasShown, setHasShown] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // All automatic triggers removed - popup only shows when manually triggered

  useEffect(() => {
    if (!enabled) return;

    // Activate after delay
    const timer = setTimeout(() => {
      setIsActive(true);
      console.log('Exit intent activated after delay');
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  // No event listeners needed - manual triggering only

  const reset = () => {
    setHasShown(false);
    setIsActive(false);
    console.log('Exit intent reset');
  };

  const disable = () => {
    setHasShown(true);
    console.log('Exit intent disabled');
  };

  return {
    hasShown,
    isActive,
    reset,
    disable
  };
} 