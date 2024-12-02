import React, { useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface MiniGraphProps {
  data: Array<{ amount: number; date: string }>;
  color: string;
  title?: string;
  height?: number;
  showAxes?: boolean;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  formatValue?: (value: number) => string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
  formatValue,
}: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value;
  const displayValue = formatValue
    ? formatValue(value)
    : value.toLocaleString("de-DE");

  return (
    <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-gray-200">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{displayValue}</p>
    </div>
  );
};

function TrendIndicator({
  data,
  formatValue,
}: {
  data: Array<{ amount: number }>;
  formatValue?: (value: number) => string;
}) {
  if (data.length < 2) return null;

  const firstValue = data[0].amount;
  const lastValue = data[data.length - 1].amount;
  const percentageChange = ((lastValue - firstValue) / firstValue) * 100;
  const isPositive = percentageChange >= 0;
  const trend = isPositive ? 'up' : 'down';

  return (
    <div
      className={`flex items-center space-x-1 text-sm ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {trend === 'up' && (
        <TrendingUpIcon className="h-5 w-5 text-green-500" />
      )}
      {trend === 'down' && (
        <TrendingDownIcon className="h-5 w-5 text-red-500" />
      )}
      <span className="font-medium">
        {Math.abs(percentageChange).toFixed(1)}%
      </span>
      <span className="text-xs text-gray-500">
        {formatValue
          ? `(${formatValue(lastValue - firstValue)})`
          : `(${(lastValue - firstValue).toLocaleString("de-DE")})`}
      </span>
    </div>
  );
}

export default function MiniGraph({
  data,
  color,
  title,
  height = 60,
  showAxes = false,
  showTooltip = true,
  formatValue,
}: MiniGraphProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate min and max for better visualization
  const values = data.map((item) => item.amount);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * 0.1;

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {title && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          <TrendIndicator data={data} formatValue={formatValue} />
        </div>
      )}
      <div
        className={`transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-75"
        }`}
        style={{ height }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            {showAxes && (
              <>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[min - padding, max + padding]}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatValue}
                />
              </>
            )}
            {showTooltip && (
              <Tooltip
                content={({ active, payload, label }) => (
                  <CustomTooltip
                    active={active}
                    payload={payload}
                    label={label}
                    formatValue={formatValue}
                  />
                )}
              />
            )}
            <defs>
              <linearGradient
                id={`gradient-${color}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="amount"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${color})`}
              animationDuration={300}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
