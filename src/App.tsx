
import { AuthProvider } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { YearProvider } from './context/YearContext';
import { CommissionProvider } from './context/CommissionContext';
import { ClientProvider } from './context/ClientContext';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppRouter } from './components/AppRouter';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <YearProvider>
          <ClientProvider>
            <InvoiceProvider>
              <CommissionProvider>
                <div className="min-h-screen bg-background text-text">
                  <AppRouter />
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
