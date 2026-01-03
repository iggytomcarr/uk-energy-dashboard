import { computed, effect } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { AccessibilityPreferences, DEFAULT_PREFERENCES } from '@core/models/carbon-intensity.models';

const STORAGE_KEY = 'energy-dashboard-preferences';

function loadFromStorage(): AccessibilityPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch {
    console.warn('Failed to load preferences from localStorage');
  }
  return DEFAULT_PREFERENCES;
}

function saveToStorage(preferences: AccessibilityPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    console.warn('Failed to save preferences to localStorage');
  }
}

export const PreferencesStore = signalStore(
  { providedIn: 'root' },
  withState<AccessibilityPreferences>(loadFromStorage()),
  withComputed((store) => ({
    fontSizeClass: computed(() => {
      switch (store.fontSize()) {
        case 'large':
          return 'text-lg';
        case 'x-large':
          return 'text-xl';
        default:
          return 'text-base';
      }
    }),
    allPreferences: computed(
      (): AccessibilityPreferences => ({
        highContrast: store.highContrast(),
        reducedMotion: store.reducedMotion(),
        fontSize: store.fontSize(),
      })
    ),
  })),
  withMethods((store) => ({
    setHighContrast(enabled: boolean): void {
      patchState(store, { highContrast: enabled });
    },
    setReducedMotion(enabled: boolean): void {
      patchState(store, { reducedMotion: enabled });
    },
    setFontSize(size: AccessibilityPreferences['fontSize']): void {
      patchState(store, { fontSize: size });
    },
    resetToDefaults(): void {
      patchState(store, DEFAULT_PREFERENCES);
    },
  })),
  withHooks({
    onInit(store) {
      effect(() => {
        const prefs = {
          highContrast: store.highContrast(),
          reducedMotion: store.reducedMotion(),
          fontSize: store.fontSize(),
        };
        saveToStorage(prefs);

        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('high-contrast', prefs.highContrast);
          document.documentElement.classList.toggle('reduce-motion', prefs.reducedMotion);
          document.documentElement.dataset['fontSize'] = prefs.fontSize;
        }
      });
    },
  })
);
