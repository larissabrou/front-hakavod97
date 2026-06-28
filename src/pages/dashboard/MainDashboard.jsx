import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, Users, Package, LogOut,
  FolderTree, Palette, Ruler, Truck, Plus, Trash2, Edit2,
  CheckCircle, XCircle, ArrowUpRight, Upload, Play, Ban,
  RefreshCcw, Eye, Search, Sparkles, MoreHorizontal,
  Menu, Grid, ShoppingBag, Maximize, Minimize, Moon, Bell, ChevronDown,
  User, Settings, Sliders, X, Crown
} from 'lucide-react';
import adminService from '../../services/api/adminService';
import authService from '../../services/api/authService';
import { useSettings } from '../../hooks/useSettings';
import NotificationTemplates from './notifications/NotificationTemplates';
import NotificationCampaigns from './notifications/NotificationCampaigns';
import HeroSlides from './HeroSlides';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export const MainDashboard = () => {
  const navigate = useNavigate();
  const { formatPrice } = useSettings();

  const formatOrderDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${day} ${month}, ${year} ${hours}:${minutes} ${ampm}`;
  };

  const getOrderHistory = (order) => {
    if (order.history && order.history.length > 0) return order.history;
    const list = [
      { status: 'pending', note: 'Commande créée et en attente de traitement', date: order.created_at }
    ];
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      list.push({ status: 'confirmed', note: 'Commande confirmée', date: order.created_at });
    }
    if (order.status === 'inprogress') {
      list.push({ status: 'inprogress', note: 'En cours de préparation', date: order.created_at });
    }
    if (order.status === 'pickups') {
      list.push({ status: 'inprogress', note: 'En cours de préparation', date: order.created_at });
      list.push({ status: 'pickups', note: 'Prête pour récupération', date: order.created_at });
    }
    if (order.status === 'shipped') {
      list.push({ status: 'inprogress', note: 'En cours de préparation', date: order.created_at });
      list.push({ status: 'shipped', note: 'Commande expédiée', date: order.created_at });
    }
    if (order.status === 'delivered') {
      list.push({ status: 'inprogress', note: 'En cours de préparation', date: order.created_at });
      list.push({ status: 'shipped', note: 'Commande expédiée', date: order.created_at });
      list.push({ status: 'delivered', note: 'Commande livrée au client', date: order.created_at });
    }
    if (order.status === 'returns') {
      list.push({ status: 'inprogress', note: 'En cours de préparation', date: order.created_at });
      list.push({ status: 'shipped', note: 'Commande expédiée', date: order.created_at });
      list.push({ status: 'delivered', note: 'Commande livrée au client', date: order.created_at });
      list.push({ status: 'returns', note: 'Commande retournée par le client', date: order.created_at });
    }
    if (order.status === 'cancelled') {
      list.push({ status: 'cancelled', note: 'Commande annulée', date: order.created_at });
    }
    return list;
  };

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    const statusLabel = order.status.toUpperCase();
    let statusColor = '#6B1A1A';
    let statusBg = '#f9f0f0';
    if (order.status === 'delivered') { statusColor = '#2d7a5a'; statusBg = '#eaf7f0'; }
    else if (order.status === 'cancelled') { statusColor = '#b94040'; statusBg = '#fdf0f0'; }
    else if (order.status === 'inprogress') { statusColor = '#1a4f8a'; statusBg = '#eaf1fb'; }
    else if (order.status === 'pickups') { statusColor = '#8a6a1a'; statusBg = '#fdf6e3'; }

    // Convert logo to base64-friendly absolute URL for print window
    const logoUrl = window.location.origin + '/logo.png';

    const invoiceHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Facture — ${order.reference}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #fff;
      color: #1a1a1a;
      font-size: 13px;
      line-height: 1.55;
    }
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 56px 60px;
    }

    /* ── HEADER ─────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 32px;
      border-bottom: 1px solid #e8e0d0;
      margin-bottom: 36px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo {
      width: 72px;
      height: 72px;
      object-fit: contain;
    }
    .brand-text h1 {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #6B1A1A;
    }
    .brand-text p {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: #C5A059;
      margin-top: 2px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta .label {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #6B1A1A;
    }
    .invoice-meta .ref {
      font-size: 12px;
      color: #555;
      margin-top: 6px;
    }
    .invoice-meta .ref strong { color: #1a1a1a; }
    .invoice-meta .date {
      font-size: 11px;
      color: #888;
      margin-top: 3px;
    }

    /* ── ADDRESSES ───────────────────────────── */
    .addresses {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 32px;
      margin-bottom: 36px;
    }
    .address-block .block-title {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C5A059;
      border-bottom: 1px solid #e8e0d0;
      padding-bottom: 6px;
      margin-bottom: 12px;
    }
    .address-block .name {
      font-size: 14px;
      font-weight: 600;
      color: #111;
      margin-bottom: 6px;
    }
    .address-block .info {
      font-size: 12px;
      color: #555;
      margin-bottom: 3px;
    }

    /* ── PAYMENT INFO ────────────────────────── */
    .payment-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .payment-row .key { color: #777; }
    .payment-row .val { font-weight: 600; color: #1a1a1a; }
    .status-badge {
      display: inline-block;
      padding: 2px 10px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: ${statusColor};
      background: ${statusBg};
      border: 1px solid ${statusColor}40;
    }

    /* ── TABLE ───────────────────────────────── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .items-table thead tr {
      background: #6B1A1A;
    }
    .items-table th {
      padding: 10px 14px;
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #fff;
    }
    .items-table th.right { text-align: right; }
    .items-table th.center { text-align: center; }
    .items-table tbody tr:nth-child(even) { background: #faf8f5; }
    .items-table td {
      padding: 12px 14px;
      font-size: 12.5px;
      color: #333;
      border-bottom: 1px solid #f0ebe2;
    }
    .items-table td.right { text-align: right; }
    .items-table td.center { text-align: center; }
    .items-table td .product-name { font-weight: 600; color: #1a1a1a; }

    /* ── TOTALS ──────────────────────────────── */
    .totals-wrap {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 48px;
    }
    .totals-block {
      width: 280px;
      border: 1px solid #e8e0d0;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 12.5px;
      border-bottom: 1px solid #f0ebe2;
    }
    .totals-row .key { color: #666; }
    .totals-row .val { font-weight: 600; color: #1a1a1a; }
    .totals-row.grand {
      background: #6B1A1A;
      border-bottom: none;
    }
    .totals-row.grand .key,
    .totals-row.grand .val {
      color: #fff;
      font-size: 13.5px;
      font-weight: 700;
    }

    /* ── FOOTER ──────────────────────────────── */
    .footer {
      border-top: 1px solid #e8e0d0;
      padding-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer .thank-you {
      font-size: 11px;
      color: #777;
    }
    .footer .thank-you strong { color: #6B1A1A; }
    .footer .brand-small {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #C5A059;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 32px 40px; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- HEADER -->
    <div class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="HA-KAVOD 97" class="brand-logo" />
        <div class="brand-text">
          <h1>HA‑KAVOD 97</h1>
          <p>By EA — Maison de Mode</p>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="label">Facture</div>
        <div class="ref">Réf : <strong>${order.reference}</strong></div>
        <div class="date">Date : ${formatOrderDate(order.created_at)}</div>
      </div>
    </div>

    <!-- ADDRESSES -->
    <div class="addresses">
      <div class="address-block">
        <div class="block-title">Facturé à</div>
        <div class="name">${order.customer_name}</div>
        <div class="info">${order.customer_phone || ''}</div>
        <div class="info">${order.customer_email || ''}</div>
        <div class="info" style="margin-top:6px;">${order.shipping_address || '123 Rue des Jardins, Cocody, Abidjan'}</div>
      </div>
      <div class="address-block">
        <div class="block-title">Détails du Paiement</div>
        <div class="payment-row"><span class="key">Méthode</span><span class="val">${order.payment_method}</span></div>
        <div class="payment-row"><span class="key">Statut paiement</span><span class="val" style="color:#2d7a5a">✓ Réussi</span></div>
        <div class="payment-row"><span class="key">Transaction</span><span class="val" style="font-family:monospace;font-size:11px;">TXN-${order.id}</span></div>
        <div class="payment-row" style="margin-top:8px;"><span class="key">Livraison</span><span class="status-badge">${statusLabel}</span></div>
      </div>
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <thead>
        <tr>
          <th>Article</th>
          <th>Taille</th>
          <th>Couleur</th>
          <th class="center">Qté</th>
          <th class="right">Prix Unit.</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${(order.items || []).map(item => {
          const itemName = item.product_name || item.name || 'Article';
          const itemPrice = Number(item.unit_price ?? item.price ?? 0);
          const itemQuantity = Number(item.quantity ?? 1);
          
          let itemColor = item.color || '—';
          let itemSize = item.size || '—';
          if (item.variant_label && (itemColor === '—' || itemColor === 'N/A' || itemSize === '—' || itemSize === 'N/A')) {
            const parts = item.variant_label.split('/').map(s => s.trim());
            if (parts.length === 2) {
              itemColor = parts[0];
              itemSize = parts[1];
            } else if (parts.length === 1) {
              itemColor = parts[0];
            }
          }
          
          return `
          <tr>
            <td><span class="product-name">${itemName}</span></td>
            <td>${itemSize}</td>
            <td>${itemColor}</td>
            <td class="center">${itemQuantity}</td>
            <td class="right">${formatPrice(itemPrice)}</td>
            <td class="right">${formatPrice(itemPrice * itemQuantity)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <!-- TOTALS -->
    <div class="totals-wrap">
      <div class="totals-block">
        <div class="totals-row">
          <span class="key">Sous-total</span>
          <span class="val">
            ${formatPrice(
              order.subtotal !== undefined && order.subtotal !== null
                ? Number(order.subtotal)
                : (Number(order.total ?? 0) - Number(order.shipping_cost ?? 0))
            )}
          </span>
        </div>
        <div class="totals-row">
          <span class="key">Frais de livraison</span>
          <span class="val">
            ${order.shipping_cost === 0 ? 'Gratuit' : formatPrice(order.shipping_cost ?? 0)}
          </span>
        </div>
        <div class="totals-row grand">
          <span class="key">Total Facturé</span>
          <span class="val">${formatPrice(order.total ?? 0)}</span>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p class="thank-you">Merci pour votre confiance — <strong>HA‑KAVOD 97</strong></p>
      <span class="brand-small">By EA • Maison de Mode</span>
    </div>

  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function() { window.close(); }, 600);
    };
  </script>
