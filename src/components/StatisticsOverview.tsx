import React, { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { useAuth } from "../context/AuthContext";
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import MiniGraph from "./MiniGraph";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "#9333ea",
    secondary: "#a855f7",
    text: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  MKMs: {
    primary: "#2563eb",
    secondary: "#3b82f6",
    text: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  Contax: {
    primary: "#d97706",
    secondary: "#f59e0b",
    text: "text-yellow-600",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
  },
} as const;

interface StatCardProps {
  title: string;
  value: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ElementType;
  color: string;
  subValue?: string;
  graphData?: Array<{ amount: number; date: string }>;
}

function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
  subValue,
  graphData,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
        {trend && (
          <div
            className={`flex items-center text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
        {subValue && <p className="mt-1 text-sm text-gray-500">{subValue}</p>}
      </div>
      {graphData && (
        <div className="mt-4">
          <MiniGraph
            data={graphData}
            color={color}
            height={40}
            showTooltip={true}
            formatValue={(value) =>
              new Intl.NumberFormat("de-DE", {
                style: "currency",
                currency: "EUR",
              }).format(value)
            }
          />
        </div>
      )}
    </div>
  );
}

interface TopClientCardProps {
  client: {
    name: string;
    totalRevenue: number;
    invoiceCount: number;
    trend: number;
  };
}

function TopClientCard({ client }: TopClientCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
      <div>
        <h4 className="font-medium text-gray-900">{client.name}</h4>
        <div className="mt-1 text-sm text-gray-500">
          {client.invoiceCount} invoices
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-gray-900">
          {new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(client.totalRevenue)}
        </div>
        <div
          className={`text-sm flex items-center justify-end ${
            client.trend >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {client.trend >= 0 ? (
            <TrendingUp className="h-4 w-4 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 mr-1" />
          )}
          {Math.abs(client.trend)}%
        </div>
      </div>
    </div>
  );
}

export default function StatisticsOverview() {
  const { invoices } = useInvoices();
  const { user } = useAuth();

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentInvoices = invoices.filter(
      (inv) => new Date(inv.date) >= thirtyDaysAgo,
    );
    const previousInvoices = invoices.filter(
      (inv) =>
        new Date(inv.date) >=
          new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000) &&
        new Date(inv.date) < thirtyDaysAgo,
    );

    const currentRevenue = recentInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const previousRevenue = previousInvoices.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const revenueTrend =
      previousRevenue === 0
        ? 100
        : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    const currentCommissions = recentInvoices.reduce(
      (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
      0,
    );
    const previousCommissions = previousInvoices.reduce(
      (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
      0,
    );
    const commissionsTrend =
      previousCommissions === 0
        ? 100
        : ((currentCommissions - previousCommissions) / previousCommissions) *
          100;

    // Generate monthly data for graphs
    const monthlyData = invoices.reduce(
      (acc, inv) => {
        const date = new Date(inv.date);
        const monthYear = date.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        });

        if (!acc[monthYear]) {
          acc[monthYear] = {
            revenue: 0,
            commissions: 0,
          };
        }

        acc[monthYear].revenue += inv.amount;
        acc[monthYear].commissions +=
          (inv.amount * inv.commissionPercentage) / 100;

        return acc;
      },
      {} as Record<string, { revenue: number; commissions: number }>,
    );

    const graphData = Object.entries(monthlyData).map(
      ([date, { revenue, commissions }]) => ({
        date,
        revenue,
        commissions,
      }),
    );

    // Calculate top clients
    const clientStats = invoices.reduce(
      (acc, inv) => {
        if (!acc[inv.clientName]) {
          acc[inv.clientName] = {
            name: inv.clientName,
            totalRevenue: 0,
            invoiceCount: 0,
            trend: 0,
          };
        }
        acc[inv.clientName].totalRevenue += inv.amount;
        acc[inv.clientName].invoiceCount += 1;
        return acc;
      },
      {} as Record<
        string,
        {
          name: string;
          totalRevenue: number;
          invoiceCount: number;
          trend: number;
        }
      >,
    );

    const topClients = Object.values(clientStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    return {
      currentRevenue,
      revenueTrend,
      currentCommissions,
      commissionsTrend,
      graphData,
      topClients,
    };
  }, [invoices]);

  if (!user) return null;

  const theme = firmThemes[user.firm];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Monthly Revenue"
          value={new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(stats.currentRevenue)}
          trend={{
            value: Number(stats.revenueTrend.toFixed(1)),
            isPositive: stats.revenueTrend >= 0,
          }}
          icon={Euro}
          color={theme.primary}
          subValue="Last 30 days"
          graphData={stats.graphData.map((d) => ({
            amount: d.revenue,
            date: d.date,
          }))}
        />
        <StatCard
          title="Monthly Commissions"
          value={new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(stats.currentCommissions)}
          trend={{
            value: Number(stats.commissionsTrend.toFixed(1)),
            isPositive: stats.commissionsTrend >= 0,
          }}
          icon={TrendingUp}
          color={theme.secondary}
          subValue="Last 30 days"
          graphData={stats.graphData.map((d) => ({
            amount: d.commissions,
            date: d.date,
          }))}
        />
        <StatCard
          title="Active Clients"
          value={stats.topClients.length.toString()}
          icon={Users}
          color={theme.primary}
          subValue="With recent activity"
        />
        <StatCard
          title="Pending Commissions"
          value={new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(
            invoices
              .filter((inv) => !inv.isPaid)
              .reduce(
                (sum, inv) =>
                  sum + (inv.amount * inv.commissionPercentage) / 100,
                0,
              ),
          )}
          icon={Clock}
          color={theme.secondary}
          subValue="Awaiting payment"
        />
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Top Performing Clients
        </h3>
        <div className="space-y-3">
          {stats.topClients.map((client) => (
            <TopClientCard key={client.name} client={client} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Payment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-sm text-gray-600">Paid Invoices</span>
              </div>
              <span className="text-sm font-medium">
                {invoices.filter((inv) => inv.isPaid).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-gray-600">Pending Payments</span>
              </div>
              <span className="text-sm font-medium">
                {invoices.filter((inv) => !inv.isPaid).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {invoices
              .slice(0, 3)
              .sort(
                (a, b) =>
                  new Date(b.date).getTime() - new Date(a.date).getTime(),
              )
              .map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    {invoice.isPaid ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.clientName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      }).format(invoice.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {invoice.commissionPercentage}% commission
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
