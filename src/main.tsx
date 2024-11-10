import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { InvoiceProvider } from './context/InvoiceContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <InvoiceProvider>
        <App />
      </InvoiceProvider>
    </AuthProvider>
  </StrictMode>
);