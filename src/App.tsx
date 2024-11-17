import React from "react";
import { AppProviders } from "./providers/AppProviders";
import { useAuth } from "./context/AuthContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

function AppContent() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}
