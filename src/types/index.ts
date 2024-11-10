export type FirmType = "SKALLARS" | "MKMs" | "Contax";

export interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  invoicedByFirm: FirmType;
  referredByFirm: FirmType;
  commissionPercentage: number;
  date: string;
  isPaid: boolean;
}
