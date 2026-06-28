import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, Truck, CreditCard, CheckCircle, Clock, XCircle, AlertCircle, MapPin, Package, X } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import checkoutService from '../../services/api/checkoutService';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import productService from '../../services/api/productService';
import customerService from '../../services/api/customerService';

// Fallback mock order if API search fails
const MOCK_ORDER = {
  reference: 'CMD-D3K9P7M2',
  status: 'preparing', // pending, confirmed, preparing, shipped, delivered, cancelled
  is_preorder: false,
  customer_name: 'Cedrid Aurel',
  customer_email: 'aurel.cedrid@gmail.com',
  customer_phone: '+225 0707070707',
  subtotal: 125000,
  shipping_cost: 3000,
  total: 128000,
  shipping_address: 'Avenue Latrille, Cocody',
  commune: { name: 'Cocody' },
  region: { name: 'Abidjan' },
  items: [
    {
      id: 1,
      product: { name: 'Derby Oxford Cuir Grainé', price: 125000 },
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
      selectedSize: '42',
      selectedColor: 'Bordeaux'
    }
  ],
  created_at: '2026-06-12T19:30:00.000000Z'
};

const getApiBase = () => {
  const apiUrl = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

const normalizeImage = (image) => {
  if (!image) return null;
  const resolve = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) return url;
    const base = getApiBase();
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  if (typeof image === 'string') return resolve(image);
  if (typeof image === 'object') return resolve(image.url || image.path || image.src || image.public_url || null);
  return null;
};

const normalizeCompare = (str) => {
  if (!str) return '';
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
};

const getProductImageFromLocalMock = (productId, productName) => {
  try {
    const stored = localStorage.getItem('mock_products');
    if (stored) {
      const products = JSON.parse(stored);
      const found = products.find(p => 
        (productId && Number(p.id) === Number(productId)) || 
        (productName && normalizeCompare(p.name) === normalizeCompare(productName))
      );
      if (found) {
        const mainImage = found.images?.find(img => img.is_main)?.url || found.images?.[0]?.url || found.image;
        if (mainImage) return mainImage;
      }
    }
  } catch (e) {
    console.warn("Failed to get product image from local mock products", e);
  }
  return null;
};

const STATUS_STEPS = [
  { key: 'pending', label: 'step_pending_label', desc: 'step_pending_desc' },
  { key: 'confirmed', label: 'step_confirmed_label', desc: 'step_confirmed_desc' },
  { key: 'preparing', label: 'step_preparing_label', desc: 'step_preparing_desc' },
  { key: 'shipped', label: 'step_shipped_label', desc: 'step_shipped_desc' },
  { key: 'delivered', label: 'step_delivered_label', desc: 'step_delivered_desc' }
];

const validateIvoryCoastPhone = (phone, provider, c) => {
  if (!phone) return { isValid: false, message: c.phone_required };
  const cleanPhone = phone.replace(/[\s.-]/g, '');

  if (!/^\d{10}$/.test(cleanPhone)) {
    return { isValid: false, message: c.phone_10_digits };
  }
  const prefix = cleanPhone.substring(0, 2);
  if (provider === 'Orange Money' && !['07', '08', '09'].includes(prefix)) {
    return { 
      isValid: true, 
      isWarning: true, 
      message: c.orange_warning 
    };
  }
  if (provider === 'MTN Momo' && !['05', '06'].includes(prefix)) {
    return { 
      isValid: true, 
      isWarning: true, 
      message: c.mtn_warning 
    };
  }
  if (provider === 'Moov Money' && !['01', '02'].includes(prefix)) {
    return { 
      isValid: true, 
      isWarning: true, 
      message: c.moov_warning 
    };
  }
  return { isValid: true, isWarning: false, message: c.operator_format_conformed };
};

