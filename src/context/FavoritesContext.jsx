import React, { createContext, useState, useEffect } from 'react';
import customerService from '../services/api/customerService';

export const FavoritesContext = createContext(null);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Erreur lors de la récupération des favoris", error);
      return [];
    }
  });

  // Synchroniser les favoris avec le backend si l'utilisateur est connecté
  useEffect(() => {
    const syncFavoritesWithBackend = async () => {
      const token = localStorage.getItem('customer_token');
      if (token) {
        try {
          const backendFavorites = await customerService.getFavorites();
          // Supposons que le format du backend renvoie une liste de produits favoris ou d'items avec produit associé
          if (Array.isArray(backendFavorites)) {
            const formattedFavorites = backendFavorites.map(item => {
              const product = item.product || item;
              return {
                id: product.id || item.id,
                name: product.name || item.name,
                slug: product.slug || item.slug || '',
                price: product.price || item.price || 0,
                image: product.image_url || product.image || item.image || '',
                brand: product.brand || item.brand || 'Ha-kavod 97'
              };
            });
            setFavorites(formattedFavorites);
          }
        } catch (e) {
          console.error("Erreur de récupération des favoris depuis le serveur", e);
        }
      }
    };

    syncFavoritesWithBackend();

    const handleLoginSync = () => {
      syncFavoritesWithBackend();
    };
    window.addEventListener('customer-login-success', handleLoginSync);
    return () => window.removeEventListener('customer-login-success', handleLoginSync);
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = async (product) => {
    // 1. Mise à jour optimiste du state local
    setFavorites((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      } else {
        return [...prev, product];
      }
    });

    // 2. Synchronisation avec le backend si connecté
    const token = localStorage.getItem('customer_token');
    if (token) {
      try {
        const isCurrentlyFavorite = isFavorite(product.id);
        if (isCurrentlyFavorite) {
          // On veut le retirer
          await customerService.removeFavorite(product.id);
        } else {
          // On veut l'ajouter
          await customerService.addFavorite(product.id);
        }
      } catch (e) {
        console.error("Erreur lors de la synchronisation du favori avec le serveur", e);
        // Note: idéalement, on devrait annuler la mise à jour optimiste en cas d'erreur
      }
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((item) => item.id === productId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, getFavoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};
