import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  inject,
  effect,
} from '@angular/core';
import * as L from 'leaflet';
import { RegionData, IntensityLevel, INTENSITY_COLORS } from '@core/models/carbon-intensity.models';
import { UK_REGIONS_GEOJSON, REGION_NAME_TO_ID } from '@shared/data/uk-regions.geojson';

@Component({
  selector: 'app-regional-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="regional-map">
      <div
        #mapContainer
        class="map-container rounded-lg overflow-hidden border border-gray-200"
        role="img"
        [attr.aria-label]="'Interactive map of UK electricity grid regions showing carbon intensity levels'"
      ></div>

      <!-- Legend -->
      <div class="mt-4 flex flex-wrap justify-center gap-4" aria-label="Map legend">
        @for (level of intensityLevels; track level) {
          <div class="flex items-center gap-2">
            <span
              class="w-4 h-4 rounded"
              [style.backgroundColor]="getIntensityColor(level)"
            ></span>
            <span class="text-sm text-gray-600 capitalize">{{ level }}</span>
          </div>
        }
      </div>

      <!-- Screen reader accessible list -->
      <div class="sr-only">
        <h3>Region carbon intensity levels:</h3>
        <ul>
          @for (region of regions(); track region.regionid) {
            <li>{{ region.shortname }}: {{ region.intensity.forecast }} gCO2/kWh ({{ region.intensity.index }})</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .map-container {
      height: 500px;
      width: 100%;
      background: #f3f4f6;
    }

    @media (max-width: 640px) {
      .map-container {
        height: 350px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host ::ng-deep .leaflet-fade-anim .leaflet-tile,
      :host ::ng-deep .leaflet-zoom-anim .leaflet-zoom-animated {
        transition: none !important;
      }
    }
  `],
})
export class RegionalMapComponent implements AfterViewInit, OnDestroy {
  readonly regions = input.required<RegionData[]>();
  readonly regionSelected = output<RegionData>();

  private readonly elementRef = inject(ElementRef);
  private map: L.Map | null = null;
  private geoJsonLayer: L.GeoJSON | null = null;

  readonly intensityLevels: IntensityLevel[] = [
    'very low',
    'low',
    'moderate',
    'high',
    'very high',
  ];

  constructor() {
    // React to regions changes
    effect(() => {
      const regions = this.regions();
      if (this.map && regions.length > 0) {
        this.updateMap(regions);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  getIntensityColor(level: IntensityLevel): string {
    return INTENSITY_COLORS[level];
  }

  private initMap(): void {
    const mapContainer = this.elementRef.nativeElement.querySelector('.map-container');
    if (!mapContainer) return;

    // Initialize map centered on UK
    this.map = L.map(mapContainer, {
      center: [54.5, -3.5],
      zoom: 5.5,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 10,
      minZoom: 5,
    }).addTo(this.map);

    // Fix for Leaflet not detecting container size correctly
    // Need to invalidate size after the container is fully rendered
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);

    // Initial render with current regions
    const regions = this.regions();
    if (regions.length > 0) {
      this.updateMap(regions);
    }
  }

  private updateMap(regions: RegionData[]): void {
    if (!this.map) return;

    // Remove existing layer
    if (this.geoJsonLayer) {
      this.map.removeLayer(this.geoJsonLayer);
    }

    // Create a map of region data by shortname
    const regionDataMap = new Map<string, RegionData>();
    regions.forEach((region) => {
      regionDataMap.set(region.shortname, region);
    });

    // Add GeoJSON layer with styling
    this.geoJsonLayer = L.geoJSON(UK_REGIONS_GEOJSON, {
      style: (feature) => {
        if (!feature?.properties) return {};

        const regionName = feature.properties.shortname;
        const regionData = regionDataMap.get(regionName);
        const intensity = regionData?.intensity?.index || 'moderate';

        return {
          fillColor: INTENSITY_COLORS[intensity as IntensityLevel] || '#78909C',
          weight: 2,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.7,
        };
      },
      onEachFeature: (feature, layer) => {
        if (!feature?.properties) return;

        const regionName = feature.properties.shortname;
        const regionData = regionDataMap.get(regionName);

        // Add tooltip with intensity info on hover
        if (regionData) {
          layer.bindTooltip(
            `<strong>${regionName}</strong><br>${regionData.intensity.forecast} gCO2/kWh`,
            {
              permanent: false,
              direction: 'top',
              className: 'region-tooltip',
            }
          );
        } else {
          layer.bindTooltip(regionName, {
            permanent: false,
            direction: 'top',
            className: 'region-tooltip',
          });
        }

        // Click opens full detail modal
        layer.on('click', () => {
          if (regionData) {
            this.regionSelected.emit(regionData);
          }
        });

        // Add hover effects
        layer.on('mouseover', (e) => {
          const target = e.target as L.Path;
          target.setStyle({
            weight: 3,
            fillOpacity: 0.9,
          });
          target.bringToFront();
        });

        layer.on('mouseout', (e) => {
          this.geoJsonLayer?.resetStyle(e.target);
        });
      },
    }).addTo(this.map);

    // Fit map to GeoJSON bounds
    const bounds = this.geoJsonLayer.getBounds();
    if (bounds.isValid()) {
      // Ensure map size is correct before fitting bounds
      this.map.invalidateSize();
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }
  }
}
