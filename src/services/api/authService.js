import apiClient, { initCsrf } from './apiClient';

export const authService = {
  // Étape 1 : Connexion de l'administrateur (génère et envoie l'OTP)
  login: async (credentials) => {
    await initCsrf(); // Obtenir le cookie CSRF avant toute requête POST
    const response = await apiClient.post('/admin/auth/login', credentials);
    return response.data;
  },

  // Étape 2 : Validation du code OTP (renvoie le token de connexion)
  verifyOtp: async (email, code) => {
    await initCsrf();
    const response = await apiClient.post('/admin/auth/otp/verify', { email, code });
    if (response.data?.data?.token) {
      localStorage.setItem('auth_token', response.data.data.token);
    }
    return response.data;
  },

  // Optionnel : Renvoi du code OTP
  sendOtp: async (email, password) => {
    await initCsrf();
    const response = await apiClient.post('/admin/auth/otp/send', { email, password });
    return response.data;
  },

  // Déconnexion de l'administrateur
  logout: async () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      localStorage.removeItem('auth_token');
      return;
    }
    try {
      await apiClient.post('/admin/auth/logout');
    } catch (error) {
      console.error("Erreur de déconnexion côté serveur", error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  },

  // Récupérer le profil de l'administrateur connecté
  getCurrentUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      return {
        id: 999,
        name: 'Administrateur Démo',
        email: 'admin@boutique.ci',
        role: 'super_admin'
      };
    }
    const response = await apiClient.get('/admin/auth/me');
    // Le format de réponse est { success: true, data: user }
    return response.data?.data || response.data;
  },
};

export default authService;
