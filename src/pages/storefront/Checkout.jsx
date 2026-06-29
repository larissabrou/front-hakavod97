import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, MapPin, Globe, Check, Building2 } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import customerService from '../../services/api/customerService';
import geoService from '../../services/api/geoService';
import checkoutService from '../../services/api/checkoutService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const formatApiError = (err, fallbackMessage, c) => {
  console.error(err);
  const response = err?.response;
  if (!response) return err.message || fallbackMessage;
  
  const status = response.status;
  const statusText = response.statusText || '';
  const data = response.data || {};
  
  // Extract message and errors
  const message = data.message || '';
  const errors = data.errors || null;
  
  if (status === 422) {
    let isCartOrProductError = false;
    
    // Check if the error object has keys related to cart items, products or variants
    if (errors && typeof errors === 'object') {
      const errorKeys = Object.keys(errors);
      isCartOrProductError = errorKeys.some(k => 
        k.includes('product_variant_id') || 
        k.includes('product variant_id') || 
        k.includes('product_id') || 
        k.includes('items') || 
        k.includes('variant')
      );
    } else if (message) {
      // Check if the message specifically mentions products, variants, stock or cart
      const msgLower = message.toLowerCase();
      isCartOrProductError = 
        msgLower.includes('product_variant') || 
        msgLower.includes('product variant') || 
        msgLower.includes('variant_id') || 
        msgLower.includes('variant id') || 
        (msgLower.includes('items') && msgLower.includes('exist')) ||
        (msgLower.includes('items') && msgLower.includes('stock')) ||
        msgLower.includes('panier') || 
        msgLower.includes('cart');
    }
      
    if (isCartOrProductError) {
      return c.cart_invalid_error;
    }

    // Try to extract specific validation messages
    if (errors && typeof errors === 'object') {
      const details = Object.entries(errors).map(([field, msgs]) => {
        let label = field.split('.').pop().replace(/_/g, ' ');
        if (label === 'customer name' || label === 'name') label = c.lastname || 'Name';
        if (label === 'customer phone' || label === 'phone') label = c.phone || 'Phone';
        if (label === 'customer email' || label === 'email') label = c.email || 'Email';
        if (label === 'shipping address' || label === 'address') label = c.address || 'Address';
        if (label === 'payment method') label = c.payment_method || 'Payment Method';
        
        const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
        let cleanMsg = msgStr;
        if (cleanMsg.includes('validation.required') || cleanMsg.includes('required')) {
          cleanMsg = 'required';
        } else if (cleanMsg.includes('validation.exists') || cleanMsg.includes('exists')) {
          cleanMsg = 'invalid';
        } else if (cleanMsg.includes('validation.unique') || cleanMsg.includes('unique')) {
          cleanMsg = 'already used';
        }
        
        return `${label} : ${cleanMsg}`;
      });
      
      if (details.length > 0) {
        return c.input_validation_error.replace('{details}', details.join(' | '));
      }
    }

    if (message) {
      return message;
    }
    
    return c.general_validation_error;
  }
  
  let result = `${status} ${statusText}`;
  if (message) {
    result += ` - ${message}`;
  }
  
  if (errors && typeof errors === 'object') {
    const details = Object.entries(errors).map(([field, msgs]) => {
      const label = field.replace(/_/g, ' ');
      const msgStr = Array.isArray(msgs) ? msgs.join(', ') : String(msgs);
      return `${label}: ${msgStr}`;
    });
    if (details.length > 0) {
      result += ` (${details.join(' | ')})`;
    }
  } else if (!message && response.data) {
    result += ` - ${JSON.stringify(response.data)}`;
  }
  
  return result;
};

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

const getMomoInstructions = (provider, locale = 'fr') => {
  const instructions = {
    fr: {
      'Orange Money': {
        steps: [
          "Saisissez votre numéro Orange Money et cliquez sur « Valider et Payer »",
          "Confirmez votre transaction en composant #120# et suivez les instructions"
        ],
      },
      'MTN Momo': {
        steps: [
          "Saisissez votre numéro MTN Money et cliquez sur « Valider et Payer »",
          "Confirmez votre transaction en composant *133# puis l'option 1 et suivez les instructions"
        ],
      },
      'Moov Money': {
        steps: [
          "Saisissez votre numéro Moov Money et cliquez sur « Valider et Payer »",
          "Confirmez votre transaction en composant *155*15# puis suivez les instructions"
        ],
      },
      'Wave': {
        steps: [
          "Saisissez votre numéro Wave et cliquez sur « Valider et Payer »",
          "Vous serez redirigé vers la page ou l'application sécurisée Wave pour effectuer le paiement"
        ],
      }
    },
    en: {
      'Orange Money': {
        steps: [
          "Enter your Orange Money number and click 'Validate and Pay'",
          "Confirm your transaction by dialing #120# and follow the instructions"
        ],
      },
      'MTN Momo': {
        steps: [
          "Enter your MTN Money number and click 'Validate and Pay'",
          "Confirm your transaction by dialing *133# then option 1 and follow the instructions"
        ],
      },
      'Moov Money': {
        steps: [
          "Enter your Moov Money number and click 'Validate and Pay'",
          "Confirm your transaction by dialing *155*15# then follow the instructions"
        ],
      },
      'Wave': {
        steps: [
          "Enter your Wave number and click 'Validate and Pay'",
          "You will be redirected to the secure Wave page or app to complete the payment"
        ],
      }
    }
  };
  
  const lang = locale === 'en' || locale === 'eng' ? 'en' : 'fr';
  return instructions[lang]?.[provider] || { steps: [] };
};

