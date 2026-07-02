import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import customerService from '../../services/api/customerService';
import { useFavorites } from '../../hooks/useFavorites';
import { useCart } from '../../hooks/useCart';
import { User, MapPin, ShoppingBag, Heart, LogOut, Loader2, Save, ShoppingCart, Trash2, ShieldCheck, Compass, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp, FileText, Check, Globe, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import QuickAddModal from '../../components/product/QuickAddModal';
import geoService from '../../services/api/geoService';
import { useGoogleLogin } from '@react-oauth/google';
import { useFacebookLogin } from '../../hooks/useFacebookLogin';
import heroImg from '../../assets/hero.png';

const CONTENT = {
  fr: {
    greeting_morning: "Bonjour",
    greeting_afternoon: "Bon après-midi",
    greeting_evening: "Bonsoir",
    status_pending: "En attente",
    status_confirmed: "Confirmée",
    status_preparing: "En préparation",
    status_shipped: "Expédiée",
    status_delivered: "Livrée",
    status_cancelled: "Annulée",
    my_account: "Mon Compte",
    login_desc: "Accédez à votre espace privé pour suivre vos commandes et gérer vos informations personnelles.",
    email_address: "Adresse e-mail",
    password: "Mot de passe",
    forgot_password_q: "Mot de passe oublié ?",
    login_btn: "Se connecter",
    logout_btn: "Se déconnecter",
    send_link: "Envoyer le lien",
    back_to_login: "Retour à la connexion",
    member_privileges: "Privilèges Membre",
    custom_tracking: "Suivi sur-mesure",
    custom_tracking_desc: "Consultez l'historique de vos créations et suivez leur expédition en temps réel.",
    wishlist: "Liste d'envies",
    wishlist_desc: "Sauvegardez vos coups de cœur pour les retrouver lors de votre prochaine visite.",
    easy_payment: "Paiement facilité",
    easy_payment_desc: "Gérez vos adresses de livraison pour un passage en caisse rapide et sécurisé.",
    privileged_member: "Membre Privilégié",
    contact_concierge: "Contacter la Conciergerie",
    dashboard: "Tableau de Bord",
    dashboard_desc: "Résumé global de vos interactions et activités.",
    last_order: "Dernière commande",
    none: "Aucune",
    no_active_order: "Pas de commande active",
    delivery_address: "Adresse de livraison",
    not_configured: "Non configurée",
    configure_address: "Configurez une adresse",
    creation: "Création",
    creations: "Créations",
    view_favorites: "Voir mes coups de cœur →",
    recent_orders: "Commandes Récentes",
    see_all: "Tout voir",
    no_recent_orders: "Aucune commande récente à afficher.",
    discover_collections: "Découvrir nos collections",
    track_arrow: "Suivre →",
    profile_security: "Profil & Sécurité",
    profile_security_desc: "Gérez vos informations personnelles et vos paramètres de connexion.",
    personal_info: "Informations Personnelles",
    full_name: "Nom complet",
    email_non_modifiable: "Adresse E-mail (Non modifiable)",
    phone: "Téléphone",
    not_provided: "Non renseigné",
    save_changes: "Enregistrer les modifications",
    account_security: "Sécurité du compte",
    current_password: "Mot de passe actuel",
    new_password: "Nouveau mot de passe",
    confirm_new_password: "Confirmer le nouveau mot de passe",
    update_password: "Mettre à jour le mot de passe",
    order_history: "Historique des Commandes",
    order_history_desc: "Consultez et suivez vos achats exclusifs HA-KAVOD.",
    no_orders_recorded: "Aucune commande enregistrée pour le moment.",
    discover_catalog: "Découvrir le catalogue →",
    already_delivered: "Déjà livré",
    track_package: "Suivre le colis",
    validated: "Validée",
    preparing_timeline: "Préparation",
    shipped_timeline: "Expédiée",
    delivered_timeline: "Livrée",
    total_amount: "Montant Total",
    shipping_service: "Service d'Expédition",
    shipping_service_desc: "Chaque création HA-KAVOD est soigneusement inspectée, scellée individuellement à la cire et remise en main propre par notre réseau logistique privé.",
    luxury_packaging: "Emballage sécurisé de luxe",
    signature_required: "Signature requise à la remise",
    full_insurance: "Assurance intégrale incluse",
    my_addresses: "Mes Adresses",
    my_addresses_desc: "Gérez vos adresses de facturation et de livraison.",
    no_addresses_recorded: "Aucune adresse enregistrée pour le moment.",
    address_label: "Adresse",
    default: "Défaut",
    recipient: "Destinataire",
    set_as_default: "Définir par défaut",
    delete_address_title: "Supprimer cette adresse",
    new_address: "Nouvelle Adresse",
    recipient_name: "Nom du destinataire",
    address_label_field: "Libellé (ex: Maison, Bureau)",
    optional_label_placeholder: "Optionnel (ex: Maison, Bureau)",
    full_address: "Adresse complète",
    address_placeholder: "Numéro, rue, appartement...",
    city: "Ville",
    postal_code: "Code postal",
    optional: "Optionnel",
    country: "Pays",
    save_address: "Enregistrer l'adresse",
    my_wishlist: "Ma Liste d'Envies",
    my_wishlist_desc: "Retrouvez les créations que vous avez enregistrées.",
    wishlist_empty: "Votre liste de favoris est vide.",
    add_to_cart_btn: "Ajouter au panier",
    remove_btn: "Retirer",
    login_success: "Connexion réussie. Bienvenue dans votre espace.",
    invalid_credentials: "Identifiants incorrects.",
    profile_update_success: "Votre profil a été mis à jour avec succès.",
    profile_update_error: "Erreur lors de la mise à jour.",
    address_add_success: "Nouvelle adresse ajoutée avec succès.",
    address_add_error: "Erreur lors de l'ajout de l'adresse.",
    validation_error: "Erreur de validation: ",
    default_address_success: "Adresse par défaut mise à jour avec succès.",
    default_address_error: "Erreur lors de la configuration de l'adresse par défaut.",
    address_delete_success: "Adresse supprimée avec succès.",
    address_delete_error: "Erreur lors de la suppression de l'adresse.",
    forgot_password_success: "Si un compte existe avec cet e-mail, un lien de réinitialisation vous a été envoyé.",
    forgot_password_error: "Erreur lors de la demande.",
    passwords_mismatch: "Les mots de passe ne correspondent pas.",
    password_change_success: "Mot de passe modifié avec succès.",
    password_change_error: "Erreur lors du changement de mot de passe.",
    sidebar_overview: "Vue d'ensemble",
    sidebar_profile: "Mon Profil",
    sidebar_orders: "Mes Commandes",
    sidebar_addresses: "Mes Adresses",
    sidebar_favorites: "Mes Favoris",
    privileged_member_tag: "Membre Privilégié",
    default_address_label: "Adresse"
  },
  en: {
    greeting_morning: "Good morning",
    greeting_afternoon: "Good afternoon",
    greeting_evening: "Good evening",
    status_pending: "Pending",
    status_confirmed: "Confirmed",
    status_preparing: "Preparing",
    status_shipped: "Shipped",
    status_delivered: "Delivered",
    status_cancelled: "Cancelled",
    my_account: "My Account",
    login_desc: "Access your private area to track your orders and manage your personal information.",
    email_address: "Email address",
    password: "Password",
    forgot_password_q: "Forgot password?",
    login_btn: "Sign In",
    logout_btn: "Sign Out",
    send_link: "Send link",
    back_to_login: "Back to login",
    member_privileges: "Member Privileges",
    custom_tracking: "Custom Tracking",
    custom_tracking_desc: "View the history of your creations and track their shipment in real-time.",
    wishlist: "Wishlist",
    wishlist_desc: "Save your favorites to find them during your next visit.",
    easy_payment: "Easy Payment",
    easy_payment_desc: "Manage your shipping addresses for a quick and secure checkout.",
    privileged_member: "Privileged Member",
    contact_concierge: "Contact Concierge",
    dashboard: "Dashboard",
    dashboard_desc: "Overall summary of your interactions and activities.",
    last_order: "Last order",
    none: "None",
    no_active_order: "No active order",
    delivery_address: "Delivery address",
    not_configured: "Not configured",
    configure_address: "Configure an address",
    creation: "Creation",
    creations: "Creations",
    view_favorites: "View my favorites →",
    recent_orders: "Recent Orders",
    see_all: "See all",
    no_recent_orders: "No recent orders to display.",
    discover_collections: "Discover our collections",
    track_arrow: "Track →",
    profile_security: "Profile & Security",
    profile_security_desc: "Manage your personal information and login settings.",
    personal_info: "Personal Information",
    full_name: "Full name",
    email_non_modifiable: "Email Address (Non-modifiable)",
    phone: "Phone",
    not_provided: "Not provided",
    save_changes: "Save changes",
    account_security: "Account Security",
    current_password: "Current password",
    new_password: "New password",
    confirm_new_password: "Confirm new password",
    update_password: "Update password",
    order_history: "Order History",
    order_history_desc: "View and track your exclusive HA-KAVOD purchases.",
    no_orders_recorded: "No orders recorded yet.",
    discover_catalog: "Discover the catalog →",
    already_delivered: "Already delivered",
    track_package: "Track package",
    validated: "Validated",
    preparing_timeline: "Preparing",
    shipped_timeline: "Shipped",
    delivered_timeline: "Delivered",
    total_amount: "Total Amount",
    shipping_service: "Shipping Service",
    shipping_service_desc: "Each HA-KAVOD creation is carefully inspected, individually wax-sealed, and hand-delivered by our private logistics network.",
    luxury_packaging: "Luxury secure packaging",
    signature_required: "Signature required upon delivery",
    full_insurance: "Full insurance included",
    my_addresses: "My Addresses",
    my_addresses_desc: "Manage your billing and shipping addresses.",
    no_addresses_recorded: "No addresses recorded yet.",
    address_label: "Address",
    default: "Default",
    recipient: "Recipient",
    set_as_default: "Set as default",
    delete_address_title: "Delete this address",
    new_address: "New Address",
    recipient_name: "Recipient name",
    address_label_field: "Label (e.g. Home, Office)",
    optional_label_placeholder: "Optional (e.g. Home, Office)",
    full_address: "Full address",
    address_placeholder: "Number, street, apartment...",
    city: "City",
    postal_code: "Postal code",
    optional: "Optional",
    country: "Country",
    save_address: "Save Address",
    my_wishlist: "My Wishlist",
    my_wishlist_desc: "Find the creations you have saved.",
    wishlist_empty: "Your wishlist is empty.",
    add_to_cart_btn: "Add to Cart",
    remove_btn: "Remove",
    login_success: "Sign in successful. Welcome to your area.",
    invalid_credentials: "Incorrect credentials.",
    profile_update_success: "Your profile has been successfully updated.",
    profile_update_error: "Error updating profile.",
    address_add_success: "New address successfully added.",
    address_add_error: "Error adding address.",
    validation_error: "Validation error: ",
    default_address_success: "Default address successfully updated.",
    default_address_error: "Error setting default address.",
    address_delete_success: "Address successfully deleted.",
    address_delete_error: "Error deleting address.",
    forgot_password_success: "If an account exists with this email, a reset link has been sent to you.",
    forgot_password_error: "Error processing request.",
    passwords_mismatch: "Passwords do not match.",
    password_change_success: "Password successfully changed.",
    password_change_error: "Error changing password.",
    sidebar_overview: "Overview",
    sidebar_profile: "My Profile",
    sidebar_orders: "My Orders",
    sidebar_addresses: "My Addresses",
    sidebar_favorites: "My Favorites",
    privileged_member_tag: "Privileged Member",
    default_address_label: "Address"
  }
};

const getGreeting = (c) => {
  const hour = new Date().getHours();
  if (hour < 12) return c.greeting_morning;
  if (hour < 18) return c.greeting_afternoon;
  return c.greeting_evening;
};

const Account = () => {
  const { 
    customerUser, 
    isAuthenticated, 
    isLoading, 
    customerLogin, 
    customerLogout, 
    customerChangePassword, 
    customerForgotPassword,
    customerRegister,
    customerRegisterPhone,
    customerLoginPhone,
    customerVerifyOtp,
    customerLoginGoogle,
    customerLoginFacebook
  } = useCustomerAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { activeLocale } = useSettings();

  const { login: facebookLogin } = useFacebookLogin({
    appId: import.meta.env.VITE_FACEBOOK_APP_ID
  });

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoginLoading(true);
      setError('');
      setSuccess('');
      try {
        await customerLoginGoogle(tokenResponse.access_token, registerCountry);
        setSuccess(locale === 'en' ? "Connected with Google!" : "Connecté avec Google !");
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.message || "Google Login Failed");
      } finally {
        setLoginLoading(false);
      }
    },
    onError: () => {
      setError("Google Login Failed");
    }
  });

  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];

  const translateStatus = (status) => {
    const mapping = {
      pending: c.status_pending,
      confirmed: c.status_confirmed,
      preparing: c.status_preparing,
      shipped: c.status_shipped,
      delivered: c.status_delivered,
      cancelled: c.status_cancelled
    };
    return mapping[status] || status;
  };

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'profile' | 'orders' | 'addresses' | 'favorites'
  const [addresses, setAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [activeQuickAddProduct, setActiveQuickAddProduct] = useState(null);

  // États pour la connexion / inscription pro

  const [authMode, setAuthMode] = useState('login');
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'phone'
  const [registerMethod, setRegisterMethod] = useState('email'); // 'email' | 'phone'

  // États d'inscription par e-mail / téléphone
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerCountry, setRegisterCountry] = useState('CI');

  // États OTP pour l'inscription par téléphone
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleAddProduct = (item) => {
    const hasOptions = (item.sizes?.length > 1) || (item.colors?.length > 1);
    if (hasOptions) {
      setActiveQuickAddProduct(item);
    } else {
      const firstVariant = item.variants?.[0];
      addToCart(item, 1, item.sizes?.[0] || 'M', item.colors?.[0]?.name || 'Noir', firstVariant?.id || null);
    }
  };
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [downloadingInvoiceRef, setDownloadingInvoiceRef] = useState(null);

  const toggleOrderExpand = (ref) => {
    setExpandedOrders(prev => ({ ...prev, [ref]: !prev[ref] }));
  };

  const getInvoiceHtml = (order, logoBase64) => {
    const statusLabel = translateStatus(order.status).toUpperCase();
    let statusColor = '#6B1A1A';
    let statusBg = '#f9f0f0';
    if (order.status === 'delivered') { statusColor = '#2d7a5a'; statusBg = '#eaf7f0'; }
    else if (order.status === 'cancelled') { statusColor = '#b94040'; statusBg = '#fdf0f0'; }

    const formatPrice = (price) => `${price?.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR')} XOF`;

    return `
<div style="font-family: 'Inter', sans-serif; background: #fff; color: #1a1a1a; font-size: 13px; line-height: 1.55; padding: 40px 45px; max-width: 680px; margin: 0 auto; box-sizing: border-box;">
  <style>
    * { box-sizing: border-box; }
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 1px solid #e8e0d0; margin-bottom: 28px; }
    .inv-brand { display: flex; align-items: center; gap: 14px; }
    .inv-logo { width: 44px; height: 44px; background: #6B1A1A; border: 2px double #C5A059; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Georgia', serif; font-size: 14px; font-weight: 700; color: #C5A059; letter-spacing: 0.5px; box-sizing: border-box; flex-shrink: 0; }
    .inv-brand-text h1 { font-size: 16px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #6B1A1A; margin: 0; }
    .inv-brand-text p { font-size: 9px; font-weight: 500; letter-spacing: 2px; text-transform: uppercase; color: #C5A059; margin: 2px 0 0 0; }
    .inv-meta { text-align: right; }
    .inv-meta .inv-title { font-size: 22px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6B1A1A; }
    .inv-meta .inv-ref { font-size: 11px; color: #555; margin-top: 4px; }
    .inv-meta .inv-date { font-size: 10px; color: #888; margin-top: 2px; }
    .inv-addresses { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 28px; }
    .inv-addr-block { flex: 1; min-width: 0; }
    .inv-addr-block .inv-block-title { font-size: 8.5px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #C5A059; border-bottom: 1px solid #e8e0d0; padding-bottom: 4px; margin-bottom: 10px; }
    .inv-addr-block .inv-name { font-size: 13px; font-weight: 600; color: #111; margin-bottom: 4px; }
    .inv-addr-block .inv-info { font-size: 11.5px; color: #555; margin-bottom: 2px; }
    .inv-pay-row { display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; margin-bottom: 4px; }
    .inv-pay-row .inv-key { color: #777; }
    .inv-pay-row .inv-val { font-weight: 600; color: #1a1a1a; }
    .inv-badge { display: inline-block; padding: 2px 8px; font-size: 8px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${statusColor}; background: ${statusBg}; border: 1px solid ${statusColor}40; }
    .inv-table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    .inv-table thead tr { background: #6B1A1A; }
    .inv-table th { padding: 8px 12px; text-align: left; font-size: 8.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #fff; }
    .inv-table th.right { text-align: right; }
    .inv-table th.center { text-align: center; }
    .inv-table tbody tr:nth-child(even) { background: #faf8f5; }
    .inv-table td { padding: 10px 12px; font-size: 11.5px; color: #333; border-bottom: 1px solid #f0ebe2; }
    .inv-table td.right { text-align: right; white-space: nowrap; }
    .inv-table td.center { text-align: center; }
    .inv-table td .inv-prod-name { font-weight: 600; color: #1a1a1a; }
    .inv-totals-wrap { display: flex; justify-content: flex-end; margin-bottom: 36px; }
    .inv-totals-block { width: 240px; border: 1px solid #e8e0d0; }
    .inv-totals-row { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 11.5px; border-bottom: 1px solid #f0ebe2; }
    .inv-totals-row .inv-key { color: #666; }
    .inv-totals-row .inv-val { font-weight: 600; color: #1a1a1a; }
    .inv-totals-row.grand { background: #6B1A1A; border-bottom: none; }
    .inv-totals-row.grand .inv-key, .inv-totals-row.grand .inv-val { color: #fff; font-size: 12.5px; font-weight: 700; }
    .inv-footer { border-top: 1px solid #e8e0d0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; }
    .inv-footer .inv-thank-you { font-size: 10.5px; color: #777; }
    .inv-footer .inv-thank-you strong { color: #6B1A1A; }
    .inv-footer .inv-brand-small { font-size: 8px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #C5A059; }
  </style>
  <div class="inv-header">
    <div class="inv-brand">
      ${logoBase64 ? `
        <img src="${logoBase64}" alt="HA-KAVOD 97" style="height: 50px; width: auto; object-fit: contain; flex-shrink: 0;" />
      ` : `
        <div class="inv-logo">HK</div>
        <div class="inv-brand-text">
          <h1>HA‑KAVOD 97</h1>
          <p>By EA — Maison de Mode</p>
        </div>
      `}
    </div>
    <div class="inv-meta">
      <div class="inv-title">Facture</div>
      <div class="inv-ref">Réf : <strong>${order.reference}</strong></div>
      <div class="inv-date">Date : ${new Date(order.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
  </div>

  <div class="inv-addresses">
    <div class="inv-addr-block">
      <div class="inv-block-title">Facturé à</div>
      <div class="inv-name">${order.customer_name || customerUser?.name || 'Client'}</div>
      <div class="inv-info">${order.customer_phone || customerUser?.phone || ''}</div>
      <div class="inv-info">${order.customer_email || customerUser?.email || ''}</div>
      <div class="inv-info" style="margin-top:6px;">${order.shipping_address || '—'}</div>
    </div>
    <div class="inv-addr-block">
      <div class="inv-block-title">Détails du Paiement</div>
      <div class="inv-pay-row"><span class="inv-key">Méthode</span><span class="inv-val">${order.payment_method || 'Paiement sécurisé'}</span></div>
      <div class="inv-pay-row"><span class="inv-key">Statut paiement</span><span class="inv-val" style="color:#2d7a5a">✓ Réussi</span></div>
      <div class="inv-pay-row"><span class="inv-key">Transaction</span><span class="inv-val" style="font-family:monospace;font-size:10px;">TXN-${order.id || order.reference}</span></div>
      <div class="inv-pay-row" style="margin-top:6px;"><span class="inv-key">Livraison</span><span class="inv-badge">${statusLabel}</span></div>
    </div>
  </div>

  <table class="inv-table">
    <thead>
      <tr>
        <th style="width: 40%;">Article</th>
        <th style="width: 12%;">Taille</th>
        <th style="width: 13%;">Couleur</th>
        <th class="center" style="width: 8%;">Qté</th>
        <th class="right" style="width: 13%;">Prix Unit.</th>
        <th class="right" style="width: 14%;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${(order.items || []).map(item => {
        const itemName = item.name || 'Article';
        const itemPrice = Number(item.price ?? 0);
        const itemQuantity = Number(item.quantity ?? 1);
        
        let itemColor = item.color || '—';
        let itemSize = item.size || '—';
        
        return `
        <tr>
          <td><span class="inv-prod-name">${itemName}</span></td>
          <td>${itemSize}</td>
          <td>${itemColor}</td>
          <td class="center">${itemQuantity}</td>
          <td class="right">${formatPrice(itemPrice)}</td>
          <td class="right">${formatPrice(itemPrice * itemQuantity)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>

  <div class="inv-totals-wrap">
    <div class="inv-totals-block">
      <div class="inv-totals-row">
        <span class="inv-key">Sous-total</span>
        <span class="inv-val">
          ${formatPrice(
            order.subtotal !== undefined && order.subtotal !== null
              ? Number(order.subtotal)
              : (Number(order.total ?? 0) - Number(order.shipping_cost ?? 0))
          )}
        </span>
      </div>
      <div class="inv-totals-row">
        <span class="inv-key">Frais de livraison</span>
        <span class="inv-val">
          ${Number(order.shipping_cost ?? 0) === 0 ? 'Gratuit' : formatPrice(Number(order.shipping_cost ?? 0))}
        </span>
      </div>
      <div class="inv-totals-row grand">
        <span class="inv-key">Total Facturé</span>
        <span class="inv-val">${formatPrice(order.total ?? 0)}</span>
      </div>
    </div>
  </div>

  <div class="inv-footer">
    <p class="inv-thank-you">Merci pour votre confiance — <strong>HA‑KAVOD 97</strong></p>
    <span class="inv-brand-small">By EA • Maison de Mode</span>
  </div>
</div>`;
  };

  const handlePrintInvoice = (order) => {
    if (downloadingInvoiceRef) return;
    setDownloadingInvoiceRef(order.reference);

    const loadScript = () => {
      return new Promise((resolve) => {
        if (window.html2pdf) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    const getLogoBase64 = async () => {
      try {
        const response = await fetch('/logo.png');
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        console.error("Erreur de conversion du logo en Base64", err);
        return null;
      }
    };

    Promise.all([loadScript(), getLogoBase64()]).then(([, logoBase64]) => {
      const wrapper = document.createElement('div');
      wrapper.style.position = 'fixed';
      wrapper.style.top = '0';
      wrapper.style.left = '0';
      wrapper.style.width = '730px';
      wrapper.style.height = 'auto';
      wrapper.style.overflow = 'hidden';
      wrapper.style.zIndex = '-9999';
      wrapper.style.pointerEvents = 'none';

      const element = document.createElement('div');
      element.style.position = 'relative';
      element.style.width = '680px';
      element.style.background = 'white';
      element.innerHTML = getInvoiceHtml(order, logoBase64);

      wrapper.appendChild(element);
      document.body.appendChild(wrapper);

      const opt = {
        margin:       [15, 15, 15, 15],
        filename:     `facture-${order.reference}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2.2, useCORS: true, logging: false, scrollY: 0, scrollX: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      setTimeout(() => {
        window.html2pdf()
          .from(element)
          .set(opt)
          .save()
          .then(() => {
            document.body.removeChild(wrapper);
            setDownloadingInvoiceRef(null);
          })
          .catch((err) => {
            console.error("Erreur de génération PDF", err);
            document.body.removeChild(wrapper);
            setDownloadingInvoiceRef(null);
          });
      }, 300);
    });
  };

  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCountry, setOtpCountry] = useState('CI');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Profile update state
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  // New Address form state
  const [newAddress, setNewAddress] = useState({
    customer_name: '',
    customer_phone: '',
    address: '',
    label: ''
  });
  const [deliveryCountry, setDeliveryCountry] = useState('CI');
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [communes, setCommunes] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [addressLoading, setAddressLoading] = useState(false);

  // Charger les régions uniquement à l'ouverture de la modale
  useEffect(() => {
    if (!isAddressModalOpen) return;
    if (regions.length > 0) return; // déjà chargées
    const loadRegions = async () => {
      try {
        const res = await geoService.getRegions();
        setRegions(Array.isArray(res) ? res : (res?.data || []));
      } catch (err) {
        console.error("Erreur chargement regions", err);
      }
    };
    loadRegions();
  }, [isAddressModalOpen]);

  // Charger les communes lorsque la région change
  useEffect(() => {
    if (!selectedRegion) {
      setCommunes([]);
      setSelectedCommune('');
      return;
    }
    const loadCommunes = async () => {
      try {
        const res = await geoService.getCommunes(selectedRegion);
        setCommunes(Array.isArray(res) ? res : (res?.data || []));
        setSelectedCommune('');
      } catch (err) {
        console.error("Erreur chargement communes", err);
      }
    };
    loadCommunes();
  }, [selectedRegion]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Sync profile details
  useEffect(() => {
    if (customerUser) {
      setProfileName(customerUser.name || '');
      setProfilePhone(customerUser.phone || '');
      setNewAddress(prev => ({
        ...prev,
        customer_name: prev.customer_name || customerUser.name || '',
        customer_phone: prev.customer_phone || customerUser.phone || ''
      }));
    }
  }, [customerUser]);

  // Load addresses & orders if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const loadData = async () => {
        try {
          const addrs = await customerService.getAddresses();
          const resolvedAddrs = Array.isArray(addrs) ? addrs : (addrs?.data || addrs || []);
          setAddresses(resolvedAddrs);
        } catch (e) {
          console.error("Erreur chargement adresses", e);
        }

        try {
          const apiOrders = await customerService.getOrders();
          const resolvedOrders = Array.isArray(apiOrders) ? apiOrders : (apiOrders?.data || apiOrders || []);
          setOrders(resolvedOrders);
          if (resolvedOrders.length > 0) {
            setExpandedOrders({ [resolvedOrders[0].reference]: true });
          }
        } catch (e) {
          console.error("Erreur chargement commandes", e);
        }
      };
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    setSuccess('');
    try {
      if (loginMethod === 'email') {
        await customerLogin(loginEmail, loginPassword);
      } else {
        await customerLoginPhone(loginPhone, loginPassword, registerCountry);
        // Après connexion par téléphone, on charge le profil pour mettre à jour l'utilisateur connecté
        const profile = await customerService.getProfile();
        localStorage.setItem('customer_user', JSON.stringify(profile));
        window.dispatchEvent(new Event('customer-login-success'));
        // Forcer le rechargement local de l'utilisateur
        window.location.reload();
      }
      setSuccess(c.login_success || (locale === 'en' ? "Successfully logged in!" : "Connexion réussie !"));
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || c.invalid_credentials);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    setSuccess('');
    try {
      if (registerMethod === 'email') {
        await customerRegister(registerName, registerEmail, registerPassword, registerCountry);
        setSuccess(locale === 'en' ? "Registration successful!" : "Inscription réussie !");
      } else {
        await customerRegisterPhone(registerPhone, registerName, registerCountry);
        setOtpPhone(registerPhone);
        setOtpCountry(registerCountry);
        setOtpStep(true);
        setSuccess(locale === 'en' ? "OTP code sent by SMS!" : "Code OTP envoyé par SMS !");
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || (locale === 'en' ? "Registration failed." : "Échec de l'inscription."));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setError('');
    setSuccess('');
    try {
      await customerVerifyOtp(otpPhone, otpCode, registerPassword, otpCountry);
      setSuccess(locale === 'en' ? "Account verified and connected!" : "Compte vérifié et connecté !");
      setTimeout(() => {
        setSuccess('');
        setOtpStep(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || (locale === 'en' ? "Invalid OTP code." : "Code OTP invalide."));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSocialGoogle = () => {
    googleLogin();
  };

  const handleSocialFacebook = () => {
    facebookLogin({
      onResolve: async (response) => {
        setLoginLoading(true);
        setError('');
        setSuccess('');
        try {
          await customerLoginFacebook(response.accessToken, registerCountry);
          setSuccess(locale === 'en' ? "Connected with Facebook!" : "Connecté avec Facebook !");
          setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
          setError(err.message || "Facebook Login Failed");
        } finally {
          setLoginLoading(false);
        }
      },
      onReject: (err) => {
        setError(err.message || "Facebook Login Failed");
      }
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedUser = { name: profileName, phone: profilePhone };
      await customerService.updateProfile(updatedUser);
      // Mettre à jour le contexte (on pourrait relancer getProfile mais on peut simuler)
      localStorage.setItem('customer_user', JSON.stringify({ ...customerUser, ...updatedUser }));
      setSuccess(c.profile_update_success);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.message || c.profile_update_error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.address.trim()) return;
    setAddressLoading(true);
    setError('');
    try {
      const activeRegionObj = regions.find(r => String(r.id) === String(selectedRegion));
      const activeCommuneObj = communes.find(c => String(c.id) === String(selectedCommune));
      const regionName = activeRegionObj ? activeRegionObj.name : '';
      const communeName = activeCommuneObj ? activeCommuneObj.name : '';

      if (deliveryCountry === 'CI' && (!selectedRegion || !selectedCommune)) {
        setError(locale === 'en' ? 'Please select a region and commune.' : 'Veuillez sélectionner une région et une commune.');
        setAddressLoading(false);
        return;
      }

      const newAddrObj = { 
        customer_name: newAddress.customer_name || customerUser?.name || 'Client',
        customer_phone: newAddress.customer_phone || customerUser?.phone || '',
        shipping_address: newAddress.address.trim(),
        country: deliveryCountry,
        region: deliveryCountry === 'CI' ? regionName : '',
        commune: deliveryCountry === 'CI' ? communeName : '',
        commune_id: deliveryCountry === 'CI' ? (selectedCommune ? Number(selectedCommune) : null) : null,
        label: newAddress.label || c.default_address_label,
        is_default: addresses.length === 0
      };

      await customerService.addAddress(newAddrObj);
      const addrs = await customerService.getAddresses();
      setAddresses(Array.isArray(addrs) ? addrs : (addrs?.data || addrs || []));
      setNewAddress({ 
        customer_name: customerUser?.name || '', 
        customer_phone: customerUser?.phone || '', 
        address: '', 
        label: ''
      });
      setDeliveryCountry('CI');
      setSelectedRegion('');
      setSelectedCommune('');
      setIsAddressModalOpen(false);
      setSuccess(c.address_add_success);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || c.address_add_error;
      const validationDetails = err.response?.data?.errors 
        ? Object.values(err.response.data.errors).flat().join(', ')
        : '';
      setError(validationDetails ? `${c.validation_error}${validationDetails}` : errMsg);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    setAddressLoading(true);
    setError('');
    try {
      await customerService.setDefaultAddress(addressId);
      const addrs = await customerService.getAddresses();
      setAddresses(Array.isArray(addrs) ? addrs : (addrs?.data || addrs || []));
      setSuccess(c.default_address_success);
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || c.default_address_error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await customerService.deleteAddress(addressId);
      const addrs = await customerService.getAddresses();
      setAddresses(Array.isArray(addrs) ? addrs : (addrs?.data || addrs || []));
      setSuccess(c.address_delete_success);
      setTimeout(() => setSuccess(''), 3500);
    } catch {
      setError(c.address_delete_error);
    }
  };

  const handleForgotPassword = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      await customerForgotPassword(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || c.forgot_password_error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(c.passwords_mismatch);
      return;
    }
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    try {
      await customerChangePassword(currentPassword, newPassword, confirmPassword);
      setSuccess(c.password_change_success);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || c.password_change_error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogoutClick = () => {
    customerLogout();
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className={`w-full min-h-screen bg-neutral-50 text-neutral-900 ${isAuthenticated ? "pt-24 md:pt-32 pb-24" : "pt-[104px] pb-0"} font-sans animate-fade-in`}>
        {!isAuthenticated ? (
          /* ── NOT AUTHENTICATED: Split Layout for well-occupied space ── */
          <div className="min-h-[calc(100vh-104px)] flex flex-col md:flex-row w-full bg-white shadow-2xl">
            {/* LEFT SIDE: Luxury Image Banner */}
            <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-neutral-900 group">
              <img 
                src={heroImg} 
                alt="Maison Hakavod" 
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24 text-white">
                <h2 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-[0.2em] mb-4 drop-shadow-lg">
                  Maison<br/>Ha-Kavod 97
                </h2>
                <div className="w-12 h-1 bg-primary mb-6"></div>
                <p className="text-sm lg:text-base tracking-widest font-light max-w-md leading-relaxed drop-shadow-md text-neutral-200">
                  {locale === 'en' 
                    ? 'Discover our exclusive collections and access your private space.' 
                    : 'Découvrez nos collections exclusives et accédez à votre espace privé.'}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE: Centered Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-neutral-50">
              <div className="w-full max-w-md animate-fade-in-up">
            {error && (
              <div className="bg-red-50 border-l-4 border-danger text-danger p-4 text-sm mb-6 font-medium rounded-none flex items-start gap-3 shadow-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border-l-4 border-emerald-500 text-emerald-700 p-4 text-sm mb-6 font-medium rounded-none flex items-start gap-3 shadow-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {showForgotPassword ? (
              /* ────── MOT DE PASSE OUBLIÉ ────── */
              <div className="bg-white p-8 md:p-12 rounded-none shadow-sm border border-neutral-200 animate-fade-in">
                {!forgotSent ? (
                  <form onSubmit={handleForgotPassword} className="text-left">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                      {locale === 'en' ? 'Forgot password?' : 'Mot de passe oublié ?'}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                      {locale === 'en'
                        ? 'Enter your e-mail address and we\'ll send you a link to reset your password.'
                        : 'Saisissez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.'}
                    </p>
                    <div className="flex flex-col gap-2 mb-6">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all placeholder-neutral-400 font-light focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loginLoading}
                      className="w-full bg-primary hover:bg-neutral-850 text-white py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Send reset link' : 'Envoyer le lien')}
                    </button>
                    <div className="text-center mt-6">
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(''); }}
                        className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer bg-transparent border-none inline-flex items-center gap-1.5"
                      >
                        {c.back_to_login}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center animate-fade-in flex flex-col items-center py-4">
                    <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                      {locale === 'en' ? 'Check your inbox' : 'Vérifiez votre boîte mail'}
                    </h2>
                    <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                      {locale === 'en'
                        ? <>We\'ve sent a reset link to <strong className="text-neutral-700 font-semibold">{forgotEmail}</strong>.</>  
                        : <>Nous avons envoyé un lien de réinitialisation à <strong className="text-neutral-700 font-semibold">{forgotEmail}</strong>.</>}
                    </p>
                    <div className="flex flex-col gap-3 w-full mt-4">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={loginLoading}
                        className="w-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none bg-white cursor-pointer flex items-center justify-center gap-2"
                      >
                        {loginLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                        {locale === 'en' ? 'Resend link' : 'Renvoyer le lien'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(false); setForgotSent(false); setError(''); setSuccess(''); }}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer"
                      >
                        {c.back_to_login}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : otpStep ? (
              /* ── OTP VERIFICATION SCREEN ── */
              <div className="bg-white p-8 md:p-12 rounded-none shadow-sm border border-neutral-200 animate-fade-in">
                <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
                  <h2 className="text-xl font-bold text-neutral-900 mb-4 uppercase tracking-wider">
                    {locale === 'en' ? 'Verification' : 'Vérification OTP'}
                  </h2>
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-none text-xs text-neutral-600 leading-relaxed font-light">
                    {locale === 'en' 
                      ? `We sent a validation OTP code to the number ${otpPhone}.` 
                      : `Un code OTP a été envoyé au numéro ${otpPhone}.`}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'OTP Code' : 'Code OTP'}</label>
                    <input
                      type="text"
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all text-center tracking-[0.5em] font-bold outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full py-3.5 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-neutral-900 rounded-none transition-all outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-primary hover:bg-neutral-850 text-white py-4 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-4 cursor-pointer"
                  >
                    {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Verify and Create Account' : 'Vérifier et créer le compte')}
                  </button>
                </form>
              </div>
            ) : (
              /* ── MAIN FORM CONTAINER ── */
              <div className="bg-white p-6 md:p-10 border border-neutral-200 rounded-none shadow-sm flex flex-col">
                
                {/* TABS SWITCHER */}
                <div className="flex gap-2 mb-8 border-b border-neutral-200 pb-4">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      authMode === 'login' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {locale === 'en' ? 'Sign In' : 'Connexion'}
                    {authMode === 'login' && (
                      <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900"></span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-all cursor-pointer relative ${
                      authMode === 'register' ? 'text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
                    }`}
                  >
                    {locale === 'en' ? 'Register' : 'Créer un compte'}
                    {authMode === 'register' && (
                      <span className="absolute bottom-[-17px] left-0 right-0 h-0.5 bg-neutral-900"></span>
                    )}
                  </button>
                </div>

                {authMode === 'login' ? (
                  /* --- LOGIN TAB --- */
                  <div className="animate-fade-in">
                    {/* Method Switcher Login */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setLoginMethod('email')}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border ${
                          loginMethod === 'email' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-transparent text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        E-mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setLoginMethod('phone')}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border ${
                          loginMethod === 'phone' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-transparent text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {locale === 'en' ? 'Phone' : 'Téléphone'}
                      </button>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-4">
                      {loginMethod === 'email' ? (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                          <input
                            type="email"
                            required
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            placeholder="nom@exemple.com"
                            className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Country' : 'Pays'}</label>
                            <select
                              value={registerCountry}
                              onChange={(e) => setRegisterCountry(e.target.value)}
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            >
                              <option value="CI">Côte d’Ivoire (+225)</option>
                              <option value="TG">Togo (+228)</option>
                              <option value="BJ">Bénin (+229)</option>
                              <option value="SN">Sénégal (+221)</option>
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}</label>
                            <input
                              type="tel"
                              required
                              value={loginPhone}
                              onChange={(e) => setLoginPhone(e.target.value)}
                              placeholder={registerCountry === 'TG' ? '90 00 00 00' : '07 00 00 00 00'}
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-[9px] font-bold uppercase tracking-wider text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer bg-transparent border-none p-0 underline underline-offset-2"
                          >
                            {c.forgot_password_q}
                          </button>
                        </div>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-6 cursor-pointer"
                      >
                        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (locale === 'en' ? 'Sign In' : 'Se connecter')}
                      </button>
                    </form>

                    {/* Social Logins Section */}
                    <div className="mt-8 space-y-4">
                      <div className="relative flex items-center">
                        <div className="flex-grow border-t border-neutral-200"></div>
                        <span className="flex-shrink mx-4 text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                          {locale === 'en' ? 'OR' : 'OU'}
                        </span>
                        <div className="flex-grow border-t border-neutral-200"></div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="button"
                          onClick={handleSocialGoogle}
                          className="flex items-center justify-center gap-3 py-3 border border-neutral-200 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer bg-white"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                          </svg>
                          {locale === 'en' ? 'Continue with Google' : 'Continuer avec Google'}
                        </button>
                        <button
                          type="button"
                          onClick={handleSocialFacebook}
                          className="flex items-center justify-center gap-3 py-3 border border-neutral-200 hover:bg-[#1877F2]/5 hover:border-[#1877F2] text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer bg-white"
                        >
                          <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          {locale === 'en' ? 'Continue with Facebook' : 'Continuer avec Facebook'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* --- REGISTER TAB --- */
                  <div className="animate-fade-in">
                    {/* Method Switcher Register */}
                    <div className="flex gap-2 mb-6">
                      <button
                        type="button"
                        onClick={() => setRegisterMethod('email')}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border ${
                          registerMethod === 'email' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        E-mail
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterMethod('phone')}
                        className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-none transition-all cursor-pointer border ${
                          registerMethod === 'phone' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {locale === 'en' ? 'Phone' : 'Téléphone'}
                      </button>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Full Name' : 'Nom Complet'}</label>
                        <input
                          type="text"
                          required
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Country' : 'Pays'}</label>
                        <select
                          value={registerCountry}
                          onChange={(e) => setRegisterCountry(e.target.value)}
                          className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                        >
                          <option value="CI">Côte d’Ivoire (+225)</option>
                          <option value="TG">Togo (+228)</option>
                          <option value="BJ">Bénin (+229)</option>
                          <option value="SN">Sénégal (+221)</option>
                        </select>
                      </div>

                      {registerMethod === 'email' ? (
                        <>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.email_address}</label>
                            <input
                              type="email"
                              required
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              placeholder="nom@exemple.com"
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.password}</label>
                            <input
                              type="password"
                              required
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              placeholder="••••••••"
                              className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{locale === 'en' ? 'Phone Number' : 'Numéro de Téléphone'}</label>
                          <input
                            type="tel"
                            required
                            value={registerPhone}
                            onChange={(e) => setRegisterPhone(e.target.value)}
                            placeholder={registerCountry === 'TG' ? '90 00 00 00' : '07 00 00 00 00'}
                            className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 rounded-none transition-all font-light outline-none"
                          />
                        </div>
                      )}

                      <div className="pt-2">
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" className="mt-1 accent-primary w-3 h-3" required />
                          <span className="text-[10px] text-neutral-500 leading-tight">
                            J'accepte les <a href="/privacy-policy" className="underline hover:text-neutral-800">Conditions d'Utilisation</a> et la <a href="/privacy-policy" className="underline hover:text-neutral-800">Politique de Confidentialité</a>.
                          </span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-bold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-4 cursor-pointer"
                      >
                        {loginLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (registerMethod === 'phone' ? (locale === 'en' ? 'Send OTP SMS' : 'Recevoir le code OTP') : (locale === 'en' ? 'Create Account' : 'Créer un compte'))}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            )}
              </div>
            </div>
          </div>
        ) : (
          /* ── AUTHENTICATED: Premium Luxury Dashboard ── */
          <div className="max-w-7xl mx-auto px-6">
            <div className="space-y-8">
            
            {/* Header Profil */}
            <div className="bg-white border border-neutral-200 p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-sm rounded-none">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-accent font-bold px-3 py-1.5 border border-accent/20 bg-accent/5 rounded-none">{c.privileged_member_tag}</span>
                </div>
                <h1 className="text-3xl font-extrabold uppercase tracking-[0.2em] text-neutral-900">{getGreeting(c)}, {customerUser?.name?.split(' ')[0] || 'Client'}</h1>
                <p className="text-xs text-neutral-500 font-light tracking-wider flex items-center gap-4">
                  <span>{customerUser?.email}</span>
                  {customerUser?.phone && (
                    <>
                      <span className="w-1 h-1 rounded-none bg-neutral-300"></span>
                      <span>{customerUser?.phone}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button
                  onClick={() => navigate('/services-de-conciergerie')}
                  className="w-full sm:w-auto border border-accent text-accent hover:bg-accent hover:text-white py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all cursor-pointer bg-white"
                >
                  {c.contact_concierge}
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full sm:w-auto border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 py-3.5 px-6 text-[10px] font-bold uppercase tracking-[0.2em] rounded-none transition-all flex items-center justify-center gap-2 cursor-pointer bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  {c.logout_btn}
                </button>
              </div>
            </div>

            {success && (
              <div className="bg-emerald-50 border-l-2 border-emerald-500 text-emerald-800 p-4 text-xs font-medium rounded-none animate-fade-in flex items-center gap-2.5 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-none bg-emerald-500"></span>
                <span>{success}</span>
              </div>
            )}

            {/* Grid for sidebar and main dashboard sections */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              
              {/* Sidebar tabs navigation */}
              <div className="flex flex-row overflow-x-auto lg:flex-col border border-neutral-200 bg-white p-6 lg:p-8 rounded-none h-fit gap-4 lg:gap-2 shadow-sm scrollbar-none snap-x snap-mandatory shrink-0 w-full lg:min-w-[280px]">
                <h3 className="hidden lg:block text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] mb-4 pb-4 border-b border-neutral-100">{c.personal_space || "Espace Personnel"}</h3>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeTab === 'dashboard' 
                      ? 'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'
                  }`}
                >
                  <Compass className={`w-4 h-4 transition-colors ${activeTab === 'dashboard' ? 'text-primary' : 'text-neutral-400'}`} />
                  {c.sidebar_overview}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeTab === 'profile' 
                      ? 'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'
                  }`}
                >
                  <User className={`w-4 h-4 transition-colors ${activeTab === 'profile' ? 'text-primary' : 'text-neutral-400'}`} />
                  {c.sidebar_profile}
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeTab === 'orders' 
                      ? 'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'
                  }`}
                >
                  <ShoppingBag className={`w-4 h-4 transition-colors ${activeTab === 'orders' ? 'text-primary' : 'text-neutral-400'}`} />
                  {c.sidebar_orders}
                  {orders.length > 0 && (
                    <span className={`ml-1.5 lg:ml-auto text-[9px] font-bold px-2 py-0.5 rounded-none border transition-colors ${
                      activeTab === 'orders'
                        ? 'bg-white/20 border-white/30 text-white'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    }`}>
                      {orders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeTab === 'addresses' 
                      ? 'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'
                  }`}
                >
                  <MapPin className={`w-4 h-4 transition-colors ${activeTab === 'addresses' ? 'text-primary' : 'text-neutral-400'}`} />
                  {c.sidebar_addresses}
                </button>

                <button
                  onClick={() => setActiveTab('favorites')}
                  className={`w-auto lg:w-full flex items-center gap-3 py-3 lg:py-4 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-all text-left rounded-none shrink-0 snap-start whitespace-nowrap border-b-2 lg:border-b-0 lg:border-l-2 ${
                    activeTab === 'favorites' 
                      ? 'border-primary text-neutral-900 lg:bg-transparent lg:border-l-primary font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 lg:border-l-transparent'
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-colors ${activeTab === 'favorites' ? 'text-primary' : 'text-neutral-400'}`} />
                  {c.sidebar_favorites}
                  {favorites.length > 0 && (
                    <span className={`ml-1.5 lg:ml-auto text-[9px] font-bold px-2 py-0.5 rounded-none transition-colors ${
                      activeTab === 'favorites'
                        ? 'bg-white text-primary border-transparent'
                        : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                    }`}>
                      {favorites.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Main Content Card */}
              <div className="lg:col-span-3 bg-white border border-neutral-200 p-4 md:p-8 rounded-none shadow-3xs min-h-[520px]">
                
                {/* 0. TAB: OVERVIEW DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">{c.dashboard}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">{c.dashboard_desc}</p>
                      <div className="w-full h-[1px] bg-neutral-150 mt-4"></div>
                    </div>

                    {/* Stats summary list */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div 
                        onClick={() => setActiveTab('orders')}
                        className="group border border-neutral-200 p-6 bg-white hover:border-neutral-900 hover:shadow-md transition-all duration-350 rounded-none cursor-pointer flex flex-col justify-between min-h-[160px] shadow-3xs"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-700 transition-colors">{c.last_order}</span>
                          <div className="w-8 h-8 rounded-none bg-neutral-50 group-hover:bg-neutral-100 flex items-center justify-center text-accent transition-colors">
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-black uppercase tracking-[0.1em] text-neutral-900 truncate">{orders.length > 0 ? orders[0].reference : c.none}</p>
                          <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-none bg-accent"></span>
                            <span>{orders.length > 0 ? translateStatus(orders[0].status) : c.no_active_order}</span>
                          </p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab('addresses')}
                        className="group border border-neutral-200 p-6 bg-white hover:border-neutral-900 hover:shadow-md transition-all duration-350 rounded-none cursor-pointer flex flex-col justify-between min-h-[160px] shadow-3xs"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-700 transition-colors">{c.delivery_address}</span>
                          <div className="w-8 h-8 rounded-none bg-neutral-50 group-hover:bg-neutral-100 flex items-center justify-center text-accent transition-colors">
                            <MapPin className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-900 truncate">{addresses.length > 0 ? (addresses[0].shipping_address || addresses[0].address) : c.not_configured}</p>
                          <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-none bg-neutral-300"></span>
                            <span>{addresses.length > 0 ? addresses[0].city : c.configure_address}</span>
                          </p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setActiveTab('favorites')}
                        className="group border border-neutral-200 p-6 bg-white hover:border-neutral-900 hover:shadow-md transition-all duration-350 rounded-none cursor-pointer flex flex-col justify-between min-h-[160px] shadow-3xs"
                      >
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 group-hover:text-neutral-700 transition-colors">{c.wishlist}</span>
                          <div className="w-8 h-8 rounded-none bg-neutral-50 group-hover:bg-neutral-100 flex items-center justify-center text-accent transition-colors">
                            <Heart className="w-4 h-4" />
                          </div>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm font-black uppercase tracking-[0.1em] text-neutral-900">{favorites.length} {favorites.length > 1 ? c.creations : c.creation}</p>
                          <p className="text-[10px] text-primary group-hover:underline font-semibold mt-1">
                            {c.view_favorites}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Active Tracking or Info card */}
                    <div className="border border-neutral-200 p-6 bg-neutral-50/30 space-y-6 rounded-none shadow-3xs">
                      <div className="flex justify-between items-center border-b border-neutral-250/60 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-none h-2 w-2 bg-accent"></span>
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">{c.recent_orders}</span>
                        </div>
                        <button onClick={() => setActiveTab('orders')} className="text-[10px] font-bold uppercase tracking-wider text-primary hover:text-accent transition-colors cursor-pointer bg-transparent border-none">
                          {c.see_all}
                        </button>
                      </div>
                      
                      {orders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {orders.slice(0, 2).map((order, idx) => (
                            <div key={idx} className="bg-white border border-neutral-200 p-4 flex gap-4 items-center shadow-2xs hover:shadow-xs transition-all rounded-none">
                              <div className="w-14 h-14 bg-neutral-50 shrink-0 border border-neutral-100 overflow-hidden rounded-none">
                                {order.items?.[0]?.image ? (
                                  <img src={order.items[0].image} alt="produit" className="w-full h-full object-cover" />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-neutral-300 m-auto mt-4.5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-neutral-900 truncate">{order.reference}</h4>
                                <p className="text-[10px] text-neutral-500 mt-0.5">{new Date(order.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR')}</p>
                                <div className="mt-2 flex items-center justify-between">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-accent bg-accent/5 border border-accent/20 px-2.5 py-0.5 rounded-none">{translateStatus(order.status)}</span>
                                  <button onClick={() => navigate(`/order-tracking/${order.reference}`)} className="text-[10px] font-semibold text-primary hover:text-accent transition-colors">{c.track_arrow}</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-xs text-neutral-500 font-light">{c.no_recent_orders}</p>
                          <button onClick={() => navigate('/catalog')} className="mt-4 bg-primary text-white py-2.5 px-6 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-neutral-800 rounded-none cursor-pointer shadow-md shadow-primary/5">
                            {c.discover_collections}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 1. TAB: PROFIL & SÉCURITÉ */}
                {activeTab === 'profile' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">{c.profile_security}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">{c.profile_security_desc}</p>
                      <div className="w-full h-[1px] bg-neutral-100 mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Section Infos Contact */}
                      <div className="space-y-6">
                        <div className="border-b border-neutral-150 pb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <User className="w-4 h-4 text-accent" />
                            {c.personal_info}
                          </h3>
                        </div>
                        
                        <form onSubmit={handleUpdateProfile} className="bg-white border border-neutral-200 p-8 space-y-5 rounded-none shadow-3xs">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.full_name}</label>
                            <input
                              type="text"
                              required
                              value={profileName}
                              onChange={(e) => setProfileName(e.target.value)}
                              className="w-full py-3 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-none transition-all placeholder-neutral-400 font-light"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{c.email_non_modifiable}</label>
                            <input
                              type="email"
                              value={customerUser?.email || ''}
                              disabled
                              className="w-full py-3 px-4 text-xs bg-neutral-100/50 border border-neutral-200 text-neutral-400 cursor-not-allowed rounded-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.phone}</label>
                            <input
                              type="tel"
                              value={profilePhone}
                              onChange={(e) => setProfilePhone(e.target.value)}
                              placeholder={c.not_provided}
                              className="w-full py-3 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-none transition-all placeholder-neutral-400 font-light"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-md shadow-primary/5"
                          >
                            {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : c.save_changes}
                          </button>
                        </form>
                      </div>

                      {/* Section Sécurité */}
                      <div className="space-y-6">
                        <div className="border-b border-neutral-150 pb-3">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-accent" />
                            {c.account_security}
                          </h3>
                        </div>

                        <div className="bg-white border border-neutral-200 p-8 rounded-none shadow-3xs">
                          {success && passwordLoading === false && (
                            <div className="bg-green-50 border border-emerald-250 text-emerald-700 p-4 text-xs mb-6 font-medium rounded-none flex items-start gap-3 shadow-2xs">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                              <span>{success}</span>
                            </div>
                          )}

                          <form onSubmit={handleChangePassword} className="space-y-5">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.current_password}</label>
                              <input
                                type="password"
                                required
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full py-3 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-none transition-all placeholder-neutral-400 font-light"
                                placeholder="••••••••"
                              />
                            </div>
                            
                            <div className="w-full h-[1px] bg-neutral-100 my-2"></div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.new_password}</label>
                              <input
                                type="password"
                                required
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full py-3 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-none transition-all placeholder-neutral-400 font-light"
                                placeholder="••••••••"
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{c.confirm_new_password}</label>
                              <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full py-3 px-4 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-none transition-all placeholder-neutral-400 font-light"
                                placeholder="••••••••"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={passwordLoading}
                              className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-none flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-md shadow-primary/5"
                            >
                              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : c.update_password}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB: MES COMMANDES (Double Column Timeline view) */}
                {activeTab === 'orders' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">{c.order_history}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">{c.order_history_desc}</p>
                      <div className="w-full h-[1px] bg-neutral-100 mt-4"></div>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-neutral-200 rounded-none bg-neutral-50/20">
                        <ShoppingBag className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                        <p className="text-xs text-neutral-400 font-light">{c.no_orders_recorded}</p>
                        <button onClick={() => navigate('/catalog')} className="mt-4 text-xs font-semibold text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 mx-auto cursor-pointer border-none bg-transparent">
                          {c.discover_catalog}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                        {/* List of orders */}
                        <div className="xl:col-span-3 space-y-6">
                          {orders.map((ord, i) => {
                            // Calculate progress percentage based on status
                            let progress = 0;
                            if (ord.status === 'pending') progress = 10;
                            else if (ord.status === 'confirmed') progress = 25;
                            else if (ord.status === 'preparing') progress = 50;
                            else if (ord.status === 'shipped') progress = 75;
                            else if (ord.status === 'delivered') progress = 100;

                            const isCancelled = ord.status === 'cancelled';
                            const isDelivered = ord.status === 'delivered';
                            const isExpanded = !!expandedOrders[ord.reference];

                            return (
                              <div key={i} className="border border-neutral-200 bg-white rounded-none shadow-3xs hover:border-neutral-300 transition-all duration-300 relative overflow-hidden group">
                                {/* Accordion Header */}
                                <button
                                  type="button"
                                  onClick={() => toggleOrderExpand(ord.reference)}
                                  className="w-full text-left flex items-center justify-between p-5 focus:outline-none transition-colors duration-250 cursor-pointer hover:bg-neutral-50/40"
                                >
                                  <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 items-center mr-4">
                                    {/* Ref & Date */}
                                    <div className="space-y-1">
                                      <h3 className="text-xs font-bold text-neutral-900 tracking-wider font-mono">{ord.reference}</h3>
                                      <p className="text-[10px] text-neutral-400 font-light">
                                        {new Date(ord.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </p>
                                    </div>
                                    
                                    {/* Items count & Total */}
                                    <div className="space-y-1">
                                      <p className="text-[10px] text-neutral-500 font-light">
                                        {ord.items?.length || 0} {locale === 'en' ? 'items' : (ord.items?.length > 1 ? 'articles' : 'article')}
                                      </p>
                                      <p className="text-xs font-semibold text-neutral-850 font-mono">
                                        {ord.total?.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR')} XOF
                                      </p>
                                    </div>

                                    {/* Status Pill */}
                                    <div className="col-span-2 md:col-span-2 flex md:justify-end">
                                      <span className={`inline-flex items-center gap-1.5 py-0.5 px-2.5 text-[9px] uppercase font-bold tracking-widest rounded-none border ${
                                        isCancelled 
                                          ? 'border-red-200 bg-red-50 text-red-655' 
                                          : isDelivered
                                            ? 'border-emerald-250 bg-emerald-50 text-emerald-700'
                                            : 'border-neutral-200 bg-neutral-50 text-neutral-600'
                                      }`}>
                                        {isDelivered ? (
                                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                        ) : (
                                          <span className={`w-1 h-1 rounded-none ${
                                            isCancelled ? 'bg-red-500' : 'bg-neutral-500'
                                          }`} />
                                        )}
                                        {translateStatus(ord.status)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Chevron */}
                                  <div className="shrink-0 text-neutral-400 group-hover:text-neutral-700 transition-colors">
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4" />
                                    )}
                                  </div>
                                </button>

                                {/* Accordion Body */}
                                {isExpanded && (
                                  <div className="border-t border-neutral-100 p-5 bg-neutral-50/15 animate-fade-in space-y-6">
                                    {/* Top section: Tracking action */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="text-[10px] text-neutral-500 font-light">
                                        {locale === 'en' ? 'Order Details & Progress' : 'Détails & Suivi de la commande'}
                                      </div>
                                      
                                      {isDelivered ? (
                                        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
                                          <span className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-neutral-100 text-neutral-500 rounded-none text-[10px] font-bold uppercase tracking-wider border border-neutral-200/50">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            {c.already_delivered}
                                          </span>
                                          <button
                                            type="button"
                                            disabled={downloadingInvoiceRef === ord.reference}
                                            onClick={() => handlePrintInvoice(ord)}
                                            className="inline-flex items-center gap-1.5 text-[10px] bg-white border border-neutral-250 hover:bg-neutral-50 text-neutral-700 font-bold uppercase tracking-widest py-1.5 px-3.5 transition-colors rounded-none cursor-pointer text-center shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {downloadingInvoiceRef === ord.reference ? (
                                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                                            ) : (
                                              <FileText className="w-3.5 h-3.5 text-neutral-500" />
                                            )}
                                            {downloadingInvoiceRef === ord.reference 
                                              ? (locale === 'en' ? 'Downloading...' : 'Téléchargement...') 
                                              : (locale === 'en' ? 'Invoice' : 'Facture')}
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => navigate(`/order-tracking/${ord.reference}`)}
                                          className="self-start sm:self-auto text-[10px] bg-primary hover:bg-neutral-850 text-white font-bold uppercase tracking-widest py-2 px-4.5 transition-colors rounded-none cursor-pointer text-center shadow-xs"
                                        >
                                          {c.track_package}
                                        </button>
                                      )}
                                    </div>

                                    {/* Progress Bar Timeline */}
                                    {!isCancelled && (
                                      <div className="relative px-1 py-2">
                                        <div className="overflow-hidden h-1 text-xs flex rounded-none bg-neutral-100 border border-neutral-200/20">
                                          <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent transition-all duration-1000"></div>
                                        </div>
                                        <div className="flex justify-between mt-2.5 text-[8px] font-bold uppercase tracking-widest text-neutral-400">
                                          <span className={progress >= 10 ? 'text-accent' : ''}>{c.validated}</span>
                                          <span className={progress >= 50 ? 'text-accent' : ''}>{c.preparing_timeline}</span>
                                          <span className={progress >= 75 ? 'text-accent' : ''}>{c.shipped_timeline}</span>
                                          <span className={progress >= 100 ? 'text-accent' : ''}>{c.delivered_timeline}</span>
                                        </div>
                                      </div>
                                    )}

                                    {/* Items List */}
                                    <div className="space-y-4">
                                      <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100 pb-2">
                                        {locale === 'en' ? 'Items' : 'Articles'}
                                      </div>
                                      {ord.items?.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center">
                                          <div className="w-12 h-12 bg-neutral-50 border border-neutral-100 shrink-0 overflow-hidden rounded-none">
                                            {item.image ? (
                                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="w-4 h-4 text-neutral-300" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <span className="text-xs font-semibold text-neutral-880 truncate">{item.name}</span>
                                            <span className="text-[10px] text-neutral-400 mt-0.5 font-mono">{locale === 'en' ? 'Qty' : 'Qte'}: {item.quantity}</span>
                                          </div>
                                          <div className="text-right">
                                            <span className="font-semibold text-xs text-neutral-850 font-mono whitespace-nowrap">{item.price?.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR')} XOF</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Tracking details / concierge status widget */}
                        <div className="xl:col-span-2 space-y-6">
                          <div className="border border-neutral-200 p-8 bg-neutral-50/20 rounded-none shadow-3xs">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2 mb-4">
                              <Compass className="w-4 h-4 text-accent" />
                              {c.shipping_service}
                            </h4>
                            <p className="text-[11px] text-neutral-500 font-light leading-relaxed mb-6">
                              {c.shipping_service_desc}
                            </p>
                            <div className="space-y-3.5">
                              <div className="flex gap-3 items-center text-xs text-neutral-700 bg-white p-3.5 border border-neutral-200/80 rounded-none shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-medium text-neutral-800">{c.luxury_packaging}</span>
                              </div>
                              <div className="flex gap-3 items-center text-xs text-neutral-700 bg-white p-3.5 border border-neutral-200/80 rounded-none shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-medium text-neutral-800">{c.signature_required}</span>
                              </div>
                              <div className="flex gap-3 items-center text-xs text-neutral-700 bg-white p-3.5 border border-neutral-200/80 rounded-none shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-medium text-neutral-800">{c.full_insurance}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. TAB: MES ADRESSES (Grid of addresses - Style Trendyol Pro) */}
                {activeTab === 'addresses' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">{c.my_addresses}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">{c.my_addresses_desc}</p>
                      <div className="w-full h-[1px] bg-neutral-100 mt-4"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Plus Card for adding address */}
                      <div
                        onClick={() => setIsAddressModalOpen(true)}
                        className="group border-2 border-dashed border-neutral-300 hover:border-neutral-800 bg-neutral-50/20 hover:bg-neutral-50/50 p-6 flex flex-col items-center justify-center min-h-[200px] cursor-pointer transition-all rounded-none select-none text-center"
                      >
                        <div className="w-12 h-12 rounded-none border border-neutral-300 flex items-center justify-center text-neutral-400 group-hover:text-neutral-800 group-hover:border-neutral-800 mb-4 transition-all">
                          <span className="text-2xl font-light leading-none">+</span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 group-hover:text-neutral-800 transition-colors">
                          {c.new_address}
                        </span>
                      </div>

                      {/* Displaying addresses */}
                      {addresses.map((addr, i) => {
                        const isDefault = addr.is_default || (i === 0 && addresses.every(a => !a.is_default));
                        return (
                          <div key={i} className="border border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-xs transition-all duration-300 rounded-none p-6 flex flex-col justify-between min-h-[200px] relative">
                            <div>
                              {/* Header info */}
                              <div className="flex justify-between items-start gap-4 mb-4 pb-3 border-b border-neutral-150">
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-800">
                                  {addr.label || c.address_label}
                                </span>
                                {isDefault && (
                                  <span className="text-[8.5px] uppercase tracking-wider font-extrabold text-emerald-700 px-2 py-0.5 border border-emerald-250 bg-emerald-50 flex items-center gap-1 shadow-3xs">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    {c.default}
                                  </span>
                                )}
                              </div>

                              {/* Info details */}
                              <div className="space-y-2.5 text-xs text-neutral-700">
                                <div>
                                  <p className="text-[8.5px] uppercase font-bold text-neutral-400 tracking-wider">Destinataire</p>
                                  <p className="font-bold text-neutral-900 mt-0.5">{addr.customer_name || customerUser?.name || 'Client'}</p>
                                </div>
                                <div>
                                  <p className="text-[8.5px] uppercase font-bold text-neutral-400 tracking-wider">Adresse</p>
                                  <p className="font-medium text-neutral-850 leading-relaxed mt-0.5 text-xs">
                                    {addr.shipping_address}
                                  </p>
                                  {(addr.commune || addr.region || addr.country) && (
                                    <p className="text-[10.5px] text-neutral-500 font-normal mt-0.5">
                                      {[addr.commune, addr.region, addr.country === 'CI' ? "Côte d'Ivoire" : addr.country].filter(Boolean).join(', ')}
                                    </p>
                                  )}
                                </div>
                                {addr.customer_phone && (
                                  <div>
                                    <p className="text-[8.5px] uppercase font-bold text-neutral-400 tracking-wider">Téléphone</p>
                                    <p className="font-mono text-neutral-800 mt-0.5 text-xs">{addr.customer_phone}</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Footer links */}
                            <div className="mt-5 pt-3.5 border-t border-neutral-150 flex justify-between items-center">
                              {!isDefault ? (
                                <button
                                  onClick={() => handleSetDefaultAddress(addr.id)}
                                  disabled={addressLoading}
                                  className="text-[9px] uppercase tracking-widest font-black text-neutral-400 hover:text-accent disabled:opacity-50 transition-colors cursor-pointer bg-transparent border-none p-0"
                                >
                                  {c.set_as_default}
                                </button>
                              ) : (
                                <div />
                              )}
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                disabled={addressLoading}
                                className="w-7 h-7 flex items-center justify-center bg-white border border-neutral-250 text-neutral-400 hover:text-danger hover:border-danger hover:bg-red-50 disabled:opacity-50 transition-all rounded-none cursor-pointer"
                                title={c.delete_address_title}
                              >
                                {addressLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. TAB: MES FAVORIS (Grid layout) */}
                {activeTab === 'favorites' && (
                  <div className="space-y-8 animate-fade-in">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-[0.2em] text-neutral-900">{c.my_wishlist}</h2>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-2">{c.my_wishlist_desc}</p>
                      <div className="w-full h-[1px] bg-neutral-100 mt-4"></div>
                    </div>

                    {favorites.length === 0 ? (
                      <div className="text-center py-16 border border-dashed border-neutral-200 text-neutral-400">
                        <Heart className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
                        <p className="text-xs font-light">{c.wishlist_empty}</p>
                        <button 
                          onClick={() => navigate('/catalog')}
                          className="mt-4 text-xs font-semibold text-primary uppercase tracking-widest hover:underline flex items-center gap-1.5 mx-auto cursor-pointer border-none bg-transparent"
                        >
                          {c.discover_catalog}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {favorites.map((item) => (
                          <div key={item.id} className="flex gap-4 p-4 border border-neutral-200 bg-white rounded-none shadow-3xs hover:border-neutral-300 hover:shadow-xs transition-all duration-300">
                            <img
                              src={item.image || (item.images?.[0]?.url) || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012'}
                              alt={item.name}
                              className="w-20 h-24 object-cover bg-neutral-100 border border-neutral-200 shrink-0 rounded-none animate-scale-in"
                            />
                            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                              <div>
                                <h4 className="font-bold text-xs text-neutral-800 truncate tracking-wide">{item.name}</h4>
                                <p className="text-xs text-primary font-semibold mt-1.5 font-mono">{item.price?.toLocaleString(locale === 'en' ? 'en-US' : 'fr-FR')} XOF</p>
                              </div>
                              
                              <div className="flex gap-4 mt-3 border-t border-neutral-100 pt-2.5">
                                <button
                                  onClick={() => handleAddProduct(item)}
                                  className="text-[9px] font-bold uppercase tracking-wider text-accent hover:text-accent-dark flex items-center gap-1 cursor-pointer border-none bg-transparent"
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                  {c.add_to_cart_btn}
                                </button>
                                <button
                                  onClick={() => toggleFavorite(item)}
                                  className="text-[9px] font-bold uppercase tracking-wider text-danger hover:underline flex items-center gap-1 cursor-pointer border-none bg-transparent"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  {c.remove_btn}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>
            </div>
          </div>
        )}
        {activeQuickAddProduct && createPortal(
          <QuickAddModal 
            product={activeQuickAddProduct} 
            isOpen={!!activeQuickAddProduct} 
            onClose={() => setActiveQuickAddProduct(null)} 
          />,
          document.body
        )}
        {/* Address Modal Portal - at root level to avoid tab context issues */}
        {isAddressModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div 
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />
            <div 
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg bg-white p-7 md:p-8 border border-neutral-200 shadow-2xl rounded-none z-10 text-left overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 text-2xl font-light leading-none focus:outline-none"
              >
                &times;
              </button>
              
              <h3 className="text-sm font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2.5 pb-2.5 border-b border-neutral-100">
                <MapPin className="w-4 h-4 text-accent" />
                {c.new_address}
              </h3>
              
              <form onSubmit={handleAddAddress} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">{c.recipient_name}</label>
                    <input
                      type="text"
                      required
                      value={newAddress.customer_name}
                      onChange={(e) => setNewAddress({...newAddress, customer_name: e.target.value})}
                      placeholder={locale === 'en' ? 'Full Name' : 'Nom Complet'}
                      className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">{c.phone}</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.customer_phone}
                      onChange={(e) => setNewAddress({...newAddress, customer_phone: e.target.value})}
                      placeholder="+225..."
                      className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">{c.address_label_field}</label>
                  <input
                    type="text"
                    value={newAddress.label}
                    onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                    placeholder={c.optional_label_placeholder}
                    className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-600" />
                    Pays de livraison
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryCountry('CI')}
                      className={`flex items-center justify-between p-3 rounded-none border-2 cursor-pointer transition-all select-none text-left bg-transparent ${
                        deliveryCountry === 'CI'
                          ? 'border-neutral-900 shadow-sm font-bold text-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400 text-neutral-500'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">Côte d'Ivoire</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">Livraison locale</div>
                      </div>
                      {deliveryCountry === 'CI' && <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 stroke-[3]" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setDeliveryCountry('OTHER'); setSelectedRegion(''); setSelectedCommune(''); }}
                      className={`flex items-center justify-between p-3 rounded-none border-2 cursor-pointer transition-all select-none text-left bg-transparent ${
                        deliveryCountry === 'OTHER'
                          ? 'border-neutral-900 shadow-sm font-bold text-neutral-900 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-400 text-neutral-500'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold leading-tight">International</div>
                        <div className="text-[9px] text-neutral-400 mt-0.5">Hors Côte d'Ivoire</div>
                      </div>
                      {deliveryCountry === 'OTHER' && <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 stroke-[3]" />}
                    </button>
                  </div>
                </div>

                {deliveryCountry === 'CI' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-neutral-600" />
                        Région
                      </label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        required
                        className="w-full border border-neutral-300 rounded-none py-2.5 px-3 text-xs bg-white focus:outline-none focus:border-neutral-900 h-11"
                      >
                        <option value="">Sélectionner</option>
                        {regions.map((reg) => (
                          <option key={reg.id} value={reg.id}>{reg.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                        Commune
                      </label>
                      <select
                        value={selectedCommune}
                        onChange={(e) => setSelectedCommune(e.target.value)}
                        required
                        disabled={!selectedRegion}
                        className="w-full border border-neutral-300 rounded-none py-2.5 px-3 text-xs bg-white focus:outline-none focus:border-neutral-900 h-11 disabled:bg-neutral-50 disabled:border-neutral-200"
                      >
                        <option value="">Sélectionner</option>
                        {communes.map((com) => (
                          <option key={com.id} value={com.id}>{com.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">Pays de destination</label>
                    <input
                      type="text"
                      required
                      value={newAddress.country || ''}
                      onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                      placeholder="France, Sénégal, Canada..."
                      className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                    {deliveryCountry === 'CI' ? 'Rue / Quartier / Précisions' : 'Adresse complète'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.address}
                    onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                    placeholder={deliveryCountry === 'CI' ? 'Ex: Bvd de Marseille, Résidence Royal, Appt 4B' : 'Ex: 12 Rue de la Paix, 75002 Paris, France'}
                    className="w-full py-3 px-4 text-xs bg-white border border-neutral-300 focus:border-neutral-900 focus:outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-full h-11 bg-neutral-950 hover:bg-neutral-900 text-white font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 mt-6 cursor-pointer select-none"
                >
                  {addressLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><Save className="w-4 h-4" />{c.save_address}</>
                  )}
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default Account;
