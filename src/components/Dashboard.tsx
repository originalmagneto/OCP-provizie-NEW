import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useInvoices } from "../context/InvoiceContext";
import { LogOut, Trash2, AlertTriangle, GripHorizontal } from "lucide-react";
import InvoiceForm from "./InvoiceForm";
import InvoiceList from "./InvoiceList";
import QuarterlyCommissions from "./QuarterlyCommissions";
import QuarterlyPaymentTracker from "./QuarterlyPaymentTracker";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import type { FirmType } from "../types";

const firmThemes = {
  SKALLARS: {
    primary: "bg-purple-100",
    secondary: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
    light: "text-purple-500",
    accent: "#9333ea", // purple-600
  },
  MKMs: {
    primary: "bg-blue-100",
    secondary: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    light: "text-blue-500",
    accent: "#2563eb", // blue-600
  },
  Contax: {
    primary: "bg-yellow-100",
    secondary: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-200",
    light: "text-yellow-500",
    accent: "#d97706", // yellow-600
  },
} as const;

interface DraggableCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

function DraggableCard({ title, children, className }: DraggableCardProps) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm ${className} h-full overflow-hidden`}
    >
      {title && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">{title}</h2>
          <div className="cursor-move">
            <GripHorizontal className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}
      <div
        className="p-6 overflow-auto"
        style={{ height: "calc(100% - 70px)" }}
      >
        {children}
      </div>
    </div>
  );
}

function ResetConfirmationModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
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
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { resetAllData } = useInvoices();
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  // Load layout from localStorage or use default
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem("dashboardLayout");
    return savedLayout
      ? JSON.parse(savedLayout)
      : [
          { i: "invoiceForm", x: 0, y: 0, w: 6, h: 12, minW: 4, minH: 8 },
          { i: "invoiceList", x: 6, y: 0, w: 6, h: 12, minW: 4, minH: 8 },
          {
            i: "quarterlyCommissions",
            x: 0,
            y: 12,
            w: 12,
            h: 10,
            minW: 6,
            minH: 8,
          },
          {
            i: "quarterlyPayments",
            x: 0,
            y: 22,
            w: 12,
            h: 10,
            minW: 6,
            minH: 8,
          },
        ];
  });

  const handleReset = () => {
    resetAllData();
    setShowResetConfirmation(false);
  };

  const handleLayoutChange = (newLayout: any) => {
    setLayout(newLayout);
    localStorage.setItem("dashboardLayout", JSON.stringify(newLayout));
  };

  if (!user) return null;

  const firmTheme = firmThemes[user.firm as FirmType];

  return (
    <div className={`min-h-screen ${firmTheme.secondary}`}>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className={`text-2xl font-semibold ${firmTheme.text}`}>
                {user.firm} Commission Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Welcome, {user.name}
              </span>
              <button
                onClick={() => setShowResetConfirmation(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset Data
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <GridLayout
            className="layout"
            layout={layout}
            cols={12}
            rowHeight={30}
            width={1200}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".cursor-move"
            margin={[20, 20]}
            isResizable={true}
            resizeHandles={["se"]}
            preventCollision={false}
            verticalCompact={true}
            compactType="vertical"
            containerPadding={[0, 0]}
          >
            <div key="invoiceForm" className="grid-item">
              <DraggableCard
                title="New Invoice"
                className={`${firmTheme.border} ${firmTheme.secondary}`}
              >
                <InvoiceForm />
              </DraggableCard>
            </div>

            <div key="invoiceList" className="grid-item">
              <DraggableCard
                title="Invoices"
                className={`${firmTheme.border} ${firmTheme.secondary}`}
              >
                <InvoiceList />
              </DraggableCard>
            </div>

            <div key="quarterlyCommissions" className="grid-item">
              <DraggableCard
                title="Quarterly Overview"
                className={`${firmTheme.border} ${firmTheme.secondary}`}
              >
                <QuarterlyCommissions />
              </DraggableCard>
            </div>

            <div key="quarterlyPayments" className="grid-item">
              <DraggableCard
                title="Payment Tracker"
                className={`${firmTheme.border} ${firmTheme.secondary}`}
              >
                <QuarterlyPaymentTracker />
              </DraggableCard>
            </div>
          </GridLayout>
        </div>
      </main>

      {showResetConfirmation && (
        <ResetConfirmationModal
          onConfirm={handleReset}
          onCancel={() => setShowResetConfirmation(false)}
        />
      )}
    </div>
  );
}
