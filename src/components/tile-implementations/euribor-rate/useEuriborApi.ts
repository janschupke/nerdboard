import type { EuriborRateData } from '../euribor-rate/types';
import { DataFetcher } from '../../../services/dataFetcher';
import { storageManager } from '../../../services/storageManager';
import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { EuriborParams } from '../../../services/apiEndpoints';

/**
 * Fetches Euribor rate data from EMMI.
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for EMMI endpoint
 * @param forceRefresh - Whether to bypass cache and force a fresh fetch
 * @returns Promise<EuriborRateData>
 */
export function useEuriborApi() {
  const getEuriborRate = useCallback(
    async (tileId: string, params: EuriborParams, forceRefresh = false): Promise<EuriborRateData> => {
      const url = buildApiUrl(EMMI_EURIBOR_ENDPOINT, params);
      try {
        const result = await DataFetcher.fetchWithRetry<EuriborRateData>(
          () => fetch(url).then((res) => res.json()),
          tileId,
          { 
            apiCall: 'EMMI Euribor Rate API',
            forceRefresh,
          },
        );
        storageManager.setTileState<EuriborRateData>(tileId, {
          data: result.data as EuriborRateData,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: !result.error,
        });
        if (result.error) throw new Error(result.error);
        return result.data as EuriborRateData;
      } catch (error) {
        storageManager.setTileState<EuriborRateData>(tileId, {
          data: null,
          lastDataRequest: Date.now(),
          lastDataRequestSuccessful: false,
        });
        throw error;
      }
    },
    [],
  );
  return { getEuriborRate };
}
