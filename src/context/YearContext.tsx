import React, { createContext, useContext, useState, useEffect } from "react";
import { useInvoices } from "./InvoiceContext";

interface YearContextType {
  currentYear: number;
  availableYears: number[];
  yearlyStats: Record<
    number,
    {
      totalRevenue: number;
      totalCommissions: number;
      invoiceCount: number;
      yearOverYearGrowth: number;
    }
  >;
  setYear: (year: number) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: React.ReactNode }) {
  const { invoices } = useInvoices();
  const [currentYear, setCurrentYear] = useState(() => {
    const savedYear = localStorage.getItem("selectedYear");
    return savedYear ? parseInt(savedYear) : new Date().getFullYear();
  });

  // Calculate available years from invoices
  const availableYears = React.useMemo(() => {
    const years = invoices.map((invoice) =>
      new Date(invoice.date).getFullYear(),
    );
    return Array.from(
      new Set([
        ...years,
        currentYear, // Always include current year
        currentYear + 1, // Allow planning for next year
      ]),
    ).sort((a, b) => b - a); // Sort descending
  }, [invoices, currentYear]);

  // Calculate yearly statistics
  const yearlyStats = React.useMemo(() => {
    const stats: Record<
      number,
      {
        totalRevenue: number;
        totalCommissions: number;
        invoiceCount: number;
        yearOverYearGrowth: number;
      }
    > = {};

    availableYears.forEach((year) => {
      const yearInvoices = invoices.filter(
        (invoice) => new Date(invoice.date).getFullYear() === year,
      );

      const totalRevenue = yearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );
      const totalCommissions = yearInvoices.reduce(
        (sum, inv) => sum + (inv.amount * inv.commissionPercentage) / 100,
        0,
      );

      // Calculate year-over-year growth
      const previousYear = year - 1;
      const previousYearInvoices = invoices.filter(
        (invoice) => new Date(invoice.date).getFullYear() === previousYear,
      );
      const previousRevenue = previousYearInvoices.reduce(
        (sum, inv) => sum + inv.amount,
        0,
      );
      const yearOverYearGrowth =
        previousRevenue === 0
          ? 100
          : ((totalRevenue - previousRevenue) / previousRevenue) * 100;

      stats[year] = {
        totalRevenue,
        totalCommissions,
        invoiceCount: yearInvoices.length,
        yearOverYearGrowth,
      };
    });

    return stats;
  }, [invoices, availableYears]);

  // Save selected year to localStorage
  useEffect(() => {
    localStorage.setItem("selectedYear", currentYear.toString());
  }, [currentYear]);

  const setYear = (year: number) => {
    if (availableYears.includes(year)) {
      setCurrentYear(year);
    }
  };

  return (
    <YearContext.Provider
      value={{
        currentYear,
        availableYears,
        yearlyStats,
        setYear,
      }}
    >
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error("useYear must be used within a YearProvider");
  }
  return context;
}
