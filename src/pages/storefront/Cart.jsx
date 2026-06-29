import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import productService from '../../services/api/productService';
import { adaptProduct } from './Catalog';
import QuickAddModal from '../../components/product/QuickAddModal';
import ProductCard from '../../components/product/ProductCard';



const CONTENT = {
  fr: {
    stock_warning: "Désolé, il n'y a que {count} article{plural} en stock pour cette taille/couleur.",
    removed_from_cart: "\"{name}\" a été retiré de votre panier.",
    articles: "articles",
    article: "article",
    summary: "Résumé de la commande",
    subtotal: "Sous-total",
    shipping: "Frais de port",
    free: "Gratuit",
    add_more_for_free_shipping: "Ajoutez {amount} d'achats pour profiter de la livraison gratuite.",
    total: "Total",
    added: "Ajouté ✓",
    add_to_cart_short: "+ Ajouter au panier",
    no_deals: "Aucun bon plan disponible pour le moment",
    no_recent: "Vos articles consultés récemment s'afficheront ici"
  },
  en: {
    stock_warning: "Sorry, only {count} item{plural} in stock for this size/color.",
    removed_from_cart: "\"{name}\" has been removed from your cart.",
    articles: "items",
    article: "item",
    summary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Shipping cost",
    free: "Free",
    add_more_for_free_shipping: "Add {amount} more to enjoy free shipping.",
    total: "Total",
    added: "Added ✓",
    add_to_cart_short: "+ Add to cart",
    no_deals: "No hot deals available at the moment",
    no_recent: "Your recently viewed items will display here"
  }
};

