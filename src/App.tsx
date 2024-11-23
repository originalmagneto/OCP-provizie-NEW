import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
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
          <CommissionProvider>
            <AppContent />
          </CommissionProvider>
        </InvoiceProvider>
      </YearProvider>
    </AuthProvider>
  );
}

export default App;
