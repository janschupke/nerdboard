import { useCallback } from 'react';
import { YAHOO_FINANCE_CHART_ENDPOINT, buildApiUrl } from '../../../services/apiEndpoints';
import type { YahooFinanceChartParams } from '../../../services/apiEndpoints';

/**
 * Yahoo Finance endpoint is currently broken (proxy disabled).
 * @param tileId - Unique tile identifier for storage
 * @param params - Query params for Yahoo Finance chart endpoint
 */
export function useGdxEtfApi() {
  const getGDXETF = useCallback(async (_tileId: string, params: YahooFinanceChartParams) => {
    buildApiUrl(YAHOO_FINANCE_CHART_ENDPOINT, params);
    throw new Error('Yahoo Finance endpoint is currently not implemented.');
  }, []);
  return { getGDXETF };
}
