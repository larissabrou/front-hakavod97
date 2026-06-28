import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, CheckCircle } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useFavorites } from '../../hooks/useFavorites';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import productService from '../../services/api/productService';
import { adaptProduct } from './Catalog';
import ProductLoader from '../../components/ui/ProductLoader';
import { translateColor } from '../../services/translations';

const MOCK_PRODUCT = {
  id: 1,
  name: 'Derby Oxford Cuir Grainé',
  slug: 'derby-oxford-cuir-graine',
  price: 125000,
  old_price: 150000,
  brand: 'Ha-Kavod 97',
  description: 'L\'élégance à l\'état pur. Confectionné en cuir grainé pleine fleur, ce Derby Oxford incarne la sobriété raffinée qui définit Ha-Kavod 97. La semelle en cuir et la doublure intérieure garantissent un confort incomparable.',
  colors: [
    { name: 'Bordeaux', code: '#540C14' },
    { name: 'Noir', code: '#17070A' },
    { name: 'Or', code: '#C5A059' }
  ],
  sizes: ['39', '40', '41', '42', '43', '44'],
  images: [
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?w=600&auto=format&fit=crop&q=80'
  ],
  variants: [
    { id: 101, color: { name: 'Bordeaux', hex_code: '#540C14' }, size: { name: '40' }, stock: 5 },
    { id: 102, color: { name: 'Noir', hex_code: '#17070A' }, size: { name: '40' }, stock: 3 },
    { id: 103, color: { name: 'Or', hex_code: '#C5A059' }, size: { name: '40' }, stock: 2 }
  ]
};

const CONTENT = {
  fr: {
    notify_alert_success: "Votre demande d'alerte a bien été enregistrée.",
    loading_product_detail: "Chargement de la fiche produit...",
    product_load_error: "Impossible de charger le produit depuis l'API. Vérifiez la connexion backend.",
    return_to_catalog: "Retour au catalogue",
    product_not_found: "Le produit demandé n'existe pas.",
    collection: "Collection",
    view_in_color: "Voir en {color}",
    stock_very_limited: "Stock très limité !",
    hurry_only_items_left: "Dépêchez-vous ! Plus que {count} article{plural} disponible{plural} dans cette taille/couleur.",
    out_of_stock_desc: "Cet article n'est plus disponible dans cette combinaison de taille et de couleur.",
    notify_stock_return: "M'avertir du retour en stock",
    notify_stock_desc: "Laissez-nous votre adresse e-mail ou numéro de téléphone et nous vous préviendrons en priorité dès que la taille {size} en {color} sera de retour.",
    notify_stock_success: "Parfait ! Nous vous enverrons une notification dès le retour en stock.",
    email_or_phone_placeholder: "Votre e-mail ou téléphone",
    validate: "Valider",
    in_stock_count_delivery: "En stock : {count} articles disponibles (Livraison rapide)",
    in_stock_single_delivery: "En stock : 1 article disponible (Livraison rapide)",
    remove_from_favorites: "Retirer des favoris",
    add_to_favorites: "Ajouter aux favoris",
    free_delivery_terms: "Livraison Standard gratuite dès 35 000 F CFA (50 €) d'achat",
    free_returns_terms: "Retours gratuits sous 30 jours",
    secure_payment_terms: "Paiement sécurisé et crypté SSL"
  },
  en: {
    notify_alert_success: "Your alert request has been successfully registered.",
    loading_product_detail: "Loading product details...",
    product_load_error: "Unable to load product from the API. Check backend connection.",
    return_to_catalog: "Return to catalog",
    product_not_found: "The requested product does not exist.",
    collection: "Collection",
    view_in_color: "View in {color}",
    stock_very_limited: "Very limited stock!",
    hurry_only_items_left: "Hurry up! Only {count} item{plural} left in this size/color.",
    out_of_stock_desc: "This item is no longer available in this size and color combination.",
    notify_stock_return: "Notify me when back in stock",
    notify_stock_desc: "Leave us your email address or phone number and we will notify you as a priority as soon as size {size} in {color} is back.",
    notify_stock_success: "Perfect! We will send you a notification when it is back in stock.",
    email_or_phone_placeholder: "Your email or phone",
    validate: "Submit",
    in_stock_count_delivery: "In stock: {count} items available (Fast delivery)",
    in_stock_single_delivery: "In stock: 1 item available (Fast delivery)",
    remove_from_favorites: "Remove from favorites",
    add_to_favorites: "Add to favorites",
    free_delivery_terms: "Free Standard delivery on orders over 35,000 F CFA (50 €)",
    free_returns_terms: "Free returns within 30 days",
    secure_payment_terms: "Secure and SSL-encrypted payment"
  }
};

