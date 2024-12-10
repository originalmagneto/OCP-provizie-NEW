export type FirmType = 'OCP' | 'Provizie';

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  commissionPercentage: number;
  referredByFirm: FirmType;
  invoicedByFirm: FirmType;
  isPaid: boolean;
  quarterKey: string;
}

export interface Commission {
  invoiceId: string;
  amount: number;
  type: 'to_pay' | 'to_receive';
  firm: FirmType;
}

export interface SettlementStatus {
  quarterKey: string;
  settledBy: FirmType;
  isSettled: boolean;
  settledAt: string;
  settledInvoiceIds: string[];
  batchKey: string;
}

export interface CommissionGroup {
  batchKey: string | null;
  commissions: Commission[];
  isSettled: boolean;
}
