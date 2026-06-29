import apiClient from './apiClient';

export const adminService = {
  // ── TABLEAU DE BORD (DASHBOARD) ───────────────────────────────────────────
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getOrdersChart: async () => {
    const response = await apiClient.get('/admin/dashboard/orders-chart');
    return response.data;
  },

  getTopProducts: async (limit = 10) => {
    const response = await apiClient.get('/admin/dashboard/top-products', { params: { limit } });
    return response.data;
  },

  getStockAlerts: async (threshold = 5) => {
    const response = await apiClient.get('/admin/dashboard/stock-alerts', { params: { threshold } });
    return response.data;
  },

  // ── COMMANDES (ORDERS) ────────────────────────────────────────────────────
  getOrders: async (params = {}) => {
    const response = await apiClient.get('/admin/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/admin/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status, note = '') => {
    const response = await apiClient.put(`/admin/orders/${id}/status`, { status, note });
    return response.data;
  },

  getPreorders: async () => {
    const response = await apiClient.get('/admin/orders/preorders');
    return response.data;
  },

  // ── PRODUITS (PRODUCTS) ───────────────────────────────────────────────────
  getProducts: async (params = {}) => {
    const response = await apiClient.get('/admin/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/admin/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/admin/products', productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await apiClient.put(`/admin/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}`);
    return response.data;
  },

  getMediaLimits: async () => {
    const response = await apiClient.get('/admin/media-limits');
    return response.data;
  },

  uploadProductImages: async (id, formData) => {
    const response = await apiClient.post(`/admin/products/${id}/images`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  deleteProductImage: async (id, imageId) => {
    const response = await apiClient.delete(`/admin/products/${id}/images/${imageId}`);
    return response.data;
  },

  uploadProductVideo: async (id, formData) => {
    const response = await apiClient.post(`/admin/products/${id}/video`, formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  deleteProductVideo: async (id) => {
    const response = await apiClient.delete(`/admin/products/${id}/video`);
    return response.data;
  },

  updateProductVariants: async (id, variants) => {
    const response = await apiClient.put(`/admin/products/${id}/variants`, { variants });
    return response.data;
  },

  publishProduct: async (id, mode = 'available', preorderAvailableDate = null) => {
    const response = await apiClient.post(`/admin/products/${id}/publish`, {
      mode,
      preorder_available_date: preorderAvailableDate,
    });
    return response.data;
  },

  unpublishProduct: async (id) => {
    const response = await apiClient.post(`/admin/products/${id}/unpublish`);
    return response.data;
  },

  // ── CATÉGORIES & SOUS-CATÉGORIES ───────────────────────────────────────────
  getCategories: async () => {
    const response = await apiClient.get('/admin/categories');
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post('/admin/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`/admin/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`/admin/categories/${id}`);
    return response.data;
  },

  createSubCategory: async (categoryId, subCategoryData) => {
    const response = await apiClient.post(`/admin/categories/${categoryId}/sub-categories`, subCategoryData);
    return response.data;
  },

  updateSubCategory: async (id, subCategoryData) => {
    const response = await apiClient.put(`/admin/sub-categories/${id}`, subCategoryData);
    return response.data;
  },

  deleteSubCategory: async (id) => {
    const response = await apiClient.delete(`/admin/sub-categories/${id}`);
    return response.data;
  },

  // ── COULEURS & TAILLES (ATTRIBUTS) ────────────────────────────────────────
  getColors: async () => {
    const response = await apiClient.get('/admin/colors');
    return response.data;
  },

  createColor: async (colorData) => {
    const response = await apiClient.post('/admin/colors', colorData);
    return response.data;
  },

  deleteColor: async (id) => {
    const response = await apiClient.delete(`/admin/colors/${id}`);
    return response.data;
  },

  getSizes: async () => {
    const response = await apiClient.get('/admin/sizes');
    return response.data;
  },

  createSize: async (sizeData) => {
    const response = await apiClient.post('/admin/sizes', sizeData);
    return response.data;
  },

  deleteSize: async (id) => {
    const response = await apiClient.delete(`/admin/sizes/${id}`);
    return response.data;
  },

  // ── LIVRAISON (SHIPPING) ──────────────────────────────────────────────────
  getShippingZones: async () => {
    const response = await apiClient.get('/admin/shipping-zones');
    return response.data;
  },

  createShippingZone: async (zoneData) => {
    const response = await apiClient.post('/admin/shipping-zones', zoneData);
    return response.data;
  },

  updateShippingZone: async (id, zoneData) => {
    const response = await apiClient.put(`/admin/shipping-zones/${id}`, zoneData);
    return response.data;
  },

  // ── UTILISATEURS (USERS) ──────────────────────────────────────────────────
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  updateUserRole: async (id, role) => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { role });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // ── PROFIL ADMIN (AUTH) ───────────────────────────────────────────────────
  getMe: async () => {
    const response = await apiClient.get('/admin/auth/me');
    return response.data;
  },

  changePassword: async (data) => {
    const response = await apiClient.put('/admin/auth/password', data);
    return response.data;
  },

  // Sauvegarder la configuration du footer
  updateFooterConfig: async (footerConfig) => {
    const response = await apiClient.post('/admin/footer', footerConfig);
    return response.data;
  },

  // Sauvegarder les slides de la page d'accueil
  updateHomeSlides: async (slides) => {
    const response = await apiClient.post('/admin/home-slides', { slides });
    return response.data;
  },

  // Sauvegarder les bannières personnalisées du Méga Menu
  updateMenuBanners: async (banners) => {
    const response = await apiClient.post('/admin/menu-banners', { banners });
    return response.data;
  },
};

export default adminService;
