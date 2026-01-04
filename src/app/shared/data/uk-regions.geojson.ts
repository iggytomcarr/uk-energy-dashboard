import { FeatureCollection, Feature, Polygon } from 'geojson';

export interface RegionProperties {
  regionid: number;
  shortname: string;
  dnoregion: string;
}

// Simplified GeoJSON boundaries for UK DNO regions
// These are approximate boundaries for demonstration purposes
export const UK_REGIONS_GEOJSON: FeatureCollection<Polygon, RegionProperties> = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        regionid: 1,
        shortname: 'North Scotland',
        dnoregion: 'Scottish Hydro Electric Power Distribution',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-7.5, 58.6], [-3.0, 58.6], [-1.5, 57.5], [-2.0, 56.5],
          [-3.5, 56.3], [-5.5, 56.5], [-7.0, 57.5], [-7.5, 58.6],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 2,
        shortname: 'South Scotland',
        dnoregion: 'SP Distribution',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.5, 56.5], [-3.5, 56.3], [-2.0, 56.5], [-2.0, 55.3],
          [-2.5, 54.8], [-3.5, 54.8], [-5.0, 54.9], [-5.5, 55.5], [-5.5, 56.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 3,
        shortname: 'North East England',
        dnoregion: 'NPG North East',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-2.5, 54.8], [-2.0, 55.3], [-1.5, 55.8], [-1.4, 55.0],
          [-1.5, 54.5], [-2.0, 54.3], [-2.5, 54.5], [-2.5, 54.8],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 4,
        shortname: 'North West England',
        dnoregion: 'Electricity North West',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-3.5, 54.8], [-2.5, 54.8], [-2.5, 54.5], [-2.3, 53.8],
          [-2.5, 53.3], [-3.1, 53.2], [-3.2, 53.8], [-3.0, 54.2], [-3.5, 54.8],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 5,
        shortname: 'Yorkshire',
        dnoregion: 'NPG Yorkshire',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-2.0, 54.3], [-1.5, 54.5], [-0.2, 54.5], [0.0, 53.7],
          [-0.5, 53.3], [-1.5, 53.3], [-2.3, 53.8], [-2.0, 54.3],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 6,
        shortname: 'North Wales & Merseyside',
        dnoregion: 'SP Manweb',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.3, 53.4], [-3.1, 53.5], [-3.1, 53.2], [-2.9, 52.8],
          [-3.2, 52.3], [-4.0, 52.3], [-5.2, 52.0], [-5.5, 52.8], [-5.3, 53.4],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 7,
        shortname: 'East Midlands',
        dnoregion: 'WPD East Midlands',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-1.5, 53.3], [-0.5, 53.3], [0.0, 53.7], [0.5, 53.1],
          [0.3, 52.4], [-0.5, 52.2], [-1.3, 52.4], [-1.5, 53.3],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 8,
        shortname: 'West Midlands',
        dnoregion: 'WPD West Midlands',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-3.2, 52.3], [-2.9, 52.8], [-2.5, 53.3], [-1.5, 53.3],
          [-1.3, 52.4], [-1.5, 52.0], [-2.3, 51.9], [-3.0, 52.0], [-3.2, 52.3],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 9,
        shortname: 'East England',
        dnoregion: 'UKPN East',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [0.3, 52.4], [0.5, 53.1], [1.8, 52.8], [1.8, 52.0],
          [1.5, 51.8], [0.8, 51.6], [0.3, 51.9], [0.3, 52.4],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 10,
        shortname: 'South Wales',
        dnoregion: 'WPD South Wales',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.2, 52.0], [-4.0, 52.3], [-3.0, 52.0], [-2.8, 51.5],
          [-3.5, 51.4], [-5.3, 51.6], [-5.2, 52.0],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 11,
        shortname: 'South West England',
        dnoregion: 'WPD South West',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-5.7, 50.1], [-5.0, 50.0], [-3.5, 50.2], [-2.8, 50.7],
          [-2.8, 51.5], [-3.5, 51.4], [-5.3, 51.6], [-5.7, 50.7], [-5.7, 50.1],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 12,
        shortname: 'South England',
        dnoregion: 'SSE South',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-2.8, 51.5], [-2.8, 50.7], [-1.8, 50.6], [-1.0, 50.7],
          [-0.8, 51.0], [-1.3, 51.5], [-2.3, 51.9], [-2.8, 51.5],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 13,
        shortname: 'London',
        dnoregion: 'UKPN London',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-0.5, 51.7], [0.3, 51.7], [0.3, 51.3], [-0.5, 51.3], [-0.5, 51.7],
        ]],
      },
    },
    {
      type: 'Feature',
      properties: {
        regionid: 14,
        shortname: 'South East England',
        dnoregion: 'UKPN South East',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-0.5, 51.3], [0.3, 51.3], [0.3, 51.9], [0.8, 51.6],
          [1.5, 51.8], [1.4, 51.0], [1.0, 50.8], [-1.0, 50.7],
          [-0.8, 51.0], [-0.5, 51.3],
        ]],
      },
    },
  ],
};

// Map region shortnames to their IDs for quick lookup
export const REGION_NAME_TO_ID: Record<string, number> = {
  'North Scotland': 1,
  'South Scotland': 2,
  'North East England': 3,
  'North West England': 4,
  'Yorkshire': 5,
  'North Wales & Merseyside': 6,
  'East Midlands': 7,
  'West Midlands': 8,
  'East England': 9,
  'South Wales': 10,
  'South West England': 11,
  'South England': 12,
  'London': 13,
  'South East England': 14,
};
