import React, { useMemo, useState } from "react";
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
import { QuarterlyCommissionCard } from "./QuarterlyCommissionCard";
import { QuarterNavigation } from "./QuarterNavigation";
import type { FirmType } from "../types";

// Color theme constants
const COLORS = {
  revenue: {
    primary: "#10B981", // Emerald-500
    secondary: "#D1FAE5", // Emerald-100
  },
  commission: {
    primary: "#6366F1", // Indigo-500
    secondary: "#E0E7FF", // Indigo-100
  },
  pending: {
    primary: "#F59E0B", // Amber-500
    secondary: "#FEF3C7", // Amber-100
  }
};

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
  const [selectedQuarter, setSelectedQuarter] = useState<string | null>(null);
  const [settledQuarters, setSettledQuarters] = useState<Set<string>>(new Set());

  const {
    quarterlyData,
    totalRevenue,
    totalCommissionsDue,
    totalCommissionsOwed,
  } = useMemo(() => {
    const quarters: { [key: string]: any } = {};
    let revenue = 0;
    let commissionsOwed = 0;
    let commissionsDue = 0;

    invoices.forEach((invoice) => {
      const date = new Date(invoice.date);
      const quarter = Math.floor((date.getMonth() + 3) / 3);
      const year = date.getFullYear();
      const quarterKey = `${year}-Q${quarter}`;

      if (!quarters[quarterKey]) {
        quarters[quarterKey] = {
          invoices: [],
          revenue: 0,
          commissionsOwed: 0,
          commissionsDue: 0,
          quarter,
          year,
          isSettled: false,
        };
      }

      quarters[quarterKey].invoices.push(invoice);

      if (invoice.invoicedByFirm === user.firm) {
        const amount = invoice.amount;
        revenue += amount;
        quarters[quarterKey].revenue += amount;

        if (invoice.referredByFirm !== user.firm) {
          const commission = amount * (invoice.commissionPercentage / 100);
          commissionsOwed += commission;
          quarters[quarterKey].commissionsOwed += commission;
        }
      }

      if (invoice.referredByFirm === user.firm && invoice.invoicedByFirm !== user.firm) {
        const commission = invoice.amount * (invoice.commissionPercentage / 100);
        commissionsDue += commission;
        quarters[quarterKey].commissionsDue += commission;
      }
    });

    return {
      quarterlyData: Object.entries(quarters)
        .map(([key, data]) => ({ key, ...data }))
        .sort((a, b) => b.year - a.year || b.quarter - a.quarter),
      totalRevenue: revenue,
      totalCommissionsDue: commissionsDue,
      totalCommissionsOwed: commissionsOwed,
    };
  }, [invoices, user]);

  const handleQuarterSelect = (quarterKey: string) => {
    setSelectedQuarter(quarterKey);
  };

  const handleSettleQuarter = (quarterKey: string) => {
    setSettledQuarters((prev) => {
      const newSet = new Set(prev);
      newSet.add(quarterKey);
      return newSet;
    });
  };

  if (!user) return null;

  const theme = firmThemes[user.firm];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Revenue Card */}
        <div className={`p-6 rounded-xl shadow-sm border ${COLORS.revenue.secondary} border-${COLORS.revenue.primary}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
            <Euro className={`w-8 h-8 text-${COLORS.revenue.primary}`} />
          </div>
          <p className={`mt-2 text-3xl font-bold text-${COLORS.revenue.primary}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(totalRevenue)}
          </p>
          <MiniGraph data={[]} className={`text-${COLORS.revenue.primary}`} />
        </div>

        {/* Commissions Due Card */}
        <div className={`p-6 rounded-xl shadow-sm border ${COLORS.commission.secondary} border-${COLORS.commission.primary}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Commissions Due</h3>
            <TrendingUp className={`w-8 h-8 text-${COLORS.commission.primary}`} />
          </div>
          <p className={`mt-2 text-3xl font-bold text-${COLORS.commission.primary}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(totalCommissionsDue)}
          </p>
          <MiniGraph data={[]} className={`text-${COLORS.commission.primary}`} />
        </div>

        {/* Commissions Owed Card */}
        <div className={`p-6 rounded-xl shadow-sm border ${COLORS.pending.secondary} border-${COLORS.pending.primary}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Commissions Owed</h3>
            <TrendingDown className={`w-8 h-8 text-${COLORS.pending.primary}`} />
          </div>
          <p className={`mt-2 text-3xl font-bold text-${COLORS.pending.primary}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(totalCommissionsOwed)}
          </p>
          <MiniGraph data={[]} className={`text-${COLORS.pending.primary}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quarter Navigation */}
        <div className="md:col-span-1">
          <QuarterNavigation
            quarters={quarterlyData.map(({ quarter, year, key }) => ({
              quarter,
              year,
              isSettled: settledQuarters.has(key),
            }))}
            selectedQuarter={selectedQuarter}
            onQuarterSelect={handleQuarterSelect}
          />
        </div>

        {/* Commission Cards */}
        <div className="md:col-span-3 space-y-6">
          {quarterlyData
            .filter(({ key }) => !selectedQuarter || key === selectedQuarter)
            .map((quarterData) => (
              <QuarterlyCommissionCard
                key={quarterData.key}
                quarterKey={quarterData.key}
                quarter={quarterData.quarter}
                year={quarterData.year}
                revenue={quarterData.revenue}
                commissionsOwed={quarterData.commissionsOwed}
                commissionsDue={quarterData.commissionsDue}
                isSettled={settledQuarters.has(quarterData.key)}
                onSettle={() => handleSettleQuarter(quarterData.key)}
                userFirm={user.firm}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
