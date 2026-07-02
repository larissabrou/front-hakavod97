import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, CheckCircle, ChevronDown, ChevronUp, Ruler } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useFavorites } from '../../hooks/useFavorites';
import { useCustomerAuth } from '../../hooks/useCustomerAuth';
import productService from '../../services/api/productService';
import { adaptProduct } from './Catalog';
import ProductLoader from '../../components/ui/ProductLoader';
import { translateColor } from '../../services/translations';

const CONTENT = {
  fr: {
    notify_alert_success: "Votre demande d'alerte a bien été enregistrée.",
    loading_product_detail: "Chargement de la fiche produit...",
    product_load_error: "Impossible de charger le produit depuis l'API.",
    return_to_catalog: "Retour au catalogue",
    product_not_found: "Le produit demandé n'existe pas.",
    collection: "Collection",
    view_in_color: "Voir en {color}",
    hurry_only_items_left: "Plus que {count} article{plural} disponible{plural}",
    out_of_stock_desc: "Cet article n'est plus disponible dans cette combinaison.",
    notify_stock_return: "M'avertir du retour en stock",
    notify_stock_desc: "Laissez votre e-mail ou téléphone pour être prévenu dès que la taille {size} en {color} est disponible.",
    notify_stock_success: "Parfait ! Notification activée dès le retour en stock.",
    email_or_phone_placeholder: "Votre e-mail ou téléphone",
    validate: "Valider",
    in_stock_msg: "En stock — Expédition sous 24h",
    remove_from_favorites: "Retirer des favoris",
    add_to_favorites: "Ajouter aux favoris",
    free_delivery_terms: "Livraison Standard gratuite dès 35 000 F CFA d'achat",
    free_returns_terms: "Retours gratuits sous 30 jours",
    secure_payment_terms: "Paiement sécurisé et crypté SSL",
    description_label: "Description",
    delivery_label: "Livraison & Retours",
    out_of_stock_label: "Rupture de stock",
  },
  en: {
    notify_alert_success: "Your alert request has been successfully registered.",
    loading_product_detail: "Loading product details...",
    product_load_error: "Unable to load product from the API.",
    return_to_catalog: "Return to catalog",
    product_not_found: "The requested product does not exist.",
    collection: "Collection",
    view_in_color: "View in {color}",
    hurry_only_items_left: "Only {count} item{plural} left",
    out_of_stock_desc: "This item is no longer available in this size and color combination.",
    notify_stock_return: "Notify me when back in stock",
    notify_stock_desc: "Leave your email or phone and we'll notify you when size {size} in {color} is back.",
    notify_stock_success: "Perfect! We'll notify you when it's back in stock.",
    email_or_phone_placeholder: "Your email or phone",
    validate: "Submit",
    in_stock_msg: "In stock — Ships within 24h",
    remove_from_favorites: "Remove from favorites",
    add_to_favorites: "Add to favorites",
    free_delivery_terms: "Free Standard delivery on orders over 35,000 F CFA",
    free_returns_terms: "Free returns within 30 days",
    secure_payment_terms: "Secure and SSL-encrypted payment",
    description_label: "Description",
    delivery_label: "Delivery & Returns",
    out_of_stock_label: "Out of stock",
  }
};

