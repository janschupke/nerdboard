import { useCallback } from 'react';
import { EMMI_EURIBOR_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';

/**
 * Euribor endpoint is currently broken (HTML-scraped, not a public JSON API).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for EMMI Euribor endpoint (none)
 */
export function useEuriborApi() {
  const getEuriborRate = useCallback(async () => {
    buildApiUrl(EMMI_EURIBOR_ENDPOINT, {});
    throw new Error('Euribor endpoint is currently not implemented.');
  }, []);
  return { getEuriborRate };
}
