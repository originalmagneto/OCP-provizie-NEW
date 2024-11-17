import { FilterState } from "../types/filters";
import type { Invoice } from "../types";

export function filterInvoices(
  invoices: Invoice[],
  filters: FilterState,
  currentYear: number,
  currentQuarter: number,
) {
  return invoices
    .filter((invoice) => {
      // Quarter filter
      const invoiceDate = new Date(invoice.date);
      if (!isInQuarter(invoiceDate, currentYear, currentQuarter)) {
        return false;
      }

      // Search filter
      if (
        filters.search &&
        !invoice.clientName.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Status filter
      if (filters.status !== "all") {
        if (filters.status === "paid" && !invoice.isPaid) return false;
        if (filters.status === "unpaid" && invoice.isPaid) return false;
      }

      // Firm filter
      if (filters.firm !== "all") {
        return (
          invoice.invoicedByFirm === filters.firm ||
          invoice.referredByFirm === filters.firm
        );
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function isInQuarter(
  date: Date,
  year: number,
  quarter: number,
): boolean {
  const quarterStart = new Date(year, (quarter - 1) * 3, 1);
  const quarterEnd = new Date(year, quarter * 3, 0);
  return date >= quarterStart && date <= quarterEnd;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
