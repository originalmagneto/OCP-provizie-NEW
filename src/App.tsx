import { AuthProvider } from "./context/AuthContext";
import { YearProvider } from "./context/YearContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return user ? (
    <YearProvider>
      <InvoiceProvider>
        <ClientProvider>
          <CommissionProvider>
            <Dashboard />
          </CommissionProvider>
        </ClientProvider>
      </InvoiceProvider>
    </YearProvider>
  ) : (
    <LoginForm />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
