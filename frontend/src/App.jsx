import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { QuoteProvider } from './context/QuoteContext';
import { SalesProvider } from './context/SalesContext';
import { CustomerPortalProvider } from './context/CustomerPortalContext';
import AppRoutes from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SalesProvider>
          <QuoteProvider>
            <CustomerPortalProvider>
              <AppRoutes />
            </CustomerPortalProvider>
          </QuoteProvider>
        </SalesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
