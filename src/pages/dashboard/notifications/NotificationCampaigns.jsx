import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import notificationsService from '../../../services/api/notificationsService';
import { Send, Eye, Users, FileText, CheckCircle, Clock, FileCode, AlertCircle, Calendar, RefreshCw, Sparkles, HelpCircle } from 'lucide-react';

const emptyForm = { name: '', template_id: '', audience_type: 'all_clients', custom_emails: '', schedule_at: '', send_now: true };

const NotificationCampaigns = ({
  isDarkMode,
  showConfirm,
  showAlert,
  setSuccess,
  setError: setParentError
}) => {
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [previewHtml, setPreviewHtml] = useState('');
  const [audiencePreview, setAudiencePreview] = useState(null);
  
  const [audienceLoading, setAudienceLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // States for campaign preview modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState(null);
  const [previewCampaignHtmlContent, setPreviewCampaignHtmlContent] = useState('');
  const [previewCampaignAudienceContent, setPreviewCampaignAudienceContent] = useState(null);
  const [previewCampaignLoading, setPreviewCampaignLoading] = useState(false);

  const audiencePresets = [
    { label: 'Tous les clients', type: 'all_clients', desc: 'Cibler tout le carnet de contacts' },
    { label: 'Liste d\'e-mails spécifique', type: 'custom_list', desc: 'Cibler des adresses e-mail spécifiques' },
  ];

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, tRes] = await Promise.all([
        notificationsService.listCampaigns(),
        notificationsService.listTemplates()
      ]);
      setCampaigns(Array.isArray(cRes) ? cRes : (cRes?.data ?? []));
      setTemplates(Array.isArray(tRes) ? tRes : (tRes?.data ?? []));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Erreur lors du chargement des campagnes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ── AUTO-PREVIEWS DÉCLENCHÉES PAR L'ÉTAT ──

  // 1. Charger l'aperçu de l'audience (débouncé à 450ms)
  useEffect(() => {
    if (!isModalOpen) return;
    const delayDebounce = setTimeout(() => {
      const payload = {
        audience_type: form.audience_type,
        custom_emails: form.audience_type === 'custom_list'
          ? form.custom_emails.split(',').map(e => e.trim()).filter(Boolean)
          : []
      };
      fetchAudience(payload);
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [form.audience_type, form.custom_emails, isModalOpen]);

  // 2. Charger l'aperçu du Template HTML
  useEffect(() => {
    if (!isModalOpen) return;
    if (form.template_id) {
      fetchHtml(form.template_id);
    } else {
      setPreviewHtml('');
    }
  }, [form.template_id, isModalOpen]);

  const fetchAudience = async (payload) => {
    setAudienceLoading(true);
    try {
      const res = await notificationsService.previewCampaignAudience(payload);
      setAudiencePreview(res);
    } catch (e) {
      console.warn("Erreur auto-chargement audience:", e);
    } finally {
      setAudienceLoading(false);
    }
  };

  const fetchHtml = async (tid) => {
    setPreviewLoading(true);
    setPreviewError('');
    try {
      const template = templates.find(t => String(t.id) === String(tid));
      const payload = {
        notification_template_id: Number(tid),
        subject: template?.subject || '',
        body_html: template?.body_html || template?.body || template?.html || ''
      };
      const res = await notificationsService.previewCampaignHtml(payload);
      setPreviewHtml(res?.html || res?.data?.html || '');
    } catch (e) {
      console.warn("Erreur auto-chargement html:", e);
      let errorMsg = e?.response?.data?.message || e.message || "Erreur lors de la génération de l'aperçu";
      if (e?.response?.data?.errors) {
        const details = Object.entries(e.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errorMsg += ` (${details})`;
      }
      setPreviewError(errorMsg);
      setPreviewHtml('');
    } finally {
      setPreviewLoading(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setPreviewHtml('');
    setAudiencePreview(null);
    setIsModalOpen(true);
  };

  const openPreview = async (campaign) => {
    setPreviewCampaign(campaign);
    setPreviewCampaignHtmlContent('');
    setPreviewCampaignAudienceContent(null);
    setIsPreviewModalOpen(true);
    setPreviewCampaignLoading(true);
    try {
      const tid = campaign.notification_template_id || campaign.template_id;
      
      // Load HTML preview
      let htmlRes = '';
      if (tid) {
        try {
          const res = await notificationsService.previewCampaignHtml({ notification_template_id: Number(tid), data: {} });
          htmlRes = res?.html || res?.data?.html || '';
        } catch (e) {
          console.warn("Erreur chargement html preview:", e);
        }
      }
      setPreviewCampaignHtmlContent(htmlRes);

      // Load Audience preview
      let audienceRes = null;
      try {
        const payload = {
          audience_type: campaign.audience_type || 'all_clients',
          custom_emails: campaign.custom_emails || []
        };
        const res = await notificationsService.previewCampaignAudience(payload);
        audienceRes = res;
      } catch (e) {
        console.warn("Erreur chargement audience preview:", e);
      }
      setPreviewCampaignAudienceContent(audienceRes);
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewCampaignLoading(false);
    }
  };

  const getTemplateSubject = (tid) => {
    const template = templates.find(t => String(t.id) === String(tid));
    return template ? template.subject : '(Sujet non défini)';
  };

  const renderAudiencePreviewContent = (audienceData) => {
    if (!audienceData) {
      return (
        <div className="p-4 border rounded-xl text-center text-neutral-400 font-bold uppercase tracking-widest text-[9px]">
          Aucune donnée d'audience chargée.
        </div>
      );
    }

    let usersList = [];
    let totalCount = 0;

    if (Array.isArray(audienceData)) {
      usersList = audienceData;
      totalCount = usersList.length;
    } else if (audienceData.users && Array.isArray(audienceData.users)) {
      usersList = audienceData.users;
      totalCount = audienceData.count ?? usersList.length;
    } else if (audienceData.data && Array.isArray(audienceData.data)) {
      usersList = audienceData.data;
      totalCount = usersList.length;
    } else if (typeof audienceData === 'object') {
      totalCount = audienceData.count ?? 0;
      usersList = audienceData.items || [];
    }

    return (
      <div className={`p-4 border rounded-xl shadow-3xs text-[11px] transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200/80'}`}>
        <div className="flex justify-between items-center mb-3 font-extrabold uppercase tracking-wider text-[9px] text-neutral-500">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Destinataires ({totalCount})</span>
        </div>
        
        {usersList.length > 0 ? (
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 font-medium scrollbar-thin">
            {usersList.slice(0, 10).map((u, i) => (
              <div key={u.id || i} className="flex justify-between border-b pb-1.5 border-neutral-200/40 last:border-b-0 last:pb-0 font-medium">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{u.name || u.username || 'Client anonyme'}</span>
                <span className="font-mono text-[9.5px] text-neutral-450">{u.email || u.phone || 'Pas de contact'}</span>
              </div>
            ))}
            {usersList.length > 10 && (
              <div className="text-center pt-2 text-[8px] text-accent font-bold uppercase tracking-wider">
                + {usersList.length - 10} autres...
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-400 font-bold uppercase text-[9px] text-center py-2">
            {totalCount > 0 ? 'Cible validée (liste masquée)' : 'Aucun utilisateur ciblé'}
          </p>
        )}
      </div>
    );
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.template_id) {
      showAlert('Le nom de la campagne et le modèle sont obligatoires (*).');
      return;
    }
    try {
      setActionLoading(true);
      const payload = {
        name: form.name.trim(),
        notification_template_id: Number(form.template_id),
        audience_type: form.audience_type,
        send_now: form.send_now
      };
      
      if (form.audience_type === 'custom_list') {
        payload.custom_emails = form.custom_emails.split(',').map(e => e.trim()).filter(Boolean);
      }
      
      if (!form.send_now && form.schedule_at) {
        payload.scheduled_at = new Date(form.schedule_at).toISOString();
      }
      await notificationsService.createCampaign(payload);
      setIsModalOpen(false);
      if (setSuccess) {
        setSuccess('Campagne de diffusion créée avec succès.');
      }
      load();
    } catch (e) {
      let errorMsg = e?.response?.data?.message || e.message || 'Erreur de création de la campagne';
      if (e?.response?.data?.errors) {
        const details = Object.entries(e.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errorMsg += `\n\nDétails des erreurs :\n${details}`;
      }
      showAlert({
        title: 'Erreur de validation',
        description: errorMsg
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSend = async (id) => {
    const confirmed = await showConfirm({
      title: 'Confirmer l\'envoi',
      description: 'Voulez-vous vraiment envoyer cette campagne à tous les destinataires ciblés dès maintenant ?',
      warningText: 'Cette action lancera l\'envoi immédiat des e-mails aux destinataires ciblés.'
    });
    if (!confirmed) return;
    try {
      await notificationsService.sendCampaign(id);
      if (setSuccess) {
        setSuccess('Campagne envoyée avec succès.');
      }
      load();
    } catch (e) {
      if (setParentError) {
        setParentError(e?.response?.data?.message || e.message || 'Erreur d\'envoi de la campagne');
      } else {
        showAlert(e?.response?.data?.message || e.message || 'Erreur d\'envoi de la campagne');
      }
    }
  };

  const getTemplateName = (tid) => {
    const template = templates.find(t => String(t.id) === String(tid));
    return template ? (template.name || template.title) : `Modèle #${tid}`;
  };

  // Helper pour afficher la liste d'audience prévisualisée
  const renderAudiencePreview = () => {
    if (audienceLoading) {
      return (
        <div className={`p-4 border rounded-xl animate-pulse text-[11px] ${isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
          <div className="flex justify-between items-center text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2">
            <span>Calcul de la cible en cours...</span>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          </div>
          <div className="h-12 bg-neutral-800/10 rounded-lg"></div>
        </div>
      );
    }

    if (!audiencePreview) return null;

    let usersList = [];
    let totalCount = 0;

    if (Array.isArray(audiencePreview)) {
      usersList = audiencePreview;
      totalCount = usersList.length;
    } else if (audiencePreview.users && Array.isArray(audiencePreview.users)) {
      usersList = audiencePreview.users;
      totalCount = audiencePreview.count ?? usersList.length;
    } else if (audiencePreview.data && Array.isArray(audiencePreview.data)) {
      usersList = audiencePreview.data;
      totalCount = usersList.length;
    } else if (typeof audiencePreview === 'object') {
      totalCount = audiencePreview.count ?? 0;
      usersList = audiencePreview.items || [];
    }

    return (
      <div className={`p-5 border rounded-xl shadow-3xs text-[11px] transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200/80'}`}>
        <div className="flex justify-between items-center mb-3 font-extrabold uppercase tracking-wider text-[9.5px] text-neutral-500">
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-accent" /> Aperçu de la cible ({totalCount} destinataires)</span>
          <span className="bg-accent/15 text-accent px-2 py-0.5 rounded-full text-[9px] lowercase tracking-normal font-bold">dynamique</span>
        </div>
        
        {usersList.length > 0 ? (
          <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1 font-medium scrollbar-thin">
            {usersList.slice(0, 10).map((u, i) => (
              <div key={u.id || i} className="flex justify-between border-b pb-1.5 border-neutral-200/40 last:border-b-0 last:pb-0">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">{u.name || u.username || 'Client anonyme'}</span>
                <span className="font-mono text-[10px] text-neutral-400">{u.email || u.phone || 'Pas de contact'}</span>
              </div>
            ))}
            {usersList.length > 10 && (
              <div className="text-center pt-2 text-[9px] text-accent font-bold uppercase tracking-wider">
                + {usersList.length - 10} autres destinataires...
              </div>
            )}
          </div>
        ) : (
          <p className="text-neutral-400 font-bold uppercase text-[9px] text-center py-4">
            {totalCount > 0 ? 'Cible validée (liste détaillée masquée)' : 'Aucun utilisateur ne correspond à ce filtre'}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 text-xs transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
      
      {/* ── HEADER PANEL ── */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between sm:items-center p-6 border rounded-xl shadow-2xs transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200/60'}`}>
        <div className="text-left">
          <span className="font-bold uppercase tracking-widest text-[10px] text-neutral-400 flex items-center gap-2">
            <Send className="w-4 h-4 text-accent" /> Diffusion de messages
          </span>
          <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1.5">Campagnes de notification</h2>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Envoyez des messages ciblés ou des promotions par e-mail en quelques secondes.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-neutral-850 text-white font-extrabold py-3 px-5 rounded-lg uppercase tracking-wider text-[10px] shadow-sm hover:shadow-md transition-all self-start sm:self-center shrink-0"
        >
          + Nouvelle campagne
        </button>
      </div>

      {loading && (
        <div className="py-20 text-center font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
          Chargement des campagnes...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200/60 text-red-700 p-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* ── LISTE DES CAMPAGNES ── */}
      {!loading && !error && (
        <div className={`border rounded-xl shadow-2xs overflow-hidden transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200/60'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-[9.5px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-neutral-950/40 border-neutral-850 text-neutral-400' : 'bg-neutral-50/50 border-neutral-200/60 text-neutral-500'}`}>
                  <th className="py-4 px-6">Nom de la Campagne</th>
                  <th className="py-4 px-6">Modèle Utilisé</th>
                  <th className="py-4 px-6">Audience Ciblée</th>
                  <th className="py-4 px-6">Statut</th>
                  <th className="py-4 px-6">Date de planification / d'envoi</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f5f5f5' }}>
                {campaigns.length === 0 && (
                  <tr>
                    <td colSpan="6" className="py-16 text-center text-neutral-400 font-bold uppercase tracking-widest">
                      Aucune campagne enregistrée pour le moment.
                    </td>
                  </tr>
                )}
                {campaigns.map(c => {
                  const isSent = c.status === 'sent' || c.sent_at || c.status === 'success';
                  const isScheduled = c.status === 'scheduled' || c.schedule_at;
                  
                  return (
                    <tr key={c.id} className={`font-semibold hover:bg-neutral-500/5 transition-colors ${isDarkMode ? 'text-neutral-200' : 'text-neutral-700'}`}>
                      <td className="py-4 px-6 font-extrabold text-neutral-900 dark:text-white">
                        {c.name || `Campagne #${c.id}`}
                      </td>
                      <td className="py-4 px-6 text-neutral-400 font-medium">
                        {getTemplateName(c.notification_template_id || c.template_id)}
                      </td>
                      <td className="py-4 px-6 font-mono text-[10px] text-neutral-400">
                        <span className="bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-md border border-neutral-200/20 font-semibold">
                          {c.audience_type === 'all_clients' ? 'Tous les clients' : (c.audience_type === 'custom_list' ? 'Liste personnalisée' : (c.audience_type || c.audience_query || 'Tous les clients'))}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                          isSent ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                          isScheduled ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-neutral-50 text-neutral-500 border-neutral-200'
                        }`}>
                          {isSent ? <CheckCircle className="w-3 h-3 text-emerald-600" /> : isScheduled ? <Clock className="w-3 h-3 text-amber-600" /> : <FileText className="w-3 h-3 text-neutral-400" />}
                          {isSent ? 'Envoyée' : isScheduled ? 'Planifiée' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[10.5px] text-neutral-400 font-medium">
                        {isSent ? (
                          <span>Envoyée le {new Date(c.sent_at || c.updated_at || Date.now()).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : isScheduled ? (
                          <span className="text-amber-600">Prévue le {new Date(c.schedule_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        ) : (
                          <span className="opacity-50">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => openPreview(c)}
                            className={`flex items-center gap-1.5 py-2 px-3 border rounded-lg text-[9px] uppercase font-bold tracking-wider transition-all shadow-3xs ${
                              isDarkMode ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                            }`}
                          >
                            <Eye className="w-3 h-3" /> Aperçu
                          </button>
                          
                          {!isSent && (
                            <button
                              onClick={() => handleSend(c.id)}
                              className="bg-primary hover:bg-neutral-850 text-white font-extrabold py-2 px-3 rounded-lg uppercase text-[9px] tracking-wider transition-all flex items-center gap-1.5 shadow-2xs hover:shadow-xs"
                            >
                              <Send className="w-3 h-3" /> Envoyer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CAMPAIGN CREATION MODAL ── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Créer une campagne de diffusion"
        size="xl"
      >
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs pb-4 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
          
          {/* Configuration Form (Col span 5) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Nom de la campagne *</label>
              <input 
                type="text"
                placeholder="ex: Offres Exclusive – Solde de Printemps"
                value={form.name} 
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-accent'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Modèle d'Email (Template) *</label>
              <select 
                value={form.template_id} 
                onChange={(e) => setForm(prev => ({ ...prev, template_id: e.target.value }))}
                className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-850 focus:border-accent'}`}
              >
                <option value="">-- Choisir un modèle --</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name || t.title}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Type d'audience cible *</label>
              
              {/* Raccourcis Cibles (Pills) */}
              <div className="flex gap-2 mb-2">
                {audiencePresets.map((preset) => (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, audience_type: preset.type }))}
                    title={preset.desc}
                    className={`flex-1 py-2 text-[9px] font-bold uppercase rounded-lg border transition-all ${
                      form.audience_type === preset.type
                        ? 'bg-accent/10 border-accent/40 text-accent shadow-3xs'
                        : isDarkMode ? 'border-neutral-800 bg-neutral-900 text-neutral-450 hover:text-white' : 'border-neutral-200 bg-neutral-50 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {form.audience_type === 'all_clients' ? (
                <div className={`p-3 border rounded-lg text-[10px] leading-normal font-medium ${isDarkMode ? 'bg-neutral-950/40 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-200 text-neutral-500'}`}>
                  Cible : <strong>Tous les clients</strong> (envoyé à tous les e-mails de clients enregistrés dans la base de données).
                </div>
              ) : (
                <div className="flex flex-col gap-1 animate-fade-in">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Adresses e-mail (séparées par des virgules) *</label>
                  <textarea 
                    placeholder="ex: client1@domain.com, client2@domain.com"
                    value={form.custom_emails} 
                    onChange={(e) => setForm(prev => ({ ...prev, custom_emails: e.target.value }))}
                    className={`border p-2.5 h-20 font-mono text-[10.5px] focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs resize-none ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-accent'}`}
                  />
                </div>
              )}
            </div>

            <div className="border-t pt-4 my-2" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
              <div className="flex items-center gap-3 mb-4">
                <input 
                  type="checkbox" 
                  id="send_now"
                  checked={form.send_now} 
                  onChange={(e) => setForm(prev => ({ ...prev, send_now: e.target.checked }))}
                  className="w-4 h-4 rounded-md accent-accent cursor-pointer"
                />
                <label htmlFor="send_now" className="font-extrabold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider text-[9px] cursor-pointer">
                  Envoyer immédiatement après enregistrement
                </label>
              </div>

              {!form.send_now && (
                <div className="flex flex-col gap-1.5 animate-fade-in">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" /> Date et heure d'envoi
                  </label>
                  <input 
                    type="datetime-local"
                    value={form.schedule_at} 
                    onChange={(e) => setForm(prev => ({ ...prev, schedule_at: e.target.value }))}
                    className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-850'}`}
                  />
                </div>
              )}
            </div>
          </div>
          
          {/* Live Previews Panel (Col span 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Target Cible summary card */}
            {renderAudiencePreview()}

            {/* Template html rendered mock */}
            {previewLoading ? (
              <div className={`h-64 border rounded-xl flex flex-col items-center justify-center p-6 text-center animate-pulse ${
                isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
              }`}>
                <RefreshCw className="w-6 h-6 mb-2 text-accent animate-spin" />
                <span className="font-bold uppercase tracking-wider text-[9px]">Chargement du rendu HTML...</span>
              </div>
            ) : previewHtml ? (
              <div className={`border rounded-xl flex flex-col shadow-3xs overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200/80'}`}>
                {/* Simulated Mail Header */}
                <div className={`p-4 border-b text-[10px] space-y-1.5 ${isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200/50'}`}>
                  <div className="flex justify-between items-center text-neutral-400 font-extrabold uppercase tracking-widest text-[8.5px] mb-1">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-accent" /> Rendu visuel de la newsletter</span>
                    <span className="text-[8px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">prévisualisation</span>
                  </div>
                  <div><span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">De :</span> conciergerie@hakavod97.com</div>
                  <div><span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Objet :</span> <span className="font-bold text-neutral-800 dark:text-neutral-200">{form.template_id ? getTemplateName(form.template_id) : 'Sujet du message'}</span></div>
                </div>
                {/* HTML content inside scrollbox */}
                <div className="p-5 bg-white overflow-y-auto max-h-72 border-none">
                  <div className="text-neutral-900 font-medium text-xs break-words" dangerouslySetInnerHTML={{ __html: previewHtml }} />
                </div>
              </div>
            ) : previewError ? (
              <div className={`h-64 border border-red-500/20 rounded-xl flex flex-col items-center justify-center p-6 text-center ${
                isDarkMode ? 'bg-red-950/10 text-red-400' : 'bg-red-50 text-red-700'
              }`}>
                <AlertCircle className="w-8 h-8 mb-2.5 text-red-500" />
                <span className="font-bold uppercase tracking-wider text-[9px] mb-1">Erreur de prévisualisation</span>
                <p className="text-[10px] font-medium leading-relaxed max-w-xs">
                  {previewError}
                </p>
              </div>
            ) : (
              <div className={`h-64 border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center ${
                isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-300/80 text-neutral-400'
              }`}>
                <FileCode className="w-8 h-8 mb-2.5 text-neutral-300" />
                <span className="font-bold uppercase tracking-wider text-[9px] mb-1">Aucun rendu généré</span>
                <p className="text-[10px] font-medium leading-relaxed max-w-xs text-neutral-400">
                  Sélectionnez un modèle d'Email ci-contre pour générer automatiquement l'aperçu du message.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Modal actions footer */}
        <div className={`flex gap-3 justify-end pt-5 border-t mt-4 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className={`border rounded-lg font-bold uppercase tracking-wider py-2.5 px-5 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={actionLoading}
            onClick={handleCreate}
            className="bg-primary hover:bg-neutral-850 text-white font-extrabold uppercase tracking-wider py-2.5 px-6 text-[10px] rounded-lg transition-colors shadow-sm hover:shadow-md disabled:opacity-50"
          >
            {actionLoading ? 'Création...' : 'Créer la campagne'}
          </button>
        </div>
      </Modal>

      {/* ── MODALE DE PRÉVISUALISATION D'UNE CAMPAGNE EXISTANTE ── */}
      <Modal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        title={`Détails de la campagne : ${previewCampaign?.name || ''}`}
        size="xl"
      >
        {previewCampaign && (
          <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs pb-4 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
            
            {/* Infos (Col span 5) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-4">
                <div>
                  <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Nom de la campagne</span>
                  <p className="text-sm font-extrabold text-neutral-900 dark:text-white mt-1">{previewCampaign.name}</p>
                </div>

                <div>
                  <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Modèle Utilisé</span>
                  <p className="text-xs font-semibold text-neutral-650 dark:text-neutral-305 mt-1">
                    {getTemplateName(previewCampaign.notification_template_id || previewCampaign.template_id)}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Statut</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 text-[9px] font-bold px-2.5 py-1 rounded-full border ${
                      previewCampaign.status === 'sent' || previewCampaign.sent_at || previewCampaign.status === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                      previewCampaign.status === 'scheduled' || previewCampaign.schedule_at || previewCampaign.scheduled_at ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}>
                      {previewCampaign.status === 'sent' || previewCampaign.sent_at || previewCampaign.status === 'success' ? 'Envoyée' : 
                       previewCampaign.status === 'scheduled' || previewCampaign.schedule_at || previewCampaign.scheduled_at ? 'Planifiée' : 'Brouillon'}
                    </span>
                  </div>
                </div>

                {(previewCampaign.sent_at || previewCampaign.schedule_at || previewCampaign.scheduled_at) && (
                  <div>
                    <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">
                      {previewCampaign.sent_at ? "Date d'envoi" : "Planifiée pour"}
                    </span>
                    <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-350 mt-1 font-mono">
                      {new Date(previewCampaign.sent_at || previewCampaign.schedule_at || previewCampaign.scheduled_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Audience preview summary card */}
              <div className="border-t pt-4" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                {previewCampaignLoading ? (
                  <div className="animate-pulse py-4 text-center font-bold text-neutral-400 uppercase tracking-widest text-[9px]">
                    Calcul des destinataires...
                  </div>
                ) : (
                  <div>
                    {renderAudiencePreviewContent(previewCampaignAudienceContent)}
                  </div>
                )}
              </div>
            </div>
            
            {/* HTML rendered box (Col span 7) */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-[300px]">
              <span className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px] mb-2">Rendu de la newsletter</span>
              
              {previewCampaignLoading ? (
                <div className={`flex-1 border rounded-xl flex flex-col items-center justify-center p-6 text-center animate-pulse min-h-[250px] ${
                  isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-neutral-50 border-neutral-200 text-neutral-400'
                }`}>
                  <RefreshCw className="w-6 h-6 mb-2 text-accent animate-spin" />
                  <span className="font-bold uppercase tracking-wider text-[9px]">Chargement du rendu HTML...</span>
                </div>
              ) : previewCampaignHtmlContent ? (
                <div className={`border rounded-xl flex flex-col shadow-3xs overflow-hidden transition-all duration-300 flex-1 ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200/80'}`}>
                  {/* Simulated Mail Header */}
                  <div className={`p-4 border-b text-[10px] space-y-1.5 ${isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200/50'}`}>
                    <div className="flex justify-between items-center text-neutral-400 font-extrabold uppercase tracking-widest text-[8.5px] mb-1">
                      <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-accent" /> Rendu visuel</span>
                      <span className="text-[8px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">Aperçu final</span>
                    </div>
                    <div><span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">De :</span> conciergerie@hakavod97.com</div>
                    <div>
                      <span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Objet :</span>{' '}
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">
                        {previewCampaign.subject || getTemplateSubject(previewCampaign.notification_template_id || previewCampaign.template_id)}
                      </span>
                    </div>
                  </div>
                  {/* HTML content inside scrollbox */}
                  <div className="p-5 bg-white overflow-y-auto max-h-80 border-none flex-1">
                    <div className="text-neutral-900 font-medium text-xs break-words" dangerouslySetInnerHTML={{ __html: previewCampaignHtmlContent }} />
                  </div>
                </div>
              ) : (
                <div className={`flex-1 border border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center min-h-[250px] ${
                  isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-300/80 text-neutral-400'
                }`}>
                  <FileCode className="w-8 h-8 mb-2.5 text-neutral-300" />
                  <span className="font-bold uppercase tracking-wider text-[9px] mb-1">Aucun rendu généré</span>
                </div>
              )}
            </div>

          </div>
        )}

        <div className={`flex gap-3 justify-end pt-5 border-t mt-4 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
          <button
            type="button"
            onClick={() => setIsPreviewModalOpen(false)}
            className="bg-primary hover:bg-neutral-850 text-white font-extrabold uppercase tracking-wider py-2.5 px-6 text-[10px] rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Fermer
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationCampaigns;
