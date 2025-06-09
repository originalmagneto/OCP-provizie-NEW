import React from "react";
import React from "react";
// Removed X from lucide-react as close button is removed

interface HowItWorksProps {
  onStartTour: () => void;
}

export default function HowItWorks({
  onStartTour,
}: HowItWorksProps) {
  // Removed isOpen and onClose props and the initial conditional return

  // const handleStartTour = () => {
    // onClose(); // onClose is removed
    // onStartTour();
  // };
  // Simpler: just call onStartTour directly if no other logic from onClose was needed here.

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800 shadow-xl rounded-lg">
        <div className="flex justify-between items-start"> {/* Retained for title, X button removed */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">How It Works</h2>
          {/* X button removed */}
        </div>

        <div className="mt-6 space-y-6">
          {/* Overview Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Overview
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              The Commission Dashboard helps you track and manage referral
              commissions between partner firms. Track invoices, monitor
              payments, and view detailed analytics of your commission
              arrangements.
            </p>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                title="Invoice Management"
                description="Create and track invoices with automatic commission calculations. Monitor payment status and history."
              />
              <FeatureCard
                title="Commission Tracking"
                description="View quarterly commission summaries, track payments, and monitor outstanding balances."
              />
              <FeatureCard
                title="Analytics Dashboard"
                description="Visualize commission trends, payment history, and performance metrics through interactive charts."
              />
              <FeatureCard
                title="Multi-firm Support"
                description="Manage commission arrangements between different partner firms with firm-specific views and permissions."
              />
              <FeatureCard
                title="Customizable View"
                description="Personalize your experience with light and dark themes to suit your preference and working environment."
              />
              <FeatureCard
                title="Efficient Data Handling"
                description="Quickly find and organize your invoices with advanced filtering and sorting options."
              />
            </div>
          </section>

          {/* Step by Step Guide */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Getting Started
            </h3>
            <div className="space-y-4">
              <Step
                number={1}
                title="Create New Invoices"
                description="Add new invoices with client details, amounts, and commission percentages. The system automatically calculates commission amounts."
              />
              <Step
                number={2}
                title="Track Payments"
                description="Mark invoices as paid and track commission payments between firms. View payment history and outstanding balances."
              />
              <Step
                number={3}
                title="Monitor Performance"
                description="Use the analytics dashboard to track trends, view quarterly summaries, and generate reports."
              />
              <Step
                number={4}
                title="Manage Settlements"
                description="Handle quarterly commission settlements between firms and maintain payment records."
              />
            </div>
          </section>

          {/* Start Tour Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onStartTour} // Directly use onStartTour
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              Take an Interactive Tour
            </button>
          </div>
        </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg dark:border-gray-700">
      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start">
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-300 flex items-center justify-center font-semibold">
        {number}
      </div>
      <div className="ml-4">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </div>
  );
}
