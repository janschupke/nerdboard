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
import { URANIUM_CHART_CONFIG } from './constants';
import type { UraniumPriceData } from './types';
import type { TileSize } from '../../../../types/dashboard';

interface UraniumChartProps {
  uraniumData: UraniumPriceData;
  size: TileSize;
}

// Mock chart data for demonstration
const generateChartData = (basePrice: number) => {
  const data = [];
  const now = Date.now();
  const days = 30;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    // Use a deterministic variation based on the day to avoid random changes
    const variation = Math.sin(i * 0.5) * 5; // Deterministic variation
    data.push({
      date: date.toLocaleDateString(),
      price: basePrice + variation,
    });
  }

  return data;
};

export const UraniumChart = React.memo<UraniumChartProps>(({ uraniumData, size }) => {
  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => {
    return generateChartData(uraniumData.spotPrice);
  }, [uraniumData.spotPrice]);

  const getChartHeight = React.useCallback(() => {
    switch (size) {
      case 'small':
        return 120;
      case 'medium':
        return 180;
      case 'large':
        return 240;
      default:
        return 180;
    }
  }, [size]);

  const CustomTooltip = React.useCallback(({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-primary border border-theme-primary rounded-lg p-2 shadow-lg">
          <p className="text-sm font-medium text-theme-primary">{label}</p>
          <p className="text-sm text-theme-secondary">Price: ${payload[0].value.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  }, []);

  return (
    <div className="w-full" style={{ height: getChartHeight() }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-theme-tertiary)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            domain={['dataMin - 5', 'dataMax + 5']}
            tickFormatter={React.useCallback((value: number) => `$${value.toFixed(0)}`, [])}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={URANIUM_CHART_CONFIG.COLORS.PRIMARY}
            strokeWidth={URANIUM_CHART_CONFIG.STYLES.STROKE_WIDTH}
            dot={{ r: URANIUM_CHART_CONFIG.STYLES.ACTIVE_DOT_RADIUS }}
            activeDot={{ r: URANIUM_CHART_CONFIG.STYLES.ACTIVE_DOT_RADIUS * 1.5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

UraniumChart.displayName = 'UraniumChart';
