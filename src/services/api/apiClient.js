import axios from 'axios';

const getApiUrl = () => {
  return localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

// Récupère l'URL de base (sans /api) pour les requêtes CSRF (si nécessaire)
const getBaseUrl = () => {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/api\/?$/, '');
};

const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // withCredentials: false car on utilise du Bearer Token (stateless)
  // withCredentials: true n'est nécessaire QUE pour l'auth par session/cookie
  withCredentials: false,
});

// Intercepteur pour injecter automatiquement le Bearer Token ou le Guest Token
apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiUrl();
    
    // Injecter la langue active
    const activeLocale = localStorage.getItem('active_locale') || 'fr';
    config.headers['Accept-Language'] = activeLocale;
    
    // Si la requête est destinée à l'administration, on utilise auth_token, sinon customer_token
    const isAdminRequest = config.url && (config.url.startsWith('/admin') || config.url.includes('/admin/'));
    const tokenKey = isAdminRequest ? 'auth_token' : 'customer_token';
    const token = localStorage.getItem(tokenKey);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (!isAdminRequest) {
      const guestToken = localStorage.getItem('guest_token');
      if (guestToken) {
        config.headers['X-Guest-Token'] = guestToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs HTTP globalement et intercepter le guest token
apiClient.interceptors.response.use(
  (response) => {
    // Si la réponse contient un guest_token (en-tête ou corps), on le stocke dans localStorage
    const data = response.data || {};
    const guestToken = data.guest_token || data.data?.guest_token || response.headers?.['x-guest-token'];
    if (guestToken) {
      localStorage.setItem('guest_token', guestToken);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const config = error.config;
      const isAdminRequest = config && config.url && (config.url.startsWith('/admin') || config.url.includes('/admin/'));
      const tokenKey = isAdminRequest ? 'auth_token' : 'customer_token';
      
      const token = localStorage.getItem(tokenKey);
      if (token && token.startsWith('mock-')) {
        return Promise.reject(error);
      }
      localStorage.removeItem(tokenKey);
      
      // Optionnel : rediriger ou propager l'événement de déconnexion
      if (!isAdminRequest) {
        window.dispatchEvent(new Event('customer-unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Tentative d'initialisation du cookie CSRF Laravel Sanctum.
 * Utile uniquement si l'API est configurée en mode session (même domaine).
 * En mode Bearer Token cross-origin, cette fonction ne fait rien de bloquant.
 */
export const initCsrf = async () => {
  try {
    const baseUrl = getBaseUrl();
    await axios.get(`${baseUrl}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
  } catch (e) {
    // Silencieux — normal pour une API cross-origin en mode token
  }
};

export default apiClient;

