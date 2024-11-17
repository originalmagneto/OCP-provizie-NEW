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

export interface FilterState {
  search: string;
  status: "all" | "paid" | "unpaid";
  firm: "all" | FirmType;
}