export const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartSubtotal, addToCart, getCartCount, showToast } = useCart();
  const { formatPrice, activeLocale, t } = useSettings();
  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];
  const [successMessage, setSuccessMessage] = useState('');

  const handleIncreaseCartQuantity = (item) => {
    const maxLimit = item.maxStock || 10;
    if (item.quantity >= maxLimit) {
      showToast(c.stock_warning.replace('{count}', String(maxLimit)).replace('{plural}', maxLimit > 1 ? 's' : ''), 'warning');
      return;
    }
    updateQuantity(item.cartItemId, item.quantity + 1);
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item.cartItemId);
    setSuccessMessage(c.removed_from_cart.replace('{name}', item.name));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setSuccessMessage('');
    }, 4000);
  };
  const [activeTab, setActiveTab] = useState('deals');
  const [addedItems, setAddedItems] = useState({});
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [activeQuickAddProduct, setActiveQuickAddProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productService.getProducts();
        const raw = Array.isArray(res) ? res : [];
        const adapted = raw.map(adaptProduct).filter(Boolean);
        setCatalogProducts(adapted);
      } catch (err) {
        console.error("Impossible de récupérer les produits du catalogue :", err);
      }
    };
    fetchProducts();
  }, [activeLocale]);

  useEffect(() => {
    try {
      const viewed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
      const validViewed = Array.isArray(viewed)
        ? viewed.map(adaptProduct).filter(p => p && p.id)
        : [];
      if (validViewed.length > 0) {
        setRecentlyViewed(validViewed.slice(0, 4));
      } else if (catalogProducts.length > 0) {
        setRecentlyViewed(catalogProducts.slice(4, 8).length > 0 ? catalogProducts.slice(4, 8) : catalogProducts.slice(0, 4));
      } else {
        setRecentlyViewed([]);
      }
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, [catalogProducts]);

  const handleAddProduct = (product) => {
    const hasOptions = (product.sizes?.length > 1) || (product.colors?.length > 1);
    if (hasOptions) {
      setActiveQuickAddProduct(product);
    } else {
      const firstVariant = product.variants?.[0];
      addToCart(
        product, 
        1, 
        product.sizes?.[0] || '', 
        product.colors?.[0]?.name || '',
        firstVariant?.id || null
      );
      setAddedItems(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [product.id]: false }));
      }, 2000);
    }
  };

  const dealsList = catalogProducts.filter(p => p.old_price && Number(p.old_price) > Number(p.price)).slice(0, 4);
  const activeDeals = dealsList.length > 0 ? dealsList : (catalogProducts.slice(0, 4).length > 0 ? catalogProducts.slice(0, 4) : []);
  const activeRecent = recentlyViewed;
  
  const subtotal = getCartSubtotal();
  // Seuil de livraison gratuite à 35 000 F CFA (~50 €), frais de livraison à 3 000 F CFA (~4.5 €)
  const shippingThreshold = 35000;
  const shippingCost = 3000;
  
  const shipping = subtotal >= shippingThreshold || subtotal === 0 ? 0 : shippingCost;
  const total = subtotal + shipping;


  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-10">
      <h1 className="text-2xl font-bold text-neutral-900 text-left mb-8 uppercase tracking-wider flex items-baseline gap-2">
        {t('cart')}
        {cartItems.length > 0 && (
          <span className="text-sm font-semibold text-neutral-400 normal-case">
            ({getCartCount()} {getCartCount() > 1 ? c.articles : c.article})
          </span>
        )}
      </h1>

      {successMessage && (
        <div className="bg-primary text-white border-l-4 border-accent p-4 mb-6 rounded-none flex items-center justify-between shadow-md animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4.5 h-4.5 text-accent shrink-0" />
            <span className="text-xs font-semibold uppercase tracking-wider">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-neutral-300 hover:text-white transition-colors p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}



      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 border border-neutral-100 rounded-sm">
          <ShoppingBag className="w-16 h-16 text-neutral-300 mb-4" />
          <p className="text-neutral-500 font-semibold mb-6">{t('cart_empty')}</p>
          <Link
            to="/catalog"
            className="bg-primary hover:bg-neutral-800 text-white font-bold px-8 py-3 text-sm uppercase tracking-wider rounded-sm transition-colors"
          >
            {t('continue_shopping')}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-10 text-left">
          {/* Liste des Articles */}
          <div className="flex-1 flex flex-col gap-5">
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex gap-4 p-4 border border-neutral-100 rounded-sm hover:shadow-xs transition-shadow bg-white"
              >
                {/* Image */}
                <div className="w-20 sm:w-24 aspect-[3/4] bg-neutral-100 rounded-xs overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Détails */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="text-sm sm:text-base font-semibold text-neutral-800 hover:underline line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Variantes */}
                    <div className="flex gap-4 text-xs text-neutral-500 font-medium mt-1">
                      {item.selectedSize && (
                        <span>
                          {t('size')} : <strong className="text-neutral-700">{item.selectedSize}</strong>
                        </span>
                      )}
                      {item.selectedColor && (
                        <span>
                          {t('color')} : <strong className="text-neutral-700">{item.selectedColor}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantité & Prix */}
                  <div className="flex justify-between items-center mt-3">
                    {/* Contrôle Quantité */}
                    <div className="flex border border-neutral-200 rounded-sm">
                      <button
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                        className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-50 font-bold cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold text-neutral-800 flex items-center justify-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncreaseCartQuantity(item)}
                        className="px-2.5 py-1 text-neutral-500 hover:bg-neutral-50 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Prix unitaire/total */}
                    <span className="text-base font-bold text-neutral-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Résumé de la Commande */}
          <div className="w-full lg:w-[380px] bg-neutral-50 p-6 border border-neutral-100 rounded-sm h-fit">
            <h3 className="text-lg font-bold text-neutral-900 mb-6 uppercase tracking-wider pb-3 border-b border-neutral-200">
              {c.summary}
            </h3>

            <div className="flex flex-col gap-4 text-sm font-medium text-neutral-600">
              <div className="flex justify-between">
                <span>{c.subtotal}</span>
                <span className="text-neutral-900 font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{c.shipping}</span>
                <span className="text-neutral-900 font-bold">
                  {shipping === 0 ? c.free : formatPrice(shipping)}
                </span>
              </div>

              {shipping > 0 && (
                <div className="text-[11px] text-accent font-semibold mt-1 bg-red-50 p-2.5 rounded-sm border border-red-100">
                  {c.add_more_for_free_shipping.replace('{amount}', formatPrice(shippingThreshold - subtotal))}
                </div>
              )}

              <div className="h-px bg-neutral-200 my-2" />

              <div className="flex justify-between text-base font-bold text-neutral-900">
                <span>{c.total}</span>
                <span className="text-xl text-accent font-extrabold">{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                to="/checkout"
                className="w-full bg-primary hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-2 py-3.5 transition-colors duration-200 rounded-sm shadow-md text-sm uppercase tracking-wider"
              >
                {t('checkout')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Onglets Defacto (Deals & Récemment consultés) */}
      <div className="mt-16 text-left">
        <div className="flex border-b border-neutral-200 mb-8 gap-8 text-xs font-bold uppercase tracking-widest font-sans">
          <button
            onClick={() => setActiveTab('deals')}
            className={`pb-3 transition-all relative ${
              activeTab === 'deals' 
                ? 'text-neutral-950 font-black border-b-2 border-neutral-950' 
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('bons_plans')}
          </button>
          <button
            onClick={() => setActiveTab('recently_viewed')}
            className={`pb-3 transition-all relative ${
              activeTab === 'recently_viewed' 
                ? 'text-neutral-950 font-black border-b-2 border-neutral-950' 
                : 'text-neutral-400 hover:text-neutral-700'
            }`}
          >
            {t('recents')}
          </button>
        </div>

        {activeTab === 'deals' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {activeDeals.length > 0 ? (
              activeDeals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-neutral-200 text-center opacity-50 rounded-sm">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider font-sans">
                  {c.no_deals}
                </span>
              </div>
            )}
          </div>
        )}
         {activeTab === 'recently_viewed' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in">
            {activeRecent.length > 0 ? (
              activeRecent.map((product) => {
                if (!product || !product.id) return null;
                return <ProductCard key={product.id} product={product} />;
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center p-12 border border-dashed border-neutral-200 text-center opacity-50 rounded-sm">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider font-sans">
                  {c.no_recent}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {activeQuickAddProduct && createPortal(
        <QuickAddModal 
          product={activeQuickAddProduct} 
          isOpen={!!activeQuickAddProduct} 
          onClose={() => setActiveQuickAddProduct(null)} 
        />,
        document.body
      )}
    </div>
  );
};

export default Cart;
