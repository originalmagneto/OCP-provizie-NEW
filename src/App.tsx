import { useState, useEffect } from "react";
import { AuthProvider } from "./context/AuthContext";
import { InvoiceProvider } from "./context/InvoiceContext";
import { YearProvider } from "./context/YearContext";
import { CommissionProvider } from "./context/CommissionContext";
import { ClientProvider } from "./context/ClientContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";
import PendingApproval from "./components/PendingApproval";
import { useAuth } from "./context/AuthContext";

function AuthenticatedApp({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && user && isAuthenticated) {
      setIsInitialized(true);
    }
  }, [isLoading, user, isAuthenticated]);

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

  // Show pending approval if user exists but is not authenticated (not active)
  if (user && !isAuthenticated) {
    return <PendingApproval />;
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

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];
  
  return requiredVars.every(varName => {
    const value = import.meta.env[varName];
    return value && value !== 'demo-api-key' && value !== 'demo-project' && !value.includes('demo-');
  });
};

// Firebase Configuration Notice Component
function FirebaseConfigNotice() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
        <p className="text-gray-600 mb-6">
          Firebase is not properly configured for this application. 
          Please check the setup instructions to configure your Firebase project.
        </p>
        <div className="text-sm text-gray-500">
          <p>This is a demo environment.</p>
          <p>Authentication features are not available.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Check if Firebase is configured
  if (!isFirebaseConfigured()) {
    return <FirebaseConfigNotice />;
  }

  return (
    <AuthProvider>
      <AuthenticatedApp>
        <Dashboard />
      </AuthenticatedApp>
    </AuthProvider>
  );
}
