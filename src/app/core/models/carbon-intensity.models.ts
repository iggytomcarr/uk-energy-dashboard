export type IntensityLevel = 'very low' | 'low' | 'moderate' | 'high' | 'very high';

export interface IntensityData {
  forecast: number;
  actual: number | null;
  index: IntensityLevel;
}

export interface CurrentIntensityResponse {
  data: Array<{
    from: string;
    to: string;
    intensity: IntensityData;
  }>;
}

export interface GenerationMix {
  fuel: string;
  perc: number;
}

export interface GenerationResponse {
  data: {
    from: string;
    to: string;
    generationmix: GenerationMix[];
  };
}

export interface RegionData {
  regionid: number;
  dnoregion: string;
  shortname: string;
  intensity: IntensityData;
  generationmix: GenerationMix[];
}

export interface RegionalResponse {
  data: Array<{
    from: string;
    to: string;
    regions: Array<{
      regionid: number;
      dnoregion: string;
      shortname: string;
      intensity: {
        forecast: number;
        index: IntensityLevel;
      };
      generationmix: GenerationMix[];
    }>;
  }>;
}

export interface AccessibilityPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'normal' | 'large' | 'x-large';
}

export const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  highContrast: false,
  reducedMotion: false,
  fontSize: 'normal',
};

export const INTENSITY_COLORS: Record<IntensityLevel, string> = {
  'very low': '#7CB342',
  'low': '#8BC34A',
  'moderate': '#FFC107',
  'high': '#FF9800',
  'very high': '#F44336',
};

export const FUEL_COLORS: Record<string, string> = {
  biomass: '#8D6E63',
  coal: '#424242',
  imports: '#7E57C2',
  gas: '#FF7043',
  nuclear: '#5C6BC0',
  other: '#78909C',
  hydro: '#29B6F6',
  solar: '#FFCA28',
  wind: '#66BB6A',
};

export function isRenewable(fuel: string): boolean {
  return ['biomass', 'hydro', 'solar', 'wind'].includes(fuel.toLowerCase());
}

// Historical data models
export interface IntensityStats {
  max: number;
  average: number;
  min: number;
  index: IntensityLevel;
}

export interface HistoricalDataPoint {
  from: string;
  to: string;
  intensity: IntensityStats;
}

export interface HistoricalStatsResponse {
  data: HistoricalDataPoint[];
}

export interface WeeklyDataPoint {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  average: number;
  min: number;
  max: number;
  index: IntensityLevel;
}
