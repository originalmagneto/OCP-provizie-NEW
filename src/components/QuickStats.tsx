import React from "react";
import { useInvoices } from "../context/InvoiceContext";
import { TrendingUp, Users, FileText, PieChart } from "lucide-react";

export default function QuickStats() {
  const { invoices } = useInvoices();

  // Calculate stats
  const stats = {
    totalRevenue: invoices.reduce(
      (sum, inv) => sum + (inv.isPaid ? inv.amount : 0),
      0,
    ),
    totalCommissions: invoices.reduce(
      (sum, inv) =>
        sum + (inv.isPaid ? (inv.amount * inv.commissionPercentage) / 100 : 0),
      0,
    ),
    totalClients: new Set(invoices.map((inv) => inv.clientName)).size,
    pendingInvoices: invoices.filter((inv) => !inv.isPaid).length,
  };

  const statItems = [
    {
      name: "Total Revenue",
      value: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(stats.totalRevenue),
      icon: TrendingUp,
      change: "+12.3%",
      changeType: "increase",
    },
    {
      name: "Total Commissions",
      value: new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(stats.totalCommissions),
      icon: PieChart,
      change: "+8.2%",
      changeType: "increase",
    },
    {
      name: "Active Clients",
      value: stats.totalClients,
      icon: Users,
      change: "+3",
      changeType: "increase",
    },
    {
      name: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: FileText,
      change: "-2",
      changeType: "decrease",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item) => (
        <div
          key={item.name}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`
                p-2 rounded-lg
                ${item.name === "Total Revenue" ? "bg-green-100 text-green-600" : ""}
                ${item.name === "Total Commissions" ? "bg-blue-100 text-blue-600" : ""}
                ${item.name === "Active Clients" ? "bg-purple-100 text-purple-600" : ""}
                ${item.name === "Pending Invoices" ? "bg-orange-100 text-orange-600" : ""}
              `}
              >
                <item.icon className="h-6 w-6" />
              </div>
            </div>
            <div
              className={`text-sm font-medium ${
                item.changeType === "increase"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {item.change}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-500">{item.name}</h3>
            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
