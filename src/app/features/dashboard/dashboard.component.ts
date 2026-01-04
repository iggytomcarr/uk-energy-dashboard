import { Component, ChangeDetectionStrategy, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntensityStore } from '@state/intensity.store';
import { PreferencesStore } from '@state/preferences.store';
import { LiveAnnouncerService } from '@core/services/live-announcer.service';
import { IntensityBadgeComponent } from '@shared/components/intensity-badge/intensity-badge.component';
import { GenerationMixChartComponent } from '@shared/components/generation-mix-chart/generation-mix-chart.component';
import { RegionCardComponent } from '@shared/components/region-card/region-card.component';
import { LoadingSkeletonComponent } from '@shared/components/loading-skeleton/loading-skeleton.component';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';
import { RegionData } from '@core/models/carbon-intensity.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IntensityBadgeComponent,
    GenerationMixChartComponent,
    RegionCardComponent,
    LoadingSkeletonComponent,
    FocusTrapDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" class="dashboard p-6 max-w-7xl mx-auto" [class]="preferencesStore.fontSizeClass()">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          UK Electricity Grid Dashboard
        </h1>
        <p class="text-gray-600">
          Real-time carbon intensity and generation mix data
        </p>
        @if (intensityStore.lastUpdated()) {
          <p class="text-sm text-gray-500 mt-2">
            Last updated: {{ intensityStore.lastUpdated() | date:'medium' }}
          </p>
        }
      </header>

      <!-- Error Message -->
      @if (intensityStore.error()) {
        <div
          role="alert"
          class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
            <span>{{ intensityStore.error() }}</span>
          </div>
          <button
            type="button"
            class="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500"
            (click)="intensityStore.clearError()"
          >
            Dismiss
          </button>
        </div>
      }

      <!-- Current Intensity Section -->
      <section aria-labelledby="current-intensity-heading" class="mb-8">
        <h2 id="current-intensity-heading" class="text-xl font-semibold text-gray-900 mb-4">
          Current UK Carbon Intensity
        </h2>
        @if (intensityStore.loading() && !intensityStore.currentIntensity()) {
          <app-loading-skeleton type="badge" />
        } @else if (intensityStore.currentIntensity(); as intensity) {
          <div class="bg-white rounded-lg shadow-md p-6">
            <app-intensity-badge
              [value]="intensity.forecast"
              [level]="intensity.index"
            />
            @if (intensity.actual !== null) {
              <p class="mt-4 text-gray-600">
                <span class="font-medium">Actual:</span>
                {{ intensity.actual }} gCO2/kWh
              </p>
            }
          </div>
        }
      </section>

      <!-- Generation Mix Section -->
      <section aria-labelledby="generation-mix-heading" class="mb-8">
        <h2 id="generation-mix-heading" class="text-xl font-semibold text-gray-900 mb-4">
          Generation Mix
        </h2>
        @if (intensityStore.loading() && !intensityStore.generationMix().length) {
          <div class="bg-white rounded-lg shadow-md p-6">
            <app-loading-skeleton type="chart" />
          </div>
        } @else if (intensityStore.generationMix().length) {
          <div class="bg-white rounded-lg shadow-md p-6">
            <app-generation-mix-chart [data]="intensityStore.generationMix()" />
            <div class="mt-4 p-3 bg-green-50 rounded-md">
              <p class="text-green-800 font-medium">
                {{ intensityStore.renewablePercentage() | number:'1.1-1' }}% from renewable sources
              </p>
            </div>
          </div>
        }
      </section>

      <!-- Regional Data Section -->
      <section aria-labelledby="regional-data-heading">
        <h2 id="regional-data-heading" class="text-xl font-semibold text-gray-900 mb-4">
          Regional Carbon Intensity
        </h2>
        @if (intensityStore.loading() && !intensityStore.regions().length) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <app-loading-skeleton type="card" />
            }
          </div>
        } @else if (intensityStore.groupedRegions().length) {
          <div class="space-y-8">
            @for (group of intensityStore.groupedRegions(); track group.name) {
              <div>
                <div class="flex items-center gap-4 mb-4">
                  <h3 class="text-lg font-semibold text-gray-700">{{ group.name }}</h3>
                  <div class="flex-1 h-px bg-gray-200"></div>
                  <span class="text-sm text-gray-500">{{ group.regions.length }} region{{ group.regions.length !== 1 ? 's' : '' }}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (region of group.regions; track region.regionid) {
                    <app-region-card
                      [data]="region"
                      (viewDetails)="onViewRegionDetails($event)"
                    />
                  }
                </div>
              </div>
            }
          </div>
        }
      </section>

      <!-- Refresh Button -->
      <div class="mt-8 flex justify-center">
        <button
          type="button"
          class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="intensityStore.loading()"
          (click)="refreshData()"
          [attr.aria-busy]="intensityStore.loading()"
        >
          @if (intensityStore.loading()) {
            <span class="flex items-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Loading...
            </span>
          } @else {
            Refresh Data
          }
        </button>
      </div>

      <!-- Region Detail Modal -->
      @if (selectedRegion(); as region) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          (click)="closeModal($event)"
        >
          <div
            class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            appFocusTrap
            (escapePressed)="selectedRegion.set(null)"
            (click)="$event.stopPropagation()"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-4">
                <h2 id="modal-title" class="text-2xl font-bold text-gray-900">
                  {{ region.shortname }}
                </h2>
                <button
                  type="button"
                  class="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
                  aria-label="Close modal"
                  (click)="selectedRegion.set(null)"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p class="text-gray-600 mb-6">{{ region.dnoregion }}</p>

              <!-- Intensity Info -->
              <div class="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Carbon Intensity</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Forecast</p>
                    <p class="text-2xl font-bold text-gray-900">{{ region.intensity.forecast }} <span class="text-sm font-normal">gCO2/kWh</span></p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Level</p>
                    <p class="text-2xl font-bold capitalize" [class]="getIntensityClass(region.intensity.index)">
                      {{ region.intensity.index }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Generation Mix -->
              <div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Generation Mix</h3>
                <app-generation-mix-chart [data]="region.generationmix" />
              </div>
            </div>
          </div>
        </div>
      }
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-contrast: more) {
      .dashboard section > div {
        border: 2px solid black;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-spin {
        animation: none;
      }
    }
  `],
})
export class DashboardComponent implements OnInit {
  readonly intensityStore = inject(IntensityStore);
  readonly preferencesStore = inject(PreferencesStore);
  private readonly liveAnnouncer = inject(LiveAnnouncerService);

  readonly selectedRegion = signal<RegionData | null>(null);
  private wasLoading = false;

  constructor() {
    // Announce when loading completes
    effect(() => {
      const isLoading = this.intensityStore.loading();
      const hasData = this.intensityStore.hasData();

      if (this.wasLoading && !isLoading && hasData) {
        this.liveAnnouncer.announce('Dashboard data loaded successfully');
      }
      this.wasLoading = isLoading;
    });
  }

  ngOnInit(): void {
    this.intensityStore.loadAll();
  }

  refreshData(): void {
    this.intensityStore.loadAll();
  }

  onViewRegionDetails(region: RegionData): void {
    this.selectedRegion.set(region);
  }

  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.selectedRegion.set(null);
    }
  }

  getIntensityClass(level: string): string {
    const classes: Record<string, string> = {
      'very low': 'text-green-600',
      'low': 'text-green-500',
      'moderate': 'text-yellow-600',
      'high': 'text-orange-600',
      'very high': 'text-red-600',
    };
    return classes[level] || 'text-gray-600';
  }
}