const CONTENT = {
  fr: {
    title: "Suivi de Commande",
    ref_label: "Référence de commande",
    search_placeholder: "CMD-AB12CD34",
    search_btn: "Rechercher",
    searching: "Recherche de votre commande...",
    order_not_found: "Impossible de charger la commande. Vérifiez la référence ou la connexion.",
    success_payment: "Votre paiement a été validé avec succès ! Nous préparons votre commande.",
    cancel_payment_error: "La transaction de paiement a été annulée. Votre commande a été annulée. Veuillez retourner à la boutique pour passer une nouvelle commande.",

    step_pending_label: "Reçue",
    step_pending_desc: "Votre commande a été enregistrée.",
    step_confirmed_label: "Confirmée",
    step_confirmed_desc: "Commande validée par nos équipes.",
    step_preparing_label: "Préparation",
    step_preparing_desc: "Vos articles sont en cours de conditionnement.",
    step_shipped_label: "Expédiée",
    step_shipped_desc: "Le colis est en route pour la livraison.",
    step_delivered_label: "Livrée",
    step_delivered_desc: "Commande remise avec succès.",

    my_account: "Mon Compte",
    recent_orders: "Vos Commandes Récentes ({count})",
    no_orders: "Vous n'avez pas encore passé de commande avec cette adresse e-mail.",
    selected: "Sélectionnée",
    details: "Détails →",
    ordered_on: "Passée le {date}",

    active_order: "Commande active",
    demo_mode: "(Mode Démo)",
    cancel_requested_alert: "Votre demande d'annulation est en cours d'examen par notre équipe.",
    order_cancelled_title: "Commande Annulée",
    order_cancelled_desc: "Cette commande a été annulée et ne sera pas expédiée.",
    delivery_status_title: "État de la livraison",

    payment_pending_title: "Paiement en attente de validation",
    payment_pending_desc: "Votre commande a été enregistrée, mais aucun paiement n'a encore été associé. Veuillez finaliser le règlement en saisissant votre numéro de paiement Mobile Money.",
    operator: "Opérateur",
    payment_phone_ci: "Numéro de paiement (Côte d'Ivoire)",
    pay_now: "Payer maintenant",
    initializing: "Initialisation...",
    invalid_momo_phone: "Numéro de paiement Mobile Money invalide : {error}",
    momo_init_failed: "Impossible d'initier le paiement. Veuillez réessayer.",
    card_title: "Carte Bancaire",
    card_redirect_notice: "Vous allez être redirigé vers l'espace de paiement sécurisé de notre partenaire bancaire pour saisir vos coordonnées de carte (Visa, Mastercard, etc.).",

    shipping_address: "Adresse de livraison",
    financial_summary: "Résumé financier",
    subtotal: "Sous-total",
    shipping_cost: "Frais de port",
    free: "Gratuit",
    total_amount: "Montant Total",
    currency_notice: "* Payé en Franc CFA (XOF). Les montants d'affichage ci-dessus sont convertis à titre indicatif.",
    phone: "Téléphone",
    email: "E-mail",

    ordered_items: "Articles commandés ({count})",
    quantity: "Quantité",
    size: "Taille",
    color: "Couleur",
    ref: "Réf",

    cancellation_title: "Annulation de commande",
    cancellation_desc: "Vous pouvez annuler cette commande sans frais. Cette action est définitive et annulera l'expédition de tous les articles.",
    cancellation_rules: "Règles : Annulation autorisée sous 24 heures après l'achat (restant : {hours} heures) et uniquement si le statut est \"Reçue\" ou \"Confirmée\".",
    cancel_btn: "Annuler la commande",
    cancelling: "Annulation...",
    cancel_requested_success: "Votre demande d'annulation a bien été transmise à notre équipe. Elle est en cours d'examen.",
    cancel_error: "Erreur lors de la demande d'annulation.",

    modal_cancel_title: "Annuler la commande ?",
    modal_cancel_confirm: "Êtes-vous sûr de vouloir annuler la commande \"{ref}\" ? Cette action est irréversible.",
    modal_keep_btn: "Garder la commande",
    modal_confirm_btn: "Confirmer l'annulation",

    validation_provider: "Validation {provider}",
    momo_ussd_notice: "Veuillez consulter votre téléphone au {phone} et entrer votre code secret pour valider le paiement.",
    awaiting_validation: "En attente de votre validation...",
    close_later: "Fermer / Payer plus tard",
    payment_success: "Paiement Réussi",
    payment_success_notice: "Votre paiement a bien été validé par l'opérateur. Nous préparons votre commande.",
    refreshing_page: "Actualisation de la page...",
    payment_failed: "Paiement Échoué",
    payment_failed_default: "Le paiement a été rejeté ou a échoué. Veuillez réessayer.",
    retry_payment: "Réessayer le paiement",
    close_later_short: "Fermer / Plus tard",

    phone_required: "Le numéro de paiement est requis.",
    phone_10_digits: "Le numéro doit comporter exactement 10 chiffres (ex: 0707070707).",
    orange_warning: "Ce numéro ne commence pas par un préfixe Orange classique (07, 08, 09).",
    mtn_warning: "Ce numéro ne commence pas par un préfixe MTN classique (05, 06).",
    moov_warning: "Ce numéro ne commence pas par un préfixe Moov classique (01, 02).",
    operator_format_conformed: "Format de numéro conforme pour cet opérateur.",
    cancel_requested_already: "Une demande d'annulation est déjà en cours de traitement pour cette commande.",
    cancel_already_cancelled: "Cette commande est déjà annulée.",
    cancel_disallowed_status: "La commande ne peut plus être annulée car elle est déjà en cours de préparation ou expédiée.",
    cancel_timeout: "Le délai d'annulation autorisé de 24 heures après achat est dépassé."
  },
  en: {
    title: "Order Tracking",
    ref_label: "Order Reference",
    search_placeholder: "CMD-AB12CD34",
    search_btn: "Search",
    searching: "Searching for your order...",
    order_not_found: "Could not load the order. Check the reference or your connection.",
    success_payment: "Your payment has been successfully validated! We are preparing your order.",
    cancel_payment_error: "Payment transaction was cancelled. Your order has been cancelled. Please return to the shop to place a new order.",

    step_pending_label: "Received",
    step_pending_desc: "Your order has been registered.",
    step_confirmed_label: "Confirmed",
    step_confirmed_desc: "Order confirmed by our team.",
    step_preparing_label: "Preparing",
    step_preparing_desc: "Your items are being packaged.",
    step_shipped_label: "Shipped",
    step_shipped_desc: "The package is on its way for delivery.",
    step_delivered_label: "Delivered",
    step_delivered_desc: "Order successfully delivered.",

    my_account: "My Account",
    recent_orders: "Your Recent Orders ({count})",
    no_orders: "You have not placed any orders with this email address yet.",
    selected: "Selected",
    details: "Details →",
    ordered_on: "Ordered on {date}",

    active_order: "Active order",
    demo_mode: "(Demo Mode)",
    cancel_requested_alert: "Your cancellation request is currently being reviewed by our team.",
    order_cancelled_title: "Order Cancelled",
    order_cancelled_desc: "This order has been cancelled and will not be shipped.",
    delivery_status_title: "Delivery Status",

    payment_pending_title: "Payment pending validation",
    payment_pending_desc: "Your order has been registered, but no payment has been associated yet. Please finalize your payment by entering your Mobile Money payment number.",
    operator: "Operator",
    payment_phone_ci: "Payment Number (Ivory Coast)",
    pay_now: "Pay Now",
    initializing: "Initializing...",
    invalid_momo_phone: "Invalid Mobile Money payment number: {error}",
    momo_init_failed: "Unable to initiate payment. Please try again.",
    card_title: "Credit Card",
    card_redirect_notice: "You will be redirected to the secure payment page of our banking partner to enter your card details (Visa, Mastercard, etc.).",

    shipping_address: "Shipping Address",
    financial_summary: "Financial Summary",
    subtotal: "Subtotal",
    shipping_cost: "Shipping cost",
    free: "Free",
    total_amount: "Total Amount",
    currency_notice: "* Paid in West African Franc (XOF). Displayed amounts above are converted for reference only.",
    phone: "Phone",
    email: "Email",

    ordered_items: "Ordered items ({count})",
    quantity: "Quantity",
    size: "Size",
    color: "Color",
    ref: "Ref",

    cancellation_title: "Order Cancellation",
    cancellation_desc: "You can cancel this order without fees. This action is final and will cancel the shipment of all items.",
    cancellation_rules: "Rules: Cancellation allowed within 24 hours of purchase ({hours} hours remaining) and only if status is \"Received\" or \"Confirmed\".",
    cancel_btn: "Cancel Order",
    cancelling: "Cancelling...",
    cancel_requested_success: "Your cancellation request has been successfully sent to our team. It is under review.",
    cancel_error: "Error during cancellation request.",

    modal_cancel_title: "Cancel order?",
    modal_cancel_confirm: "Are you sure you want to cancel the order \"{ref}\"? This action is irreversible.",
    modal_keep_btn: "Keep order",
    modal_confirm_btn: "Confirm cancellation",

    validation_provider: "Validation {provider}",
    momo_ussd_notice: "Please check your phone at {phone} and enter your secret code to validate the payment.",
    awaiting_validation: "Awaiting your validation...",
    close_later: "Close / Pay later",
    payment_success: "Payment Successful",
    payment_success_notice: "Your payment has been successfully approved by the operator. We are preparing your order.",
    refreshing_page: "Refreshing page...",
    payment_failed: "Payment Failed",
    payment_failed_default: "Payment was rejected or failed. Please try again.",
    retry_payment: "Retry payment",
    close_later_short: "Close / Later",

    phone_required: "Payment phone number is required.",
    phone_10_digits: "The phone number must be exactly 10 digits (e.g. 0707070707).",
    orange_warning: "This number does not start with a classic Orange prefix (07, 08, 09).",
    mtn_warning: "This number does not start with a classic MTN prefix (05, 06).",
    moov_warning: "This number does not start with a classic Moov prefix (01, 02).",
    operator_format_conformed: "Number format compliant for this operator.",
    cancel_requested_already: "A cancellation request is already being processed for this order.",
    cancel_already_cancelled: "This order is already cancelled.",
    cancel_disallowed_status: "The order can no longer be cancelled because it is already preparing or shipped.",
    cancel_timeout: "The authorized 24-hour cancellation period after purchase has passed."
  }
};

