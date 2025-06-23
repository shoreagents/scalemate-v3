import { useState, useEffect, useCallback } from 'react';

interface ExitIntentOptions {
  enabled: boolean;
  threshold: number; // pixels from top
  delay: number; // minimum time on page before showing (ms)
  onExitIntent: () => void;
}

export function useExitIntent({
  enabled = true,
  threshold = 10,
  delay = 3000,
  onExitIntent
}: ExitIntentOptions) {
  // DISABLED: Always return inactive state
  const [hasShown] = useState(false);
  const [isActive] = useState(false);

  // All event handlers are disabled - they do nothing
  const handleMouseLeave = useCallback(() => {
    // Disabled
  }, []);

  const handleMouseMove = useCallback(() => {
    // Disabled
  }, []);

  const handleBeforeUnload = useCallback(() => {
    // Disabled
  }, []);

  const handleVisibilityChange = useCallback(() => {
    // Disabled
  }, []);

  const handleKeyDown = useCallback(() => {
    // Disabled
  }, []);

  // No timers or event listeners are attached when disabled
  useEffect(() => {
    // Disabled - no activation timer
    return;
  }, []);

  useEffect(() => {
    // Disabled - no event listeners attached
    return;
  }, []);

  const reset = () => {
    // Disabled - no-op
    console.log('Exit intent reset (disabled)');
  };

  const disable = () => {
    // Disabled - no-op
    console.log('Exit intent disable (already disabled)');
  };

  return {
    hasShown,
    isActive,
    reset,
    disable
  };
} 