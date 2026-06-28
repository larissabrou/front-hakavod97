import apiClient from './apiClient';

const normalizeApiResponse = (response) => {
  const payload = response?.data ?? response;

  if (Array.isArray(payload)) return payload;
  if (payload?.data) {
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
    return payload.data;
  }
  if (Array.isArray(payload?.items)) return payload.items;
  return payload;
};

const getIsDemo = () => {
  const token = localStorage.getItem('auth_token');
  return token && token.startsWith('mock-');
};

const defaultVariables = [
  { name: 'user_name', desc: 'Nom complet du client' },
  { name: 'order_id', desc: 'Numéro unique de la commande' },
  { name: 'order_status', desc: 'Statut de la commande (ex: Expédiée)' },
  { name: 'tracking_number', desc: 'Numéro de suivi du colis' },
  { name: 'tracking_url', desc: 'Lien de suivi de la livraison' },
  { name: 'amount_total', desc: 'Montant total de la commande' },
  { name: 'products_list', desc: 'Liste textuelle des articles commandés' }
];

const notificationsService = {
  // Templates
  getTemplateVariables: async () => {
    if (getIsDemo()) {
      return defaultVariables;
    }
    const res = await apiClient.get('/admin/notification-templates/variables');
    return normalizeApiResponse(res);
  },

  listTemplates: async (params = {}) => {
    if (getIsDemo()) {
      let mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      if (mockTemplates.length === 0) {
        mockTemplates = [
          {
            id: 1,
            name: 'Confirmation de commande',
            type: 'custom',
            subject: 'Votre commande {{order_id}} est validée',
            body_html: 'Bonjour {{user_name}},\n\nNous vous confirmons la validation de votre commande {{order_id}} pour un montant de {{amount_total}}.\n\nCordialement,\nL\'équipe Ha-Kavod 97',
            is_active: true
          },
          {
            id: 2,
            name: 'Expédition de commande',
            type: 'custom',
            subject: 'Votre commande {{order_id}} a été expédiée !',
            body_html: 'Bonjour {{user_name}},\n\nBonne nouvelle ! Votre colis a été remis à notre transporteur. Vous pouvez le suivre ici : {{tracking_url}}\nNuméro de suivi : {{tracking_number}}.\n\nCordialement,\nL\'équipe Ha-Kavod 97',
            is_active: true
          }
        ];
        localStorage.setItem('mock_notification_templates', JSON.stringify(mockTemplates));
      }
      return mockTemplates;
    }
    const res = await apiClient.get('/admin/notification-templates', { params });
    return normalizeApiResponse(res);
  },

  createTemplate: async (payload) => {
    if (getIsDemo()) {
      const mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: payload.name || '',
        type: payload.type || 'custom',
        subject: payload.subject || '',
        body_html: payload.body_html || payload.body || payload.html || '',
        is_active: payload.is_active ?? true
      };
      mockTemplates.push(newTemplate);
      localStorage.setItem('mock_notification_templates', JSON.stringify(mockTemplates));
      return newTemplate;
    }
    const res = await apiClient.post('/admin/notification-templates', payload);
    return normalizeApiResponse(res);
  },

  getTemplate: async (id) => {
    if (getIsDemo()) {
      const mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      return mockTemplates.find(t => String(t.id) === String(id));
    }
    const res = await apiClient.get(`/admin/notification-templates/${id}`);
    return normalizeApiResponse(res);
  },

  updateTemplate: async (id, payload) => {
    if (getIsDemo()) {
      const mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      const index = mockTemplates.findIndex(t => String(t.id) === String(id));
      if (index !== -1) {
        mockTemplates[index] = {
          ...mockTemplates[index],
          name: payload.name ?? mockTemplates[index].name,
          type: payload.type ?? mockTemplates[index].type,
          subject: payload.subject ?? mockTemplates[index].subject,
          body_html: (payload.body_html ?? payload.body ?? payload.html) ?? mockTemplates[index].body_html,
          is_active: payload.is_active ?? mockTemplates[index].is_active
        };
        localStorage.setItem('mock_notification_templates', JSON.stringify(mockTemplates));
        return mockTemplates[index];
      }
      return null;
    }
    const res = await apiClient.put(`/admin/notification-templates/${id}`, payload);
    return normalizeApiResponse(res);
  },

  deleteTemplate: async (id) => {
    if (getIsDemo()) {
      const mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      const filtered = mockTemplates.filter(t => String(t.id) !== String(id));
      localStorage.setItem('mock_notification_templates', JSON.stringify(filtered));
      return { success: true };
    }
    const res = await apiClient.delete(`/admin/notification-templates/${id}`);
    return normalizeApiResponse(res);
  },

  // Campaigns
  previewCampaignAudience: async (payload) => {
    if (getIsDemo()) {
      return [
        { id: 1, name: 'Jean Dupont', email: 'jean.dupont@email.com', role: 'customer' },
        { id: 2, name: 'Marie Koné', email: 'marie.kone@email.ci', role: 'customer' },
        { id: 3, name: 'Koffi Yao', email: 'koffi.yao@email.ci', role: 'customer' },
        { id: 4, name: 'Sarah Diallo', email: 'sarah.diallo@email.com', role: 'customer' },
        { id: 5, name: 'Awa Touré', email: 'awa.toure@email.ci', role: 'customer' }
      ];
    }
    const res = await apiClient.post('/admin/notification-campaigns/audience/preview', payload);
    return normalizeApiResponse(res);
  },

  previewCampaignHtml: async (payload) => {
    if (getIsDemo()) {
      const mockTemplates = JSON.parse(localStorage.getItem('mock_notification_templates') || '[]');
      const templateId = payload.notification_template_id || payload.template_id;
      const template = mockTemplates.find(t => String(t.id) === String(templateId));
      const body = template ? (template.body_html || template.body) : 'Modèle de template de notification introuvable.';
      
      let replaced = body
        .replace(/\{\{user_name\}\}/g, 'Jean Dupont')
        .replace(/\{\{order_id\}\}/g, 'HK-9721')
        .replace(/\{\{order_status\}\}/g, 'Expédiée')
        .replace(/\{\{tracking_number\}\}/g, 'TRK-987654321-CI')
        .replace(/\{\{tracking_url\}\}/g, 'https://hakavok.com/tracking/TRK-987654321-CI')
        .replace(/\{\{amount_total\}\}/g, '45 000 F CFA')
        .replace(/\{\{products_list\}\}/g, '1x Sac en Cuir Pleine Fleur Ha-Kavod (Noir) - 45 000 F CFA');
      
      replaced = replaced.replace(/\n/g, '<br />');
      return { html: `<div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #2d251d; padding: 20px; border: 1px solid #f1f1f1; background-color: #ffffff;">${replaced}</div>` };
    }
    const res = await apiClient.post('/admin/notification-campaigns/preview', payload);
    return normalizeApiResponse(res);
  },

  listCampaigns: async (params = {}) => {
    if (getIsDemo()) {
      let mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      if (mockCampaigns.length === 0) {
        mockCampaigns = [
          {
            id: 1,
            name: 'Newsletter Collection Printemps 2026',
            notification_template_id: 1,
            audience_type: 'all_clients',
            status: 'sent',
            scheduled_at: null,
            sent_at: '2026-05-10T14:30:00.000Z',
            created_at: '2026-05-10T14:00:00.000Z'
          }
        ];
        localStorage.setItem('mock_notification_campaigns', JSON.stringify(mockCampaigns));
      }
      return mockCampaigns;
    }
    const res = await apiClient.get('/admin/notification-campaigns', { params });
    return normalizeApiResponse(res);
  },

  createCampaign: async (payload) => {
    if (getIsDemo()) {
      const mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      const newCampaign = {
        id: Date.now(),
        name: payload.name || '',
        notification_template_id: payload.notification_template_id || payload.template_id || '',
        audience_type: payload.audience_type || 'all_clients',
        custom_emails: payload.custom_emails || [],
        status: payload.send_now ? 'sent' : 'scheduled',
        scheduled_at: payload.send_now ? null : (payload.scheduled_at || payload.schedule_at || new Date(Date.now() + 86400000).toISOString()),
        sent_at: payload.send_now ? new Date().toISOString() : null,
        created_at: new Date().toISOString()
      };
      mockCampaigns.push(newCampaign);
      localStorage.setItem('mock_notification_campaigns', JSON.stringify(mockCampaigns));
      return newCampaign;
    }
    const res = await apiClient.post('/admin/notification-campaigns', payload);
    return normalizeApiResponse(res);
  },

  getCampaign: async (id) => {
    if (getIsDemo()) {
      const mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      return mockCampaigns.find(c => String(c.id) === String(id));
    }
    const res = await apiClient.get(`/admin/notification-campaigns/${id}`);
    return normalizeApiResponse(res);
  },

  updateCampaign: async (id, payload) => {
    if (getIsDemo()) {
      const mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      const index = mockCampaigns.findIndex(c => String(c.id) === String(id));
      if (index !== -1) {
        mockCampaigns[index] = {
          ...mockCampaigns[index],
          name: payload.name ?? mockCampaigns[index].name,
          notification_template_id: payload.notification_template_id ?? payload.template_id ?? mockCampaigns[index].notification_template_id,
          audience_type: payload.audience_type ?? mockCampaigns[index].audience_type,
          custom_emails: payload.custom_emails ?? mockCampaigns[index].custom_emails,
          status: payload.status ?? mockCampaigns[index].status,
          scheduled_at: payload.scheduled_at ?? payload.schedule_at ?? mockCampaigns[index].scheduled_at
        };
        localStorage.setItem('mock_notification_campaigns', JSON.stringify(mockCampaigns));
        return mockCampaigns[index];
      }
      return null;
    }
    const res = await apiClient.put(`/admin/notification-campaigns/${id}`, payload);
    return normalizeApiResponse(res);
  },

  deleteCampaign: async (id) => {
    if (getIsDemo()) {
      const mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      const filtered = mockCampaigns.filter(c => String(c.id) !== String(id));
      localStorage.setItem('mock_notification_campaigns', JSON.stringify(filtered));
      return { success: true };
    }
    const res = await apiClient.delete(`/admin/notification-campaigns/${id}`);
    return normalizeApiResponse(res);
  },

  sendCampaign: async (id, payload = {}) => {
    if (getIsDemo()) {
      const mockCampaigns = JSON.parse(localStorage.getItem('mock_notification_campaigns') || '[]');
      const index = mockCampaigns.findIndex(c => String(c.id) === String(id));
      if (index !== -1) {
        mockCampaigns[index] = {
          ...mockCampaigns[index],
          status: 'sent',
          sent_at: new Date().toISOString()
        };
        localStorage.setItem('mock_notification_campaigns', JSON.stringify(mockCampaigns));
        return mockCampaigns[index];
      }
      return null;
    }
    const res = await apiClient.post(`/admin/notification-campaigns/${id}/send`, payload);
    return normalizeApiResponse(res);
  },
};

export default notificationsService;