/* ── Accordion ── */
const Accordion = ({ label, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-neutral-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left group cursor-pointer"
      >
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 group-hover:text-primary transition-colors">
          {label}
        </span>
        {open
          ? <ChevronUp className="w-3.5 h-3.5 text-accent shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="pb-5 text-[13px] text-neutral-500 leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
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
    if (customerUser) setNotifyContact(customerUser.email || customerUser.phone || '');
  }, [customerUser]);

  useEffect(() => { setIsNotifySubmitted(false); }, [selectedSize, selectedColor]);

  const handleNotifyClick = () => {
    if (notifyInputRef.current) {
      notifyInputRef.current.focus();
      notifyInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (!notifyContact) return;

    // Sauvegarde locale de confort (historique)
    const key = `notify_stock_${product.id}_${selectedColor}_${selectedSize}`;
    localStorage.setItem(key, JSON.stringify({ contact: notifyContact, date: new Date().toISOString(), variantId: selectedVariant?.id }));
    
    try {
      const list = JSON.parse(localStorage.getItem('stock_notifications') || '[]');
      const dup = list.some(i => i.product_id === product.id && i.color === selectedColor && i.size === selectedSize && i.contact.toLowerCase() === notifyContact.toLowerCase());
      if (!dup) {
        list.push({ id: Date.now(), product_id: product.id, product_name: product.name, color: selectedColor, size: selectedSize, contact: notifyContact, date: new Date().toISOString(), status: 'pending' });
        localStorage.setItem('stock_notifications', JSON.stringify(list));
      }
    } catch (_) {}

    try {
      // Appel à l'API
      await productService.subscribeStockAlert({
        product_id: product.id,
        variant_id: selectedVariant?.id,
        color: selectedColor,
        size: selectedSize,
        contact: notifyContact
      });
      setIsNotifySubmitted(true);
      showToast(c.notify_alert_success, 'success');
    } catch (error) {
      console.error("Erreur lors de la soumission de l'alerte stock:", error);
      // Mode optimiste : on affiche le succès même si l'API échoue (car sauvegardé localement)
      setIsNotifySubmitted(true);
      showToast(c.notify_alert_success, 'success');
    }
  };

  const selectedVariant = product?.variants?.find(v =>
    (v.color?.name || v.color) === selectedColor && (v.size?.name || v.size) === selectedSize
  );
  const maxStock = selectedVariant ? Number(selectedVariant.stock) : 0;

  const getSizeStock = (sizeName) => {
    const v = product?.variants?.find(v =>
      (v.color?.name || v.color) === selectedColor && (v.size?.name || v.size) === sizeName
    );
    return v ? Number(v.stock) : 0;
  };

  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const v = product.variants?.find(v =>
        (v.color?.name || v.color) === selectedColor && (v.size?.name || v.size) === selectedSize
      );
      setQuantity(v && Number(v.stock) > 0 ? 1 : 0);
    }
  }, [selectedColor, selectedSize, product]);

  useEffect(() => {
    if (product && selectedColor) {
      const cvs = product.variants?.filter(v => (v.color?.name || v.color) === selectedColor) || [];
      const cur = cvs.find(v => (v.size?.name || v.size) === selectedSize);
      if (!cur || Number(cur.stock) <= 0) {
        const first = cvs.find(v => Number(v.stock) > 0);
        if (first) setSelectedSize(first.size?.name || first.size);
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
          const rawDesc = adapted.description || '';
          const match = rawDesc.match(/<!--color_links:([\s\S]*?)-->/);
          let parsedLinks = [];
          let cleanDesc = rawDesc;
          if (match) {
            try { parsedLinks = JSON.parse(match[1]); cleanDesc = rawDesc.replace(/<!--color_links:[\s\S]*?-->/, '').trim(); }
            catch (e) { console.error('Failed to parse color links:', e); }
          }
          adapted.description = cleanDesc;
          adapted.colorLinks = parsedLinks;
          setProduct(adapted);
          setIsDemoMode(false);
          try {
            const viewed = JSON.parse(localStorage.getItem('recently_viewed_products') || '[]');
            const filtered = viewed.filter(p => p.id !== adapted.id);
            filtered.unshift(adapted);
            localStorage.setItem('recently_viewed_products', JSON.stringify(filtered.slice(0, 10)));
          } catch (_) {}
        } else {
          throw new Error(c.product_not_found);
        }
      } catch (err) {
        console.error('Failed to load product from API.', err);
        setError(c.product_load_error);
        setProduct(null);
        setIsDemoMode(false);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, activeLocale]);

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

  const discountPct = product?.old_price && product?.price
    ? Math.round((1 - product.price / product.old_price) * 100)
    : null;

  if (loading) return <div className="max-w-7xl mx-auto py-24"><ProductLoader text={c.loading_product_detail} /></div>;
  if (error) return (
    <div className="max-w-7xl mx-auto py-24 text-center">
      <p className="text-neutral-500">{error}</p>
      <Link to="/catalog" className="text-accent underline mt-4 inline-block">{c.return_to_catalog}</Link>
    </div>
  );
  if (!product) return (
    <div className="max-w-7xl mx-auto py-24 text-center">
      <p className="text-neutral-500">{c.product_not_found}</p>
      <Link to="/catalog" className="text-accent underline mt-4 inline-block">{c.return_to_catalog}</Link>
    </div>
  );

  return (
    <div className="w-full animate-fade-in bg-neutral-50">

      {/* ── Breadcrumb ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-5 pb-2">
        <nav className="flex items-center gap-2 text-[11px] text-neutral-400 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">{t('home')}</Link>
          <span className="text-neutral-300">/</span>
          <Link to="/catalog" className="hover:text-primary transition-colors">{c.collection}</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-600 font-semibold">{product.name}</span>
          {isDemoMode && <span className="text-accent font-semibold ml-1">(Mode Démo)</span>}
        </nav>
      </div>

      {/* ── Main layout ── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-8 xl:gap-14 items-start">

          {/* ─── Gallery ─── */}
          <div className="w-full">
            {/* --- MOBILE GALLERY (Swipeable Carousel) --- */}
            <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 gap-2">
              {product.images?.map((img, i) => (
                <div key={i} className="w-[85vw] shrink-0 snap-center relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                  <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  {/* Badge promo sur la première image */}
                  {discountPct && i === 0 && (
                    <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 leading-none z-10">
                      -{discountPct}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            {/* --- DESKTOP GALLERY --- */}
            <div className="hidden md:flex gap-3">
              {/* Vignettes desktop */}
              {product.images?.length > 1 && (
                <div className="flex flex-col gap-2 w-[68px] shrink-0">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(img)}
                      onMouseEnter={() => setActiveImage(img)}
                      className={`w-[68px] h-[85px] overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImage === img ? 'border-primary' : 'border-transparent hover:border-neutral-300'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Image principale */}
              <div className="flex-1 relative bg-neutral-100 overflow-hidden">
                <div className="aspect-[4/5]">
                  <img src={activeImage} alt={product.name} className="w-full h-full object-cover" />
                </div>
                {/* Badge promo */}
                {discountPct && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 leading-none">
                    -{discountPct}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ─── Panneau info ─── */}
          <div className="lg:sticky lg:top-6 flex flex-col bg-white border border-neutral-200 px-6 py-7">

            {/* Marque + Nom + Accroche */}
            <div className="pb-5 border-b border-neutral-200">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent mb-2">{product.brand}</p>
              <h1 className="text-[26px] font-black text-neutral-900 leading-tight tracking-tight mb-3 font-serif">
                {product.name}
              </h1>
              {product.short_description && (
                <p className="text-[13px] text-neutral-500 leading-relaxed">{product.short_description}</p>
              )}
            </div>

            {/* Prix */}
            <div className="py-5 border-b border-neutral-200 flex items-baseline gap-3 flex-wrap">
              <span className="text-2xl font-black text-primary">{formatPrice(product.price)}</span>
              {product.old_price && (
                <>
                  <span className="text-base text-neutral-400 line-through font-medium">{formatPrice(product.old_price)}</span>
                  {discountPct && (
                    <span className="text-[11px] font-black text-white bg-primary px-2 py-0.5 leading-snug">
                      −{discountPct}%
                    </span>
                  )}
                </>
              )}
            </div>

            {/* Couleurs */}
            {product.colors?.length > 0 && (
              <div className="py-5 border-b border-neutral-200">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-3">
                  {t('color')}
                  <span className="text-neutral-300 mx-2">—</span>
                  <span className="text-neutral-700 normal-case tracking-normal font-semibold">
                    {translateColor(selectedColor, activeLocale)}
                  </span>
                </p>
                <div className="flex gap-2.5 flex-wrap">
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={translateColor(color.name, activeLocale)}
                      style={{ backgroundColor: color.code }}
                      className={`w-8 h-8 border-2 transition-all duration-150 cursor-pointer ${
                        selectedColor === color.name
                          ? 'ring-2 ring-offset-2 ring-primary border-primary'
                          : 'border-transparent hover:border-neutral-400'
                      }`}
                    />
                  ))}
                  {(product.colorLinks || []).map(link => (
                    <Link
                      key={link.product_id}
                      to={`/product/${link.product_id}`}
                      title={c.view_in_color.replace('{color}', translateColor(link.color_name, activeLocale))}
                      style={{ backgroundColor: link.color_code }}
                      className="w-8 h-8 border-2 border-transparent hover:border-accent transition-all relative group cursor-pointer"
                    >
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Tailles */}
            {product.sizes?.length > 0 && (
              <div className="py-5 border-b border-neutral-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    {t('size')}
                    <span className="text-neutral-300 mx-2">—</span>
                    <span className="text-neutral-700 normal-case tracking-normal font-semibold">{selectedSize}</span>
                  </p>
                  <button className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-primary transition-colors font-bold uppercase tracking-wider cursor-pointer">
                    <Ruler className="w-3 h-3" />{t('size_guide')}
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(size => {
                    const stock = getSizeStock(size);
                    const sel = selectedSize === size;
                    const oos = stock === 0;
                    return (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`relative min-w-[46px] h-[46px] px-2 text-sm font-bold border transition-all cursor-pointer ${
                          oos
                            ? sel
                              ? 'border-neutral-300 text-neutral-400 bg-neutral-50'
                              : 'border-neutral-200 text-neutral-300 hover:border-neutral-300'
                            : sel
                            ? 'border-primary bg-primary text-white shadow-sm'
                            : 'border-neutral-300 text-neutral-700 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {size}
                        {oos && (
                          <span className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
                            <span className="block w-[135%] h-px bg-current opacity-30 rotate-45" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Alerte stock */}
                {maxStock > 0 && maxStock <= 5 && (
                  <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-primary bg-primary/5 border border-primary/20 px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    {c.hurry_only_items_left.replace('{count}', String(maxStock)).replace(/\{plural\}/g, maxStock > 1 ? 's' : '')}
                  </p>
                )}
                {maxStock > 5 && (
                  <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-accent-dark">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
                    {c.in_stock_msg}
                  </p>
                )}
              </div>
            )}

            {/* Rupture de stock — formulaire alerte */}
            {maxStock === 0 && (
              <div className="py-5 border-b border-neutral-200">
                <p className="text-[11px] font-black uppercase tracking-wider text-primary mb-1">{c.out_of_stock_label}</p>
                <p className="text-[12px] text-neutral-400 mb-3 leading-relaxed">{c.out_of_stock_desc}</p>
                {isNotifySubmitted ? (
                  <div className="flex items-center gap-2 text-[12px] font-semibold text-accent-dark bg-accent/10 border border-accent/30 px-3 py-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0 text-accent" />{c.notify_stock_success}
                  </div>
                ) : (
                  <form onSubmit={handleNotifySubmit} className="flex gap-2">
                    <input
                      ref={notifyInputRef}
                      type="text"
                      placeholder={c.email_or_phone_placeholder}
                      value={notifyContact}
                      onChange={e => setNotifyContact(e.target.value)}
                      required
                      className="flex-1 border border-neutral-300 text-xs px-3 py-2.5 focus:outline-none focus:border-primary text-neutral-800 bg-white"
                    />
                    <button type="submit" className="bg-primary hover:bg-primary-dark text-white text-[11px] font-black uppercase tracking-wider px-4 py-2.5 transition-colors cursor-pointer shrink-0">
                      {c.validate}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* CTA — Quantité + Panier + Favoris */}
            <div className="flex gap-3 fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 z-40 md:relative md:p-0 md:bg-transparent md:border-t-0 md:z-auto shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none md:pt-5 md:pb-2">
              {maxStock > 0 && (
                <div className="flex border border-neutral-300 h-[52px] shrink-0">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-11 text-neutral-500 text-lg hover:bg-neutral-50 hover:text-primary transition-colors cursor-pointer">−</button>
                  <span className="w-10 flex items-center justify-center text-sm font-black text-neutral-900">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} disabled={quantity >= maxStock} className="w-11 text-neutral-500 text-lg hover:bg-neutral-50 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer">+</button>
                </div>
              )}

              {maxStock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 h-[52px] bg-primary hover:bg-primary-dark text-white font-black text-[11px] uppercase tracking-[0.18em] flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  {t('add_to_cart')}
                </button>
              ) : (
                <button
                  onClick={handleNotifyClick}
                  className="flex-1 h-[52px] border-2 border-primary text-primary hover:bg-primary hover:text-white font-black text-[11px] uppercase tracking-[0.18em] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {c.notify_stock_return}
                </button>
              )}

              <button
                onClick={() => toggleFavorite(product)}
                title={isFavorite(product.id) ? c.remove_from_favorites : c.add_to_favorites}
                className={`w-[52px] h-[52px] border flex items-center justify-center transition-all cursor-pointer ${
                  isFavorite(product.id) ? 'border-primary/30 bg-primary/5' : 'border-neutral-300 hover:border-primary/40'
                }`}
              >
                <Heart className={`w-5 h-5 transition-colors ${
                  isFavorite(product.id) ? 'fill-primary text-primary' : 'text-neutral-400 hover:text-primary'
                }`} />
              </button>
            </div>

            {/* Accordéons */}
            {product.description && (
              <Accordion label={c.description_label} defaultOpen>
                <p className="whitespace-pre-line">{product.description}</p>
              </Accordion>
            )}
            <Accordion label={c.delivery_label}>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{c.free_delivery_terms}</span>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{c.free_returns_terms}</span>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{c.secure_payment_terms}</span>
                </div>
              </div>
            </Accordion>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
