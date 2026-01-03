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
import {
  IntensityData,
  GenerationMix,
  RegionData,
  isRenewable,
} from '@core/models/carbon-intensity.models';

export interface IntensityState {
  currentIntensity: IntensityData | null;
  regions: RegionData[];
  generationMix: GenerationMix[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: IntensityState = {
  currentIntensity: null,
  regions: [],
  generationMix: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const IntensityStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasData: computed(
      () =>
        store.currentIntensity() !== null ||
        store.regions().length > 0 ||
        store.generationMix().length > 0
    ),
    renewablePercentage: computed(() => {
      const mix = store.generationMix();
      if (mix.length === 0) return 0;
      return mix
        .filter((item) => isRenewable(item.fuel))
        .reduce((sum, item) => sum + item.perc, 0);
    }),
    sortedRegions: computed(() =>
      [...store.regions()].sort((a, b) => a.intensity.forecast - b.intensity.forecast)
    ),
  })),
  withMethods((store, carbonService = inject(CarbonIntensityService)) => ({
    loadCurrent: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          carbonService.getCurrentIntensity().pipe(
            tap((intensity) =>
              patchState(store, {
                currentIntensity: intensity,
                loading: false,
                lastUpdated: new Date(),
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load current intensity',
              });
              return of(null);
            })
          )
        )
      )
    ),
    loadRegions: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          carbonService.getRegionalData().pipe(
            tap((regions) =>
              patchState(store, {
                regions,
                loading: false,
                lastUpdated: new Date(),
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load regional data',
              });
              return of(null);
            })
          )
        )
      )
    ),
    loadGenerationMix: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          carbonService.getGenerationMix().pipe(
            tap((generationMix) =>
              patchState(store, {
                generationMix,
                loading: false,
                lastUpdated: new Date(),
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || 'Failed to load generation mix',
              });
              return of(null);
            })
          )
        )
      )
    ),
    loadAll(): void {
      this.loadCurrent();
      this.loadRegions();
      this.loadGenerationMix();
    },
    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
