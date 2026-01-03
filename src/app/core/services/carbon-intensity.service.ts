import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  CurrentIntensityResponse,
  GenerationResponse,
  GenerationMix,
  IntensityData,
  RegionalResponse,
  RegionData,
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
      .pipe(map((response) => response.data[0].intensity));
  }

  getGenerationMix(): Observable<GenerationMix[]> {
    return this.http
      .get<GenerationResponse>(`${this.baseUrl}/generation`)
      .pipe(map((response) => response.data.generationmix));
  }

  getRegionalData(): Observable<RegionData[]> {
    return this.http.get<RegionalResponse>(`${this.baseUrl}/regional`).pipe(
      map((response) =>
        response.data.map((region) => ({
          regionid: region.regionid,
          dnoregion: region.dnoregion,
          shortname: region.shortname,
          intensity: region.data[0].intensity,
          generationmix: region.data[0].generationmix,
        }))
      )
    );
  }
}
