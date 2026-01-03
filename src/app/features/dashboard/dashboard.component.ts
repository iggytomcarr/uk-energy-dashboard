import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IntensityStore } from '@state/intensity.store';
import { PreferencesStore } from '@state/preferences.store';
import { IntensityBadgeComponent } from '@shared/components/intensity-badge/intensity-badge.component';
import { GenerationMixChartComponent } from '@shared/components/generation-mix-chart/generation-mix-chart.component';
import { RegionCardComponent } from '@shared/components/region-card/region-card.component';
import { LoadingSkeletonComponent } from '@shared/components/loading-skeleton/loading-skeleton.component';
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
        } @else if (intensityStore.sortedRegions().length) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (region of intensityStore.sortedRegions(); track region.regionid) {
              <app-region-card
                [data]="region"
                (viewDetails)="onViewRegionDetails($event)"
              />
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

  ngOnInit(): void {
    this.intensityStore.loadAll();
  }

  refreshData(): void {
    this.intensityStore.loadAll();
  }

  onViewRegionDetails(region: RegionData): void {
    console.log('View details for region:', region);
  }
}
