import { FirmType } from './index';

export interface Settlement {
  id: string;
  quarter: number;
  year: number;
  firmFrom: FirmType;
  firmTo: FirmType;
  amount: number;
  status: SettlementStatus;
  createdAt: string;
  settledAt?: string;
  invoiceIds: string[];
}

export type SettlementStatus = 'pending' | 'settled' | 'disputed';

export interface SettlementSummary {
  totalAmount: number;
  pendingCount: number;
  settledCount: number;
  disputedCount: number;
}
