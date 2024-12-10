import React, { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import { LogOutIcon, Trash2Icon, AlertTriangleIcon, ChevronDownIcon } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlySnapshot from "./QuarterlySnapshot";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";
import CommissionsLists from "./CommissionsLists";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "text-purple-500",
    accent: "#9333ea",
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "text-blue-500",
    accent: "#2563eb",
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    light: "text-yellow-500",
    accent: "#d97706",
  },
} as const;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  if (!user) return null;

  const firmTheme = firmThemes[user.firm as FirmType];

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
    <div className={`min-h-screen ${firmTheme.secondary}`}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className={`text-2xl font-semibold ${firmTheme.text}`}>
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
              <button
                onClick={() => setShowResetConfirmation(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2Icon className="h-5 w-5 text-red-500" />
                <span className="ml-2">Reset Data</span>
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOutIcon className="h-5 w-5 text-gray-500" />
                <span className="ml-2">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Primary Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* New Invoice Form */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full">
              <h2 className="text-lg font-medium mb-4">Create New Invoice</h2>
              <InvoiceForm />
            </div>
          </div>

          {/* Quarterly Commission Summary */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 h-full">
              <h2 className="text-lg font-medium mb-4">
                Quarterly Summary and Settlements
              </h2>
              <QuarterlySnapshot />
            </div>
          </div>
        </div>

        {/* Commissions Lists Section */}
        <div className="w-full mb-8">
          <CommissionsLists />
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
                  <ChevronDownIcon
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
                <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />
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
