import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import { SettlementProvider } from "./context/SettlementContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import QuarterlySettlements from './components/QuarterlySettlements';
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();
  return user ? <Dashboard /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <YearProvider>
        <ClientProvider>
          <InvoiceProvider>
            <CommissionProvider>
              <SettlementProvider>
                <div className="min-h-screen bg-gray-100">
                  <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 sm:px-0">
                      <AppContent />
                      <div className="mt-8">
                        <QuarterlySettlements />
                      </div>
                    </div>
                  </div>
                </div>
              </SettlementProvider>
            </CommissionProvider>
          </InvoiceProvider>
        </ClientProvider>
      </YearProvider>
    </AuthProvider>
  );
}

export default App;
