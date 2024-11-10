import React, { useState, useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import { Euro, FileText, TrendingUp, Calendar } from "lucide-react";
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
} from "recharts";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "text-purple-500",
    accent: "#9333ea", // purple-600
    chart: ["#9333ea", "#a855f7", "#c084fc"],
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "text-blue-500",
    accent: "#2563eb", // blue-600
    chart: ["#2563eb", "#3b82f6", "#60a5fa"],
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    light: "text-yellow-500",
    accent: "#d97706", // yellow-600
    chart: ["#d97706", "#f59e0b", "#fbbf24"],
  },
} as const;

interface QuarterlyData {
  quarter: string;
  totalAmount: number;
  commissionAmount: number;
  invoiceCount: number;
  byFirm: {
    [key in FirmType]?: {
      amount: number;
      count: number;
    };
  };
}

function CommissionCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  onClick,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${
        onClick
          ? "cursor-pointer hover:border-indigo-300 transition-colors"
          : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-50 rounded-lg p-3">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
        {trend && (
          <div
            className={`text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : "-"}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        <p className="mt-1 text-sm text-gray-500">{subValue}</p>
      </div>
    </div>
  );
}

function QuarterSelector({
  currentQuarter,
  onQuarterChange,
}: {
  currentQuarter: string;
  onQuarterChange: (quarter: string) => void;
}) {
  const quarters = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;

    const result = [];
    for (let i = 0; i < 4; i++) {
      let year = currentYear;
      let quarter = currentQuarter - i;

      if (quarter <= 0) {
        quarter += 4;
        year -= 1;
      }

      result.push(`Q${quarter} ${year}`);
    }
    return result;
  }, []);

  return (
    <div className="flex space-x-2">
      {quarters.map((quarter) => (
        <button
          key={quarter}
          onClick={() => onQuarterChange(quarter)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${
              currentQuarter === quarter
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
            }
          `}
        >
          {quarter}
        </button>
      ))}
    </div>
  );
}

export default function QuarterlyCommissions() {
  const { invoices } = useInvoices();
  const { user } = useAuth();
  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${currentQuarter} ${now.getFullYear()}`;
  });

  const quarterlyData: QuarterlyData = useMemo(() => {
    const [quarter, year] = selectedQuarter.split(" ");
    const quarterNumber = parseInt(quarter.substring(1));
    const startMonth = (quarterNumber - 1) * 3;
    const startDate = new Date(parseInt(year), startMonth, 1);
    const endDate = new Date(parseInt(year), startMonth + 3, 0);

    return invoices.reduce(
      (acc, invoice) => {
        const invoiceDate = new Date(invoice.date);
        if (
          invoiceDate >= startDate &&
          invoiceDate <= endDate &&
          invoice.isPaid
        ) {
          acc.totalAmount += invoice.amount;
          const commission =
            (invoice.amount * invoice.commissionPercentage) / 100;
          acc.commissionAmount += commission;
          acc.invoiceCount += 1;

          if (!acc.byFirm[invoice.referredByFirm]) {
            acc.byFirm[invoice.referredByFirm] = { amount: 0, count: 0 };
          }
          acc.byFirm[invoice.referredByFirm]!.amount += commission;
          acc.byFirm[invoice.referredByFirm]!.count += 1;
        }
        return acc;
      },
      {
        quarter: selectedQuarter,
        totalAmount: 0,
        commissionAmount: 0,
        invoiceCount: 0,
        byFirm: {},
      } as QuarterlyData,
    );
  }, [invoices, selectedQuarter]);

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  if (!user) return null;

  const firmTheme = firmThemes[user.firm];

  // Transform data for charts
  const pieChartData = Object.entries(quarterlyData.byFirm).map(
    ([firm, data]) => ({
      name: firm,
      value: data.amount,
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Quarterly Commission Overview
        </h2>
        <QuarterSelector
          currentQuarter={selectedQuarter}
          onQuarterChange={setSelectedQuarter}
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CommissionCard
          title="Total Revenue"
          value={formatEUR(quarterlyData.totalAmount)}
          subValue={`From ${quarterlyData.invoiceCount} invoices`}
          icon={Euro}
          trend={{ value: 12, isPositive: true }}
        />
        <CommissionCard
          title="Total Commissions"
          value={formatEUR(quarterlyData.commissionAmount)}
          subValue="Across all firms"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <CommissionCard
          title="Average Commission"
          value={formatEUR(
            quarterlyData.invoiceCount
              ? quarterlyData.commissionAmount / quarterlyData.invoiceCount
              : 0,
          )}
          subValue="Per invoice"
          icon={FileText}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commission Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Commission Distribution
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatEUR(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={firmTheme.chart[index % firmTheme.chart.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatEUR(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Commission Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Trend
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    month: "Jan",
                    commissions: quarterlyData.commissionAmount * 0.3,
                  },
                  {
                    month: "Feb",
                    commissions: quarterlyData.commissionAmount * 0.35,
                  },
                  {
                    month: "Mar",
                    commissions: quarterlyData.commissionAmount * 0.35,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatEUR(value)} />
                <Bar
                  dataKey="commissions"
                  fill={firmTheme.accent}
                  name="Commission Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Detailed Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoices
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average Commission
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(quarterlyData.byFirm).map(([firm, data]) => (
                <tr key={firm} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`font-medium ${firmThemes[firm as FirmType].text}`}
                    >
                      {firm}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {data.count} invoice{data.count !== 1 ? "s" : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatEUR(data.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatEUR(data.amount / data.count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
