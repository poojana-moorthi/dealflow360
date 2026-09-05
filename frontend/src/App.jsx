import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuoteProvider } from './context/QuoteContext';
import { CustomerPortalProvider } from './context/CustomerPortalContext';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuoteProvider>
          <CustomerPortalProvider>
            <AppRoutes />
          </CustomerPortalProvider>
        </QuoteProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
