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
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Euro,
  FileText,
} from "lucide-react";

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
      };
    });

    invoices
      .filter((invoice) => new Date(invoice.date).getFullYear() === currentYear)
      .forEach((invoice) => {
        const month = new Date(invoice.date).getMonth();
        months[month].revenue += invoice.amount;
        months[month].commissions +=
          invoice.amount * (invoice.commissionPercentage / 100);
        months[month].invoiceCount += 1;
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
          };
        }
        acc[quarter].revenue += curr.revenue;
        acc[quarter].commissions += curr.commissions;
        acc[quarter].invoiceCount += curr.invoiceCount;
        return acc;
      },
      [] as Array<{
        quarter: string;
        revenue: number;
        commissions: number;
        invoiceCount: number;
      }>,
    );
  }, [monthlyData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Annual Revenue"
          value={formatCurrency(yearlyStats[currentYear]?.totalRevenue || 0)}
          icon={Euro}
          change={yearlyStats[currentYear]?.yearOverYearGrowth}
        />
        <StatCard
          title="Annual Commissions"
          value={formatCurrency(
            yearlyStats[currentYear]?.totalCommissions || 0,
          )}
          icon={TrendingUp}
          change={yearlyStats[currentYear]?.yearOverYearGrowth}
        />
        <StatCard
          title="Total Invoices"
          value={yearlyStats[currentYear]?.invoiceCount.toString() || "0"}
          icon={FileText}
        />
        <StatCard
          title="Average per Month"
          value={formatCurrency(
            (yearlyStats[currentYear]?.totalRevenue || 0) / 12,
          )}
          icon={Calendar}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Monthly Revenue & Commissions
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="commissions"
                  stroke="#10B981"
                  name="Commissions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quarterly Performance
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
                <Bar dataKey="commissions" fill="#10B981" name="Commissions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: number;
}

function StatCard({ title, value, icon: Icon, change }: StatCardProps) {
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
      </div>
    </div>
  );
}
