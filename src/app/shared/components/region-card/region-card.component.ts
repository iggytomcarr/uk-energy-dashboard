import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { RegionData } from '@core/models/carbon-intensity.models';
import { IntensityBadgeComponent } from '../intensity-badge/intensity-badge.component';

const DNO_LINKS: Record<string, string> = {
  // Scottish Power Energy Networks
  'SP Distribution': 'https://www.spenergynetworks.co.uk/',
  'SP Manweb': 'https://www.spenergynetworks.co.uk/',
  // Scottish and Southern Electricity Networks
  'Scottish Hydro Electric Power Distribution': 'https://www.ssen.co.uk/',
  // Northern Powergrid
  'NPG North East': 'https://www.northernpowergrid.com/',
  'NPG Yorkshire': 'https://www.northernpowergrid.com/',
  // Electricity North West
  'Electricity North West': 'https://www.enwl.co.uk/',
  // UK Power Networks
  'UKPN East': 'https://www.ukpowernetworks.co.uk/',
  'UKPN London': 'https://www.ukpowernetworks.co.uk/',
  'UKPN South East': 'https://www.ukpowernetworks.co.uk/',
  // National Grid Electricity Distribution (formerly WPD)
  'WPD South Wales': 'https://www.nationalgrid.com/electricity-distribution',
  'WPD South West': 'https://www.nationalgrid.com/electricity-distribution',
  'WPD East Midlands': 'https://www.nationalgrid.com/electricity-distribution',
  'WPD West Midlands': 'https://www.nationalgrid.com/electricity-distribution',
  // National/Country level
  'GB': 'https://www.nationalgrideso.com/',
  'England': 'https://www.nationalgrideso.com/',
  'Scotland': 'https://www.nationalgrideso.com/',
  'Wales': 'https://www.nationalgrideso.com/',
};

@Component({
  selector: 'app-region-card',
  standalone: true,
  imports: [IntensityBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="region-card bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow border border-gray-100 focus-within:ring-2 focus-within:ring-blue-500"
      [attr.aria-labelledby]="'region-' + data().regionid + '-title'"
    >
      <header class="mb-3">
        <h3
          [id]="'region-' + data().regionid + '-title'"
          class="text-lg font-semibold text-gray-900"
        >
          {{ data().shortname }}
        </h3>
        @if (dnoLink()) {
          <a
            [href]="dnoLink()"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sm text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
            [attr.aria-label]="'Visit ' + data().dnoregion + ' website (opens in new tab)'"
          >
            {{ data().dnoregion }}
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        } @else {
          <p class="text-sm text-gray-500">{{ data().dnoregion }}</p>
        }
      </header>

      <div class="mb-4">
        <app-intensity-badge
          [value]="data().intensity.forecast"
          [level]="data().intensity.index"
        />
      </div>

      @if (data().intensity.actual !== null) {
        <div class="text-sm text-gray-600 mb-3">
          <span class="font-medium">Actual:</span>
          {{ data().intensity.actual }} gCO2/kWh
        </div>
      }

      <button
        type="button"
        class="w-full mt-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        (click)="viewDetails.emit(data())"
        [attr.aria-label]="'View details for ' + data().shortname + ' region'"
      >
        <span class="flex items-center justify-center gap-2">
          <span>View Details</span>
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
      </button>
    </article>
  `,
  styles: [`
    :host {
      display: block;
    }

    @media (prefers-contrast: more) {
      .region-card {
        border: 2px solid black;
      }

      button {
        border: 2px solid currentColor;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .region-card,
      button {
        transition: none;
      }
    }
  `],
})
export class RegionCardComponent {
  readonly data = input.required<RegionData>();
  readonly viewDetails = output<RegionData>();

  readonly dnoLink = computed(() => {
    const region = this.data();
    // Check by dnoregion name first, then by shortname for national entries
    return DNO_LINKS[region.dnoregion] || DNO_LINKS[region.shortname] || null;
  });
}
