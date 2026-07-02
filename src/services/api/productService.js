import apiClient from './apiClient';

const normalizeApiResponse = (response) => {
  const payload = response?.data ?? response;

  // If the payload is already an array, return it directly
  if (Array.isArray(payload)) return payload;

  // Common API wrappers:
  // - { success: true, data: [...] }
  // - { success: true, data: { data: [...], ... } } (paginated)
  if (payload?.data) {
    // If payload.data is an array -> that's our list
    if (Array.isArray(payload.data)) return payload.data;
    // If payload.data is a paginated object with a `data` array
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    // Otherwise return payload.data as-is
    return payload.data;
  }

  // Fallback: support older responses using `items`
  if (Array.isArray(payload?.items)) return payload.items;

  return payload;
};

export const productService = {
  // Récupérer la liste des produits publics avec filtres optionnels
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/store/products', { params });
    return normalizeApiResponse(response);
  },

  // Récupérer un produit unique par son ID numérique
  getProductById: async (id) => {
    const response = await apiClient.get(`/store/products/${id}`);
    return normalizeApiResponse(response);
  },

  // Récupérer les catégories de produits publiques
  getCategories: async () => {
    const response = await apiClient.get('/store/categories');
    return normalizeApiResponse(response);
  },

  // S'inscrire à une alerte de retour en stock
  subscribeStockAlert: async (data) => {
    const response = await apiClient.post('/store/stock-alerts', data);
    return normalizeApiResponse(response);
  },
};

export default productService;

