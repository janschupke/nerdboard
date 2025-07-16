import { DataMapperRegistry, type DataMapper } from '../../../services/dataMapper';
import type { EarthquakeApiResponse, EarthquakeTileData } from './types';

/**
 * Maps USGS Earthquake API response to an array of EarthquakeTileData for the tile.
 */
export const earthquakeDataMapper: DataMapper<EarthquakeApiResponse, EarthquakeTileData[]> = {
  map: (apiResponse: EarthquakeApiResponse): EarthquakeTileData[] => {
    if (!apiResponse || !Array.isArray(apiResponse.features)) {
      throw new Error('Invalid EarthquakeApiResponse');
    }
    return (apiResponse.features || []).map((feature) => ({
      id: feature.id,
      place: feature.properties.place,
      magnitude: feature.properties.mag,
      time: feature.properties.time,
      coordinates: feature.geometry.coordinates,
    }));
  },
  safeMap(apiResponse: EarthquakeApiResponse): EarthquakeTileData[] {
    try {
      return this.map(apiResponse);
    } catch {
      return [];
    }
  },
  validate: (data: unknown): data is EarthquakeApiResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray((data as EarthquakeApiResponse).features)
    );
  },
  createDefault: (): EarthquakeTileData[] => [],
};

/**
 * Registers the Earthquake data mapper with the DataMapperRegistry.
 */
export function registerEarthquakeDataMapper() {
  DataMapperRegistry.register('earthquake', earthquakeDataMapper);
  DataMapperRegistry.register('/api/usgs/fdsnws/event/1/query', earthquakeDataMapper);
}
