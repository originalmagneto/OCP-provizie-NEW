import React, { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import { useTheme } from "../context/ThemeContext";
import { LogOut, Trash2, AlertTriangle, ChevronDown, Euro, Settings as SettingsIcon, X } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlySnapshot from "./QuarterlySnapshot";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";
import AdminFirmSettings from "./AdminFirmSettings";
import type { FirmType } from "../types";
import { firmThemes } from "../config/themes";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const { theme } = useTheme();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  if (!user) return null;

  const firmTheme = theme;

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: firmTheme?.secondary }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: firmTheme?.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {firmTheme?.logoUrl && (
                <img src={firmTheme.logoUrl} alt="logo" className="h-8 w-8 mr-2" />
              )}
              <h1 className="text-2xl font-semibold" style={{ color: firmTheme?.text }}>
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
              <a
                href="/commissions"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Euro className="h-4 w-4 mr-2" />
                View Commissions
              </a>
              <button
                onClick={() => setShowResetConfirmation(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Data
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </button>
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
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500 unpaid-invoices-section">
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
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75">
                  <span>View Detailed Analytics</span>
                  <ChevronDown
                    className={`${
                      open ? "transform rotate-180" : ""
                    } h-5 w-5 text-gray-500 transition-transform duration-200`}
                  />
                </Disclosure.Button>
                <Transition
                  enter="transition duration-100 ease-out"
                  enterFrom="transform scale-95 opacity-0"
                  enterTo="transform scale-100 opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform scale-100 opacity-100"
                  leaveTo="transform scale-95 opacity-0"
                >
                  <Disclosure.Panel className="mt-4">
                    <DashboardCharts />
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
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
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-medium">Firm Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <AdminFirmSettings />
          </div>
        </div>
      )}
    </div>
  );
}
