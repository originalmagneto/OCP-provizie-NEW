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
    <div className="bg-white rounded-lg shadow-sm p-4 dark:bg-gray-800 dark:border dark:border-gray-700 dark:shadow-none">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onYearChange(currentYear - 1)}
          disabled={!availableYears.includes(currentYear - 1)}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <select
            value={currentYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="text-xl font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md dark:text-gray-100 dark:focus:ring-indigo-400"
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
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed dark:hover:bg-gray-700"
        >
          <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {yearlyStats[currentYear] && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <div className="p-4 bg-indigo-50 rounded-lg dark:bg-indigo-500/20">
            <div className="text-sm text-indigo-600 font-medium dark:text-indigo-300">
              Total Revenue
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(yearlyStats[currentYear].totalRevenue)}
            </div>
          </div>

          <div className="p-4 bg-green-50 rounded-lg dark:bg-green-500/20">
            <div className="text-sm text-green-600 font-medium dark:text-green-300">
              Total Commissions
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(yearlyStats[currentYear].totalCommissions)}
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg dark:bg-blue-500/20">
            <div className="text-sm text-blue-600 font-medium dark:text-blue-300">Invoices</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {yearlyStats[currentYear].invoiceCount}
            </div>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg dark:bg-purple-500/20">
            <div className="text-sm text-purple-600 font-medium dark:text-purple-300">
              YoY Growth
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {yearlyStats[currentYear].yearOverYearGrowth > 0 ? "+" : ""}
              {yearlyStats[currentYear].yearOverYearGrowth.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
