import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
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
      <InvoiceProvider>
        <AppContent />
      </InvoiceProvider>
    </AuthProvider>
  );
}

export default App;
