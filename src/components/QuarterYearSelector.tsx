import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeftRight,
  Timer,
} from "lucide-react";
import { useYear } from "../context/YearContext";

export default function QuarterYearSelector() {
  const { currentYear, currentQuarter, availableYears, selectYearAndQuarter } =
    useYear();

  const [isChanging, setIsChanging] = useState(false);
  const quarters = [1, 2, 3, 4];

  const handleQuarterChange = (year: number, quarter: number) => {
    setIsChanging(true);
    selectYearAndQuarter(year, quarter);
    setTimeout(() => setIsChanging(false), 300);
  };

  const handlePreviousQuarter = () => {
    if (currentQuarter === 1) {
      if (availableYears.includes(currentYear - 1)) {
        handleQuarterChange(currentYear - 1, 4);
      }
    } else {
      handleQuarterChange(currentYear, currentQuarter - 1);
    }
  };

  const handleNextQuarter = () => {
    if (currentQuarter === 4) {
      if (availableYears.includes(currentYear + 1)) {
        handleQuarterChange(currentYear + 1, 1);
      }
    } else {
      handleQuarterChange(currentYear, currentQuarter + 1);
    }
  };

  const isCurrentQuarter = (quarter: number) => {
    const now = new Date();
    const currentRealYear = now.getFullYear();
    const currentRealQuarter = Math.floor(now.getMonth() / 3) + 1;
    return currentYear === currentRealYear && quarter === currentRealQuarter;
  };

  const getQuarterDates = (quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    const startDate = new Date(currentYear, startMonth, 1);
    const endDate = new Date(currentYear, endMonth + 1, 0);

    return {
      start: startDate.toLocaleDateString("en-US", { month: "short" }),
      end: endDate.toLocaleDateString("en-US", { month: "short" }),
    };
  };

  const isCurrentYear = currentYear === new Date().getFullYear();
  const minYear = Math.min(...availableYears);
  const maxYear = Math.max(...availableYears);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Year Selection */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <select
              value={currentYear}
              onChange={(e) =>
                handleQuarterChange(Number(e.target.value), currentQuarter)
              }
              className="text-lg font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-1 py-0.5 -ml-1 cursor-pointer"
            >
              {availableYears.map((year) => {
                const now = new Date().getFullYear();
                const isPast = year < now;
                const isFuture = year > now;
                const isCurrent = year === now;

                return (
                  <option
                    key={year}
                    value={year}
                    className={`
                      ${isPast ? "text-gray-600" : ""}
                      ${isFuture ? "text-indigo-600" : ""}
                      ${isCurrent ? "font-bold" : ""}
                    `}
                  >
                    {year}
                    {isCurrent && " (Current)"}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => {
              const now = new Date();
              handleQuarterChange(
                now.getFullYear(),
                Math.floor(now.getMonth() / 3) + 1,
              );
            }}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
          >
            <Timer className="h-4 w-4 mr-1.5" />
            Current Quarter
          </button>
        </div>
      </div>

      {/* Quarter Selection */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePreviousQuarter}
            disabled={currentYear === minYear && currentQuarter === 1}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Navigate between quarters</span>
          </div>

          <button
            onClick={handleNextQuarter}
            disabled={currentYear === maxYear && currentQuarter === 4}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {quarters.map((quarter) => {
            const dates = getQuarterDates(quarter);
            const isCurrent = isCurrentQuarter(quarter);
            const isSelected = currentQuarter === quarter;

            return (
              <button
                key={quarter}
                onClick={() => handleQuarterChange(currentYear, quarter)}
                className={`
                  relative p-3 rounded-lg text-left transition-all duration-200
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }
                  ${
                    isCurrent && !isSelected
                      ? "ring-2 ring-indigo-500 ring-offset-2"
                      : ""
                  }
                `}
              >
                <div className="font-semibold">Q{quarter}</div>
                <div
                  className={`text-xs mt-1 ${isSelected ? "text-indigo-100" : "text-gray-500"}`}
                >
                  {dates.start} - {dates.end}
                </div>
                {isCurrent && (
                  <div
                    className={`
                    absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full
                    ${isSelected ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-600"}
                  `}
                  >
                    Current
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
