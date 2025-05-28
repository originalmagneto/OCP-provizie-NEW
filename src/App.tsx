
import { AuthProvider } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { YearProvider } from './context/YearContext';
import { CommissionProvider } from './context/CommissionContext';
import { ClientProvider } from './context/ClientContext';
import { ThemeProvider } from './theme/ThemeProvider';
import LoginForm from './components/LoginForm';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { user } = useAuth();
  return user ? <DashboardLayout /> : <LoginForm />;
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <YearProvider>
          <ClientProvider>
            <InvoiceProvider>
              <CommissionProvider>
                <div className="min-h-screen bg-background text-text">
                  <AppContent />
                </div>
              </CommissionProvider>
            </InvoiceProvider>
          </ClientProvider>
        </YearProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
