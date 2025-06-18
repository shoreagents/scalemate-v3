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

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (!enabled || hasShown || !isActive) return;
    
    // More aggressive detection - check if mouse is moving to top or sides of screen
    if (
      (e.clientY <= threshold && e.clientX > 0 && e.clientX < window.innerWidth) ||
      e.clientX <= 0 ||
      e.clientX >= window.innerWidth - 1
    ) {
      console.log('Exit intent triggered by mouse leave:', { clientX: e.clientX, clientY: e.clientY });
      setHasShown(true);
      onExitIntent();
    }
  }, [enabled, hasShown, isActive, threshold, onExitIntent]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!enabled || hasShown || !isActive) return;
    
    // Detect rapid upward movement towards browser controls
    if (e.clientY <= threshold && e.movementY < -50) {
      console.log('Exit intent triggered by rapid upward movement:', { clientY: e.clientY, movementY: e.movementY });
      setHasShown(true);
      onExitIntent();
    }
  }, [enabled, hasShown, isActive, threshold, onExitIntent]);

  const handleBeforeUnload = useCallback((e: BeforeUnloadEvent) => {
    if (!enabled || hasShown || !isActive) return;
    
    console.log('Exit intent triggered by beforeunload');
    setHasShown(true);
    onExitIntent();
    
    // Optional: Show browser's default "Are you sure?" dialog
    // e.preventDefault();
    // e.returnValue = '';
  }, [enabled, hasShown, isActive, onExitIntent]);

  const handleVisibilityChange = useCallback(() => {
    if (!enabled || hasShown || !isActive) return;
    
    if (document.visibilityState === 'hidden') {
      console.log('Exit intent triggered by visibility change');
      setHasShown(true);
      onExitIntent();
    }
  }, [enabled, hasShown, isActive, onExitIntent]);

  // Add keyboard shortcut detection (Ctrl+W, Ctrl+T, etc.)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled || hasShown || !isActive) return;
    
    // Detect common exit shortcuts
    if (
      (e.ctrlKey && (e.key === 'w' || e.key === 'W')) || // Ctrl+W
      (e.ctrlKey && (e.key === 't' || e.key === 'T')) || // Ctrl+T
      (e.metaKey && (e.key === 'w' || e.key === 'W'))    // Cmd+W on Mac
    ) {
      console.log('Exit intent triggered by keyboard shortcut:', e.key);
      setHasShown(true);
      onExitIntent();
    }
  }, [enabled, hasShown, isActive, onExitIntent]);

  useEffect(() => {
    if (!enabled) return;

    // Activate after delay
    const timer = setTimeout(() => {
      setIsActive(true);
      console.log('Exit intent activated after delay');
    }, delay);

    return () => clearTimeout(timer);
  }, [enabled, delay]);

  useEffect(() => {
    if (!enabled || !isActive) return;

    console.log('Exit intent listeners attached');

    // Add event listeners
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      console.log('Exit intent listeners removed');
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, isActive, handleMouseLeave, handleMouseMove, handleBeforeUnload, handleVisibilityChange, handleKeyDown]);

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