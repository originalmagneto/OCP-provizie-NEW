import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  ArrowLeftRight,
  Timer,
} from "lucide-react";
import { useYear } from "../context/YearContext";
import { AnimatePresence, motion } from "framer-motion";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header with Year Selection */}
      <motion.div
        className="p-4 border-b border-gray-200"
        animate={{ backgroundColor: isChanging ? "#f9fafb" : "#ffffff" }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <CalendarDays className="h-5 w-5 text-gray-400" />
            <motion.select
              key={currentYear}
              value={currentYear}
              onChange={(e) =>
                handleQuarterChange(Number(e.target.value), currentQuarter)
              }
              className="text-lg font-semibold text-gray-900 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md px-1 py-0.5 -ml-1 cursor-pointer"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </motion.select>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
          </motion.button>
        </div>
      </motion.div>

      {/* Quarter Selection */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePreviousQuarter}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              currentYear === Math.min(...availableYears) &&
              currentQuarter === 1
            }
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>

          <motion.div
            className="flex items-center space-x-2 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span>Navigate between quarters</span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextQuarter}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              currentYear === Math.max(...availableYears) &&
              currentQuarter === 4
            }
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <AnimatePresence>
            {quarters.map((quarter) => {
              const dates = getQuarterDates(quarter);
              const isCurrent = isCurrentQuarter(quarter);
              const isSelected = currentQuarter === quarter;

              return (
                <motion.button
                  key={`${currentYear}-Q${quarter}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 17,
                    delay: quarter * 0.1,
                  }}
                  onClick={() => handleQuarterChange(currentYear, quarter)}
                  className={`
                    relative p-3 rounded-lg text-left transition-all
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
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`absolute top-1 right-1 text-xs px-1.5 py-0.5 rounded-full
                        ${isSelected ? "bg-indigo-500 text-white" : "bg-indigo-100 text-indigo-600"}
                        ${isCurrent ? "animate-pulse-ring" : ""}
                      `}
                    >
                      Current
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
