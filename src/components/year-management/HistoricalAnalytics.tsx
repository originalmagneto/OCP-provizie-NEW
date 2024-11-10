import React, { useMemo } from "react";
import { useInvoices } from "../../context/InvoiceContext";
import { useYear } from "../../context/YearContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TrendCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  percentageChange: number;
  formatter: (value: number) => string;
}

function TrendCard({
  title,
  currentValue,
  previousValue,
  percentageChange,
  formatter,
}: TrendCardProps) {
  const isPositive = percentageChange >= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div
          className={`flex items-center ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <ArrowUpRight className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="h-4 w-4 mr-1" />
          )}
          <span>{Math.abs(percentageChange).toFixed(1)}%</span>
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-semibold text-gray-900">
          {formatter(currentValue)}
        </div>
        <div className="mt-1 text-sm text-gray-500">
          Previous: {formatter(previousValue)}
        </div>
      </div>
    </div>
  );
}

export default function HistoricalAnalytics() {
  const { invoices } = useInvoices();
  const { currentYear } = useYear();

  const historicalData = useMemo(() => {
    // Group data by year and month
    const data = invoices.reduce(
      (acc, invoice) => {
        const date = new Date(invoice.date);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month.toString().padStart(2, "0")}`;

        if (!acc[key]) {
          acc[key] = {
            date: key,
            revenue: 0,
            commissions: 0,
            invoiceCount: 0,
            averageCommissionRate: 0,
            uniqueClients: new Set(),
          };
        }

        acc[key].revenue += invoice.amount;
        acc[key].commissions +=
          (invoice.amount * invoice.commissionPercentage) / 100;
        acc[key].invoiceCount += 1;
        acc[key].uniqueClients.add(invoice.clientName);
        acc[key].averageCommissionRate =
          (acc[key].commissions / acc[key].revenue) * 100;

        return acc;
      },
      {} as Record<string, any>,
    );

    // Convert to array and sort by date
    return Object.values(data)
      .map((item) => ({
        ...item,
        uniqueClients: item.uniqueClients.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [invoices]);

  const yearlyComparison = useMemo(() => {
    const currentYearData = invoices.filter(
      (inv) => new Date(inv.date).getFullYear() === currentYear,
    );
    const previousYearData = invoices.filter(
      (inv) => new Date(inv.date).getFullYear() === currentYear - 1,
    );

    const calculateMetrics = (data: typeof invoices) => ({
      revenue: data.reduce((sum, inv) => sum + inv.amount, 0),
      commissions: data.reduce(
        (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
        0,
      ),
      averageCommissionRate:
        data.reduce((sum, inv) => sum + inv.commissionPercentage, 0) /
        data.length,
      clientCount: new Set(data.map((inv) => inv.clientName)).size,
    });

    const current = calculateMetrics(currentYearData);
    const previous = calculateMetrics(previousYearData);

    return {
      revenue: {
        current: current.revenue,
        previous: previous.revenue,
        change: ((current.revenue - previous.revenue) / previous.revenue) * 100,
      },
      commissions: {
        current: current.commissions,
        previous: previous.commissions,
        change:
          ((current.commissions - previous.commissions) /
            previous.commissions) *
          100,
      },
      averageCommissionRate: {
        current: current.averageCommissionRate,
        previous: previous.averageCommissionRate,
        change:
          ((current.averageCommissionRate - previous.averageCommissionRate) /
            previous.averageCommissionRate) *
          100,
      },
      clientCount: {
        current: current.clientCount,
        previous: previous.clientCount,
        change:
          ((current.clientCount - previous.clientCount) /
            previous.clientCount) *
          100,
      },
    };
  }, [invoices, currentYear]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toString();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Historical Analysis
      </h2>

      {/* Year-over-Year Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendCard
          title="Annual Revenue"
          currentValue={yearlyComparison.revenue.current}
          previousValue={yearlyComparison.revenue.previous}
          percentageChange={yearlyComparison.revenue.change}
          formatter={formatCurrency}
        />
        <TrendCard
          title="Annual Commissions"
          currentValue={yearlyComparison.commissions.current}
          previousValue={yearlyComparison.commissions.previous}
          percentageChange={yearlyComparison.commissions.change}
          formatter={formatCurrency}
        />
        <TrendCard
          title="Average Commission Rate"
          currentValue={yearlyComparison.averageCommissionRate.current}
          previousValue={yearlyComparison.averageCommissionRate.previous}
          percentageChange={yearlyComparison.averageCommissionRate.change}
          formatter={formatPercentage}
        />
        <TrendCard
          title="Active Clients"
          currentValue={yearlyComparison.clientCount.current}
          previousValue={yearlyComparison.clientCount.previous}
          percentageChange={yearlyComparison.clientCount.change}
          formatter={formatNumber}
        />
      </div>

      {/* Historical Trends Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenue & Commission Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: number) =>
                    typeof value === "number" ? formatCurrency(value) : value
                  }
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  fill="#4F46E5"
                  stroke="#4F46E5"
                  fillOpacity={0.2}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="commissions"
                  stroke="#10B981"
                  name="Commissions"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Client Growth & Commission Rates
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="uniqueClients"
                  fill="#6366F1"
                  name="Active Clients"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="averageCommissionRate"
                  stroke="#F59E0B"
                  name="Avg Commission Rate %"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
