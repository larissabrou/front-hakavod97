import apiClient from './apiClient';

export const customerService = {
  // ── AUTHENTIFICATION & COMPTE ──────────────────────────────────────────────
  
  // Récupérer les pays supportés et méthodes d'inscription
  getCountries: async () => {
    const response = await apiClient.get('/store/countries');
    return response.data?.data || response.data;
  },

  // Inscription par téléphone (déclenche l'envoi de l'OTP par SMS)
  registerPhone: async (phone, name, country) => {
    const response = await apiClient.post('/store/auth/register/phone', { phone, name, country });
    return response.data;
  },

  // Connexion par téléphone (sans SMS, directe)
  loginPhone: async (phone, password, country) => {
    const response = await apiClient.post('/store/auth/login/phone', { phone, password, country });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Valider l'OTP reçu par téléphone -> Génère le token Bearer
  verifyOtp: async (phone, code, password, passwordConfirmation, country) => {
    const response = await apiClient.post('/store/auth/otp/verify', {
      phone,
      code,
      password,
      password_confirmation: passwordConfirmation,
      country
    });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Renvoyer le code OTP SMS (inscription uniquement)
  resendOtp: async (phone) => {
    const response = await apiClient.post('/store/auth/otp/resend', { phone });
    return response.data;
  },

  // Inscription par e-mail
  registerEmail: async (name, email, password, passwordConfirmation, country) => {
    const response = await apiClient.post('/store/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      country
    });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Connexion par e-mail
  loginEmail: async (email, password) => {
    const response = await apiClient.post('/store/auth/login', { email, password });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Mot de passe oublié (e-mail)
  forgotPassword: async (email) => {
    const response = await apiClient.post('/store/auth/forgot-password', { email });
    return response.data;
  },

  // Réinitialiser le mot de passe
  resetPassword: async (token, email, password, password_confirmation) => {
    const response = await apiClient.post('/store/auth/reset-password', { token, email, password, password_confirmation });
    return response.data;
  },

  // Changer le mot de passe (client connecté)
  changePassword: async (current_password, password, password_confirmation) => {
    const response = await apiClient.put('/store/auth/password', { current_password, password, password_confirmation });
    return response.data;
  },

  // Connexion / Inscription Google
  loginGoogle: async (googleToken, country) => {
    const response = await apiClient.post('/store/auth/social/google', { access_token: googleToken, country });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Connexion / Inscription Facebook
  loginFacebook: async (facebookToken, country) => {
    const response = await apiClient.post('/store/auth/social/facebook', { access_token: facebookToken, country });
    if (response.data?.data?.token) {
      localStorage.setItem('customer_token', response.data.data.token);
    }
    return response.data;
  },

  // Déconnexion
  logout: async () => {
    const response = await apiClient.post('/store/auth/logout');
    localStorage.removeItem('customer_token');
    return response.data;
  },

  // Récupérer le profil du client connecté
  getProfile: async () => {
    const response = await apiClient.get('/store/auth/me');
    return response.data?.data || response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/store/profile', profileData);
    return response.data;
  },

  // Désactiver le compte client
  deactivateAccount: async () => {
    const response = await apiClient.delete('/store/auth/account');
    localStorage.removeItem('customer_token');
    return response.data;
  },

  // ── COMMANDES (Connecté) ───────────────────────────────────────────────────

  // Historique des commandes du client connecté
  getOrders: async () => {
    const response = await apiClient.get('/store/orders');
    return response.data?.data || response.data;
  },

  // ── PANIER ─────────────────────────────────────────────────────────────────

  // Récupérer le contenu du panier (guest ou connecté)
  getCart: async () => {
    const response = await apiClient.get('/store/cart');
    return response.data?.data || response.data;
  },

  // Ajouter un article au panier
  addToCart: async (productId, variantId, quantity = 1) => {
    const response = await apiClient.post('/store/cart/items', {
      product_id: productId,
      product_variant_id: variantId,
      quantity
    });
    return response.data;
  },

  // Modifier la quantité d'un article
  updateCartItem: async (cartItemId, quantity) => {
    const response = await apiClient.put(`/store/cart/items/${cartItemId}`, { quantity });
    return response.data;
  },

  // Retirer un article du panier
  removeFromCart: async (cartItemId) => {
    const response = await apiClient.delete(`/store/cart/items/${cartItemId}`);
    return response.data;
  },

  // Vider le panier
  clearCart: async () => {
    const response = await apiClient.delete('/store/cart');
    return response.data;
  },

  // Fusionner le panier invité après connexion
  mergeCart: async (items) => {
    const response = await apiClient.post('/store/cart/merge', { items });
    return response.data;
  },

  // ── FAVORIS ────────────────────────────────────────────────────────────────

  // Récupérer la liste des favoris (paginée)
  getFavorites: async (params = {}) => {
    const response = await apiClient.get('/store/favorites', { params });
    return response.data?.data || response.data;
  },

  // IDs des produits favoris (pour affichage rapide des cœurs)
  getFavoriteIds: async () => {
    const response = await apiClient.get('/store/favorites/ids');
    return response.data?.data || response.data;
  },

  // Ajouter un produit aux favoris
  addFavorite: async (productId) => {
    const response = await apiClient.post(`/store/favorites/${productId}`);
    return response.data;
  },

  // Retirer un produit des favoris
  removeFavorite: async (productId) => {
    const response = await apiClient.delete(`/store/favorites/${productId}`);
    return response.data;
  },

  // ── ADRESSES ───────────────────────────────────────────────────────────────

  // Récupérer les adresses de livraison du client
  getAddresses: async () => {
    const response = await apiClient.get('/store/addresses');
    return response.data?.data || response.data;
  },

  // Ajouter une adresse
  addAddress: async (addressData) => {
    const response = await apiClient.post('/store/addresses', addressData);
    return response.data;
  },

  // Modifier une adresse
  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(`/store/addresses/${addressId}`, addressData);
    return response.data;
  },

  // Supprimer une adresse
  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/store/addresses/${addressId}`);
    return response.data;
  },

  // Définir l'adresse par défaut
  setDefaultAddress: async (addressId) => {
    const response = await apiClient.put(`/store/addresses/${addressId}/default`);
    return response.data;
  }
};

export default customerService;
