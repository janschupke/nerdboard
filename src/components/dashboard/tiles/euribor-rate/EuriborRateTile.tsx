import React from 'react';
import { useEuriborRateData } from './hooks/useEuriborRateData';
import { EuriborRateHeader } from './EuriborRateHeader';
import { EuriborRateChart } from './EuriborRateChart';
import { EuriborRateControls } from './EuriborRateControls';
import { LoadingSkeleton } from '../../../ui/LoadingSkeleton';
import { EURIBOR_RATE_ERROR_MESSAGES } from './constants';
// No need to import EuriborRateTileProps if not used

// If props are not used, just memoize the component as is
export const EuriborRateTile = React.memo(() => {
  const { data, loading, error, timeRange, setTimeRange } = useEuriborRateData();

  if (loading && !data) {
    return (
      <div className="tile euribor-rate-tile">
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="tile euribor-rate-tile">
        <div className="tile-error">
          <div className="error-message">{error || EURIBOR_RATE_ERROR_MESSAGES.FETCH_FAILED}</div>
          <button
            onClick={() => {}} // Placeholder for refreshData
            className="retry-button"
            aria-label="Retry loading Euribor rate data"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="tile euribor-rate-tile">
        <div className="tile-error">{EURIBOR_RATE_ERROR_MESSAGES.NO_DATA}</div>
      </div>
    );
  }

  return (
    <div className="tile euribor-rate-tile">
      <EuriborRateHeader
        currentRate={data?.currentRate}
        lastUpdate={data?.lastUpdate}
        loading={loading}
      />
      <EuriborRateChart data={data?.historicalData} timeRange={timeRange} loading={loading} />
      <EuriborRateControls
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onRefresh={() => {}} // Placeholder for refreshData
        loading={loading}
      />
    </div>
  );
});
