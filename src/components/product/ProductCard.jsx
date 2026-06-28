import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { useFavorites } from '../../hooks/useFavorites';
import { translateColor } from '../../services/translations';
import QuickAddModal from './QuickAddModal';

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();
  const { formatPrice, activeLocale } = useSettings();
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleQuickAdd = (e) => {
    e.preventDefault(); // Éviter la redirection vers le détail du produit
    const hasOptions = (product.sizes?.length > 1) || (product.colors?.length > 1);
    if (hasOptions) {
      setIsModalOpen(true);
    } else {
      const firstVariant = product.variants?.[0];
      addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0]?.name || 'Noir', firstVariant?.id || null);
    }
  };

  const handleToggleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const favorited = isFavorite(product.id);

  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;

  const totalStock = product.variants
    ? product.variants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0)
    : 0;

  return (
    <div
      className="group relative flex flex-col w-full bg-white transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Conteneur Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-none border border-neutral-100/50">
        <Link to={`/product/${product.id}`}>
          <img
            src={
              imageError
                ? 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80'
                : isHovered && product.images?.[1]
                ? product.images[1]
                : product.image
            }
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-103"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>
 
        {/* Badges de Réduction/Nouveautés */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-neutral-900 text-white text-[9px] font-black px-2 py-0.5 tracking-wider uppercase rounded-none z-10">
            -{discount}%
          </span>
        )}

        {/* Badge Stock Trendyol-style */}
        {totalStock === 0 ? (
          <span className={`absolute ${discount > 0 ? 'top-9' : 'top-3'} left-3 bg-neutral-900/80 backdrop-blur-xs text-white text-[8px] font-bold px-2 py-0.5 tracking-wider uppercase z-10 rounded-none`}>
            {activeLocale === 'en' ? 'Sold Out' : 'Rupture'}
          </span>
        ) : totalStock <= 5 ? (
          <span className={`absolute ${discount > 0 ? 'top-9' : 'top-3'} left-3 bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 tracking-wider uppercase shadow-sm z-10 rounded-none`}>
            {activeLocale === 'en' ? `Only ${totalStock} left!` : `Plus que ${totalStock} !`}
          </span>
        ) : null}

        {/* Bouton Favoris */}
        <button
          onClick={handleToggleFav}
          className="absolute top-3 right-3 w-8 h-8 bg-white border border-neutral-100/80 hover:border-neutral-900 rounded-full flex items-center justify-center shadow-xs transition-all duration-200 z-10 cursor-pointer"
          title={favorited ? (activeLocale === 'en' ? "Remove from favorites" : "Retirer des favoris") : (activeLocale === 'en' ? "Add to favorites" : "Ajouter aux favoris")}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : "text-neutral-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Bouton Ajout Rapide en Hover (style Defacto) */}
        <div className="absolute bottom-0 inset-x-0 p-3 transition-all duration-300 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/5 to-transparent z-10">
          {totalStock > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center justify-center gap-1.5 bg-white hover:bg-neutral-900 text-neutral-900 hover:text-white text-[10px] font-bold uppercase tracking-wider py-2.5 transition-all duration-200 border border-neutral-200 hover:border-neutral-900 rounded-none shadow-sm cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {activeLocale === 'en' ? 'Quick Add' : 'Ajout Rapide'}
            </button>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-1.5 bg-neutral-50 text-neutral-400 text-[10px] font-bold uppercase tracking-wider py-2.5 rounded-none border border-neutral-200 cursor-not-allowed"
            >
              {activeLocale === 'en' ? 'Out of Stock' : 'Indisponible'}
            </button>
          )}
        </div>
      </div>

      {/* Détails du Produit */}
      <div className="flex flex-col pt-2.5 pb-2 text-left">
        {/* Marque / Collection */}
        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
          {product.brand || 'Ha-kavod 97'}
        </span>

        {/* Nom du Produit */}
        <Link
          to={`/product/${product.id}`}
          className="mt-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Couleurs (pastilles carrées style Defacto) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2.5">
            {product.colors.map((color, index) => (
              <span
                key={index}
                className="w-2.5 h-2.5 border border-neutral-200/80 rounded-none pointer-events-none"
                style={{ backgroundColor: color.code }}
                title={translateColor(color.name, activeLocale)}
              />
            ))}
          </div>
        )}

        {/* Prix */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-sm font-extrabold text-neutral-900">{formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="text-[10px] text-neutral-400 line-through font-medium">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {/* Indicateur de stock restant */}
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`w-1 h-1 rounded-full ${
            totalStock === 0 ? 'bg-red-500 animate-pulse' :
            totalStock <= 5 ? 'bg-amber-500' :
            'bg-emerald-500'
          }`} />
          <span className={`text-[8.5px] font-bold uppercase tracking-wider ${
            totalStock === 0 ? 'text-red-500 font-black' :
            totalStock <= 5 ? 'text-amber-600 font-black' :
            'text-neutral-400'
          }`}>
            {totalStock === 0 ? (activeLocale === 'en' ? 'Out of stock' : 'Rupture') :
             totalStock <= 5 ? (activeLocale === 'en' ? `Almost sold out` : `Presque épuisé`) :
             (activeLocale === 'en' ? `In stock` : `Disponible`)}
          </span>
        </div>
      </div>
      {isModalOpen && createPortal(
        <QuickAddModal 
          product={product} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />,
        document.body
      )}
    </div>
  );
};

export default ProductCard;
