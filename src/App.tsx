import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      setIsInitialized(true);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        Initializing data...
      </div>
    );
  }

  return (
    <ThemeProvider>
      <InvoiceProvider>
        <YearProvider>
          <ClientProvider>
            <CommissionProvider>{children}</CommissionProvider>
          </ClientProvider>
        </YearProvider>
      </InvoiceProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp>
        <Dashboard />
      </AuthenticatedApp>
    </AuthProvider>
  );
}
