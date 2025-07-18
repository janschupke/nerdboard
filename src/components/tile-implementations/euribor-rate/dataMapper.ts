import type { EuriborRateApiResponse, EuriborRateTileData, EuriborRateHistoryEntry } from './types';
import type { DataMapper } from '../../../services/dataMapper';

/**
 * Maps ECB API response to EuriborRateTileData for the tile.
 */
export const ecbEuriborDataMapper: DataMapper<EuriborRateApiResponse, EuriborRateTileData> = {
  map: (apiResponse: EuriborRateApiResponse): EuriborRateTileData => {
    const historicalData: EuriborRateHistoryEntry[] = (apiResponse.rates || []).map((entry) => ({
      date: new Date(entry.date),
      rate: parseFloat(entry.value),
    }));
    const latest = historicalData[historicalData.length - 1];
    return {
      currentRate: latest?.rate ?? 0,
      lastUpdate: latest?.date ?? new Date(0),
      historicalData,
    };
  },
  safeMap: function (apiResponse: EuriborRateApiResponse): EuriborRateTileData {
    try {
      return this.map(apiResponse);
    } catch {
      return this.createDefault();
    }
  },
  validate: (data: unknown): data is EuriborRateApiResponse => {
    return (
      typeof data === 'object' &&
      data !== null &&
      Array.isArray((data as EuriborRateApiResponse).rates)
    );
  },
  createDefault: (): EuriborRateTileData => ({
    currentRate: 0,
    lastUpdate: new Date(0),
    historicalData: [],
  }),
};
