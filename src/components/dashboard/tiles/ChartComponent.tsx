import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// Chart Configuration Constants
const CHART_CONFIG = {
  DEFAULT_HEIGHT: 200,
  FONT_SIZE: 10,
  STROKE_WIDTH: 2,
  ACTIVE_DOT_RADIUS: 4,
  PRICE_DECIMAL_PLACES: 2,
  PRICE_WHOLE_NUMBER_DECIMAL_PLACES: 0,
} as const;

interface PriceHistory {
  timestamp: number;
  price: number;
}

interface ChartComponentProps {
  data: PriceHistory[];
  title: string;
  color: string;
  height?: number;
  showPoints?: boolean;
  className?: string;
}

export const ChartComponent = React.memo<ChartComponentProps>(({ 
  data, 
  title,
  color, 
  height = CHART_CONFIG.DEFAULT_HEIGHT,
  showPoints = true,
  className = '' 
}) => {
  // Memoize className to prevent object recreation
  const chartClassName = useMemo(() => 
    `w-full ${className}`, 
    [className]
  );

  const formatTooltip = React.useCallback((value: unknown, name: string) => {
    return [`$${Number(value).toFixed(CHART_CONFIG.PRICE_DECIMAL_PLACES)}`, name];
  }, []);

  const formatXAxis = React.useCallback((tickItem: number) => {
    return new Date(tickItem).toLocaleDateString();
  }, []);

  const formatYAxis = React.useCallback((value: unknown) => {
    return `$${Number(value).toFixed(CHART_CONFIG.PRICE_WHOLE_NUMBER_DECIMAL_PLACES)}`;
  }, []);

  const formatLabel = React.useCallback((label: unknown) => {
    return new Date(label as number).toLocaleDateString();
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-theme-muted">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className={chartClassName}>
      <h3 className="text-sm font-medium text-theme-primary mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: CHART_CONFIG.FONT_SIZE }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: CHART_CONFIG.FONT_SIZE }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={formatLabel}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={CHART_CONFIG.STROKE_WIDTH}
            dot={showPoints}
            activeDot={{ r: CHART_CONFIG.ACTIVE_DOT_RADIUS, fill: color }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
