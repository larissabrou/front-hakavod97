import React, { createContext, useState, useEffect } from 'react';
import customerService from '../services/api/customerService';

export const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customerUser, setCustomerUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le profil client au montage s'il y a un token
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('customer_token');
      if (token) {
        if (token.startsWith('mock-')) {
          const saved = localStorage.getItem('customer_user');
          if (saved) {
            try {
              setCustomerUser(JSON.parse(saved));
            } catch (e) {
              setCustomerUser({ id: 888, name: 'Client Démo', email: 'demo@hakavok.com' });
            }
          } else {
            setCustomerUser({ id: 888, name: 'Client Démo', email: 'demo@hakavok.com' });
          }
          setIsLoading(false);
          return;
        }
        try {
          const profile = await customerService.getProfile();
          setCustomerUser(profile);
          localStorage.setItem('customer_user', JSON.stringify(profile));
        } catch (error) {
          console.error("Erreur lors de la récupération du profil client", error);
          // Si le token est invalide/expiré, on nettoie
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('customer_token');
            localStorage.removeItem('customer_user');
            setCustomerUser(null);
          } else {
            // Tenter de charger depuis le cache local si réseau indisponible
            const saved = localStorage.getItem('customer_user');
            if (saved) {
              setCustomerUser(JSON.parse(saved));
            }
          }
        }
      } else {
        setCustomerUser(null);
      }
      setIsLoading(false);
    };

    fetchProfile();

    // Écouter l'événement global de déconnexion 401
    const handleUnauthorized = () => {
      setCustomerUser(null);
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    };
    window.addEventListener('customer-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('customer-unauthorized', handleUnauthorized);
  }, []);

  // Inscription par e-mail
  const customerRegister = async (name, email, password, country) => {
    if (!name || !email || !password || !country) {
      throw new Error("Tous les champs sont requis.");
    }
    const response = await customerService.registerEmail(name, email, password, password, country);
    const profile = await customerService.getProfile();
    setCustomerUser(profile);
    localStorage.setItem('customer_user', JSON.stringify(profile));
    window.dispatchEvent(new Event('customer-login-success'));
    return profile;
  };

  // Connexion par e-mail
  const customerLogin = async (email, password) => {
    if (!email || !password) {
      throw new Error("L'adresse e-mail et le mot de passe sont requis.");
    }
    const response = await customerService.loginEmail(email, password);
    const profile = await customerService.getProfile();
    setCustomerUser(profile);
    localStorage.setItem('customer_user', JSON.stringify(profile));
    window.dispatchEvent(new Event('customer-login-success'));
    return profile;
  };

  // Inscription par téléphone
  const customerRegisterPhone = async (phone, name, country) => {
    if (!phone || !name || !country) {
      throw new Error("Le numéro de téléphone, le nom complet et le pays sont requis.");
    }
    return await customerService.registerPhone(phone, name, country);
  };

  // Connexion par téléphone
  const customerLoginPhone = async (phone, password, country) => {
    if (!phone || !password || !country) {
      throw new Error("Le numéro de téléphone, le mot de passe et le pays sont requis.");
    }
    return await customerService.loginPhone(phone, password, country);
  };

  // Validation de l'OTP
  const customerVerifyOtp = async (phone, code, password, country) => {
    if (!phone || !code || !password || !country) {
      throw new Error("Le numéro de téléphone, le code OTP, le mot de passe et le pays sont requis.");
    }
    await customerService.verifyOtp(phone, code, password, password, country);
    const profile = await customerService.getProfile();
    setCustomerUser(profile);
    localStorage.setItem('customer_user', JSON.stringify(profile));
    window.dispatchEvent(new Event('customer-login-success'));
    return profile;
  };

  // Connexion sociale Google
  const customerLoginGoogle = async (token, country) => {
    try {
      await customerService.loginGoogle(token, country);
      const profile = await customerService.getProfile();
      setCustomerUser(profile);
      localStorage.setItem('customer_user', JSON.stringify(profile));
      window.dispatchEvent(new Event('customer-login-success'));
      return profile;
    } catch (e) {
      console.warn("Échec de la connexion Google avec le serveur, utilisation du mode démo.", e);
      if (token && token.startsWith('mock-')) {
        const demoProfile = {
          id: 888,
          name: 'Client Démo Google',
          email: 'google-demo@hakavok.com',
          phone: '+22507000000',
        };
        localStorage.setItem('customer_token', token);
        setCustomerUser(demoProfile);
        localStorage.setItem('customer_user', JSON.stringify(demoProfile));
        window.dispatchEvent(new Event('customer-login-success'));
        return demoProfile;
      }
      throw e;
    }
  };

  // Connexion sociale Facebook
  const customerLoginFacebook = async (token, country) => {
    try {
      await customerService.loginFacebook(token, country);
      const profile = await customerService.getProfile();
      setCustomerUser(profile);
      localStorage.setItem('customer_user', JSON.stringify(profile));
      window.dispatchEvent(new Event('customer-login-success'));
      return profile;
    } catch (e) {
      console.warn("Échec de la connexion Facebook avec le serveur, utilisation du mode démo.", e);
      if (token && token.startsWith('mock-')) {
        const demoProfile = {
          id: 887,
          name: 'Client Démo Facebook',
          email: 'facebook-demo@hakavok.com',
          phone: '+22507000000',
        };
        localStorage.setItem('customer_token', token);
        setCustomerUser(demoProfile);
        localStorage.setItem('customer_user', JSON.stringify(demoProfile));
        window.dispatchEvent(new Event('customer-login-success'));
        return demoProfile;
      }
      throw e;
    }
  };

  // Déconnexion
  const customerLogout = async () => {
    try {
      // Si on a un vrai token, on notifie le serveur
      const token = localStorage.getItem('customer_token');
      if (token && !token.startsWith('mock-')) {
        await customerService.logout();
      }
    } catch (e) {
      console.warn("Erreur lors de la déconnexion serveur", e);
    } finally {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
      setCustomerUser(null);
    }
  };

  // Mot de passe oublié
  const customerForgotPassword = async (email) => {
    return await customerService.forgotPassword(email);
  };

  // Réinitialiser le mot de passe
  const customerResetPassword = async (token, email, password, password_confirmation) => {
    return await customerService.resetPassword(token, email, password, password_confirmation);
  };

  // Changer le mot de passe
  const customerChangePassword = async (current_password, password, password_confirmation) => {
    return await customerService.changePassword(current_password, password, password_confirmation);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        isAuthenticated: !!customerUser,
        isLoading,
        customerLogin,
        customerRegister,
        customerRegisterPhone,
        customerLoginPhone,
        customerVerifyOtp,
        customerLoginGoogle,
        customerLoginFacebook,
        customerLogout,
        customerForgotPassword,
        customerResetPassword,
        customerChangePassword,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};
