import React from "react";
import { useYear } from "../../context/YearContext";
import { useInvoices } from "../../context/InvoiceContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Euro,
  FileText,
  Download,
  Maximize2,
} from "lucide-react";
import HistoricalAnalytics from "./HistoricalAnalytics";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: number;
  subText?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  change,
  subText,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
        {typeof change === "number" && (
          <div
            className={`flex items-center ${
              change >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {change >= 0 ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="text-sm font-medium">
              {Math.abs(change).toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        {subText && <p className="mt-1 text-sm text-gray-500">{subText}</p>}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
  onExport,
  onExpand,
}: {
  title: string;
  children: React.ReactNode;
  onExport?: () => void;
  onExpand?: () => void;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          {onExport && (
            <button
              onClick={onExport}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export data"
            >
              <Download className="h-5 w-5 text-gray-500" />
            </button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="View full screen"
            >
              <Maximize2 className="h-5 w-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>
      <div className="h-80">{children}</div>
    </div>
  );
}

export default function AnnualOverview() {
  const { currentYear, yearlyStats } = useYear();
  const { invoices } = useInvoices();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  // Calculate monthly data
  const monthlyData = React.useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(currentYear, i, 1);
      return {
        month: date.toLocaleString("default", { month: "short" }),
        revenue: 0,
        commissions: 0,
        invoiceCount: 0,
        averageCommission: 0,
      };
    });

    invoices
      .filter((invoice) => new Date(invoice.date).getFullYear() === currentYear)
      .forEach((invoice) => {
        const month = new Date(invoice.date).getMonth();
        const commission =
          invoice.amount * (invoice.commissionPercentage / 100);
        months[month].revenue += invoice.amount;
        months[month].commissions += commission;
        months[month].invoiceCount += 1;
        months[month].averageCommission =
          months[month].commissions / months[month].invoiceCount;
      });

    return months;
  }, [invoices, currentYear]);

  // Calculate quarterly data
  const quarterlyData = React.useMemo(() => {
    return monthlyData.reduce(
      (acc, curr, index) => {
        const quarter = Math.floor(index / 3);
        if (!acc[quarter]) {
          acc[quarter] = {
            quarter: `Q${quarter + 1}`,
            revenue: 0,
            commissions: 0,
            invoiceCount: 0,
            averageCommission: 0,
          };
        }
        acc[quarter].revenue += curr.revenue;
        acc[quarter].commissions += curr.commissions;
        acc[quarter].invoiceCount += curr.invoiceCount;
        acc[quarter].averageCommission =
          acc[quarter].commissions / acc[quarter].invoiceCount;
        return acc;
      },
      [] as Array<{
        quarter: string;
        revenue: number;
        commissions: number;
        invoiceCount: number;
        averageCommission: number;
      }>,
    );
  }, [monthlyData]);

  const handleExportData = (chartType: string) => {
    // Implementation for exporting chart data
    console.log(`Exporting ${chartType} data...`);
  };

  const handleExpandChart = (chartType: string) => {
    // Implementation for expanding chart to full screen
    console.log(`Expanding ${chartType} chart...`);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annual Revenue"
          value={formatCurrency(yearlyStats[currentYear]?.totalRevenue || 0)}
          icon={Euro}
          change={yearlyStats[currentYear]?.yearOverYearGrowth}
          subText="Total revenue for the year"
        />
        <StatCard
          title="Annual Commissions"
          value={formatCurrency(
            yearlyStats[currentYear]?.totalCommissions || 0,
          )}
          icon={TrendingUp}
          change={yearlyStats[currentYear]?.yearOverYearGrowth}
          subText="Total commissions earned"
        />
        <StatCard
          title="Total Invoices"
          value={yearlyStats[currentYear]?.invoiceCount.toString() || "0"}
          icon={FileText}
          subText="Number of invoices processed"
        />
        <StatCard
          title="Average Monthly Revenue"
          value={formatCurrency(
            (yearlyStats[currentYear]?.totalRevenue || 0) / 12,
          )}
          icon={Calendar}
          subText="Monthly revenue average"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance Chart */}
        <ChartCard
          title="Monthly Revenue & Commissions"
          onExport={() => handleExportData("monthly")}
          onExpand={() => handleExpandChart("monthly")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4F46E5"
                fill="#4F46E5"
                fillOpacity={0.1}
                name="Revenue"
              />
              <Area
                type="monotone"
                dataKey="commissions"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.1}
                name="Commissions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Quarterly Performance Chart */}
        <ChartCard
          title="Quarterly Performance"
          onExport={() => handleExportData("quarterly")}
          onExpand={() => handleExpandChart("quarterly")}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#4F46E5"
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="commissions"
                fill="#10B981"
                name="Commissions"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Trend Analysis Chart */}
      <ChartCard
        title="Commission Rate Trends"
        onExport={() => handleExportData("trends")}
        onExpand={() => handleExpandChart("trends")}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="averageCommission"
              stroke="#8B5CF6"
              name="Average Commission"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Historical Analytics Section */}
      <div className="mt-8">
        <HistoricalAnalytics />
      </div>
    </div>
  );
}
