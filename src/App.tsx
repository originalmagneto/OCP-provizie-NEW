import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import MainLayout from "./components/MainLayout";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <InvoiceProvider>
        <ClientProvider>
          <YearProvider>
            <CommissionProvider>
              <AppContent />
            </CommissionProvider>
          </YearProvider>
        </ClientProvider>
      </InvoiceProvider>
    </AuthProvider>
  );
}

export default App;