</body>
</html>`;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };



  // Navigation active tab
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'orders' | 'products' | 'categories' | 'attributes' | 'settings' | 'users' | 'shipping' | 'profile' | 'notification-templates' | 'notification-campaigns'
  const [orderSubTab, setOrderSubTab] = useState('all'); // 'all' | 'preorders'
  const [activeSettingsSection, setActiveSettingsSection] = useState('shipping'); // 'shipping' | 'team'

  // Global loading/error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Current admin user details
  const [adminUser, setAdminUser] = useState(null);

  // States for Velzon top header
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Extension de fonctionnalités pour l'en-tête
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('FR'); // 'FR' | 'EN'
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isGridDropdownOpen, setIsGridDropdownOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  
  // Sidebar expanded submenus state
  const [expandedMenus, setExpandedMenus] = useState({
    orders: false,
    products: false,
    admin: false,
    profile: false,
    notifications: false,
  });
  
  const [notifications, setNotifications] = useState([]);

  const bagItems = [
    { id: 1, name: 'Derby Oxford Cuir Grainé', price: 125000, quantity: 1, color: 'Bordeaux', size: '42' },
    { id: 2, name: 'Sneaker Cuir Blanc', price: 98000, quantity: 2, color: 'Blanc', size: '40' },
    { id: 3, name: 'Chelsea Boot Cuir Suédé', price: 145000, quantity: 1, color: 'Mastic', size: '43' },
    { id: 4, name: 'Classic Short Sleeve Shirt', price: 31200, quantity: 1, color: 'Bleu', size: 'M' }
  ];

  const translations = {
    FR: {
      dashboard: 'Tableau de bord',
      orders: 'Commandes',
      clients: 'Clients',
      users: 'Utilisateurs',
      products: 'Produits',
      categories: 'Catégories',
      attributes: 'Attributs',
      shipping: 'Livraison',
      heroBanners: 'Bannières Hero',
      logout: 'Se déconnecter',
      searchPlaceholder: 'Rechercher...',
      notifications: 'Notifications',
      newNotifications: 'NOUVELLES',
      newOrder: 'Nouveau',
      allNotifications: 'Voir toutes les notifications',
      welcome: 'Bienvenue !',
      myProfile: 'Mon Profil',
      settingsLabel: 'Paramètres',
      dashboardDesc: 'Statistiques globales, alertes stocks et suivi financier.',
      ordersDesc: 'Suivi, facturation et mise à jour du statut des commandes.',
      clientsDesc: 'Gestion des clients (inscrits et non inscrits / invités).',
      usersDesc: 'Gestion des administrateurs et membres de l\'équipe.',
      productsDesc: 'Création, modification, upload multimédia et publication.',
      categoriesDesc: 'Gestion de la structure de navigation et sous-catégories.',
      attributesDesc: 'Gestion des couleurs et grilles de tailles.',
      shippingDesc: 'Configuration des zones et frais de livraison.',
      heroBannersDesc: 'Gérez les diapositives de bannières de la page d\'accueil.',
      langFrench: 'Français',
      langEnglish: 'Anglais (EN)',
      appGrid: 'Raccourcis Applications',
      cartTitle: 'Mon Panier',
      cartEmpty: 'Le panier est vide.',
      viewItem: 'Voir l\'article',
      orderDetail: 'Ouvrir commande',
      noNewNotifications: 'Aucune nouvelle notification',
      darkModeLabel: 'Thème Sombre',
      lightModeLabel: 'Thème Clair',
      
      // Submenus translations FR
      subAllOrders: 'Toutes les commandes',
      subPreorders: 'Précommandes',
      subCreateOrder: 'Créer une commande',
      subAllProducts: 'Tous les produits',
      subAddProduct: 'Ajouter un produit',
      subStockAlerts: 'Alertes stock',
      subAllClients: 'Liste des clients',
      subAddClient: 'Ajouter un client',
      subShippingRates: 'Tarifs de livraison',
      subTeamAdmins: 'Collaborateurs',
      subMyInfo: 'Mes informations',
      subChangePassword: 'Changer le mot de passe',
      sidebarProfile: 'Mon profil',
    },
    EN: {
      dashboard: 'Dashboard',
      orders: 'Orders',
      clients: 'Customers',
      products: 'Products',
      categories: 'Categories',
      attributes: 'Attributes',
      heroBanners: 'Hero Banners',
      settings: 'Settings & Team',
      logout: 'Sign Out',
      searchPlaceholder: 'Search...',
      notifications: 'Notifications',
      newNotifications: 'NEW',
      newOrder: 'New',
      allNotifications: 'View all notifications',
      welcome: 'Welcome!',
      myProfile: 'My Profile',
      settingsLabel: 'Settings',
      dashboardDesc: 'Global statistics, stock alerts, and financial monitoring.',
      ordersDesc: 'Tracking, billing, and updating order statuses.',
      clientsDesc: 'Tracking, searching, and managing customer accounts.',
      productsDesc: 'Creation, modification, media uploads, and publishing.',
      categoriesDesc: 'Management of navigation structure and sub-categories.',
      attributesDesc: 'Management of colors and size charts.',
      settingsDesc: 'Configuration of shipping rates and team accounts.',
      heroBannersDesc: 'Manage home page hero banners.',
      langFrench: 'French (FR)',
      langEnglish: 'English',
      appGrid: 'Application Shortcuts',
      cartTitle: 'My Cart',
      cartEmpty: 'Your cart is empty.',
      viewItem: 'View Item',
      orderDetail: 'Open Order',
      noNewNotifications: 'No new notifications',
      darkModeLabel: 'Dark Mode',
      lightModeLabel: 'Light Mode',

      // Submenus translations EN
      subAllOrders: 'All Orders',
      subPreorders: 'Pre-orders',
      subCreateOrder: 'Create Order',
      subAllProducts: 'All Products',
      subAddProduct: 'Add Product',
      subStockAlerts: 'Stock Alerts',
      subAllClients: 'Customers List',
      subAddClient: 'Add Customer',
      subShippingRates: 'Shipping Rates',
      subTeamAdmins: 'Team Admins',
      subMyInfo: 'My Information',
      subChangePassword: 'Change Password',
      sidebarProfile: 'My Profile',
    }
  };

  const t = translations[currentLanguage];

  // ── STATE VARIABLES FOR EACH TAB ──────────────────────────────────────────

  // 1. Dashboard Tab States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [ordersChartData, setOrdersChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  // 2. Orders Tab States
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [orderStatusUpdate, setOrderStatusUpdate] = useState('');
  const [orderNoteUpdate, setOrderNoteUpdate] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderFilterDate, setOrderFilterDate] = useState('');
  const [orderFilterStatusSelect, setOrderFilterStatusSelect] = useState('');
  const [orderFilterPaymentSelect, setOrderFilterPaymentSelect] = useState('');
  const [orderFilterStatusTab, setOrderFilterStatusTab] = useState('all');
  const [bulkSelectedOrders, setBulkSelectedOrders] = useState([]);
  const [orderSortBy, setOrderSortBy] = useState('');
  const [orderSortOrder, setOrderSortOrder] = useState('asc');
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [productImagesMap, setProductImagesMap] = useState({});
  const [readOrderIds, setReadOrderIds] = useState(() => {
    try {
      const stored = localStorage.getItem('read_order_ids');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });
  const [allProductsForOrder, setAllProductsForOrder] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // States for timeline CRUD editing
  const [editingHistoryIndex, setEditingHistoryIndex] = useState(null);
  const [editHistoryForm, setEditHistoryForm] = useState({ status: 'pending', note: '', date: '' });
  
  const getLocalDatetimeString = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [newHistoryForm, setNewHistoryForm] = useState({ 
    status: 'pending', 
    note: '', 
    date: getLocalDatetimeString() 
  });

  const toDatetimeLocalValue = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isOrderModalExpanded, setIsOrderModalExpanded] = useState(false);
  const [isProductModalExpanded, setIsProductModalExpanded] = useState(false);
  const [isOrderDetailExpanded, setIsOrderDetailExpanded] = useState(false);
  const [isCreateCustomerExpanded, setIsCreateCustomerExpanded] = useState(false);
  const [isEditCustomerExpanded, setIsEditCustomerExpanded] = useState(false);
  const [isCategoryModalExpanded, setIsCategoryModalExpanded] = useState(false);
  const [isSubCategoryModalExpanded, setIsSubCategoryModalExpanded] = useState(false);
  const [isShippingModalExpanded, setIsShippingModalExpanded] = useState(false);
  const [isTeamModalExpanded, setIsTeamModalExpanded] = useState(false);
  const [createOrderForm, setCreateOrderForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    billing_address: '',
    product_name: '',
    product_price: '',
    quantity: 1,
    size: 'Standard',
    color: 'N/A',
    shipping_cost: 3000,
    payment_method: 'Orange Money',
    status: 'pending'
  });

  // 2b. Clients Tab States
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilterDate, setCustomerFilterDate] = useState('');
  const [customerFilterStatus, setCustomerFilterStatus] = useState('');
  const [customerFilterType, setCustomerFilterType] = useState('');
  const [customerFilterSource, setCustomerFilterSource] = useState('');
  const [customerSortBy, setCustomerSortBy] = useState('');
  const [customerSortOrder, setCustomerSortOrder] = useState('asc');
  const [customerCurrentPage, setCustomerCurrentPage] = useState(1);
  const [bulkSelectedCustomers, setBulkSelectedCustomers] = useState([]);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [createCustomerForm, setCreateCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'ACTIVE',
    joining_date: ''
  });

  // 1b. Revenue Chart States
  const [revenueTimeRange, setRevenueTimeRange] = useState('ALL');

  // 3. Products Tab States
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productFilterStatus, setProductFilterStatus] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productFilterCategory, setProductFilterCategory] = useState('');
  const [productFilterStockAlert, setProductFilterStockAlert] = useState('');
  const [productFilterPriceMin, setProductFilterPriceMin] = useState('');
  const [productFilterPriceMax, setProductFilterPriceMax] = useState('');
  const [productFilterColors, setProductFilterColors] = useState([]);
  const [productFilterSizes, setProductFilterSizes] = useState([]);
  const [bulkSelectedProducts, setBulkSelectedProducts] = useState([]);
  const [productFilterStatusTab, setProductFilterStatusTab] = useState('all'); // 'all', 'published', 'draft'
  const [productSortBy, setProductSortBy] = useState('');
  const [productSortOrder, setProductSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPagination, setProductsPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10
  });
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    old_price: '',
    category_id: '',
    sub_category_id: '',
    description: '',
    is_featured: false
  });
  
  // Variants/Images Wizard States for Product creation/edition
  const [wizardStep, setWizardStep] = useState(1); // 1: Info base, 2: Images/Video, 3: Variants & Publish
  const [tempProductImages, setTempProductImages] = useState([]);
  const [tempProductVideo, setTempProductVideo] = useState(null);
  const [variantsList, setVariantsList] = useState([]); // Array of { color_id, size_id, stock, price, sku }
  const [colorLinks, setColorLinks] = useState([]); // Array of { color_id, color_name, color_code, product_id, product_name }

  // 4. Categories Tab States
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: null, name: '', description: '', is_active: true });
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
  const [subCategoryForm, setSubCategoryForm] = useState({ id: null, categoryId: null, name: '', description: '' });
  const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] = useState(false);
  const [pendingDeleteCategory, setPendingDeleteCategory] = useState({ id: null, name: '' });
  const [isDeleteSubCategoryDialogOpen, setIsDeleteSubCategoryDialogOpen] = useState(false);
  const [pendingDeleteSubCategory, setPendingDeleteSubCategory] = useState({ id: null, name: '' });

  const [customDialog, setCustomDialog] = useState({
    isOpen: false,
    title: '',
    description: '',
    warningText: '',
    confirmLabel: 'Confirmer',
    cancelLabel: 'Annuler',
    onConfirm: null,
    onClose: null,
    isPrompt: false,
    promptValue: '',
    promptPlaceholder: '',
  });

  const showConfirm = (options) => {
    return new Promise((resolve) => {
      setCustomDialog({
        isOpen: true,
        title: options.title || 'Confirmation',
        description: options.description || '',
        warningText: options.warningText || '',
        confirmLabel: options.confirmLabel || 'Confirmer',
        cancelLabel: options.cancelLabel || 'Annuler',
        isPrompt: false,
        promptValue: '',
        promptPlaceholder: '',
        onConfirm: () => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onClose: () => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const showAlert = (options) => {
    const opts = typeof options === 'string' ? { description: options } : options;
    return new Promise((resolve) => {
      setCustomDialog({
        isOpen: true,
        title: opts.title || 'Information',
        description: opts.description || '',
        warningText: opts.warningText || '',
        confirmLabel: opts.confirmLabel || 'OK',
        cancelLabel: null,
        isPrompt: false,
        promptValue: '',
        promptPlaceholder: '',
        onConfirm: () => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onClose: () => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const showPrompt = (options) => {
    return new Promise((resolve) => {
      setCustomDialog({
        isOpen: true,
        title: options.title || 'Saisie',
        description: options.description || '',
        warningText: options.warningText || '',
        confirmLabel: options.confirmLabel || 'Valider',
        cancelLabel: options.cancelLabel || 'Annuler',
        isPrompt: true,
        promptValue: options.defaultValue || '',
        promptPlaceholder: options.placeholder || '',
        onConfirm: (val) => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(val);
        },
        onClose: () => {
          setCustomDialog(prev => ({ ...prev, isOpen: false }));
          resolve(null);
        }
      });
    });
  };

  // 5. Attributes Tab States (Colors & Sizes)
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [newColorForm, setNewColorForm] = useState({ name: '', hex_code: '#000000' });
  const [newSizeForm, setNewSizeForm] = useState({ name: '', sort_order: 0 });

  // 6. Settings (Shipping & Team Admins) Tab States
  const [shippingZones, setShippingZones] = useState([]);
  const [teamUsers, setTeamUsers] = useState([]);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [shippingForm, setShippingForm] = useState({ id: null, name: '', price: '', delivery_days: 2 });
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', email: '', password: '', role: 'admin' });

  // Load Admin Profile
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const user = await authService.getCurrentUser();
        setAdminUser(user);
      } catch (err) {
        console.warn("Échec du chargement du profil connecté, déconnexion.");
        localStorage.removeItem('auth_token');
        navigate('/espace-prive-hk97');
      }
    };
    fetchAdminProfile();
  }, [navigate]);

  // Load Tab Data
  useEffect(() => {
    loadTabData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reload products when filters or page changes
  useEffect(() => {
    if (activeTab === 'products') {
      loadProductsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage, 
    productFilterCategory, 
    productFilterStockAlert, 
    productFilterStatus, 
    productFilterStatusTab,
    productFilterPriceMin,
    productFilterPriceMax,
    productFilterColors,
    productFilterSizes,
    productSortBy,
    productSortOrder
  ]);

  // Reload orders when filters or sorting change
  useEffect(() => {
    if (activeTab === 'orders') {
      setOrderCurrentPage(1);
      loadOrdersData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    orderSubTab,
    orderSearch,
    orderFilterDate,
    orderFilterStatusSelect,
    orderFilterPaymentSelect,
    orderFilterStatusTab,
    orderSortBy,
    orderSortOrder
  ]);

  // Reload customers when filters or sorting change
  useEffect(() => {
    if (activeTab === 'clients') {
      setCustomerCurrentPage(1);
      loadCustomersData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    customerSearch,
    customerFilterDate,
    customerFilterStatus,
    customerFilterType,
    customerFilterSource,
    customerSortBy,
    customerSortOrder
  ]);

  // Dark mode class toggle
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Set up periodic notifications check
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  // Reset expansion states when modals close
  useEffect(() => { if (!isProductModalOpen) setIsProductModalExpanded(false); }, [isProductModalOpen]);
  useEffect(() => { if (!selectedOrder) setIsOrderDetailExpanded(false); }, [selectedOrder]);
  useEffect(() => { if (!isCreateCustomerOpen) setIsCreateCustomerExpanded(false); }, [isCreateCustomerOpen]);
  useEffect(() => { if (!isEditCustomerOpen) setIsEditCustomerExpanded(false); }, [isEditCustomerOpen]);
  useEffect(() => { if (!isCategoryModalOpen) setIsCategoryModalExpanded(false); }, [isCategoryModalOpen]);
  useEffect(() => { if (!isSubCategoryModalOpen) setIsSubCategoryModalExpanded(false); }, [isSubCategoryModalOpen]);
  useEffect(() => { if (!isShippingModalOpen) setIsShippingModalExpanded(false); }, [isShippingModalOpen]);
  useEffect(() => { if (!isTeamModalOpen) setIsTeamModalExpanded(false); }, [isTeamModalOpen]);

  const loadNotifications = async () => {
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    let storedReadIds = [];
    try {
      const stored = localStorage.getItem('read_notification_ids');
      if (stored) storedReadIds = JSON.parse(stored);
    } catch (e) {}

    let ordersList = [];
    let stockList = [];
    
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        ordersList = JSON.parse(stored);
      }
      stockList = [
        { id: 1, name: 'Derby Oxford Cuir Grainé', sku: 'DO-CUIR-BOR-40', stock: 2, color: 'Bordeaux', size: '40' },
        { id: 2, name: 'Sneaker Cuir Blanc', sku: 'SN-CUIR-BLA-39', stock: 0, color: 'Blanc', size: '39' }
      ];
    } else {
      try {
        const res = await adminService.getOrders({ limit: 10 });
        const ordersData = res.success ? res.data : (res.data || res);
        ordersList = Array.isArray(ordersData) ? ordersData : (ordersData?.data || []);
      } catch (e) {
        console.warn("Failed to fetch orders for notifications:", e);
      }
      try {
        const stockRes = await adminService.getStockAlerts(5);
        const stockData = stockRes.success ? stockRes.data : (stockRes.data || stockRes);
        stockList = Array.isArray(stockData) ? stockData : (stockData?.data || stockData || []);
      } catch (e) {
        console.warn("Failed to fetch stock alerts for notifications:", e);
      }
    }
    
    const newNotifications = [];
    let notifId = 1;
    
    const sortedOrders = [...ordersList].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    sortedOrders.slice(0, 5).forEach(order => {
      const diffMs = new Date() - new Date(order.created_at);
      const diffMins = Math.floor(diffMs / 60000);
      let timeStr = '10m';
      if (diffMins < 60) {
        timeStr = `${Math.max(1, diffMins)}m`;
      } else if (diffMins < 1440) {
        timeStr = `${Math.floor(diffMins / 60)}h`;
      } else {
        timeStr = `${Math.floor(diffMins / 1440)}d`;
      }
      
      const isReturn = order.status === 'returns';
      
      if (isReturn) {
        const notifKey = `return-${order.id}`;
        newNotifications.push({
          id: notifId++,
          key: notifKey,
          type: 'return',
          title: `Retour de Commande ${order.reference || '#' + order.id}`,
          titleEn: `Order Return ${order.reference || '#' + order.id}`,
          desc: `${order.customer_name} a demandé un retour pour son achat.`,
          descEn: `${order.customer_name} requested a return for their purchase.`,
          time: timeStr,
          read: storedReadIds.includes(notifKey),
          orderId: order.id
        });
      } else {
        const firstItemName = order.items && order.items[0] 
          ? (order.items[0].product_name || order.items[0].name)
          : (order.product_name || 'un article');
        
        const notifKey = `order-${order.id}`;
        newNotifications.push({
          id: notifId++,
          key: notifKey,
          type: 'order',
          title: `Nouvelle commande ${order.reference || '#' + order.id}`,
          titleEn: `New order ${order.reference || '#' + order.id}`,
          desc: `${order.customer_name} a commandé ${firstItemName}.`,
          descEn: `${order.customer_name} ordered ${firstItemName}.`,
          time: timeStr,
          read: storedReadIds.includes(notifKey),
          orderId: order.id
        });
      }
    });

    if (stockList && stockList.length > 0) {
      stockList.slice(0, 5).forEach(alert => {
        const notifKey = `stock-${alert.sku || alert.name}`;
        newNotifications.push({
          id: notifId++,
          key: notifKey,
          type: 'stock',
          title: 'Alerte Stock Bas',
          titleEn: 'Low Stock Alert',
          desc: `${alert.name} (Taille ${alert.size || 'N/A'}, Couleur ${alert.color || 'N/A'}) est presque en rupture (${alert.stock} restants).`,
          descEn: `${alert.name} (Size ${alert.size || 'N/A'}, Color ${alert.color || 'N/A'}) is low on stock (${alert.stock} remaining).`,
          time: 'Alerte',
          read: storedReadIds.includes(notifKey),
          search: alert.name
        });
      });
    }

    setNotifications(newNotifications);
  };

  const loadProductImagesMap = async () => {
    try {
      const res = await adminService.getProducts({ per_page: 100 });
      if (res.success && res.data) {
        const productsList = res.data.data || res.data || [];
        const mapping = {};
        productsList.forEach(p => {
          const mainImage = p.images?.find(img => img.is_main)?.url || p.images?.[0]?.url || '/logo.png';
          mapping[p.id] = mainImage;
        });
        setProductImagesMap(mapping);
      }
    } catch (e) {
      console.warn("Failed to load product images mapping:", e);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await loadNotifications();
      if (Object.keys(productImagesMap).length === 0) {
        await loadProductImagesMap();
      }
      if (activeTab === 'dashboard') {
        await loadDashboardData();
      } else if (activeTab === 'orders') {
        await loadOrdersData();
      } else if (activeTab === 'clients') {
        await loadCustomersData();
      } else if (activeTab === 'products') {
        await loadProductsData();
        await loadCategoriesData(); // Necessary for category dropdowns in forms
      } else if (activeTab === 'categories') {
        await loadCategoriesData();
      } else if (activeTab === 'attributes') {
        await loadAttributesData();
      } else if (activeTab === 'settings' || activeTab === 'shipping' || activeTab === 'users') {
        await loadSettingsData();
      }
    } catch (err) {
      console.error("Erreur de chargement de l'onglet :", err);
      setError("Certaines données n'ont pas pu être récupérées du serveur.");
    } finally {
      setLoading(false);
    }
  };

  // Fullscreen support
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Sync global search to active tab search state
  useEffect(() => {
    if (activeTab === 'orders') {
      setOrderSearch(globalSearchQuery);
    } else if (activeTab === 'products') {
      setProductSearch(globalSearchQuery);
    } else if (activeTab === 'clients') {
      setCustomerSearch(globalSearchQuery);
    }
  }, [globalSearchQuery]);

  // Sync active tab search state back to global search when switching tabs
  useEffect(() => {
    if (activeTab === 'orders') {
      setGlobalSearchQuery(orderSearch);
    } else if (activeTab === 'products') {
      setGlobalSearchQuery(productSearch);
    } else if (activeTab === 'clients') {
      setGlobalSearchQuery(customerSearch);
    } else {
      setGlobalSearchQuery('');
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    navigate('/espace-prive-hk97');
  };

  // ── API LOADING LOGIC FOR EACH TAB ────────────────────────────────────────

  const loadDashboardData = async () => {
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');

    if (isDemo) {
      // ── DEMO MODE CALCULATIONS ──
      const storedOrders = localStorage.getItem('mock_orders');
      const mockOrders = storedOrders ? JSON.parse(storedOrders) : [];
      const storedProds = localStorage.getItem('mock_products');
      const mockProds = storedProds ? JSON.parse(storedProds) : [];

      // 1. Stats calculations
      const total_revenue = mockOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const orders_count = mockOrders.length;
      // Preorders are orders where status is 'preorders' (or contains product published as preorder)
      const preorders_count = mockOrders.filter(o => o.status === 'preorders' || o.preorder).length;
      const avg_order_value = orders_count > 0 ? Math.round(total_revenue / orders_count) : 0;
      setDashboardStats({
        total_revenue,
        orders_count,
        preorders_count,
        avg_order_value,
        conversion_rate: 3.4
      });

      // 2. Chart data calculations
      const grouped = {};
      mockOrders.forEach(o => {
        const d = new Date(o.created_at || new Date());
        const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        grouped[dateStr] = (grouped[dateStr] || 0) + (Number(o.total) || 0);
      });
      const chart = Object.keys(grouped).map(date => ({ date, amount: grouped[date] }));
      if (chart.length === 0) {
        setOrdersChartData([
          { date: '01/06', amount: 450000 },
          { date: '03/06', amount: 780000 },
          { date: '05/06', amount: 320000 },
          { date: '07/06', amount: 980000 },
          { date: '09/06', amount: 1250000 },
          { date: '11/06', amount: 840000 },
          { date: '13/06', amount: 1450000 }
        ]);
      } else {
        setOrdersChartData(chart.sort().slice(-7));
      }

      // 3. Top Products calculations
      const productSales = {};
      mockOrders.forEach(o => {
        if (o.items && Array.isArray(o.items)) {
          o.items.forEach(it => {
            const name = it.product_name || it.name || 'Produit';
            const qty = Number(it.quantity) || 1;
            const price = Number(it.price) || 0;
            if (!productSales[name]) {
              productSales[name] = { name, total_ordered: 0, revenue: 0 };
            }
            productSales[name].total_ordered += qty;
            productSales[name].revenue += qty * price;
          });
        } else if (o.product_name) {
          const name = o.product_name;
          const qty = Number(o.quantity) || 1;
          const price = Number(o.total) || 0;
          if (!productSales[name]) {
            productSales[name] = { name, total_ordered: 0, revenue: 0 };
          }
          productSales[name].total_ordered += qty;
          productSales[name].revenue += price;
        }
      });
      const topList = Object.values(productSales)
        .sort((a, b) => b.total_ordered - a.total_ordered)
        .slice(0, 5);
      if (topList.length === 0) {
        setTopProducts([
          { id: 1, name: 'Derby Oxford Cuir Grainé', total_ordered: 124, revenue: 15500000 },
          { id: 2, name: 'Sneaker Cuir Blanc', total_ordered: 87, revenue: 8526000 },
          { id: 3, name: 'Chelsea Boot Cuir Suédé', total_ordered: 52, revenue: 7488000 }
        ]);
      } else {
        setTopProducts(topList.map((item, idx) => ({ id: idx + 1, ...item })));
      }

      // 4. Stock Alerts calculations
      const alerts = [];
      mockProds.forEach(p => {
        if (p.variants && Array.isArray(p.variants)) {
          p.variants.forEach(v => {
            if (Number(v.stock) <= 5) {
              alerts.push({
                id: alerts.length + 1,
                name: p.name,
                sku: v.sku || `${p.slug || 'prod'}-${v.color?.name || 'col'}-${v.size?.name || 'sz'}`.toUpperCase(),
                stock: Number(v.stock),
                color: v.color?.name || 'N/A',
                size: v.size?.name || 'N/A'
              });
            }
          });
        }
      });
      if (alerts.length === 0) {
        setStockAlerts([
          { id: 1, name: 'Derby Oxford Cuir Grainé', sku: 'DO-CUIR-BOR-40', stock: 2, color: 'Bordeaux', size: '40' },
          { id: 2, name: 'Sneaker Cuir Blanc', sku: 'SN-CUIR-BLA-39', stock: 0, color: 'Blanc', size: '39' }
        ]);
      } else {
        setStockAlerts(alerts.slice(0, 5));
      }
      return;
    }

    // ── REAL MODE (API CALLS) ──
    try {
      // 1. Fetch all API data in parallel
      const [statsRes, chartRes, topProductsRes, stockRes] = await Promise.all([
        adminService.getStats().catch(err => { console.warn("Stats API failed:", err); return null; }),
        adminService.getOrdersChart().catch(err => { console.warn("Chart API failed:", err); return null; }),
        adminService.getTopProducts(5).catch(err => { console.warn("Top products API failed:", err); return null; }),
        adminService.getStockAlerts(5).catch(err => { console.warn("Stock alerts API failed:", err); return null; })
      ]);

      console.log("DEBUG: Raw API Responses =", { statsRes, chartRes, topProductsRes, stockRes });

      // 2. Parse Chart Data (needed for stats calculation if stats are incomplete)
      let mappedChart = [];
      if (chartRes) {
        const chartData = chartRes.success ? chartRes.data : (chartRes.data || chartRes);
        const resolvedChart = Array.isArray(chartData) ? chartData : (chartData?.data || []);
        mappedChart = resolvedChart.map(item => {
          let displayDate = item.date;
          if (item.date && item.date.includes('-')) {
            const parts = item.date.split('-');
            if (parts.length === 3) {
              displayDate = `${parts[2]}/${parts[1]}`;
            }
          }
          return {
            date: displayDate,
            amount: Number(item.revenue || item.amount || 0),
            count: Number(item.count || 0)
          };
        });
        setOrdersChartData(mappedChart);
      } else {
        // Fallback chart
        setOrdersChartData([
          { date: '01/06', amount: 450000 },
          { date: '03/06', amount: 780000 },
          { date: '05/06', amount: 320000 },
          { date: '07/06', amount: 980000 },
          { date: '09/06', amount: 1250000 },
          { date: '11/06', amount: 840000 },
          { date: '13/06', amount: 1450000 }
        ]);
      }

      // 3. Parse Stats Data
      if (statsRes) {
        const statsData = statsRes.success ? statsRes.data : (statsRes.data || statsRes);
        
        const total_revenue = statsData.total_revenue !== undefined 
          ? Number(statsData.total_revenue) 
          : (mappedChart.length > 0
              ? mappedChart.reduce((sum, d) => sum + d.amount, 0)
              : Number(statsData.revenue_today || 0));

        const orders_count = statsData.orders_count !== undefined
          ? Number(statsData.orders_count)
          : (mappedChart.length > 0
              ? mappedChart.reduce((sum, d) => sum + d.count, 0)
              : Number(statsData.orders_today || 0));

        const preorders_count = statsData.preorders_count !== undefined
          ? Number(statsData.preorders_count)
          : Number(statsData.preorders_pending || 0);

        const avg_order_value = statsData.avg_order_value !== undefined
          ? Number(statsData.avg_order_value)
          : (orders_count > 0 ? Math.round(total_revenue / orders_count) : 0);

        const conversion_rate = statsData.conversion_rate !== undefined
          ? Number(statsData.conversion_rate)
          : 3.4;

        setDashboardStats({
          total_revenue,
          orders_count,
          preorders_count,
          avg_order_value,
          conversion_rate
        });
      } else {
        // Fallback stats
        setDashboardStats({
          total_revenue: 12489000,
          orders_count: 348,
          preorders_count: 24,
          avg_order_value: 35887,
          conversion_rate: 3.4
        });
      }

      // 4. Parse Top Products
      if (topProductsRes) {
        const topProductsData = topProductsRes.success ? topProductsRes.data : (topProductsRes.data || topProductsRes);
        const resolvedTop = Array.isArray(topProductsData) ? topProductsData : (topProductsData?.data || []);

        // Fetch products to map prices/revenues
        let productPrices = {};
        try {
          const prodRes = await adminService.getProducts({ per_page: 200 });
          const prodData = prodRes.success ? prodRes.data : (prodRes.data || prodRes);
          const resolvedProds = Array.isArray(prodData) ? prodData : (prodData?.data || []);
          resolvedProds.forEach(p => {
            if (p.id) {
              productPrices[p.id] = Number(p.price || 0);
            }
          });
        } catch (err) {
          console.warn("Could not load products list for price mapping:", err);
        }

        const mappedTop = resolvedTop.map((item, idx) => {
          const qty = Number(item.total_quantity || item.total_ordered || 0);
          const price = productPrices[item.product_id || item.id] || 0;
          return {
            id: item.product_id || item.id || (idx + 1),
            name: item.product_name || item.name || 'Produit',
            total_ordered: qty,
            revenue: item.revenue !== undefined ? Number(item.revenue) : (qty * price)
          };
        });
        setTopProducts(mappedTop);
      } else {
        // Fallback top products
        setTopProducts([
          { id: 1, name: 'Derby Oxford Cuir Grainé', total_ordered: 124, revenue: 15500000 },
          { id: 2, name: 'Sneaker Cuir Blanc', total_ordered: 87, revenue: 8526000 },
          { id: 3, name: 'Chelsea Boot Cuir Suédé', total_ordered: 52, revenue: 7488000 }
        ]);
      }

      // 5. Parse Stock Alerts
      if (stockRes) {
        const stockData = stockRes.success ? stockRes.data : (stockRes.data || stockRes);
        const resolvedStock = Array.isArray(stockData) ? stockData : (stockData?.data || []);
        const mappedStock = resolvedStock.map((item, idx) => ({
          id: item.id || (idx + 1),
          name: item.product_name || item.name || 'Produit',
          sku: item.sku || 'N/A',
          stock: Number(item.stock ?? item.quantity ?? 0),
          color: item.color || 'N/A',
          size: item.size || 'N/A'
        }));
        setStockAlerts(mappedStock);
      } else {
        // Fallback stock alerts
        setStockAlerts([
          { id: 1, name: 'Derby Oxford Cuir Grainé', sku: 'DO-CUIR-BOR-40', stock: 2, color: 'Bordeaux', size: '40' },
          { id: 2, name: 'Sneaker Cuir Blanc', sku: 'SN-CUIR-BLA-39', stock: 0, color: 'Blanc', size: '39' }
        ]);
      }
    } catch (e) {
      console.error("Dashboard data load failed:", e);
    }
  };

  const loadOrdersData = async () => {
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    let loadedOrders = [];

    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        loadedOrders = JSON.parse(stored);
      } else {
        const defaultMock = [
          {
            id: 12,
            reference: '#VZ12',
            customer_name: 'Alexis Clarke',
            customer_email: 'alexis@example.com',
            customer_phone: '+225 07 08 09 10 11',
            product_name: 'Noise Evolve Smartwatch',
            total: 102100,
            subtotal: 99100,
            shipping_cost: 3000,
            payment_method: 'Carte Bancaire',
            status: 'cancelled',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 11,
            reference: '#VZ11',
            customer_name: 'Diana Kohler',
            customer_email: 'diana@example.com',
            customer_phone: '+225 05 06 07 08 09',
            product_name: 'Half Sleeve T-Shirts (Blue)',
            total: 87400,
            subtotal: 84400,
            shipping_cost: 3000,
            payment_method: 'Carte Bancaire',
            status: 'delivered',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 10,
            reference: '#VZ10',
            customer_name: 'Henry Baird',
            customer_email: 'henry@example.com',
            customer_phone: '+225 01 02 03 04 05',
            product_name: 'Classic Short Sleeve Shirt',
            total: 34200,
            subtotal: 31200,
            shipping_cost: 3000,
            payment_method: 'Carte Bancaire',
            status: 'inprogress',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 9,
            reference: '#VZ9',
            customer_name: 'Donald Palmer',
            customer_email: 'donald@example.com',
            customer_phone: '+225 09 08 07 06 05',
            product_name: 'Oxford Button-Down Shirt',
            total: 37300,
            subtotal: 34300,
            shipping_cost: 3000,
            payment_method: 'Carte Bancaire',
            status: 'pickups',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 8,
            reference: '#VZ8',
            customer_name: 'Alexis Clarke',
            customer_email: 'alexis.c@example.com',
            customer_phone: '+225 07 08 09 10 11',
            product_name: 'USB Flash Drive Personalized',
            total: 24700,
            subtotal: 21700,
            shipping_cost: 3000,
            payment_method: 'Wave',
            status: 'delivered',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 7,
            reference: '#VZ7',
            customer_name: 'Nancy Martino',
            customer_email: 'nancy@example.com',
            customer_phone: '+225 07 00 11 22 33',
            product_name: 'Funky Prints T-shirt',
            total: 18000,
            subtotal: 15000,
            shipping_cost: 3000,
            payment_method: 'Orange Money',
            status: 'returns',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 6,
            reference: '#VZ6',
            customer_name: 'James Price',
            customer_email: 'james@example.com',
            customer_phone: '+225 05 55 66 77 88',
            product_name: 'Apple iPhone 12',
            total: 124000,
            subtotal: 121000,
            shipping_cost: 3000,
            payment_method: 'Carte Bancaire',
            status: 'inprogress',
            created_at: '2022-04-20T16:05:00Z'
          },
          {
            id: 5,
            reference: '#VZ5',
            customer_name: 'Thomas Taylor',
            customer_email: 'thomas@example.com',
            customer_phone: '+225 01 22 33 44 55',
            product_name: 'Galaxy Watch4',
            total: 40800,
            subtotal: 37800,
            shipping_cost: 3000,
            payment_method: 'Moov Money',
            status: 'pickups',
            created_at: '2022-04-20T16:05:00Z'
          }
        ];
        localStorage.setItem('mock_orders', JSON.stringify(defaultMock));
        loadedOrders = defaultMock;
      }
    } else {
      try {
        const params = {};
        if (orderStatusFilter) {
          params.status = orderStatusFilter === 'inprogress' ? 'preparing' : orderStatusFilter;
        }
        const res = orderSubTab === 'preorders'
          ? await adminService.getPreorders()
          : await adminService.getOrders(params);
        const resolvedOrders = res.success ? res.data : (res.data || res);
        const rawOrders = Array.isArray(resolvedOrders) ? resolvedOrders : (resolvedOrders?.data || []);
        loadedOrders = rawOrders.map(o => ({
          ...o,
          status: o.status === 'preparing' ? 'inprogress' : o.status
        }));
        
        // Merge local cancellation requests
        const stored = localStorage.getItem('mock_orders');
        if (stored) {
          const list = JSON.parse(stored);
          loadedOrders = loadedOrders.map(o => {
            const localOrder = list.find(lo => lo.reference && o.reference && lo.reference.toUpperCase() === o.reference.toUpperCase());
            if (localOrder && localOrder.cancellation_requested) {
              return { ...o, cancellation_requested: true };
            }
            return o;
          });
        }
      } catch (e) {
        loadedOrders = [];
      }
    }

    // Client-side filtering, searching and sorting
    let filtered = [...loadedOrders];

    // 1. Text search (ID, Customer, Product, Status...)
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      filtered = filtered.filter(o => 
        o.reference.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        (o.product_name && o.product_name.toLowerCase().includes(q)) ||
        (o.items && o.items.some(it => (it.product_name || it.name || '').toLowerCase().includes(q))) ||
        o.status.toLowerCase().includes(q)
      );
    }

    // 2. Date Filter
    if (orderFilterDate) {
      filtered = filtered.filter(o => {
        const dateStr = new Date(o.created_at).toISOString().split('T')[0];
        return dateStr === orderFilterDate;
      });
    }

    // 3. Dropdown Status Filter
    if (orderFilterStatusSelect) {
      filtered = filtered.filter(o => o.status === orderFilterStatusSelect);
    }

    // 4. Dropdown Payment Filter
    if (orderFilterPaymentSelect) {
      filtered = filtered.filter(o => o.payment_method === orderFilterPaymentSelect);
    }

    // 5. Horizontal Status Tab Filter
    if (orderFilterStatusTab && orderFilterStatusTab !== 'all') {
      filtered = filtered.filter(o => o.status === orderFilterStatusTab);
    }

    // 6. Sort
    if (orderSortBy) {
      filtered.sort((a, b) => {
        let valA = a[orderSortBy];
        let valB = b[orderSortBy];
        
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return orderSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return orderSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setOrders(filtered);
  };

  // ── CLIENTS (CUSTOMERS) LOGIC ────────────────────────────────────────────

  const formatCustomerDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const handleResetCustomerFilters = () => {
    setCustomerSearch('');
    setCustomerFilterDate('');
    setCustomerFilterStatus('');
    setCustomerFilterType('');
    setCustomerFilterSource('');
    setCustomerSortBy('');
    setCustomerSortOrder('asc');
    setCustomerCurrentPage(1);
  };

  const loadCustomersData = async () => {
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    let loadedCustomers = [];

    if (isDemo) {
      const stored = localStorage.getItem('mock_customers');
      if (stored) {
        loadedCustomers = JSON.parse(stored);
      } else {
        const defaultMock = [
          {
            id: 1,
            name: 'Timothy Smith',
            email: 'timothysmith@velzon.com',
            phone: '973-277-6950',
            joining_date: '2021-12-13T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Inscrit',
            connection_method: 'E-mail'
          },
          {
            id: 2,
            name: 'Robert McMahon',
            email: 'robertmcmahon@velzon.com',
            phone: '786-253-9927',
            joining_date: '2021-01-12T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Inscrit',
            connection_method: 'Téléphone'
          },
          {
            id: 3,
            name: 'Michael Morris (Invité)',
            email: 'michaelmorris@velzon.com',
            phone: '805-447-8398',
            joining_date: '2021-05-19T00:00:00Z',
            status: 'BLOCK',
            registration_status: 'Non inscrit',
            connection_method: 'Invité'
          },
          {
            id: 4,
            name: 'Mary Cousar',
            email: 'marycousar@velzon.com',
            phone: '580-464-4694',
            joining_date: '2021-04-06T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Inscrit',
            connection_method: 'Google'
          },
          {
            id: 5,
            name: 'Kevin Dawson (Invité)',
            email: 'kevindawson@velzon.com',
            phone: '213-741-4294',
            joining_date: '2021-03-14T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Non inscrit',
            connection_method: 'Invité'
          },
          {
            id: 6,
            name: 'Jeff Taylor',
            email: 'jefftaylor@velzon.com',
            phone: '863-577-5537',
            joining_date: '2021-02-15T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Inscrit',
            connection_method: 'Facebook'
          },
          {
            id: 7,
            name: 'Herbert Stokes',
            email: 'herbertstokes@velzon.com',
            phone: '312-944-1448',
            joining_date: '2021-07-20T00:00:00Z',
            status: 'BLOCK',
            registration_status: 'Inscrit',
            connection_method: 'E-mail'
          },
          {
            id: 8,
            name: 'Glen Matney (Invité)',
            email: 'glenmatney@velzon.com',
            phone: '515-395-1069',
            joining_date: '2021-11-02T00:00:00Z',
            status: 'ACTIVE',
            registration_status: 'Non inscrit',
            connection_method: 'Invité'
          }
        ];
        localStorage.setItem('mock_customers', JSON.stringify(defaultMock));
        loadedCustomers = defaultMock;
      }
    } else {
      try {
        let registeredUsers = [];
        try {
          const usersRes = await adminService.getUsers();
          if (usersRes) {
            if (Array.isArray(usersRes)) {
              registeredUsers = usersRes;
            } else if (usersRes.success && usersRes.data) {
              registeredUsers = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes.data.data) ? usersRes.data.data : []);
            } else if (usersRes.data) {
              registeredUsers = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes.data.data) ? usersRes.data.data : []);
            }
          }
        } catch (e) {
          console.warn("Erreur d'accès à la liste d'utilisateurs (possible restriction d'accès) :", e);
        }

        let ordersList = [];
        try {
          const ordersRes = await adminService.getOrders();
          if (ordersRes) {
            if (Array.isArray(ordersRes)) {
              ordersList = ordersRes;
            } else if (ordersRes.success && ordersRes.data) {
              ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : (Array.isArray(ordersRes.data.data) ? ordersRes.data.data : []);
            } else if (ordersRes.data) {
              ordersList = Array.isArray(ordersRes.data) ? ordersRes.data : (Array.isArray(ordersRes.data.data) ? ordersRes.data.data : []);
            }
          }
        } catch (e) {
          console.error("Erreur d'accès aux commandes :", e);
        }

        const registeredEmails = new Set(
          registeredUsers
            .map(u => u.email?.toLowerCase())
            .filter(email => !!email)
        );

        const customerMap = new Map();

        const detectProvider = (u) => {
          if (u.provider) {
            if (u.provider === 'google') return 'Google';
            if (u.provider === 'facebook') return 'Facebook';
            if (u.provider === 'phone') return 'Téléphone';
            return 'E-mail';
          }
          if (u.google_id) return 'Google';
          if (u.facebook_id) return 'Facebook';
          if (u.email && u.email.toLowerCase().includes('google-demo')) return 'Google';
          if (u.email && u.email.toLowerCase().includes('facebook-demo')) return 'Facebook';
          if (u.phone && u.phone !== 'N/A' && (!u.email || u.email === 'Pas d\'email')) return 'Téléphone';
          return 'E-mail';
        };

        // 1. Ajouter les comptes inscrits
        registeredUsers.forEach(u => {
          // Utiliser l'email comme clé unique si présent, sinon le téléphone, sinon l'ID
          const emailKey = u.email?.toLowerCase();
          const phoneKey = u.phone && u.phone !== 'N/A' ? `phone-${u.phone}` : null;
          const key = emailKey || phoneKey || `id-${u.id}`;

          customerMap.set(key, {
            id: u.id,
            name: u.name || 'Nom Inconnu',
            email: u.email || 'Pas d\'email',
            phone: u.phone || 'N/A',
            joining_date: u.created_at || new Date().toISOString(),
            status: u.is_active === false ? 'BLOCK' : 'ACTIVE',
            registration_status: 'Inscrit',
            connection_method: detectProvider(u)
          });
        });

        // 2. Ajouter/Mettre à jour à partir des commandes (capturer les non-inscrits / invités)
        ordersList.forEach(ord => {
          const email = ord.customer_email?.toLowerCase();
          const phone = ord.customer_phone;
          const key = email || (phone && phone !== 'N/A' ? `phone-${phone}` : null) || `order-${ord.id}`;

          const isRegistered = (email && registeredEmails.has(email)) || !!ord.user_id;

          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: ord.id || Math.floor(Math.random() * 100000),
              name: ord.customer_name || 'Client Invité',
              email: ord.customer_email || 'Pas d\'email',
              phone: ord.customer_phone || 'N/A',
              joining_date: ord.created_at || new Date().toISOString(),
              status: 'ACTIVE',
              registration_status: isRegistered ? 'Inscrit' : 'Non inscrit',
              connection_method: isRegistered ? 'E-mail' : 'Invité'
            });
          } else {
            const existing = customerMap.get(key);
            if (isRegistered) {
              existing.registration_status = 'Inscrit';
            }
            if (ord.customer_phone && existing.phone === 'N/A') {
              existing.phone = ord.customer_phone;
            }
          }
        });

        loadedCustomers = Array.from(customerMap.values());
      } catch (err) {
        console.error("Erreur générale lors de la compilation des clients :", err);
        loadedCustomers = [];
      }
    }

    let filtered = [...loadedCustomers];

    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase().trim();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    }

    if (customerFilterStatus) {
      filtered = filtered.filter(c => c.status === customerFilterStatus);
    }

    if (customerFilterType) {
      filtered = filtered.filter(c => c.registration_status === customerFilterType);
    }

    if (customerFilterSource) {
      filtered = filtered.filter(c => c.connection_method === customerFilterSource);
    }

    if (customerFilterDate) {
      filtered = filtered.filter(c => {
        const dateStr = new Date(c.joining_date).toISOString().split('T')[0];
        return dateStr === customerFilterDate;
      });
    }

    if (customerSortBy) {
      filtered.sort((a, b) => {
        let valA = a[customerSortBy] || '';
        let valB = b[customerSortBy] || '';
        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        if (valA < valB) return customerSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return customerSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setCustomers(filtered);
  };

  const handleCustomerSort = (column) => {
    if (customerSortBy === column) {
      setCustomerSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setCustomerSortBy(column);
      setCustomerSortOrder('asc');
    }
  };

  const getCustomerSortIcon = (column) => {
    if (customerSortBy !== column) {
      return <span className="text-neutral-300 ml-1.5 inline-block text-[8px] font-normal">&#9650;&#9660;</span>;
    }
    return customerSortOrder === 'asc' 
      ? <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9650;</span>
      : <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9660;</span>;
  };

  const handleSelectAllCustomers = (e) => {
    if (e.target.checked) {
      setBulkSelectedCustomers(customers.map(c => c.id));
    } else {
      setBulkSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (id, checked) => {
    if (checked) {
      setBulkSelectedCustomers(prev => [...prev, id]);
    } else {
      setBulkSelectedCustomers(prev => prev.filter(item => item !== id));
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');

    const newCustomer = {
      id: Date.now(),
      name: createCustomerForm.name || 'Client sans nom',
      email: createCustomerForm.email || 'non-specifie@example.com',
      phone: createCustomerForm.phone || 'N/A',
      joining_date: createCustomerForm.joining_date ? new Date(createCustomerForm.joining_date).toISOString() : new Date().toISOString(),
      status: createCustomerForm.status || 'ACTIVE'
    };

    if (isDemo) {
      const stored = localStorage.getItem('mock_customers');
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newCustomer);
      localStorage.setItem('mock_customers', JSON.stringify(list));
      setSuccess(`Client ${newCustomer.name} ajouté avec succès.`);
      setIsCreateCustomerOpen(false);
      setCreateCustomerForm({ name: '', email: '', phone: '', status: 'ACTIVE', joining_date: '' });
      loadCustomersData();
    } else {
      setLoading(true);
      setError('');
      try {
        const payload = {
          name: createCustomerForm.name || 'Client sans nom',
          email: createCustomerForm.email || 'non-specifie@example.com',
          password: 'TemporaryPassword123!',
          role: 'admin' // default fallback role for /admin/users
        };

        // Only include phone if it is a valid value and not 'N/A'
        if (createCustomerForm.phone && createCustomerForm.phone.trim() !== '' && createCustomerForm.phone !== 'N/A') {
          payload.phone = createCustomerForm.phone;
        }

        await adminService.createUser(payload);
        setSuccess(`Client/Admin ${createCustomerForm.name} créé avec succès sur le serveur.`);
        setIsCreateCustomerOpen(false);
        setCreateCustomerForm({ name: '', email: '', phone: '', status: 'ACTIVE', joining_date: '' });
        await loadCustomersData();
      } catch (err) {
        let msg = err.response?.data?.message || "Erreur lors de la création du compte.";
        if (err.response?.data?.errors) {
          const details = Object.entries(err.response.data.errors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          if (details) msg += ` (${details})`;
        }
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditCustomerSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');

    if (isDemo) {
      const stored = localStorage.getItem('mock_customers');
      if (stored) {
        const list = JSON.parse(stored);
        const updated = list.map(c => {
          if (c.id === selectedCustomer.id) {
            return {
              ...c,
              name: selectedCustomer.name,
              email: selectedCustomer.email,
              phone: selectedCustomer.phone,
              status: selectedCustomer.status,
              joining_date: selectedCustomer.joining_date
            };
          }
          return c;
        });
        localStorage.setItem('mock_customers', JSON.stringify(updated));
      }
      setSuccess(`Client ${selectedCustomer.name} modifié avec succès.`);
      setIsEditCustomerOpen(false);
      setSelectedCustomer(null);
      loadCustomersData();
    } else {
      setError("La modification directe du nom et e-mail des comptes d'administration n'est pas supportée par l'API (uniquement le rôle depuis l'onglet Équipe).");
      setTimeout(() => setError(''), 5000);
      setIsEditCustomerOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleDeleteCustomer = async (id) => {
    const confirmed = await showConfirm({
      title: "Désactiver le compte",
      description: "Voulez-vous vraiment désactiver ce compte utilisateur ?",
      warningText: "L'utilisateur ne pourra plus se connecter ou passer de commandes sur la boutique.",
      confirmLabel: "Désactiver",
    });
    if (!confirmed) return;

    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');

    if (isDemo) {
      const stored = localStorage.getItem('mock_customers');
      if (stored) {
        const list = JSON.parse(stored);
        const filtered = list.filter(c => c.id !== id);
        localStorage.setItem('mock_customers', JSON.stringify(filtered));
      }
      setSuccess("Client supprimé avec succès.");
      loadCustomersData();
    } else {
      setLoading(true);
      setError('');
      try {
        await adminService.deleteUser(id);
        setSuccess("Compte utilisateur désactivé avec succès sur le serveur.");
        await loadCustomersData();
      } catch (err) {
        setError(err.response?.data?.message || "Erreur lors de la désactivation du compte.");
      } finally {
        setLoading(false);
      }
    }
  };






// Helper to load attributes (colors & sizes)


  const handleOrderSort = (column) => {
    if (orderSortBy === column) {
      setOrderSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderSortBy(column);
      setOrderSortOrder('asc');
    }
  };

  const getOrderSortIcon = (column) => {
    if (orderSortBy !== column) {
      return <span className="text-neutral-300 ml-1.5 inline-block text-[8px] font-normal">&#9650;&#9660;</span>;
    }
    return orderSortOrder === 'asc' 
      ? <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9650;</span>
      : <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9660;</span>;
  };

  const handleSelectAllOrders = (e) => {
    if (e.target.checked) {
      setBulkSelectedOrders(orders.map(o => o.id));
    } else {
      setBulkSelectedOrders([]);
    }
  };

  const handleSelectOrder = (id, checked) => {
    if (checked) {
      setBulkSelectedOrders(prev => [...prev, id]);
    } else {
      setBulkSelectedOrders(prev => prev.filter(oId => oId !== id));
    }
  };

  const getDeliveryStatusBadge = (status) => {
    const s = status.toLowerCase();
    let classes = "";
    let label = status.toUpperCase();

    if (s === 'delivered') {
      classes = "bg-emerald-50 text-emerald-700 border border-emerald-250";
      label = "DELIVERED";
    } else if (s === 'cancelled') {
      classes = "bg-red-50 text-red-700 border border-red-200";
      label = "CANCELLED";
    } else if (s === 'inprogress' || s === 'confirmed' || s === 'pending') {
      classes = "bg-blue-50 text-blue-700 border border-blue-200";
      label = s === 'inprogress' ? "INPROGRESS" : (s === 'confirmed' ? "CONFIRMED" : "PENDING");
    } else if (s === 'shipped') {
      classes = "bg-teal-50 text-teal-700 border border-teal-200";
      label = "SHIPPED";
    } else if (s === 'pickups' || s === 'preparing') {
      classes = "bg-teal-50 text-teal-700 border border-teal-200";
      label = s === 'pickups' ? "PICKUPS" : "PREPARING";
    } else if (s === 'returns') {
      classes = "bg-slate-100 text-slate-700 border border-slate-200";
      label = "RETURNS";
    } else {
      classes = "bg-neutral-50 text-neutral-600 border border-neutral-200";
    }

    return (
      <span className={`px-2 py-0.5 text-[9px] font-extrabold tracking-wider rounded-none ${classes}`}>
        {label}
      </span>
    );
  };

  const handleMockCreateOrder = () => {
    const refNum = Math.floor(100 + Math.random() * 900);
    const newOrder = {
      id: Date.now(),
      reference: `#VZ${refNum}`,
      customer_name: 'Client Démo',
      customer_email: 'demo@example.com',
      customer_phone: '+225 01 02 03 04',
      product_name: 'Produit Hakavod Premium',
      total: 125000,
      subtotal: 122000,
      shipping_cost: 3000,
      payment_method: 'Orange Money',
      status: 'inprogress',
      created_at: new Date().toISOString()
    };

    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const stored = localStorage.getItem('mock_orders');
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newOrder);
      localStorage.setItem('mock_orders', JSON.stringify(list));
      loadOrdersData();
      setSuccess(`Commande ${newOrder.reference} créée avec succès !`);
    } else {
      setError("La création de commande est uniquement disponible en mode démonstration.");
    }
  };

  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    const refNum = Math.floor(100 + Math.random() * 900);
    const price = Number(createOrderForm.product_price) || 0;
    const qty = Number(createOrderForm.quantity) || 1;
    const shipping = Number(createOrderForm.shipping_cost) || 0;
    const subtotal = price * qty;
    const total = subtotal + shipping;

    const newOrder = {
      id: Date.now(),
      reference: `#VZ${refNum}`,
      customer_name: createOrderForm.customer_name || 'Client Démo',
      customer_email: createOrderForm.customer_email || 'demo@example.com',
      customer_phone: createOrderForm.customer_phone || '+225 01 02 03 04',
      product_name: createOrderForm.product_name || 'Produit Hakavod Premium',
      total,
      subtotal,
      shipping_cost: shipping,
      payment_method: createOrderForm.payment_method || 'Orange Money',
      status: createOrderForm.status || 'pending',
      created_at: new Date().toISOString(),
      shipping_address: createOrderForm.shipping_address || '123 Rue des Jardins, Cocody, Abidjan',
      billing_address: createOrderForm.billing_address || 'Même que livraison',
      items: [
        {
          id: 1,
          name: createOrderForm.product_name || 'Produit Hakavod Premium',
          price,
          quantity: qty,
          size: createOrderForm.size || 'Standard',
          color: createOrderForm.color || 'N/A'
        }
      ]
    };

    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newOrder);
      localStorage.setItem('mock_orders', JSON.stringify(list));
      loadOrdersData();
      setIsCreateOrderOpen(false);
      setSuccess(`Commande ${newOrder.reference} créée avec succès !`);
    } else {
      setError("La création de commande est uniquement disponible en mode démonstration.");
    }
  };

  const handleDeleteOrder = async (id) => {
    const confirmed = await showConfirm({
      title: "Supprimer la commande",
      description: "Voulez-vous vraiment supprimer cette commande ?",
      warningText: "Cette action supprimera définitivement la commande des enregistrements.",
      confirmLabel: "Supprimer",
    });
    if (!confirmed) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.filter(o => o.id !== id);
        localStorage.setItem('mock_orders', JSON.stringify(newList));
      }
      await loadOrdersData();
      setSuccess("Commande supprimée.");
      setLoading(false);
      return;
    }
    
    try {
      setError("La suppression physique d'une commande n'est pas supportée par l'API backend. Veuillez plutôt changer son statut en 'annulé' (cancelled).");
      setTimeout(() => setError(''), 6000);
    } catch (err) {
      setError("Erreur lors de la suppression de la commande.");
    } finally {
      setLoading(false);
    }
  };

  const loadProductsData = async () => {
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    let loadedProducts = [];
    let paginationMetadata = { current_page: 1, last_page: 1, total: 0, per_page: 10 };

    if (isDemo) {
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        loadedProducts = JSON.parse(stored);
      } else {
        const defaultMock = [
          {
            id: 1,
            name: 'Derby Oxford Cuir Grainé',
            slug: 'derby-oxford-cuir-graine',
            price: 125000,
            old_price: 150000,
            status: 'available',
            is_featured: true,
            category_id: 3,
            category: { name: 'Chaussures' },
            images: [{ url: '/logo.png', is_main: true }],
            variants: [
              { id: 10, color: { id: 1, name: 'Bordeaux', hex_code: '#540C14' }, size: { id: 2, name: '40' }, stock: 12 },
              { id: 11, color: { id: 2, name: 'Noir', hex_code: '#17070A' }, size: { id: 4, name: '42' }, stock: 12 }
            ],
            orders_count: 48,
            rating: 4.2,
            created_at: '2026-06-12T10:05:00Z'
          },
          {
            id: 2,
            name: 'Sac à Main Cabas Autruche',
            slug: 'sac-a-main-cabas-autruche',
            price: 245000,
            status: 'available',
            is_featured: true,
            category_id: 2,
            category: { name: 'Sacs' },
            images: [{ url: '/logo.png', is_main: true }],
            variants: [
              { id: 12, color: { id: 2, name: 'Noir', hex_code: '#17070A' }, size: { id: 6, name: 'Unique' }, stock: 6 }
            ],
            orders_count: 30,
            rating: 4.3,
            created_at: '2026-01-06T13:30:00Z'
          },
          {
            id: 3,
            name: 'Sneaker Blanc Court',
            slug: 'sneaker-blanc-court',
            price: 98000,
            old_price: 120000,
            status: 'preorder',
            is_featured: false,
            category_id: 3,
            category: { name: 'Chaussures' },
            images: [{ url: '/logo.png', is_main: true }],
            variants: [
              { id: 13, color: { id: 3, name: 'Or', hex_code: '#C5A059' }, size: { id: 1, name: '39' }, stock: 10 }
            ],
            orders_count: 55,
            rating: 4.5,
            created_at: '2026-03-26T11:40:00Z'
          },
          {
            id: 4,
            name: 'Robe du Soir en Soie Noire',
            slug: 'robe-du-soir-soie-noire',
            price: 350000,
            status: 'available',
            is_featured: false,
            category_id: 1,
            category: { name: 'Robes' },
            images: [{ url: '/logo.png', is_main: true }],
            variants: [
              { id: 14, color: { id: 2, name: 'Noir', hex_code: '#17070A' }, size: { id: 5, name: '38' }, stock: 15 }
            ],
            orders_count: 40,
            rating: 4.2,
            created_at: '2026-04-19T14:20:00Z'
          }
        ];
        localStorage.setItem('mock_products', JSON.stringify(defaultMock));
        loadedProducts = defaultMock;
      }
    } else {
      try {
        const params = {
          page: currentPage,
          per_page: 15
        };
        if (productFilterStatus) params.status = productFilterStatus;
        if (productFilterCategory) params.category_id = productFilterCategory;
        if (productFilterStockAlert) params.stock = productFilterStockAlert;
        if (productSearch) params.search = productSearch;

        const res = await adminService.getProducts(params);
        const productsData = res.success ? res.data : (res.data || res);
        if (productsData) {
          if (productsData.data && Array.isArray(productsData.data)) {
            loadedProducts = productsData.data;
            paginationMetadata = {
              current_page: productsData.current_page || 1,
              last_page: productsData.last_page || 1,
              total: productsData.total || 0,
              per_page: productsData.per_page || 10
            };
          } else {
            loadedProducts = Array.isArray(productsData) ? productsData : [];
            paginationMetadata = {
              current_page: 1,
              last_page: 1,
              total: loadedProducts.length,
              per_page: 10
            };
          }
        }
      } catch (e) {
        loadedProducts = [
          { id: 1, name: 'Derby Oxford Cuir Grainé', price: 125000, old_price: 150000, status: 'available', is_featured: true, category_id: 3, orders_count: 48, rating: 4.2, created_at: '2026-06-12T10:05:00Z' },
          { id: 2, name: 'Sac à Main Cabas Autruche', price: 245000, status: 'available', is_featured: true, category_id: 2, orders_count: 30, rating: 4.3, created_at: '2026-01-06T13:30:00Z' },
          { id: 3, name: 'Sneaker Blanc Court', price: 98000, old_price: 120000, status: 'preorder', is_featured: false, category_id: 3, orders_count: 55, rating: 4.5, created_at: '2026-03-26T11:40:00Z' }
        ];
      }
    }

    // Filtrage et Tri Client
    let filtered = isDemo ? [...loadedProducts] : [...loadedProducts];

    // 1. Recherche par nom (mode démo)
    if (productSearch && isDemo) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }

    // 2. Onglets du statut (All, Published, Draft)
    if (productFilterStatusTab === 'published') {
      filtered = filtered.filter(p => p.status === 'available' || p.status === 'preorder');
    } else if (productFilterStatusTab === 'draft') {
      filtered = filtered.filter(p => p.status === 'draft');
    }

    // 3. Catégorie (mode démo)
    if (productFilterCategory && isDemo) {
      filtered = filtered.filter(p => p.category_id === Number(productFilterCategory));
    }

    // 4. Plage de prix
    if (productFilterPriceMin !== '') {
      filtered = filtered.filter(p => p.price >= Number(productFilterPriceMin));
    }
    if (productFilterPriceMax !== '') {
      filtered = filtered.filter(p => p.price <= Number(productFilterPriceMax));
    }

    // 5. Couleurs cochées
    if (productFilterColors.length > 0) {
      filtered = filtered.filter(p => 
        p.variants && p.variants.some(v => 
          (v.color_id && productFilterColors.includes(Number(v.color_id))) ||
          (v.color && (productFilterColors.includes(v.color.name) || productFilterColors.includes(Number(v.color.id))))
        )
      );
    }

    // 6. Tailles cochées
    if (productFilterSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.variants && p.variants.some(v => 
          (v.size_id && productFilterSizes.includes(Number(v.size_id))) ||
          (v.size && (productFilterSizes.includes(v.size.name) || productFilterSizes.includes(Number(v.size.id))))
        )
      );
    }

    // 7. Alerte stock (mode démo)
    if (productFilterStockAlert && isDemo) {
      if (productFilterStockAlert === 'low') {
        filtered = filtered.filter(p => p.variants?.some(v => v.stock > 0 && v.stock <= 5));
      } else if (productFilterStockAlert === 'out') {
        filtered = filtered.filter(p => p.variants?.every(v => v.stock === 0) || !p.variants || p.variants.length === 0);
      }
    }

    // 8. Tri des colonnes
    if (productSortBy) {
      filtered.sort((a, b) => {
        let valA, valB;
        if (productSortBy === 'name') {
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
        } else if (productSortBy === 'stock') {
          valA = a.variants ? a.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) : 0;
          valB = b.variants ? b.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) : 0;
        } else if (productSortBy === 'price') {
          valA = a.price;
          valB = b.price;
        } else if (productSortBy === 'orders') {
          valA = a.orders_count || 0;
          valB = b.orders_count || 0;
        } else if (productSortBy === 'rating') {
          valA = a.rating || 0;
          valB = b.rating || 0;
        } else if (productSortBy === 'published') {
          valA = new Date(a.created_at || a.id).getTime();
          valB = new Date(b.created_at || b.id).getTime();
        }

        if (valA === undefined) return 1;
        if (valB === undefined) return -1;

        if (valA < valB) return productSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return productSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setProducts(filtered);
    setProductsPagination({
      ...paginationMetadata,
      total: isDemo ? filtered.length : paginationMetadata.total
    });
  };

  const loadCategoriesData = async () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      setCategories([
        {
          id: 1, name: 'Robes', slug: 'robes', description: 'Robes de haute couture', is_active: true,
          sub_categories: [{ id: 101, name: 'Robes de soirée' }, { id: 102, name: 'Robes casual' }]
        },
        {
          id: 2, name: 'Sacs', slug: 'sacs', description: 'Maroquinerie de luxe', is_active: true,
          sub_categories: [{ id: 201, name: 'Sacs à main' }, { id: 202, name: 'Pochettes' }]
        },
        {
          id: 3, name: 'Chaussures', slug: 'chaussures', description: 'Chaussures artisanales', is_active: true,
          sub_categories: [{ id: 301, name: 'Derbies' }, { id: 302, name: 'Bottes' }]
        }
      ]);
      return;
    }

    try {
      const res = await adminService.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch (e) {
      setCategories([
        {
          id: 1, name: 'Robes', slug: 'robes', description: 'Robes de haute couture', is_active: true,
          sub_categories: [{ id: 101, name: 'Robes de soirée' }, { id: 102, name: 'Robes casual' }]
        },
        {
          id: 2, name: 'Sacs', slug: 'sacs', description: 'Maroquinerie de luxe', is_active: true,
          sub_categories: [{ id: 201, name: 'Sacs à main' }, { id: 202, name: 'Pochettes' }]
        }
      ]);
    }
  };

  // Fetch all products and categories for order creation modal
  useEffect(() => {
    if (isCreateOrderOpen) {
      const fetchOrderCreationData = async () => {
        if (categories.length === 0) {
          await loadCategoriesData();
        }
        try {
          const res = await adminService.getProducts({ per_page: 200 });
          if (res.success && res.data) {
            setAllProductsForOrder(res.data.data || res.data || []);
          }
        } catch (e) {
          console.warn("Failed to load products for order creation:", e);
        }
      };
      fetchOrderCreationData();
      setSelectedCategoryId('');
      setSelectedProductId('');
      setIsOrderModalExpanded(false);
    }
  }, [isCreateOrderOpen]);

  const loadAttributesData = async () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      setColors([
        { id: 1, name: 'Bordeaux', hex_code: '#540C14' },
        { id: 2, name: 'Noir', hex_code: '#17070A' },
        { id: 3, name: 'Or', hex_code: '#C5A059' }
      ]);
      setSizes([
        { id: 1, name: '39', sort_order: 1 },
        { id: 2, name: '40', sort_order: 2 },
        { id: 3, name: '41', sort_order: 3 },
        { id: 4, name: '42', sort_order: 4 },
        { id: 5, name: '38', sort_order: 5 },
        { id: 6, name: 'Unique', sort_order: 6 }
      ]);
      return;
    }

    try {
      const colorsRes = await adminService.getColors();
      if (colorsRes.success) setColors(colorsRes.data || []);
    } catch (e) {
      setColors([
        { id: 1, name: 'Bordeaux', hex_code: '#540C14' },
        { id: 2, name: 'Noir', hex_code: '#17070A' },
        { id: 3, name: 'Or', hex_code: '#C5A059' }
      ]);
    }

    try {
      const sizesRes = await adminService.getSizes();
      if (sizesRes.success) setSizes(sizesRes.data || []);
    } catch (e) {
      setSizes([
        { id: 1, name: '39', sort_order: 1 },
        { id: 2, name: '40', sort_order: 2 },
        { id: 3, name: '41', sort_order: 3 },
        { id: 4, name: '42', sort_order: 4 }
      ]);
    }
  };

  const loadSettingsData = async () => {
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      setShippingZones([
        { id: 1, name: 'Zone Abidjan Centre', price: 2000, delivery_days: 1, is_active: true },
        { id: 2, name: 'Zone Cocody / Riviera', price: 3000, delivery_days: 1, is_active: true }
      ]);
      setTeamUsers([
        { id: 1, name: 'Admin Principal', email: 'admin@boutique.ci', role: 'super_admin' },
        { id: 2, name: 'Agent Support', email: 'support@boutique.ci', role: 'service_client' }
      ]);
      return;
    }

    try {
      const zonesRes = await adminService.getShippingZones();
      if (zonesRes.success) setShippingZones(zonesRes.data || []);
    } catch (e) {
      setShippingZones([
        { id: 1, name: 'Zone Abidjan Centre', price: 2000, delivery_days: 1, is_active: true },
        { id: 2, name: 'Zone Cocody / Riviera', price: 3000, delivery_days: 1, is_active: true }
      ]);
    }

    try {
      const usersRes = await adminService.getUsers();
      if (usersRes.success) setTeamUsers(usersRes.data || []);
    } catch (e) {
      setTeamUsers([
        { id: 1, name: 'Admin Principal', email: 'admin@boutique.ci', role: 'super_admin' },
        { id: 2, name: 'Agent Support', email: 'support@boutique.ci', role: 'service_client' }
      ]);
    }
  };

  // ── EVENT ACTIONS FOR COMMANDS (ORDERS) ───────────────────────────────────

  const handleOpenOrder = async (orderId) => {
    setReadOrderIds(prev => {
      if (!prev.includes(orderId)) {
        const next = [...prev, orderId];
        localStorage.setItem('read_order_ids', JSON.stringify(next));
        return next;
      }
      return prev;
    });
    setLoading(true);
    setEditingHistoryIndex(null);
    setNewHistoryForm({
      status: 'pending',
      note: '',
      date: getLocalDatetimeString()
    });
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const order = list.find(o => o.id === orderId);
        if (order) {
          const items = order.items || [
            {
              id: 1,
              name: order.product_name || 'Produit Hakavod Premium',
              price: order.subtotal || (order.total - (order.shipping_cost || 3000)),
              quantity: 1,
              size: '40',
              color: 'Bordeaux'
            }
          ];
          const history = getOrderHistory(order);
          setSelectedOrder({
            ...order,
            items,
            history
          });
          setOrderStatusUpdate(order.status);
          setOrderNoteUpdate('');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const res = await adminService.getOrderById(orderId);
      const rawData = res.data || res;
      const data = {
        ...rawData,
        status: rawData.status === 'preparing' ? 'inprogress' : rawData.status
      };
      setSelectedOrder({
        ...data,
        items: data.items || [
          { id: 1, name: data.product_name || 'Produit Hakavod', price: data.subtotal || (data.total - 3000), quantity: 1, size: '40', color: 'Bordeaux' }
        ],
        history: data.history || getOrderHistory(data)
      });
      setOrderStatusUpdate(data.status);
      setOrderNoteUpdate('');
    } catch (e) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder({
          ...order,
          items: order.items || [
            { id: 1, name: order.product_name || 'Produit Hakavod', price: order.subtotal || (order.total - 3000), quantity: 1, size: '40', color: 'Bordeaux' }
          ],
          history: getOrderHistory(order)
        });
        setOrderStatusUpdate(order.status || 'pending');
        setOrderNoteUpdate('');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setLoading(true);
    
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(o => {
          if (o.id === selectedOrder.id) {
            const currentHistory = o.history || getOrderHistory(o);
            const newHistoryItem = {
              status: orderStatusUpdate,
              note: orderNoteUpdate || `Statut mis à jour vers ${orderStatusUpdate.toUpperCase()}`,
              date: new Date().toISOString()
            };
            return {
              ...o,
              status: orderStatusUpdate,
              history: [...currentHistory, newHistoryItem]
            };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
      }
      setSuccess("Le statut de la commande a été mis à jour avec succès.");
      setSelectedOrder(null);
      await loadOrdersData();
      setLoading(false);
      return;
    }
    
    try {
      const apiStatus = orderStatusUpdate === 'inprogress' ? 'preparing' : (orderStatusUpdate === 'pickups' ? 'preparing' : orderStatusUpdate);
      await adminService.updateOrderStatus(selectedOrder.id, apiStatus, orderNoteUpdate);
      setSuccess("Le statut de la commande a été mis à jour.");
      setSelectedOrder(null);
      await loadOrdersData();
    } catch (err) {
      console.error("Erreur de mise à jour du statut:", err);
      const apiError = err.response?.data?.message || err.response?.data?.error || err.message || "";
      setError(`Impossible de mettre à jour le statut. ${apiError}`);
    } finally {
      setLoading(false);
    }
  };

  // Cancellation Requests Handlers
  const handleAcceptCancellation = async () => {
    if (!selectedOrder) return;
    const confirmed = await showConfirm({
      title: "Accepter l'annulation",
      description: "Êtes-vous sûr de vouloir accepter l'annulation de cette commande ?",
      warningText: "La commande passera au statut Annulée de façon permanente.",
      confirmLabel: "Accepter",
    });
    if (!confirmed) return;

    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    // Always clear the flag from localStorage to sync the UI
    const stored = localStorage.getItem('mock_orders');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.map(o => {
        if (o.id === selectedOrder.id || (o.reference && selectedOrder.reference && o.reference.toUpperCase() === selectedOrder.reference.toUpperCase())) {
          const currentHistory = o.history || getOrderHistory(o);
          return {
            ...o,
            status: 'cancelled',
            cancellation_requested: false,
            history: [...currentHistory, {
              status: 'cancelled',
              note: 'Demande d\'annulation acceptée par l\'administrateur.',
              date: new Date().toISOString()
            }]
          };
        }
        return o;
      });
      localStorage.setItem('mock_orders', JSON.stringify(updatedList));
    }

    if (!isDemo) {
      try {
        await adminService.updateOrderStatus(selectedOrder.id, 'cancelled', 'Demande d\'annulation acceptée par l\'administrateur.');
      } catch (err) {
        console.error("Erreur API lors de l'annulation:", err);
      }
    }
    
    setSuccess("Demande d'annulation acceptée.");
    setSelectedOrder(null);
    await loadOrdersData();
  };

  const handleRefuseCancellation = async () => {
    if (!selectedOrder) return;
    const confirmed = await showConfirm({
      title: "Refuser l'annulation",
      description: "Êtes-vous sûr de vouloir refuser l'annulation de cette commande ?",
      warningText: "La commande reprendra son cours normal.",
      confirmLabel: "Refuser",
    });
    if (!confirmed) return;

    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    
    // Always clear the flag from localStorage to sync the UI
    const stored = localStorage.getItem('mock_orders');
    if (stored) {
      const list = JSON.parse(stored);
      const updatedList = list.map(o => {
        if (o.id === selectedOrder.id || (o.reference && selectedOrder.reference && o.reference.toUpperCase() === selectedOrder.reference.toUpperCase())) {
          const currentHistory = o.history || getOrderHistory(o);
          return {
            ...o,
            cancellation_requested: false,
            history: [...currentHistory, {
              status: o.status,
              note: 'Demande d\'annulation refusée par l\'administrateur. La commande se poursuit.',
              date: new Date().toISOString()
            }]
          };
        }
        return o;
      });
      localStorage.setItem('mock_orders', JSON.stringify(updatedList));
    }

    if (!isDemo) {
      // The backend doesn't track cancellation_requested, so we just add a note if possible.
      try {
        await adminService.updateOrderStatus(selectedOrder.id, selectedOrder.status, 'Demande d\'annulation refusée par l\'administrateur.');
      } catch (err) {
        console.error("Erreur API lors du refus de l'annulation:", err);
      }
    }
    
    setSuccess("Demande d'annulation refusée.");
    setSelectedOrder(null);
    await loadOrdersData();
  };

  // Timeline CRUD Actions
  const handleDeleteHistoryItem = async (idx) => {
    if (!selectedOrder) return;
    const confirmed = await showConfirm({
      title: "Supprimer l'événement",
      description: "Voulez-vous vraiment supprimer cet événement du suivi ?",
      warningText: "Cette action retirera cet événement de l'historique de suivi de la commande.",
      confirmLabel: "Supprimer",
    });
    if (!confirmed) return;
    
    const updatedHistory = selectedOrder.history.filter((_, i) => i !== idx);
    
    // Determine the new overall order status from the latest history item if any
    let newStatus = selectedOrder.status;
    if (updatedHistory.length > 0) {
      newStatus = updatedHistory[updatedHistory.length - 1].status;
    }
    
    // Update local state and localStorage
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(o => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              status: newStatus,
              history: updatedHistory
            };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
      }
    }
    
    setSelectedOrder(prev => ({
      ...prev,
      status: newStatus,
      history: updatedHistory
    }));
    
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: newStatus,
          history: updatedHistory
        };
      }
      return o;
    }));
    
    setSuccess("Événement de suivi supprimé avec succès.");
  };

  const handleStartEditHistoryItem = (idx, step) => {
    setEditingHistoryIndex(idx);
    setEditHistoryForm({
      status: step.status,
      note: step.note,
      date: toDatetimeLocalValue(step.date)
    });
  };

  const handleSaveEditHistoryItem = (idx) => {
    if (!selectedOrder) return;
    if (!editHistoryForm.status || !editHistoryForm.note) {
      setError("Le statut et la note ne peuvent pas être vides.");
      return;
    }
    
    const updatedHistory = selectedOrder.history.map((step, i) => {
      if (i === idx) {
        return {
          ...step,
          status: editHistoryForm.status,
          note: editHistoryForm.note,
          date: new Date(editHistoryForm.date || new Date()).toISOString()
        };
      }
      return step;
    });
    
    // If we edited the latest history item, also update the main order status to match
    let newStatus = selectedOrder.status;
    if (idx === updatedHistory.length - 1) {
      newStatus = editHistoryForm.status;
    }
    
    // Update local state and localStorage
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(o => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              status: newStatus,
              history: updatedHistory
            };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
      }
    }
    
    setSelectedOrder(prev => ({
      ...prev,
      status: newStatus,
      history: updatedHistory
    }));
    
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: newStatus,
          history: updatedHistory
        };
      }
      return o;
    }));
    
    setEditingHistoryIndex(null);
    setSuccess("Événement de suivi modifié avec succès.");
  };

  const handleAddNewHistoryItem = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!newHistoryForm.status || !newHistoryForm.note) {
      setError("Veuillez remplir le statut et la note de l'événement.");
      return;
    }
    
    const newEvent = {
      status: newHistoryForm.status,
      note: newHistoryForm.note,
      date: new Date(newHistoryForm.date || new Date()).toISOString()
    };
    
    const currentHistory = selectedOrder.history || [];
    const updatedHistory = [...currentHistory, newEvent];
    const newStatus = newEvent.status;
    
    // Update local state and localStorage
    const token = localStorage.getItem('auth_token');
    const isDemo = token && token.startsWith('mock-');
    if (isDemo) {
      const stored = localStorage.getItem('mock_orders');
      if (stored) {
        const list = JSON.parse(stored);
        const updatedList = list.map(o => {
          if (o.id === selectedOrder.id) {
            return {
              ...o,
              status: newStatus,
              history: updatedHistory
            };
          }
          return o;
        });
        localStorage.setItem('mock_orders', JSON.stringify(updatedList));
      }
    }
    
    setSelectedOrder(prev => ({
      ...prev,
      status: newStatus,
      history: updatedHistory
    }));
    
    setOrders(prevOrders => prevOrders.map(o => {
      if (o.id === selectedOrder.id) {
        return {
          ...o,
          status: newStatus,
          history: updatedHistory
        };
      }
      return o;
    }));
    
    // Reset form
    setNewHistoryForm({
      status: 'pending',
      note: '',
      date: getLocalDatetimeString()
    });
    setSuccess("Nouvel événement ajouté au suivi.");
  };

  // ── EVENT ACTIONS FOR PRODUCTS ────────────────────────────────────────────

  const handleOpenProductCreate = async () => {
    setIsViewMode(false);
    setProductForm({
      name: '',
      price: '',
      old_price: '',
      category_id: categories[0]?.id || '',
      sub_category_id: '',
      description: '',
      is_featured: false
    });
    setTempProductImages([]);
    setTempProductVideo(null);
    setVariantsList([]);
    setColorLinks([]);
    setWizardStep(1);
    setIsProductModalOpen(true);
    await loadAttributesData();
  };

  const handleOpenProductEdit = async (prodId) => {
    setIsViewMode(false);
    setLoading(true);
    try {
      const details = await adminService.getProductById(prodId);
      const prod = details.data || details;
      setSelectedProduct(prod);

      // Parse color links from description
      const rawDesc = prod.description || '';
      const match = rawDesc.match(/<!--color_links:([\s\S]*?)-->/);
      let parsedLinks = [];
      let cleanDesc = rawDesc;
      if (match) {
        try {
          parsedLinks = JSON.parse(match[1]);
          cleanDesc = rawDesc.replace(/<!--color_links:[\s\S]*?-->/, '').trim();
        } catch (e) {
          console.error("Failed to parse color links:", e);
        }
      }

      setProductForm({
        name: prod.name || '',
        price: prod.price || '',
        old_price: prod.old_price || '',
        category_id: prod.category_id || '',
        sub_category_id: prod.sub_category_id || '',
        description: cleanDesc,
        is_featured: prod.is_featured || false
      });
      setTempProductImages(prod.images || []);
      setTempProductVideo(prod.video || null);
      
      // Safe variants mapping to prevent undefined/NaN for color_id/size_id
      const loadedVariants = (prod.variants || []).map(v => ({
        ...v,
        color_id: v.color_id ?? v.color?.id ?? '',
        size_id: v.size_id ?? v.size?.id ?? ''
      }));
      setVariantsList(loadedVariants);

      setColorLinks(parsedLinks);
      setWizardStep(1);
      setIsProductModalOpen(true);
      await loadAttributesData();
    } catch (e) {
      setError("Impossible de charger les données du produit.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProductView = async (prodId) => {
    setIsViewMode(true);
    setLoading(true);
    try {
      const details = await adminService.getProductById(prodId);
      const prod = details.data || details;
      setSelectedProduct(prod);
      
      // Parse color links from description
      const rawDesc = prod.description || '';
      const match = rawDesc.match(/<!--color_links:([\s\S]*?)-->/);
      let parsedLinks = [];
      let cleanDesc = rawDesc;
      if (match) {
        try {
          parsedLinks = JSON.parse(match[1]);
          cleanDesc = rawDesc.replace(/<!--color_links:[\s\S]*?-->/, '').trim();
        } catch (e) {
          console.error("Failed to parse color links:", e);
        }
      }

      setProductForm({
        name: prod.name || '',
        price: prod.price || '',
        old_price: prod.old_price || '',
        category_id: prod.category_id || '',
        sub_category_id: prod.sub_category_id || '',
        description: cleanDesc,
        is_featured: prod.is_featured || false
      });
      setTempProductImages(prod.images || []);
      setTempProductVideo(prod.video || null);
      
      // Safe variants mapping to prevent undefined/NaN for color_id/size_id
      const loadedVariants = (prod.variants || []).map(v => ({
        ...v,
        color_id: v.color_id ?? v.color?.id ?? '',
        size_id: v.size_id ?? v.size?.id ?? ''
      }));
      setVariantsList(loadedVariants);

      setColorLinks(parsedLinks);
      setWizardStep(1);
      setIsProductModalOpen(true);
    } catch (e) {
      setError("Impossible de charger les détails du produit.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth_token');

    // Serialize color links metadata into description
    const serializeColorLinksIntoDescription = (cleanDescription = '', links = []) => {
      if (!links || links.length === 0) return cleanDescription;
      return `${cleanDescription.trim()}\n\n<!--color_links:${JSON.stringify(links)}-->`;
    };
    const finalDesc = serializeColorLinksIntoDescription(productForm.description, colorLinks);

    // 1. Check if we are updating an existing product
    if (selectedProduct && selectedProduct.id) {
      if (token && token.startsWith('mock-')) {
        const updatedProd = {
          ...selectedProduct,
          name: productForm.name,
          price: Number(productForm.price),
          old_price: productForm.old_price ? Number(productForm.old_price) : null,
          category_id: Number(productForm.category_id),
          sub_category_id: productForm.sub_category_id ? Number(productForm.sub_category_id) : null,
          description: finalDesc,
          is_featured: productForm.is_featured,
          category: categories.find(c => c.id === Number(productForm.category_id)) || { name: 'Maison' }
        };
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? updatedProd : p));
        setSelectedProduct(updatedProd);
        
        // Save to localStorage
        const stored = localStorage.getItem('mock_products');
        if (stored) {
          const list = JSON.parse(stored);
          const newList = list.map(p => p.id === selectedProduct.id ? updatedProd : p);
          localStorage.setItem('mock_products', JSON.stringify(newList));
        }
        
        setWizardStep(2);
        setSuccess("Informations de base mises à jour. Passez aux médias.");
        setLoading(false);
        return;
      }

      try {
        const productData = {
          name: productForm.name,
          price: Number(productForm.price),
          old_price: productForm.old_price ? Number(productForm.old_price) : null,
          category_id: Number(productForm.category_id),
          sub_category_id: productForm.sub_category_id ? Number(productForm.sub_category_id) : null,
          description: finalDesc,
          is_featured: productForm.is_featured
        };
        const res = await adminService.updateProduct(selectedProduct.id, productData);
        if (res.success && res.data) {
          const updated = res.data;
          setSelectedProduct(updated);
          setSuccess("Informations de base mises à jour. Passez aux médias.");
        } else {
          setSelectedProduct(prev => ({ ...prev, ...productData }));
          setSuccess("Informations de base mises à jour.");
        }
        await loadProductsData();
        setWizardStep(2);
      } catch (err) {
        setError(err.response?.data?.message || "Erreur de mise à jour du produit.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Creating a new product
    if (token && token.startsWith('mock-')) {
      const newProd = {
        id: Date.now(),
        name: productForm.name,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        category_id: Number(productForm.category_id),
        sub_category_id: productForm.sub_category_id ? Number(productForm.sub_category_id) : null,
        description: finalDesc,
        is_featured: productForm.is_featured,
        status: 'draft',
        category: categories.find(c => c.id === Number(productForm.category_id)) || { name: 'Maison' },
        images: [],
        variants: []
      };
      setSelectedProduct(newProd);
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      let list = [];
      if (stored) {
        list = JSON.parse(stored);
      }
      list.unshift(newProd);
      localStorage.setItem('mock_products', JSON.stringify(list));
      
      setWizardStep(2); // Go to image uploads
      setSuccess("Informations de base créées. Passez à l'ajout des médias.");
      setLoading(false);
      return;
    }

    try {
      // Create product as Draft
      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        category_id: Number(productForm.category_id),
        sub_category_id: productForm.sub_category_id ? Number(productForm.sub_category_id) : null,
        description: finalDesc,
        is_featured: productForm.is_featured
      };
      
      const res = await adminService.createProduct(productData);
      if (res.success && res.data) {
        const newProd = res.data;
        setSelectedProduct(newProd);
        setWizardStep(2); // Go to image uploads
        setSuccess("Informations de base créées. Passez à l'ajout des médias.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de création de produit.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImages = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedProduct) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const newImages = Array.from(files).map((file, idx) => ({
        id: Date.now() + idx,
        url: URL.createObjectURL(file),
        is_main: selectedProduct.images.length === 0 && idx === 0
      }));
      const updated = {
        ...selectedProduct,
        images: [...selectedProduct.images, ...newImages]
      };
      setSelectedProduct(updated);
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === selectedProduct.id ? updated : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      
      setSuccess("Images ajoutées avec succès.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images[]', files[i]);
      }
      const res = await adminService.uploadProductImages(selectedProduct.id, formData);
      const uploadSucceeded = res?.success !== false;
      if (uploadSucceeded) {
        setSuccess("Images ajoutées avec succès.");
        // Reload details to get uploaded images
        const updated = await adminService.getProductById(selectedProduct.id);
        setSelectedProduct(updated.data || updated);
      } else {
        throw new Error(res?.message || 'Échec de l’upload des images.');
      }
    } catch (err) {
      console.error("Erreur détaillée de l'upload d'images:", err);
      const serverMessage = err.response?.data?.message || err.message;
      setError(`Erreur lors de l'upload des images : ${serverMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!selectedProduct) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const updated = {
        ...selectedProduct,
        images: selectedProduct.images.filter(img => img.id !== imageId)
      };
      setSelectedProduct(updated);
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === selectedProduct.id ? updated : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      
      setSuccess("Image supprimée.");
      setLoading(false);
      return;
    }

    try {
      await adminService.deleteProductImage(selectedProduct.id, imageId);
      setSuccess("Image supprimée.");
      const updated = await adminService.getProductById(selectedProduct.id);
      setSelectedProduct(updated.data || updated);
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedProduct) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const updated = {
        ...selectedProduct,
        video: { url: URL.createObjectURL(file) }
      };
      setSelectedProduct(updated);
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === selectedProduct.id ? updated : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      
      setSuccess("Vidéo ajoutée.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('video', file);
      const res = await adminService.uploadProductVideo(selectedProduct.id, formData);
      if (res.success) {
        setSuccess("Vidéo ajoutée.");
        const updated = await adminService.getProductById(selectedProduct.id);
        setSelectedProduct(updated.data || updated);
      }
    } catch (err) {
      setError("Erreur d'upload vidéo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      const updated = {
        ...selectedProduct,
        video: null
      };
      setSelectedProduct(updated);
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === selectedProduct.id ? updated : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      
      setSuccess("Vidéo supprimée.");
      setLoading(false);
      return;
    }

    try {
      await adminService.deleteProductVideo(selectedProduct.id);
      setSuccess("Vidéo supprimée.");
      const updated = await adminService.getProductById(selectedProduct.id);
      setSelectedProduct(updated.data || updated);
    } catch (err) {
      setError("Erreur lors de la suppression de la vidéo.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariantRow = () => {
    // Find first available combo
    let foundCombo = null;
    outerLoop: for (const c of colors) {
      for (const s of sizes) {
        const exists = variantsList.some(v => Number(v.color_id) === Number(c.id) && Number(v.size_id) === Number(s.id));
        if (!exists) {
          foundCombo = { color_id: c.id, size_id: s.id };
          break outerLoop;
        }
      }
    }

    setVariantsList([
      ...variantsList,
      foundCombo ? { ...foundCombo, stock: 10, price: null, sku: '' } : { color_id: colors[0]?.id || '', size_id: sizes[0]?.id || '', stock: 10, price: null, sku: '' }
    ]);
  };

  const handleRemoveVariantRow = (index) => {
    setVariantsList(variantsList.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const newList = [...variantsList];
    newList[index][field] = value;
    setVariantsList(newList);
  };

  const handleSaveVariantsAndPublish = async (publishMode = 'available', date = null) => {
    if (!selectedProduct) return;
    
    // Front-end validation to prevent duplicate color-size variants
    const seenCombos = new Set();
    for (const v of variantsList) {
      if (!v.color_id || !v.size_id) {
        setError("Erreur : Veuillez renseigner la couleur et la taille de toutes les lignes de variantes.");
        return;
      }
      const comboKey = `${v.color_id}-${v.size_id}`;
      if (seenCombos.has(comboKey)) {
        const colorName = colors.find(c => c.id === Number(v.color_id))?.name || `ID ${v.color_id}`;
        const sizeName = sizes.find(s => s.id === Number(v.size_id))?.name || `ID ${v.size_id}`;
        setError(`Doublon détecté : La combinaison de couleur "${colorName}" et taille "${sizeName}" est présente plusieurs fois.`);
        return;
      }
      seenCombos.add(comboKey);
    }

    setLoading(true);
    setError('');
    const token = localStorage.getItem('auth_token');

    // Serialize color links metadata into description
    const serializeColorLinksIntoDescription = (cleanDescription = '', links = []) => {
      if (!links || links.length === 0) return cleanDescription;
      return `${cleanDescription.trim()}\n\n<!--color_links:${JSON.stringify(links)}-->`;
    };
    const finalDesc = serializeColorLinksIntoDescription(productForm.description, colorLinks);

    if (token && token.startsWith('mock-')) {
      const formattedVariants = variantsList.map((v, idx) => ({
        id: Date.now() + idx,
        color_id: Number(v.color_id),
        color: colors.find(c => c.id === Number(v.color_id)) || { name: 'Noir', hex_code: '#000000' },
        size_id: Number(v.size_id),
        size: sizes.find(s => s.id === Number(v.size_id)) || { name: 'Unique' },
        stock: Number(v.stock),
        price: v.price ? Number(v.price) : null,
        sku: v.sku || null
      }));
      const finalProduct = {
        ...selectedProduct,
        description: finalDesc,
        variants: formattedVariants,
        status: publishMode
      };
      
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const exists = list.some(p => p.id === selectedProduct.id);
        let newList;
        if (exists) {
          newList = list.map(p => p.id === selectedProduct.id ? finalProduct : p);
        } else {
          newList = [finalProduct, ...list];
        }
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      
      setSuccess("Produit configuré et publié avec succès !");
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      await loadProductsData();
      setLoading(false);
      return;
    }

    try {
      // 1. Save product info (with updated description containing color links)
      const productData = {
        name: productForm.name,
        price: Number(productForm.price),
        old_price: productForm.old_price ? Number(productForm.old_price) : null,
        category_id: Number(productForm.category_id),
        sub_category_id: productForm.sub_category_id ? Number(productForm.sub_category_id) : null,
        description: finalDesc,
        is_featured: productForm.is_featured
      };
      await adminService.updateProduct(selectedProduct.id, productData);

      // 2. Save variants
      const formattedVariants = variantsList.map(v => ({
        color_id: Number(v.color_id),
        size_id: Number(v.size_id),
        stock: Number(v.stock),
        price: v.price ? Number(v.price) : null,
        sku: v.sku || null
      }));
      await adminService.updateProductVariants(selectedProduct.id, formattedVariants);

      // 3. Publish Product
      await adminService.publishProduct(selectedProduct.id, publishMode, date);
      setSuccess("Produit configuré et publié avec succès !");
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      await loadProductsData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de publication.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishProduct = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === id ? { ...p, status: 'draft' } : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      await loadProductsData();
      setSuccess("Le produit a été remis en brouillon.");
      setLoading(false);
      return;
    }

    try {
      await adminService.unpublishProduct(id);
      setSuccess("Le produit a été remis en brouillon.");
      await loadProductsData();
    } catch (err) {
      setError("Erreur lors du retrait du produit.");
    } finally {
      setLoading(false);
    }
  };

  const handlePublishProduct = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.map(p => p.id === id ? { ...p, status: 'available' } : p);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      await loadProductsData();
      setSuccess("Le produit a été publié avec succès.");
      setLoading(false);
      return;
    }

    try {
      await adminService.publishProduct(id, 'available', null);
      setSuccess("Le produit a été publié avec succès.");
      await loadProductsData();
    } catch (err) {
      setError("Erreur lors de la publication du produit.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = await showConfirm({
      title: "Supprimer le produit",
      description: "Voulez-vous vraiment supprimer ce produit ?",
      warningText: "Cette action supprimera définitivement le produit du catalogue.",
      confirmLabel: "Supprimer",
    });
    if (!confirmed) return;
    setLoading(true);
    const token = localStorage.getItem('auth_token');
    if (token && token.startsWith('mock-')) {
      // Save to localStorage
      const stored = localStorage.getItem('mock_products');
      if (stored) {
        const list = JSON.parse(stored);
        const newList = list.filter(p => p.id !== id);
        localStorage.setItem('mock_products', JSON.stringify(newList));
      }
      await loadProductsData();
      setSuccess("Produit supprimé du catalogue.");
      setLoading(false);
      return;
    }

    try {
      await adminService.deleteProduct(id);
      setSuccess("Produit supprimé du catalogue.");
      await loadProductsData();
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
    }
  };

  // ── EVENT ACTIONS FOR CATEGORIES ──────────────────────────────────────────

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (categoryForm.id) {
        await adminService.updateCategory(categoryForm.id, {
          name: categoryForm.name,
          description: categoryForm.description,
          is_active: categoryForm.is_active
        });
        setSuccess("Catégorie mise à jour.");
      } else {
        await adminService.createCategory({
          name: categoryForm.name,
          description: categoryForm.description,
          is_active: categoryForm.is_active
        });
        setSuccess("Catégorie créée.");
      }
      setIsCategoryModalOpen(false);
      await loadCategoriesData();
    } catch (err) {
      setError("Erreur d'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = (id, name) => {
    setPendingDeleteCategory({ id, name });
    setIsDeleteCategoryDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    setIsDeleteCategoryDialogOpen(false);
    setLoading(true);
    try {
      await adminService.deleteCategory(pendingDeleteCategory.id);
      setSuccess("Catégorie supprimée.");
      await loadCategoriesData();
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
      setPendingDeleteCategory({ id: null, name: '' });
    }
  };

  const handleSaveSubCategory = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (subCategoryForm.id) {
        await adminService.updateSubCategory(subCategoryForm.id, {
          name: subCategoryForm.name,
          description: subCategoryForm.description
        });
        setSuccess("Sous-catégorie mise à jour.");
      } else {
        await adminService.createSubCategory(subCategoryForm.categoryId, {
          name: subCategoryForm.name,
          description: subCategoryForm.description
        });
        setSuccess("Sous-catégorie créée.");
      }
      setIsSubCategoryModalOpen(false);
      await loadCategoriesData();
    } catch (err) {
      setError("Erreur d'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubCategory = (id, name) => {
    setPendingDeleteSubCategory({ id, name });
    setIsDeleteSubCategoryDialogOpen(true);
  };

  const confirmDeleteSubCategory = async () => {
    setIsDeleteSubCategoryDialogOpen(false);
    setLoading(true);
    try {
      await adminService.deleteSubCategory(pendingDeleteSubCategory.id);
      setSuccess("Sous-catégorie supprimée.");
      await loadCategoriesData();
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
      setPendingDeleteSubCategory({ id: null, name: '' });
    }
  };

  // ── EVENT ACTIONS FOR ATTRIBUTES (COLORS/SIZES) ───────────────────────────

  const handleCreateColor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createColor(newColorForm);
      setSuccess("Couleur ajoutée.");
      setNewColorForm({ name: '', hex_code: '#000000' });
      await loadAttributesData();
    } catch (err) {
      setError("Erreur d'ajout de couleur.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteColor = async (id) => {
    setLoading(true);
    try {
      await adminService.deleteColor(id);
      setSuccess("Couleur supprimée.");
      await loadAttributesData();
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSize = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createSize({ name: newSizeForm.name, sort_order: Number(newSizeForm.sort_order) });
      setSuccess("Taille ajoutée.");
      setNewSizeForm({ name: '', sort_order: 0 });
      await loadAttributesData();
    } catch (err) {
      setError("Erreur d'ajout de taille.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSize = async (id) => {
    setLoading(true);
    try {
      await adminService.deleteSize(id);
      setSuccess("Taille supprimée.");
      await loadAttributesData();
    } catch (err) {
      setError("Erreur de suppression.");
    } finally {
      setLoading(false);
    }
  };

  // ── EVENT ACTIONS FOR SETTINGS (SHIPPING/TEAM) ────────────────────────────

  const handleSaveShippingZone = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (shippingForm.id) {
        await adminService.updateShippingZone(shippingForm.id, {
          name: shippingForm.name,
          price: Number(shippingForm.price),
          delivery_days: Number(shippingForm.delivery_days)
        });
        setSuccess("Tarif mis à jour.");
      } else {
        await adminService.createShippingZone({
          name: shippingForm.name,
          price: Number(shippingForm.price),
          delivery_days: Number(shippingForm.delivery_days)
        });
        setSuccess("Zone créée.");
      }
      setIsShippingModalOpen(false);
      await loadSettingsData();
    } catch (err) {
      setError("Erreur d'enregistrement.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeamUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createUser(teamForm);
      setSuccess(`Utilisateur ${teamForm.name} ajouté.`);
      setIsTeamModalOpen(false);
      setTeamForm({ name: '', email: '', password: '', role: 'admin' });
      await loadSettingsData();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeamUser = async (id) => {
    const confirmed = await showConfirm({
      title: "Désactiver le collaborateur",
      description: "Voulez-vous vraiment désactiver ce compte collaborateur ?",
      warningText: "Le collaborateur ne pourra plus accéder à l'interface d'administration.",
      confirmLabel: "Désactiver",
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await adminService.deleteUser(id);
      setSuccess("Compte désactivé.");
      await loadSettingsData();
    } catch (err) {
      setError("Erreur lors de l'opération.");
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for advanced products filtering and sorting (Velzon layout)
  const getActiveFiltersList = () => {
    const list = [];
    if (productFilterCategory) {
      const cat = categories.find(c => c.id === Number(productFilterCategory));
      if (cat) list.push({ type: 'category', label: cat.name, val: productFilterCategory });
    }
    if (productFilterStatus) {
      const labels = { available: 'Disponible', preorder: 'Précommande', draft: 'Brouillon', out_of_stock: 'Rupture' };
      list.push({ type: 'status', label: labels[productFilterStatus] || productFilterStatus, val: productFilterStatus });
    }
    if (productFilterStockAlert) {
      list.push({ type: 'stock', label: `Stock: ${productFilterStockAlert === 'low' ? 'Bas' : 'Rupture'}`, val: productFilterStockAlert });
    }
    if (productFilterPriceMin !== '') {
      list.push({ type: 'priceMin', label: `Min: ${productFilterPriceMin} XOF`, val: productFilterPriceMin });
    }
    if (productFilterPriceMax !== '') {
      list.push({ type: 'priceMax', label: `Max: ${productFilterPriceMax} XOF`, val: productFilterPriceMax });
    }
    productFilterColors.forEach(cId => {
      const col = colors.find(c => c.id === Number(cId));
      if (col) list.push({ type: 'color', label: col.name, val: cId });
    });
    productFilterSizes.forEach(sId => {
      const sz = sizes.find(s => s.id === Number(sId));
      if (sz) list.push({ type: 'size', label: `Taille: ${sz.name}`, val: sId });
    });
    return list;
  };

  const handleRemoveFilterTag = (tag) => {
    if (tag.type === 'category') setProductFilterCategory('');
    if (tag.type === 'status') setProductFilterStatus('');
    if (tag.type === 'stock') setProductFilterStockAlert('');
    if (tag.type === 'priceMin') setProductFilterPriceMin('');
    if (tag.type === 'priceMax') setProductFilterPriceMax('');
    if (tag.type === 'color') setProductFilterColors(prev => prev.filter(c => c !== tag.val));
    if (tag.type === 'size') setProductFilterSizes(prev => prev.filter(s => s !== tag.val));
    setCurrentPage(1);
  };

  const handleSort = (column) => {
    if (productSortBy === column) {
      setProductSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setProductSortBy(column);
      setProductSortOrder('asc');
    }
  };

  const getSortIcon = (column) => {
    if (productSortBy !== column) {
      return <span className="text-neutral-300 ml-1.5 inline-block text-[8px] font-normal">&#9650;&#9660;</span>;
    }
    return productSortOrder === 'asc' 
      ? <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9650;</span>
      : <span className="text-neutral-900 ml-1.5 inline-block text-[8px] font-bold">&#9660;</span>;
  };

  const handleSelectAllProducts = (e) => {
    if (e.target.checked) {
      setBulkSelectedProducts(products.map(p => p.id));
    } else {
      setBulkSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id, checked) => {
    if (checked) {
      setBulkSelectedProducts(prev => [...prev, id]);
    } else {
      setBulkSelectedProducts(prev => prev.filter(pId => pId !== id));
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const totalCartPrice = bagItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleNotificationClick = (notif) => {
    // Marquer comme lue
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    
    if (notif.key) {
      let storedReadIds = [];
      try {
        const stored = localStorage.getItem('read_notification_ids');
        if (stored) storedReadIds = JSON.parse(stored);
      } catch (e) {}
      if (!storedReadIds.includes(notif.key)) {
        storedReadIds.push(notif.key);
        localStorage.setItem('read_notification_ids', JSON.stringify(storedReadIds));
      }
    }

    // Action
    if (notif.orderId) {
      handleOpenOrder(notif.orderId);
      setActiveTab('orders');
    } else if (notif.search) {
      setActiveTab('products');
      setProductSearch(notif.search);
      setGlobalSearchQuery(notif.search);
    }
    setIsNotificationsOpen(false);
  };

  return (
    <div className={`min-h-screen flex text-left font-sans transition-colors duration-300 ${isDarkMode ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-800'}`}>
      
      {/* ── SIDEBAR DE NAVIGATION ───────────────────────────────────────────── */}
      <aside
        className="bg-neutral-950 text-white flex flex-col justify-between border-r border-neutral-800/60 shrink-0 transition-all duration-300 overflow-hidden sticky top-0 h-screen"
        style={{ width: isSidebarCollapsed ? '72px' : '260px' }}
      >
        {/* ── LOGO ── */}
        <div className="flex flex-col items-center justify-center border-b border-neutral-800/60 py-6 px-4">
          <img
            src="/logo.png"
            alt="Logo HA-KAVOD 97"
            className={`transition-all duration-300 object-contain ${isSidebarCollapsed ? 'w-9 h-9' : 'w-20 h-20'}`}
          />
          {!isSidebarCollapsed && (
            <div className="mt-3 text-center">
              <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-white leading-none">HA‑KAVOD 97</p>
              <p className="text-[9px] font-normal tracking-[0.25em] uppercase text-accent/80 mt-1">Administration</p>
            </div>
          )}
        </div>

        {/* ── NAV ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 flex flex-col gap-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-800">

          {/* ─ PRINCIPAL ─ */}
          {!isSidebarCollapsed && <p className="text-[8.5px] font-bold tracking-[0.25em] uppercase text-neutral-600 px-3 pt-1 pb-2">Principal</p>}

          {/* Tableau de bord */}
          <button
            onClick={() => { setActiveTab('dashboard'); setExpandedMenus({ orders: false, products: false, clients: false, settings: false, profile: false }); }}
            title="Tableau de bord"
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'dashboard' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'dashboard' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Tableau de bord</span>}
          </button>

          {/* ─ VENTES ─ */}
          {!isSidebarCollapsed && <p className="text-[8.5px] font-bold tracking-[0.25em] uppercase text-neutral-600 px-3 pt-4 pb-2">Ventes</p>}
          {isSidebarCollapsed && <div className="my-2 border-t border-neutral-800/60" />}

          {/* Commandes */}
          <div>
            <button
              onClick={() => {
                if (isSidebarCollapsed) { setIsSidebarCollapsed(false); setExpandedMenus({ orders: true, products: false, clients: false, settings: false, profile: false }); }
                else setExpandedMenus(prev => ({ ...prev, orders: !prev.orders, products: false, clients: false, settings: false, profile: false }));
              }}
              title="Commandes"
              className={`group w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'orders' ? 'bg-neutral-800/70 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              {activeTab === 'orders' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <ShoppingCart className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>{t.orders}</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${expandedMenus.orders ? 'rotate-180' : ''}`} />}
            </button>
            {!isSidebarCollapsed && expandedMenus.orders && (
              <div className="ml-4 pl-3 border-l border-neutral-800 mt-0.5 mb-1 flex flex-col gap-0.5">
                <button
                  onClick={() => { setActiveTab('orders'); setOrderSubTab('all'); setIsCreateOrderOpen(false); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'orders' && orderSubTab === 'all' && !isCreateOrderOpen ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'orders' && orderSubTab === 'all' && !isCreateOrderOpen ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Toutes les commandes
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setOrderSubTab('preorders'); setIsCreateOrderOpen(false); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'orders' && orderSubTab === 'preorders' ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'orders' && orderSubTab === 'preorders' ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Précommandes
                </button>
                <button
                  onClick={() => { setActiveTab('orders'); setOrderSubTab('all'); setIsCreateOrderOpen(true); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'orders' && isCreateOrderOpen ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'orders' && isCreateOrderOpen ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Créer une commande
                </button>
              </div>
            )}
          </div>

          {/* ─ CATALOGUE ─ */}
          {!isSidebarCollapsed && <p className="text-[8.5px] font-bold tracking-[0.25em] uppercase text-neutral-600 px-3 pt-4 pb-2">Catalogue</p>}
          {isSidebarCollapsed && <div className="my-2 border-t border-neutral-800/60" />}

          {/* Produits */}
          <div>
            <button
              onClick={() => {
                if (isSidebarCollapsed) { setIsSidebarCollapsed(false); setExpandedMenus({ orders: false, products: true, clients: false, settings: false, profile: false }); }
                else setExpandedMenus(prev => ({ ...prev, products: !prev.products, orders: false, clients: false, settings: false, profile: false }));
              }}
              title="Produits"
              className={`group w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'products' ? 'bg-neutral-800/70 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              {activeTab === 'products' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <Package className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>{t.products}</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${expandedMenus.products ? 'rotate-180' : ''}`} />}
            </button>
            {!isSidebarCollapsed && expandedMenus.products && (
              <div className="ml-4 pl-3 border-l border-neutral-800 mt-0.5 mb-1 flex flex-col gap-0.5">
                <button
                  onClick={() => { setActiveTab('products'); setIsProductModalOpen(false); setProductFilterStockAlert(''); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'products' && !isProductModalOpen && !productFilterStockAlert ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'products' && !isProductModalOpen && !productFilterStockAlert ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Tous les produits
                </button>
                <button
                  onClick={() => {
                    setActiveTab('products');
                    setIsProductModalOpen(true);
                    setIsViewMode(false);
                    setWizardStep(1);
                    setProductForm({ name: '', price: '', old_price: '', category_id: '', sub_category_id: '', description: '', is_featured: false });
                    setTempProductImages([]);
                    setTempProductVideo(null);
                    setVariantsList([]);
                  }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'products' && isProductModalOpen ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'products' && isProductModalOpen ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Ajouter un produit
                </button>
                <button
                  onClick={() => { setActiveTab('products'); setIsProductModalOpen(false); setProductFilterStockAlert('low'); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'products' && productFilterStockAlert === 'low' ? 'text-red-400' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'products' && productFilterStockAlert === 'low' ? 'bg-red-400' : 'bg-neutral-700'}`} />
                  ⚠ Alertes stock
                </button>
              </div>
            )}
          </div>

          {/* Catégories */}
          <button
            onClick={() => { setActiveTab('categories'); setExpandedMenus({ orders: false, products: false, clients: false, settings: false, profile: false }); }}
            title="Catégories"
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'categories' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'categories' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <FolderTree className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.categories}</span>}
          </button>

          {/* Attributs */}
          <button
            onClick={() => { setActiveTab('attributes'); setExpandedMenus({ orders: false, products: false, clients: false, settings: false, profile: false }); }}
            title="Attributs (Couleurs & Tailles)"
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'attributes' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'attributes' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <Palette className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.attributes}</span>}
          </button>

          {/* ─ ADMINISTRATION ─ */}
          {!isSidebarCollapsed && <p className="text-[8.5px] font-bold tracking-[0.25em] uppercase text-neutral-600 px-3 pt-4 pb-2">Administration</p>}
          {isSidebarCollapsed && <div className="my-2 border-t border-neutral-800/60" />}

          {/* Utilisateurs */}
          <button
            onClick={() => { setActiveTab('users'); setExpandedMenus({ orders: false, products: false, admin: false, profile: false }); }}
            title={t.users}
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'users' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'users' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <Users className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.users}</span>}
          </button>

          {/* Clients */}
          <button
            onClick={() => { setActiveTab('clients'); setExpandedMenus({ orders: false, products: false, admin: false, profile: false }); }}
            title={t.clients}
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'clients' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'clients' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <User className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.clients}</span>}
          </button>

          {/* Livraison */}
          <button
            onClick={() => { setActiveTab('shipping'); setExpandedMenus({ orders: false, products: false, admin: false, profile: false }); }}
            title={t.shipping}
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'shipping' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'shipping' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <Truck className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.shipping}</span>}
          </button>

          {/* Bannières Hero */}
          <button
            onClick={() => { setActiveTab('hero-slides'); setExpandedMenus({ orders: false, products: false, admin: false, profile: false }); }}
            title={t.heroBanners}
            className={`group w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'hero-slides' ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
          >
            {activeTab === 'hero-slides' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
            <Sliders className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.heroBanners}</span>}
          </button>

          {/* Notifications (Templates & Campaigns) */}
          <div>
            <button
              onClick={() => {
                if (isSidebarCollapsed) { setIsSidebarCollapsed(false); setExpandedMenus({ orders: false, products: false, admin: false, profile: false, notifications: true }); }
                else setExpandedMenus(prev => ({ ...prev, notifications: !prev.notifications, orders: false, products: false, profile: false }));
              }}
              title="Notifications"
              className={`group w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'notifications' ? 'bg-neutral-800/70 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              {activeTab === 'notifications' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <Bell className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Notifications</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${expandedMenus.notifications ? 'rotate-180' : ''}`} />}
            </button>
            {!isSidebarCollapsed && expandedMenus.notifications && (
              <div className="ml-4 pl-3 border-l border-neutral-800 mt-0.5 mb-1 flex flex-col gap-0.5">
                <button
                  onClick={() => { setActiveTab('notification-templates'); setExpandedMenus(prev => ({ ...prev, notifications: false })); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'notification-templates' ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'notification-templates' ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Templates
                </button>
                <button
                  onClick={() => { setActiveTab('notification-campaigns'); setExpandedMenus(prev => ({ ...prev, notifications: false })); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'notification-campaigns' ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'notification-campaigns' ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Campaigns
                </button>
              </div>
            )}
          </div>

          {/* ─ COMPTE ─ */}
          {!isSidebarCollapsed && <p className="text-[8.5px] font-bold tracking-[0.25em] uppercase text-neutral-600 px-3 pt-4 pb-2">Compte</p>}
          {isSidebarCollapsed && <div className="my-2 border-t border-neutral-800/60" />}

          {/* Mon Profil */}
          <div>
            <button
              onClick={() => {
                if (isSidebarCollapsed) { setIsSidebarCollapsed(false); setExpandedMenus({ orders: false, products: false, clients: false, settings: false, profile: true }); }
                else setExpandedMenus(prev => ({ ...prev, profile: !prev.profile, orders: false, products: false, clients: false, settings: false }));
              }}
              title="Mon Profil"
              className={`group w-full flex items-center justify-between px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider transition-all duration-150 relative ${activeTab === 'profile' ? 'bg-neutral-800/70 text-white' : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'}`}
            >
              {activeTab === 'profile' && !isSidebarCollapsed && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent" />}
              <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : 'gap-3'}`}>
                <User className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Mon profil</span>}
              </div>
              {!isSidebarCollapsed && <ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 ${expandedMenus.profile ? 'rotate-180' : ''}`} />}
            </button>
            {!isSidebarCollapsed && expandedMenus.profile && (
              <div className="ml-4 pl-3 border-l border-neutral-800 mt-0.5 mb-1 flex flex-col gap-0.5">
                <button
                  onClick={() => { setActiveTab('profile'); }}
                  className={`flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left transition-colors ${activeTab === 'profile' ? 'text-accent' : 'text-neutral-500 hover:text-white'}`}
                >
                  <span className={`w-1 h-1 rounded-full shrink-0 ${activeTab === 'profile' ? 'bg-accent' : 'bg-neutral-700'}`} />
                  Mes informations
                </button>
                <button
                  onClick={() => { setActiveTab('profile'); setTimeout(() => { const el = document.getElementById('change-password-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 100); }}
                  className="flex items-center gap-2 py-2 px-2 text-[10.5px] font-normal uppercase tracking-wider text-left text-neutral-500 hover:text-white transition-colors"
                >
                  <span className="w-1 h-1 rounded-full shrink-0 bg-neutral-700" />
                  Changer le mot de passe
                </button>
              </div>
            )}
          </div>

        </div>

        {/* ── DÉCONNEXION ── */}
        <div className="border-t border-neutral-800/60 p-3">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-2.5 px-2 py-2 mb-2">
              <div className="w-7 h-7 rounded-full border border-[#C5A059] bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                <Crown className="w-3.5 h-3.5 text-[#C5A059]" />
              </div>
              <div className="min-w-0">
                <p className="text-[10.5px] font-semibold text-white truncate">{adminUser?.name || 'Administrateur'}</p>
                <p className="text-[9px] text-neutral-500 truncate">{adminUser?.email || 'admin@hakavod97.com'}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title={t.logout}
            className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 text-[11px] font-normal uppercase tracking-wider text-red-400/80 hover:bg-red-950/40 hover:text-red-300 transition-colors`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* ── ZONE DE DROITE (Header + Contenu) ───────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* ── HEADER HORIZONTAL GLOBAL (Velzon Style) ────────────────────────── */}
        <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-40 transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900 border-b border-neutral-800 text-white shadow-lg' : 'bg-white border-b border-neutral-200 text-neutral-800'}`}>
          
          {/* Côté gauche : Hamburger & Recherche */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarCollapsed(prev => !prev)}
              className={`p-2 transition-colors rounded-none ${isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
              title="Masquer/Afficher la barre latérale"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-neutral-400" />
              </span>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                className={`px-3 py-1.5 pl-9 text-xs focus:outline-none w-64 rounded-none transition-all ${isDarkMode ? 'bg-neutral-800 border border-neutral-800 text-white focus:border-neutral-600 focus:bg-neutral-900' : 'bg-neutral-50 border border-neutral-200 text-neutral-800 focus:border-neutral-400 focus:bg-white'}`}
              />
              {globalSearchQuery && (
                <button
                  onClick={() => setGlobalSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600 text-xs"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          
          {/* Côté droit : Actions & Profil utilisateur */}
          <div className="flex items-center gap-2">
            

            
            {/* Plein écran */}
            <button 
              onClick={toggleFullscreen}
              className={`p-2.5 transition-colors rounded-none ${isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              <Maximize className="w-4 h-4" />
            </button>
            
            {/* Mode Sombre / Mode Clair */}
            <button 
              onClick={() => setIsDarkMode(prev => !prev)}
              className={`p-2.5 transition-colors rounded-none ${isDarkMode ? 'text-yellow-400 hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
              title={isDarkMode ? t.lightModeLabel : t.darkModeLabel}
            >
              <Moon className="w-4 h-4" />
            </button>
            
            {/* Notifications avec badge rouge "3" et Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(prev => !prev);
                  setIsLanguageDropdownOpen(false);
                  setIsGridDropdownOpen(false);
                  setIsCartDropdownOpen(false);
                  setIsProfileDropdownOpen(false);
                }}
                className={`p-2.5 transition-colors rounded-none relative ${isNotificationsOpen ? (isDarkMode ? 'bg-neutral-800 text-white' : 'bg-neutral-50 text-neutral-950') : (isDarkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50')}`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-bold text-[8px] h-3.5 px-1 flex items-center justify-center rounded-none border border-white">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown des Notifications */}
              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                  <div className={`absolute right-0 mt-1.5 w-80 border shadow-xl z-50 text-xs rounded-none text-left animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                    <div className={`p-3 font-black uppercase tracking-wider text-[9px] flex justify-between items-center ${isDarkMode ? 'bg-neutral-850 text-white' : 'bg-neutral-950 text-white'}`}>
                      <span>{t.notifications}</span>
                      {unreadNotificationsCount > 0 ? (
                        <span className="bg-red-500 text-white px-1.5 py-0.5 text-[8px] font-bold">
                          {unreadNotificationsCount} {t.newNotifications}
                        </span>
                      ) : (
                        <span className="text-[8px] text-neutral-400 font-bold uppercase">{t.noNewNotifications}</span>
                      )}
                    </div>
                    <div className="divide-y divide-neutral-100 max-h-64 overflow-y-auto" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3 transition-colors cursor-pointer flex justify-between items-start ${notif.read ? 'opacity-60' : 'font-semibold'} ${isDarkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-50'}`}
                        >
                          <div className="flex-1 pr-2">
                            <div className="flex justify-between items-start mb-1">
                              <span className={`font-bold ${notif.type === 'stock' ? 'text-red-500' : (isDarkMode ? 'text-white' : 'text-neutral-900')}`}>
                                {currentLanguage === 'FR' ? notif.title : notif.titleEn}
                              </span>
                              <span className="text-[9px] text-neutral-400 font-medium shrink-0 ml-2">{notif.time}</span>
                            </div>
                            <p className="text-neutral-500 text-[11px] leading-relaxed">
                              {currentLanguage === 'FR' ? notif.desc : notif.descEn}
                            </p>
                          </div>
                          {!notif.read && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-none mt-1.5 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="p-2 border-t border-neutral-100 text-center" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                      <button onClick={() => {
                        setIsNotificationsOpen(false);
                        const allKeys = notifications.map(n => n.key).filter(k => k);
                        let storedReadIds = [];
                        try {
                          const stored = localStorage.getItem('read_notification_ids');
                          if (stored) storedReadIds = JSON.parse(stored);
                        } catch (e) {}
                        const updated = Array.from(new Set([...storedReadIds, ...allKeys]));
                        localStorage.setItem('read_notification_ids', JSON.stringify(updated));
                        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      }} className="text-primary hover:underline font-bold uppercase tracking-wider text-[9px] w-full">
                        {t.allNotifications}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Profil Utilisateur (Dropdown style Velzon) */}
            <div className="relative ml-2">
              <button 
                onClick={() => {
                  setIsProfileDropdownOpen(prev => !prev);
                  setIsLanguageDropdownOpen(false);
                  setIsGridDropdownOpen(false);
                  setIsCartDropdownOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className={`flex items-center gap-3 pl-3 pr-4 py-1.5 border transition-colors rounded-none ${isProfileDropdownOpen ? (isDarkMode ? 'bg-neutral-800 border-neutral-700' : 'bg-neutral-100 border-neutral-300') : (isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:bg-neutral-800' : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200')}`}
              >
                <div className="w-8 h-8 rounded-full border border-[#C5A059] bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                  <Crown className="w-4 h-4 text-[#C5A059]" />
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold leading-tight" style={{ color: isDarkMode ? '#ffffff' : '#2d251d' }}>
                    {adminUser?.name || 'Anna Adame'}
                  </p>
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider leading-none mt-0.5">
                    {adminUser?.role === 'super_admin' ? 'Founder' : (adminUser?.role || 'Founder')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              </button>
              
              {/* Dropdown de Profil */}
              {isProfileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileDropdownOpen(false)} />
                  <div className={`absolute right-0 mt-1.5 w-48 border shadow-xl z-50 text-xs rounded-none text-left animate-fade-in ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                    <div className="p-3 border-b border-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                      <p className="font-bold">{t.welcome}</p>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveTab('profile');
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2.5 font-semibold transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      >
                        <User className="w-3.5 h-3.5 text-neutral-400" />
                        {t.myProfile}
                      </button>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setActiveTab('settings');
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2.5 font-semibold transition-colors ${isDarkMode ? 'hover:bg-neutral-800 text-neutral-200' : 'hover:bg-neutral-50 text-neutral-700'}`}
                      >
                        <Settings className="w-3.5 h-3.5 text-neutral-400" />
                        {t.settingsLabel}
                      </button>
                    </div>
                    <div className="border-t border-neutral-100 py-1" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                      <button 
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className={`w-full text-left px-4 py-2 flex items-center gap-2.5 font-bold uppercase tracking-wider text-[10px] text-red-600 transition-colors ${isDarkMode ? 'hover:bg-red-950/30' : 'hover:bg-red-50'}`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        {t.logout}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            
          </div>
        </header>

        {/* ── ZONE DE CONTENU PRINCIPAL ───────────────────────────────────────── */}
        <main className="flex-1 p-8 overflow-y-auto flex flex-col justify-between">
          
          <div>
            {/* Header de section */}
            <header className={`flex justify-between items-center mb-8 pb-4 border-b transition-colors duration-300 ${isDarkMode ? 'border-neutral-850' : 'border-neutral-200'}`}>
              <div>
                <h1 className={`text-xl font-black uppercase tracking-widest m-0 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {activeTab === 'dashboard' && t.dashboard}
                  {activeTab === 'orders' && t.orders}
                  {activeTab === 'clients' && t.clients}
                  {activeTab === 'products' && t.products}
                  {activeTab === 'categories' && t.categories}
                  {activeTab === 'attributes' && t.attributes}
                  {activeTab === 'shipping' && t.shipping}
                  {activeTab === 'hero-slides' && t.heroBanners}
                  {activeTab === 'users' && t.users}
                  {activeTab === 'settings' && t.settings}
                  {activeTab === 'notification-templates' && 'Notification Templates'}
                  {activeTab === 'notification-campaigns' && 'Notification Campaigns'}
                </h1>
                <p className="text-xs text-neutral-400 font-medium mt-1">
                  {activeTab === 'dashboard' && t.dashboardDesc}
                  {activeTab === 'orders' && t.ordersDesc}
                  {activeTab === 'clients' && t.clientsDesc}
                  {activeTab === 'products' && t.productsDesc}
                  {activeTab === 'categories' && t.categoriesDesc}
                  {activeTab === 'attributes' && t.attributesDesc}
                  {activeTab === 'shipping' && t.shippingDesc}
                  {activeTab === 'hero-slides' && t.heroBannersDesc}
                  {activeTab === 'users' && t.usersDesc}
                  {activeTab === 'settings' && t.settingsDesc}
                  {activeTab === 'notification-templates' && 'Gérez les modèles de notification.'}
                  {activeTab === 'notification-campaigns' && 'Gérez les campagnes de notification et prévisualisez leur audience.'}
                </p>
              </div>
            </header>

          {/* Messages de statut */}
          {error && (
            <div className={`border-l-4 p-4 text-[10px] font-bold uppercase tracking-wider mb-6 flex justify-between items-center shadow-2xs ${isDarkMode ? 'bg-red-950/20 border-red-600 text-red-300' : 'bg-red-50/70 border-red-500 text-red-800'}`}>
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-650 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError('')} className={`p-1 cursor-pointer transition-colors ${isDarkMode ? 'text-red-400 hover:text-white' : 'text-red-500 hover:text-red-800'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {success && (
            <div className={`border-l-4 p-4 text-[10px] font-bold uppercase tracking-wider mb-6 flex justify-between items-center shadow-2xs ${isDarkMode ? 'bg-neutral-900 border-accent text-accent-light' : 'bg-neutral-100 border-neutral-350 text-neutral-850'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                <span>{success}</span>
              </div>
              <button onClick={() => setSuccess('')} className={`p-1 cursor-pointer transition-colors ${isDarkMode ? 'text-accent hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`}>
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 1 – TABLEAU DE BORD (DASHBOARD)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 border border-neutral-200 shadow-2xs flex items-center gap-4">
                  <div className="p-3.5 bg-neutral-950 text-white">
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Chiffre d'Affaires</span>
                    <span className="text-xl font-black text-neutral-900 mt-1 block">{formatPrice(dashboardStats.total_revenue)}</span>
                  </div>
                </div>

                <div className="bg-white p-6 border border-neutral-200 shadow-2xs flex items-center gap-4">
                  <div className="p-3.5 bg-neutral-950 text-white">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Commandes Totales</span>
                    <span className="text-xl font-black text-neutral-900 mt-1 block">{dashboardStats.orders_count}</span>
                  </div>
                </div>

                <div className="bg-white p-6 border border-neutral-200 shadow-2xs flex items-center gap-4">
                  <div className="p-3.5 bg-neutral-950 text-white">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Précommandes</span>
                    <span className="text-xl font-black text-neutral-900 mt-1 block">{dashboardStats.preorders_count}</span>
                  </div>
                </div>

                <div className="bg-white p-6 border border-neutral-200 shadow-2xs flex items-center gap-4">
                  <div className="p-3.5 bg-neutral-950 text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">Panier Moyen</span>
                    <span className="text-xl font-black text-neutral-900 mt-1 block">{formatPrice(dashboardStats.avg_order_value)}</span>
                  </div>
                </div>
              </div>

              {/* Revenue Card (Combined Chart) */}
              <div className="bg-white border border-neutral-200 p-6 shadow-2xs space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-neutral-150 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-800">Revenue</h3>
                  <div className="flex bg-neutral-100 p-0.5 border border-neutral-200 rounded-none">
                    {['ALL', '1M', '6M', '1Y'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        onClick={() => setRevenueTimeRange(range)}
                        className={`px-3 py-1 text-[9px] font-black uppercase rounded-none cursor-pointer transition-colors ${
                          revenueTimeRange === range
                            ? 'bg-[#3577f1]/10 text-[#3577f1] border border-[#3577f1]/20'
                            : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 border-b border-neutral-200/60 pb-5 text-center gap-4">
                  <div className="py-1 border-r border-neutral-150 last:border-r-0">
                    <span className="text-lg font-black text-neutral-800 block">{dashboardStats.orders_count || 0}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Commandes</span>
                  </div>
                  <div className="py-1 border-r border-neutral-150 last:border-r-0">
                    <span className="text-lg font-black text-neutral-800 block">{formatPrice(dashboardStats.total_revenue || 0)}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Chiffre d'Affaires</span>
                  </div>
                  <div className="py-1 border-r border-neutral-150 last:border-r-0">
                    <span className="text-lg font-black text-neutral-800 block">{dashboardStats.preorders_count || 0}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Précommandes</span>
                  </div>
                  <div className="py-1 border-r border-neutral-150 last:border-r-0">
                    <span className="text-lg font-black text-primary block">{dashboardStats.conversion_rate ? `${dashboardStats.conversion_rate}%` : '3.4%'}</span>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 block">Taux de conversion</span>
                  </div>
                </div>

                {/* Combined Chart SVG */}
                {(() => {
                  const chartData = ordersChartData && ordersChartData.length > 0
                    ? ordersChartData
                    : [
                        { date: '01/06', amount: 0 },
                        { date: '15/06', amount: 0 }
                      ];

                  const maxAmount = Math.max(...chartData.map(d => d.amount || 0), 100000);
                  
                  const yScale = (val) => 240 - (val / maxAmount) * 220;
                  const xScale = (index) => 70 + (index / Math.max(chartData.length - 1, 1)) * 900;
                  
                  // 5 Y-axis grid values
                  const gridValues = Array.from({ length: 6 }, (_, i) => (maxAmount / 5) * (5 - i));

                  // Path for the amount line
                  const lineD = chartData.reduce((acc, curr, index) => {
                    const x = xScale(index);
                    const y = yScale(curr.amount || 0);
                    return acc + `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }, '');

                  const areaD = lineD ? `${lineD} L ${xScale(chartData.length - 1)} 240 L ${xScale(0)} 240 Z` : '';

                  // Show subset of labels if there are too many (e.g. 30 days) to prevent overlapping
                  const labelInterval = Math.ceil(chartData.length / 8) || 1;

                  return (
                    <div className="w-full flex flex-col items-center">
                      <svg className="w-full h-72 overflow-visible" viewBox="0 0 1000 280">
                        {/* Grid lines & Y Axis labels */}
                        {gridValues.map((val) => {
                          const y = yScale(val);
                          return (
                            <g key={val}>
                              <text x="50" y={y + 4} textAnchor="end" className="text-[9px] font-semibold fill-neutral-400">
                                {formatPrice(val)}
                              </text>
                              <line x1="60" y1={y} x2="990" y2={y} stroke="#f0eded" strokeDasharray="3" />
                            </g>
                          );
                        })}

                        {/* X Axis labels */}
                        {chartData.map((item, index) => {
                          if (index % labelInterval !== 0 && index !== chartData.length - 1) return null;
                          return (
                            <text key={index} x={xScale(index)} y="265" textAnchor="middle" className="text-[9px] font-bold fill-neutral-400">
                              {item.date}
                            </text>
                          );
                        })}

                        {/* Area & Line (Primary/Accent theme colors) */}
                        {chartData.length > 1 && lineD && (
                          <g>
                            <path d={areaD} fill="#540c14" fillOpacity="0.05" className="transition-all duration-300" />
                            <path d={lineD} fill="none" stroke="#540c14" strokeWidth="2.5" className="transition-all duration-300" />
                          </g>
                        )}

                        {/* Point Markers */}
                        {chartData.map((item, index) => {
                          const x = xScale(index);
                          const y = yScale(item.amount || 0);
                          return (
                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="3.5"
                              fill="#c5a059"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                              className="cursor-pointer hover:r-5 transition-all"
                              title={`${item.date}: ${formatPrice(item.amount || 0)}`}
                            />
                          );
                        })}
                      </svg>

                      {/* Legend */}
                      <div className="flex justify-center items-center gap-6 mt-4 pt-2 border-t border-neutral-100 w-full text-[10px] font-bold">
                        <div className="flex items-center gap-2 text-neutral-600">
                          <span className="w-2.5 h-2.5 rounded-none bg-[#540c14] inline-block" />
                          Volume des ventes (Chiffre d'Affaires)
                        </div>
                        <div className="flex items-center gap-2 text-neutral-600">
                          <span className="w-2 h-2 rounded-full bg-[#c5a059] inline-block" />
                          Points de relevés
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Row: Alerts and Top Products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Alerts */}
                <div className="bg-white border border-neutral-200 p-6 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-3">Alertes de Stock Bas</h3>
                  {stockAlerts.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      {stockAlerts.map(alert => (
                        <div key={alert.sku} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-neutral-800">{alert.name}</p>
                            <p className="text-[10px] text-neutral-400 font-medium">SKU: {alert.sku} | Var: {alert.color} / {alert.size}</p>
                          </div>
                          <span className={`font-bold px-2 py-0.5 ${alert.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {alert.stock} en stock
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-8">Tous les stocks sont corrects.</p>
                  )}
                </div>
                {/* Top Products */}
                <div className="bg-white border border-neutral-200 p-6 shadow-2xs">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 border-b border-neutral-100 pb-3">Produits les plus vendus</h3>
                  {topProducts.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      {topProducts.map(p => (
                        <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                          <span className="font-bold text-neutral-800">{p.name}</span>
                          <div className="text-right">
                            <p className="font-extrabold text-neutral-900">{formatPrice(p.revenue)}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">{p.total_ordered} commandés</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 text-center py-8">Aucune commande enregistrée.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 2 – COMMANDES (ORDERS)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'orders' && (() => {
            // Compute paginated orders
            const indexOfLastOrder = orderCurrentPage * 10;
            const indexOfFirstOrder = indexOfLastOrder - 10;
            const paginatedOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

            return (
              <div className="space-y-4 text-xs animate-fade-in">
                {/* TOP ACTION BAR */}
                <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none">
                  <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[11px]">Order History</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsCreateOrderOpen(true);
                        setCreateOrderForm({
                          customer_name: '',
                          customer_email: '',
                          customer_phone: '',
                          shipping_address: '',
                          billing_address: '',
                          product_name: '',
                          product_price: '',
                          quantity: 1,
                          size: 'Standard',
                          color: 'N/A',
                          shipping_cost: 3000,
                          payment_method: 'Orange Money',
                          status: 'pending'
                        });
                      }}
                      className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold py-2 px-4 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer rounded-none text-[11px]"
                    >
                      <Plus className="w-4 h-4" />
                      Create Order
                    </button>
                    <button
                      className="bg-[#3577f1] hover:bg-[#2e6ae1] text-white font-bold py-2 px-4 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer rounded-none text-[11px]"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      Import
                    </button>
                  </div>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for order ID, customer, order status or something.."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="border border-neutral-200 pl-3 pr-9 py-1.5 w-full text-[11px] focus:outline-none focus:border-neutral-800 bg-white rounded-none"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2.5" />
                  </div>

                  <input
                    type="date"
                    value={orderFilterDate}
                    onChange={(e) => setOrderFilterDate(e.target.value)}
                    className="border border-neutral-200 px-3 py-1.5 w-full text-[11px] focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 font-semibold"
                  />

                  <select
                    value={orderFilterStatusSelect}
                    onChange={(e) => setOrderFilterStatusSelect(e.target.value)}
                    className="border border-neutral-200 px-3 py-1.5 w-full text-[11px] focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 font-semibold"
                  >
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="inprogress">En cours</option>
                    <option value="pickups">À récupérer</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="returns">Retournée</option>
                    <option value="cancelled">Annulée</option>
                  </select>

                  <select
                    value={orderFilterPaymentSelect}
                    onChange={(e) => setOrderFilterPaymentSelect(e.target.value)}
                    className="border border-neutral-200 px-3 py-1.5 w-full text-[11px] focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 font-semibold"
                  >
                    <option value="">Payment (All)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Momo">MTN Momo</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Wave">Wave</option>
                    <option value="Carte Bancaire">Carte Bancaire</option>
                  </select>

                  <button
                    onClick={() => {
                      setOrderSearch('');
                      setOrderFilterDate('');
                      setOrderFilterStatusSelect('');
                      setOrderFilterPaymentSelect('');
                      setOrderFilterStatusTab('all');
                      setOrderCurrentPage(1);
                    }}
                    className="bg-[#405189] hover:bg-[#364473] text-white font-bold py-1.5 px-4 uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-none text-[11px] w-full"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Filters
                  </button>
                </div>

                {/* STATUS TABS */}
                <div className="flex border-b border-neutral-200 bg-white px-2">
                  {[
                    { id: 'all', label: 'All Orders', icon: ShoppingCart },
                    { id: 'delivered', label: 'Delivered', icon: CheckCircle },
                    { id: 'pickups', label: 'Pickups', icon: Truck, count: orders.filter(o => o.status === 'pickups').length },
                    { id: 'returns', label: 'Returns', icon: RefreshCcw },
                    { id: 'cancelled', label: 'Cancelled', icon: XCircle }
                  ].map(tab => {
                    const isActive = orderFilterStatusTab === tab.id;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setOrderFilterStatusTab(tab.id);
                          setOrderCurrentPage(1);
                        }}
                        className={`flex items-center gap-1.5 py-3 px-4 text-[11px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                          isActive
                            ? 'border-[#0ab39c] text-[#0ab39c] font-black'
                            : 'border-transparent text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{tab.label}</span>
                        {tab.id === 'pickups' && tab.count > 0 && (
                          <span className="bg-[#f06548] text-white text-[9px] font-black px-1.5 py-0.5 rounded-none">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* DATATABLE */}
                <div className="bg-white border border-neutral-200/60 shadow-3xs overflow-x-auto rounded-none">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-400 font-bold uppercase tracking-wider select-none">
                        <th className="p-4 w-10">
                          <input
                            type="checkbox"
                            onChange={handleSelectAllOrders}
                            checked={orders.length > 0 && bulkSelectedOrders.length === orders.length}
                            className="w-3.5 h-3.5 accent-[#0ab39c] rounded-none cursor-pointer"
                          />
                        </th>
                        {[
                          { id: 'reference', label: 'Order ID' },
                          { id: 'customer_name', label: 'Customer' },
                          { id: 'product_name', label: 'Product' },
                          { id: 'created_at', label: 'Order Date' },
                          { id: 'total', label: 'Amount' },
                          { id: 'payment_method', label: 'Payment Method' },
                          { id: 'status', label: 'Delivery Status' }
                        ].map(col => (
                          <th
                            key={col.id}
                            onClick={() => handleOrderSort(col.id)}
                            className="p-4 cursor-pointer hover:bg-neutral-100 text-neutral-500 font-bold text-[10px]"
                          >
                            <div className="flex items-center">
                              {col.label}
                              {getOrderSortIcon(col.id)}
                            </div>
                          </th>
                        ))}
                        <th className="p-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                      {paginatedOrders.map(order => {
                        const isSelected = bulkSelectedOrders.includes(order.id);
                        return (
                          <tr
                            key={order.id}
                            className={`hover:bg-neutral-50/50 transition-colors ${
                              isSelected ? 'bg-blue-50/25' : ''
                            }`}
                          >
                            <td className="p-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleSelectOrder(order.id, e.target.checked)}
                                className="w-3.5 h-3.5 accent-[#0ab39c] rounded-none cursor-pointer"
                              />
                            </td>
                            <td className="p-4 font-bold text-neutral-900 tracking-wider">
                              <div className="flex items-center gap-2">
                                <span>{order.reference}</span>
                                {order.status && (order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'preorder_pending') && !readOrderIds.includes(order.id) && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider bg-blue-50 text-blue-700 border border-blue-200 uppercase animate-pulse">
                                    {t.newOrder || 'Nouveau'}
                                  </span>
                                )}
                                {order.cancellation_requested && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider bg-orange-50 text-orange-700 border border-orange-200 uppercase">
                                    Annulation Dmd.
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 font-bold text-[#405189] hover:underline cursor-pointer" onClick={() => handleOpenOrder(order.id)}>
                              {order.customer_name}
                            </td>
                            <td className="p-4 text-neutral-600">
                              <div className="flex items-center gap-2">
                                {order.items && order.items.length > 0 && (
                                  <div 
                                    className={`w-8 h-10 bg-neutral-100 border border-neutral-200/50 overflow-hidden shrink-0 rounded-xs ${order.items[0].product_id ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                                    onClick={() => {
                                      if (order.items[0].product_id) {
                                        handleOpenProductView(order.items[0].product_id);
                                      }
                                    }}
                                  >
                                    <img 
                                      src={productImagesMap[order.items[0].product_id] || order.items[0].product?.images?.[0]?.url || order.items[0].image || 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80'} 
                                      alt="Product" 
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                )}
                                <span 
                                  className={`truncate max-w-[150px] ${order.items?.[0]?.product_id ? 'hover:underline cursor-pointer text-[#405189] font-bold' : ''}`}
                                  onClick={() => {
                                    if (order.items?.[0]?.product_id) {
                                      handleOpenProductView(order.items[0].product_id);
                                    }
                                  }}
                                >
                                  {order.product_name || (order.items && order.items.map(it => it.product_name || it.name).filter(Boolean).join(', ')) || 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-neutral-500">
                              {formatOrderDate(order.created_at)}
                            </td>
                            <td className="p-4 font-extrabold text-neutral-900">
                              {formatPrice(order.total)}
                            </td>
                            <td className="p-4 text-neutral-600 font-semibold text-[10.5px]">
                              {order.payment_method || (order.payments && order.payments.length > 0 ? (
                                <span className="uppercase">{order.payments[0].operator || order.payments[0].payment_type}</span>
                              ) : 'Non spécifié')}
                            </td>
                            <td className="p-4">
                              {getDeliveryStatusBadge(order.status)}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => handleOpenOrder(order.id)}
                                  title="Voir les détails"
                                  className="p-1.5 text-neutral-500 hover:text-[#3577f1] hover:bg-neutral-100 transition-colors cursor-pointer rounded-none"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleOpenOrder(order.id)}
                                  title="Modifier le statut"
                                  className="p-1.5 text-neutral-500 hover:text-[#0ab39c] hover:bg-neutral-100 transition-colors cursor-pointer rounded-none"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  title="Supprimer la commande"
                                  className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 transition-colors cursor-pointer rounded-none"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-neutral-400">
                            Aucune commande ne correspond aux filtres de recherche.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION FOOTER */}
                <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none">
                  <div className="text-neutral-400 font-semibold text-[10.5px]">
                    Showing {orders.length > 0 ? (orderCurrentPage - 1) * 10 + 1 : 0} to {Math.min(orderCurrentPage * 10, orders.length)} of {orders.length} results
                  </div>

                  {orders.length > 10 && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setOrderCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={orderCurrentPage === 1}
                        className="border border-neutral-200/80 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer rounded-none text-neutral-600 select-none"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(orders.length / 10) }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => setOrderCurrentPage(page)}
                            className={`w-7 h-7 text-[10px] font-bold transition-all border cursor-pointer rounded-none select-none ${
                              orderCurrentPage === page 
                                ? 'bg-[#3577f1] border-[#3577f1] text-white' 
                                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => setOrderCurrentPage(prev => Math.min(prev + 1, Math.ceil(orders.length / 10)))}
                        disabled={orderCurrentPage === Math.ceil(orders.length / 10)}
                        className="border border-neutral-200/80 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer rounded-none text-neutral-600 select-none"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>

                {/* Order Detail Modal */}
                {selectedOrder && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
                    <div className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 overflow-y-auto rounded-none transition-all duration-300 ${isOrderDetailExpanded ? 'max-w-6xl max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'}`}>
                      
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                          Commande : {selectedOrder.reference}
                        </h3>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsOrderDetailExpanded(!isOrderDetailExpanded)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title={isOrderDetailExpanded ? "Réduire" : "Agrandir"}
                          >
                            {isOrderDetailExpanded ? (
                              <Minimize className="w-4.5 h-4.5" />
                            ) : (
                              <Maximize className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(null)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title="Fermer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* LEFT COLUMN: CLIENT, INVOICE, ITEMS, PAYMENT */}
                        <div className="md:col-span-7 space-y-6">
                          {/* Client Info & Addresses */}
                          <div className="grid grid-cols-2 gap-4 bg-neutral-50/50 p-3 border border-neutral-200/40">
                            <div>
                              <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Informations Client</h4>
                              <p className="font-bold text-neutral-800 text-[11px]">{selectedOrder.customer_name}</p>
                              <p className="text-neutral-500 font-semibold text-[10.5px]">{selectedOrder.customer_email}</p>
                              <p className="text-neutral-500 font-semibold text-[10.5px]">{selectedOrder.customer_phone}</p>
                            </div>
                            <div>
                              <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">Adresse de Livraison</h4>
                              <p className="text-neutral-600 font-semibold text-[10.5px] leading-relaxed">
                                {selectedOrder.shipping_address || '123 Rue des Jardins, Cocody, Abidjan'}
                              </p>
                              <p className="text-neutral-400 text-[9px] mt-1">Facturation: {selectedOrder.billing_address || 'Même que livraison'}</p>
                            </div>
                          </div>

                          {/* Payment info */}
                          <div className="bg-neutral-50/50 p-3 border border-neutral-200/40 space-y-3 text-left">
                            <div className="flex justify-between items-center border-b border-neutral-100 pb-1.5">
                              <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Informations de Paiement</h4>
                              <span className="text-neutral-600 font-bold text-[10.5px]">
                                Méthode: {selectedOrder.payment_method || (selectedOrder.payments && selectedOrder.payments.length > 0 ? (selectedOrder.payments[0].payment_type === 'mobile_money' ? 'Mobile Money' : 'Carte Bancaire') : 'Non spécifiée')}
                              </span>
                            </div>

                            {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                              <div className="space-y-2">
                                {selectedOrder.payments.map((p, pIdx) => (
                                  <div key={p.gateway_reference || pIdx} className="flex justify-between items-center text-[10px] bg-white p-2 border border-neutral-200/50">
                                    <div>
                                      <span className="font-bold text-neutral-800 uppercase">{p.operator || p.payment_type || 'Paiement'}</span>
                                      {p.phone_number && <span className="text-neutral-500 font-semibold ml-2">({p.phone_number})</span>}
                                      <div className="text-neutral-400 text-[8px] mt-0.5 font-mono">{p.gateway_reference}</div>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-bold text-neutral-800 block">{p.amount ? `${p.amount.toLocaleString()} XOF` : ''}</span>
                                      <span className={`inline-block px-1.5 py-0.5 text-[8px] font-extrabold tracking-wider border rounded-none uppercase ${
                                        p.status === 'SUCCESS' ? 'bg-green-50 text-green-700 border-green-200' :
                                        p.status === 'FAILED' ? 'bg-red-50 text-red-700 border-red-200' :
                                        'bg-yellow-50 text-yellow-700 border-yellow-200'
                                      }`}>
                                        {p.status === 'SUCCESS' ? 'Réussi' : p.status === 'FAILED' ? 'Échoué' : 'En attente'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-neutral-700 font-semibold text-[10.5px]">Méthode: {selectedOrder.payment_method || 'Non spécifiée'}</p>
                                  <p className="text-neutral-500 text-[10.5px]">
                                    Statut: <span className={`font-bold ${selectedOrder.status === 'confirmed' || selectedOrder.status === 'delivered' || selectedOrder.status === 'preparing' || selectedOrder.status === 'inprogress' || selectedOrder.status === 'shipped' ? 'text-[#0ab39c]' : 'text-yellow-600'}`}>
                                      {selectedOrder.status === 'confirmed' || selectedOrder.status === 'delivered' || selectedOrder.status === 'preparing' || selectedOrder.status === 'inprogress' || selectedOrder.status === 'shipped' ? 'Réussi (via statut)' : 'En attente'}
                                    </span>
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Réf. Transaction</h4>
                                  <p className="text-neutral-500 font-mono text-[10px]">{selectedOrder.transaction_id || 'Aucune transaction'}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Ordered items */}
                          <div>
                            <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mb-2 border-b border-neutral-100 pb-1.5">Articles Commandés</h4>
                            <div className="space-y-3">
                              {selectedOrder.items?.map((item, idx) => {
                                const itemName = item.product_name || item.name || 'Article';
                                const itemPrice = Number(item.unit_price ?? item.price ?? 0);
                                const itemQuantity = Number(item.quantity ?? 1);
                                const itemSku = item.sku || 'N/A';
                                const itemImage = productImagesMap[item.product_id] || item.product?.images?.[0]?.url || item.image || 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80';
                                
                                let itemColor = item.color || 'N/A';
                                let itemSize = item.size || 'N/A';
                                if (item.variant_label && (!item.color || !item.size)) {
                                  const parts = item.variant_label.split('/').map(s => s.trim());
                                  if (parts.length === 2) {
                                    itemColor = parts[0];
                                    itemSize = parts[1];
                                  } else if (parts.length === 1) {
                                    itemColor = parts[0];
                                  }
                                }
                                
                                return (
                                  <div key={idx} className="flex gap-3 items-center text-[11px] bg-white p-2.5 border border-neutral-100 shadow-3xs">
                                    <div className="w-10 h-12 bg-neutral-100 rounded-xs overflow-hidden shrink-0 border border-neutral-200/50">
                                      <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-neutral-800 truncate">{itemName}</p>
                                      <p className="text-[9.5px] text-neutral-400 font-semibold mt-0.5">Taille: {itemSize} | Couleur: {itemColor} | Réf/SKU: {itemSku} | Qté: {itemQuantity}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="font-extrabold text-neutral-900">{formatPrice(itemPrice * itemQuantity)}</span>
                                      <p className="text-[9px] text-neutral-400 font-medium">{formatPrice(itemPrice)} unitaire</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Financial summary */}
                          <div className="bg-neutral-50 p-3 border border-neutral-200/60 font-semibold text-neutral-600 space-y-1.5">
                            <div className="flex justify-between text-[11px]">
                              <span>Sous-total</span>
                              <span className="font-bold text-neutral-800">
                                {formatPrice(
                                  selectedOrder.subtotal !== undefined && selectedOrder.subtotal !== null
                                    ? Number(selectedOrder.subtotal)
                                    : (Number(selectedOrder.total ?? 0) - Number(selectedOrder.shipping_cost ?? 0))
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-[11px]">
                              <span>Livraison</span>
                              <span className="font-bold text-neutral-800">
                                {selectedOrder.shipping_cost === 0 ? 'Gratuit' : formatPrice(selectedOrder.shipping_cost ?? 0)}
                              </span>
                            </div>
                            <div className="flex justify-between text-neutral-900 font-black text-xs pt-2 border-t border-neutral-200">
                              <span>Total Facturé</span>
                              <span>{formatPrice(selectedOrder.total ?? 0)}</span>
                            </div>
                          </div>

                          {/* Print Invoice Button */}
                          <button
                            type="button"
                            onClick={() => handlePrintInvoice(selectedOrder)}
                            className="w-full bg-[#3577f1] hover:bg-[#2e6ae1] text-white font-bold uppercase tracking-wider py-2 px-4 text-[10px] rounded-none cursor-pointer flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <ArrowUpRight className="w-4 h-4" />
                            Générer & Imprimer la Facture (PDF)
                          </button>
                        </div>

                        {/* RIGHT COLUMN: TIMELINE & STATUS UPDATE */}
                        <div className="md:col-span-5 space-y-6 border-t md:border-t-0 md:border-l border-neutral-100 pt-6 md:pt-0 md:pl-6">
                          {/* Follow-up Timeline */}
                          <div className="bg-neutral-50/50 p-4 border border-neutral-200/40 space-y-4">
                            <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-150 pb-2">
                              Suivi de la Commande (Timeline)
                            </h4>
                            <div className="relative border-l border-neutral-200 pl-4 ml-2 space-y-4 py-1">
                              {selectedOrder.history?.map((step, idx) => {
                                const isLast = idx === selectedOrder.history.length - 1;
                                const isEditing = editingHistoryIndex === idx;
                                return (
                                  <div key={idx} className="relative text-[10.5px] group">
                                    <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 border-2 ${
                                      isLast 
                                        ? 'bg-[#0ab39c] border-[#0ab39c] scale-125' 
                                        : 'bg-white border-neutral-300'
                                    }`} />
                                    {isEditing ? (
                                      <div className="space-y-2 bg-neutral-100 p-2 border border-neutral-200 ml-1">
                                        <div>
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Titre / Statut</label>
                                          <input 
                                            type="text"
                                            value={editHistoryForm.status}
                                            onChange={(e) => setEditHistoryForm({ ...editHistoryForm, status: e.target.value })}
                                            className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-bold text-neutral-700 text-[10px]"
                                            placeholder="Statut de l'événement"
                                            required
                                          />
                                          <div className="flex gap-1 mt-1 flex-wrap">
                                            {[
                                              { val: 'pending',    fr: 'En attente' },
                                              { val: 'confirmed',  fr: 'Confirmée' },
                                              { val: 'inprogress', fr: 'En cours' },
                                              { val: 'pickups',    fr: 'À récupérer' },
                                              { val: 'shipped',    fr: 'Expédiée' },
                                              { val: 'delivered',  fr: 'Livrée' },
                                              { val: 'cancelled',  fr: 'Annulée' },
                                            ].map(({ val, fr }) => (
                                              <button
                                                key={val}
                                                type="button"
                                                onClick={() => setEditHistoryForm({ ...editHistoryForm, status: val })}
                                                className="text-[7.5px] bg-white border border-neutral-200 hover:border-neutral-800 px-1 py-0.5 rounded-none font-bold text-neutral-500 uppercase cursor-pointer"
                                              >
                                                {fr}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Note / Description</label>
                                          <textarea
                                            value={editHistoryForm.note}
                                            onChange={(e) => setEditHistoryForm({ ...editHistoryForm, note: e.target.value })}
                                            className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 text-[10px] resize-y"
                                            rows="2"
                                            placeholder="Description"
                                            required
                                          />
                                        </div>
                                        <div>
                                          <label className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest block mb-0.5">Date & Heure</label>
                                          <input
                                            type="datetime-local"
                                            value={editHistoryForm.date}
                                            onChange={(e) => setEditHistoryForm({ ...editHistoryForm, date: e.target.value })}
                                            className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 text-[10px]"
                                            required
                                          />
                                        </div>
                                        <div className="flex gap-1 justify-end pt-1">
                                          <button
                                            type="button"
                                            onClick={() => setEditingHistoryIndex(null)}
                                            className="border border-neutral-300 font-bold uppercase tracking-wider py-1 px-2 text-[8px] text-neutral-500 hover:bg-neutral-50 rounded-none cursor-pointer"
                                          >
                                            Annuler
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleSaveEditHistoryItem(idx)}
                                            className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold uppercase tracking-wider py-1 px-2 text-[8px] rounded-none cursor-pointer"
                                          >
                                            Enregistrer
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5 ml-1">
                                        <div className="flex justify-between items-start gap-2">
                                          <div>
                                            <span className={`font-extrabold uppercase tracking-wider text-[9px] ${
                                              isLast ? 'text-[#0ab39c]' : 'text-neutral-500'
                                            }`}>
                                              {step.status}
                                            </span>
                                            <span className="text-[8.5px] text-neutral-400 font-semibold block sm:inline sm:ml-2">
                                              {formatOrderDate(step.date)}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button
                                              type="button"
                                              onClick={() => handleStartEditHistoryItem(idx, step)}
                                              className="text-neutral-400 hover:text-blue-500 cursor-pointer p-0.5 transition-colors"
                                              title="Modifier"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteHistoryItem(idx)}
                                              className="text-neutral-400 hover:text-red-500 cursor-pointer p-0.5 transition-colors"
                                              title="Supprimer"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                        <p className="text-neutral-600 font-semibold text-[10px] whitespace-pre-line">
                                          {step.note}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Form to add a new event */}
                            <form onSubmit={handleAddNewHistoryItem} className="border-t border-neutral-200 pt-3 mt-2 space-y-3">
                              <h5 className="text-[9px] font-bold text-neutral-700 uppercase tracking-widest">
                                Ajouter un Événement
                              </h5>
                              <div className="space-y-3">
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Titre / Statut</label>
                                  <input 
                                    type="text"
                                    value={newHistoryForm.status}
                                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, status: e.target.value })}
                                    className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-bold text-neutral-700 text-[10px]"
                                    placeholder="Ex: Expédiée, En attente..."
                                    required
                                  />
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {[
                                      { val: 'pending',    fr: 'En attente' },
                                      { val: 'confirmed',  fr: 'Confirmée' },
                                      { val: 'inprogress', fr: 'En cours' },
                                      { val: 'pickups',    fr: 'À récupérer' },
                                      { val: 'shipped',    fr: 'Expédiée' },
                                      { val: 'delivered',  fr: 'Livrée' },
                                      { val: 'cancelled',  fr: 'Annulée' },
                                    ].map(({ val, fr }) => (
                                      <button
                                        key={val}
                                        type="button"
                                        onClick={() => setNewHistoryForm({ ...newHistoryForm, status: val })}
                                        className="text-[7.5px] bg-white border border-neutral-200 hover:border-neutral-800 px-1 py-0.5 rounded-none font-bold text-neutral-500 uppercase cursor-pointer"
                                      >
                                        {fr}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Note / Description</label>
                                  <textarea
                                    value={newHistoryForm.note}
                                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, note: e.target.value })}
                                    className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 text-[10px] resize-y"
                                    rows="2"
                                    placeholder="Description de l'événement..."
                                    required
                                  />
                                </div>

                                <div>
                                  <label className="text-[8px] font-bold text-neutral-400 uppercase tracking-widest block mb-0.5">Date & Heure de l'événement</label>
                                  <input
                                    type="datetime-local"
                                    value={newHistoryForm.date}
                                    onChange={(e) => setNewHistoryForm({ ...newHistoryForm, date: e.target.value })}
                                    className="w-full border border-neutral-200 py-1 px-2 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-neutral-700 text-[10px]"
                                    required
                                  />
                                </div>
                              </div>

                              <button
                                type="submit"
                                className="w-full bg-neutral-800 hover:bg-neutral-900 text-white font-bold uppercase tracking-wider py-1.5 px-3 text-[9px] rounded-none cursor-pointer transition-colors"
                              >
                                Ajouter au Suivi
                              </button>
                            </form>
                          </div>

                          {/* Cancellation Request Panel */}
                          {selectedOrder.cancellation_requested && (
                            <div className="bg-orange-50 p-4 border border-orange-200 space-y-4">
                              <h4 className="text-[9px] font-bold text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">
                                Demande d'Annulation en attente
                              </h4>
                              <p className="text-[10px] text-orange-800 font-semibold">
                                Le client a demandé l'annulation de cette commande. Souhaitez-vous l'accepter ?
                              </p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={handleAcceptCancellation}
                                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold uppercase tracking-wider py-1.5 px-3 text-[9px] rounded-none cursor-pointer transition-colors"
                                >
                                  Accepter (Annuler)
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRefuseCancellation}
                                  className="flex-1 border border-orange-300 bg-white hover:bg-orange-100 text-orange-700 font-bold uppercase tracking-wider py-1.5 px-3 text-[9px] rounded-none cursor-pointer transition-colors"
                                >
                                  Refuser
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Change Status Form */}
                          <form onSubmit={handleUpdateOrderStatus} className="bg-white p-4 border border-neutral-200 space-y-4">
                            <h4 className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2">
                              Mettre à jour le Statut
                            </h4>
                            
                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Nouveau Statut</label>
                                <select
                                  value={orderStatusUpdate}
                                  onChange={(e) => setOrderStatusUpdate(e.target.value)}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-bold text-neutral-700 text-[11px]"
                                >
                                  <option value="pending">En attente (pending)</option>
                                  <option value="confirmed">Confirmée (confirmed)</option>
                                  <option value="inprogress">En cours (inprogress)</option>
                                  <option value="pickups">À récupérer (pickups)</option>
                                  <option value="shipped">Expédiée (shipped)</option>
                                  <option value="delivered">Livrée (delivered)</option>
                                  <option value="cancelled">Annulée (cancelled)</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Note de Suivi / Justificatif</label>
                                <textarea
                                  rows="2"
                                  placeholder="Ex: Le colis a été remis au transporteur..."
                                  value={orderNoteUpdate}
                                  onChange={(e) => setOrderNoteUpdate(e.target.value)}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px] resize-none"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="border border-neutral-200 font-bold uppercase tracking-wider py-1.5 px-3 text-[10px] text-neutral-500 hover:bg-neutral-50 rounded-none cursor-pointer"
                              >
                                Fermer
                              </button>
                              <button
                                type="submit"
                                className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold uppercase tracking-wider py-1.5 px-4 text-[10px] rounded-none cursor-pointer transition-colors"
                              >
                                Enregistrer
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Order Modal */}
                {isCreateOrderOpen && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsCreateOrderOpen(false)} />
                    <div className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 overflow-y-auto rounded-none transition-all duration-300 ${isOrderModalExpanded ? 'max-w-6xl max-h-[95vh]' : 'max-w-3xl max-h-[90vh]'}`}>
                      
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                          Créer une Nouvelle Commande
                        </h3>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsOrderModalExpanded(!isOrderModalExpanded)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title={isOrderModalExpanded ? "Réduire" : "Agrandir"}
                          >
                            {isOrderModalExpanded ? (
                              <Minimize className="w-4.5 h-4.5" />
                            ) : (
                              <Maximize className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreateOrderOpen(false)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title="Fermer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleCreateOrderSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Column 1: Client Details */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5">
                              Informations Client & Livraison
                            </h4>
                            
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Nom complet *</label>
                              <input
                                type="text"
                                required
                                value={createOrderForm.customer_name}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_name: e.target.value }))}
                                className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                placeholder="Nancy Martino"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Email</label>
                                <input
                                  type="email"
                                  value={createOrderForm.customer_email}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_email: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                  placeholder="client@example.com"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Téléphone *</label>
                                <input
                                  type="text"
                                  required
                                  value={createOrderForm.customer_phone}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, customer_phone: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                  placeholder="+225 07 08 09 10"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Adresse de Livraison *</label>
                              <textarea
                                required
                                rows="2"
                                value={createOrderForm.shipping_address}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, shipping_address: e.target.value }))}
                                className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px] resize-none"
                                placeholder="Rue des Jardins, Cocody, Abidjan"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Adresse de Facturation</label>
                              <input
                                type="text"
                                value={createOrderForm.billing_address}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, billing_address: e.target.value }))}
                                className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                placeholder="Même que livraison"
                              />
                            </div>
                          </div>

                          {/* Column 2: Product Details & Parameters */}
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-1.5">
                              Détails de la Commande
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Catégorie *</label>
                                <select
                                  value={selectedCategoryId}
                                  onChange={(e) => {
                                    const catId = e.target.value;
                                    setSelectedCategoryId(catId);
                                    setSelectedProductId('');
                                    setCreateOrderForm(prev => ({ ...prev, product_name: '', product_price: '', size: '', color: '' }));
                                  }}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px]"
                                >
                                  <option value="">Sélectionner une catégorie</option>
                                  {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Produit *</label>
                                <select
                                  value={selectedProductId}
                                  disabled={!selectedCategoryId}
                                  onChange={(e) => {
                                    const prodId = e.target.value;
                                    setSelectedProductId(prodId);
                                    const prod = allProductsForOrder.find(p => p.id === Number(prodId));
                                    if (prod) {
                                      const defaultSize = prod.variants?.[0]?.size?.name || 'Standard';
                                      const defaultColor = prod.variants?.[0]?.color?.name || 'N/A';
                                      setCreateOrderForm(prev => ({
                                        ...prev,
                                        product_name: prod.name,
                                        product_price: prod.price,
                                        size: defaultSize,
                                        color: defaultColor
                                      }));
                                    }
                                  }}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px] disabled:bg-neutral-50"
                                >
                                  <option value="">Sélectionner un produit</option>
                                  {allProductsForOrder
                                    .filter(p => p.category_id === Number(selectedCategoryId))
                                    .map(p => (
                                      <option key={p.id} value={p.id}>{p.name}</option>
                                    ))
                                  }
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Nom du Produit Sélectionné *</label>
                              <input
                                type="text"
                                required
                                value={createOrderForm.product_name}
                                onChange={(e) => setCreateOrderForm(prev => ({ ...prev, product_name: e.target.value }))}
                                className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                placeholder="Nom du produit"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Prix Unitaire (XOF) *</label>
                                <input
                                  type="number"
                                  required
                                  value={createOrderForm.product_price}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, product_price: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                  placeholder="125000"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Quantité *</label>
                                <input
                                  type="number"
                                  required
                                  min="1"
                                  value={createOrderForm.quantity}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, quantity: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Taille</label>
                                {selectedProductId && allProductsForOrder.find(p => p.id === Number(selectedProductId))?.variants?.some(v => v.size) ? (
                                  <select
                                    value={createOrderForm.size}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, size: e.target.value }))}
                                    className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px]"
                                  >
                                    {Array.from(new Set(allProductsForOrder.find(p => p.id === Number(selectedProductId)).variants.map(v => v.size?.name).filter(Boolean)))
                                      .map(sz => (
                                        <option key={sz} value={sz}>{sz}</option>
                                      ))
                                    }
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={createOrderForm.size}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, size: e.target.value }))}
                                    className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                    placeholder="40"
                                  />
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Couleur</label>
                                {selectedProductId && allProductsForOrder.find(p => p.id === Number(selectedProductId))?.variants?.some(v => v.color) ? (
                                  <select
                                    value={createOrderForm.color}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px]"
                                  >
                                    {Array.from(new Set(allProductsForOrder.find(p => p.id === Number(selectedProductId)).variants.map(v => v.color?.name).filter(Boolean)))
                                      .map(cl => (
                                        <option key={cl} value={cl}>{cl}</option>
                                      ))
                                    }
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={createOrderForm.color}
                                    onChange={(e) => setCreateOrderForm(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                    placeholder="Bordeaux"
                                  />
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="space-y-1 col-span-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Frais Port (XOF)</label>
                                <input
                                  type="number"
                                  value={createOrderForm.shipping_cost}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, shipping_cost: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 rounded-none text-[11px]"
                                />
                              </div>
                              <div className="space-y-1 col-span-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Paiement</label>
                                <select
                                  value={createOrderForm.payment_method}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, payment_method: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px] font-bold text-neutral-700"
                                >
                                  <option value="Orange Money">Orange Money</option>
                                  <option value="MTN Momo">MTN Momo</option>
                                  <option value="Moov Money">Moov Money</option>
                                  <option value="Wave">Wave</option>
                                  <option value="Carte Bancaire">Carte Bancaire</option>
                                </select>
                              </div>
                              <div className="space-y-1 col-span-1">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest block">Statut</label>
                                <select
                                  value={createOrderForm.status}
                                  onChange={(e) => setCreateOrderForm(prev => ({ ...prev, status: e.target.value }))}
                                  className="w-full border border-neutral-200 py-1.5 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none text-[11px] font-bold text-neutral-700"
                                >
                                  <option value="pending">En attente</option>
                                  <option value="confirmed">Confirmée</option>
                                  <option value="inprogress">En cours</option>
                                  <option value="pickups">À récupérer</option>
                                  <option value="shipped">Expédiée</option>
                                  <option value="delivered">Livrée</option>
                                  <option value="cancelled">Annulée</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => setIsCreateOrderOpen(false)}
                            className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500 hover:bg-neutral-50 rounded-none cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold uppercase tracking-wider py-2 px-6 text-[10px] rounded-none cursor-pointer transition-colors"
                          >
                            Créer la Commande
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 2b – CLIENTS (CUSTOMERS)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'clients' && (() => {
            const indexOfLastCustomer = customerCurrentPage * 5;
            const indexOfFirstCustomer = indexOfLastCustomer - 5;
            const paginatedCustomers = customers.slice(indexOfFirstCustomer, indexOfLastCustomer);
            const totalPages = Math.ceil(customers.length / 5) || 1;

            return (
              <div className="space-y-4 text-xs animate-fade-in">
                {/* TOP ACTION BAR */}
                <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none">
                  <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[11px]">Liste des Clients</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsCreateCustomerOpen(true)}
                      className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold uppercase tracking-wider py-1.5 px-3.5 text-[10px] rounded-none cursor-pointer flex items-center gap-1 transition-colors animate-fade-in"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter un Client
                    </button>
                    <button
                      onClick={() => {
                        setSuccess("Importation des clients réussie (simulation).");
                        const imported = {
                          id: Date.now(),
                          name: 'Glen Matney (Importé)',
                          email: 'glen.imported@velzon.com',
                          phone: '515-395-1069',
                          joining_date: new Date().toISOString(),
                          status: 'ACTIVE',
                          registration_status: 'Non inscrit'
                        };
                        const stored = localStorage.getItem('mock_customers');
                        let list = [];
                        if (stored) list = JSON.parse(stored);
                        list.unshift(imported);
                        localStorage.setItem('mock_customers', JSON.stringify(list));
                        loadCustomersData();
                      }}
                      className="bg-[#3577f1] hover:bg-[#2e6ae1] text-white font-bold uppercase tracking-wider py-1.5 px-3.5 text-[10px] rounded-none cursor-pointer flex items-center gap-1 transition-colors"
                    >
                      Importer
                    </button>
                  </div>
                </div>

                {/* FILTERS BAR */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none items-center">
                  <div className="md:col-span-3 relative">
                    <input
                      type="text"
                      placeholder="Rechercher un client, e-mail, téléphone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full border border-neutral-200 py-1.5 pl-8 pr-3 bg-white text-neutral-700 text-[11px] rounded-none outline-none focus:border-neutral-800 font-semibold"
                    />
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="md:col-span-2">
                    <input
                      type="date"
                      value={customerFilterDate}
                      onChange={(e) => setCustomerFilterDate(e.target.value)}
                      className="w-full border border-neutral-200 py-1.5 px-3 bg-white text-neutral-600 text-[11px] rounded-none outline-none focus:border-neutral-800 font-bold uppercase"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={customerFilterStatus}
                      onChange={(e) => setCustomerFilterStatus(e.target.value)}
                      className="w-full border border-neutral-200 py-1.5 px-3 bg-white text-neutral-700 text-[11px] rounded-none outline-none focus:border-neutral-800 font-bold"
                    >
                      <option value="">Tous statuts</option>
                      <option value="ACTIVE">Actif</option>
                      <option value="BLOCK">Bloqué</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={customerFilterType}
                      onChange={(e) => setCustomerFilterType(e.target.value)}
                      className="w-full border border-neutral-200 py-1.5 px-3 bg-white text-neutral-700 text-[11px] rounded-none outline-none focus:border-neutral-800 font-bold"
                    >
                      <option value="">Tous les types</option>
                      <option value="Inscrit">Inscrits</option>
                      <option value="Non inscrit">Non inscrits</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <select
                      value={customerFilterSource}
                      onChange={(e) => setCustomerFilterSource(e.target.value)}
                      className="w-full border border-neutral-200 py-1.5 px-3 bg-white text-neutral-700 text-[11px] rounded-none outline-none focus:border-neutral-800 font-bold"
                    >
                      <option value="">Toutes sources</option>
                      <option value="E-mail">E-mail</option>
                      <option value="Téléphone">Téléphone</option>
                      <option value="Google">Google</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Invité">Invité</option>
                    </select>
                  </div>

                  <div className="md:col-span-1">
                    <button
                      onClick={handleResetCustomerFilters}
                      className="w-full bg-[#405189] hover:bg-[#33416e] text-white font-bold uppercase tracking-wider py-1.5 px-1 text-[9px] rounded-none cursor-pointer flex items-center justify-center gap-0.5 transition-colors"
                      title="Réinitialiser les filtres"
                    >
                      <RefreshCcw className="w-3 h-3" />
                      Reset
                    </button>
                  </div>
                </div>

                {/* TABLE CONTAINER */}
                <div className="bg-white border border-neutral-200/60 shadow-3xs rounded-none overflow-x-auto">
                  <table className="w-full border-collapse text-left text-[11px]">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200/80 text-neutral-500 font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            onChange={handleSelectAllCustomers}
                            checked={customers.length > 0 && bulkSelectedCustomers.length === customers.length}
                            className="w-3.5 h-3.5 accent-[#405189] cursor-pointer rounded-none"
                          />
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('name')}>
                          Nom du Client {getCustomerSortIcon('name')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('email')}>
                          Adresse E-mail {getCustomerSortIcon('email')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('phone')}>
                          Téléphone {getCustomerSortIcon('phone')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('joining_date')}>
                          Date de Création {getCustomerSortIcon('joining_date')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('registration_status')}>
                          Type {getCustomerSortIcon('registration_status')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('connection_method')}>
                          Source {getCustomerSortIcon('connection_method')}
                        </th>
                        <th className="py-3 px-4 cursor-pointer hover:bg-neutral-100" onClick={() => handleCustomerSort('status')}>
                          Statut {getCustomerSortIcon('status')}
                        </th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200/50">
                      {paginatedCustomers.length > 0 ? (
                        paginatedCustomers.map((c) => {
                          const isChecked = bulkSelectedCustomers.includes(c.id);
                          return (
                            <tr key={c.id} className="hover:bg-neutral-55 transition-colors text-neutral-700">
                              <td className="py-3.5 px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handleSelectCustomer(c.id, e.target.checked)}
                                  className="w-3.5 h-3.5 accent-[#405189] cursor-pointer rounded-none"
                                />
                              </td>
                              <td className="py-3.5 px-4 font-bold text-neutral-800">
                                {c.name}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-neutral-600">
                                {c.email}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-neutral-600">
                                {c.phone}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-neutral-500">
                                {formatCustomerDate(c.joining_date)}
                              </td>
                              <td className="py-3.5 px-4 font-bold">
                                <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase border rounded-none tracking-widest inline-block ${
                                  c.registration_status === 'Inscrit'
                                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                    : 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20'
                                }`}>
                                  {c.registration_status || 'Inscrit'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-neutral-600">
                                <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase border rounded-none tracking-widest inline-block ${
                                  c.connection_method === 'Google'
                                    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                    : c.connection_method === 'Facebook'
                                    ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'
                                    : c.connection_method === 'Téléphone'
                                    ? 'bg-teal-500/10 text-teal-600 border-teal-500/20'
                                    : c.connection_method === 'E-mail'
                                    ? 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                    : 'bg-neutral-500/10 text-neutral-600 border-neutral-500/20'
                                }`}>
                                  {c.connection_method || 'E-mail'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 text-[8.5px] font-extrabold uppercase border rounded-none tracking-widest inline-block ${
                                  c.status === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
                                }`}>
                                  {c.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedCustomer(c);
                                      setIsEditCustomerOpen(true);
                                    }}
                                    className="text-neutral-400 hover:text-blue-500 cursor-pointer p-0.5 transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCustomer(c.id)}
                                    className="text-neutral-400 hover:text-red-500 cursor-pointer p-0.5 transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-8 text-center text-neutral-400 font-bold">
                            Aucun client trouvé.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION / FOOTER */}
                <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none">
                  <div className="text-neutral-400 font-semibold text-[10.5px]">
                    Affichage de <span className="text-neutral-700 font-bold">{customers.length > 0 ? indexOfFirstCustomer + 1 : 0}</span> à{' '}
                    <span className="text-neutral-700 font-bold">{Math.min(indexOfLastCustomer, customers.length)}</span> sur{' '}
                    <span className="text-neutral-700 font-bold">{customers.length}</span> résultats
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCustomerCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={customerCurrentPage === 1}
                      className="border border-neutral-200 px-3 py-1 font-bold text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white rounded-none cursor-pointer"
                    >
                      Précédent
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCustomerCurrentPage(p)}
                        className={`px-3 py-1 font-bold rounded-none cursor-pointer border ${
                          customerCurrentPage === p
                            ? 'bg-[#405189] border-[#405189] text-white'
                            : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setCustomerCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={customerCurrentPage === totalPages}
                      className="border border-neutral-200 px-3 py-1 font-bold text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 disabled:hover:bg-white rounded-none cursor-pointer"
                    >
                      Suivant
                    </button>
                  </div>
                </div>

                {/* Create Customer Modal */}
                {isCreateCustomerOpen && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsCreateCustomerOpen(false)} />
                    <div className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 overflow-y-auto rounded-none animate-fade-in transition-all duration-300 ${isCreateCustomerExpanded ? 'max-w-3xl max-h-[95vh]' : 'max-w-lg max-h-[90vh]'}`}>
                      
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                          Ajouter un client
                        </h3>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsCreateCustomerExpanded(!isCreateCustomerExpanded)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title={isCreateCustomerExpanded ? "Réduire" : "Agrandir"}
                          >
                            {isCreateCustomerExpanded ? (
                              <Minimize className="w-4.5 h-4.5" />
                            ) : (
                              <Maximize className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsCreateCustomerOpen(false)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title="Fermer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleCreateCustomer} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Nom du client</label>
                          <input
                            type="text"
                            value={createCustomerForm.name}
                            onChange={(e) => setCreateCustomerForm({ ...createCustomerForm, name: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            placeholder="Timothy Smith"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Adresse e-mail</label>
                          <input
                            type="email"
                            value={createCustomerForm.email}
                            onChange={(e) => setCreateCustomerForm({ ...createCustomerForm, email: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            placeholder="timothysmith@velzon.com"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Numéro de téléphone</label>
                          <input
                            type="text"
                            value={createCustomerForm.phone}
                            onChange={(e) => setCreateCustomerForm({ ...createCustomerForm, phone: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            placeholder="973-277-6950"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Date d'inscription</label>
                          <input
                            type="date"
                            value={createCustomerForm.joining_date}
                            onChange={(e) => setCreateCustomerForm({ ...createCustomerForm, joining_date: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Statut</label>
                          <select
                            value={createCustomerForm.status}
                            onChange={(e) => setCreateCustomerForm({ ...createCustomerForm, status: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-bold text-neutral-700 text-[11px]"
                          >
                            <option value="ACTIVE">ACTIF</option>
                            <option value="BLOCK">BLOQUÉ</option>
                          </select>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => setIsCreateCustomerOpen(false)}
                            className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500 hover:bg-neutral-50 rounded-none cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold uppercase tracking-wider py-2 px-6 text-[10px] rounded-none cursor-pointer transition-colors"
                          >
                            Ajouter un client
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Edit Customer Modal */}
                {isEditCustomerOpen && selectedCustomer && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 text-left">
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => {
                      setIsEditCustomerOpen(false);
                      setSelectedCustomer(null);
                    }} />
                    <div className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 overflow-y-auto rounded-none animate-fade-in transition-all duration-300 ${isEditCustomerExpanded ? 'max-w-3xl max-h-[95vh]' : 'max-w-lg max-h-[90vh]'}`}>
                      
                      <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                          Modifier le client
                        </h3>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsEditCustomerExpanded(!isEditCustomerExpanded)}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title={isEditCustomerExpanded ? "Réduire" : "Agrandir"}
                          >
                            {isEditCustomerExpanded ? (
                              <Minimize className="w-4.5 h-4.5" />
                            ) : (
                              <Maximize className="w-4.5 h-4.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditCustomerOpen(false);
                              setSelectedCustomer(null);
                            }}
                            className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                            title="Fermer"
                          >
                            <X className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </div>

                      <form onSubmit={handleEditCustomerSubmit} className="space-y-4">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Nom du client</label>
                          <input
                            type="text"
                            value={selectedCustomer.name}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Adresse e-mail</label>
                          <input
                            type="email"
                            value={selectedCustomer.email}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Numéro de téléphone</label>
                          <input
                            type="text"
                            value={selectedCustomer.phone}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Date d'inscription</label>
                          <input
                            type="date"
                            value={selectedCustomer.joining_date ? new Date(selectedCustomer.joining_date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, joining_date: new Date(e.target.value).toISOString() })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-semibold text-neutral-700 text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Statut</label>
                          <select
                            value={selectedCustomer.status}
                            onChange={(e) => setSelectedCustomer({ ...selectedCustomer, status: e.target.value })}
                            className="w-full border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800 bg-white rounded-none font-bold text-neutral-700 text-[11px]"
                          >
                            <option value="ACTIVE">ACTIF</option>
                            <option value="BLOCK">BLOQUÉ</option>
                          </select>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() => {
                              setIsEditCustomerOpen(false);
                              setSelectedCustomer(null);
                            }}
                            className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500 hover:bg-neutral-50 rounded-none cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            type="submit"
                            className="bg-[#3577f1] hover:bg-[#2e6ae1] text-white font-bold uppercase tracking-wider py-2 px-6 text-[10px] rounded-none cursor-pointer transition-colors"
                          >
                            Sauvegarder
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 3 – PRODUITS (PRODUCTS)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'products' && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                
                {/* 1. PANNEAU DE FILTRES LATÉRAL (STYLE VELZON MAQUETTE) */}
                <div className="lg:col-span-1 bg-white border border-neutral-200/60 p-5 space-y-5 self-start rounded-none">
                  {/* Entête */}
                  <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                    <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[11px]">Filters</h4>
                    {getActiveFiltersList().length > 0 && (
                      <button
                        onClick={() => {
                          setProductSearch('');
                          setProductFilterCategory('');
                          setProductFilterStatus('');
                          setProductFilterStockAlert('');
                          setProductFilterPriceMin('');
                          setProductFilterPriceMax('');
                          setProductFilterColors([]);
                          setProductFilterSizes([]);
                          setCurrentPage(1);
                        }}
                        className="text-[11px] text-blue-500 hover:text-blue-700 font-semibold underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Étiquettes de filtres actifs */}
                  {getActiveFiltersList().length > 0 && (
                    <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 pb-3">
                      {getActiveFiltersList().map((tag, i) => (
                        <span key={i} className="inline-flex items-center bg-blue-500 text-white text-[9px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-none">
                          {tag.label}
                          <button
                            onClick={() => handleRemoveFilterTag(tag)}
                            className="ml-2 hover:text-red-200 font-extrabold cursor-pointer text-[10px]"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* PRODUCTS (Catégories) */}
                  <div className="space-y-2 text-left">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px] block">Products</label>
                    <div className="flex flex-col gap-2">
                      {categories.map((cat) => {
                        const isActive = Number(productFilterCategory) === cat.id;
                        // count products in this category
                        const count = products.filter(p => p.category_id === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { setProductFilterCategory(isActive ? '' : cat.id); setCurrentPage(1); }}
                            className={`flex justify-between items-center text-[11px] font-semibold py-1.5 transition-all w-full cursor-pointer ${
                              isActive ? 'text-neutral-950 font-black' : 'text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            <span>{cat.name}</span>
                            <span className="text-neutral-400 text-[10px] font-medium">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* PRICE (Plage de prix) */}
                  <div className="space-y-2 text-left border-t border-neutral-100 pt-4">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px] block">Price</label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-2 text-neutral-400 text-[8px] font-bold">XOF</span>
                        <input
                          type="number"
                          placeholder="0"
                          value={productFilterPriceMin}
                          onChange={(e) => { setProductFilterPriceMin(e.target.value); setCurrentPage(1); }}
                          className="w-full border border-neutral-200 pl-8 pr-1 py-1 text-[11px] focus:outline-none rounded-none bg-white text-neutral-700"
                        />
                      </div>
                      <span className="text-neutral-400 text-[10px] font-semibold">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-2 top-2 text-neutral-400 text-[8px] font-bold">XOF</span>
                        <input
                          type="number"
                          placeholder="2000"
                          value={productFilterPriceMax}
                          onChange={(e) => { setProductFilterPriceMax(e.target.value); setCurrentPage(1); }}
                          className="w-full border border-neutral-200 pl-8 pr-1 py-1 text-[11px] focus:outline-none rounded-none bg-white text-neutral-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* COLORS (Couleurs) */}
                  <div className="space-y-2 text-left border-t border-neutral-100 pt-4">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px] block">Colors</label>
                    <div className="flex flex-col gap-2.5">
                      {colors.map((color) => {
                        const isChecked = productFilterColors.includes(color.id);
                        return (
                          <label key={color.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-600 font-semibold select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProductFilterColors(prev => [...prev, color.id]);
                                } else {
                                  setProductFilterColors(prev => prev.filter(c => c !== color.id));
                                }
                                setCurrentPage(1);
                              }}
                              className="border-neutral-300 rounded-none w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                            />
                            <span className="w-3 h-3 border border-neutral-200 inline-block" style={{ backgroundColor: color.hex_code }} />
                            <span>{color.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* SIZES (Tailles) */}
                  <div className="space-y-2 text-left border-t border-neutral-100 pt-4">
                    <label className="font-bold text-neutral-400 uppercase tracking-widest text-[9px] block">Sizes</label>
                    <div className="flex flex-col gap-2.5">
                      {sizes.map((size) => {
                        const isChecked = productFilterSizes.includes(size.id);
                        return (
                          <label key={size.id} className="flex items-center gap-2 cursor-pointer text-[11px] text-neutral-600 font-semibold select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setProductFilterSizes(prev => [...prev, size.id]);
                                } else {
                                  setProductFilterSizes(prev => prev.filter(s => s !== size.id));
                                }
                                setCurrentPage(1);
                              }}
                              className="border-neutral-300 rounded-none w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                            />
                            <span>{size.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. ESPACE PRODUITS PRINCIPAL */}
                <div className="lg:col-span-3 space-y-4">
                  
                  {/* BARRE D'ACTIONS SUPÉRIEURE */}
                  <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 shadow-3xs rounded-none">
                    {/* Bouton Add Product vert émeraude */}
                    <button
                      onClick={handleOpenProductCreate}
                      className="bg-[#0ab39c] hover:bg-[#089e8a] text-white font-bold py-2 px-4 uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer rounded-none text-[11px]"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </button>

                    {/* Barre de recherche avec loupe à droite */}
                    <div className="relative w-64">
                      <input
                        type="text"
                        placeholder="Search Products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyUp={(e) => { if (e.key === 'Enter') loadProductsData(); }}
                        className="border border-neutral-200 pl-3 pr-9 py-1.5 w-full text-[11px] focus:outline-none focus:border-neutral-800 bg-white rounded-none"
                      />
                      <Search className="w-3.5 h-3.5 text-neutral-400 absolute right-3 top-2.5" />
                    </div>
                  </div>

                  {/* ONGLES DE FILTRES VELZON */}
                  <div className="flex gap-4 border-b border-neutral-200/60 pb-2">
                    {[
                      { code: 'all', label: 'All', count: products.length },
                      { code: 'published', label: 'Published', count: products.filter(p => p.status === 'available' || p.status === 'preorder').length },
                      { code: 'draft', label: 'Draft', count: products.filter(p => p.status === 'draft').length }
                    ].map((t) => (
                      <button
                        key={t.code}
                        onClick={() => { setProductFilterStatusTab(t.code); setCurrentPage(1); }}
                        className={`pb-2 px-1 text-[11px] font-bold uppercase tracking-wider relative cursor-pointer flex items-center gap-1.5 transition-all select-none ${
                          productFilterStatusTab === t.code ? 'text-primary font-extrabold' : 'text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        <span>{t.label}</span>
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                          productFilterStatusTab === t.code ? 'bg-blue-50 text-blue-600' : 'bg-neutral-100 text-neutral-400'
                        }`}>
                          {t.count}
                        </span>
                        {productFilterStatusTab === t.code && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* AFFICHAGE DES PRODUITS (VIDE OU DONNÉES) */}
                  {products.length === 0 ? (
                    <div className="bg-white border border-neutral-200 p-12 text-center flex flex-col items-center justify-center space-y-4">
                      <div className="w-12 h-12 rounded-none bg-neutral-100 flex items-center justify-center text-neutral-400">
                        <Search className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[12px] text-neutral-900 uppercase tracking-wider">Aucun produit trouvé</h4>
                        <p className="text-neutral-400 mt-1 max-w-xs mx-auto">Essayez d'élargir votre recherche ou de réinitialiser les filtres appliqués.</p>
                      </div>
                      {(productSearch || productFilterCategory || productFilterStatus || productFilterStockAlert || productFilterPriceMin || productFilterPriceMax || productFilterColors.length > 0 || productFilterSizes.length > 0) && (
                        <button
                          onClick={() => {
                            setProductSearch('');
                            setProductFilterCategory('');
                            setProductFilterStatus('');
                            setProductFilterStockAlert('');
                            setProductFilterPriceMin('');
                            setProductFilterPriceMax('');
                            setProductFilterColors([]);
                            setProductFilterSizes([]);
                            setCurrentPage(1);
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider py-2 px-4 transition-all cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  ) : viewMode === 'list' ? (
                    
                    // ────────────────────────────────────────────────────────────────
                    // LIST VIEW (DATATABLE VELZON)
                    // ────────────────────────────────────────────────────────────────
                    <div className="bg-white border border-neutral-200/60 overflow-hidden shadow-3xs rounded-none">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-[#f3f6f9] text-neutral-500 font-bold uppercase text-[9px] tracking-wider border-b border-neutral-200/60">
                            <tr>
                              <th className="px-5 py-3.5 w-12 text-center select-none">
                                <input
                                  type="checkbox"
                                  checked={bulkSelectedProducts.length === products.length && products.length > 0}
                                  onChange={handleSelectAllProducts}
                                  className="border-neutral-300 rounded-none w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                                />
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('name')}>
                                Product {getSortIcon('name')}
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('stock')}>
                                Stock {getSortIcon('stock')}
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('price')}>
                                Price {getSortIcon('price')}
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('orders')}>
                                Orders {getSortIcon('orders')}
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('rating')}>
                                Rating {getSortIcon('rating')}
                              </th>
                              <th className="px-5 py-3.5 cursor-pointer select-none" onClick={() => handleSort('published')}>
                                Published {getSortIcon('published')}
                              </th>
                              <th className="px-5 py-3.5 text-right select-none">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-neutral-700">
                            {products.map((prod) => {
                              const totalStock = prod.variants ? prod.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) : 0;
                              const mainImage = prod.images && prod.images.find(img => img.is_main)?.url || prod.images?.[0]?.url || '/logo.png';
                              const isChecked = bulkSelectedProducts.includes(prod.id);
                              
                              // Format date & time: 12 Oct, 2021 10:05 AM
                              const dateObj = new Date(prod.created_at || Date.now());
                              const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                              const formattedTime = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

                              return (
                                <tr key={prod.id} className="hover:bg-neutral-50/40 transition-colors">
                                  <td className="px-5 py-3.5 text-center">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => handleSelectProduct(prod.id, e.target.checked)}
                                      className="border-neutral-300 rounded-none w-3.5 h-3.5 focus:ring-0 cursor-pointer"
                                    />
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-11 bg-neutral-100 border border-neutral-200 overflow-hidden shrink-0 flex items-center justify-center rounded-none">
                                        <img src={mainImage} alt={prod.name} className="w-full h-full object-cover" />
                                      </div>
                                      <div className="text-left space-y-0.5">
                                        <p className="font-extrabold text-[#3b3e66] text-[11.5px] hover:text-blue-500 transition-colors cursor-pointer">{prod.name}</p>
                                        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Category : {prod.category?.name || 'Maison'}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className={`font-bold px-2 py-0.5 text-[10.5px] border rounded-none ${
                                      totalStock === 0 ? 'bg-red-50 text-red-650 border-red-200' :
                                      totalStock <= 5 ? 'bg-amber-50 text-amber-650 border-amber-250' :
                                      'bg-green-50 text-green-650 border-green-250'
                                    }`}>
                                      {totalStock === 0 ? 'Rupture' :
                                       totalStock <= 5 ? `Presque épuisé (${totalStock})` :
                                       `${totalStock < 10 ? `0${totalStock}` : totalStock} en stock`}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 font-bold text-neutral-850">
                                    {formatPrice(prod.price)}
                                  </td>
                                  <td className="px-5 py-3.5 font-semibold text-neutral-650">
                                    {prod.orders_count || 0}
                                  </td>
                                  <td className="px-5 py-3.5">
                                    <span className="bg-[#fef8e8] text-[#e0a232] font-bold text-[9px] px-1.5 py-0.5 border border-[#fae5be] inline-flex items-center gap-0.5 rounded-none">
                                      &#9734; {prod.rating ? prod.rating.toFixed(1) : '4.2'}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3.5 text-neutral-500 font-semibold">
                                    <span className="block text-[11px]">{formattedDate}</span>
                                    <span className="block text-[9.5px] text-neutral-400 mt-0.5 font-normal">{formattedTime}</span>
                                  </td>
                                  <td className="px-5 py-3.5 text-right relative">
                                    <div className="inline-block text-left">
                                      <button 
                                        onClick={() => setActiveDropdownId(activeDropdownId === prod.id ? null : prod.id)}
                                        className="text-neutral-500 hover:text-neutral-900 border border-neutral-200 bg-white px-2.5 py-1 hover:bg-neutral-50 cursor-pointer rounded-none"
                                      >
                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                      </button>
                                      {activeDropdownId === prod.id && (
                                        <>
                                          <div className="fixed inset-0 z-30" onClick={() => setActiveDropdownId(null)} />
                                          <div className="absolute right-5 mt-1 w-32 bg-white border border-neutral-200/85 shadow-md z-40 text-left py-1 rounded-none animate-fade-in">
                                            <button
                                              onClick={() => {
                                                setActiveDropdownId(null);
                                                handleOpenProductView(prod.id);
                                              }}
                                              className="w-full text-left px-4 py-1.5 hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer"
                                            >
                                              <Eye className="w-3.5 h-3.5 text-neutral-400" />
                                              View
                                            </button>
                                            
                                            <button
                                              onClick={() => {
                                                setActiveDropdownId(null);
                                                handleOpenProductEdit(prod.id);
                                              }}
                                              className="w-full text-left px-4 py-1.5 hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 flex items-center gap-2 cursor-pointer"
                                            >
                                              <Edit2 className="w-3.5 h-3.5 text-neutral-400" />
                                              Edit
                                            </button>
                                            
                                            <div className="border-t border-neutral-100 my-1" />
                                            
                                            <button
                                              onClick={() => {
                                                setActiveDropdownId(null);
                                                handleDeleteProduct(prod.id);
                                              }}
                                              className="w-full text-left px-4 py-1.5 hover:bg-red-50 text-[11px] font-bold text-red-650 flex items-center gap-2 cursor-pointer"
                                            >
                                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                              Delete
                                            </button>
                                          </div>
                                        </>
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
                  ) : (
                    
                    // ────────────────────────────────────────────────────────────────
                    // GRID VIEW (PREMIUM CARDS STYLE VELZON)
                    // ────────────────────────────────────────────────────────────────
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                      {products.map((prod) => {
                        const totalStock = prod.variants ? prod.variants.reduce((acc, curr) => acc + (curr.stock || 0), 0) : 0;
                        const mainImage = prod.images && prod.images.find(img => img.is_main)?.url || prod.images?.[0]?.url || '/logo.png';
                        
                        // Extract unique colors and sizes for display
                        const uniqueColors = [];
                        const uniqueSizes = [];
                        if (prod.variants) {
                          prod.variants.forEach(v => {
                            if (v.color && !uniqueColors.some(c => c.id === v.color.id)) {
                              uniqueColors.push(v.color);
                            }
                            if (v.size && !uniqueSizes.includes(v.size.name)) {
                              uniqueSizes.push(v.size.name);
                            }
                          });
                        }

                        return (
                          <div key={prod.id} className="bg-white border border-neutral-200 flex flex-col shadow-3xs group relative hover:border-neutral-800 transition-colors rounded-none">
                            {/* Badge status overlay */}
                            <div className="absolute top-3 left-3 z-10">
                              <span className={`px-2 py-0.5 font-bold uppercase tracking-wider text-[8px] shadow-sm rounded-none ${
                                prod.status === 'available' ? 'bg-[#0ab39c] text-white' :
                                prod.status === 'preorder' ? 'bg-blue-500 text-white' :
                                prod.status === 'draft' ? 'bg-neutral-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {prod.status === 'available' ? 'Disponible' : prod.status === 'preorder' ? 'Précommande' : prod.status === 'draft' ? 'Brouillon' : 'Rupture'}
                              </span>
                            </div>
                            
                            {/* Image */}
                            <div className="w-full aspect-[4/5] bg-neutral-100 overflow-hidden relative border-b border-neutral-100 flex items-center justify-center rounded-none">
                              <img src={mainImage} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              {prod.is_featured && (
                                <div className="absolute top-3 right-3 bg-accent text-white p-1.5 text-[8px] font-black uppercase tracking-widest leading-none shadow-xs border border-white rounded-none">
                                  Vedette
                                </div>
                              )}
                            </div>
                            
                            {/* Info */}
                            <div className="p-4 flex-grow flex flex-col justify-between text-left">
                              <div className="space-y-1">
                                <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest">
                                  {prod.category?.name || 'Maison'}
                                </span>
                                <h5 className="font-extrabold text-neutral-900 text-[12px] leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                  {prod.name}
                                </h5>
                                
                                {/* Colors & Sizes available */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                  {uniqueColors.map((color, i) => (
                                    <span
                                      key={i}
                                      className="w-3.5 h-3.5 inline-block border border-neutral-200 rounded-none"
                                      style={{ backgroundColor: color.hex_code }}
                                      title={color.name}
                                    />
                                  ))}
                                  {uniqueColors.length > 0 && uniqueSizes.length > 0 && (
                                    <div className="h-3 w-px bg-neutral-200 mx-1" />
                                  )}
                                  <div className="flex gap-1 flex-wrap">
                                    {uniqueSizes.map((sz, i) => (
                                      <span key={i} className="text-[8px] font-bold text-neutral-500 bg-neutral-100 px-1 border border-neutral-200 leading-none py-0.5 rounded-none">
                                        {sz}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-end justify-between">
                                {/* Price */}
                                <div>
                                  <span className="text-neutral-400 font-bold uppercase tracking-widest text-[8px] block">Tarif</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-extrabold text-[12px] text-neutral-950">{formatPrice(prod.price)}</span>
                                    {prod.old_price && (
                                      <span className="text-[9px] text-neutral-400 line-through font-semibold">{formatPrice(prod.old_price)}</span>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Stock count */}
                                <div className="text-right">
                                  <span className="text-neutral-400 font-bold uppercase tracking-widest text-[8px] block">Stock</span>
                                  <span className={`font-bold text-[10px] mt-0.5 inline-block ${totalStock === 0 ? 'text-red-500' : totalStock <= 5 ? 'text-amber-600 font-extrabold' : 'text-green-600'}`}>
                                    {totalStock} unités
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Actions layout in grid */}
                            <div className="px-4 pb-4 grid grid-cols-2 gap-2 mt-auto">
                              {prod.status === 'available' || prod.status === 'preorder' ? (
                                <button
                                  onClick={() => handleUnpublishProduct(prod.id)}
                                  className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600 font-bold uppercase py-2 text-[9px] tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
                                >
                                  <Ban className="w-3 h-3" /> Retirer
                                </button>
                              ) : (
                                <button
                                  onClick={async () => {
                                    setLoading(true);
                                    try {
                                      const details = await adminService.getProductById(prod.id);
                                      setSelectedProduct(details.data || details);
                                      setVariantsList(details.data?.variants || details.variants || []);
                                      setWizardStep(3);
                                      setIsProductModalOpen(true);
                                    } catch (e) {
                                      setError("Impossible de charger le produit.");
                                    } finally {
                                      setLoading(false);
                                    }
                                  }}
                                  className="w-full bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase py-2 text-[9px] tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
                                >
                                  <Eye className="w-3 h-3" /> Configurer
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="w-full bg-white hover:bg-red-50 border border-red-200 text-red-600 font-bold uppercase py-2 text-[9px] tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer rounded-none"
                              >
                                <Trash2 className="w-3 h-3" /> Supprimer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* PAGINATION FOOTER */}
                  <div className="flex justify-between items-center bg-white p-4 border border-neutral-200/60 mt-6 shadow-3xs rounded-none">
                    <div className="text-neutral-400 font-semibold text-[10.5px]">
                      Showing {products.length > 0 ? (currentPage - 1) * 10 + 1 : 0} to {Math.min(currentPage * 10, productsPagination.total || products.length)} of {productsPagination.total || products.length} results
                    </div>

                    {productsPagination.last_page > 1 && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="border border-neutral-200/80 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer rounded-none text-neutral-600 select-none"
                        >
                          Previous
                        </button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: productsPagination.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`border py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold transition-colors cursor-pointer rounded-none select-none ${
                                page === currentPage
                                  ? 'bg-neutral-950 text-white border-neutral-950'
                                  : 'border-neutral-200/80 text-neutral-600 hover:bg-neutral-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, productsPagination.last_page))}
                          disabled={currentPage === productsPagination.last_page}
                          className="border border-neutral-200/80 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors cursor-pointer rounded-none text-neutral-600 select-none"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* Product Wizard Modal (Step by Step) */}
            {isProductModalOpen && (
                  <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-neutral-950/50 backdrop-blur-md transition-opacity duration-300" onClick={() => setIsProductModalOpen(false)} />
                    
                    {/* Modal Content Card */}
                    <div className={`relative bg-white border border-neutral-200/85 w-full shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-10 overflow-y-auto flex flex-col rounded-none animate-fade-in text-neutral-800 transition-all duration-300 ${isProductModalExpanded ? 'max-w-6xl max-h-[97vh]' : 'max-w-4xl max-h-[92vh]'}`}>
                      
                      {/* Modal Header */}
                      <div className="flex justify-between items-center px-6 py-4.5 border-b border-neutral-100">
                        <div className="flex flex-col gap-0.5">
                          <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                            {selectedProduct 
                              ? (isViewMode ? `Fiche Produit : ${selectedProduct.name}` : `Modifier le produit : ${selectedProduct.name}`) 
                              : "Nouveau produit de l'Atelier"
                            }
                          </h3>
                          <span className="text-[9.5px] text-neutral-400 font-medium tracking-wide">
                            {isViewMode ? "Visualisation des détails enregistrés" : "Formulaire de configuration étape par étape"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setIsProductModalExpanded(!isProductModalExpanded)}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-450 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer"
                            title={isProductModalExpanded ? "Réduire" : "Agrandir"}
                          >
                            {isProductModalExpanded ? (
                              <Minimize className="w-4 h-4" />
                            ) : (
                              <Maximize className="w-4 h-4" />
                            )}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setIsProductModalOpen(false)} 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-450 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer"
                            title="Fermer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Professional Progress Stepper */}
                      <div className="bg-neutral-50/60 px-6 py-4.5 border-b border-neutral-150 grid grid-cols-3 gap-6">
                        {[
                          { step: 1, title: "01. Informations", desc: "Détails, prix et catégories" },
                          { step: 2, title: "02. Galerie Médias", desc: "Photos de vitrine et vidéos" },
                          { step: 3, title: "03. Variantes & Vente", desc: "Tailles, stocks et publication" }
                        ].map((s) => {
                          const isActive = wizardStep === s.step;
                          const isCompleted = wizardStep > s.step;
                          return (
                            <div key={s.step} className="flex flex-col text-left group">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className={`text-[9.5px] font-black uppercase tracking-widest transition-colors duration-250 ${
                                  isActive ? 'text-primary' : isCompleted ? 'text-neutral-700' : 'text-neutral-400'
                                }`}>
                                  {s.title}
                                </span>
                                {isCompleted && (
                                  <span className="text-[9px] text-green-600 font-extrabold">&checkmark;</span>
                                )}
                              </div>
                              <span className="text-[9px] text-neutral-450 font-medium tracking-wide leading-none">{s.desc}</span>
                              <div className={`h-0.5 mt-2.5 transition-all duration-300 ${
                                isActive ? 'bg-primary w-full' : isCompleted ? 'bg-neutral-800 w-full' : 'bg-neutral-200/70 w-full'
                              }`} />
                            </div>
                          );
                        })}
                      </div>

                      {/* Modal Body Container */}
                      <div className="p-6 md:p-8 overflow-y-auto">
                        
                        {/* STEP 1: Base product info */}
                        {wizardStep === 1 && (
                          <form onSubmit={handleProductSubmit} className="space-y-5 text-left">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Nom du produit</label>
                              <input
                                type="text"
                                required
                                disabled={isViewMode}
                                value={productForm.name}
                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                placeholder="ex: Chelsea Boot Black"
                                className="border border-neutral-200 py-2.5 px-3.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950/5 hover:border-neutral-350 transition-all rounded-none w-full bg-white disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-2xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Prix (XOF)</label>
                                <input
                                  type="number"
                                  required
                                  disabled={isViewMode}
                                  value={productForm.price}
                                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                  placeholder="ex: 125000"
                                  className="border border-neutral-200 py-2.5 px-3.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950/5 hover:border-neutral-350 transition-all rounded-none w-full bg-white disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-2xs"
                                />
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Ancien Prix (Optionnel)</label>
                                <input
                                  type="number"
                                  disabled={isViewMode}
                                  value={productForm.old_price}
                                  onChange={(e) => setProductForm({ ...productForm, old_price: e.target.value })}
                                  placeholder="ex: 150000"
                                  className="border border-neutral-200 py-2.5 px-3.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950/5 hover:border-neutral-350 transition-all rounded-none w-full bg-white disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-2xs"
                                />
                              </div>
                            </div>

                            {(() => {
                              const selectedCat = categories.find(c => Number(c.id) === Number(productForm.category_id));
                              const subCats = selectedCat?.sub_categories || selectedCat?.subcategories || [];
                              const hasSubCats = subCats.length > 0;
                              
                              return (
                                <div className={hasSubCats ? "grid grid-cols-2 gap-5" : "w-full"}>
                                  <div className="flex flex-col gap-1.5">
                                    <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Catégorie</label>
                                    <select
                                      disabled={isViewMode}
                                      value={productForm.category_id}
                                      onChange={(e) => {
                                        const newCatId = e.target.value;
                                        setProductForm({ ...productForm, category_id: newCatId, sub_category_id: '' });
                                      }}
                                      className="border border-neutral-200 py-2.5 px-3 bg-white text-xs focus:outline-none focus:border-neutral-950 hover:border-neutral-350 transition-all rounded-none w-full disabled:bg-neutral-50 disabled:text-neutral-400 shadow-2xs cursor-pointer"
                                    >
                                      <option value="">Sélectionner une catégorie...</option>
                                      {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                      ))}
                                    </select>
                                  </div>

                                  {hasSubCats && (
                                    <div className="flex flex-col gap-1.5">
                                      <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Sous-catégorie</label>
                                      <select
                                        disabled={isViewMode}
                                        value={productForm.sub_category_id}
                                        onChange={(e) => setProductForm({ ...productForm, sub_category_id: e.target.value })}
                                        className="border border-neutral-200 py-2.5 px-3 bg-white text-xs focus:outline-none focus:border-neutral-950 hover:border-neutral-350 transition-all rounded-none w-full disabled:bg-neutral-50 disabled:text-neutral-400 shadow-2xs cursor-pointer"
                                      >
                                        <option value="">Sélectionner une sous-catégorie...</option>
                                        {subCats.map(sc => (
                                          <option key={sc.id} value={sc.id}>{sc.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Description</label>
                              <textarea
                                disabled={isViewMode}
                                value={productForm.description}
                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                rows={4}
                                placeholder="Détails, matériaux, histoire du modèle..."
                                className="border border-neutral-200 py-2.5 px-3.5 text-xs text-neutral-800 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950/5 hover:border-neutral-350 transition-all rounded-none w-full bg-white disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed shadow-2xs resize-none"
                              />
                            </div>

                            <div className="flex items-center gap-3 py-3 px-4 bg-neutral-50 border border-neutral-200/60 select-none">
                              <input
                                type="checkbox"
                                id="is_featured"
                                disabled={isViewMode}
                                checked={productForm.is_featured}
                                onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                                className="border-neutral-300 rounded-none w-4 h-4 text-primary focus:ring-0 focus:outline-none cursor-pointer disabled:opacity-50"
                              />
                              <label htmlFor="is_featured" className="text-[9.5px] font-bold text-neutral-700 uppercase tracking-wider cursor-pointer select-none">
                                Mettre ce produit en vedette sur la page d'accueil
                              </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-neutral-100 mt-6">
                              <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="border border-neutral-200 hover:border-neutral-400 font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] text-neutral-500 transition-colors cursor-pointer rounded-none"
                              >
                                Fermer
                              </button>
                              {isViewMode ? (
                                <button
                                  type="button"
                                  onClick={() => setWizardStep(2)}
                                  className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] transition-colors cursor-pointer rounded-none shadow-sm"
                                >
                                  Suivant (Médias)
                                </button>
                              ) : (
                                <button
                                  type="submit"
                                  className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] transition-colors cursor-pointer rounded-none shadow-sm"
                                >
                                  Suivant (Ajout des Médias)
                                </button>
                              )}
                            </div>
                          </form>
                        )}

                        {/* STEP 2: Media uploads */}
                        {wizardStep === 2 && selectedProduct && (
                          <div className="space-y-6 text-left">
                            
                            {/* Image Upload list */}
                            <div>
                              <div className="border-b border-neutral-100 pb-2 mb-4">
                                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[10px]">Images de vitrine</h4>
                                <p className="text-[9px] text-neutral-400 mt-0.5">Maximum 10 images. Taille maximale : 5 Mo par image. Glissez-déposez ou sélectionnez.</p>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {selectedProduct.images?.map((img) => (
                                  <div key={img.id} className="relative aspect-[3/4] bg-neutral-50 border border-neutral-200 overflow-hidden group hover:scale-[1.01] hover:border-neutral-400 transition-all duration-300 shadow-3xs">
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    {!isViewMode && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteImage(img.id)}
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-neutral-950/90 text-white hover:bg-red-650 p-1.5 shadow-md cursor-pointer"
                                        title="Supprimer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    {img.is_primary && (
                                      <span className="absolute bottom-2 left-2 bg-neutral-950 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-wider">
                                        Principale
                                      </span>
                                    )}
                                  </div>
                                ))}
                                
                                {!isViewMode && (!selectedProduct.images || selectedProduct.images.length < 10) && (
                                  <label className="border border-dashed border-neutral-300 hover:border-neutral-955 bg-neutral-50/20 hover:bg-neutral-50/50 aspect-[3/4] flex flex-col items-center justify-center cursor-pointer transition-all duration-200 p-4 text-center group">
                                    <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-805 group-hover:scale-105 transition-all mb-2" />
                                    <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-550 block">Ajouter Images</span>
                                    <input
                                      type="file"
                                      multiple
                                      accept="image/*"
                                      onChange={handleUploadImages}
                                      className="hidden"
                                    />
                                  </label>
                                )}
                              </div>
                            </div>

                            {/* Video Upload list */}
                            <div className="border-t border-neutral-100 pt-6">
                              <div className="border-b border-neutral-100 pb-2 mb-4">
                                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[10px]">Vidéo promotionnelle (Optionnelle)</h4>
                                <p className="text-[9px] text-neutral-400 mt-0.5">Maximum 1 vidéo de présentation. Format compatible HTML5 (MP4), 30 Mo maximum.</p>
                              </div>
                              
                              {selectedProduct.video ? (
                                <div className="flex items-center gap-4 bg-neutral-50 p-4 border border-neutral-200 shadow-3xs max-w-xl">
                                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center text-primary shrink-0">
                                    <Play className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs text-neutral-800 truncate">Vidéo uploadeé avec succès</p>
                                    <a href={selectedProduct.video.url} target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline font-semibold mt-0.5 inline-block">
                                      Voir la vidéo originale &nearr;
                                    </a>
                                  </div>
                                  {!isViewMode && (
                                    <button
                                      type="button"
                                      onClick={handleDeleteVideo}
                                      className="text-red-500 hover:text-red-750 font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                                    >
                                      Supprimer
                                    </button>
                                  )}
                                </div>
                              ) : (
                                !isViewMode && (
                                  <label className="border border-dashed border-neutral-300 hover:border-neutral-950 bg-neutral-50/20 hover:bg-neutral-50/50 p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 text-center w-full max-w-xl group">
                                    <Upload className="w-5 h-5 text-neutral-400 group-hover:text-neutral-800 group-hover:scale-105 transition-all mb-2" />
                                    <span className="font-bold text-[9px] uppercase tracking-wider text-neutral-550 block">Uploader une vidéo (.mp4)</span>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={handleUploadVideo}
                                      className="hidden"
                                    />
                                  </label>
                                )
                              )}
                            </div>

                            <div className="flex justify-between pt-6 border-t border-neutral-100 mt-6">
                              <button
                                type="button"
                                onClick={() => setWizardStep(1)}
                                className="border border-neutral-200 hover:border-neutral-450 font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] text-neutral-500 transition-colors cursor-pointer rounded-none"
                              >
                                Retour
                              </button>
                              
                              <button
                                type="button"
                                onClick={async () => {
                                  await loadAttributesData();
                                  setWizardStep(3);
                                }}
                                className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] transition-colors cursor-pointer rounded-none shadow-sm"
                              >
                                Suivant (Variantes & Publication)
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: Variants selection & Publish */}
                        {wizardStep === 3 && selectedProduct && (
                          <div className="space-y-6 text-left">
                            
                            <div>
                              <div className="flex justify-between items-center border-b border-neutral-100 pb-2 mb-4">
                                <div className="flex flex-col">
                                  <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[10px]">Grille des Variantes</h4>
                                  <p className="text-[9px] text-neutral-400 mt-0.5">Associez des tailles, stocks et références SKU pour ce produit. Au moins 1 variante requise.</p>
                                </div>
                                {!isViewMode && (
                                  <button
                                    type="button"
                                    onClick={handleAddVariantRow}
                                    className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-2 px-3 uppercase tracking-wider text-[9px] flex items-center gap-1 cursor-pointer transition-colors shadow-2xs rounded-none"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
                                  </button>
                                )}
                              </div>

                              {variantsList.length === 0 ? (
                                <div className="p-10 text-center bg-neutral-50 text-neutral-400 border border-neutral-150 font-semibold italic">
                                  Aucune variante configurée. {!isViewMode && "Ajoutez au moins une ligne de taille et couleur pour pouvoir publier le produit."}
                                </div>
                              ) : (
                                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                                  {/* Grid Header */}
                                  <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-neutral-50 border border-neutral-150 text-[9px] font-black uppercase tracking-wider text-neutral-400">
                                    <div className="col-span-4">Couleur</div>
                                    <div className="col-span-3">Taille</div>
                                    <div className="col-span-2">Stock</div>
                                    <div className="col-span-2">SKU (Optionnel)</div>
                                    <div className="col-span-1 text-center">Action</div>
                                  </div>

                                  {/* Grid Rows */}
                                  {variantsList.map((variant, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-center bg-white p-2 border border-neutral-150 shadow-3xs group hover:border-neutral-350 transition-all duration-150">
                                      <div className="col-span-4">
                                        <select
                                          disabled={isViewMode}
                                          value={variant.color_id}
                                          onChange={(e) => handleVariantChange(idx, 'color_id', e.target.value)}
                                          className="border border-neutral-200 py-1.5 px-2 bg-white text-xs focus:outline-none focus:border-neutral-950 w-full disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer"
                                        >
                                          {colors.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="col-span-3">
                                        <select
                                          disabled={isViewMode}
                                          value={variant.size_id}
                                          onChange={(e) => handleVariantChange(idx, 'size_id', e.target.value)}
                                          className="border border-neutral-200 py-1.5 px-2 bg-white text-xs focus:outline-none focus:border-neutral-950 w-full disabled:bg-neutral-50 disabled:text-neutral-400 cursor-pointer"
                                        >
                                          {sizes.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                          ))}
                                        </select>
                                      </div>

                                      <div className="col-span-2">
                                        <input
                                          type="number"
                                          disabled={isViewMode}
                                          placeholder="Stock"
                                          value={variant.stock}
                                          onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                                          className="border border-neutral-200 py-1.5 px-2 text-xs focus:outline-none focus:border-neutral-950 w-full disabled:bg-neutral-50 disabled:text-neutral-400"
                                        />
                                      </div>

                                      <div className="col-span-2">
                                        <input
                                          type="text"
                                          disabled={isViewMode}
                                          placeholder="SKU"
                                          value={variant.sku}
                                          onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                                          className="border border-neutral-200 py-1.5 px-2 text-xs focus:outline-none focus:border-neutral-950 w-full disabled:bg-neutral-50 disabled:text-neutral-400"
                                        />
                                      </div>

                                      <div className="col-span-1 text-center">
                                        {!isViewMode && (
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveVariantRow(idx)}
                                            className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 cursor-pointer"
                                            title="Retirer"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Liaison d'autres couleurs */}
                            <div className="border border-neutral-200/80 p-5 bg-neutral-50/20 text-left space-y-4 shadow-3xs">
                              <div className="flex flex-col border-b pb-2 border-neutral-100">
                                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[10px]">
                                  Liaison d'autres couleurs (Optionnel)
                                </h4>
                                <span className="text-[9px] text-neutral-400 font-medium mt-0.5">
                                  Associez d'autres fiches produits de couleurs différentes pour ce modèle.
                                </span>
                              </div>
                              
                              {!isViewMode && (() => {
                                const uniqueColorsInVariants = [];
                                variantsList.forEach(v => {
                                  const colorId = Number(v.color_id);
                                  const colorObj = colors.find(c => c.id === colorId);
                                  if (colorObj && !uniqueColorsInVariants.some(c => c.id === colorObj.id)) {
                                    uniqueColorsInVariants.push(colorObj);
                                  }
                                });

                                return (
                                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="flex-1 flex flex-col gap-1 w-full">
                                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Couleur cible</label>
                                      <select
                                        id="new_color_link_color"
                                        className="border border-neutral-200 py-2 px-3 bg-white text-xs focus:outline-none focus:border-neutral-950 w-full cursor-pointer shadow-3xs"
                                      >
                                        <option value="">Sélectionner une couleur...</option>
                                        {uniqueColorsInVariants.map(c => (
                                          <option key={c.id} value={JSON.stringify({ id: c.id, name: c.name, code: c.hex_code || c.code })}>{c.name}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div className="flex-1 flex flex-col gap-1 w-full">
                                      <label className="text-[9px] font-black text-neutral-400 uppercase tracking-wider">Produit correspondant</label>
                                      <select
                                        id="new_color_link_product"
                                        className="border border-neutral-200 py-2 px-3 bg-white text-xs focus:outline-none focus:border-neutral-950 w-full cursor-pointer shadow-3xs"
                                      >
                                        <option value="">Sélectionner un produit...</option>
                                        {products
                                          .filter(p => !selectedProduct || p.id !== selectedProduct.id)
                                          .map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                                          ))
                                        }
                                      </select>
                                    </div>
                                    
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const colorSelect = document.getElementById('new_color_link_color');
                                        const productSelect = document.getElementById('new_color_link_product');
                                        if (!colorSelect || !productSelect || !colorSelect.value || !productSelect.value) return;
                                        
                                        const colorObj = JSON.parse(colorSelect.value);
                                        const targetProductId = Number(productSelect.value);
                                        const targetProduct = products.find(p => p.id === targetProductId);
                                        
                                        if (colorLinks.some(link => link.product_id === targetProductId)) {
                                          return;
                                        }
                                        
                                        setColorLinks([
                                          ...colorLinks,
                                          {
                                            color_id: colorObj.id,
                                            color_name: colorObj.name,
                                            color_code: colorObj.code,
                                            product_id: targetProductId,
                                            product_name: targetProduct?.name || `Produit #${targetProductId}`
                                          }
                                        ]);
                                        
                                        colorSelect.value = '';
                                        productSelect.value = '';
                                      }}
                                      className="bg-neutral-950 hover:bg-neutral-800 text-white font-bold py-2.5 px-4 uppercase tracking-wider text-[9px] cursor-pointer shadow-3xs transition-colors shrink-0 w-full sm:w-auto"
                                    >
                                      Lier la couleur
                                    </button>
                                  </div>
                                );
                              })()}
                              
                              {colorLinks.length === 0 ? (
                                <p className="text-[10px] text-neutral-450 italic">Aucune liaison de couleur configurée.</p>
                              ) : (
                                <div className="flex flex-col gap-2 max-h-40 overflow-y-auto">
                                  {colorLinks.map((link, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-neutral-200 p-2.5 text-xs shadow-3xs">
                                      <div className="flex items-center gap-2">
                                        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300" style={{ backgroundColor: link.color_code }} />
                                        <span className="font-bold text-neutral-800">{link.color_name}</span>
                                        <span className="text-neutral-300 font-light">&rarr;</span>
                                        <span className="font-medium text-neutral-600">{link.product_name}</span>
                                        <span className="text-[9px] bg-neutral-100 text-neutral-500 px-1 py-0.5">ID: {link.product_id}</span>
                                      </div>
                                      {!isViewMode && (
                                        <button
                                          type="button"
                                          onClick={() => setColorLinks(colorLinks.filter((_, i) => i !== idx))}
                                          className="text-red-500 hover:text-red-750 font-bold uppercase tracking-wider text-[9px] cursor-pointer"
                                        >
                                          Retirer
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Publish controls */}
                            {!isViewMode && (
                              <div className="border-t border-neutral-150 pt-6">
                                <div className="border-b border-neutral-100 pb-2 mb-4">
                                  <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider text-[10px]">Action de Publication Finale</h4>
                                  <p className="text-[9px] text-neutral-400 mt-0.5">Choisissez le statut de visibilité du produit. Une image et au moins une variante sont requises.</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveVariantsAndPublish('available', null)}
                                    disabled={variantsList.length === 0 || selectedProduct.images?.length === 0}
                                    className="flex-1 bg-primary hover:bg-neutral-800 text-white font-extrabold uppercase tracking-widest py-3 px-6 text-[10.5px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs rounded-none"
                                  >
                                    Publier : Disponible Immédiatement
                                  </button>

                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const date = await showPrompt({
                                        title: "Date de précommande",
                                        description: "Veuillez renseigner la date de disponibilité pour la précommande (AAAA-MM-JJ) :",
                                        defaultValue: "2026-07-01",
                                        placeholder: "AAAA-MM-JJ",
                                      });
                                      if (date) handleSaveVariantsAndPublish('preorder', date);
                                    }}
                                    disabled={variantsList.length === 0 || selectedProduct.images?.length === 0}
                                    className="flex-1 bg-neutral-950 hover:bg-neutral-800 text-white font-extrabold uppercase tracking-widest py-3 px-6 text-[10.5px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs rounded-none"
                                  >
                                    Publier : Précommande
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="flex justify-between pt-6 border-t border-neutral-100 mt-6">
                              <button
                                type="button"
                                onClick={() => setWizardStep(2)}
                                className="border border-neutral-200 hover:border-neutral-450 font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] text-neutral-500 transition-colors cursor-pointer rounded-none"
                              >
                                Retour
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsProductModalOpen(false)}
                                className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-6 text-[10px] cursor-pointer transition-colors rounded-none shadow-sm"
                              >
                                {isViewMode ? 'Fermer la fiche' : 'Quitter sans publier'}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 4 – CATÉGORIES (CATEGORIES)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'categories' && (
            <div className="space-y-6 text-xs animate-fade-in">
              <div className="flex justify-between items-center bg-white p-4 border border-neutral-200 shadow-2xs">
                <span className="font-bold uppercase tracking-wider text-neutral-900">Arborescence des rubriques de la boutique</span>
                <button
                  onClick={() => {
                    setCategoryForm({ id: null, name: '', description: '', is_active: true });
                    setIsCategoryModalOpen(true);
                  }}
                  className="bg-primary hover:bg-neutral-800 text-white font-bold py-2 px-4 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Nouvelle catégorie
                </button>
              </div>

              {/* Grid of categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white border border-neutral-200 p-6 shadow-2xs">
                    <div className="flex justify-between items-start border-b border-neutral-100 pb-3 mb-4">
                      <div>
                        <h4 className="text-sm font-black text-neutral-900 uppercase tracking-wider">{category.name}</h4>
                        <p className="text-[10px] text-neutral-400 font-medium">Slug: {category.slug} | Status: {category.is_active ? 'Actif' : 'Inactif'}</p>
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setCategoryForm(category);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-1 text-neutral-400 hover:text-neutral-800"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subcategories list */}
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        <span>Sous-catégories</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSubCategoryForm({ id: null, categoryId: category.id, name: '', description: '' });
                            setIsSubCategoryModalOpen(true);
                          }}
                          className="text-primary hover:underline"
                        >
                          + Ajouter sous-cat
                        </button>
                      </div>

                      {category.sub_categories && category.sub_categories.length > 0 ? (
                        <div className="divide-y divide-neutral-100 border border-neutral-100 p-3 bg-neutral-50/50">
                          {category.sub_categories.map((sub) => (
                            <div key={sub.id} className="py-2 flex justify-between items-center text-xs font-semibold">
                              <span>{sub.name}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSubCategoryForm({
                                      id: sub.id,
                                      categoryId: category.id,
                                      name: sub.name,
                                      description: sub.description || ''
                                    });
                                    setIsSubCategoryModalOpen(true);
                                  }}
                                  className="p-1 text-neutral-400 hover:text-neutral-850 transition-colors"
                                  title="Modifier"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSubCategory(sub.id, sub.name)}
                                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[10px] text-neutral-400 text-center py-4">Aucune sous-catégorie.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Category Modal */}
              {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsCategoryModalOpen(false)} />
                  <form onSubmit={handleSaveCategory} className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 space-y-4 text-left transition-all duration-300 ${isCategoryModalExpanded ? 'max-w-2xl' : 'max-w-md'}`}>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                        {categoryForm.id ? 'Modifier la catégorie' : 'Créer une catégorie'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalExpanded(!isCategoryModalExpanded)}
                          className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          title={isCategoryModalExpanded ? "Réduire" : "Agrandir"}
                        >
                          {isCategoryModalExpanded ? (
                            <Minimize className="w-4 h-4" />
                          ) : (
                            <Maximize className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCategoryModalOpen(false)}
                          className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          title="Fermer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nom de la catégorie</label>
                      <input
                        type="text"
                        required
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Description</label>
                      <input
                        type="text"
                        value={categoryForm.description || ''}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="border border-neutral-200 py-2 px-3 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        id="cat_active"
                        checked={categoryForm.is_active}
                        onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                      />
                      <label htmlFor="cat_active" className="font-bold text-neutral-700 uppercase tracking-wider text-[10px] cursor-pointer">
                        Rendre cette catégorie active dans la boutique
                      </label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(false)}
                        className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px]"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Sub-Category Modal */}
              {isSubCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsSubCategoryModalOpen(false)} />
                  <form onSubmit={handleSaveSubCategory} className={`relative bg-white border border-neutral-200 w-full shadow-2xl p-6 z-10 space-y-4 text-left transition-all duration-300 ${isSubCategoryModalExpanded ? 'max-w-2xl' : 'max-w-md'}`}>
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-2">
                      <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">
                        {subCategoryForm.id ? 'Modifier la sous-catégorie' : 'Ajouter une sous-catégorie'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSubCategoryModalExpanded(!isSubCategoryModalExpanded)}
                          className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          title={isSubCategoryModalExpanded ? "Réduire" : "Agrandir"}
                        >
                          {isSubCategoryModalExpanded ? (
                            <Minimize className="w-4 h-4" />
                          ) : (
                            <Maximize className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsSubCategoryModalOpen(false)}
                          className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                          title="Fermer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nom de la sous-catégorie</label>
                      <input
                        type="text"
                        required
                        value={subCategoryForm.name}
                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                        className="border border-neutral-200 py-2 px-3 focus:outline-none focus:border-neutral-800"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Description</label>
                      <input
                        type="text"
                        value={subCategoryForm.description}
                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                        className="border border-neutral-200 py-2 px-3 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => setIsSubCategoryModalOpen(false)}
                        className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px]"
                      >
                        {subCategoryForm.id ? 'Enregistrer' : 'Créer'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Custom Delete Category Confirmation Dialog */}
              {isDeleteCategoryDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsDeleteCategoryDialogOpen(false)} />
                  <div className={`relative w-full max-w-md shadow-2xl p-6 z-10 space-y-5 text-left transition-all duration-300 border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                    
                    {/* Header */}
                    <div className={`flex justify-between items-center border-b pb-3 mb-2 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary"></span>
                        <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                          Supprimer cette catégorie ?
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDeleteCategoryDialogOpen(false)}
                        className={`p-1 cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                        title="Fermer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        Êtes-vous sûr de vouloir supprimer la catégorie <strong className={isDarkMode ? 'text-white font-bold' : 'text-neutral-900 font-bold'}>"{pendingDeleteCategory.name}"</strong> ?
                      </p>
                      <div className={`p-3 border-l-2 border-primary text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-red-950/20 text-red-400' : 'bg-red-50/60 text-primary'}`}>
                        Attention : cette action supprimera définitivement cette catégorie et TOUTES ses sous-catégories associées.
                      </div>
                    </div>

                    {/* Footer / Buttons */}
                    <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <button
                        type="button"
                        onClick={() => setIsDeleteCategoryDialogOpen(false)}
                        className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteCategory}
                        className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px] transition-colors"
                      >
                        {loading ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

              {/* Custom Delete Sub-Category Confirmation Dialog */}
              {isDeleteSubCategoryDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsDeleteSubCategoryDialogOpen(false)} />
                  <div className={`relative w-full max-w-md shadow-2xl p-6 z-10 space-y-5 text-left transition-all duration-300 border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                    
                    {/* Header */}
                    <div className={`flex justify-between items-center border-b pb-3 mb-2 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-primary"></span>
                        <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                          Supprimer cette sous-catégorie ?
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsDeleteSubCategoryDialogOpen(false)}
                        className={`p-1 cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                        title="Fermer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Content */}
                    <div className="space-y-3">
                      <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        Êtes-vous sûr de vouloir supprimer la sous-catégorie <strong className={isDarkMode ? 'text-white font-bold' : 'text-neutral-900 font-bold'}>"{pendingDeleteSubCategory.name}"</strong> ?
                      </p>
                      <div className={`p-3 border-l-2 border-primary text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-red-950/20 text-red-400' : 'bg-red-50/60 text-primary'}`}>
                        Attention : cette action supprimera définitivement cette sous-catégorie de la boutique.
                      </div>
                    </div>

                    {/* Footer / Buttons */}
                    <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                      <button
                        type="button"
                        onClick={() => setIsDeleteSubCategoryDialogOpen(false)}
                        className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={confirmDeleteSubCategory}
                        className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px] transition-colors"
                      >
                        {loading ? 'Suppression...' : 'Supprimer'}
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 5 – ATTRIBUTS (ATTRIBUTES)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'attributes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs animate-fade-in">
              {/* Colors Management */}
              <div className="bg-white border border-neutral-200 p-6 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-3">Référentiel des couleurs</h3>
                
                {/* Form to add color */}
                <form onSubmit={handleCreateColor} className="flex gap-3 items-end mb-6 text-left">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Nom</label>
                    <input
                      type="text"
                      required
                      value={newColorForm.name}
                      onChange={(e) => setNewColorForm({ ...newColorForm, name: e.target.value })}
                      placeholder="ex: Or Antique"
                      className="border border-neutral-200 py-1.5 px-3 focus:outline-none text-xs"
                    />
                  </div>
                  
                  <div className="w-24 flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Code Hex</label>
                    <input
                      type="color"
                      required
                      value={newColorForm.hex_code}
                      onChange={(e) => setNewColorForm({ ...newColorForm, hex_code: e.target.value })}
                      className="border border-neutral-200 h-9 w-full focus:outline-none cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-4 text-[10px]"
                  >
                    Ajouter
                  </button>
                </form>

                {/* Colors list */}
                <div className="divide-y divide-neutral-100 border border-neutral-100 p-4">
                  {colors.map((color) => (
                    <div key={color.id} className="py-2.5 flex justify-between items-center font-semibold text-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-none border border-neutral-200" style={{ backgroundColor: color.hex_code }} />
                        <span>{color.name}</span>
                        <span className="text-[10px] text-neutral-400 font-mono font-medium">{color.hex_code}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteColor(color.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes Management */}
              <div className="bg-white border border-neutral-200 p-6 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-6 border-b border-neutral-100 pb-3">Grille des Tailles</h3>
                
                {/* Form to add size */}
                <form onSubmit={handleCreateSize} className="flex gap-3 items-end mb-6 text-left">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Nom</label>
                    <input
                      type="text"
                      required
                      value={newSizeForm.name}
                      onChange={(e) => setNewSizeForm({ ...newSizeForm, name: e.target.value })}
                      placeholder="ex: XXL"
                      className="border border-neutral-200 py-1.5 px-3 focus:outline-none text-xs"
                    />
                  </div>

                  <div className="w-24 flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Ordre de tri</label>
                    <input
                      type="number"
                      required
                      value={newSizeForm.sort_order}
                      onChange={(e) => setNewSizeForm({ ...newSizeForm, sort_order: e.target.value })}
                      className="border border-neutral-200 py-1.5 px-2 focus:outline-none text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2.5 px-4 text-[10px]"
                  >
                    Ajouter
                  </button>
                </form>

                {/* Sizes List */}
                <div className="divide-y divide-neutral-100 border border-neutral-100 p-4">
                  {sizes.map((size) => (
                    <div key={size.id} className="py-2.5 flex justify-between items-center font-semibold text-neutral-800">
                      <div>
                        <span>Taille : {size.name}</span>
                        <span className="text-[10px] text-neutral-400 font-medium ml-3">Tri: {size.sort_order}</span>
                      </div>

                      <button
                        onClick={() => handleDeleteSize(size.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 6 – SETTINGS (SHIPPING & TEAM)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs animate-fade-in">
              {/* Shipping zones */}
              <div id="shipping-zones-section" className={`border p-6 shadow-2xs ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-6" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tarifs de Livraison</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShippingForm({ id: null, name: '', price: '', delivery_days: 2 });
                      setIsShippingModalOpen(true);
                    }}
                    className="text-primary font-bold uppercase tracking-wider text-[9px] hover:underline"
                  >
                    + Nouvelle Zone
                  </button>
                </div>

                <div className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  {shippingZones.map((zone) => (
                    <div key={zone.id} className={`py-3.5 flex justify-between items-center font-semibold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{zone.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Délais : {zone.delivery_days} jour(s)</p>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <span className={`font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{formatPrice(zone.price)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShippingForm(zone);
                            setIsShippingModalOpen(true);
                          }}
                          className="text-neutral-400 hover:text-neutral-800"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Admins */}
              <div id="team-admins-section" className={`border p-6 shadow-2xs ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-6" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Collaborateurs d'Administration</h3>
                  {adminUser?.role === 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-primary font-bold uppercase tracking-wider text-[9px] hover:underline"
                    >
                      + Nouveau collaborateur
                    </button>
                  )}
                </div>

                <div className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  {teamUsers.map((team) => (
                    <div key={team.id} className={`py-3 flex justify-between items-center font-semibold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-955'}`}>{team.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{team.email}</p>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <span className="bg-accent/15 text-accent-dark px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider">
                          {team.role}
                        </span>
                        
                        {adminUser?.role === 'super_admin' && team.email !== adminUser.email && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamUser(team.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Désactiver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-3xl mx-auto text-xs animate-fade-in">
              {/* Shipping zones */}
              <div id="shipping-zones-section" className={`border p-6 shadow-2xs ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-6" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Tarifs de Livraison</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShippingForm({ id: null, name: '', price: '', delivery_days: 2 });
                      setIsShippingModalOpen(true);
                    }}
                    className="text-primary font-bold uppercase tracking-wider text-[9px] hover:underline"
                  >
                    + Nouvelle Zone
                  </button>
                </div>

                <div className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  {shippingZones.length === 0 && (
                    <div className="py-4 text-center text-neutral-500 uppercase tracking-wider text-[10px]">
                      Aucune zone de livraison configurée.
                    </div>
                  )}
                  {shippingZones.map((zone) => (
                    <div key={zone.id} className={`py-3.5 flex justify-between items-center font-semibold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{zone.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">Délais : {zone.delivery_days} jour(s)</p>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <span className={`font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>{formatPrice(zone.price)}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShippingForm(zone);
                            setIsShippingModalOpen(true);
                          }}
                          className="text-neutral-400 hover:text-neutral-800"
                          title="Modifier"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="max-w-3xl mx-auto text-xs animate-fade-in">
              {/* Team Admins */}
              <div id="team-admins-section" className={`border p-6 shadow-2xs ${isDarkMode ? 'bg-neutral-900 border-neutral-850 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-6" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Collaborateurs d'Administration</h3>
                  {adminUser?.role === 'super_admin' && (
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(true)}
                      className="text-primary font-bold uppercase tracking-wider text-[9px] hover:underline"
                    >
                      + Nouveau collaborateur
                    </button>
                  )}
                </div>

                <div className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  {teamUsers.length === 0 && (
                    <div className="py-4 text-center text-neutral-500 uppercase tracking-wider text-[10px]">
                      Aucun collaborateur trouvé.
                    </div>
                  )}
                  {teamUsers.map((team) => (
                    <div key={team.id} className={`py-3 flex justify-between items-center font-semibold ${isDarkMode ? 'text-neutral-200' : 'text-neutral-800'}`}>
                      <div>
                        <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-955'}`}>{team.name}</p>
                        <p className="text-[10px] text-neutral-400 font-medium">{team.email}</p>
                      </div>
                      
                      <div className="flex gap-4 items-center">
                        <span className="bg-accent/15 text-accent-dark px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider">
                          {team.role}
                        </span>
                        
                        {adminUser?.role === 'super_admin' && team.email !== adminUser.email && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTeamUser(team.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Désactiver"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hero-slides' && (
            <HeroSlides
              isDarkMode={isDarkMode}
              showConfirm={showConfirm}
              showAlert={showAlert}
              setSuccess={setSuccess}
              setError={setError}
            />
          )}

          {activeTab === 'notification-templates' && (
            <div className="animate-fade-in">
              <NotificationTemplates
                isDarkMode={isDarkMode}
                showConfirm={showConfirm}
                showAlert={showAlert}
                setSuccess={setSuccess}
                setError={setError}
              />
            </div>
          )}

          {activeTab === 'notification-campaigns' && (
            <div className="animate-fade-in">
              <NotificationCampaigns
                isDarkMode={isDarkMode}
                showConfirm={showConfirm}
                showAlert={showAlert}
                setSuccess={setSuccess}
                setError={setError}
              />
            </div>
          )}

          {/* ──────────────────────────────────────────────────────────────────
              TAB 7 – MON PROFIL (Auth /admin/auth/me + /admin/auth/password)
              ────────────────────────────────────────────────────────────────── */}
          {activeTab === 'profile' && (
            <div className="max-w-2xl mx-auto flex flex-col gap-8 animate-fade-in text-xs">

              {/* Informations personnelles */}
              <div className="bg-white border border-neutral-200 p-6 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-3 mb-6">
                  Mes informations
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nom complet</label>
                    <div className="border border-neutral-200 py-2.5 px-3 bg-neutral-50 text-neutral-700 font-medium">
                      {adminUser?.name || '—'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Email</label>
                    <div className="border border-neutral-200 py-2.5 px-3 bg-neutral-50 text-neutral-700 font-medium">
                      {adminUser?.email || '—'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Téléphone</label>
                    <div className="border border-neutral-200 py-2.5 px-3 bg-neutral-50 text-neutral-700 font-medium">
                      {adminUser?.phone || 'Non renseigné'}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Rôle</label>
                    <div className="border border-neutral-200 py-2.5 px-3 bg-neutral-50 font-medium flex items-center gap-2">
                      <span className="bg-accent/15 text-accent-dark px-2 py-0.5 font-bold uppercase text-[9px] tracking-wider">
                        {adminUser?.role === 'super_admin' ? 'Super Admin'
                          : adminUser?.role === 'admin' ? 'Administrateur'
                          : adminUser?.role === 'gestionnaire_stock' ? 'Gestionnaire Stock'
                          : adminUser?.role === 'service_client' ? 'Service Client'
                          : adminUser?.role || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Changer le mot de passe */}
              <div id="change-password-section" className="bg-white border border-neutral-200 p-6 shadow-2xs">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 border-b border-neutral-100 pb-3 mb-6">
                  Changer le mot de passe
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target);
                    const current_password = fd.get('current_password');
                    const password = fd.get('password');
                    const password_confirmation = fd.get('password_confirmation');
                    if (password !== password_confirmation) {
                      setError('Les mots de passe ne correspondent pas.');
                      return;
                    }
                    try {
                      setLoading(true);
                      await adminService.changePassword({ current_password, password, password_confirmation });
                      setSuccess('Mot de passe mis à jour avec succès.');
                      e.target.reset();
                    } catch (err) {
                      setError(err?.response?.data?.message || 'Erreur lors du changement de mot de passe.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Mot de passe actuel</label>
                    <input
                      type="password"
                      name="current_password"
                      required
                      className="border border-neutral-200 py-2.5 px-3 focus:outline-none focus:border-neutral-800 font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nouveau mot de passe</label>
                      <input
                        type="password"
                        name="password"
                        required
                        minLength={8}
                        className="border border-neutral-200 py-2.5 px-3 focus:outline-none focus:border-neutral-800 font-medium"
                        placeholder="Min. 8 caractères"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        name="password_confirmation"
                        required
                        minLength={8}
                        className="border border-neutral-200 py-2.5 px-3 focus:outline-none focus:border-neutral-800 font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2 border-t border-neutral-100 mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-primary hover:bg-neutral-900 text-white font-bold uppercase tracking-widest py-2.5 px-6 text-[10px] disabled:opacity-50 transition-colors"
                    >
                      {loading ? 'Enregistrement…' : 'Mettre à jour'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Shipping Zone Modal */}
          {isShippingModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsShippingModalOpen(false)} />
              <form onSubmit={handleSaveShippingZone} className={`relative border w-full shadow-2xl p-6 z-10 space-y-4 text-left transition-all duration-300 ${isShippingModalExpanded ? 'max-w-2xl' : 'max-w-md'} ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className={`flex justify-between items-center border-b pb-3 mb-2 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {shippingForm.id ? 'Modifier la zone' : 'Créer une zone'}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsShippingModalExpanded(!isShippingModalExpanded)}
                      className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                      title={isShippingModalExpanded ? "Réduire" : "Agrandir"}
                    >
                      {isShippingModalExpanded ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsShippingModalOpen(false)}
                      className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nom de la zone de livraison *</label>
                  <input
                    type="text"
                    required
                    value={shippingForm.name}
                    onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                    placeholder="ex: Zone Interne Abidjan"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Tarif (XOF) *</label>
                    <input
                      type="number"
                      required
                      value={shippingForm.price}
                      onChange={(e) => setShippingForm({ ...shippingForm, price: e.target.value })}
                      placeholder="ex: 2000"
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Délais de livraison (Jours) *</label>
                    <input
                      type="number"
                      required
                      value={shippingForm.delivery_days}
                      onChange={(e) => setShippingForm({ ...shippingForm, delivery_days: e.target.value })}
                      placeholder="ex: 1"
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                    />
                  </div>
                </div>

                <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  <button
                    type="button"
                    onClick={() => setIsShippingModalOpen(false)}
                    className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-neutral-850 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px]"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Team Member Modal */}
          {isTeamModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setIsTeamModalOpen(false)} />
              <form onSubmit={handleCreateTeamUser} className={`relative border w-full shadow-2xl p-6 z-10 space-y-4 text-left transition-all duration-300 ${isTeamModalExpanded ? 'max-w-2xl' : 'max-w-md'} ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                <div className={`flex justify-between items-center border-b pb-3 mb-2 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                    Ajouter un collaborateur
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTeamModalExpanded(!isTeamModalExpanded)}
                      className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                      title={isTeamModalExpanded ? "Réduire" : "Agrandir"}
                    >
                      {isTeamModalExpanded ? (
                        <Minimize className="w-4 h-4" />
                      ) : (
                        <Maximize className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTeamModalOpen(false)}
                      className="text-neutral-400 hover:text-neutral-800 transition-colors p-1 cursor-pointer"
                      title="Fermer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Nom Complet *</label>
                  <input
                    type="text"
                    required
                    value={teamForm.name}
                    onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-855 ${isDarkMode ? 'bg-neutral-855 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Email *</label>
                  <input
                    type="email"
                    required
                    value={teamForm.email}
                    onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })}
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-855 ${isDarkMode ? 'bg-neutral-855 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Mot de passe *</label>
                    <input
                      type="password"
                      required
                      value={teamForm.password}
                      onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })}
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-855 ${isDarkMode ? 'bg-neutral-855 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">Rôle *</label>
                    <select
                      value={teamForm.role}
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-855 bg-white ${isDarkMode ? 'bg-neutral-855 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800'}`}
                    >
                      <option value="admin">Administrateur (admin)</option>
                      <option value="gestionnaire_stock">Gestionnaire Stock</option>
                      <option value="service_client">Service Client</option>
                    </select>
                  </div>
                </div>

                <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  <button
                    type="button"
                    onClick={() => setIsTeamModalOpen(false)}
                    className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-neutral-855 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px]"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reusable Custom Dialog (Confirm & Prompt) */}
          {customDialog.isOpen && (
            <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => customDialog.onClose && customDialog.onClose()} />
              <div className={`relative w-full max-w-md shadow-2xl p-6 z-10 space-y-5 text-left transition-all duration-300 border ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}>
                
                {/* Header */}
                <div className={`flex justify-between items-center border-b pb-3 mb-2 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-primary"></span>
                    <h3 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                      {customDialog.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => customDialog.onClose && customDialog.onClose()}
                    className={`p-1 cursor-pointer transition-colors ${isDarkMode ? 'text-neutral-500 hover:text-white' : 'text-neutral-400 hover:text-neutral-800'}`}
                    title="Fermer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Content */}
                <div className="space-y-4">
                  {customDialog.description && (
                    <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
                      {customDialog.description}
                    </p>
                  )}
                  
                  {customDialog.isPrompt && (
                    <input
                      type="text"
                      value={customDialog.promptValue}
                      onChange={(e) => setCustomDialog(prev => ({ ...prev, promptValue: e.target.value }))}
                      placeholder={customDialog.promptPlaceholder}
                      className={`w-full border py-2 px-3 text-xs focus:outline-none ${isDarkMode ? 'bg-neutral-855 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-neutral-800'}`}
                      autoFocus
                    />
                  )}

                  {customDialog.warningText && (
                    <div className={`p-3 border-l-2 border-primary text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'bg-red-950/20 text-red-400' : 'bg-red-50/60 text-primary'}`}>
                      {customDialog.warningText}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
                  {customDialog.cancelLabel && (
                    <button
                      type="button"
                      onClick={() => customDialog.onClose && customDialog.onClose()}
                      className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
                    >
                      {customDialog.cancelLabel}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (customDialog.onConfirm) {
                        if (customDialog.isPrompt) {
                          customDialog.onConfirm(customDialog.promptValue);
                        } else {
                          customDialog.onConfirm();
                        }
                      }
                    }}
                    className="bg-primary hover:bg-neutral-800 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px] transition-colors"
                  >
                    {customDialog.confirmLabel}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Footer Admin */}
        <footer className="mt-12 pt-6 border-t border-neutral-200 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Ha-kavod 97. Console de Gestion Administrative.
        </footer>


      </main>
    </div>
  </div>
  );
};

export default MainDashboard;