const CONTENT = {
  fr: {
    checkout_title: "Validation de la commande",
    return_to_cart: "Retourner au panier",
    reset_cart: "Réinitialiser le panier",
    shipping_address_ci: "Adresse de livraison",
    country_label: "Destination de livraison",
    country_ci: "Côte d'Ivoire",
    country_ci_desc: "Livraison locale (Région & Commune)",
    country_other: "International",
    country_other_desc: "Saisie libre de votre adresse complète",
    address_other_placeholder: "Adresse complète (Ville, Code postal, Pays, Rue...)",
    select_region: "Sélectionner une région",
    select_commune: "Sélectionner une commune",
    special_instructions: "Instructions spéciales / Notes",
    special_instructions_placeholder: "Digicode, consignes de livraison...",
    payment_method: "Mode de paiement",
    momo_desc: "",
    card_desc: "Paiement sécurisé crypté SSL (Visa, Mastercard)",
    paypal_desc: "Paiement sécurisé via votre compte PayPal",
    secure_redirection: "Redirection Sécurisée",
    card_redirect_notice: "Vous allez être redirigé vers l'espace de paiement 100% sécurisé et chiffré SSL de notre partenaire bancaire pour saisir vos coordonnées de carte (Visa, Mastercard, etc.).",
    paypal_redirect_notice: "Vous serez redirigé vers le site officiel de PayPal pour approuver votre paiement de manière simple et sécurisée avec votre solde PayPal ou vos cartes enregistrées.",
    secure_payment_100: "Paiement 100% Sécurisé",
    articles: "Articles",
    quantity: "Quantité",
    total_to_pay: "Total à payer",
    currency_notice: "* Le paiement s'effectue en Franc CFA (XOF). Les montants dans d'autres devises sont fournis à titre indicatif.",
    validate_and_pay: "Valider et Payer ({amount})",
    validation_provider: "Validation {provider}",
    momo_ussd_notice: "Veuillez consulter votre téléphone au {phone} et entrer votre code secret pour valider le paiement.",
    awaiting_validation: "En attente de votre validation...",
    cancel_payment: "Annuler le paiement",
    payment_success: "Paiement Réussi",
    payment_success_notice: "Votre paiement a bien été validé par l'opérateur. Nous préparons votre commande.",
    redirecting: "Redirection en cours...",
    payment_failed: "Paiement Échoué",
    payment_failed_default: "Le paiement n'a pas pu être validé. Vérifiez votre solde et réessayez.",
    return_to_form: "Retour au formulaire de commande",
    momo_init_failed: "Impossible d'initier la transaction de paiement. Veuillez modifier vos informations et soumettre à nouveau le formulaire.",
    payment_init_failed: "Impossible d'initier la transaction de paiement. Veuillez réessayer.",
    calculating: "Calcul...",
    cart_invalid_error: "Certains articles de votre panier ne sont plus disponibles ou sont invalides. Veuillez mettre à jour votre panier.",
    input_validation_error: "Erreur de saisie : {details}",
    general_validation_error: "Erreur de validation. Veuillez vérifier les informations saisies et la disponibilité des articles.",
    phone_required: "Le numéro de paiement est requis.",
    phone_10_digits: "Le numéro doit comporter exactement 10 chiffres (ex: 0707070707).",
    orange_warning: "Ce numéro ne commence pas par un préfixe Orange classique (07, 08, 09).",
    mtn_warning: "Ce numéro ne commence pas par un préfixe MTN classique (05, 06).",
    moov_warning: "Ce numéro ne commence pas par un préfixe Moov classique (01, 02).",
    operator_format_conformed: "Format de numéro conforme pour cet opérateur.",
    lastname: "Nom",
    firstname: "Prénom",
    phone: "Téléphone",
    email: "E-mail",
    address: "Adresse de livraison",
    region: "Région",
    commune: "Commune",
    momo_title: "Mobile Money",
    card_title: "Carte Bancaire",
    paypal_title: "PayPal",
    paypal_validation: "Validation via PayPal",
    quantity_label: "Quantité",
    size_label: "Taille",
    subtotal: "Sous-total",
    shipping_cost: "Frais de port",
    free: "Gratuit",
    processing: "Traitement en cours...",
    payment_phone_number: "Numéro de paiement {provider}",
    momo_phone_help: "Saisissez le numéro sur lequel vous recevrez la demande de validation (push USSD)."
  },
  en: {
    checkout_title: "Checkout",
    return_to_cart: "Return to cart",
    reset_cart: "Reset cart",
    shipping_address_ci: "Shipping Address",
    country_label: "Shipping Destination",
    country_ci: "Ivory Coast",
    country_ci_desc: "Local delivery (Region & Commune)",
    country_other: "International",
    country_other_desc: "Free entry of full shipping address",
    address_other_placeholder: "Complete Address (City, Postal Code, Country, Street...)",
    select_region: "Select region",
    select_commune: "Select commune / area",
    special_instructions: "Special instructions / Notes",
    special_instructions_placeholder: "Digicode, delivery guidelines...",
    payment_method: "Payment Method",
    momo_desc: "",
    card_desc: "Secure SSL encrypted payment (Visa, Mastercard)",
    paypal_desc: "Secure payment via your PayPal account",
    secure_redirection: "Secure Redirection",
    card_redirect_notice: "You will be redirected to the 100% secure, SSL-encrypted payment portal of our banking partner to enter your card details (Visa, Mastercard, etc.).",
    paypal_redirect_notice: "You will be redirected to the official PayPal site to approve your payment simply and securely with your PayPal balance or registered cards.",
    secure_payment_100: "100% Secure Payment",
    articles: "Items",
    quantity: "Qty",
    total_to_pay: "Total to pay",
    currency_notice: "* Payment is made in West African Franc (XOF). Displayed amounts in other currencies are for reference only.",
    validate_and_pay: "Validate and Pay ({amount})",
    validation_provider: "Validation {provider}",
    momo_ussd_notice: "Please check your phone at {phone} and enter your secret code to validate the payment.",
    awaiting_validation: "Awaiting your validation...",
    cancel_payment: "Cancel payment",
    payment_success: "Payment Successful",
    payment_success_notice: "Your payment has been successfully approved by the operator. We are preparing your order.",
    redirecting: "Redirecting...",
    payment_failed: "Payment Failed",
    payment_failed_default: "The payment could not be validated. Please check your balance and try again.",
    return_to_form: "Return to checkout form",
    momo_init_failed: "Could not initiate payment. Please modify your details and submit the form again.",
    payment_init_failed: "Could not initiate payment transaction. Please try again.",
    calculating: "Calculating...",
    cart_invalid_error: "Some items in your cart are no longer available or invalid. Please update your cart.",
    input_validation_error: "Input error: {details}",
    general_validation_error: "Validation error. Please verify entered information and item availability.",
    phone_required: "Payment phone number is required.",
    phone_10_digits: "The phone number must be exactly 10 digits (e.g. 0707070707).",
    orange_warning: "This number does not start with a classic Orange prefix (07, 08, 09).",
    mtn_warning: "This number does not start with a classic MTN prefix (05, 06).",
    moov_warning: "This number does not start with a classic Moov prefix (01, 02).",
    operator_format_conformed: "Number format compliant for this operator.",
    lastname: "Last Name",
    firstname: "First Name",
    phone: "Phone",
    email: "Email",
    address: "Shipping Address",
    region: "Region",
    commune: "Commune",
    momo_title: "Mobile Money",
    card_title: "Credit Card",
    paypal_title: "PayPal",
    paypal_validation: "Validation via PayPal",
    quantity_label: "Quantity",
    size_label: "Size",
    subtotal: "Subtotal",
    shipping_cost: "Shipping cost",
    free: "Free",
    processing: "Processing...",
    payment_phone_number: "Payment number {provider}",
    momo_phone_help: "Enter the number on which you will receive the validation prompt (push USSD)."
  }
};

