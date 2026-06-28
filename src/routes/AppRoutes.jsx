import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Search, User, ShoppingBag, Heart, Menu, X, Globe, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';
import storefrontRoutes from './storefrontRoutes';
import dashboardRoutes from './dashboardRoutes';
import MegaMenu from '../features/storefront/components/MegaMenu';
import MobileMenu from '../features/storefront/components/MobileMenu';
import { useCart } from '../hooks/useCart';
import { useSettings } from '../hooks/useSettings';
import { useFavorites } from '../hooks/useFavorites';
import { useCustomerAuth } from '../hooks/useCustomerAuth';

const DEFAULT_FOOTER_CONFIG = {
  description: "Maison de haute couture et de maroquinerie d'exception. HA-KAVOD 97 incarne l'alliance parfaite de l'élégance intemporelle et du raffinement contemporain.",
  phone: "0850 333 22 86",
  email: "contact@hakavok.com",
  socials: {
    whatsapp: "https://wa.me/22507000000",
    facebook: "https://facebook.com/hakavod97",
    twitter: "https://twitter.com/hakavod97",
    instagram: "https://instagram.com/hakavod97",
    tiktok: "https://tiktok.com/@hakavod97"
  },
  country: "Côte d'Ivoire (XOF)",
  columns: [
    {
      title: "Boutique",
      links: [
        { name: "Robes", url: "/catalog?category_id=1" },
        { name: "Sacs", url: "/catalog?category_id=2" },
        { name: "Chaussures", url: "/catalog?category_id=3" },
        { name: "Accessoires", url: "/catalog?category_id=4" }
      ]
    },
    {
      title: "Aide",
      links: [
        { name: "Suivi de commande", url: "/order-tracking", icon: "track" },
        { name: "Livraison & Retours", url: "#", icon: "return" },
        { name: "F.A.Q", url: "/faq" }
      ]
    },
    {
      title: "Maison",
      links: [
        { name: "L'esprit de la Maison", url: "/esprit-de-la-maison" },
        { name: "Notre engagement", url: "/notre-engagement" },
        { name: "Services de Conciergerie", url: "/services-de-conciergerie" },
        { name: "Confidentialité", url: "/privacy-policy" }
      ]
    }
  ]
};

const FOOTER_TRANSLATIONS = {
  // Column titles
  "boutique": "Shop",
  "aide": "Help",
  "maison": "House",

  // Link names
  "robes": "Dresses",
  "sacs": "Bags",
  "chaussures": "Shoes",
  "accessoires": "Accessories",
  "suivi de commande": "Order Tracking",
  "livraison & retours": "Shipping & Returns",
  "f.a.q": "F.A.Q",
  "l'esprit de la maison": "House Spirit",
  "notre engagement": "Our Commitment",
  "services de conciergerie": "Concierge Services",
  "confidentialité": "Privacy Policy",
  "politique de confidentialité": "Privacy Policy",
  "conditions générales": "Terms of Service"
};

const tFooter = (text, activeLocale) => {
  if (activeLocale !== 'en') return text;
  const key = (text || '').toLowerCase().trim();
  return FOOTER_TRANSLATIONS[key] || text;
};

import customerService from '../services/api/customerService';

