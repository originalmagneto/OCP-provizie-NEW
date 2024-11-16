import React from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronDown } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlySnapshot from "./QuarterlySnapshot";
import UnpaidInvoicesList from "./UnpaidInvoicesList";
import DashboardCharts from "./DashboardCharts";

export default function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {user.firm} Dashboard
            </h1>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Primary Action Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* New Invoice Form - Prominent and Easy to Use */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Create New Invoice</h2>
            <InvoiceForm />
          </div>

          {/* Quarterly Commission Summary - At a Glance */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-lg font-medium mb-4">
              Current Quarter Summary
            </h2>
            <QuarterlySnapshot />
          </div>
        </div>

        {/* Invoice Management Section */}
        <div className="space-y-6">
          {/* Unpaid Invoices - Highly Visible */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-amber-500">
            <h2 className="text-lg font-medium mb-4">Pending Payments</h2>
            <UnpaidInvoicesList />
          </div>

          {/* All Invoices with Better Filtering */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">All Invoices</h2>
            <InvoiceList />
          </div>
        </div>

        {/* Expandable Analytics Section */}
        <div className="mt-8">
          <Disclosure>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex justify-between w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <span className="font-medium text-gray-900">
                    View Detailed Analytics
                  </span>
                  <ChevronDown
                    className={`${
                      open ? "transform rotate-180" : ""
                    } w-5 h-5 text-gray-500`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="mt-4">
                  <DashboardCharts />
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        </div>
      </main>
    </div>
  );
}
