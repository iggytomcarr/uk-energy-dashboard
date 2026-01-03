import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { PreferencesStore } from '@state/preferences.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Skip Link for Accessibility -->
    <a
      href="#main-content"
      class="skip-link sr-only-focusable"
    >
      Skip to main content
    </a>

    <div
      class="min-h-screen bg-gray-50"
      [class.high-contrast]="preferencesStore.highContrast()"
      [class.reduce-motion]="preferencesStore.reducedMotion()"
      [class]="preferencesStore.fontSizeClass()"
    >
      <!-- Navigation -->
      <nav
        class="bg-white shadow-sm border-b border-gray-200"
        aria-label="Main navigation"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <!-- Logo -->
              <a
                routerLink="/"
                class="flex items-center gap-2 text-xl font-bold text-gray-900"
                aria-label="UK Energy Dashboard - Home"
              >
                <svg
                  class="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>UK Energy</span>
              </a>

              <!-- Nav Links -->
              <div class="ml-10 flex items-center space-x-4">
                <a
                  routerLink="/dashboard"
                  routerLinkActive="bg-gray-100 text-gray-900"
                  class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Dashboard
                </a>
                <a
                  routerLink="/settings"
                  routerLinkActive="bg-gray-100 text-gray-900"
                  class="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Settings
                </a>
              </div>
            </div>

            <!-- Accessibility Quick Toggle -->
            <div class="flex items-center">
              <button
                type="button"
                class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                [attr.aria-pressed]="preferencesStore.highContrast()"
                (click)="preferencesStore.setHighContrast(!preferencesStore.highContrast())"
                aria-label="Toggle high contrast mode"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <router-outlet />

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 mt-auto">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-gray-500">
            Data provided by
            <a
              href="https://carbonintensity.org.uk/"
              target="_blank"
              rel="noopener noreferrer"
              class="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Carbon Intensity API
            </a>
            | Built for National Grid demo
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #1d4ed8;
      color: white;
      padding: 8px 16px;
      z-index: 100;
      transition: top 0.2s;

      &:focus {
        top: 0;
      }
    }

    .high-contrast {
      filter: contrast(1.2);

      a, button {
        text-decoration: underline;
      }
    }

    .reduce-motion * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }

    @media (prefers-contrast: more) {
      nav {
        border-bottom: 2px solid black;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .skip-link,
      a,
      button {
        transition: none;
      }
    }
  `],
})
export class App {
  readonly preferencesStore = inject(PreferencesStore);
}
