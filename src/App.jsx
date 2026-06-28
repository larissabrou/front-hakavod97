import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import AppRoutes from './routes/AppRoutes';
import Preloader from './components/ui/Preloader';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-id.apps.googleusercontent.com";

function App() {
  return (
    <BrowserRouter>
      <Preloader />
      <GoogleOAuthProvider clientId={googleClientId}>
        <SettingsProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <FavoritesProvider>
                <CartProvider>
                  <AppRoutes />
                </CartProvider>
              </FavoritesProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </SettingsProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  );
}

export default App;

