import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';
import { translateColor } from '../../services/translations';

const CONTENT = {
  fr: {
    quick_add: "Ajout Rapide",
    color: "Couleur",
    size: "Taille",
    quantity: "Quantité",
    add_to_cart: "Ajouter au panier",
    out_of_stock: "En rupture de stock",
    only_left: "Plus que {count} article{plural} !",
    in_stock: "En stock",
    select_size: "Choisir la taille",
    select_color: "Choisir la couleur",
    size_guide: "Guide des tailles"
  },
  en: {
    quick_add: "Quick Add",
    color: "Color",
    size: "Size",
    quantity: "Quantity",
    add_to_cart: "Add to Cart",
    out_of_stock: "Out of Stock",
    only_left: "Only {count} left!",
    in_stock: "In Stock",
    select_size: "Select Size",
    select_color: "Select Color",
    size_guide: "Size Guide"
  }
};

export const QuickAddModal = ({ product, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const { formatPrice, activeLocale } = useSettings();
  
  const locale = activeLocale === 'en' || activeLocale === 'eng' ? 'en' : 'fr';
  const c = CONTENT[locale];

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Initialize selections when modal opens or product changes
  useEffect(() => {
    if (product && isOpen) {
      const defaultColor = product.colors?.[0]?.name || '';
      setSelectedColor(defaultColor);

      // Find first size that has stock for this color, or default to first size
      const firstAvailableSize = (product.sizes || []).find(size => {
        const variant = product.variants?.find(v => {
          const vColor = v.color?.name || v.color;
          const vSize = v.size?.name || v.size;
          return vColor === defaultColor && vSize === size;
        });
        return variant ? Number(variant.stock) > 0 : false;
      });

      setSelectedSize(firstAvailableSize || product.sizes?.[0] || '');
      setQuantity(1);
    }
  }, [product, isOpen]);

  // Adjust selected size if color changes and current size is out of stock for new color
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

  if (!isOpen || !product) return null;

  // Find matching variant based on selections
  const selectedVariant = product.variants?.find(v => {
    const vColor = v.color?.name || v.color;
    const vSize = v.size?.name || v.size;
    return vColor === selectedColor && vSize === selectedSize;
  });

  const maxStock = selectedVariant ? Number(selectedVariant.stock) : 0;

  const getSizeStock = (sizeName) => {
    const variant = product.variants?.find(v => {
      const vColor = v.color?.name || v.color;
      const vSize = v.size?.name || v.size;
      return vColor === selectedColor && vSize === sizeName;
    });
    return variant ? Number(variant.stock) : 0;
  };

  const handleConfirmAdd = () => {
    if (maxStock <= 0) return;
    addToCart(product, quantity, selectedSize, selectedColor, selectedVariant?.id);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end md:items-center justify-center p-0 md:p-4 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-lg md:rounded-sm shadow-2xl w-full md:max-w-md max-h-[90vh] md:max-h-[95vh] overflow-y-auto flex flex-col relative animate-slide-in-right md:animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-0.5">
              {c.quick_add}
            </span>
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider line-clamp-1">
              {product.name}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-100 transition-colors text-neutral-400 hover:text-neutral-700 cursor-pointer"
            aria-label={c.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Product Mini Info */}
          <div className="flex gap-4 mb-6">
            <div className="w-20 h-24 shrink-0 bg-neutral-150 rounded-sm overflow-hidden border border-neutral-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex flex-col justify-center text-left">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                {product.brand || 'Ha-Kavod 97'}
              </span>
              <h4 className="text-sm font-semibold text-neutral-800 mt-1 mb-2">
                {product.name}
              </h4>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-neutral-900">
                  {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span className="text-xs text-neutral-400 line-through">
                    {formatPrice(product.old_price)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <hr className="border-neutral-100 my-4" />

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="mb-5 text-left">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                {c.color} : <span className="text-neutral-900 font-semibold">{translateColor(selectedColor, activeLocale)}</span>
              </h4>
              <div className="flex gap-2.5 flex-wrap items-center">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center transition-all cursor-pointer relative ${
                      selectedColor === color.name ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.code }}
                    title={translateColor(color.name, activeLocale)}
                  >
                    {selectedColor === color.name && (
                      <Check className={`w-3.5 h-3.5 ${color.code === '#ffffff' || color.code === '#FFF' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-5 text-left">
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  {c.size} : <span className="text-neutral-900 font-semibold">{selectedSize}</span>
                </h4>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => {
                  const sizeStock = getSizeStock(size);
                  const isSelected = selectedSize === size;
                  const isOutOfStock = sizeStock === 0;

                  return (
                    <button
                      key={size}
                      onClick={() => !isOutOfStock && setSelectedSize(size)}
                      disabled={isOutOfStock}
                      className={`relative min-w-10 h-10 border text-xs font-semibold flex items-center justify-center transition-all rounded-xs cursor-pointer ${
                        isOutOfStock
                          ? 'border-neutral-200 text-neutral-350 bg-neutral-50/50 cursor-not-allowed'
                          : isSelected
                          ? 'border-primary bg-primary text-white shadow-xs'
                          : 'border-neutral-200 text-neutral-650 hover:border-neutral-400 hover:bg-neutral-50/20'
                      }`}
                    >
                      {size}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-[140%] h-[1px] bg-neutral-300 rotate-45 transform origin-center" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          {maxStock > 0 && (
            <div className="mb-6 text-left">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                {c.quantity}
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex border border-neutral-300 rounded-sm h-10">
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
                    className="w-10 text-center font-semibold text-neutral-850 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= maxStock}
                    className="px-3 text-neutral-500 font-bold hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Stock Indicator */}
                <div className="text-xs">
                  {maxStock <= 5 ? (
                    <span className="text-amber-600 font-bold">
                      {c.only_left.replace('{count}', String(maxStock)).replace('{plural}', maxStock > 1 ? 's' : '')}
                    </span>
                  ) : (
                    <span className="text-accent font-semibold">
                      {c.in_stock}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Out of Stock Message */}
          {maxStock <= 0 && (
            <div className="mb-6 p-3 bg-red-50 border border-red-150 text-red-700 text-xs font-medium rounded-sm text-left">
              {c.out_of_stock}
            </div>
          )}
        </div>

        {/* Footer / Add to Cart Button */}
        <div className="p-6 border-t border-neutral-100 bg-neutral-50">
          <button
            onClick={handleConfirmAdd}
            disabled={maxStock <= 0}
            className={`w-full py-3.5 flex items-center justify-center gap-2.5 text-sm font-bold uppercase tracking-wider text-white transition-colors rounded-sm shadow-md cursor-pointer ${
              maxStock > 0 
                ? 'bg-primary hover:bg-neutral-850' 
                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed shadow-none'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            {c.add_to_cart}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickAddModal;
