import type { Commission, Invoice, FirmType } from '../types';

export function calculateCommissions(invoice: Invoice, currentFirm: FirmType): Commission[] {
  const commissions: Commission[] = [];
  const commission = invoice.amount * (invoice.commissionPercentage / 100);

  // Only calculate commissions for paid invoices
  if (!invoice.isPaid) {
    return [];
  }

  // If current firm referred the client
  if (invoice.referredByFirm === currentFirm) {
    commissions.push({
      invoiceId: invoice.id,
      amount: commission,
      type: 'to_receive',
      firm: invoice.invoicedByFirm
    });
  }

  // If current firm invoiced the client
  if (invoice.invoicedByFirm === currentFirm) {
    commissions.push({
      invoiceId: invoice.id,
      amount: commission,
      type: 'to_pay',
      firm: invoice.referredByFirm
    });
  }

  return commissions;
}

export function groupCommissionsBySettlement(
  commissions: Commission[],
  quarterKey: string,
  getSettlementBatch: (quarterKey: string, firm: FirmType, invoiceId: string) => string | null
): Map<string | null, Commission[]> {
  const groups = new Map<string | null, Commission[]>();

  commissions.forEach(commission => {
    const batchKey = getSettlementBatch(quarterKey, commission.firm, commission.invoiceId) || null;
    
    if (!groups.has(batchKey)) {
      groups.set(batchKey, []);
    }
    
    groups.get(batchKey)?.push(commission);
  });

  return groups;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
