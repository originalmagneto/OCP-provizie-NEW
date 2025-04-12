import { useMemo } from "react";
import { useInvoices } from "../context/InvoiceContext";
import { Euro } from "lucide-react";

export default function UnpaidInvoicesList() {
  const { invoices, isLoading, togglePaid } = useInvoices();

  const unpaidInvoices = useMemo(() => {
    if (!Array.isArray(invoices) || isLoading) {
      return [];
    }

    try {
      return invoices
        .filter(invoice => {
          if (!invoice?.isPaid && invoice?.date && invoice?.amount) {
            const dueDate = new Date(invoice.date);
            return !isNaN(dueDate.getTime());
          }
          return false;
        })
        .sort((a, b) => {
          if (!a?.date || !b?.date) return 0;
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
    } catch (error) {
      console.error('Error processing unpaid invoices:', error);
      return [];
    }
  }, [invoices, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (unpaidInvoices.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Unpaid Invoices
          </h3>
          <p className="text-gray-500 text-center py-4">
            No unpaid invoices at the moment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Unpaid Invoices
        </h3>
        <div className="space-y-4">
          {unpaidInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{invoice.clientName}</p>
                <p className="text-sm text-gray-500">
                  Due: {new Date(invoice.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <p className="font-medium text-gray-900 flex items-center">
                  <Euro className="w-4 h-4 mr-1" />
                  {new Intl.NumberFormat("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  }).format(invoice.amount)}
                </p>
                <button
                  onClick={() => togglePaid(invoice.id)}
                  className="px-3 py-1 bg-green-50 text-green-700 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                >
                  Mark Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
