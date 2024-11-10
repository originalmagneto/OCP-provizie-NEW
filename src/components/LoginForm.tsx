import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Building2,
  LogIn,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { FirmType } from "../types";

const FIRMS: FirmType[] = ["SKALLARS", "MKMs", "Contax"];

const firmDetails = {
  SKALLARS: {
    color: "purple",
    description: "Attorneys & Consultants",
    bgGradient: "from-purple-500 to-indigo-600",
  },
  MKMs: {
    color: "blue",
    description: "Accounting and Tax administration",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  Contax: {
    color: "yellow",
    description: "Tax advisory services and audits",
    bgGradient: "from-yellow-500 to-orange-600",
  },
} as const;

interface FirmCardProps {
  firm: FirmType;
  isSelected: boolean;
  onClick: () => void;
}

function FirmCard({ firm, isSelected, onClick }: FirmCardProps) {
  const details = firmDetails[firm];

  return (
    <div
      onClick={onClick}
      className={`
        relative p-6 rounded-xl cursor-pointer transition-all duration-200
        ${
          isSelected
            ? `bg-gradient-to-br ${details.bgGradient} text-white shadow-lg scale-105`
            : "bg-white hover:bg-gray-50 border border-gray-200"
        }
      `}
    >
      <div className="flex items-center space-x-4">
        <div
          className={`
            p-3 rounded-lg
            ${
              isSelected
                ? "bg-white/20"
                : `bg-${details.color}-100 text-${details.color}-600`
            }
          `}
        >
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <h3
            className={`text-lg font-semibold ${
              isSelected ? "text-white" : "text-gray-900"
            }`}
          >
            {firm}
          </h3>
          <p
            className={`text-sm ${
              isSelected ? "text-white/80" : "text-gray-500"
            }`}
          >
            {details.description}
          </p>
        </div>
      </div>
      {isSelected && (
        <div className="absolute top-4 right-4">
          <CheckCircle2 className="h-6 w-6 text-white" />
        </div>
      )}
    </div>
  );
}

interface StatusMessageProps {
  type: "error" | "success" | "info";
  message: string;
}

function StatusMessage({ type, message }: StatusMessageProps) {
  const styles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: AlertCircle,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-800",
      icon: CheckCircle2,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: AlertCircle,
    },
  };

  const style = styles[type];
  const Icon = style.icon;

  return (
    <div
      className={`flex items-center p-4 rounded-lg ${style.bg} ${style.border}`}
    >
      <Icon className={`h-5 w-5 ${style.text} mr-3`} />
      <p className={`text-sm ${style.text}`}>{message}</p>
    </div>
  );
}

export default function LoginForm() {
  const [selectedFirm, setSelectedFirm] = useState<FirmType | null>(null);
  const { login, isLoading } = useAuth();
  const [status, setStatus] = useState<{
    type: "error" | "success" | "info";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFirm) {
      setStatus({
        type: "error",
        message: "Please select a firm to continue",
      });
      return;
    }

    try {
      setStatus({
        type: "info",
        message: "Logging in...",
      });
      await login(selectedFirm);
      setStatus({
        type: "success",
        message: "Login successful!",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: "Login failed. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Commission Management Portal
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Select your firm to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Firm Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FIRMS.map((firm) => (
              <FirmCard
                key={firm}
                firm={firm}
                isSelected={selectedFirm === firm}
                onClick={() => {
                  setSelectedFirm(firm);
                  setStatus(null);
                }}
              />
            ))}
          </div>

          {/* Status Message */}
          {status && (
            <div className="mt-4">
              <StatusMessage type={status.type} message={status.message} />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedFirm}
            className={`
              w-full flex items-center justify-center px-6 py-3 rounded-lg
              text-sm font-medium transition-all duration-200
              ${
                selectedFirm
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <LogIn className="h-5 w-5 mr-2" />
            )}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500">
            Need help? Contact{" "}
            <a
              href="mailto:support@example.com"
              className="text-indigo-600 hover:text-indigo-500"
            >
              support@example.com
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
