# Calculator Cache System

## Overview

The calculator cache system automatically saves user progress to localStorage and provides a popup to restore progress when users return to the calculator.

## Features

- **Auto-save**: Automatically saves form data as users progress through the calculator
- **Smart restore**: Shows a popup when users return with cached data
- **Cache expiration**: Cache expires after 24 hours
- **Graceful fallback**: Falls back to fresh start if cache is corrupted

## How it works

### 1. Auto-save functionality
- Every time `updateFormData()` is called, the current form state is automatically saved to localStorage
- Cache includes: form data, timestamp, session ID
- Cache key: `scalemate_calculator_cache`

### 2. Restore popup
- When users return to the calculator, the system checks for cached data
- If valid cached data exists and user has made progress (beyond step 1), a popup appears
- Popup shows:
  - Current step and progress percentage
  - Preview of cached data (portfolio size, selected roles, location)
  - Options to continue or start fresh

### 3. Cache management
- Cache expires after 24 hours
- Cache is cleared when:
  - User chooses "Start Fresh"
  - User completes the calculator
  - Cache is corrupted or invalid

## Components

### `useCalculatorCache` Hook
```typescript
const {
  hasCachedData,
  showRestorePopup,
  cachedStep,
  saveToCache,
  loadFromCache,
  clearCache,
  restoreFromCache,
  dismissRestorePopup
} = useCalculatorCache();
```

### `RestoreProgressPopup` Component
```typescript
<RestoreProgressPopup
  isOpen={showRestorePopup}
  onRestore={handleRestoreFromCache}
  onRestart={restartCalculator}
  onDismiss={dismissRestorePopup}
  cachedStep={cachedStep || 1}
  cachedData={{
    portfolioSize: "100-299",
    selectedRolesCount: 2,
    location: "United States"
  }}
/>
```

## Integration

The cache system is integrated into `OffshoreCalculator.tsx`:

1. **Initialization**: Form data is loaded from cache on component mount
2. **Auto-save**: `updateFormData()` automatically saves to cache
3. **Restore**: Popup appears when cached data is detected
4. **Clear**: Cache is cleared on restart or completion

## Cache Data Structure

```typescript
interface CachedCalculatorData {
  formData: FormData;
  timestamp: number;
  sessionId: string;
}
```

## Analytics Events

- `calculator_restore`: Tracked when user restores from cache
- `calculator_restart`: Tracked when user starts fresh

## Error Handling

- Invalid cache data is automatically cleared
- Corrupted cache falls back to fresh start
- localStorage errors are logged but don't break functionality

## Browser Compatibility

- Requires localStorage support
- Gracefully degrades if localStorage is disabled
- Works in all modern browsers 