export const OrderTracking = () => {
  const { reference } = useParams();
  const navigate = useNavigate();
  const { formatPrice, activeCurrency, activeLocale } = useSettings();
  const { customerUser, isAuthenticated } = useCustomerAuth();

  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];

  const [searchQuery, setSearchQuery] = useState(reference || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [customerOrders, setCustomerOrders] = useState([]);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [catalogProducts, setCatalogProducts] = useState([]);

  // États pour le flux de paiement Mobile Money sur suivi
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Orange Money');
  const [isMobileValidating, setIsMobileValidating] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, SUCCESS, FAILED
  const [paymentError, setPaymentError] = useState('');
  const [isPolling, setIsPolling] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentAlert, setPaymentAlert] = useState(null);

  // Charger la liste des produits pour le mappage des images correctes
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const data = await productService.getProducts({ per_page: 100 });
        if (Array.isArray(data)) {
          setCatalogProducts(data);
        }
      } catch (err) {
        console.warn("Erreur de chargement du catalogue pour le mappage des images", err);
      }
    };
    loadCatalog();
  }, []);

  const getProductImageFromCatalog = (productId, productName) => {
    // 1. D'abord chercher dans catalogProducts (API fraîche)
    if (catalogProducts.length > 0) {
      const found = catalogProducts.find(p => 
        (productId && Number(p.id) === Number(productId)) || 
        (productName && normalizeCompare(p.name) === normalizeCompare(productName))
      );
      if (found) {
        const mainImage = found.images?.find(img => img.is_main)?.url || found.images?.[0]?.url || found.image;
        if (mainImage) return mainImage;
      }
    }
    
    // 2. Repli vers getProductImageFromLocalMock
    return getProductImageFromLocalMock(productId, productName);
  };

  // Charger l'historique des commandes du client connecté
  useEffect(() => {
    let active = true;
    const loadCustomerOrders = async () => {
      if (isAuthenticated && customerUser) {
        try {
          const res = await customerService.getOrders();
          const list = Array.isArray(res) ? res : (res?.data || res || []);
          if (active) {
            setCustomerOrders(list);
          }
        } catch (e) {
          console.error("Erreur de chargement des commandes client:", e);
        }
      } else {
        setCustomerOrders([]);
      }
    };
    loadCustomerOrders();
    return () => {
      active = false;
    };
  }, [isAuthenticated, customerUser, order]);

  // Récupérer la commande par sa référence (hybride : API réelle d'abord pour avoir les données à jour, puis localStorage si échec)
  useEffect(() => {
    const fetchOrder = async () => {
      if (!reference) {
        setOrder(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        // 1. Interroger l'API réelle
        let apiOrder = null;
        try {
          const res = await checkoutService.getOrder(reference, {
            currency: activeCurrency,
            lang: activeLocale
          });
          apiOrder = res?.data ?? res;
        } catch (apiErr) {
          console.warn("L'API a échoué ou commande introuvable en base. Tentative via local storage...", apiErr);
        }

        if (apiOrder && apiOrder.reference) {
          const mappedOrder = {
            reference: apiOrder.reference,
            status: apiOrder.status,
            is_preorder: apiOrder.is_preorder,
            customer_name: apiOrder.customer_name,
            customer_email: apiOrder.customer_email,
            customer_phone: apiOrder.customer_phone,
            subtotal: apiOrder.subtotal,
            shipping_cost: apiOrder.shipping_cost,
            total: apiOrder.total,
            shipping_address: apiOrder.shipping_address,
            commune: apiOrder.commune || { name: 'Cocody' },
            region: apiOrder.region || { name: 'Abidjan' },
            items: apiOrder.items?.map(it => {
              let color = it.product_variant?.color?.name || 'N/A';
              let size = it.product_variant?.size?.name || 'Unique';
              if (it.variant_label && (!it.product_variant?.color || !it.product_variant?.size)) {
                const parts = it.variant_label.split('/').map(s => s.trim());
                if (parts.length === 2) {
                  color = parts[0];
                  size = parts[1];
                } else if (parts.length === 1) {
                  color = parts[0];
                }
              }

              const rawImage = normalizeImage(it.product?.images?.find(img => img.is_main)?.url) ||
                               normalizeImage(it.product?.images?.[0]?.url) ||
                               normalizeImage(it.product?.images?.[0]) ||
                               normalizeImage(it.product?.image) ||
                               normalizeImage(it.product_variant?.image) ||
                               normalizeImage(it.product_variant?.images?.[0]?.url) ||
                               normalizeImage(it.product_variant?.images?.[0]) ||
                               normalizeImage(it.image) ||
                               normalizeImage(it.product_image);

              const defaultImage = 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80';
              let finalImage = rawImage;
              if (!finalImage || finalImage === defaultImage) {
                finalImage = normalizeImage(getProductImageFromCatalog(it.product_id, it.product_name || it.product?.name)) || defaultImage;
              }

              return {
                id: it.id,
                productId: it.product_id,
                sku: it.sku,
                product: {
                  name: it.product_name || it.product?.name || 'Article',
                  price: Number(it.unit_price ?? it.price ?? 0)
                },
                quantity: it.quantity,
                image: finalImage,
                selectedSize: size,
                selectedColor: color
              };
            }) || [],
            created_at: apiOrder.created_at
          };
          setOrder(mappedOrder);
          setIsDemoMode(false);

          setLoading(false);
          return;
        }

        throw new Error("Commande introuvable");
      } catch (err) {
        console.error("Échec de récupération de la commande.", err);
        setError(c.order_not_found);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [reference, activeCurrency, activeLocale, catalogProducts]);

  // Détecter les paramètres de retour de paiement dans l'URL
  useEffect(() => {
    const paymentParam = new URLSearchParams(window.location.search).get('payment');
    if (paymentParam === 'success') {
      setSuccess(c.success_payment);
    } else if (paymentParam === 'cancel') {
      setError(c.cancel_payment_error);
      if (reference) {
        checkoutService.cancelOrder(reference).catch(err => {
          console.warn("Failed to cancel order on payment cancel callback:", err);
        });
      }
    }
  }, [reference]);

  // Polling du statut du paiement
  useEffect(() => {
    let intervalId;
    if (isPolling && order?.reference) {
      const poll = async () => {
        try {
          const res = await checkoutService.getPaymentStatus(order.reference);
          const status = res?.status || res?.data?.status;
          console.log("Tracking Polled payment status:", status);
          if (status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            setIsPolling(false);
            setTimeout(() => {
              setIsMobileValidating(false);
              window.location.href = `${window.location.origin}/order-tracking/${order.reference}?payment=success`;
            }, 2000);
          } else if (status === 'FAILED') {
            setPaymentStatus('FAILED');
            setIsPolling(false);
            setPaymentError(res?.gateway_message || c.payment_failed_default);
          }
        } catch (err) {
          console.warn("Erreur lors de la vérification du statut (polling):", err);
        }
      };

      poll();
      intervalId = setInterval(poll, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, order?.reference]);

  const getMappedOperator = (method) => {
    switch (method) {
      case 'Orange Money': return 'orange';
      case 'MTN Momo': return 'mtn';
      case 'Moov Money': return 'moov';
      case 'Wave': return 'wave';
      default: return null;
    }
  };

  const handleInitiatePaymentFromTracking = async () => {
    setPaymentAlert(null);
    setPaymentError('');
    setPaymentLoading(true);

    const isCard = paymentMethod === 'Carte Bancaire';

    if (!isCard) {
      const phoneVal = validateIvoryCoastPhone(paymentPhone, paymentMethod, c);
      if (!phoneVal.isValid) {
        setPaymentAlert({ type: 'error', message: c.invalid_momo_phone.replace('{error}', phoneVal.message) });
        setPaymentLoading(false);
        return;
      }
    }

    try {
      let paymentPayload;
      if (isCard) {
        paymentPayload = {
          payment_type: "visa",
          success_url: `${window.location.origin}/order-tracking/${order.reference}?payment=success`,
          cancel_url: `${window.location.origin}/order-tracking/${order.reference}?payment=cancel`
        };
      } else {
        const mappedOperator = getMappedOperator(paymentMethod);
        paymentPayload = {
          payment_type: "mobile_money",
          operator: mappedOperator,
          phone_number: paymentPhone,
          country: "CI",
          success_url: `${window.location.origin}/order-tracking/${order.reference}?payment=success`,
          cancel_url: `${window.location.origin}/order-tracking/${order.reference}?payment=cancel`
        };
      }

      const paymentRes = await checkoutService.initiatePayment(order.reference, paymentPayload);
      setPaymentLoading(false);

      if (paymentRes?.provider_link) {
        window.location.href = paymentRes.provider_link;
        return;
      }

      if (!isCard) {
        // Sinon (USSD push orange, mtn, moov), on ouvre la modal et on lance le polling
        setIsMobileValidating(true);
        setPaymentStatus('PENDING');
        setIsPolling(true);
      }
    } catch (err) {
      console.error("Initiate payment failed on tracking:", err);
      setPaymentLoading(false);
      setPaymentAlert({
        type: 'error',
        message: err?.response?.data?.message || err?.message || c.momo_init_failed
      });
    }
  };

  const handleRetryPayment = async () => {
    setPaymentStatus('PENDING');
    setPaymentError('');
    setIsPolling(false);

    const isCard = paymentMethod === 'Carte Bancaire';
    
    try {
      let paymentPayload;
      if (isCard) {
        paymentPayload = {
          payment_type: "visa",
          success_url: `${window.location.origin}/order-tracking/${order.reference}?payment=success`,
          cancel_url: `${window.location.origin}/order-tracking/${order.reference}?payment=cancel`
        };
      } else {
        const mappedOperator = getMappedOperator(paymentMethod);
        paymentPayload = {
          payment_type: "mobile_money",
          operator: mappedOperator,
          phone_number: paymentPhone,
          country: "CI",
          success_url: `${window.location.origin}/order-tracking/${order.reference}?payment=success`,
          cancel_url: `${window.location.origin}/order-tracking/${order.reference}?payment=cancel`
        };
      }

      const paymentRes = await checkoutService.initiatePayment(order.reference, paymentPayload);
      
      if (paymentRes?.provider_link) {
        window.location.href = paymentRes.provider_link;
        return;
      }

      if (!isCard) {
        setIsPolling(true);
      }
    } catch (payErr) {
      console.error("Retry payment failed:", payErr);
      setPaymentStatus('FAILED');
      setPaymentError(
        payErr?.response?.data?.message || 
        payErr?.message || 
        c.momo_init_failed
      );
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/order-tracking/${searchQuery.trim().toUpperCase()}`);
    }
  };

  const handleCancelOrderClick = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancelOrder = async () => {
    setShowCancelConfirm(false);
    setCancelLoading(true);
    try {
      await checkoutService.cancelOrder(order.reference);
      setOrder(prev => ({ ...prev, cancellation_requested: true }));
      setSuccess(c.cancel_requested_success);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
      setError(c.cancel_error);
    } finally {
      setCancelLoading(false);
    }
  };

  const getCancellationStatus = (ord) => {
    if (!ord) return { allowed: false, reason: '' };
    if (ord.cancellation_requested) return { allowed: false, reason: c.cancel_requested_already };
    if (ord.status === 'cancelled') return { allowed: false, reason: c.cancel_already_cancelled };
    if (!['pending', 'confirmed'].includes(ord.status)) {
      return { allowed: false, reason: c.cancel_disallowed_status };
    }

    const createdTime = new Date(ord.created_at).getTime();
    const currentTime = new Date().getTime();
    const diffHours = (currentTime - createdTime) / (1000 * 60 * 60);

    if (diffHours > 24) {
      return { allowed: false, reason: c.cancel_timeout };
    }

    return { allowed: true, reason: '' };
  };

  // Get current status step index
  const getStatusIndex = (status) => {
    if (status === 'cancelled') return -1;
    // Map preorder status to pending/confirmed
    if (status?.includes('preorder')) return 1;
    return STATUS_STEPS.findIndex(step => step.key === status);
  };

  const currentStepIndex = getStatusIndex(order?.status);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-2xl font-bold text-neutral-900 text-left mb-6 uppercase tracking-wider">
        {c.title}
      </h1>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold p-4 rounded-sm text-left flex items-start gap-3 mb-6">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* SELECTION / ENCART CLIENT LOGGÉ */}
      {isAuthenticated && customerUser && (
        <div className="bg-neutral-50 p-6 border border-neutral-200 rounded-sm mb-8 text-left">
          <div className="flex justify-between items-center border-b border-neutral-200 pb-3 mb-4">
            <div>
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">{c.my_account}</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                {c.recent_orders.replace('{count}', customerOrders.length)}
              </h2>
            </div>
            <span className="text-xs font-semibold text-neutral-600 bg-neutral-200/60 px-2.5 py-1 uppercase tracking-wider rounded-xs">
              {customerUser.name}
            </span>
          </div>

          {customerOrders.length > 0 ? (
            <div className="divide-y divide-neutral-200 max-h-60 overflow-y-auto border border-neutral-200 bg-white">
              {customerOrders.map((ord) => {
                const isSelected = order?.reference === ord.reference;
                return (
                  <div
                    key={ord.reference}
                    onClick={() => navigate(`/order-tracking/${ord.reference}`)}
                    className={`p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 cursor-pointer transition-colors hover:bg-neutral-50 ${
                      isSelected ? 'bg-neutral-100/70 border-l-4 border-primary pl-3' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-neutral-900 text-xs tracking-wider">{ord.reference}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-none ${
                          ord.cancellation_requested
                            ? 'bg-orange-50 text-orange-600 border border-orange-100'
                            : ord.status === 'cancelled'
                            ? 'bg-red-50 text-red-650 border border-red-100'
                            : ord.status === 'delivered'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {ord.cancellation_requested && (locale === 'en' ? 'Cancel. in progress' : 'Annul. en cours')}
                          {!ord.cancellation_requested && ord.status === 'pending' && c.step_pending_label}
                          {!ord.cancellation_requested && ord.status === 'confirmed' && c.step_confirmed_label}
                          {!ord.cancellation_requested && ord.status === 'preparing' && c.step_preparing_label}
                          {!ord.cancellation_requested && ord.status === 'shipped' && c.step_shipped_label}
                          {!ord.cancellation_requested && ord.status === 'delivered' && c.step_delivered_label}
                          {!ord.cancellation_requested && ord.status === 'cancelled' && c.order_cancelled_title}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 mt-1 block">
                        {c.ordered_on.replace('{date}', new Date(ord.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        }))}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-neutral-900 block">{formatPrice(ord.total)}</span>
                      <span className="text-[9px] text-primary hover:underline font-bold uppercase tracking-wider block mt-0.5">
                        {isSelected ? c.selected : c.details}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-2">{c.no_orders}</p>
          )}
        </div>
      )}

      {/* SEARCH BAR CARD */}
      <div className="bg-white p-6 border border-neutral-200 rounded-sm mb-8 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <div className="flex-1 w-full text-left">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">
              {c.ref_label}
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={c.search_placeholder}
                className="w-full border border-neutral-300 rounded-sm py-3 px-4 pl-11 text-sm bg-neutral-50/50 uppercase tracking-wider focus:outline-none focus:border-primary focus:bg-white transition-colors"
                required
              />
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto bg-primary hover:bg-neutral-800 text-white font-bold py-3.5 px-8 text-sm uppercase tracking-widest transition-colors rounded-sm h-[48px]"
          >
            {c.search_btn}
          </button>
        </form>
      </div>

      {loading && (
        <div className="py-20 text-center text-neutral-500 font-semibold">
          {c.searching}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 rounded-sm text-left flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ORDER DETAIL DISPLAY */}
      {order && !loading && (
        <div className="flex flex-col gap-8 text-left">
          
          {order.cancellation_requested && (
            <div className="bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold p-4 rounded-sm text-left flex items-start gap-3">
              <Clock className="w-5 h-5 shrink-0" />
              <span>{c.cancel_requested_alert}</span>
            </div>
          )}

          {/* TRACKING HEADER */}
          <div className="bg-neutral-950 text-white p-6 rounded-t-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] text-accent font-bold tracking-widest uppercase block mb-1">
                {c.active_order} {isDemoMode && ` (${c.demo_mode})`}
              </span>
              <h2 className="text-xl font-extrabold tracking-wider">{order.reference}</h2>
            </div>
            <div className="flex items-center gap-3 text-neutral-400 text-xs">
              <Calendar className="w-4 h-4 text-accent" />
              <span>
                {c.ordered_on.replace('{date}', new Date(order.created_at).toLocaleDateString(locale === 'en' ? 'en-US' : 'fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }))}
              </span>
            </div>
          </div>

          {/* STATUS TRACKER BAR */}
          <div className="bg-white p-6 border border-neutral-100 rounded-b-sm shadow-xs">
            {order.status === 'cancelled' ? (
              <div className="flex items-center gap-3 text-red-600 bg-red-50 border border-red-100 p-4 rounded-sm">
                <XCircle className="w-6 h-6" />
                <div>
                  <h4 className="font-bold text-sm">{c.order_cancelled_title}</h4>
                  <p className="text-xs text-red-500 mt-0.5">{c.order_cancelled_desc}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-6 border-b border-neutral-100 pb-2">
                  {c.delivery_status_title}
                </h3>
                
                {/* Steps Horizontal Grid */}
                <div className="grid grid-cols-5 gap-2 relative">
                  {STATUS_STEPS.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                        {/* Circle Dot indicator */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 font-bold text-xs ${
                          isActive
                            ? 'bg-accent border-accent text-white shadow-md shadow-accent/20 scale-110'
                            : isCompleted
                            ? 'bg-primary border-primary text-white'
                            : 'bg-white border-neutral-200 text-neutral-400'
                        }`}>
                          {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>
                        {/* Step Labels */}
                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-3 ${
                          isActive ? 'text-accent' : isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                        }`}>
                          {c[step.label]}
                        </span>
                        <span className="text-[9px] text-neutral-400 mt-1 hidden md:block px-1 leading-normal">
                          {c[step.desc]}
                        </span>
                      </div>
                    );
                  })}
                  {/* Connecting Line background */}
                  <div className="absolute top-4 left-[10%] right-[10%] h-0.5 bg-neutral-200 -z-0" />
                  {/* Connecting Line filled progress */}
                  <div 
                    className="absolute top-4 left-[10%] h-0.5 bg-primary -z-0 transition-all duration-500 ease-out"
                    style={{ width: `${(currentStepIndex / 4) * 80}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* WIDGET DE PAIEMENT MOBILE MONEY (si commande en attente de paiement) */}
          {(order.status === 'pending' || order.status === 'preorder_pending') && (
            <div className="bg-white p-6 border border-neutral-100 rounded-sm shadow-xs mb-6 text-left border-l-4 border-l-accent animate-fade-in">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-neutral-900 text-accent rounded-none">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold uppercase tracking-wider text-neutral-900 leading-tight">
                    {c.payment_pending_title}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-normal">
                    {c.payment_pending_desc}
                  </p>
                </div>
              </div>

              {paymentAlert && (
                <div className={`p-4 mb-4 text-xs font-bold ${
                  paymentAlert.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {paymentAlert.message}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-2">
                {/* Select Opérateur */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                    {c.operator}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-neutral-200 rounded-none py-2 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Momo">MTN MoMo</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Wave">Wave</option>
                    <option value="Carte Bancaire">{c.card_title}</option>
                  </select>
                </div>

                {/* Numéro de téléphone ou Notice de redirection */}
                <div>
                  {paymentMethod === 'Carte Bancaire' ? (
                    <div className="text-neutral-500 text-[10px] leading-snug pb-1 font-medium">
                      {c.card_redirect_notice}
                    </div>
                  ) : (
                    <>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1.5">
                        {c.payment_phone_ci}
                      </label>
                      <input
                        type="tel"
                        value={paymentPhone}
                        onChange={(e) => setPaymentPhone(e.target.value)}
                        placeholder="Ex: 0707070707"
                        className="w-full border border-neutral-200 rounded-none py-2 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </>
                  )}
                </div>

                {/* Bouton Payer */}
                <div>
                  <button
                    type="button"
                    disabled={paymentLoading || (paymentMethod !== 'Carte Bancaire' && !paymentPhone)}
                    onClick={handleInitiatePaymentFromTracking}
                    className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 text-white font-bold uppercase tracking-wider text-xs transition-colors cursor-pointer text-center"
                  >
                    {paymentLoading ? c.initializing : c.pay_now}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DELIVERY & BILLING CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery card */}
            <div className="bg-white p-6 border border-neutral-100 rounded-sm shadow-xs">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                {c.shipping_address}
              </h3>
              <div className="text-xs space-y-2 text-neutral-700 leading-relaxed">
                {order.customer_name && <p className="font-bold text-neutral-900 text-sm">{order.customer_name}</p>}
                {order.shipping_address && <p>{order.shipping_address}</p>}
                <p className="font-semibold">{order.commune?.name}, {order.region?.name}</p>
                {order.customer_phone && <p className="text-neutral-500">{c.phone} : {order.customer_phone}</p>}
                {order.customer_email && <p className="text-neutral-500">{c.email} : {order.customer_email}</p>}
              </div>
            </div>

            {/* Billing summary card */}
            <div className="bg-white p-6 border border-neutral-100 rounded-sm shadow-xs">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-accent" />
                {c.financial_summary}
              </h3>
              <div className="text-xs space-y-3 font-semibold text-neutral-500">
                <div className="flex justify-between">
                  <span>{c.subtotal}</span>
                  <span className="text-neutral-900">{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{c.shipping_cost}</span>
                  <span className="text-neutral-900">
                    {order.shipping_cost === 0 ? c.free : formatPrice(order.shipping_cost)}
                  </span>
                </div>
                <div className="h-px bg-neutral-100 my-1" />
                <div className="flex justify-between text-sm font-bold text-neutral-900">
                  <span>{c.total_amount}</span>
                  <span className="text-accent text-base font-extrabold">{formatPrice(order.total)}</span>
                </div>
                <p className="text-[9px] text-neutral-400 font-normal leading-normal pt-1">
                  {c.currency_notice}
                </p>
              </div>
            </div>
          </div>

          {/* ORDERED ITEMS LIST */}
          <div className="bg-white border border-neutral-100 rounded-sm shadow-xs">
            <div className="px-6 py-4 border-b border-neutral-100 font-bold text-neutral-900 text-xs uppercase tracking-wider flex items-center gap-2">
              <Package className="w-4 h-4 text-accent" />
              {c.ordered_items.replace('{count}', order.items.length)}
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items.map((item) => (
                <div key={item.id} className="p-6 flex gap-4 text-xs">
                  <div className="w-16 h-20 bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                    {item.productId ? (
                      <Link to={`/product/${item.productId}`}>
                        <img src={item.image} alt={item.product?.name} className="w-full h-full object-cover hover:opacity-85 transition-opacity" />
                      </Link>
                    ) : (
                      <img src={item.image} alt={item.product?.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                    <div>
                      {item.productId ? (
                        <Link to={`/product/${item.productId}`} className="font-bold text-neutral-900 text-sm block truncate hover:underline">
                          {item.product?.name}
                        </Link>
                      ) : (
                        <span className="font-bold text-neutral-900 text-sm block truncate">
                          {item.product?.name}
                        </span>
                      )}
                      <span className="text-neutral-400 mt-1 block">
                        {c.size} : <strong>{item.selectedSize}</strong> | {c.color} : <strong>{item.selectedColor}</strong> | {c.ref} : <strong>{item.sku || 'N/A'}</strong>
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline mt-2">
                      <span className="text-neutral-500 font-medium">{c.quantity} : {item.quantity}</span>
                      <span className="font-bold text-neutral-900 text-sm">{formatPrice((item.product?.price || item.product?.price === 0 ? item.product.price : item.product?.price || 0) * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* CANCELLATION CARD */}
          {isAuthenticated && (
            <div className="bg-white p-6 border border-neutral-100 rounded-sm shadow-xs mt-6">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-3 mb-4 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                {c.cancellation_title}
              </h3>
              
              {(() => {
                const { allowed, reason } = getCancellationStatus(order);
                if (allowed) {
                  // Calculate remaining hours
                  const createdTime = new Date(order.created_at).getTime();
                  const currentTime = new Date().getTime();
                  const diffHours = (currentTime - createdTime) / (1000 * 60 * 60);
                  const remainingHours = Math.max(0, 24 - diffHours).toFixed(1);
                  
                  return (
                    <div className="space-y-4">
                      <p className="text-xs text-neutral-600 leading-relaxed">
                        {c.cancellation_desc}
                      </p>
                      <div className="p-3 bg-neutral-50 border border-neutral-200 text-[10px] text-neutral-500 font-medium uppercase tracking-wider leading-relaxed">
                        {locale === 'en' ? (
                          <>Rules: Cancellation allowed within <strong>24 hours</strong> of purchase ({remainingHours} hours remaining) and only if status is "Received" or "Confirmed".</>
                        ) : (
                          <>Règles : Annulation autorisée sous <strong>24 heures</strong> après l'achat (restant : <strong>{remainingHours} heures</strong>) et uniquement si le statut est "Reçue" ou "Confirmée".</>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleCancelOrderClick}
                        className="bg-primary hover:bg-neutral-800 text-white font-bold py-2.5 px-6 text-xs uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
                      >
                        {cancelLoading ? c.cancelling : c.cancel_btn}
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="space-y-2">
                      <div className="p-3.5 bg-neutral-50 border border-neutral-200 text-xs text-neutral-500 font-medium leading-relaxed">
                        {reason}
                      </div>
                      <p className="text-[10px] text-neutral-400 leading-normal">
                        {locale === 'en' ? "* Note: For any complaint or order modification after preparation, please contact our Concierge Service." : "* Note : Pour toute réclamation ou modification de commande après préparation, veuillez contacter notre Service Client."}
                      </p>
                    </div>
                  );
                }
              })()}
            </div>
          )}

          {/* Confirmation Annulation Modal */}
          {showCancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs" onClick={() => setShowCancelConfirm(false)} />
              <div className="relative bg-white border border-neutral-200 w-full max-w-md shadow-2xl p-6 z-10 space-y-5 text-left transition-all duration-300">
                
                {/* En-tête */}
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-primary"></span>
                    <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">
                      {c.modal_cancel_title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="text-neutral-400 hover:text-neutral-800 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Contenu */}
                <div className="space-y-3">
                  <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                    {c.modal_cancel_confirm.replace('{ref}', order.reference)}
                  </p>
                </div>

                {/* Boutons */}
                <div className="flex gap-3 justify-end pt-4 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(false)}
                    className="border border-neutral-200 font-bold uppercase tracking-wider py-2 px-4 text-[10px] text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    {c.modal_keep_btn}
                  </button>
                  <button
                    type="button"
                    onClick={confirmCancelOrder}
                    className="bg-primary hover:bg-neutral-855 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px] transition-colors"
                  >
                    {c.modal_confirm_btn}
                  </button>
                </div>

              </div>
            </div>
          )}
          
          {/* Modal de Validation Mobile Money */}
          {isMobileValidating && (() => {
            const providerName = paymentMethod;
            const providerColor = 
              providerName === 'MTN Momo' ? 'bg-amber-100 text-amber-500 border-amber-500' :
              providerName === 'Moov Money' ? 'bg-orange-100 text-orange-500 border-orange-500' :
              providerName === 'Wave' ? 'bg-sky-100 text-sky-500 border-sky-500' :
              'bg-orange-100 text-orange-500 border-orange-500';
            
            const spinnerColor = 
              providerName === 'MTN Momo' ? 'border-amber-500' :
              providerName === 'Moov Money' ? 'border-orange-500' :
              providerName === 'Wave' ? 'border-sky-500' :
              'border-orange-500';

            const barColor = 
              providerName === 'MTN Momo' ? 'bg-amber-500' :
              providerName === 'Moov Money' ? 'bg-orange-500' :
              providerName === 'Wave' ? 'bg-sky-500' :
              'bg-orange-500';

            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                <div className="bg-white max-w-sm w-full p-8 rounded-none shadow-2xl flex flex-col items-center text-center border border-neutral-100">
                  
                  {paymentStatus === 'PENDING' && (
                    <>
                      <div className={`w-16 h-16 rounded-full ${providerColor.split(' ')[0]} flex items-center justify-center mb-6`}>
                        <div className={`w-8 h-8 border-4 ${spinnerColor} border-t-transparent rounded-full animate-spin`}></div>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900 uppercase tracking-wider mb-3">
                        {c.validation_provider.replace('{provider}', providerName)}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                        {c.momo_ussd_notice.replace('{phone}', paymentPhone || 'votre numéro')}
                      </p>
                      <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-4 overflow-hidden relative">
                        <div className={`absolute top-0 left-0 h-full ${barColor} animate-pulse w-full`}></div>
                      </div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 mb-6">
                        {c.awaiting_validation}
                      </p>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setIsPolling(false);
                          setIsMobileValidating(false);
                          window.location.reload();
                        }}
                        className="w-full py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer mb-2"
                      >
                        {c.close_later}
                      </button>

                      {import.meta.env.DEV && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsPolling(false);
                            setPaymentStatus('SUCCESS');
                            setTimeout(() => {
                              setIsMobileValidating(false);
                              window.location.href = `${window.location.origin}/order-tracking/${order.reference}?payment=success`;
                            }, 2000);
                          }}
                          className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                        >
                          {locale === 'en' ? 'Simulate Payment Success (Dev)' : 'Simuler le succès du paiement (Dev)'}
                        </button>
                      )}
                    </>
                  )}

                  {paymentStatus === 'SUCCESS' && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 border border-green-200 flex items-center justify-center mb-6 animate-scale-up">
                        <CheckCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-bold text-green-600 uppercase tracking-wider mb-3">
                        {c.payment_success}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                        {c.payment_success_notice}
                      </p>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-green-500 animate-pulse">
                        {c.refreshing_page}
                      </p>
                    </>
                  )}

                  {paymentStatus === 'FAILED' && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 border border-red-200 flex items-center justify-center mb-6 animate-scale-up">
                        <XCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-lg font-bold text-red-600 uppercase tracking-wider mb-3">
                        {c.payment_failed}
                      </h3>
                      <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                        {paymentError || c.payment_failed_default}
                      </p>
                      
                      <div className="flex flex-col gap-2 w-full">
                        <button
                          type="button"
                          onClick={handleRetryPayment}
                          className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                        >
                          {c.retry_payment}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMobileValidating(false);
                            window.location.reload();
                          }}
                          className="w-full py-2.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                        >
                          {c.close_later_short}
                        </button>
                        {import.meta.env.DEV && (
                          <button
                            type="button"
                            onClick={() => {
                              setPaymentStatus('SUCCESS');
                              setTimeout(() => {
                                setIsMobileValidating(false);
                                window.location.href = `${window.location.origin}/order-tracking/${order.reference}?payment=success`;
                              }, 2000);
                            }}
                            className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                          >
                            {locale === 'en' ? 'Bypass & Force Success (Dev)' : 'Forcer le succès du paiement (Bypass Dev)'}
                          </button>
                        )}
                      </div>
                    </>
                  )}

                </div>
              </div>
            );
          })()}

        </div>
      )}
    </div>
  );
};

export default OrderTracking;
