import React, { createContext, useState, useEffect } from 'react';
import customerService from '../services/api/customerService';

const getProductImage = (product) => {
  if (!product) return '';
  
  const getApiBase = () => {
    const apiUrl = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const normalizeImage = (image) => {
    if (!image) return null;
    const url = typeof image === 'string' ? image : image.url || image.path || image.src || image.public_url || null;
    if (!url) return null;
    
    const apiBase = getApiBase();
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname.includes('hakavod97.com') || parsedUrl.hostname.includes('localhost') || parsedUrl.hostname.includes('127.0.0.1')) {
          return `${apiBase}${parsedUrl.pathname}${parsedUrl.search}`;
        }
      } catch (e) {}
      return url;
    }
    return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const images = Array.isArray(product.images) ? product.images : [];
  const primaryImg = images.find(img => img && img.is_primary) || images[0] || product.image || product.image_url;
  return normalizeImage(primaryImg) || 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80';
};

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Récupérer le panier initial depuis LocalStorage
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Synchroniser le panier avec le backend (invité ou connecté)
  useEffect(() => {
    const syncCartWithBackend = async () => {
      const token = localStorage.getItem('customer_token');
      try {
        const backendCart = await customerService.getCart();
        if (backendCart && Array.isArray(backendCart.items)) {
          // Si on est invité et que le panier serveur est vide mais qu'on a des articles en local
          if (!token && backendCart.items.length === 0) {
            const savedCartStr = localStorage.getItem('cart');
            const savedCart = savedCartStr ? JSON.parse(savedCartStr) : [];
            if (savedCart.length > 0) {
              console.log("Panier serveur invité vide. Envoi des articles locaux au serveur...");
              for (const item of savedCart) {
                await customerService.addToCart(item.id, item.productVariantId, item.quantity);
              }
              // Récupérer le panier mis à jour du serveur
              const updatedCart = await customerService.getCart();
              if (updatedCart && Array.isArray(updatedCart.items)) {
                updateLocalCartFromBackend(updatedCart.items);
              }
              return;
            }
          }
          
          // Sinon, on applique le panier serveur (fusionné ou à jour) au panier local
          updateLocalCartFromBackend(backendCart.items);
        }
      } catch (e) {
        console.error("Erreur de synchronisation du panier avec le serveur", e);
      }
    };

    syncCartWithBackend();

    const handleLoginSync = async () => {
      // 1. Si on a un panier local, on tente de le fusionner
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          const itemsToMerge = JSON.parse(localCart).map(item => ({
            product_id: item.id,
            product_variant_id: item.productVariantId,
            quantity: item.quantity
          })).filter(i => i.product_id && i.product_variant_id);

          if (itemsToMerge.length > 0) {
            await customerService.mergeCart(itemsToMerge);
          }
          // Nettoyer le guest token puisqu'on est connecté maintenant
          localStorage.removeItem('guest_token');
        } catch (e) {
          console.error("Erreur lors de la fusion du panier", e);
        }
      }
      // 2. On récupère le panier final du serveur
      syncCartWithBackend();
    };
    window.addEventListener('customer-login-success', handleLoginSync);
    return () => window.removeEventListener('customer-login-success', handleLoginSync);
  }, []);

  useEffect(() => {
    // Sauvegarder le panier dans LocalStorage à chaque modification
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Met à jour l'état local du panier avec les données formatées du serveur
  const updateLocalCartFromBackend = (items) => {
    if (!items || !Array.isArray(items)) return;
    const formattedItems = items.map(item => {
      const product = item.product || {};
      const variant = item.variant || {};
      const variantId = item.product_variant_id;
      const matchingVariant = product.variants?.find(v => v.id === variantId) || variant;
      const maxStock = matchingVariant ? Number(matchingVariant.stock) : 10;
      
      const sizeName = item.selected_size || variant?.size?.name || '';
      const colorName = item.selected_color || variant?.color?.name || '';

      return {
        cartItemId: item.id || `${item.product_id}-${sizeName}-${colorName}`,
        id: item.product_id,
        productVariantId: item.product_variant_id,
        name: product.name || item.name || 'Produit',
        slug: product.slug || item.slug || '',
        price: item.price || product.price || 0,
        image: getProductImage(product) || item.image || '',
        selectedSize: sizeName,
        selectedColor: colorName,
        quantity: item.quantity,
        maxStock: maxStock,
      };
    });
    setCartItems(formattedItems);
  };

  // Ajouter un produit au panier
  const addToCart = (product, quantity = 1, selectedSize = '', selectedColor = '', productVariantId = null) => {
    const variantId = productVariantId || product.variants?.[0]?.id || null;
    const selectedVariant = product.variants?.find(v => v.id === variantId) || product.variants?.[0];
    const variantStock = selectedVariant ? Number(selectedVariant.stock) : 10;
    const maxLimit = variantStock;

    const cartItemId = `${product.id}-${selectedSize}-${selectedColor}`;
    const itemExists = cartItems.find((item) => item.cartItemId === cartItemId);

    let actualAddedQuantity = quantity;
    let limitReached = false;
    let adjusted = false;

    if (itemExists) {
      const currentQty = itemExists.quantity;
      if (currentQty >= maxLimit) {
        limitReached = true;
        actualAddedQuantity = 0;
      } else if (currentQty + quantity > maxLimit) {
        actualAddedQuantity = maxLimit - currentQty;
        adjusted = true;
      }
    } else {
      if (quantity > maxLimit) {
        actualAddedQuantity = maxLimit;
        adjusted = true;
      }
    }

    if (limitReached) {
      showToast(`Stock insuffisant : vous avez déjà ajouté le maximum d'articles disponibles (${maxLimit}) pour cette taille/couleur.`, 'warning');
      return;
    }

    if (adjusted) {
      showToast(`La quantité pour cet article a été limitée au stock disponible (${maxLimit} max).`, 'warning');
    } else {
      showToast(`"${product.name}" a été ajouté au panier.`, 'success');
    }

    if (actualAddedQuantity > 0) {
      // Ajout réactif local immédiat
      setCartItems((prevItems) => {
        const itemExistsInCallback = prevItems.find((item) => item.cartItemId === cartItemId);
        if (itemExistsInCallback) {
          return prevItems.map((item) =>
            item.cartItemId === cartItemId
              ? { ...item, quantity: item.quantity + actualAddedQuantity }
              : item
          );
        }
        return [
          ...prevItems,
          {
            cartItemId,
            id: product.id,
            productVariantId: variantId,
            name: product.name,
            slug: product.slug,
            price: product.price,
            image: product.image_url || product.image,
            selectedSize,
            selectedColor,
            quantity: actualAddedQuantity,
            maxStock: variantStock,
          },
        ];
      });

      // Synchronisation avec l'API
      customerService.addToCart(product.id, variantId, actualAddedQuantity)
        .then(res => {
          const items = res?.data?.items || res?.items;
          if (items) updateLocalCartFromBackend(items);
        })
        .catch(e => {
          console.error("Erreur de sauvegarde de l'article sur le panier distant", e);
        });
    }
  };

  // Retirer un élément du panier
  const removeFromCart = (cartItemId) => {
    // Retrait réactif local immédiat
    setCartItems((prevItems) => prevItems.filter((item) => item.cartItemId !== cartItemId));
    
    // Synchronisation avec l'API
    customerService.removeFromCart(cartItemId)
      .then(res => {
        const items = res?.data?.items || res?.items;
        if (items) updateLocalCartFromBackend(items);
      })
      .catch(e => {
        console.error("Erreur lors de la suppression de l'article du panier serveur", e);
      });
  };

  // Mettre à jour la quantité d'un élément du panier
  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
    customerService.updateCartItem(cartItemId, quantity)
      .then(res => {
        const items = res?.data?.items || res?.items;
        if (items) updateLocalCartFromBackend(items);
      })
      .catch(e => {
        console.error("Erreur de mise à jour de la quantité sur le serveur", e);
      });
  };

  // Vider complètement le panier (après validation de commande)
  const clearCart = () => {
    setCartItems([]);
    customerService.clearCart()
      .then(res => {
        localStorage.removeItem('guest_token');
      })
      .catch(e => {
        console.error("Erreur lors du vidage du panier serveur", e);
      });
  };

  // Calcul du montant total
  const getCartSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  // Calcul du nombre d'articles
  const getCartCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartSubtotal,
        getCartCount,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
