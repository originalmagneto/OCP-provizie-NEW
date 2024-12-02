import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import AppContent from "./components/AppContent";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <YearProvider>
        <InvoiceProvider>
          <ClientProvider>
            <CommissionProvider>
              <AppContent />
            </CommissionProvider>
          </ClientProvider>
        </InvoiceProvider>
      </YearProvider>
    </AuthProvider>
  );
}

export default App;
