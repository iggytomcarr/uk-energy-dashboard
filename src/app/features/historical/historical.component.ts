import { Component, ChangeDetectionStrategy, inject, OnInit, effect } from '@angular/core';
import { HistoricalStore } from '@state/historical.store';
import { PreferencesStore } from '@state/preferences.store';
import { LiveAnnouncerService } from '@core/services/live-announcer.service';
import { YearlyChartComponent } from '@shared/components/yearly-chart/yearly-chart.component';

@Component({
  selector: 'app-historical',
  standalone: true,
  imports: [YearlyChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" class="historical p-6 max-w-7xl mx-auto" [class]="preferencesStore.fontSizeClass()">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Historical Data
        </h1>
        <p class="text-gray-600">
          Weekly carbon intensity trends over time
        </p>
      </header>

      <!-- Year Selector -->
      <div class="mb-6">
        <fieldset>
          <legend class="text-sm font-medium text-gray-700 mb-2">Select Year</legend>
          <div class="flex flex-wrap gap-2" role="radiogroup" aria-label="Select year to view">
            @for (year of historicalStore.availableYears(); track year) {
              <button
                type="button"
                role="radio"
                [attr.aria-checked]="historicalStore.selectedYear() === year"
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                [class.bg-blue-600]="historicalStore.selectedYear() === year"
                [class.text-white]="historicalStore.selectedYear() === year"
                [class.bg-gray-100]="historicalStore.selectedYear() !== year"
                [class.text-gray-700]="historicalStore.selectedYear() !== year"
                [class.hover:bg-gray-200]="historicalStore.selectedYear() !== year"
                [disabled]="historicalStore.loading()"
                (click)="historicalStore.setYear(year)"
              >
                {{ year }}
              </button>
            }
          </div>
        </fieldset>
      </div>

      <!-- Error Message -->
      @if (historicalStore.error()) {
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
            <span>{{ historicalStore.error() }}</span>
          </div>
          <button
            type="button"
            class="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500"
            (click)="historicalStore.clearError()"
          >
            Dismiss
          </button>
        </div>
      }

      <!-- Chart Section -->
      <section aria-labelledby="yearly-chart-heading" class="bg-white rounded-lg shadow-md p-6">
        <h2 id="yearly-chart-heading" class="sr-only">
          Yearly Carbon Intensity Chart for {{ historicalStore.selectedYear() }}
        </h2>

        @if (historicalStore.loading()) {
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div class="h-80 bg-gray-100 rounded animate-pulse"></div>
            <div class="grid grid-cols-3 gap-4">
              <div class="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-16 bg-gray-200 rounded animate-pulse"></div>
              <div class="h-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        } @else if (historicalStore.hasData()) {
          <app-yearly-chart
            [data]="historicalStore.chartData()"
            [year]="historicalStore.selectedYear()"
          />
        } @else {
          <div class="text-center py-12 text-gray-500">
            <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p>No data available for {{ historicalStore.selectedYear() }}</p>
          </div>
        }
      </section>

      <!-- Info Section -->
      <section class="mt-8 bg-blue-50 rounded-lg p-6" aria-labelledby="info-heading">
        <h2 id="info-heading" class="text-lg font-semibold text-blue-900 mb-2">
          About This Data
        </h2>
        <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Data shows weekly averages of carbon intensity in grams of CO2 per kilowatt hour (gCO2/kWh)</li>
          <li>Lower values indicate cleaner electricity generation</li>
          <li>Shaded area shows the range between weekly minimum and maximum values</li>
          <li>Seasonal variations reflect changes in renewable energy availability and demand</li>
        </ul>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-contrast: more) {
      section {
        border: 2px solid black;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .animate-pulse {
        animation: none;
      }
    }
  `],
})
export class HistoricalComponent implements OnInit {
  readonly historicalStore = inject(HistoricalStore);
  readonly preferencesStore = inject(PreferencesStore);
  private readonly liveAnnouncer = inject(LiveAnnouncerService);
  private wasLoading = false;

  constructor() {
    // Announce when loading completes
    effect(() => {
      const isLoading = this.historicalStore.loading();
      const hasData = this.historicalStore.hasData();
      const year = this.historicalStore.selectedYear();

      if (this.wasLoading && !isLoading && hasData) {
        this.liveAnnouncer.announce(`Historical data for ${year} loaded successfully`);
      }
      this.wasLoading = isLoading;
    });
  }

  ngOnInit(): void {
    this.historicalStore.loadYear(this.historicalStore.selectedYear());
  }
}
