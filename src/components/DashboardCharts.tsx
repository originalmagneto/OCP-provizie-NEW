import React, { useMemo, useState } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type { FirmType } from "../types";
import { useTheme } from "../context/ThemeContext"; // Added

const firmThemes = {
  SKALLARS: {
    light: { primary: "#9333ea", secondary: "#a855f7", tertiary: "#c084fc" },
    dark:  { primary: "#a855f7", secondary: "#c084fc", tertiary: "#d8b4fe" }
  },
  MKMs: {
    light: { primary: "#2563eb", secondary: "#3b82f6", tertiary: "#60a5fa" },
    dark:  { primary: "#3b82f6", secondary: "#60a5fa", tertiary: "#93c5fd" }
  },
  Contax: {
    light: { primary: "#d97706", secondary: "#f59e0b", tertiary: "#fbbf24" },
    dark:  { primary: "#f59e0b", secondary: "#fbbf24", tertiary: "#fcd34d" }
  },
} as const;

interface ChartMetric {
  label: string;
  value: string;
  change: number;
  trend: "up" | "down";
  icon: React.ElementType;
}

function MetricCard({ metric }: { metric: ChartMetric }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-700/30">
          <metric.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div
          className={`flex items-center ${
            metric.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {metric.trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          {Math.abs(metric.change)}%
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.label}</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {metric.value}
        </p>
      </div>
    </div>
  );
}

function ChartContainer({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="h-80">{children}</div>
    </div>
  );
}

export default function DashboardCharts() {
  const { invoices, isLoading } = useInvoices();
  const { user } = useAuth();
  const { theme: currentAppTheme } = useTheme(); // Added
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "1M" | "3M" | "6M" | "1Y" | "ALL"
  >("3M");

  const tickColor = currentAppTheme === 'dark' ? '#A0AEC0' : '#4A5568'; // gray-400 dark, gray-700 light
  const gridLineColor = currentAppTheme === 'dark' ? '#4A5568' : '#CBD5E0'; // gray-600 dark, gray-300 light

  const timeRangeFilter = useMemo(() => {
    const now = new Date();
    const ranges = {
      "1M": new Date(now.setMonth(now.getMonth() - 1)),
      "3M": new Date(now.setMonth(now.getMonth() - 3)),
      "6M": new Date(now.setMonth(now.getMonth() - 6)),
      "1Y": new Date(now.setFullYear(now.getFullYear() - 1)),
      ALL: new Date(0),
    };
    return ranges[selectedTimeRange];
  }, [selectedTimeRange]);

  const filteredInvoices = useMemo(() => {
    if (!Array.isArray(invoices) || isLoading) {
      return [];
    }

    try {
      return invoices.filter(invoice => {
        if (!invoice?.date || !invoice?.isPaid) return false;
        const invoiceDate = new Date(invoice.date);
        return !isNaN(invoiceDate.getTime()) && invoiceDate >= timeRangeFilter;
      });
    } catch (error) {
      console.error('Error filtering invoices:', error);
      return [];
    }
  }, [invoices, timeRangeFilter, isLoading]);

  const metrics = useMemo(() => {
    if (!Array.isArray(filteredInvoices) || filteredInvoices.length === 0) {
      return [
        {
          label: "Total Revenue",
          value: "€0.00",
          change: 0,
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          label: "Total Commissions",
          value: "€0.00",
          change: 0,
          trend: "up" as const,
          icon: TrendingUp,
        },
        {
          label: "Average Commission Rate",
          value: "0%",
          change: 0,
          trend: "up" as const,
          icon: Activity,
        },
        {
          label: "Invoice Count",
          value: "0",
          change: 0,
          trend: "up" as const,
          icon: Calendar,
        },
      ];
    }

    try {
      const totalRevenue = filteredInvoices.reduce((sum, inv) => {
        const amount = typeof inv?.amount === 'number' ? inv.amount : 0;
        return sum + amount;
      }, 0);

      const totalCommissions = filteredInvoices.reduce((sum, inv) => {
        const amount = typeof inv?.amount === 'number' ? inv.amount : 0;
        const percentage = typeof inv?.commissionPercentage === 'number' ? inv.commissionPercentage : 0;
        return sum + (amount * percentage) / 100;
      }, 0);

      const avgCommissionRate = filteredInvoices.reduce((sum, inv) => {
        const percentage = typeof inv?.commissionPercentage === 'number' ? inv.commissionPercentage : 0;
        return sum + percentage;
      }, 0) / (filteredInvoices.length || 1);

      return [
        {
          label: "Total Revenue",
          value: new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(totalRevenue),
          change: 12.5,
          trend: "up" as const,
          icon: DollarSign,
        },
        {
          label: "Total Commissions",
          value: new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(totalCommissions),
          change: 8.3,
          trend: "up" as const,
          icon: TrendingUp,
        },
        {
          label: "Average Commission Rate",
          value: `${avgCommissionRate.toFixed(1)}%`,
          change: 2.1,
          trend: "down" as const,
          icon: Activity,
        },
        {
          label: "Active Clients",
          value: new Set(
            filteredInvoices.map((inv) => inv.clientName),
          ).size.toString(),
          change: 15.0,
          trend: "up" as const,
          icon: Calendar,
        },
      ];
    } catch (error) {
      console.error('Error calculating metrics:', error);
      return [];
    }
  }, [filteredInvoices]);

  const monthlyData = useMemo(() => {
    const data = filteredInvoices.reduce(
      (acc, invoice) => {
        const date = new Date(invoice.date);
        const monthYear = date.toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        const commission =
          (invoice.amount * invoice.commissionPercentage) / 100;

        if (!acc[monthYear]) {
          acc[monthYear] = {
            month: monthYear,
            revenue: 0,
            commissions: 0,
            count: 0,
          };
        }

        acc[monthYear].revenue += invoice.amount;
        acc[monthYear].commissions += commission;
        acc[monthYear].count += 1;

        return acc;
      },
      {} as Record<string, any>,
    );

    return Object.values(data).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    );
  }, [filteredInvoices]);

  const commissionsByFirm = useMemo(() => {
    const data = filteredInvoices.reduce(
      (acc, invoice) => {
        const commission =
          (invoice.amount * invoice.commissionPercentage) / 100;
        acc[invoice.referredByFirm] =
          (acc[invoice.referredByFirm] || 0) + commission;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(data).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));
  }, [filteredInvoices]);

  if (!user) return null;

  const currentChartPalette = firmThemes[user.firm][currentAppTheme];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-end space-x-2">
        {["1M", "3M", "6M", "1Y", "ALL"].map((range) => (
          <button
            key={range}
            onClick={() => setSelectedTimeRange(range as any)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors
              ${
                selectedTimeRange === range
                  ? "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-gray-100"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:border-gray-500"
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Revenue & Commissions Trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={currentChartPalette.primary}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={currentChartPalette.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="commission" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={currentChartPalette.secondary}
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="95%"
                    stopColor={currentChartPalette.secondary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor }} stroke={gridLineColor} />
              <YAxis tick={{ fill: tickColor }} stroke={gridLineColor} />
              <Tooltip
                contentStyle={{ backgroundColor: currentAppTheme === 'dark' ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridLineColor}` }}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: tickColor }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
              />
              <Legend wrapperStyle={{ color: tickColor }} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={currentChartPalette.primary}
                fillOpacity={1}
                fill="url(#revenue)"
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="commissions"
                stroke={currentChartPalette.secondary}
                fillOpacity={1}
                fill="url(#commission)"
                name="Commissions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Commission Distribution by Firm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={commissionsByFirm}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)}`
                }
                outerRadius={100}
                dataKey="value"
              >
                {commissionsByFirm.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      [currentChartPalette.primary, currentChartPalette.secondary, currentChartPalette.tertiary][
                        index % 3
                      ]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: currentAppTheme === 'dark' ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridLineColor}` }}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: tickColor }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
              />
              <Legend wrapperStyle={{ color: tickColor }}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Invoice Count Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor }} stroke={gridLineColor} />
              <YAxis tick={{ fill: tickColor }} stroke={gridLineColor}/>
              <Tooltip
                contentStyle={{ backgroundColor: currentAppTheme === 'dark' ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridLineColor}` }}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: tickColor }}
              />
              <Legend wrapperStyle={{ color: tickColor }}/>
              <Line
                type="monotone"
                dataKey="count"
                stroke={currentChartPalette.primary}
                name="Number of Invoices"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Monthly Performance">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridLineColor} />
              <XAxis dataKey="month" tick={{ fill: tickColor }} stroke={gridLineColor} />
              <YAxis tick={{ fill: tickColor }} stroke={gridLineColor} />
              <Tooltip
                contentStyle={{ backgroundColor: currentAppTheme === 'dark' ? '#1F2937' : '#FFFFFF', border: `1px solid ${gridLineColor}` }}
                itemStyle={{ color: tickColor }}
                labelStyle={{ color: tickColor }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(value)
                }
              />
              <Legend wrapperStyle={{ color: tickColor }}/>
              <Bar
                dataKey="revenue"
                fill={currentChartPalette.primary}
                name="Revenue"
                opacity={0.8}
              />
              <Bar
                dataKey="commissions"
                fill={currentChartPalette.secondary}
                name="Commissions"
                opacity={0.8}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  );
}
