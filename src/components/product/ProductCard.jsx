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
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100 rounded-sm">
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
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={handleImageError}
          />
        </Link>
 
        {/* Badges de Réduction/Nouveautés */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2 py-1 tracking-wider uppercase">
            -{discount}%
          </span>
        )}

        {/* Badge Stock Trendyol-style */}
        {totalStock === 0 ? (
          <span className={`absolute ${discount > 0 ? 'top-11' : 'top-3'} left-3 bg-neutral-900/90 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 tracking-wider uppercase z-10`}>
            {activeLocale === 'en' ? 'Sold Out' : 'Rupture'}
          </span>
        ) : totalStock <= 5 ? (
          <span className={`absolute ${discount > 0 ? 'top-11' : 'top-3'} left-3 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 tracking-wider uppercase animate-pulse shadow-sm z-10`}>
            {activeLocale === 'en' ? `Only ${totalStock} left!` : `Plus que ${totalStock} !`}
          </span>
        ) : null}

        {/* Bouton Favoris */}
        <button
          onClick={handleToggleFav}
          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-xs transition-colors duration-200 z-10"
          title={favorited ? (activeLocale === 'en' ? "Remove from favorites" : "Retirer des favoris") : (activeLocale === 'en' ? "Add to favorites" : "Ajouter aux favoris")}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? "fill-red-500 text-red-500" : "text-neutral-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Bouton Ajout Rapide en Hover (style Defacto) */}
        <div className="absolute bottom-0 inset-x-0 p-4 transition-all duration-300 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/20 to-transparent">
          {totalStock > 0 ? (
            <button
              onClick={handleQuickAdd}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-primary text-primary hover:text-white text-sm font-semibold py-3 transition-colors duration-200 rounded-sm shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              {activeLocale === 'en' ? 'Quick Add' : 'Ajout Rapide'}
            </button>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-neutral-100 text-neutral-400 text-sm font-semibold py-3 rounded-sm shadow-md cursor-not-allowed border border-neutral-200"
            >
              {activeLocale === 'en' ? 'Out of Stock' : 'Indisponible'}
            </button>
          )}
        </div>
      </div>

      {/* Détails du Produit */}
      <div className="flex flex-col pt-3 pb-2 text-left">
        {/* Marque / Collection */}
        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">
          {product.brand || 'Ha-kavod 97'}
        </span>

        {/* Nom du Produit */}
        <Link
          to={`/product/${product.id}`}
          className="mt-1 text-sm font-medium text-neutral-800 hover:underline line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Couleurs (pastilles) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {product.colors.map((color, index) => (
              <span
                key={index}
                className="w-3.5 h-3.5 rounded-full border border-neutral-300 ring-offset-1 group-hover:ring-1 transition-all"
                style={{ backgroundColor: color.code }}
                title={translateColor(color.name, activeLocale)}
              />
            ))}
          </div>
        )}

        {/* Prix */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-semibold text-neutral-900">{formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {/* Indicateur de stock restant */}
        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className={`w-1.5 h-1.5 rounded-full ${
            totalStock === 0 ? 'bg-danger animate-pulse' :
            totalStock <= 5 ? 'bg-amber-500' :
            'bg-accent'
          }`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${
            totalStock === 0 ? 'text-danger font-extrabold' :
            totalStock <= 5 ? 'text-amber-600 font-extrabold' :
            'text-neutral-500'
          }`}>
            {totalStock === 0 ? (activeLocale === 'en' ? 'Out of stock' : 'Rupture de stock') :
             totalStock <= 5 ? (activeLocale === 'en' ? `Almost sold out (${totalStock} left)` : `Presque épuisé (${totalStock} restants)`) :
             (activeLocale === 'en' ? `${totalStock} in stock` : `${totalStock} en stock`)}
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
