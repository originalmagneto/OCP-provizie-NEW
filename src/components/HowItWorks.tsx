import React from "react";
import { X } from "lucide-react";

interface HowItWorksProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTour: () => void;
}

export default function HowItWorks({
  isOpen,
  onClose,
  onStartTour,
}: HowItWorksProps) {
  if (!isOpen) return null;

  const handleStartTour = () => {
    onClose();
    onStartTour();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-5 mx-auto p-8 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Overview Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Overview
            </h3>
            <p className="text-gray-600">
              The Commission Dashboard helps you track and manage referral
              commissions between partner firms. Track invoices, monitor
              payments, and view detailed analytics of your commission
              arrangements.
            </p>
          </section>

          {/* Key Features */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
            </div>
          </section>

          {/* Step by Step Guide */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
              onClick={handleStartTour}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Take an Interactive Tour
            </button>
          </div>
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
    <div className="p-4 border border-gray-200 rounded-lg">
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
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
      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold">
        {number}
      </div>
      <div className="ml-4">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
