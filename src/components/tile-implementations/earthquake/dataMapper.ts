import type { EarthquakeApiResponse } from './types';
import type { DataMapper } from '../../../services/dataMapper';
import type { EarthquakeTileDataArray } from './useEarthquakeApi';

/**
 * Maps USGS Earthquake API response to EarthquakeTileDataArray for the tile.
 */
export const earthquakeDataMapper: DataMapper<EarthquakeApiResponse, EarthquakeTileDataArray> = {
  map: (apiResponse: EarthquakeApiResponse): EarthquakeTileDataArray => {
    if (!apiResponse || !Array.isArray(apiResponse.features)) {
      throw new Error('Invalid EarthquakeApiResponse');
    }
    const items = (apiResponse.features || []).map((feature) => ({
      id: feature.id,
      place: feature.properties.place,
      magnitude: feature.properties.mag,
      time: feature.properties.time,
      coordinates: feature.geometry.coordinates,
    }));
    return { items };
  },
  safeMap(apiResponse: EarthquakeApiResponse): EarthquakeTileDataArray {
    try {
      return this.map(apiResponse);
    } catch {
      return { items: [] };
    }
  },
  validate: (data: unknown): data is EarthquakeApiResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray((data as EarthquakeApiResponse).features)
    );
  },
  createDefault: (): EarthquakeTileDataArray => ({ items: [] }),
};
