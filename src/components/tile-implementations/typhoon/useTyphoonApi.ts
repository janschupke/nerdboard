import type { TyphoonTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { CWB_TYPHOON_ENDPOINT } from '../../../services/apiEndpoints';

/**
 * Fetches Typhoon data from the CWB API using the unified dataFetcher and dataMapper.
 * @param tileId - Unique tile identifier for storage
 * @param apiKey - CWB API key
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<TyphoonTileData>
 */
export function useTyphoonApi() {
  const getTyphoonData = async (
    tileId: string,
    apiKey: string,
    forceRefresh = false,
  ): Promise<TyphoonTileData> => {
    let response;
    try {
      response = await fetch(`/api/cwb/v1/rest/datastore/W-C0034-002?Authorization=${apiKey}&format=JSON`);
    } catch (err) {
      throw new Error((err as Error).message || 'Network error');
    }
    if (!response.ok) {
      throw new Error('CWB API error');
    }
    const result = await DataFetcher.fetchAndMap(
      async () => response.json(),
      tileId,
      CWB_TYPHOON_ENDPOINT.url,
      { forceRefresh }
    );
    if (result.error) throw new Error(result.error);
    return result.data as TyphoonTileData;
  };
  return { getTyphoonData };
} 