export const Checkout = () => {
  const { cartItems, getCartSubtotal, clearCart } = useCart();
  const { formatPrice, activeCurrency, activeLocale, t } = useSettings();
  const { isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();

  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // Geographic state
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [deliveryCountry, setDeliveryCountry] = useState('CI');

  // Form inputs
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    address: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('Orange Money');
  const [isMobileValidating, setIsMobileValidating] = useState(false);
  const [paymentPhone, setPaymentPhone] = useState('');
  const [paymentPhoneDirty, setPaymentPhoneDirty] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [localAddresses, setLocalAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');

  // Card payment form states
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardErrors, setCardErrors] = useState({});
  const [isCardProcessing, setIsCardProcessing] = useState(false);
  const [cardProcessStep, setCardProcessStep] = useState(1);

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    setCardNumber(formattedValue);
  };

  const handleCardExpiryChange = (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (value.length > 4) value = value.slice(0, 4);
    
    let formattedValue = '';
    if (value.length > 2) {
      formattedValue = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      formattedValue = value;
    }
    setCardExpiry(formattedValue);
  };

  const handleCardCvvChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length > 4) value = value.slice(0, 4);
    setCardCvv(value);
  };

  // États pour le flux de paiement AggregPay
  const [createdOrderRef, setCreatedOrderRef] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, SUCCESS, FAILED
  const [paymentError, setPaymentError] = useState('');
  const [isPolling, setIsPolling] = useState(false);

  // Refs pour garder une trace des valeurs actuelles lors de l'unmount
  const orderRef = React.useRef('');
  const statusRef = React.useRef('PENDING');
  const shouldNotCancelOnUnmount = React.useRef(false);

  useEffect(() => {
    orderRef.current = createdOrderRef;
  }, [createdOrderRef]);

  useEffect(() => {
    statusRef.current = paymentStatus;
  }, [paymentStatus]);

  // Cleanup effect pour annuler la commande si l'utilisateur quitte la page sans payer
  useEffect(() => {
    return () => {
      if (orderRef.current && statusRef.current !== 'SUCCESS' && !shouldNotCancelOnUnmount.current) {
        console.log("Auto-cancelling unpaid order on unmount:", orderRef.current);
        checkoutService.cancelOrder(orderRef.current).catch(err => {
          console.warn("Auto-cancelling order on unmount failed:", err);
        });
      }
    };
  }, []);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Local calculations fallback
  const subtotal = getCartSubtotal();
  const shippingThreshold = 35000;
  const shippingCost = 3000;
  const localShipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : shippingCost;
  const localTotal = subtotal + localShipping;

  // Prefill payment phone with shipping phone if not dirty
  useEffect(() => {
    if (!paymentPhoneDirty && formData.phone) {
      setPaymentPhone(formData.phone);
    }
  }, [formData.phone, paymentPhoneDirty]);

  // Load regions on mount
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await geoService.getRegions();
        if (res.success && res.data) {
          setRegions(res.data);
        }
      } catch (err) {
        console.error("Erreur de chargement des régions", err);
      }
    };
    loadRegions();
  }, []);

  // Load communes when region changes
  useEffect(() => {
    const loadCommunes = async () => {
      if (!selectedRegion) {
        setCommunes([]);
        setSelectedCommune('');
        return;
      }
      try {
        const res = await geoService.getCommunes(selectedRegion);
        if (res.success && res.data) {
          setCommunes(res.data);
        }
      } catch (err) {
        console.error("Erreur de chargement des communes", err);
      }
    };
    loadCommunes();
  }, [selectedRegion]);

  // Helper to prefill address
  const prefillFormWithAddress = async (addr) => {
    if (!addr) return;
    
    const nameParts = (addr.customer_name || '').trim().split(/\s+/);
    const firstname = nameParts[0] || '';
    const lastname = nameParts.slice(1).join(' ') || '';
    
    setFormData(prev => ({
      ...prev,
      firstname,
      lastname,
      address: addr.shipping_address || '',
      phone: addr.customer_phone || '',
      email: addr.customer_email || addr.email || prev.email || '',
    }));
    
    const country = addr.country || (addr.commune_id ? 'CI' : 'OTHER');
    setDeliveryCountry(country);
    
    if (country === 'CI' && addr.commune_id) {
      try {
        const comRes = await geoService.getCommunes();
        const allComs = comRes.data || comRes || [];
        const matchingCom = allComs.find(c => c.id === Number(addr.commune_id));
        if (matchingCom && matchingCom.region_id) {
          setSelectedRegion(String(matchingCom.region_id));
          setSelectedCommune(String(addr.commune_id));
        }
      } catch (e) {
        console.warn("Failed to resolve commune region on prefill:", e);
      }
    } else {
      setSelectedRegion('');
      setSelectedCommune('');
    }
  };

  // Load saved addresses for logged-in clients + local addresses
  useEffect(() => {
    let loadedLocals = [];
    try {
      const stored = localStorage.getItem('hakavod_saved_addresses');
      if (stored) {
        loadedLocals = JSON.parse(stored);
        setLocalAddresses(loadedLocals);
      }
    } catch (e) {
      console.warn("Failed to load local addresses:", e);
    }

    if (isAuthenticated) {
      const loadAddresses = async () => {
        try {
          const res = await customerService.getAddresses();
          const list = res?.data || res || [];
          setSavedAddresses(list);
          if (list.length > 0) {
            const defAddr = list.find(a => a.is_default) || list[0];
            setSelectedAddressId(defAddr.id);
            prefillFormWithAddress(defAddr);
          } else if (loadedLocals.length > 0) {
            setSelectedAddressId(loadedLocals[0].id);
            prefillFormWithAddress(loadedLocals[0]);
          }
        } catch (err) {
          console.warn("Failed to load customer addresses:", err);
          if (loadedLocals.length > 0) {
            setSelectedAddressId(loadedLocals[0].id);
            prefillFormWithAddress(loadedLocals[0]);
          }
        }
      };
      loadAddresses();
    } else {
      if (loadedLocals.length > 0) {
        setSelectedAddressId(loadedLocals[0].id);
        prefillFormWithAddress(loadedLocals[0]);
      }
    }
  }, [isAuthenticated]);

  // Dynamic preview call
  useEffect(() => {
    const fetchPreview = async () => {
      if (cartItems.length === 0) return;

      const orderItems = cartItems.map((item) => {
        const productId = Number(item.id ?? item.product_id ?? item.productId);
        const productVariantId = Number(item.productVariantId ?? item.product_variant_id ?? item.variant_id);
        const quantity = Number(item.quantity ?? 1);

        if (!productId || !productVariantId || !quantity) {
          throw new Error("Le panier contient un produit mal configuré pour l'aperçu. Supprimez-le et réessayez.");
        }

        return {
          product_id: productId,
          product_variant_id: productVariantId,
          quantity,
        };
      });
      
      setLoadingPreview(true);
      try {
        const payload = {
          items: orderItems,
          currency: activeCurrency,
          lang: activeLocale
        };

        if (deliveryCountry === 'CI') {
          payload.region = selectedRegion;
          payload.commune = selectedCommune;
          payload.commune_id = Number(selectedCommune) || null;
        }

        console.log('Checkout preview payload', payload);
        const res = await checkoutService.previewCheckout(payload);
        if (res?.success && res?.data) {
          setPreviewData(res.data);
        } else if (res && typeof res === 'object') {
          const previewObject = res.data ?? res;
          if (previewObject && (previewObject.subtotal !== undefined || previewObject.total !== undefined || previewObject.shipping_cost !== undefined)) {
            setPreviewData(previewObject);
          } else {
            console.error('Preview API returned unexpected response:', res);
            setError(c.general_validation_error);
            setPreviewData(null);
          }
        } else {
          console.error('Preview API returned invalid response:', res);
          setError(c.general_validation_error);
          setPreviewData(null);
        }
      } catch (err) {
        setError(formatApiError(err, c.general_validation_error, c));
        setPreviewData(null);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [cartItems, selectedCommune, deliveryCountry, activeCurrency, activeLocale]);

  // Polling du statut du paiement
  useEffect(() => {
    let intervalId;
    if (isPolling && createdOrderRef) {
      const poll = async () => {
        try {
          const res = await checkoutService.getPaymentStatus(createdOrderRef);
          const status = res?.status || res?.data?.status;
          console.log("Polled payment status:", status);
          if (status === 'SUCCESS') {
            setPaymentStatus('SUCCESS');
            setIsPolling(false);
            clearCart(); // Vider le panier uniquement au succès du paiement !
            setTimeout(() => {
              setIsMobileValidating(false);
              navigate(`/order-tracking/${createdOrderRef}?payment=success`);
            }, 2000);
          } else if (status === 'FAILED') {
            setPaymentStatus('FAILED');
            setIsPolling(false);
            setPaymentError(res?.gateway_message || c.payment_failed_default);
            try {
              await checkoutService.cancelOrder(createdOrderRef);
            } catch (cancelErr) {
              console.warn("Failed to cancel order after failed payment status:", cancelErr);
            }
          }
        } catch (err) {
          console.warn("Error checking payment status:", err);
        }
      };

      poll();
      intervalId = setInterval(poll, 4000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, createdOrderRef, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getMappedOperator = (method) => {
    switch (method) {
      case 'Orange Money': return 'orange';
      case 'MTN Momo': return 'mtn';
      case 'Moov Money': return 'moov';
      case 'Wave': return 'wave';
      default: return null;
    }
  };

  const handleRetryPayment = async () => {
    setPaymentStatus('PENDING');
    setPaymentError('');
    setIsPolling(false);
    
    try {
      const mappedOperator = getMappedOperator(paymentMethod);
      const paymentPayload = {
        payment_type: "mobile_money",
        operator: mappedOperator,
        phone_number: paymentPhone || formData.phone,
        country: deliveryCountry,
        success_url: `${window.location.origin}/order-tracking/${createdOrderRef}?payment=success`,
        cancel_url: `${window.location.origin}/order-tracking/${createdOrderRef}?payment=cancel`
      };

      const paymentRes = await checkoutService.initiatePayment(createdOrderRef, paymentPayload);
      
      if (paymentRes?.provider_link) {
        window.location.href = paymentRes.provider_link;
        return;
      }

      setIsPolling(true);
    } catch (payErr) {
      console.error("Retry payment failed:", payErr);
      setPaymentStatus('FAILED');
      setPaymentError(
        payErr?.response?.data?.message || 
        payErr?.message || 
        c.payment_init_failed
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPaymentError('');

    try {
      const orderItems = cartItems.map((item) => {
        const productId = Number(item.id ?? item.product_id ?? item.productId);
        const productVariantId = Number(item.productVariantId ?? item.product_variant_id ?? item.variant_id);
        const quantity = Number(item.quantity ?? 1);

        if (!productId || !productVariantId || !quantity) {
          throw new Error(c.cart_invalid_error);
        }

        return {
          product_id: productId,
          product_variant_id: productVariantId,
          quantity,
        };
      });

      const isMomoPayment = ['Orange Money', 'MTN Momo', 'Moov Money', 'Wave'].includes(paymentMethod);
      if (isMomoPayment) {
        const phoneVal = validateIvoryCoastPhone(paymentPhone || formData.phone, paymentMethod, c);
        if (!phoneVal.isValid) {
          setError(`${c.payment_failed} : ${phoneVal.message}`);
          return;
        }
      }

      const orderData = {
        customer_name: `${formData.firstname} ${formData.lastname}`,
        customer_email: formData.email,
        customer_phone: formData.phone, // shipping phone
        shipping_address: formData.address,
        country: deliveryCountry,
        region: deliveryCountry === 'CI' ? selectedRegion : '',
        commune: deliveryCountry === 'CI' ? selectedCommune : '',
        commune_id: deliveryCountry === 'CI' ? (Number(selectedCommune) || 1) : 1,
        notes: formData.notes,
        currency: activeCurrency,
        lang: activeLocale,
        items: orderItems,
        payment_method: paymentMethod,
      };

      setLoading(true);

      const res = await checkoutService.createOrder(orderData);
      const orderResult = res?.data ?? res;
      const errorMessage = res?.message || res?.data?.message || res?.data?.data?.message;

      if (orderResult?.reference) {
        // Enregistrer l'adresse localement dans tous les cas pour la prochaine fois
        try {
          const stored = localStorage.getItem('hakavod_saved_addresses');
          const savedLocals = stored ? JSON.parse(stored) : [];
          
          const activeRegionObj = regions.find(r => String(r.id) === String(selectedRegion));
          const activeCommuneObj = communes.find(c => String(c.id) === String(selectedCommune));
          const regionName = activeRegionObj ? activeRegionObj.name : '';
          const communeName = activeCommuneObj ? activeCommuneObj.name : '';

          const currentProfile = {
            id: 'local_' + Date.now(),
            customer_name: `${formData.firstname} ${formData.lastname}`,
            customer_phone: formData.phone,
            customer_email: formData.email,
            shipping_address: formData.address,
            country: deliveryCountry,
            region: deliveryCountry === 'CI' ? regionName : '',
            commune: deliveryCountry === 'CI' ? communeName : '',
            commune_id: deliveryCountry === 'CI' ? (selectedCommune ? Number(selectedCommune) : null) : null,
          };
          
          const exists = savedLocals.some(a => 
            (a.shipping_address || '').trim().toLowerCase() === currentProfile.shipping_address.trim().toLowerCase() &&
            (a.customer_phone || '').trim() === currentProfile.customer_phone.trim() &&
            (a.customer_name || '').trim().toLowerCase() === currentProfile.customer_name.trim().toLowerCase()
          );
          
          if (!exists) {
            savedLocals.unshift(currentProfile);
            localStorage.setItem('hakavod_saved_addresses', JSON.stringify(savedLocals.slice(0, 5)));
          }
        } catch (e) {
          console.warn("Failed to save address to localStorage:", e);
        }

        // Save customer address as default on success
        if (isAuthenticated) {
          try {
            const addressText = formData.address.trim().toLowerCase();
            const phoneText = formData.phone.trim();
            const nameText = `${formData.firstname} ${formData.lastname}`.trim().toLowerCase();

            const alreadyExists = savedAddresses.some(a => 
              (a.shipping_address || '').trim().toLowerCase() === addressText &&
              (a.customer_phone || '').trim() === phoneText &&
              (a.customer_name || '').trim().toLowerCase() === nameText &&
              String(a.commune_id) === String(selectedCommune)
            );

            if (!alreadyExists) {
              const activeRegionObj = regions.find(r => String(r.id) === String(selectedRegion));
              const activeCommuneObj = communes.find(c => String(c.id) === String(selectedCommune));
              const regionName = activeRegionObj ? activeRegionObj.name : '';
              const communeName = activeCommuneObj ? activeCommuneObj.name : '';

              customerService.addAddress({
                label: `Checkout ${new Date().toLocaleDateString()}`,
                customer_name: `${formData.firstname} ${formData.lastname}`,
                customer_phone: formData.phone,
                shipping_address: formData.address,
                country: deliveryCountry,
                region: deliveryCountry === 'CI' ? regionName : '',
                commune: deliveryCountry === 'CI' ? communeName : '',
                commune_id: deliveryCountry === 'CI' ? (selectedCommune ? Number(selectedCommune) : null) : null,
                is_default: true
              }).catch(err => console.warn("Failed to save new address:", err));
            } else {
              const matched = savedAddresses.find(a => 
                (a.shipping_address || '').trim().toLowerCase() === addressText &&
                (a.customer_phone || '').trim() === phoneText &&
                (a.customer_name || '').trim().toLowerCase() === nameText &&
                String(a.commune_id) === String(selectedCommune)
              );
              if (matched && !matched.is_default) {
                customerService.setDefaultAddress(matched.id).catch(err => console.warn("Failed to set address default:", err));
              }
            }
          } catch (addrErr) {
            console.warn("Failed to automatically save address as default:", addrErr);
          }
        }
        const reference = orderResult.reference;
        setCreatedOrderRef(reference);

        // Si c'est un paiement Mobile Money local (Orange, MTN, Moov, Wave)
        if (isMomoPayment) {
          setLoading(false);
          setIsMobileValidating(true);
          setPaymentStatus('PENDING');
          
          try {
            const mappedOperator = getMappedOperator(paymentMethod);
            const paymentPayload = {
              payment_type: "mobile_money",
              operator: mappedOperator,
              phone_number: paymentPhone || formData.phone,
              country: deliveryCountry,
              success_url: `${window.location.origin}/order-tracking/${reference}?payment=success`,
              cancel_url: `${window.location.origin}/order-tracking/${reference}?payment=cancel`
            };

            const paymentRes = await checkoutService.initiatePayment(reference, paymentPayload);
            
            // Si le gateway renvoie un lien de redirection directe (ex: Wave)
            if (paymentRes?.provider_link) {
              shouldNotCancelOnUnmount.current = true;
              clearCart();
              window.location.href = paymentRes.provider_link;
              return;
            }

            // Sinon (USSD push orange, mtn, moov), on lance le polling (panier vidé sur succès)
            setIsPolling(true);
          } catch (payErr) {
            console.error("Initiate payment failed:", payErr);
            // Attempt to cancel the created order
            try {
              await checkoutService.cancelOrder(reference);
            } catch (cancelErr) {
              console.warn("Failed to cancel order after payment error:", cancelErr);
            }
            setPaymentStatus('FAILED');
            setPaymentError(
              payErr?.response?.data?.message || 
              payErr?.message || 
              c.payment_init_failed
            );
          }
        } else if (paymentMethod === 'Carte Bancaire') {
          // Paiement par carte bancaire réel via l'API (Visa/AggregPay)
          setLoading(false);
          setIsCardProcessing(true);
          setCardProcessStep(1); // Connexion sécurisée...
          
          try {
            const paymentPayload = {
              payment_type: "visa",
              success_url: `${window.location.origin}/order-tracking/${reference}?payment=success`,
              cancel_url: `${window.location.origin}/order-tracking/${reference}?payment=cancel`
            };

            const paymentRes = await checkoutService.initiatePayment(reference, paymentPayload);
            
            if (paymentRes?.provider_link) {
              setCardProcessStep(2); // Redirection...
              setTimeout(() => {
                shouldNotCancelOnUnmount.current = true;
                clearCart();
                setIsCardProcessing(false);
                window.location.href = paymentRes.provider_link;
              }, 1200);
              return;
            }
            
            // Fallback si pas de lien de redirection
            shouldNotCancelOnUnmount.current = true;
            clearCart();
            setIsCardProcessing(false);
            navigate(`/order-tracking/${reference}`);
          } catch (payErr) {
            console.error("Initiate card payment failed:", payErr);
            // Attempt to cancel the created order
            try {
              await checkoutService.cancelOrder(reference);
            } catch (cancelErr) {
              console.warn("Failed to cancel order after payment error:", cancelErr);
            }
            setIsCardProcessing(false);
            setError(
              payErr?.response?.data?.message || 
              payErr?.message || 
              c.payment_init_failed
            );
          }
        } else {
          // Pour les autres modes qui ne passent pas par AggregPay local pour le moment
          shouldNotCancelOnUnmount.current = true;
          clearCart();
          setLoading(false);
          if (orderResult.payment_url) {
            window.location.href = orderResult.payment_url;
          } else {
            navigate(`/order-tracking/${reference}`);
          }
        }
      } else {
        console.error('Order creation failed: unexpected response', res);
        const fallbackMessage = errorMessage || c.general_validation_error;
        throw new Error(fallbackMessage);
      }
    } catch (err) {
      setLoading(false);
      setError(formatApiError(err, c.general_validation_error, c));
    }
  };

  // Determine final pricing values to render
  const finalSubtotal = previewData?.subtotal || subtotal;
  const finalShipping = previewData?.shipping_cost !== undefined ? previewData.shipping_cost : localShipping;
  const finalTotal = previewData?.total || localTotal;



  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-2xl font-bold text-neutral-900 text-left mb-8 uppercase tracking-wider">
        {c.checkout_title}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-semibold p-4 mb-6 rounded-none text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <span>{error}</span>
          {error.includes("panier") && (
            <div className="flex gap-4 shrink-0 mt-2 sm:mt-0 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="text-neutral-900 hover:text-accent font-bold uppercase tracking-wider text-[10px] border-b border-neutral-900 hover:border-accent pb-0.5 transition-colors cursor-pointer"
              >
                {c.return_to_cart}
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setError('');
                  navigate('/catalog');
                }}
                className="text-red-700 hover:text-red-950 font-bold uppercase tracking-wider text-[10px] border-b border-red-700 hover:border-red-950 pb-0.5 transition-colors cursor-pointer"
              >
                {c.reset_cart}
              </button>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10 text-left">
        {/* Formulaires d'Informations */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Informations Personnelles & Adresse */}
          <div className="bg-white p-6 border border-neutral-100 rounded-sm">
            <h3 className="text-base font-bold text-neutral-950 mb-6 uppercase tracking-wider border-b border-neutral-100 pb-3">
              {c.shipping_address_ci}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vos adresses enregistrées - Style Defacto */}
              {(savedAddresses.length > 0 || localAddresses.length > 0) && (
                <div className="md:col-span-2 flex flex-col gap-3 text-left mb-4">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Vos adresses de livraison enregistrées / précédentes
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      ...savedAddresses.map(a => ({ ...a, isLocal: false })),
                      ...localAddresses.map(a => ({ ...a, isLocal: true }))
                    ].map((a) => {
                      const isSelected = String(selectedAddressId) === String(a.id);
                      return (
                        <div
                          key={a.id}
                          onClick={() => {
                            setSelectedAddressId(a.id);
                            prefillFormWithAddress(a);
                          }}
                          className={`p-3.5 border cursor-pointer transition-all flex flex-col justify-between min-h-[105px] select-none relative ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900/[0.02] shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-[11px] font-bold text-neutral-800 truncate block max-w-[65%]">
                              {a.customer_name}
                            </span>
                            <div className="flex gap-1 shrink-0">
                              {a.is_default && (
                                <span className="bg-neutral-100 text-neutral-600 text-[8px] font-bold uppercase px-1 py-0.5 tracking-wider">
                                  Défaut
                                </span>
                              )}
                              {a.isLocal && (
                                <span className="bg-neutral-100 text-neutral-500 text-[8px] font-medium px-1 py-0.5 tracking-wider">
                                  Local
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-[10px] text-neutral-500 font-semibold mt-1.5 leading-relaxed break-words line-clamp-2">
                            {a.shipping_address}
                          </div>
                          <div className="text-[10.5px] text-neutral-600 font-bold mt-2 font-mono">
                            {a.customer_phone}
                          </div>
                          {isSelected && (
                            <div className="absolute bottom-2 right-2 bg-neutral-900 text-white p-0.5 rounded-none flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Option pour nouvelle adresse */}
                    <div
                      onClick={() => {
                        setSelectedAddressId('new');
                        setFormData(prev => ({
                          ...prev,
                          firstname: '',
                          lastname: '',
                          address: '',
                          phone: '',
                          email: '',
                        }));
                        setDeliveryCountry('CI');
                        setSelectedRegion('');
                        setSelectedCommune('');
                      }}
                      className={`p-3.5 border border-dashed cursor-pointer transition-all flex flex-col items-center justify-center min-h-[105px] text-center select-none ${
                        selectedAddressId === 'new'
                          ? 'border-neutral-900 bg-neutral-900/[0.02] text-neutral-900 font-bold'
                          : 'border-neutral-300 hover:border-neutral-400 bg-neutral-50/30 text-neutral-500'
                      }`}
                    >
                      <span className="text-xl font-light mb-1">+</span>
                      <span className="text-[10.5px] font-bold uppercase tracking-wider">
                        Nouvelle adresse
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Input label={c.firstname} name="firstname" value={formData.firstname} onChange={handleInputChange} required />
              <Input label={c.lastname} name="lastname" value={formData.lastname} onChange={handleInputChange} required />
              <Input label={c.email} type="email" name="email" value={formData.email} onChange={handleInputChange} className="md:col-span-2" required />
              {/* Select Country - UI Pro */}
              <div className="flex flex-col gap-2 text-left md:col-span-2 mb-1">
                <label className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-neutral-600" />
                  {c.country_label}
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setDeliveryCountry('CI')}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                      deliveryCountry === 'CI'
                        ? 'border-neutral-900 bg-neutral-900/5 shadow-sm font-semibold text-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      deliveryCountry === 'CI' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight">{c.country_ci}</div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-0.5">{c.country_ci_desc}</div>
                    </div>
                    {deliveryCountry === 'CI' && (
                      <Check className="w-4 h-4 text-neutral-900 shrink-0 stroke-[3]" />
                    )}
                  </div>

                  <div
                    onClick={() => {
                      setDeliveryCountry('OTHER');
                      setSelectedRegion('');
                      setSelectedCommune('');
                    }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all select-none ${
                      deliveryCountry === 'OTHER'
                        ? 'border-neutral-900 bg-neutral-900/5 shadow-sm font-semibold text-neutral-900'
                        : 'border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      deliveryCountry === 'OTHER' ? 'bg-neutral-900 text-white shadow-sm' : 'bg-neutral-100 text-neutral-500'
                    }`}>
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold leading-tight">{c.country_other}</div>
                      <div className="text-[10px] text-neutral-500 font-normal mt-0.5">{c.country_other_desc}</div>
                    </div>
                    {deliveryCountry === 'OTHER' && (
                      <Check className="w-4 h-4 text-neutral-900 shrink-0 stroke-[3]" />
                    )}
                  </div>
                </div>
              </div>

              <Input 
                label={c.address} 
                name="address" 
                value={formData.address} 
                onChange={handleInputChange} 
                className="md:col-span-2" 
                required 
                placeholder={deliveryCountry === 'OTHER' ? (c.address_other_placeholder || "Ville, Code postal, Pays, Rue...") : ""} 
              />
              
              {/* Select Région & Commune - Uniquement pour CI */}
              {deliveryCountry === 'CI' && (
                <>
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-neutral-600" />
                      {c.region}
                    </label>
                    <select
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      required={deliveryCountry === 'CI'}
                      className="w-full border border-neutral-200 rounded-sm py-2 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary h-11"
                    >
                      <option value="">{c.select_region}</option>
                      {regions.map((reg) => (
                        <option key={reg.id} value={reg.id}>{reg.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-600" />
                      {c.commune}
                    </label>
                    <select
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      required={deliveryCountry === 'CI'}
                      disabled={!selectedRegion}
                      className="w-full border border-neutral-200 rounded-sm py-2 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary h-11 disabled:bg-neutral-100"
                    >
                      <option value="">{c.select_commune}</option>
                      {communes.map((com) => (
                        <option key={com.id} value={com.id}>{com.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <Input label={c.phone} type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="md:col-span-2" required placeholder="0700000000" />
              
              <div className="md:col-span-2 flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{c.special_instructions}</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder={c.special_instructions_placeholder}
                  className="w-full border border-neutral-200 rounded-sm py-2.5 px-3 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Méthodes de Paiement */}
          <div className="bg-white p-6 border border-neutral-100 rounded-sm">
            <h3 className="text-base font-bold text-neutral-950 mb-6 uppercase tracking-wider border-b border-neutral-100 pb-3">
              {c.payment_method}
            </h3>
            <div className="flex flex-col gap-3">
              {(() => {
                const isMomo = ['Orange Money', 'MTN Momo', 'Moov Money', 'Wave'].includes(paymentMethod);
                const momoProviders = [
                  {
                    id: 'Orange Money',
                    name: 'Orange Money',
                    color: '#000000',
                    logo: (
                      <img src="/orange.png" alt="Orange Money" className="h-7 w-auto object-contain" />
                    ),
                  },
                  {
                    id: 'MTN Momo',
                    name: 'MTN MoMo',
                    color: '#FFFFFF',
                    logo: (
                      <img src="/momo.png" alt="MTN MoMo" className="h-7 w-auto object-contain" />
                    ),
                  },
                  {
                    id: 'Moov Money',
                    name: 'Moov Money',
                    color: '#FFFFFF',
                    logo: (
                      <img src="/moov.png" alt="Moov Money" className="h-7 w-auto object-contain" />
                    ),
                  },
                  {
                    id: 'Wave',
                    name: 'Wave',
                    color: '#FFFFFF',
                    logo: (
                      <img src="/wave.png" alt="Wave" className="h-7 w-auto object-contain" />
                    ),
                  },
                ];

                return [
                  { 
                    id: 'momo', 
                    title: c.momo_title, 
                    desc: c.momo_desc,
                    logos: isMomo ? null : (
                      <div className="flex gap-1.5 items-center shrink-0">
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="Orange Money">
                          <img src="/orange.png" alt="Orange Money" className="h-4.5 w-auto object-contain" />
                        </div>
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="MTN Mobile Money">
                          <img src="/momo.png" alt="MTN MoMo" className="h-5 w-auto object-contain" />
                        </div>
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="Moov Money">
                          <img src="/moov.png" alt="Moov Money" className="h-4.5 w-auto object-contain" />
                        </div>
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="Wave">
                          <img src="/wave.png" alt="Wave" className="h-5 w-auto object-contain" />
                        </div>
                      </div>
                    )
                  },
                  { 
                    id: 'Carte Bancaire', 
                    title: c.card_title, 
                    desc: c.card_desc,
                    logos: paymentMethod === 'Carte Bancaire' ? null : (
                      <div className="flex gap-1.5 items-center shrink-0">
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="Visa">
                          <svg className="h-2.5 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.15 11.24L11.52 3.12H9.33L7.96 11.24H10.15ZM17.15 3.32C16.73 3.15 15.93 2.97 14.99 2.97C12.78 2.97 11.22 4.09 11.2 5.68C11.18 6.86 12.28 7.52 13.13 7.91C14 8.32 14.3 8.59 14.3 8.97C14.29 9.54 13.57 9.8 12.92 9.8C12.01 9.8 11.49 9.56 11.07 9.38L10.74 10.87C11.17 11.06 12.11 11.23 13.09 11.23C15.42 11.23 16.94 10.14 16.96 8.44C16.98 7.02 15.89 6.27 14.88 5.81C14.05 5.4 13.75 5.15 13.75 4.83C13.75 4.34 14.36 4.06 14.97 4.06C15.7 4.06 16.23 4.19 16.63 4.36L17.15 3.32ZM22.5 3.12H20.42C19.78 3.12 19.34 3.3 19.06 3.93L15.98 11.24H18.27L18.73 10.02H21.52L21.78 11.24H23.78L22.5 3.12ZM19.36 8.36L20.49 5.37L21.14 8.36H19.36ZM6.35 3.12L4.08 8.65L3.84 7.42C3.42 5.92 2.1 3.93 0.6 3.16L2.83 11.23H5.13L8.55 3.12H6.35Z" fill="#1434CB"/>
                          </svg>
                        </div>
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="Mastercard">
                          <svg className="h-4 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="8" cy="7.5" r="6" fill="#EB001B" />
                            <circle cx="16" cy="7.5" r="6" fill="#F79E1B" />
                            <path d="M12 2.58A5.992 5.992 0 0 1 14 7.5c0 1.94-.92 3.67-2.35 4.77A5.993 5.993 0 0 1 10 7.5c0-1.94.92-3.67 2.35-4.77z" fill="#FF5F00" />
                          </svg>
                        </div>
                        <div className="w-8 h-5.5 bg-transparent flex items-center justify-center" title="American Express">
                          <svg className="h-2.5 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="24" height="15" rx="1.5" fill="#016FD0" />
                            <text x="12" y="10" fill="white" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">AMEX</text>
                          </svg>
                        </div>
                      </div>
                    )
                  },
                ].map((method) => (
                  <div
                    key={method.id}
                    className={`flex flex-col p-4 border rounded-sm transition-all duration-200 ${
                      (method.id === 'momo' && isMomo) || (method.id === paymentMethod)
                        ? 'border-neutral-900 bg-neutral-50/10'
                        : 'border-neutral-200 hover:bg-neutral-50/50 cursor-pointer'
                    }`}
                    onClick={() => {
                      if (method.id === 'momo') {
                        if (!isMomo) setPaymentMethod('Orange Money');
                      } else {
                        setPaymentMethod(method.id);
                      }
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={method.id === 'momo' ? isMomo : paymentMethod === method.id}
                          onChange={() => {
                            if (method.id === 'momo') {
                              setPaymentMethod('Orange Money');
                            } else {
                              setPaymentMethod(method.id);
                            }
                          }}
                          className="mt-1 text-accent focus:ring-accent shrink-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-neutral-900 block leading-tight">{method.title}</span>
                          <span className="text-xs text-neutral-400 font-medium block mt-1 leading-normal">{method.desc}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center sm:justify-end shrink-0 pl-8 sm:pl-0">
                        {method.logos}
                      </div>
                    </div>

                    {/* Sous-sélection opérateur Mobile Money */}
                    {method.id === 'momo' && isMomo && (
                      <div className="pl-8 pr-4 pt-4 pb-2 flex flex-col gap-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {momoProviders.map((provider) => {
                            const isSelectedProvider = paymentMethod === provider.id;
                            return (
                              <div
                                key={provider.id}
                                onClick={() => setPaymentMethod(provider.id)}
                                className={`flex items-center justify-center p-4 border transition-all duration-200 cursor-pointer text-center relative select-none rounded-none h-16 ${
                                  isSelectedProvider
                                    ? 'border-accent bg-neutral-100/30 ring-1 ring-accent shadow-xs'
                                    : 'border-neutral-200 bg-white hover:border-neutral-400'
                                }`}
                              >
                                <div className="w-16 h-10 flex items-center justify-center bg-transparent">
                                  {provider.logo}
                                </div>
                                
                                {isSelectedProvider && (
                                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-accent text-white rounded-full flex items-center justify-center shadow-xs">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Instructions de paiement de l'opérateur */}
                        <div className="bg-neutral-50 border border-neutral-200/50 p-4 rounded-none text-left animate-fade-in">
                          <div className="flex items-center gap-2 mb-2.5">
                            <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest">
                              Instructions {paymentMethod}
                            </span>
                          </div>
                          <ul className="space-y-1.5 pl-0.5">
                            {getMomoInstructions(paymentMethod, locale).steps.map((step, idx) => (
                              <li key={idx} className="text-[10px] text-neutral-600 flex items-start gap-2 leading-relaxed">
                                <span className="w-4 h-4 rounded-full bg-neutral-200/80 text-neutral-800 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                                <span className="flex-1">{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Saisie du numéro Mobile Money */}
                        <div className="flex flex-col gap-1.5 text-left max-w-sm mt-1">
                          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                            {c.payment_phone_number.replace('{provider}', paymentMethod)}
                          </label>
                          <div className="relative">
                            {(() => {
                              const phoneValidation = validateIvoryCoastPhone(paymentPhone, paymentMethod, c);
                              const inputBorderClass = !paymentPhone 
                                ? 'border-neutral-300' 
                                : !phoneValidation.isValid 
                                  ? 'border-red-400 focus:ring-red-400' 
                                  : phoneValidation.isWarning 
                                    ? 'border-amber-400 focus:ring-amber-400' 
                                    : 'border-emerald-400 focus:ring-emerald-400';
                              
                              return (
                                <>
                                  <input
                                    type="tel"
                                    placeholder="ex: 0707070707"
                                    value={paymentPhone}
                                    onChange={(e) => {
                                      setPaymentPhone(e.target.value);
                                      setPaymentPhoneDirty(true);
                                    }}
                                    className={`w-full bg-white border focus:outline-none text-xs px-3.5 py-2.5 rounded-none text-neutral-800 font-semibold transition-all duration-200 ${inputBorderClass}`}
                                    required={isMomo}
                                  />
                                  
                                  {paymentPhone && (
                                    <div className={`text-[10px] font-semibold flex items-start gap-1.5 mt-1.5 animate-fade-in ${
                                      !phoneValidation.isValid ? 'text-red-500' : phoneValidation.isWarning ? 'text-amber-600' : 'text-emerald-600'
                                    }`}>
                                      <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {!phoneValidation.isValid ? (
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        ) : phoneValidation.isWarning ? (
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        ) : (
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        )}
                                      </svg>
                                      <span className="flex-1 leading-normal">{phoneValidation.message}</span>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          <p className="text-[9px] text-neutral-400 leading-normal">
                            {c.momo_phone_help}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Infos Carte Bancaire */}
                    {method.id === 'Carte Bancaire' && paymentMethod === 'Carte Bancaire' && (
                      <div className="pl-8 pr-4 pt-3 pb-2 flex flex-col gap-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-neutral-50 border border-neutral-200/50 p-5 rounded-none text-left flex flex-col gap-4">
                          
                          {/* Card Brand Logos */}
                          <div className="flex flex-wrap gap-2.5 items-center pb-3.5 border-b border-neutral-200/60">
                            <span className="text-[7.5px] font-black text-[#0173C2] tracking-tighter uppercase border border-[#0173C2] px-1 py-0.5 rounded-none select-none">Amex</span>
                            <span className="text-[9px] font-black text-[#1A1F71] italic tracking-tighter select-none">VISA</span>
                            <div className="flex items-center gap-0.5 shrink-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] opacity-90 block"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B] opacity-90 -ml-1.5 block"></span>
                              <span className="text-[7.5px] font-extrabold text-neutral-800 ml-0.5 tracking-tighter uppercase select-none">Mastercard</span>
                            </div>
                            <span className="text-[7.5px] font-extrabold text-[#0079C1] tracking-tighter uppercase select-none">Diners Club</span>
                            <span className="text-[7.5px] font-extrabold text-[#008080] border border-[#008080] px-1 py-0.5 rounded-none select-none">UnionPay</span>
                            <span className="text-[8.5px] font-black text-[#FF6600] tracking-tighter select-none">DISCOVER</span>
                          </div>

                          {/* Message de redirection sécurisée */}
                          <div className="flex gap-3.5 items-start mt-1">
                            <svg className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <div>
                              <span className="text-[10px] font-bold text-neutral-800 uppercase tracking-widest block mb-1">
                                {locale === 'en' ? 'Secure Bank Redirection' : 'Redirection bancaire sécurisée'}
                              </span>
                              <span className="text-[10px] text-neutral-500 leading-relaxed block font-medium">
                                {c.card_redirect_notice}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                ));
              })()}

              {/* Badges de confiance et sécurité */}
              <div className="mt-6 border-t border-neutral-200/60 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-neutral-600">
                  <svg className="w-4.5 h-4.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-[10px] uppercase font-black tracking-widest text-neutral-800">
                    {c.secure_payment_100}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-semibold">
                    <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>SSL 256-bit</span>
                  </div>
                  <div className="h-3 w-px bg-neutral-300" />
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-widest">PCI-DSS COMPLIANT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Récapitulatif Articles */}
        <div className="w-full lg:w-[380px] flex flex-col gap-6">
          <div className="bg-neutral-50 p-6 border border-neutral-100 rounded-sm h-fit">
            <h3 className="text-base font-bold text-neutral-900 mb-6 uppercase tracking-wider pb-3 border-b border-neutral-200">
              {c.articles} ({cartItems.length})
            </h3>

            {/* Liste abrégée */}
            <div className="flex flex-col gap-4 max-h-48 overflow-y-auto mb-6">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex gap-3 text-xs">
                  <img src={item.image} alt="" className="w-10 h-13 object-cover rounded-xs" />
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-neutral-800 block truncate">{item.name}</span>
                    <span className="text-neutral-400 block mt-0.5">
                      {c.quantity_label} : {item.quantity} | {c.size_label} : {item.selectedSize}
                    </span>
                  </div>
                  <span className="font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-neutral-200 my-4" />

            {/* Totaux */}
            <div className="flex flex-col gap-3.5 text-xs font-semibold text-neutral-500">
              <div className="flex justify-between">
                <span>{c.subtotal}</span>
                <span className="text-neutral-900 font-bold">{formatPrice(finalSubtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>{c.shipping_cost}</span>
                <span className="text-neutral-900 font-bold">
                  {loadingPreview ? c.calculating : finalShipping === 0 ? c.free : formatPrice(finalShipping)}
                </span>
              </div>
              <div className="h-px bg-neutral-200 my-1" />
              <div className="flex justify-between text-sm font-bold text-neutral-900">
                <span>{c.total_to_pay}</span>
                <span className="text-lg text-accent font-extrabold">
                  {loadingPreview ? c.calculating : formatPrice(finalTotal)}
                </span>
              </div>
              <p className="text-[9px] text-neutral-400 mt-1 leading-normal">
                {c.currency_notice}
              </p>
            </div>

            <div className="mt-6">
              <Button type="submit" variant="accent" size="full" disabled={loading || cartItems.length === 0}>
                {loading ? c.processing : c.validate_and_pay.replace('{amount}', formatPrice(finalTotal))}
              </Button>
            </div>
          </div>
        </div>
      </form>

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
                    {c.momo_ussd_notice.replace('{phone}', paymentPhone || formData.phone || 'votre numéro')}
                  </p>
                  <div className="w-full bg-neutral-100 rounded-full h-1.5 mb-4 overflow-hidden relative">
                    <div className={`absolute top-0 left-0 h-full ${barColor} animate-pulse w-full`}></div>
                  </div>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-neutral-400 mb-6">
                    {c.awaiting_validation}
                  </p>
                  
                  <button
                    type="button"
                    onClick={async () => {
                      setIsPolling(false);
                      setIsMobileValidating(false);
                      try {
                        await checkoutService.cancelOrder(createdOrderRef);
                      } catch (cancelErr) {
                        console.warn("Failed to cancel order upon manual cancellation:", cancelErr);
                      }
                    }}
                    className="w-full py-2.5 border border-neutral-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer mb-2"
                  >
                    {c.cancel_payment}
                  </button>

                  {import.meta.env.DEV && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsPolling(false);
                        setPaymentStatus('SUCCESS');
                        setTimeout(() => {
                          shouldNotCancelOnUnmount.current = true;
                          clearCart();
                          setIsMobileValidating(false);
                          window.location.href = `${window.location.origin}/order-tracking/${createdOrderRef}?payment=success`;
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
                    {c.redirecting}
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
                      onClick={() => {
                        setIsMobileValidating(false);
                      }}
                      className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
                    >
                      {c.return_to_form}
                    </button>
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentStatus('SUCCESS');
                          setTimeout(() => {
                            shouldNotCancelOnUnmount.current = true;
                            clearCart();
                            setIsMobileValidating(false);
                            window.location.href = `${window.location.origin}/order-tracking/${createdOrderRef}?payment=success`;
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

      {/* Modal de Traitement Carte Bancaire */}
      {isCardProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white max-w-sm w-full p-8 rounded-none shadow-2xl flex flex-col items-center text-center border border-neutral-100">
            
            <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mb-6">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-widest mb-3">
              {locale === 'en' ? 'Processing Card Payment' : 'Traitement du paiement par carte'}
            </h3>
            
            <p className="text-xs text-neutral-500 leading-relaxed min-h-[40px] mb-6">
              {cardProcessStep === 1 && (locale === 'en' ? 'Securing connection with bank partner...' : 'Connexion sécurisée avec le partenaire bancaire...')}
              {cardProcessStep === 2 && (locale === 'en' ? 'Redirecting to secure bank gateway...' : 'Redirection vers l\'espace bancaire sécurisé...')}
            </p>
            
            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-accent transition-all duration-500" 
                style={{ width: `${(cardProcessStep / 2) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;

