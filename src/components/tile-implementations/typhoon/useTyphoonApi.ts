import type { TyphoonTileData } from './types';
import { DataFetcher } from '../../../services/dataFetcher';
import { CWB_TYPHOON_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import { TileType } from '../../../types/tile';

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
    const params = { Authorization: apiKey, format: 'JSON' as const };
    const url = buildApiUrl(CWB_TYPHOON_ENDPOINT, params);
    const result = await DataFetcher.fetchAndMap(
      () => fetch(url).then((res) => res.json()),
      tileId,
      TileType.TYPHOON,
      { forceRefresh },
    );
    if (result.error) throw new Error(result.error);
    return result.data as TyphoonTileData;
  };
  return { getTyphoonData };
}
