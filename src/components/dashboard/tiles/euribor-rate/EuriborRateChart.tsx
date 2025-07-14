import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EURIBOR_RATE_CHART_CONFIG } from './constants';
import type { EuriborRatePoint, TimeRange } from './types';

interface EuriborRateChartProps {
  data?: EuriborRatePoint[];
  timeRange: TimeRange;
  loading?: boolean;
}

export const EuriborRateChart: React.FC<EuriborRateChartProps> = ({
  data = [],
  loading = false,
}) => {
  const formatYAxis = React.useCallback((tickItem: number) => {
    return `${tickItem.toFixed(2)}%`;
  }, []);

  // Memoize chart data transformation to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return data.map((point) => ({
      date: point.date,
      rate: point.rate,
      formattedDate: point.date.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
      }),
    }));
  }, [data]);

  const CustomTooltip = React.useCallback(
    ({
      active,
      payload,
      label,
    }: {
      active?: boolean;
      payload?: Array<{ value: number }>;
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        const dataPoint = payload[0];
        return (
          <div className="custom-tooltip">
            <p className="tooltip-date">{label}</p>
            <p className="tooltip-rate">Rate: {dataPoint.value.toFixed(2)}%</p>
          </div>
        );
      }
      return null;
    },
    [],
  );

  if (loading) {
    return (
      <div className="chart-loading">
        <div className="loading-spinner">Loading chart...</div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="chart-no-data">
        <div className="no-data-message">No chart data available</div>
      </div>
    );
  }

  return (
    <div className="euribor-rate-chart">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-200)" />
          <XAxis
            dataKey="formattedDate"
            stroke="var(--color-gray-600)"
            fontSize={EURIBOR_RATE_CHART_CONFIG.STYLES.FONT_SIZE}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-gray-600)"
            fontSize={EURIBOR_RATE_CHART_CONFIG.STYLES.FONT_SIZE}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatYAxis}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rate"
            stroke={EURIBOR_RATE_CHART_CONFIG.COLORS.PRIMARY}
            strokeWidth={EURIBOR_RATE_CHART_CONFIG.STYLES.STROKE_WIDTH}
            dot={{
              fill: EURIBOR_RATE_CHART_CONFIG.COLORS.PRIMARY,
              strokeWidth: 2,
              r: 2,
            }}
            activeDot={{
              r: EURIBOR_RATE_CHART_CONFIG.STYLES.ACTIVE_DOT_RADIUS,
              fill: EURIBOR_RATE_CHART_CONFIG.COLORS.SECONDARY,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