export const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart, showToast } = useCart();
  const { formatPrice, activeLocale, t } = useSettings();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { customerUser } = useCustomerAuth();

  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [notifyContact, setNotifyContact] = useState('');
  const [isNotifySubmitted, setIsNotifySubmitted] = useState(false);
  const notifyInputRef = useRef(null);

  useEffect(() => {
    if (customerUser) {
      setNotifyContact(customerUser.email || customerUser.phone || '');
    }
  }, [customerUser]);

  useEffect(() => {
    setIsNotifySubmitted(false);
  }, [selectedSize, selectedColor]);

  const handleNotifyClick = () => {
    if (notifyInputRef.current) {
      notifyInputRef.current.focus();
      notifyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!notifyContact) return;

    const requestKey = `notify_stock_${product.id}_${selectedColor}_${selectedSize}`;
    const date = new Date().toISOString();
    const payload = {
      contact: notifyContact,
      date,
      variantId: selectedVariant?.id
    };
    localStorage.setItem(requestKey, JSON.stringify(payload));

    // Also append to global stock_notifications list for Admin Dashboard management
    try {
      const storedList = localStorage.getItem('stock_notifications');
      let list = [];
      if (storedList) {
        list = JSON.parse(storedList);
      }
      // Check if we already have this identical request to avoid duplicates
      const isDuplicate = list.some(
        item => item.product_id === product.id &&
                item.color === selectedColor &&
                item.size === selectedSize &&
                item.contact.trim().toLowerCase() === notifyContact.trim().toLowerCase()
      );
      if (!isDuplicate) {
        list.push({
          id: Date.now() + Math.random().toString(36).substr(2, 5),
          product_id: product.id,
          product_name: product.name || product.title || 'Produit',
          color: selectedColor,
          size: selectedSize,
          contact: notifyContact,
          date,
          status: 'pending' // pending, notified
        });
        localStorage.setItem('stock_notifications', JSON.stringify(list));
      }
    } catch (err) {
      console.error("Failed to save global stock notification:", err);
    }

    setIsNotifySubmitted(true);
    showToast(c.notify_alert_success, "success");
  };

  const selectedVariant = product?.variants?.find(v => {
    const vColor = v.color?.name || v.color;
    const vSize = v.size?.name || v.size;
    return vColor === selectedColor && vSize === selectedSize;
  });
  const maxStock = selectedVariant ? Number(selectedVariant.stock) : 0;

  const getSizeStock = (sizeName) => {
    const variant = product?.variants?.find(v => {
      const vColor = v.color?.name || v.color;
      const vSize = v.size?.name || v.size;
      return vColor === selectedColor && vSize === sizeName;
    });
    return variant ? Number(variant.stock) : 0;
  };

  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const variant = product.variants?.find(v => {
        const vColor = v.color?.name || v.color;
        const vSize = v.size?.name || v.size;
        return vColor === selectedColor && vSize === selectedSize;
      });
      const stock = variant ? Number(variant.stock) : 0;
      if (stock <= 0) {
        setQuantity(0);
      } else {
        setQuantity(1);
      }
    }
  }, [selectedColor, selectedSize, product]);

  // S'assurer de sélectionner une taille disponible si la couleur change et que la taille actuelle est en rupture
  useEffect(() => {
    if (product && selectedColor) {
      const colorVariants = product.variants?.filter(v => {
        const vColor = v.color?.name || v.color;
        return vColor === selectedColor;
      }) || [];
      
      const currentVariant = colorVariants.find(v => {
        const vSize = v.size?.name || v.size;
        return vSize === selectedSize;
      });
      
      if (!currentVariant || Number(currentVariant.stock) <= 0) {
        const firstAvailableVariant = colorVariants.find(v => Number(v.stock) > 0);
        if (firstAvailableVariant) {
          const newSize = firstAvailableVariant.size?.name || firstAvailableVariant.size;
          setSelectedSize(newSize);
        }
      }
    }
  }, [selectedColor, product]);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(id);
        const apiProduct = res?.data ?? res;
        if (apiProduct) {
          const adapted = adaptProduct(apiProduct);
          
          // Parse color links from description
          const rawDesc = adapted.description || '';
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
          adapted.description = cleanDesc;
          adapted.colorLinks = parsedLinks;

          setProduct(adapted);
          setIsDemoMode(false);

          // Save to recently viewed
          try {
            const viewed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
            const filtered = viewed.filter(p => p.id !== adapted.id);
            filtered.unshift(adapted);
            localStorage.setItem('recently_viewed_products', JSON.stringify(filtered.slice(0, 10)));
          } catch (e) {
            console.error("Erreur lors de la sauvegarde des produits consultés :", e);
          }
        } else {
          throw new Error(c.product_not_found);
        }
      } catch (err) {
        console.error("Failed to load product from API.", err);
        setError(c.product_load_error);
        setProduct(null);
        setIsDemoMode(false);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduct();
    }
  }, [id, activeLocale]);

  // Initialiser les choix par défaut une fois le produit chargé
  useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || product.image || '');
      setSelectedColor(product.colors?.[0]?.name || '');
      setSelectedSize(product.sizes?.[0] || '');
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, selectedSize, selectedColor, selectedVariant?.id);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20">
        <ProductLoader text={c.loading_product_detail} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-neutral-500">
        <p>{error}</p>
        <Link to="/catalog" className="text-accent underline mt-4 block">{c.return_to_catalog}</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center text-neutral-500">
        <p>{c.product_not_found}</p>
        <Link to="/catalog" className="text-accent underline mt-4 block">{c.return_to_catalog}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-10 animate-fade-in">
      {/* Breadcrumbs */}
      <div className="flex gap-2 text-xs text-neutral-400 font-medium mb-8 text-left">
        <Link to="/" className="hover:text-accent">{t('home')}</Link>
        <span>/</span>
        <Link to="/catalog" className="hover:text-accent">{c.collection}</Link>
        <span>/</span>
        <span className="text-neutral-600 font-semibold">{product.name}</span>
        {isDemoMode && <span className="text-orange-500 font-semibold ml-2">{activeLocale === 'en' || activeLocale === 'eng' ? '(Demo Mode)' : '(Mode Démo)'}</span>}
      </div>

      <div className="flex flex-col lg:flex-row gap-12 text-left">
        {/* Galerie d'Images */}
        <div className="flex-1 flex flex-col md:flex-row gap-4 animate-slide-left">
          {/* Vignettes à gauche */}
          <div className="flex md:flex-col gap-2 order-2 md:order-1">
            {product.images?.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`w-16 h-20 border rounded-xs overflow-hidden ${
                  activeImage === img ? 'border-primary ring-1 ring-primary' : 'border-neutral-200'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Image principale */}
          <div className="flex-1 aspect-[3/4] bg-neutral-100 rounded-sm overflow-hidden order-1 md:order-2">
            <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Détails Achat */}
        <div className="w-full lg:w-[450px] flex flex-col animate-slide-right">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
            {product.brand}
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-2 mb-3">
            {product.name}
          </h1>

          {/* Prix */}
          <div className="flex items-baseline gap-3 pb-6 border-b border-neutral-100">
            <span className="text-2xl font-bold text-neutral-900">{formatPrice(product.price)}</span>
            {product.old_price && (
              <span className="text-base text-neutral-400 line-through">
                {formatPrice(product.old_price)}
              </span>
            )}
          </div>

          {/* Sélection de Couleur */}
          {product.colors && product.colors.length > 0 && (
            <div className="py-6 border-b border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
                {t('color')} : <span className="text-neutral-900 font-semibold">{translateColor(selectedColor, activeLocale)}</span>
              </h4>
              <div className="flex gap-3 items-center flex-wrap">
                {/* Couleurs locales du produit actuel */}
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center transition-all cursor-pointer ${
                      selectedColor === color.name ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: color.code }}
                    title={translateColor(color.name, activeLocale)}
                  />
                ))}

                {/* Liaisons vers d'autres couleurs (produits différents) */}
                {(product.colorLinks || []).map((link) => (
                  <Link
                    key={link.product_id}
                    to={`/product/${link.product_id}`}
                    className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center hover:scale-110 transition-all relative group cursor-pointer"
                    style={{ backgroundColor: link.color_code }}
                    title={c.view_in_color.replace('{color}', translateColor(link.color_name, activeLocale))}
                  >
                    {/* Indicateur point blanc pour signifier la redirection */}
                    <span className="w-1.5 h-1.5 bg-white rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Sélection de Taille */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="py-6 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {t('size')} : <span className="text-neutral-900 font-semibold">{selectedSize}</span>
                </h4>
                <button className="text-xs text-neutral-500 underline font-semibold hover:text-accent">
                  {t('size_guide')}
                </button>
              </div>
              <div className="flex gap-2">
                {product.sizes.map((size) => {
                  const sizeStock = getSizeStock(size);
                  const isSelected = selectedSize === size;
                  const isOutOfStock = sizeStock === 0;

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`relative min-w-12 h-11 border text-sm font-semibold flex items-center justify-center transition-all rounded-xs cursor-pointer ${
                        isOutOfStock
                          ? isSelected
                            ? 'border-neutral-500 bg-neutral-100 text-neutral-850'
                            : 'border-neutral-200 text-neutral-300 bg-neutral-50/50 hover:border-neutral-400 hover:text-neutral-500'
                          : isSelected
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:bg-neutral-50/20'
                      }`}
                    >
                      {size}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[140%] h-[1.5px] bg-neutral-300 rotate-45 transform origin-center" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Stock restant (Trendyol-style alert box) */}
          {maxStock > 0 && maxStock <= 5 && (
            <div className="my-5 p-3.5 bg-neutral-100/70 border border-accent/30 flex items-center gap-3 animate-pulse rounded-sm text-left shadow-2xs">
              <div className="bg-accent text-white rounded-full p-1.5 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-black text-neutral-900 uppercase tracking-wide">{c.stock_very_limited}</p>
                <p className="text-[11px] font-semibold text-neutral-700 mt-0.5">
                  {c.hurry_only_items_left.replace('{count}', String(maxStock)).replace(/\{plural\}/g, maxStock > 1 ? 's' : '')}
                </p>
              </div>
            </div>
          )}
          
          {maxStock === 0 && (
            <div className="my-5 flex flex-col gap-4">
              <div className="p-3.5 bg-primary/5 border border-primary/20 flex items-center gap-3 rounded-sm text-left shadow-2xs">
                <div className="bg-primary text-white rounded-full p-1.5 shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-black text-primary-dark uppercase tracking-wide">{t('out_of_stock')}</p>
                  <p className="text-[11px] font-semibold text-neutral-700 mt-0.5">
                    {c.out_of_stock_desc}
                  </p>
                </div>
              </div>

              {/* Formulaire M'avertir (Trendyol Style) */}
              <div className="p-4 bg-neutral-100/50 border border-neutral-250/70 rounded-sm text-left">
                <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <svg className="w-4 h-4 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {c.notify_stock_return}
                </p>
                <p className="text-[11px] text-neutral-500 mb-3 leading-relaxed">
                  {c.notify_stock_desc.replace('{size}', selectedSize).replace('{color}', translateColor(selectedColor, activeLocale))}
                </p>
                {isNotifySubmitted ? (
                  <div className="text-[11px] font-semibold text-neutral-800 bg-neutral-100/70 border border-accent/30 p-3 rounded-xs flex items-center gap-2 animate-fade-in">
                    <CheckCircle className="w-4.5 h-4.5 text-accent shrink-0" />
                    {c.notify_stock_success}
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input
                      ref={notifyInputRef}
                      type="text"
                      placeholder={c.email_or_phone_placeholder}
                      value={notifyContact}
                      onChange={(e) => setNotifyContact(e.target.value)}
                      required
                      className="flex-1 bg-white border border-neutral-300 text-xs px-3 py-2 rounded-xs focus:outline-none focus:border-primary text-neutral-800"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-light text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-xs transition-colors cursor-pointer shrink-0"
                    >
                      {c.validate}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
          
          {maxStock > 5 && (
            <div className="my-5 p-3 bg-neutral-100/50 border border-neutral-200/50 flex items-center gap-2.5 rounded-sm text-left shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="text-[11px] font-semibold text-neutral-700">
                {c.in_stock_count_delivery.replace('{count}', String(maxStock))}
              </span>
            </div>
          )}
        </div>
      )}

          {/* Sélecteur de Quantité et Ajout Panier */}
          <div className="flex gap-4 py-8">
            {maxStock > 0 && (
              <div className="flex border border-neutral-300 rounded-sm">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 text-neutral-500 font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-10 text-center font-semibold text-neutral-800 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={quantity >= maxStock}
                  className="px-3 text-neutral-500 font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  +
                </button>
              </div>
            )}

            {maxStock > 0 ? (
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary hover:bg-neutral-800 text-white font-bold flex items-center justify-center gap-3 py-3 transition-colors duration-200 rounded-sm shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-5 h-5" />
                {t('add_to_cart')}
              </button>
            ) : (
              <button
                onClick={handleNotifyClick}
                className="flex-1 bg-neutral-900 hover:bg-neutral-850 text-white font-bold flex items-center justify-center gap-3 py-3 transition-colors duration-200 rounded-sm shadow-md cursor-pointer animate-pulse"
              >
                <svg className="w-5 h-5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {c.notify_stock_return}
              </button>
            )}

            <button
              onClick={() => toggleFavorite(product)}
              className="p-3 border border-neutral-300 hover:border-neutral-400 rounded-sm flex items-center justify-center transition-colors cursor-pointer"
              title={isFavorite(product.id) ? c.remove_from_favorites : c.add_to_favorites}
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isFavorite(product.id) ? "fill-red-500 text-red-500" : "text-neutral-600 hover:text-red-500"
                }`}
              />
            </button>
          </div>

          {/* Réassurance de Livraison */}
          <div className="flex flex-col gap-3.5 bg-neutral-50 p-4 rounded-sm border border-neutral-100 text-xs text-neutral-500 font-medium">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-neutral-700" />
              <span>{c.free_delivery_terms}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-neutral-700" />
              <span>{c.free_returns_terms}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-neutral-700" />
              <span>{c.secure_payment_terms}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

