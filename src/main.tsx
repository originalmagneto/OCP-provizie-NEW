import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';
import { ClientProvider } from './context/ClientContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ClientProvider>
        <InvoiceProvider>
          <App />
        </InvoiceProvider>
      </ClientProvider>
    </AuthProvider>
  </StrictMode>
);