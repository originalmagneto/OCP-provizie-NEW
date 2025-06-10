import React, { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "./ui/Collapsible";
import { Button } from "./ui/Button";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import { LogOut, Trash2, AlertTriangle, ChevronDown, Euro } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlySnapshot from "./QuarterlySnapshot";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";
import type { FirmType } from "../types";
import FirmLogoUploader from "./FirmLogoUploader";
import { withAlpha } from "../lib/utils";


export default function Dashboard() {
  const { user, logout, accentColor } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  if (!user) return null;

  const quarterLabel = `Q${currentQuarter} ${currentYear}`;
  const quarterRange = {
    start: new Date(currentYear, (currentQuarter - 1) * 3),
    end: new Date(currentYear, currentQuarter * 3 - 1),
  };
  const monthRange = `${quarterRange.start.toLocaleDateString("en-US", {
    month: "long",
  })} - ${quarterRange.end.toLocaleDateString("en-US", {
    month: "long",
  })}`;

  const bg = accentColor ? withAlpha(accentColor, 0.1) : '#f9fafb';
  const textColor = accentColor || '#4b5563';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {user.firmLogoUrl && (
                <img
                  src={user.firmLogoUrl}
                  alt={`${user.firm} logo`}
                  className="h-8 w-8 mr-2 object-contain"
                />
              )}
              <h1 className="text-2xl font-semibold" style={{ color: textColor }}>
                {user.firm} Commission Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm">
                {quarterLabel}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user.name}
              </span>
              <FirmLogoUploader />
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/commissions" className="inline-flex items-center">
                  <Euro className="h-4 w-4 mr-2" />
                  View Commissions
                </a>
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setShowResetConfirmation(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Data
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Primary Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* New Invoice Form */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Create New Invoice</h2>
            <InvoiceForm />
          </div>

          {/* Quarterly Commission Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4">
              Current Quarter Summary
            </h2>
            <QuarterlySnapshot />
          </div>
        </div>

        {/* Invoice Management Section */}
        <div className="space-y-6">
          {/* Unpaid Invoices Section */}
          <div
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 unpaid-invoices-section"
            style={{ borderColor: accentColor }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Pending Payments</h2>
              <div className="text-sm text-gray-500">{monthRange}</div>
            </div>
            <UnpaidInvoicesList />
          </div>

          {/* All Invoices Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">All Invoices</h2>
              <div className="text-sm text-gray-500">{quarterLabel}</div>
            </div>
            <InvoiceList />
          </div>
        </div>

        {/* Expandable Analytics Section */}
        <div className="mt-8">
          <Collapsible>
            <CollapsibleTrigger className="flex w-full justify-between rounded-lg px-4 py-2 text-left text-sm font-medium hover:bg-gray-200 bg-gray-100">
              <span>View Detailed Analytics</span>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <DashboardCharts />
            </CollapsibleContent>
          </Collapsible>
        </div>
      </main>

      {/* Reset Confirmation Modal */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Reset All Data
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to reset all data? This action cannot be
                  undone and will delete all invoices and commission records.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement reset functionality
                    setShowResetConfirmation(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
