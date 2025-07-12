import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { PriceHistory } from '../../../types/cryptocurrency';

interface ChartComponentProps {
  data: PriceHistory[];
  title: string;
  color: string;
  height?: number;
}

export function ChartComponent({ data, title, color, height = 200 }: ChartComponentProps) {
  const formatTooltip = (value: unknown, name: string) => {
    return [`$${Number(value).toFixed(2)}`, name];
  };

  const formatXAxis = (tickItem: number) => {
    return new Date(tickItem).toLocaleDateString();
  };

  const formatYAxis = (value: unknown) => {
    return `$${Number(value).toFixed(0)}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 
