import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PreferencesStore } from '@state/preferences.store';
import { AccessibilityPreferences } from '@core/models/carbon-intensity.models';

@Component({
  selector: 'app-accessibility-panel',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="accessibility-panel bg-white rounded-lg shadow-md p-6"
      aria-labelledby="accessibility-heading"
    >
      <h2 id="accessibility-heading" class="text-xl font-semibold text-gray-900 mb-6">
        Accessibility Settings
      </h2>

      <div class="space-y-6">
        <!-- High Contrast Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <label
              for="high-contrast"
              class="text-sm font-medium text-gray-900"
            >
              High Contrast Mode
            </label>
            <p class="text-sm text-gray-500" id="high-contrast-desc">
              Increases contrast for better visibility
            </p>
          </div>
          <button
            type="button"
            role="switch"
            id="high-contrast"
            [attr.aria-checked]="preferencesStore.highContrast()"
            aria-describedby="high-contrast-desc"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            [class.bg-blue-600]="preferencesStore.highContrast()"
            [class.bg-gray-200]="!preferencesStore.highContrast()"
            (click)="preferencesStore.setHighContrast(!preferencesStore.highContrast())"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              [class.translate-x-5]="preferencesStore.highContrast()"
              [class.translate-x-0]="!preferencesStore.highContrast()"
              aria-hidden="true"
            ></span>
          </button>
        </div>

        <!-- Reduced Motion Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <label
              for="reduced-motion"
              class="text-sm font-medium text-gray-900"
            >
              Reduce Motion
            </label>
            <p class="text-sm text-gray-500" id="reduced-motion-desc">
              Minimises animations and transitions
            </p>
          </div>
          <button
            type="button"
            role="switch"
            id="reduced-motion"
            [attr.aria-checked]="preferencesStore.reducedMotion()"
            aria-describedby="reduced-motion-desc"
            class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            [class.bg-blue-600]="preferencesStore.reducedMotion()"
            [class.bg-gray-200]="!preferencesStore.reducedMotion()"
            (click)="preferencesStore.setReducedMotion(!preferencesStore.reducedMotion())"
          >
            <span
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              [class.translate-x-5]="preferencesStore.reducedMotion()"
              [class.translate-x-0]="!preferencesStore.reducedMotion()"
              aria-hidden="true"
            ></span>
          </button>
        </div>

        <!-- Font Size Selection -->
        <fieldset>
          <legend class="text-sm font-medium text-gray-900 mb-2">
            Font Size
          </legend>
          <div class="flex gap-3" role="radiogroup" aria-label="Font size options">
            @for (size of fontSizes; track size.value) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="preferencesStore.fontSize() === size.value"
                class="px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                [class.bg-blue-600]="preferencesStore.fontSize() === size.value"
                [class.text-white]="preferencesStore.fontSize() === size.value"
                [class.bg-gray-100]="preferencesStore.fontSize() !== size.value"
                [class.text-gray-700]="preferencesStore.fontSize() !== size.value"
                [class.hover:bg-gray-200]="preferencesStore.fontSize() !== size.value"
                (click)="preferencesStore.setFontSize(size.value)"
              >
                {{ size.label }}
              </button>
            }
          </div>
        </fieldset>

        <!-- Reset Button -->
        <div class="pt-4 border-t border-gray-200">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            (click)="preferencesStore.resetToDefaults()"
          >
            Reset to Defaults
          </button>
        </div>
      </div>

      <!-- Live Region for Announcements -->
      <div
        class="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Settings updated
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-contrast: more) {
      .accessibility-panel {
        border: 2px solid black;
      }

      button[role="switch"] {
        border: 2px solid black;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      button,
      span {
        transition: none !important;
      }
    }
  `],
})
export class AccessibilityPanelComponent {
  readonly preferencesStore = inject(PreferencesStore);

  readonly fontSizes: Array<{ value: AccessibilityPreferences['fontSize']; label: string }> = [
    { value: 'normal', label: 'Normal' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'Extra Large' },
  ];
}
