import React, { useState, useEffect } from "react"; // Added useEffect
import { Disclosure, Transition } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { useYear } from "../context/YearContext";
import { LogOut, Trash2, AlertTriangle, ChevronDown, Euro } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlySnapshot from "./QuarterlySnapshot";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";
import ThemeToggle from "./ThemeToggle"; // Added
import SplashScreenModal from './SplashScreenModal'; // Added
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100 dark:bg-purple-900",
    secondary: "bg-purple-50 dark:bg-slate-800",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-700",
    lightText: "text-purple-500 dark:text-purple-500", // Renamed from 'light'
    accent: "#9333ea",
  },
  MKMs: {
    primary: "bg-blue-100 dark:bg-blue-900",
    secondary: "bg-blue-50 dark:bg-slate-800",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-700",
    lightText: "text-blue-500 dark:text-blue-500", // Renamed from 'light'
    accent: "#2563eb",
  },
  Contax: {
    primary: "bg-yellow-100 dark:bg-yellow-800",
    secondary: "bg-yellow-50 dark:bg-slate-800",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-300 dark:border-yellow-700",
    lightText: "text-yellow-600 dark:text-yellow-500", // Renamed from 'light'
    accent: "#d97706",
  },
} as const;

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { currentYear, currentQuarter } = useYear();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [showSplashScreen, setShowSplashScreen] = useState(false); // Added

  useEffect(() => {
    const hasSeen = localStorage.getItem('hasSeenSplashScreenV1');
    if (!hasSeen) {
      setShowSplashScreen(true);
    }
  }, []);

  const handleDismissSplashScreen = () => {
    localStorage.setItem('hasSeenSplashScreenV1', 'true');
    setShowSplashScreen(false);
  };

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
      <header className="bg-white shadow-sm dark:bg-gray-800 dark:border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className={`text-2xl font-semibold ${firmTheme.text}`}>
                {user.firm} Commission Dashboard
              </h1>
              <span className="ml-4 px-3 py-1 rounded-md bg-gray-100 text-gray-600 text-sm dark:bg-gray-700 dark:text-gray-300">
                {quarterLabel}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Welcome, {user.name}
              </span>
              <a
                href="/commissions"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-600"
              >
                <Euro className="h-4 w-4 mr-2" />
                View Commissions
              </a>
              <button
                onClick={() => setShowResetConfirmation(true)}
                className="inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-red-600 hover:bg-red-50 border-red-500 focus:ring-red-400 dark:text-red-400 dark:hover:bg-red-900 dark:border-red-700 dark:hover:border-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Data
              </button>
              <ThemeToggle /> {/* Added */}
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-600"
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
        {/* Invoice Form Section (Collapsible) */}
        <div className="mb-8">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-3 text-left text-sm font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <span>{open ? "Hide Invoice Form" : "Create New Invoice"}</span>
                  <ChevronDown
                    className={`${
                      open ? "transform rotate-180" : ""
                    } h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-300`}
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
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                      <h2 className="text-lg font-medium mb-4">Create New Invoice</h2> {/* Will inherit dark:text-gray-100 */}
                      <InvoiceForm />
                    </div>
                  </Disclosure.Panel>
                </Transition>
              </>
            )}
          </Disclosure>
        </div>

        {/* Quarterly Commission Summary Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8 dark:bg-gray-800 dark:border-gray-700">
          <h2 className="text-lg font-medium mb-4"> {/* Will inherit dark:text-gray-100 */}
            Current Quarter Summary
          </h2>
          <QuarterlySnapshot />
        </div>

        {/* Invoice Management Section */}
        <div className="space-y-6">
          {/* Unpaid Invoices Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500 unpaid-invoices-section dark:bg-gray-800 dark:border-gray-700 dark:border-l-amber-400">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Pending Payments</h2> {/* Will inherit dark:text-gray-100 */}
              <div className="text-sm text-gray-500 dark:text-gray-400">{monthRange}</div>
            </div>
            <UnpaidInvoicesList />
          </div>

          {/* All Invoices Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">All Invoices</h2> {/* Will inherit dark:text-gray-100 */}
              <div className="text-sm text-gray-500 dark:text-gray-400">{quarterLabel}</div>
            </div>
            <InvoiceList />
          </div>
        </div>

        {/* Expandable Analytics Section */}
        <div className="mt-8">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between rounded-lg bg-gray-100 px-4 py-2 text-left text-sm font-medium hover:bg-gray-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 dark:bg-gray-700 dark:hover:bg-gray-600">
                  <span>View Detailed Analytics</span>
                  <ChevronDown
                    className={`${
                      open ? "transform rotate-180" : ""
                    } h-5 w-5 text-gray-500 transition-transform duration-200 dark:text-gray-300`}
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
                  <Disclosure.Panel className="mt-4"> {/* This panel itself does not have bg-white, its content (DashboardCharts) will need its own dark mode styles or rely on transparent bg and body styles */}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="mt-3 text-center">
              <div className="flex items-center justify-center text-red-500 mb-4 dark:text-red-400"> {/* Alert Icon color also needs update if it's an SVG fill or part of text color */}
                <AlertTriangle size={48} />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                Reset All Data
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to reset all data? This action cannot be
                  undone and will delete all invoices and commission records.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Implement reset functionality
                    setShowResetConfirmation(false);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md dark:bg-red-700 dark:hover:bg-red-600"
                >
                  Reset All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showSplashScreen && <SplashScreenModal onDismiss={handleDismissSplashScreen} />}
    </div>
  );
}
