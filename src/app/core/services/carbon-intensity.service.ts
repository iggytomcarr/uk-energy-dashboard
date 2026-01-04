import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import {
  CurrentIntensityResponse,
  GenerationResponse,
  GenerationMix,
  IntensityData,
  RegionalResponse,
  RegionData,
  HistoricalStatsResponse,
  WeeklyDataPoint,
} from '../models/carbon-intensity.models';

@Injectable({
  providedIn: 'root',
})
export class CarbonIntensityService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://api.carbonintensity.org.uk';

  getCurrentIntensity(): Observable<IntensityData> {
    return this.http
      .get<CurrentIntensityResponse>(`${this.baseUrl}/intensity`)
      .pipe(
        map((response) => {
          if (!response?.data?.[0]?.intensity) {
            throw new Error('Invalid intensity data received from API');
          }
          return response.data[0].intensity;
        })
      );
  }

  getGenerationMix(): Observable<GenerationMix[]> {
    return this.http
      .get<GenerationResponse>(`${this.baseUrl}/generation`)
      .pipe(
        map((response) => {
          if (!response?.data?.generationmix) {
            throw new Error('Invalid generation mix data received from API');
          }
          return response.data.generationmix;
        })
      );
  }

  getRegionalData(): Observable<RegionData[]> {
    return this.http.get<RegionalResponse>(`${this.baseUrl}/regional`).pipe(
      map((response) => {
        if (!response?.data?.[0]?.regions?.length) {
          throw new Error('Invalid regional data received from API');
        }
        return response.data[0].regions.map((region) => ({
          regionid: region.regionid,
          dnoregion: region.dnoregion,
          shortname: region.shortname,
          intensity: {
            forecast: region.intensity.forecast,
            actual: null,
            index: region.intensity.index,
          },
          generationmix: region.generationmix,
        }));
      })
    );
  }

  getYearlyWeeklyStats(year: number): Observable<WeeklyDataPoint[]> {
    // API has 30-day limit and max 24-hour blocks
    // Fetch daily data month by month, then aggregate into weeks
    const monthRequests: Observable<HistoricalStatsResponse>[] = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0); // Last day of month

      const fromStr = this.formatDateISO(startDate);
      const toStr = this.formatDateISO(endDate, true);

      monthRequests.push(
        this.http.get<HistoricalStatsResponse>(
          `${this.baseUrl}/intensity/stats/${fromStr}/${toStr}/24`
        )
      );
    }

    return forkJoin(monthRequests).pipe(
      map((responses) => {
        // Collect all daily data points
        const dailyData: Array<{
          date: Date;
          average: number;
          min: number;
          max: number;
        }> = [];

        responses.forEach((response) => {
          if (response?.data?.length) {
            response.data.forEach((point) => {
              dailyData.push({
                date: new Date(point.from),
                average: point.intensity.average,
                min: point.intensity.min,
                max: point.intensity.max,
              });
            });
          }
        });

        if (dailyData.length === 0) {
          throw new Error('No historical data available for this year');
        }

        // Aggregate into weeks
        return this.aggregateToWeeks(dailyData, year);
      })
    );
  }

  private aggregateToWeeks(
    dailyData: Array<{ date: Date; average: number; min: number; max: number }>,
    year: number
  ): WeeklyDataPoint[] {
    const weeks: WeeklyDataPoint[] = [];
    const sortedData = [...dailyData].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    let weekNumber = 1;
    let weekStart = new Date(year, 0, 1);
    let weekData: typeof dailyData = [];

    for (const day of sortedData) {
      const daysSinceWeekStart = Math.floor(
        (day.date.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceWeekStart >= 7 && weekData.length > 0) {
        // Save current week and start new one
        weeks.push(this.createWeekPoint(weekData, weekNumber, weekStart));
        weekNumber++;
        weekStart = new Date(day.date);
        weekData = [day];
      } else {
        weekData.push(day);
      }
    }

    // Don't forget the last week
    if (weekData.length > 0) {
      weeks.push(this.createWeekPoint(weekData, weekNumber, weekStart));
    }

    return weeks;
  }

  private createWeekPoint(
    days: Array<{ date: Date; average: number; min: number; max: number }>,
    weekNumber: number,
    weekStart: Date
  ): WeeklyDataPoint {
    const avgSum = days.reduce((sum, d) => sum + d.average, 0);
    const weekEnd = new Date(days[days.length - 1].date);

    return {
      weekNumber,
      startDate: weekStart,
      endDate: weekEnd,
      average: Math.round(avgSum / days.length),
      min: Math.min(...days.map((d) => d.min)),
      max: Math.max(...days.map((d) => d.max)),
      index: 'moderate', // Simplified - could calculate based on average
    };
  }

  private formatDateISO(date: Date, endOfDay = false): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = endOfDay ? 'T23:59Z' : 'T00:00Z';
    return `${year}-${month}-${day}${time}`;
  }
}
