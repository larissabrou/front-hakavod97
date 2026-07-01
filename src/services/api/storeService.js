import apiClient from './apiClient';

export const storeService = {
  // Récupérer les paramètres de la boutique (devises, langues, limites médias, taux de change)
  getSettings: async (params = {}) => {
    // params: { lang }
    const response = await apiClient.get('/store/settings', { params });
    return response.data?.data ?? response.data;
  },

  // Récupérer les slides du carrousel de la page d'accueil
  getHomeSlides: async (params = {}) => {
    // params: { lang }
    const response = await apiClient.get('/store/home-slides', { params });
    return response.data?.data ?? response.data;
  },

  // Récupérer les produits à la une de la page d'accueil (sections promotionnelles split)
  getHomeFeaturedProducts: async (params = {}) => {
    // params: { lang }
    const response = await apiClient.get('/store/home-featured-products', { params });
    return response.data?.data ?? response.data;
  },

  // Récupérer les blocs éditoriaux de la page d'accueil (savoir-faire)
  getHomeBlocks: async (params = {}) => {
    // params: { lang }
    const response = await apiClient.get('/store/home-blocks', { params });
    return response.data?.data ?? response.data;
  },


  // Récupérer la configuration dynamique du footer
  getFooter: async (params = {}) => {
    const response = await apiClient.get('/store/footer', { params });
    return response.data?.data ?? response.data;
  },

  // Récupérer les bannières personnalisées du Méga Menu
  getMenuBanners: async () => {
    const response = await apiClient.get('/store/menu-banners');
    return response.data?.data ?? response.data;
  },
};

export default storeService;
