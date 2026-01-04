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
import { WeeklyDataPoint } from '@core/models/carbon-intensity.models';

export interface HistoricalState {
  weeklyData: WeeklyDataPoint[];
  selectedYear: number;
  availableYears: number[];
  loading: boolean;
  error: string | null;
}

const currentYear = new Date().getFullYear();

const initialState: HistoricalState = {
  weeklyData: [],
  selectedYear: currentYear - 1, // Default to last year (complete data)
  availableYears: [
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
    currentYear - 5,
  ],
  loading: false,
  error: null,
};

export const HistoricalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    hasData: computed(() => store.weeklyData().length > 0),
    yearlyAverage: computed(() => {
      const data = store.weeklyData();
      if (data.length === 0) return 0;
      const sum = data.reduce((acc, point) => acc + point.average, 0);
      return Math.round(sum / data.length);
    }),
    yearlyMin: computed(() => {
      const data = store.weeklyData();
      if (data.length === 0) return 0;
      return Math.min(...data.map((p) => p.min));
    }),
    yearlyMax: computed(() => {
      const data = store.weeklyData();
      if (data.length === 0) return 0;
      return Math.max(...data.map((p) => p.max));
    }),
    chartData: computed(() => {
      const data = store.weeklyData();
      return data.map((point) => ({
        week: point.weekNumber,
        average: point.average,
        min: point.min,
        max: point.max,
        label: `Week ${point.weekNumber}`,
        dateRange: `${point.startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${point.endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`,
      }));
    }),
  })),
  withMethods((store, carbonService = inject(CarbonIntensityService)) => ({
    loadYear: rxMethod<number>(
      pipe(
        tap((year) => patchState(store, { loading: true, error: null, selectedYear: year })),
        switchMap((year) =>
          carbonService.getYearlyWeeklyStats(year).pipe(
            tap((weeklyData) =>
              patchState(store, {
                weeklyData,
                loading: false,
              })
            ),
            catchError((error) => {
              patchState(store, {
                loading: false,
                error: error.message || `Failed to load data for ${year}`,
                weeklyData: [],
              });
              return of(null);
            })
          )
        )
      )
    ),
    setYear(year: number): void {
      if (year !== store.selectedYear()) {
        this.loadYear(year);
      }
    },
    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
