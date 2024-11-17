import React from "react";
import { AuthProvider } from "../context/AuthContext";
import { InvoiceProvider } from "../context/InvoiceContext";
import { YearProvider } from "../context/YearContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <YearProvider>
        <InvoiceProvider>{children}</InvoiceProvider>
      </YearProvider>
    </AuthProvider>
  );
}