// Layout minimaliste style Defacto pour la boutique client
const StorefrontLayout = ({ children }) => {
  const { getCartCount, addToCart, toast, hideToast } = useCart();
  const { currencies, activeCurrency, changeCurrency, formatPrice, locales, activeLocale, changeLocale, t } = useSettings();
  const { favorites, toggleFavorite, getFavoritesCount } = useFavorites();
  const { 
    customerUser, 
    isAuthenticated, 
    customerLogin, 
    customerRegister, 
    customerRegisterPhone, 
    customerLoginPhone, 
    customerVerifyOtp, 
    customerLoginGoogle, 
    customerLoginFacebook, 
    customerLogout,
    customerForgotPassword
  } = useCustomerAuth();

  const [scrolled, setScrolled] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // États pour l'authentification avancée
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authMethod, setAuthMethod] = useState('email'); // 'email' | 'phone'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCountry, setAuthCountry] = useState('CI');
  const [authCountryCode, setAuthCountryCode] = useState('+225');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [countries, setCountries] = useState([]);
  
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const location = useLocation();
  const [favoritesSuccess, setFavoritesSuccess] = useState('');

  // Mot de passe oublié dans le tiroir
  const [showForgotDrawer, setShowForgotDrawer] = useState(false);
  const [forgotDrawerEmail, setForgotDrawerEmail] = useState('');
  const [forgotDrawerSuccess, setForgotDrawerSuccess] = useState('');

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setAuthError('');
      setAuthLoading(true);
      try {
        const countryCode = authCountry || 'CI';
        await customerLoginGoogle(tokenResponse.access_token, countryCode);
        setIsAuthOpen(false);
      } catch (err) {
        console.error("Erreur Google Login:", err);
        let errorMsg = err.response?.data?.message || err.message || "Échec de la connexion avec Google.";
        if (err.response?.data?.errors) {
          const details = Object.values(err.response.data.errors).flat().join(' ');
          errorMsg = `${errorMsg} Détails : ${details}`;
        }
        setAuthError(errorMsg);
      } finally {
        setAuthLoading(false);
      }
    },
    onError: () => {
      setAuthError("Connexion Google annulée ou échouée.");
    }
  });

  // Charger les pays supportés
  useEffect(() => {
    if (isAuthOpen) {
      const fetchCountries = async () => {
        try {
          const data = await customerService.getCountries();
          setCountries(data || []);
          if (data && data.length > 0) {
            // Utiliser le premier pays par défaut ou Côte d'Ivoire
            const ci = data.find(c => c.code === 'CI');
            if (ci) {
              setAuthCountry('CI');
              setAuthCountryCode(ci.phone_code);
            } else {
              setAuthCountry(data[0].code);
              setAuthCountryCode(data[0].phone_code);
            }
          }
        } catch (e) {
          console.error("Erreur chargement pays", e);
        }
      };
      fetchCountries();
    }
  }, [isAuthOpen]);

  const handleRemoveFavorite = (item) => {
    toggleFavorite(item);
    const msg = activeLocale === 'en'
      ? `"${item.name}" has been removed from your favorites.`
      : `"${item.name}" a été retiré de vos favoris.`;
    setFavoritesSuccess(msg);
    setTimeout(() => {
      setFavoritesSuccess('');
    }, 3500);
  };

  const handleAddFromFavoritesToCart = (item) => {
    const size = item.sizes?.[0] || 'M';
    const color = item.colors?.[0]?.name || 'Noir';
    const variantId = item.variants?.[0]?.id || null;
    addToCart(item, 1, size, color, variantId);
    toggleFavorite(item);
    const msg = activeLocale === 'en'
      ? `"${item.name}" has been added to your cart.`
      : `"${item.name}" a été ajouté au panier.`;
    setFavoritesSuccess(msg);
    setTimeout(() => {
      setFavoritesSuccess('');
    }, 3500);
  };

  // Configuration dynamique du Footer
  const [footerConfig, setFooterConfig] = useState(DEFAULT_FOOTER_CONFIG);

  useEffect(() => {
    const stored = localStorage.getItem('storefront_footer_config');
    if (stored) {
      try {
        setFooterConfig(JSON.parse(stored));
      } catch (e) {
        console.error("Erreur de chargement du footer", e);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const countryCode = authCountry;

      if (authMethod === 'email') {
        await customerLogin(authEmail, authPassword);
        setIsAuthOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        // Mode Téléphone : Connexion directe par mot de passe
        const fullPhone = `${authCountryCode}${authPhone}`;
        await customerLoginPhone(fullPhone, authPassword, countryCode);
        setIsAuthOpen(false);
        setAuthPhone('');
        setAuthPassword('');
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMsg = err.response?.data?.message || err.message || "Une erreur est survenue lors de la connexion.";
      if (err.response?.data?.errors) {
        let details = Object.values(err.response.data.errors).flat().join(' ');
        if (details.includes('validation.unique')) {
          details = "Cet e-mail ou ce numéro de téléphone est déjà associé à un compte.";
        } else if (details.includes('validation.min.string')) {
          details = "Le mot de passe est trop court. Il doit comporter au moins 8 caractères.";
        }
        errorMsg = `${errorMsg} Détails : ${details}`;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const countryCode = authCountry;

      if (authMethod === 'email') {
        await customerRegister(authName, authEmail, authPassword, countryCode);
        setIsAuthOpen(false);
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      } else {
        // Mode Téléphone
        const fullPhone = `${authCountryCode}${authPhone}`;
        if (!otpSent) {
          await customerRegisterPhone(fullPhone, authName, countryCode);
          setOtpSent(true);
        } else {
          await customerVerifyOtp(fullPhone, otpCode, authPassword, countryCode);
          setIsAuthOpen(false);
          setOtpSent(false);
          setOtpCode('');
          setAuthPhone('');
          setAuthName('');
          setAuthPassword('');
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMsg = err.response?.data?.message || err.message || "Une erreur est survenue lors de l'inscription.";
      if (err.response?.data?.errors) {
        let details = Object.values(err.response.data.errors).flat().join(' ');
        if (details.includes('validation.unique')) {
          details = "Cet e-mail ou ce numéro de téléphone est déjà associé à un compte.";
        } else if (details.includes('validation.min.string')) {
          details = "Le mot de passe est trop court. Il doit comporter au moins 8 caractères.";
        }
        errorMsg = `${errorMsg} Détails : ${details}`;
      }
      setAuthError(errorMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasswordDrawer = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAuthError('');
    setForgotDrawerSuccess('');
    setAuthLoading(true);
    try {
      await customerForgotPassword(forgotDrawerEmail);
      setForgotDrawerSuccess(
        t('reset_link_sent') || 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.'
      );
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Une erreur est survenue.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setAuthError('');
    if (provider === 'google') {
      loginWithGoogle();
      return;
    }
    setAuthLoading(true);
    try {
      const mockToken = `mock-${provider}-token-${Math.random().toString(36).substring(2)}`;
      const countryCode = authCountry || 'CI';
      await customerLoginFacebook(mockToken, countryCode);
      setIsAuthOpen(false);
    } catch (err) {
      console.error(`Erreur Social Login ${provider}:`, err);
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      setAuthError(serverMessage || `Échec de la connexion avec ${provider === 'google' ? 'Google' : 'Facebook'}.`);
    } finally {
      setAuthLoading(false);
    }
  };

  const isHomePage = location.pathname === '/';
  const isHeaderTransparent = isHomePage && !scrolled;

  const headerClass = isHeaderTransparent
    ? "absolute top-0 left-0 right-0 z-40 border-b border-transparent bg-transparent text-white transition-all duration-300"
    : "fixed top-0 left-0 right-0 z-40 border-b border-neutral-200/50 bg-neutral-50/90 backdrop-blur-md text-neutral-900 shadow-xs transition-all duration-300";

  const searchClass = isHeaderTransparent
    ? "hidden md:flex items-center gap-2 border border-white/20 rounded-sm py-1.5 px-3 w-64 bg-white/10 text-white"
    : "hidden md:flex items-center gap-2 border border-neutral-200 rounded-sm py-1.5 px-3 w-64 bg-neutral-100/50 text-neutral-800";

  const searchIconClass = isHeaderTransparent ? "w-4 h-4 text-white/70" : "w-4 h-4 text-neutral-400";
  const searchInputPlaceholder = isHeaderTransparent ? "placeholder-white/60 text-white focus:outline-none" : "placeholder-neutral-400 text-neutral-800 focus:outline-none";

  const brandTextClass = isHeaderTransparent
    ? "text-xl font-black uppercase tracking-[0.2em] text-white group-hover:text-accent transition-colors hidden sm:inline-block"
    : "text-xl font-black uppercase tracking-[0.2em] text-neutral-950 group-hover:text-primary transition-colors hidden sm:inline-block";

  const actionIconClass = isHeaderTransparent
    ? "text-white hover:text-accent p-1 transition-colors relative"
    : "text-neutral-700 hover:text-accent p-1 transition-colors relative";

  const megaMenuWrapperClass = isHeaderTransparent
    ? "border-t border-white/10 bg-transparent hidden md:block"
    : "border-t border-neutral-200/40 bg-neutral-50 hidden md:block";

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 font-sans text-neutral-900">
      {/* Header minimaliste style Defacto */}
      <header className={headerClass}>
        <div className="w-full px-4 md:px-10 h-20 flex items-center justify-between">
          
          {/* Bouton Menu Mobile (Gauche) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className={`md:hidden ${actionIconClass}`}
            title={t('open_menu')}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo (Gauche et débordant sur desktop, centré et h-12 d'origine sur mobile) */}
          <div className="flex-1 md:flex-initial md:flex-grow-0 md:shrink-0 flex justify-center md:justify-start items-center md:-ml-4 md:z-50 md:relative md:w-52 md:h-20">
            <Link to="/" className="flex items-center group relative md:w-full md:h-full">
              <img
                src="/logo.png"
                alt="HA-KAVOD 97 Logo"
                className="h-12 md:h-36 w-auto object-contain transition-transform duration-300 group-hover:scale-105 md:absolute md:top-1 md:left-0"
              />
            </Link>
          </div>

          {/* Barre de Recherche (Centre sur desktop, cachée sur mobile) */}
          <div className={`${searchClass} md:mx-auto`}>
            <Search className={searchIconClass} />
            <input
              type="text"
              placeholder={t('search_placeholder')}
              className={`bg-transparent text-xs w-full ${searchInputPlaceholder}`}
            />
          </div>

          {/* Actions Client (Droite) */}
          <div className="flex items-center gap-6">
            {/* Sélecteur de Devise */}
            <select
              value={activeCurrency}
              onChange={(e) => changeCurrency(e.target.value)}
              className={`text-xs bg-transparent border-0 font-bold uppercase cursor-pointer focus:outline-none focus:ring-0 ${
                isHeaderTransparent ? 'text-white/70 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code} className="text-neutral-900 bg-white font-semibold">
                  {c.code}
                </option>
              ))}
            </select>

            {/* Sélecteur de Langue */}
            <select
              value={activeLocale}
              onChange={(e) => changeLocale(e.target.value)}
              className={`text-xs bg-transparent border-0 font-bold uppercase cursor-pointer focus:outline-none focus:ring-0 ${
                isHeaderTransparent ? 'text-white/70 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {locales.map(l => (
                <option key={l.code} value={l.code} className="text-neutral-900 bg-white font-semibold">
                  {l.code === 'en' ? 'ENG' : 'FR'}
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsAuthOpen(true)}
              className={actionIconClass}
              title={isAuthenticated ? `${t('logged_in_as')} ${customerUser.name}` : t('login_signup')}
            >
              <User className={`w-5 h-5 ${isAuthenticated ? "text-accent font-bold" : ""}`} />
              {isAuthenticated && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
              )}
            </button>

            <button
              onClick={() => setIsFavoritesOpen(true)}
              className={actionIconClass}
              title={t('my_favorites')}
            >
              <Heart className={`w-5 h-5 ${getFavoritesCount() > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {getFavoritesCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {getFavoritesCount()}
                </span>
              )}
            </button>

            <Link to="/cart" className={actionIconClass}>
              <ShoppingBag className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {getCartCount()}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* MegaMenu (En dessous de la barre principale) */}
        <div className={megaMenuWrapperClass}>
          <div className="w-full px-10 h-12 flex items-center md:pl-56">
            <MegaMenu isTransparent={isHeaderTransparent} />
          </div>
        </div>
      </header>

      {/* Menu de navigation mobile (tiroir) */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Zone du contenu des pages */}
      <div className={`flex-grow ${isHomePage ? "" : "pt-24 md:pt-40"}`}>
        {children}
      </div>

      {/* Toast Notification Flottante (Trendyol Style) */}
      {toast && toast.show && (
        <div className="fixed top-24 right-4 md:right-10 z-50 animate-slide-in-right max-w-sm w-full">
          <div className={`p-4 shadow-xl border flex items-start gap-3 backdrop-blur-md rounded-xs ${
            toast.type === 'success' 
              ? 'bg-neutral-50/95 border-accent/40 text-neutral-800' 
              : 'bg-neutral-50/95 border-primary/40 text-neutral-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            ) : (
              <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <div className="flex-1 text-xs font-semibold text-left leading-relaxed">
              {toast.message}
            </div>
            <button 
              onClick={() => hideToast()} 
              className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tiroir Favoris */}
      {isFavoritesOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsFavoritesOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-neutral-200">
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{t('my_favorites')}</h3>
                <button
                  onClick={() => setIsFavoritesOpen(false)}
                  className="text-neutral-400 hover:text-neutral-500 p-1 text-xl font-light focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4">
                {favoritesSuccess && (
                  <div className="bg-primary text-white border-l-4 border-accent p-3 mb-4 rounded-none flex items-center justify-between shadow-xs animate-fade-in">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">{favoritesSuccess}</span>
                    </div>
                    <button onClick={() => setFavoritesSuccess('')} className="text-neutral-300 hover:text-white transition-colors p-1 cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {favorites.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12">
                    <Heart className="w-12 h-12 text-neutral-300 stroke-1 mb-4" />
                    <p className="text-sm text-neutral-500 font-medium">{t('favorites_empty')}</p>
                    <button
                      onClick={() => setIsFavoritesOpen(false)}
                      className="mt-6 bg-primary hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest py-3 px-6 rounded-xs transition-colors"
                    >
                      {t('discover_collection')}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {favorites.map((item) => (
                      <div key={item.id} className="flex gap-4 border-b border-neutral-100 pb-4">
                        <div className="w-20 aspect-[3/4] bg-neutral-100 overflow-hidden rounded-xs shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between text-left">
                          <div>
                            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{item.brand || 'Ha-kavod 97'}</h4>
                            <Link
                              to={`/product/${item.id}`}
                              onClick={() => setIsFavoritesOpen(false)}
                              className="text-sm font-semibold text-neutral-800 hover:underline line-clamp-2 mt-0.5"
                            >
                              {item.name}
                            </Link>
                          </div>
                          <div className="text-sm font-bold text-neutral-900 mt-2">
                            {formatPrice(item.price)}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAddFromFavoritesToCart(item)}
                              className="bg-primary hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-3 rounded-xs transition-colors"
                            >
                              {t('add_to_cart')}
                            </button>
                            <button
                              onClick={() => handleRemoveFavorite(item)}
                              className="text-[10px] text-red-500 font-bold uppercase tracking-wider hover:underline"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tiroir Connexion / Inscription */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsAuthOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-neutral-200">
              <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900">{t('profile')}</h3>
                <button
                  onClick={() => setIsAuthOpen(false)}
                  className="text-neutral-400 hover:text-neutral-500 p-1 text-xl font-light focus:outline-none"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-6 text-left">
                {isAuthenticated ? (
                  <div className="flex flex-col h-full justify-between">
                    <div className="flex flex-col gap-6">
                      <div className="border-b border-neutral-100 pb-5">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">{t('welcome')}</span>
                        <h4 className="text-lg font-black text-neutral-900 mt-1">{customerUser.name}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">{customerUser.email}</p>
                      </div>

                      <div className="flex flex-col gap-3.5">
                        <Link
                          to="/account"
                          onClick={() => setIsAuthOpen(false)}
                          className="w-full flex items-center justify-between py-3.5 px-4 border border-[#C9963A] bg-[#C9963A]/5 hover:bg-[#C9963A]/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-[#C9963A]"
                        >
                          {t('personal_space')}
                          <span className="text-[#C9963A]">&rarr;</span>
                        </Link>

                        <Link
                          to="/order-tracking"
                          onClick={() => setIsAuthOpen(false)}
                          className="w-full flex items-center justify-between py-3.5 px-4 border border-neutral-200 hover:border-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                        >
                          {t('track_my_orders')}
                          <span className="text-neutral-400">&rarr;</span>
                        </Link>
                        
                        <Link
                          to="/catalog"
                          onClick={() => setIsAuthOpen(false)}
                          className="w-full flex items-center justify-between py-3.5 px-4 border border-neutral-200 hover:border-neutral-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                        >
                          {t('discover_news')}
                          <span className="text-neutral-400">&rarr;</span>
                        </Link>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        customerLogout();
                        setIsAuthOpen(false);
                      }}
                      className="w-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-widest py-3.5 text-center transition-colors mt-8 rounded-xl font-semibold cursor-pointer"
                    >
                      {t('logout')}
                    </button>
                  </div>
                 ) : (
                  <div className="animate-fade-in text-left">
                    {showForgotDrawer ? (
                      /* ────── Mot de passe oublié ─ 2 étapes ────── */
                      <div className="animate-fade-in">
                        {!forgotDrawerSuccess ? (
                          /* Étape 1 : Saisie e-mail */
                          <form onSubmit={handleForgotPasswordDrawer} className="flex flex-col gap-5">
                            {/* Icône cadenas */}
                            <div className="flex flex-col items-center gap-3 text-center">
                              <div className="w-14 h-14 rounded-full bg-primary/8 flex items-center justify-center mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                              </div>
                              <h3 className="text-sm font-extrabold tracking-widest text-neutral-800 uppercase">
                                {t('forgot_password') || 'Mot de passe oublié'}
                              </h3>
                              <p className="text-[11px] text-neutral-500 leading-relaxed">
                                {t('forgot_password_desc') || 'Saisissez votre e-mail pour recevoir un lien de réinitialisation.'}
                              </p>
                            </div>

                            {authError && (
                              <div className="bg-red-50 border-l-2 border-danger text-danger p-3 text-[11px] font-medium rounded-lg flex items-start gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>{authError}</span>
                              </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                                {t('email_address') || 'Adresse e-mail'}
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  required
                                  value={forgotDrawerEmail}
                                  onChange={(e) => setForgotDrawerEmail(e.target.value)}
                                  placeholder="nom@exemple.com"
                                  className="w-full py-2.5 px-3.5 pl-10 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-xl transition-all placeholder-neutral-400 font-light focus:outline-none"
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={authLoading}
                              className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/15"
                            >
                              {authLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              ) : (
                                t('send_reset_link') || 'Envoyer le lien'
                              )}
                            </button>

                            <div className="text-center">
                              <button
                                type="button"
                                onClick={() => { setShowForgotDrawer(false); setAuthError(''); }}
                                className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-primary transition-all cursor-pointer bg-transparent border-none inline-flex items-center gap-1.5"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                {t('back_to_login') || 'Retour à la connexion'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* Étape 2 : Confirmation */
                          <div className="flex flex-col items-center gap-4 text-center animate-fade-in py-2">
                            {/* Enveloppe animée */}
                            <div className="relative w-16 h-16 flex items-center justify-center mb-1">
                              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-25" style={{animationDuration:'2s'}}></div>
                              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.981l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                                </svg>
                              </div>
                            </div>

                            <h3 className="text-sm font-extrabold uppercase tracking-widest text-neutral-800">
                              {t('check_inbox') || 'Vérifiez votre boîte mail'}
                            </h3>

                            <p className="text-[11px] text-neutral-500 leading-relaxed">
                              Lien envoyé à <strong className="text-neutral-700 font-semibold">{forgotDrawerEmail}</strong>. Vérifiez vos spams.
                            </p>

                            <div className="w-full border-t border-neutral-100 my-1"></div>

                            <div className="flex flex-col gap-2.5 w-full">
                              <button
                                type="button"
                                onClick={handleForgotPasswordDrawer}
                                disabled={authLoading}
                                className="w-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl bg-white cursor-pointer flex items-center justify-center gap-2 transition-all"
                              >
                                {authLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                                {t('resend_link') || 'Renvoyer le lien'}
                              </button>
                              <button
                                type="button"
                                onClick={() => { setShowForgotDrawer(false); setForgotDrawerSuccess(''); setAuthError(''); }}
                                className="w-full bg-primary hover:bg-neutral-850 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl cursor-pointer transition-all"
                              >
                                {t('back_to_login') || 'Retour à la connexion'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                    <>{/* ────── Onglets principaux : Connexion vs Inscription ────── */}
                    <div className="flex border-b border-neutral-200 mb-6">
                      <button
                        onClick={() => { setAuthTab('login'); setAuthError(''); setOtpSent(false); }}
                        className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                          authTab === 'login' ? 'border-primary text-primary font-extrabold' : 'border-transparent text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {t('sign_in')}
                      </button>
                      <button
                        onClick={() => { setAuthTab('register'); setAuthError(''); setOtpSent(false); }}
                        className={`flex-1 pb-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
                          authTab === 'register' ? 'border-primary text-primary font-extrabold' : 'border-transparent text-neutral-400 hover:text-neutral-600'
                        }`}
                      >
                        {t('create_account')}
                      </button>
                    </div>

                    {authError && (
                      <div className="bg-red-50 border-l-2 border-danger text-danger p-3.5 text-xs mb-5 font-medium rounded-lg flex items-start gap-2.5 shadow-2xs">
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {/* Sous-onglets : Méthode E-mail vs Téléphone */}
                    {!otpSent && (
                      <div className="flex gap-2 p-1 bg-neutral-100/60 rounded-xl mb-6">
                        <button
                          type="button"
                          onClick={() => { setAuthMethod('email'); setAuthError(''); }}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border-0 cursor-pointer ${
                            authMethod === 'email' ? 'bg-white text-neutral-900 shadow-2xs font-extrabold' : 'bg-transparent text-neutral-500 hover:text-neutral-700'
                          }`}
                        >
                          {t('by_email')}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setAuthMethod('phone'); setAuthError(''); }}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border-0 cursor-pointer ${
                            authMethod === 'phone' ? 'bg-white text-neutral-900 shadow-2xs font-extrabold' : 'bg-transparent text-neutral-500 hover:text-neutral-700'
                          }`}
                        >
                          {t('by_phone')}
                        </button>
                      </div>
                    )}

                    {/* Formulaire Principal */}
                    {authTab === 'login' ? (
                      <form onSubmit={handleLoginSubmit} className="space-y-4">
                        {authMethod === 'email' ? (
                          <>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('email_address')}</label>
                              <input
                                type="email"
                                required
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                placeholder="nom@exemple.com"
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('password')}</label>
                              <input
                                type="password"
                                required
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                          </>
                        ) : (
                          /* Authentification par Téléphone */
                          <>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('phone_number')}</label>
                              <div className="flex gap-2">
                                <select
                                  value={authCountry}
                                  onChange={(e) => {
                                    const selected = countries.find(c => c.code === e.target.value);
                                    if (selected) {
                                      setAuthCountry(selected.code);
                                      setAuthCountryCode(selected.phone_code);
                                    }
                                  }}
                                  className="py-2.5 px-3 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all font-light bg-white focus:outline-none max-w-[100px]"
                                >
                                  {countries.length > 0 ? (
                                    countries.map((c) => (
                                      <option key={c.code} value={c.code}>
                                        {c.code} ({c.phone_code})
                                      </option>
                                    ))
                                  ) : (
                                    <option value="CI">CI (+225)</option>
                                  )}
                                </select>
                                <input
                                  type="tel"
                                  required
                                  value={authPhone}
                                  onChange={(e) => setAuthPhone(e.target.value)}
                                  placeholder="0707070707"
                                  className="flex-1 py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('password')}</label>
                              <input
                                type="password"
                                required
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                          </>
                        )}
                        {/* Lien Mot de passe oublié - visible seulement en mode e-mail */}
                        {authMethod === 'email' && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                setShowForgotDrawer(true);
                                setForgotDrawerEmail(authEmail);
                                setAuthError('');
                                setForgotDrawerSuccess('');
                              }}
                              className="text-[10px] text-primary hover:text-primary/70 font-semibold tracking-wide transition-colors bg-transparent border-0 cursor-pointer underline underline-offset-2"
                            >
                              {t('forgot_password') || 'Mot de passe oublié ?'}
                            </button>
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md shadow-primary/10"
                        >
                          {authLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            t('sign_in')
                          )}
                        </button>
                      </form>
                    ) : (
                      /* Formulaire d'inscription */
                      <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        {authMethod === 'email' ? (
                          <>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('full_name')}</label>
                              <input
                                type="text"
                                required
                                value={authName}
                                onChange={(e) => setAuthName(e.target.value)}
                                placeholder={activeLocale === 'en' ? "John Doe" : "Jean Dupont"}
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('email_address')}</label>
                              <input
                                type="email"
                                required
                                value={authEmail}
                                onChange={(e) => setAuthEmail(e.target.value)}
                                placeholder="exemple@email.com"
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('password')}</label>
                              <input
                                type="password"
                                required
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                              />
                            </div>
                          </>
                        ) : (
                          /* Inscription par téléphone */
                          <>
                            {!otpSent ? (
                              <>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('full_name')}</label>
                                  <input
                                    type="text"
                                    required
                                    value={authName}
                                    onChange={(e) => setAuthName(e.target.value)}
                                    placeholder={activeLocale === 'en' ? "John Doe" : "Jean Dupont"}
                                    className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                                  />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('phone_number')}</label>
                                  <div className="flex gap-2">
                                    <select
                                      value={authCountry}
                                      onChange={(e) => {
                                        const selected = countries.find(c => c.code === e.target.value);
                                        if (selected) {
                                          setAuthCountry(selected.code);
                                          setAuthCountryCode(selected.phone_code);
                                        }
                                      }}
                                      className="py-2.5 px-3 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all font-light bg-white focus:outline-none max-w-[100px]"
                                    >
                                      {countries.length > 0 ? (
                                        countries.map((c) => (
                                          <option key={c.code} value={c.code}>
                                            {c.code} ({c.phone_code})
                                          </option>
                                        ))
                                      ) : (
                                        <option value="CI">CI (+225)</option>
                                      )}
                                    </select>
                                    <input
                                      type="tel"
                                      required
                                      value={authPhone}
                                      onChange={(e) => setAuthPhone(e.target.value)}
                                      placeholder="0707070707"
                                      className="flex-1 py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                                    />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col gap-1.5 animate-fade-in">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('otp_received')}</label>
                                  <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-[10px] text-neutral-400 hover:text-neutral-900 underline"
                                  >
                                    {t('edit_phone')}
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  required
                                  maxLength={6}
                                  value={otpCode}
                                  onChange={(e) => setOtpCode(e.target.value)}
                                  placeholder="123456"
                                  className="w-full py-3 px-4 text-sm bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all text-center tracking-[0.5em] focus:outline-none font-bold"
                                />
                                <div className="flex flex-col gap-1.5 mt-2">
                                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">{t('password')}</label>
                                  <input
                                    type="password"
                                    required
                                    value={authPassword}
                                    onChange={(e) => setAuthPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full py-2.5 px-3.5 text-xs bg-neutral-50 border border-neutral-200 focus:bg-white focus:border-primary rounded-lg transition-all placeholder-neutral-400 font-light focus:outline-none"
                                  />
                                </div>
                                <p className="text-[10px] text-neutral-450 mt-1">
                                  {t('otp_sent_desc')} {authCountryCode} {authPhone}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                        <button
                          type="submit"
                          disabled={authLoading}
                          className="w-full bg-primary hover:bg-neutral-850 text-white py-3.5 text-xs font-semibold uppercase tracking-widest transition-all rounded-lg flex items-center justify-center gap-2 mt-4 cursor-pointer shadow-md shadow-primary/10"
                        >
                          {authLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            authMethod === 'phone' && !otpSent ? t('send_otp') : t('create_account')
                          )}
                        </button>
                      </form>
                    )}

                    {/* Séparateur & Boutons Sociaux */}
                    {!otpSent && (
                      <div className="mt-6">
                        <div className="relative flex py-3 items-center">
                          <div className="flex-grow border-t border-neutral-200"></div>
                          <span className="flex-shrink mx-4 text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{t('or_continue_with')}</span>
                          <div className="flex-grow border-t border-neutral-200"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            disabled={authLoading}
                            className="flex items-center justify-center gap-2 border border-neutral-200 hover:bg-neutral-50 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-white cursor-pointer"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                            </svg>
                            Google
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSocialLogin('facebook')}
                            disabled={authLoading}
                            className="flex items-center justify-center gap-2 border border-neutral-200 hover:bg-neutral-50 py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-white cursor-pointer"
                          >
                            <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            Facebook
                          </button>
                        </div>
                      </div>
                     )}
                    </>
                    )}
                  </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer minimaliste */}
      <footer className="bg-neutral-950 text-neutral-400 py-8 md:py-12 px-4 md:px-8 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-xs">
          
          {/* Colonnes dynamiques 1, 2, 3 */}
          {(footerConfig.columns || DEFAULT_FOOTER_CONFIG.columns).map((col, cIdx) => (
            <div key={cIdx}>
              <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-[11px]">{tFooter(col.title, activeLocale)}</h4>
              <ul className="flex flex-col gap-2.5">
                {(col.links || []).map((link, lIdx) => {
                  const isExternal = link.url.startsWith('http') || link.url.startsWith('#');
                  const content = (
                    <span className="flex items-center gap-1.5">
                      {link.icon && (
                        <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                        </svg>
                      )}
                      {tFooter(link.name, activeLocale)}
                    </span>
                  );

                  return (
                    <li key={lIdx}>
                      {isExternal ? (
                        <a href={link.url} className="hover:text-white transition-colors">
                          {content}
                        </a>
                      ) : (
                        <Link to={link.url} className="hover:text-white transition-colors">
                          {content}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Colonne 4 : Logo, Contact, Réseaux et Pays */}
          <div className="flex flex-col gap-4">
            <img
              src="/logo.png"
              alt="HA-KAVOD 97 Logo"
              className="h-16 w-auto object-contain self-start bg-transparent"
            />
            <div>
              <p className="leading-relaxed text-neutral-400 text-[10.5px]">
                {activeLocale === 'en' && (!footerConfig.description || footerConfig.description === DEFAULT_FOOTER_CONFIG.description)
                  ? "Exceptional haute couture and leather goods house. HA-KAVOD 97 embodies the perfect alliance of timeless elegance and contemporary refinement."
                  : (footerConfig.description || DEFAULT_FOOTER_CONFIG.description)}
              </p>
            </div>
            
            {/* Contact details */}
            <div className="pt-2 border-t border-neutral-900">
              <h4 className="font-bold text-white mb-2 uppercase tracking-widest text-[10px]">{activeLocale === 'en' ? "Contact" : "Contact"}</h4>
              <ul className="flex flex-col gap-1 text-[11px] text-neutral-400">
                {footerConfig.phone && (
                  <li>
                    {t('phone_label')} <a href={`tel:${footerConfig.phone}`} className="hover:text-white font-semibold text-white tracking-wider">{footerConfig.phone}</a>
                  </li>
                )}
                {footerConfig.email && (
                  <li>
                    Email : <a href={`mailto:${footerConfig.email}`} className="hover:text-white">{footerConfig.email}</a>
                  </li>
                )}
              </ul>
            </div>

            {/* Social networks (TAKİP EDİN) */}
            <div>
              <h4 className="font-bold text-white mb-2.5 uppercase tracking-widest text-[10px]">{t('follow_us')}</h4>
              <div className="flex gap-2">
                {footerConfig.socials?.whatsapp && (
                  <a href={footerConfig.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-green-600 hover:border-green-600 transition-colors" title="WhatsApp">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.528 2.021 14.067.994 11.45.994c-5.438 0-9.863 4.371-9.867 9.8.001 2.128.561 4.2 1.63 6.015L2.18 21.84l5.221-1.353-.755-.42a9.697 9.697 0 011.001-1.011zm11.385-6.398c-.3-.15-1.772-.875-2.046-.975-.276-.102-.476-.152-.676.152-.2.302-.776.976-.951 1.177-.176.202-.351.226-.651.077-1.207-.603-2.107-1.054-2.907-2.433-.211-.362-.211-.622-.062-.873.136-.226.3-.352.45-.528.15-.176.2-.301.3-.502.1-.2.05-.377-.025-.527-.075-.15-.676-1.63-.926-2.233-.244-.587-.492-.507-.675-.516-.174-.008-.374-.01-.574-.01s-.525.075-.8.376c-.275.301-1.05.986-1.05 2.404s1.025 2.787 1.17 2.988c.145.201 2.019 3.084 4.893 4.327.685.297 1.22.474 1.638.607.69.219 1.317.189 1.812.115.552-.083 1.772-.725 2.022-1.425.25-.7.25-1.3.175-1.426-.075-.127-.275-.201-.575-.351z"/>
                    </svg>
                  </a>
                )}
                {footerConfig.socials?.facebook && (
                  <a href={footerConfig.socials.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-colors" title="Facebook">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                    </svg>
                  </a>
                )}
                {footerConfig.socials?.twitter && (
                  <a href={footerConfig.socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-neutral-800 hover:border-neutral-700 transition-colors" title="X (Twitter)">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {footerConfig.socials?.instagram && (
                  <a href={footerConfig.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-pink-600 hover:border-pink-600 transition-colors" title="Instagram">
                    <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>
                )}
                {footerConfig.socials?.tiktok && (
                  <a href={footerConfig.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center hover:bg-neutral-800 hover:border-neutral-700 transition-colors" title="TikTok">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 448 512">
                      <path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17h0A122.18 122.18 0 0 0 381 102.39a121.43 121.43 0 0 0 67 20.14z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Globe Pays */}
            {footerConfig.country && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-900">
                <Globe className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider select-none">
                  {footerConfig.country}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-neutral-900 mt-6 md:mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6">
            <span>&copy; {new Date().getFullYear()} Ha-kavod 97. {activeLocale === 'en' ? 'All rights reserved.' : 'Tous droits réservés.'}</span>
            <Link to="/privacy-policy" className="hover:text-white transition-colors underline decoration-neutral-800 underline-offset-4">
              {t('privacy_policy')}
            </Link>
          </div>
          
          {/* Logos de paiement */}
          <div className="flex gap-2 items-center opacity-70 hover:opacity-100 transition-opacity">
            {/* Orange Money */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="Orange Money">
              <img src="/orange.png" alt="Orange Money" className="h-4.5 w-auto object-contain" />
            </div>
            {/* MTN */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="MTN Mobile Money">
              <img src="/momo.png" alt="MTN MoMo" className="h-4.5 w-auto object-contain" />
            </div>
            {/* Moov */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="Moov Money">
              <img src="/moov.png" alt="Moov Money" className="h-4.5 w-auto object-contain" />
            </div>
            {/* Wave */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="Wave">
              <img src="/wave.png" alt="Wave" className="h-5 w-auto object-contain" />
            </div>
            {/* Visa */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="Visa">
              <svg className="h-2.5 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10.15 11.24L11.52 3.12H9.33L7.96 11.24H10.15ZM17.15 3.32C16.73 3.15 15.93 2.97 14.99 2.97C12.78 2.97 11.22 4.09 11.2 5.68C11.18 6.86 12.28 7.52 13.13 7.91C14 8.32 14.3 8.59 14.3 8.97C14.29 9.54 13.57 9.8 12.92 9.8C12.01 9.8 11.49 9.56 11.07 9.38L10.74 10.87C11.17 11.06 12.11 11.23 13.09 11.23C15.42 11.23 16.94 10.14 16.96 8.44C16.98 7.02 15.89 6.27 14.88 5.81C14.05 5.4 13.75 5.15 13.75 4.83C13.75 4.34 14.36 4.06 14.97 4.06C15.7 4.06 16.23 4.19 16.63 4.36L17.15 3.32ZM22.5 3.12H20.42C19.78 3.12 19.34 3.3 19.06 3.93L15.98 11.24H18.27L18.73 10.02H21.52L21.78 11.24H23.78L22.5 3.12ZM19.36 8.36L20.49 5.37L21.14 8.36H19.36ZM6.35 3.12L4.08 8.65L3.84 7.42C3.42 5.92 2.1 3.93 0.6 3.16L2.83 11.23H5.13L8.55 3.12H6.35Z" fill="#1434CB"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="Mastercard">
              <svg className="h-4 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="8" cy="7.5" r="6" fill="#EB001B" />
                <circle cx="16" cy="7.5" r="6" fill="#F79E1B" />
                <path d="M12 2.58A5.992 5.992 0 0 1 14 7.5c0 1.94-.92 3.67-2.35 4.77A5.993 5.993 0 0 1 10 7.5c0-1.94.92-3.67 2.35-4.77z" fill="#FF5F00" />
              </svg>
            </div>
            {/* American Express */}
            <div className="w-10 h-6.5 flex items-center justify-center bg-transparent" title="American Express">
              <svg className="h-2.5 w-auto" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="24" height="15" rx="1.5" fill="#016FD0" />
                <text x="12" y="10" fill="white" fontSize="5.5" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">AMEX</text>
              </svg>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Routes de la boutique client encapsulées dans le layout commun */}
      {storefrontRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<StorefrontLayout>{route.element}</StorefrontLayout>}
        />
      ))}

      {/* Routes d'administration (pas de layout storefront client) */}
      {dashboardRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
