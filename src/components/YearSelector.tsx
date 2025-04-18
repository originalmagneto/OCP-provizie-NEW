import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface YearStats {
  totalRevenue: number;
  totalCommissions: number;
  invoiceCount: number;
  yearOverYearGrowth: number;
}

interface YearSelectorProps {
  currentYear: number;
  availableYears: number[];
  yearlyStats: Record<number, YearStats>;
  onYearChange: (year: number) => void;
}

export default function YearSelector({
  currentYear,
  availableYears,
  yearlyStats,
  onYearChange,
}: YearSelectorProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onYearChange(currentYear - 1)}
          disabled={!availableYears.includes(currentYear - 1)}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-600" />
          <select
            value={currentYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="text-xl font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => onYearChange(currentYear + 1)}
          disabled={!availableYears.includes(currentYear + 1)}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {yearlyStats[currentYear] && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <div className="text-sm text-indigo-600 font-medium">
              Total Revenue
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(yearlyStats[currentYear].totalRevenue)}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-sm text-green-600 font-medium">
              Total Commissions
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(yearlyStats[currentYear].totalCommissions)}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Invoices</div>
            <div className="text-lg font-semibold text-gray-900">
              {yearlyStats[currentYear].invoiceCount}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">
              YoY Growth
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {yearlyStats[currentYear].yearOverYearGrowth > 0 ? "+" : ""}
              {yearlyStats[currentYear].yearOverYearGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
