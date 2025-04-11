import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./context/AuthContext";

// Separate component for authenticated content to prevent unnecessary renders
function AuthenticatedContent() {
  return (
    <InvoiceProvider>
      <YearProvider>
        <ClientProvider>
          <CommissionProvider>
            <Dashboard />
          </CommissionProvider>
        </ClientProvider>
      </YearProvider>
    </InvoiceProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  return user ? <AuthenticatedContent /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
