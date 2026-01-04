import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RegionalStore, SortOption } from '@state/regional.store';
import { PreferencesStore } from '@state/preferences.store';
import { RegionCardComponent } from '@shared/components/region-card/region-card.component';
import { GenerationMixChartComponent } from '@shared/components/generation-mix-chart/generation-mix-chart.component';
import { RegionalMapComponent } from '@shared/components/regional-map/regional-map.component';
import { RegionData } from '@core/models/carbon-intensity.models';

type ViewMode = 'map' | 'list';

@Component({
  selector: 'app-regional',
  standalone: true,
  imports: [RegionCardComponent, GenerationMixChartComponent, RegionalMapComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main id="main-content" class="regional p-6 max-w-7xl mx-auto" [class]="preferencesStore.fontSizeClass()">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          Regional Data
        </h1>
        <p class="text-gray-600">
          Carbon intensity across UK grid regions
        </p>
      </header>

      <!-- Summary Stats -->
      @if (regionalStore.hasData()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <p class="text-3xl font-bold text-blue-600">{{ regionalStore.regionCount() }}</p>
            <p class="text-sm text-gray-500">Total Regions</p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <p class="text-3xl font-bold text-green-600">
              {{ regionalStore.lowestRegion()?.shortname }}
            </p>
            <p class="text-sm text-gray-500">
              Cleanest Region ({{ regionalStore.lowestRegion()?.intensity?.forecast }} gCO2/kWh)
            </p>
          </div>
          <div class="bg-white rounded-lg shadow-md p-4 text-center">
            <p class="text-3xl font-bold text-orange-600">
              {{ regionalStore.highestRegion()?.shortname }}
            </p>
            <p class="text-sm text-gray-500">
              Highest Intensity ({{ regionalStore.highestRegion()?.intensity?.forecast }} gCO2/kWh)
            </p>
          </div>
        </div>
      }

      <!-- View Toggle -->
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-lg border border-gray-200 bg-white p-1" role="tablist" aria-label="View mode">
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="viewMode() === 'map'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.bg-blue-600]="viewMode() === 'map'"
            [class.text-white]="viewMode() === 'map'"
            [class.text-gray-600]="viewMode() !== 'map'"
            [class.hover:bg-gray-100]="viewMode() !== 'map'"
            (click)="setViewMode('map')"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map View
            </span>
          </button>
          <button
            type="button"
            role="tab"
            [attr.aria-selected]="viewMode() === 'list'"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.bg-blue-600]="viewMode() === 'list'"
            [class.text-white]="viewMode() === 'list'"
            [class.text-gray-600]="viewMode() !== 'list'"
            [class.hover:bg-gray-100]="viewMode() !== 'list'"
            (click)="setViewMode('list')"
          >
            <span class="flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List View
            </span>
          </button>
        </div>
      </div>

      <!-- Controls (only show in list view) -->
      @if (viewMode() === 'list') {
        <div class="bg-white rounded-lg shadow-md p-4 mb-6">
          <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1">
              <label for="search-regions" class="block text-sm font-medium text-gray-700 mb-1">
                Search Regions
              </label>
              <input
                id="search-regions"
                type="search"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name..."
                [value]="regionalStore.searchQuery()"
                (input)="onSearch($event)"
              />
            </div>

            <!-- Sort -->
            <div class="sm:w-48">
              <label for="sort-regions" class="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-regions"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                [value]="regionalStore.sortBy()"
                (change)="onSortChange($event)"
              >
                <option value="name">Name (A-Z)</option>
                <option value="intensity-asc">Intensity (Low to High)</option>
                <option value="intensity-desc">Intensity (High to Low)</option>
              </select>
            </div>
          </div>
        </div>
      }

      <!-- Error Message -->
      @if (regionalStore.error()) {
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
            <span>{{ regionalStore.error() }}</span>
          </div>
          <button
            type="button"
            class="mt-2 text-sm underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-red-500"
            (click)="regionalStore.clearError()"
          >
            Dismiss
          </button>
        </div>
      }

      <!-- Loading State -->
      @if (regionalStore.loading()) {
        @if (viewMode() === 'map') {
          <div class="bg-white rounded-lg shadow-md p-6 animate-pulse" aria-busy="true">
            <div class="h-[500px] bg-gray-200 rounded"></div>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true">
            @for (i of [1, 2, 3, 4, 5, 6]; track i) {
              <div class="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div class="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-10 bg-gray-200 rounded mb-4"></div>
                <div class="h-10 bg-gray-200 rounded"></div>
              </div>
            }
          </div>
        }
      } @else if (regionalStore.regions().length > 0) {
        <!-- Map View -->
        @if (viewMode() === 'map') {
          <section class="bg-white rounded-lg shadow-md p-6 mb-6" aria-label="Regional carbon intensity map">
            <app-regional-map
              [regions]="regionalStore.regions()"
              (regionSelected)="onViewDetails($event)"
            />
          </section>
        } @else {
          <!-- List View -->
          @if (regionalStore.filteredRegions().length > 0) {
            <section aria-label="Regional carbon intensity data">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (region of regionalStore.filteredRegions(); track region.regionid) {
                  <app-region-card
                    [data]="region"
                    (viewDetails)="onViewDetails($event)"
                  />
                }
              </div>
            </section>
          } @else if (regionalStore.searchQuery()) {
            <div class="text-center py-12 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>No regions found matching "{{ regionalStore.searchQuery() }}"</p>
            </div>
          }
        }
      } @else {
        <div class="text-center py-12 text-gray-500">
          <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p>No regional data available</p>
        </div>
      }

      <!-- Region Detail Modal -->
      @if (regionalStore.selectedRegion(); as region) {
        <div
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[1000]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          (click)="closeModal($event)"
        >
          <div
            class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
                  (click)="regionalStore.selectRegion(null)"
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

      <!-- Info Section -->
      <section class="mt-8 bg-blue-50 rounded-lg p-6" aria-labelledby="info-heading">
        <h2 id="info-heading" class="text-lg font-semibold text-blue-900 mb-2">
          About Regional Data
        </h2>
        <ul class="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Data shows current carbon intensity forecasts for each DNO (Distribution Network Operator) region</li>
          <li>Regions with more renewable generation typically have lower carbon intensity</li>
          <li>Click "View Details" on any region to see its current generation mix</li>
          <li>Data is updated every 30 minutes</li>
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
export class RegionalComponent implements OnInit {
  readonly regionalStore = inject(RegionalStore);
  readonly preferencesStore = inject(PreferencesStore);

  readonly viewMode = signal<ViewMode>('map');

  ngOnInit(): void {
    this.regionalStore.loadRegions();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.regionalStore.setSearchQuery(input.value);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.regionalStore.setSortBy(select.value as SortOption);
  }

  onViewDetails(region: RegionData): void {
    this.regionalStore.selectRegion(region);
  }

  closeModal(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.regionalStore.selectRegion(null);
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
