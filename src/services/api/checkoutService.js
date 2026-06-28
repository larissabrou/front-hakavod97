import apiClient from './apiClient';

export const checkoutService = {
  // Récapitulatif/Preview du checkout (avec conversion de devise)
  previewCheckout: async (payload) => {
    // payload: { items: [{ product_id, product_variant_id, quantity }], shipping_zone_id, currency, lang }
    const response = await apiClient.post('/store/checkout/preview', payload);
    return response.data;
  },

  // Soumettre une commande client
  createOrder: async (orderData) => {
    // orderData: { customer_name, customer_email, customer_phone, shipping_address, commune_id, shipping_zone_id, currency, lang, items }
    const response = await apiClient.post('/store/orders', orderData);
    return response.data;
  },

  // Suivre une commande par sa référence
  getOrder: async (reference, params = {}) => {
    // params: { currency, lang }
    const response = await apiClient.get(`/store/orders/${reference}`, { params });
    return response.data?.data ?? response.data;
  },

  // Annuler une commande
  cancelOrder: async (reference) => {
    const response = await apiClient.post(`/store/orders/${reference}/cancel`);
    return response.data;
  },

  // Initier un paiement pour une commande
  initiatePayment: async (reference, paymentData) => {
    // paymentData: { payment_type, operator, phone_number, country, success_url, cancel_url }
    const response = await apiClient.post(`/store/orders/${reference}/payments`, paymentData);
    return response.data?.data ?? response.data;
  },

  // Récupérer le statut du paiement (polling)
  getPaymentStatus: async (reference) => {
    const response = await apiClient.get(`/store/orders/${reference}/payments/status`);
    return response.data?.data ?? response.data;
  },
};

export default checkoutService;
