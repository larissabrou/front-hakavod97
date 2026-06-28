import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../services/api/apiClient';
import translate from '../services/translations';

export const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
  base_currency: "XOF",
  checkout_currency: "XOF",
  default_currency: "XOF",
  currencies: [
    { code: "XOF", symbol: "F CFA", name: "Franc CFA", decimals: 0 },
    { code: "USD", symbol: "$", name: "Dollar américain", decimals: 2 },
    { code: "EUR", symbol: "€", name: "Euro", decimals: 2 }
  ],
  exchange_rates: {
    XOF: 1,
    EUR: 0.00152449,
    USD: 0.00176338
  },
  locales: [
    { code: "fr", name: "Français", native: "Français" },
    { code: "en", name: "English", native: "English" }
  ]
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [activeCurrency, setActiveCurrency] = useState(() => {
    return localStorage.getItem('active_currency') || 'XOF';
  });
  const [activeLocale, setActiveLocale] = useState(() => {
    return localStorage.getItem('active_locale') || 'fr';
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiClient.get('/store/settings', {
          params: { lang: activeLocale }
        });
        if (response.data?.success && response.data?.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error("Impossible de charger les paramètres de l'API, utilisation du fallback local.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [activeLocale]);

  // Persister les choix de l'utilisateur
  const changeCurrency = (currencyCode) => {
    setActiveCurrency(currencyCode);
    localStorage.setItem('active_currency', currencyCode);
  };

  const changeLocale = (localeCode) => {
    setActiveLocale(localeCode);
    localStorage.setItem('active_locale', localeCode);
  };

  // Convertir et formater un prix en XOF dans la devise active
  const formatPrice = (amountInXOF) => {
    if (amountInXOF === undefined || amountInXOF === null) return '0 F CFA';
    
    const rates = settings.exchange_rates || DEFAULT_SETTINGS.exchange_rates;
    const rate = rates[activeCurrency] || 1;
    const converted = amountInXOF * rate;
    
    const activeCurConfig = settings.currencies?.find(c => c.code === activeCurrency) || 
                            DEFAULT_SETTINGS.currencies.find(c => c.code === activeCurrency);
    
    const decimals = activeCurConfig !== undefined ? activeCurConfig.decimals : 2;
    const symbol = activeCurConfig !== undefined ? activeCurConfig.symbol : activeCurrency;

    // Formater le nombre en notation française (séparateur d'espace pour les milliers)
    const formattedNum = Number(converted).toLocaleString('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (activeCurrency === 'USD') {
      return `${symbol}${formattedNum}`;
    }
    return `${formattedNum} ${symbol}`;
  };

  // Fonction de traduction
  const t = (key) => translate(key, activeLocale);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        activeCurrency,
        changeCurrency,
        activeLocale,
        changeLocale,
        formatPrice,
        t,
        exchangeRates: settings.exchange_rates || DEFAULT_SETTINGS.exchange_rates,
        currencies: settings.currencies || DEFAULT_SETTINGS.currencies,
        locales: settings.locales || DEFAULT_SETTINGS.locales,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
