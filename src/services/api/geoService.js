import apiClient from './apiClient';

export const geoService = {
  // Récupérer la liste des régions de Côte d'Ivoire
  getRegions: async () => {
    const response = await apiClient.get('/regions');
    return response.data;
  },

  // Récupérer les communes (optionnellement filtrées par ID région)
  getCommunes: async (regionId = null) => {
    const params = {};
    if (regionId) {
      params.region = regionId;
    }
    const response = await apiClient.get('/communes', { params });
    return response.data;
  },
};

export default geoService;
