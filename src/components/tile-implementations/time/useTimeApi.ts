import type { TimeData } from '../time/types';
import { DataFetcher } from '../../../services/dataFetcher';

import { useCallback } from 'react';
import { TIME_API_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { TimeParams } from '../../../services/apiEndpoints';

/**
 * Fetches time data for a city from WorldTimeAPI.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for time endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<TimeData>
 */
export function useTimeApi() {
  const getTime = useCallback(
    async (tileId: string, params: TimeParams, forceRefresh = false): Promise<TimeData> => {
      const url = buildApiUrl(TIME_API_ENDPOINT, params);
      const result = await DataFetcher.fetchWithRetry<TimeData>(
        () => fetch(url).then((res) => res.json()),
        tileId,
        {
          apiCall: 'WorldTimeAPI',
          forceRefresh,
        },
      );
      if (result.error) throw new Error(result.error);
      return result.data as TimeData;
    },
    [],
  );
  return { getTime };
}
