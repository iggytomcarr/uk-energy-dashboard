import { computed, inject } from '@angular/core';
import {
  signalStore,
  withState,
  withComputed,
  withMethods,
  patchState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { CarbonIntensityService } from '@core/services/carbon-intensity.service';
import { RegionData } from '@core/models/carbon-intensity.models';

export type SortOption = 'name' | 'intensity-asc' | 'intensity-desc';

export interface RegionalState {
  regions: RegionData[];
  selectedRegion: RegionData | null;
  loading: boolean;
  error: string | null;
  sortBy: SortOption;
  searchQuery: string;
}

const initialState: RegionalState = {
  regions: [],
  selectedRegion: null,
  loading: false,
  error: null,
  sortBy: 'name',
  searchQuery: '',
};

export const RegionalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasData: computed(() => store.regions().length > 0),
    filteredRegions: computed(() => {
      let regions = [...store.regions()];
      const query = store.searchQuery().toLowerCase();

      // Filter by search
      if (query) {
        regions = regions.filter(
          (r) =>
            r.shortname.toLowerCase().includes(query) ||
            r.dnoregion.toLowerCase().includes(query)
        );
      }

      // Sort
      const sortBy = store.sortBy();
      switch (sortBy) {
        case 'name':
          regions.sort((a, b) => a.shortname.localeCompare(b.shortname));
          break;
        case 'intensity-asc':
          regions.sort((a, b) => a.intensity.forecast - b.intensity.forecast);
          break;
        case 'intensity-desc':
          regions.sort((a, b) => b.intensity.forecast - a.intensity.forecast);
          break;
      }

      return regions;
    }),
    regionCount: computed(() => store.regions().length),
    averageIntensity: computed(() => {
      const regions = store.regions();
      if (regions.length === 0) return 0;
      const sum = regions.reduce((acc, r) => acc + r.intensity.forecast, 0);
      return Math.round(sum / regions.length);
    }),
    lowestRegion: computed(() => {
      const regions = store.regions();
      if (regions.length === 0) return null;
      return regions.reduce((min, r) =>
        r.intensity.forecast < min.intensity.forecast ? r : min
      );
    }),
    highestRegion: computed(() => {
      const regions = store.regions();
      if (regions.length === 0) return null;
      return regions.reduce((max, r) =>
        r.intensity.forecast > max.intensity.forecast ? r : max
      );
    }),
  })),
  withMethods((store, carbonService = inject(CarbonIntensityService)) => ({
    loadRegions: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          carbonService.getRegionalData().pipe(
            tap((regions) =>
              patchState(store, {
                regions,
                loading: false,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load regional data',
                regions: [],
              });
              return of(null);
            })
          )
        )
      )
    ),
    selectRegion(region: RegionData | null): void {
      patchState(store, { selectedRegion: region });
    },
    setSortBy(sortBy: SortOption): void {
      patchState(store, { sortBy });
    },
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },
    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
