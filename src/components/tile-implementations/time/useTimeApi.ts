import type { TimeData } from '../time/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';

/**
 * Fetches time data for a city from WorldTimeAPI.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for time endpoint
 * @returns Promise<TimeData>
 */
export function useTimeApi() {
  const getTime = useCallback(async (tileId: string, params: TimeParams): Promise<TimeData> => {
    const url = buildApiUrl(TIME_API_ENDPOINT, params);
    try {
      const result = await DataFetcher.fetchWithRetry<TimeData>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        { apiCall: 'WorldTimeAPI' },
      );
      storageManager.setTileConfig<TimeData>(tileId, {
        data: result.data as TimeData,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: !result.error,
      });
      if (result.error) throw new Error(result.error);
      return result.data as TimeData;
    } catch (error) {
      storageManager.setTileConfig<TimeData>(tileId, {
        data: null,
        lastDataRequest: Date.now(),
        lastDataRequestSuccessful: false,
      });
      throw error;
    }
  }, []);
  return { getTime };
}
