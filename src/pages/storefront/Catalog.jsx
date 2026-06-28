import React, { useState, useEffect } from 'react';
import DynamicFilters from '../../features/storefront/components/DynamicFilters';
import ProductCard from '../../components/product/ProductCard';
import useFilters from '../../hooks/useFilters';
import { useLocation } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { useSettings } from '../../hooks/useSettings';
import productService from '../../services/api/productService';
import ProductLoader from '../../components/ui/ProductLoader';
import { translateCategory } from '../../services/translations';

export const adaptProduct = (apiProduct) => {
  if (!apiProduct) return null;

  const normalizeImage = (image) => {
    if (!image) return null;

    const getApiBase = () => {
      const apiUrl = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      return apiUrl.replace(/\/api\/?$/, '');
    };

    const resolve = (url) => {
      if (!url) return null;
      
      const apiBase = getApiBase();
      
      // Si l'URL de l'image est absolue, on réécrit son domaine pour correspondre à l'API active
      if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
          const parsedUrl = new URL(url);
          // On réécrit si l'URL pointe vers un hôte lié au projet (ou si on veut forcer l'alignement sur l'API)
          if (parsedUrl.hostname.includes('hakavod97.com') || parsedUrl.hostname.includes('localhost') || parsedUrl.hostname.includes('127.0.0.1')) {
            return `${apiBase}${parsedUrl.pathname}${parsedUrl.search}`;
          }
        } catch (e) {
          // Erreur d'analyse URL, retour simple
        }
        return url;
      }
      
      return `${apiBase}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    if (typeof image === 'string') return resolve(image);
    if (typeof image === 'object') return resolve(image.url || image.path || image.src || image.public_url || null);
    return null;
  };

  const rawImages = Array.isArray(apiProduct.images) ? apiProduct.images : [];
  const imageUrls = rawImages.map(normalizeImage).filter(Boolean);
  const primaryImageObj = rawImages.find((img) => typeof img === 'object' && img.is_primary);
  const primaryImage =
    normalizeImage(primaryImageObj) ||
    imageUrls[0] ||
    normalizeImage(apiProduct.image) ||
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&auto=format&fit=crop&q=80';
  
  const colorsMap = {};
  const sizesMap = {};
  apiProduct.variants?.forEach((variant) => {
    if (variant.color) {
      const colorKey = variant.color.id ?? variant.color.name ?? variant.color;
      if (colorKey && !colorsMap[colorKey]) {
        colorsMap[colorKey] =
          typeof variant.color === 'string'
            ? { name: variant.color, code: '#000000' }
            : { name: variant.color.name, code: variant.color.hex_code || variant.color.code || '#000000' };
      }
    }
    if (variant.size) {
      const sizeKey = variant.size.id ?? variant.size;
      if (sizeKey && !sizesMap[sizeKey]) {
        const sizeName = typeof variant.size === 'string' ? variant.size : variant.size.name || String(variant.size);
        sizesMap[sizeKey] = { name: sizeName, sort_order: variant.size?.sort_order || 0 };
      }
    }
  });

  const colors = Object.values(colorsMap);
  const sizes = Object.values(sizesMap)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((s) => s.name);

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: apiProduct.slug,
    price: apiProduct.price, // in XOF
    old_price: apiProduct.old_price || null,
    image: primaryImage,
    images: imageUrls.length > 0 ? imageUrls : [primaryImage],
    colors: colors,
    sizes: sizes,
    description: apiProduct.description,
    brand: 'Ha-Kavod 97',
    variants: apiProduct.variants || [],
  };
};

export const Catalog = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const categoryId = params.get('category_id');
  const subCategoryId = params.get('sub_category_id');
  const featured = params.get('featured');

  const { products: apiProducts, loading, error, updateParams } = useProducts({
    category_id: categoryId ? Number(categoryId) : undefined,
    sub_category_id: subCategoryId ? Number(subCategoryId) : undefined,
    featured: featured === 'true' ? true : undefined,
  });

  const { activeCurrency, exchangeRates, activeLocale, t } = useSettings();
  const [categories, setCategories] = useState([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    updateParams({
      category_id: categoryId ? Number(categoryId) : undefined,
      sub_category_id: subCategoryId ? Number(subCategoryId) : undefined,
      featured: featured === 'true' ? true : undefined,
    });
  }, [location.search, updateParams, categoryId, subCategoryId, featured]);


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        if (res) {
          setCategories(res);
        }
      } catch (err) {
        console.error("Erreur de chargement des catégories", err);
      }
    };
    fetchCategories();
  }, [activeLocale]);

  const { filters, handleFilterChange, resetFilters } = useFilters({
    sizes: [],
    colors: [],
    priceRange: '',
  });

  const normalizedApiProducts = Array.isArray(apiProducts)
    ? apiProducts
    : Array.isArray(apiProducts?.data)
    ? apiProducts.data
    : Array.isArray(apiProducts?.items)
    ? apiProducts.items
    : [];

  const rawProducts = normalizedApiProducts.map(adaptProduct);

  // DEBUG: afficher les images utilisées pour chaque produit (temporaire)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('Catalog - adapted product images:', rawProducts.map(p => ({ id: p.id, image: p.image, images: p.images })));
  }
  const availableSizes = Array.from(
    new Set(rawProducts.flatMap((product) => product.sizes || []))
  ).sort((a, b) => {
    const numericA = Number(a);
    const numericB = Number(b);
    if (!Number.isNaN(numericA) && !Number.isNaN(numericB)) return numericA - numericB;
    return String(a).localeCompare(String(b));
  });

  const availableColors = Array.from(
    new Map(
      rawProducts
        .flatMap((product) => product.colors || [])
        .map((color) => {
          const name = typeof color === 'string' ? color : color.name;
          return [name, typeof color === 'string' ? { name, code: '#000000' } : color];
        })
    ).values()
  );

  const availablePriceRanges = (() => {
    if (rawProducts.length === 0) return [];

    const rate = exchangeRates[activeCurrency] || 1;
    const prices = rawProducts
      .map((product) => Math.round((product.price || 0) * rate))
      .filter((value) => value > 0)
      .sort((a, b) => a - b);

    if (prices.length === 0) return [];

    const minPrice = prices[0];
    const maxPrice = prices[prices.length - 1];
    const step = Math.max(10000, Math.round((maxPrice - minPrice) / 3));
    const firstLimit = minPrice + step;
    const secondLimit = minPrice + step * 2;

    const formatLabel = (amount) =>
      new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: activeCurrency,
        maximumFractionDigits: 0,
      }).format(amount);

    return [
      { label: `${formatLabel(minPrice)} - ${formatLabel(firstLimit)}`, value: `${minPrice}-${firstLimit}` },
      { label: `${formatLabel(firstLimit)} - ${formatLabel(secondLimit)}`, value: `${firstLimit}-${secondLimit}` },
      { label: `${t('price_over')} ${formatLabel(secondLimit)}`, value: `${secondLimit}-${Number.MAX_SAFE_INTEGER}` },
    ];
  })();

  // Filter products client-side
  const filteredProducts = rawProducts.filter((product) => {
    const sizeMatch = filters.sizes.length === 0 || filters.sizes.some((size) => product.sizes.includes(size));
    const colorMatch =
      filters.colors.length === 0 ||
      filters.colors.some((color) => product.colors?.some((c) => c.name === color));

    // Price range logic: convert boundaries from activeCurrency to XOF and filter directly
    const priceMatch =
      !filters.priceRange ||
      (() => {
        const [minDisplay, maxDisplay] = filters.priceRange.split('-').map(Number);
        
        // Convert display boundaries back to XOF to compare with product.price (XOF)
        const rate = exchangeRates[activeCurrency] || 1;
        const minXof = minDisplay / rate;
        const maxXof = maxDisplay / rate;

        return product.price >= minXof && product.price <= maxXof;
      })();

    return sizeMatch && colorMatch && priceMatch;
  });

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-8 flex flex-col md:flex-row gap-8 animate-fade-in">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 h-fit animate-slide-left">
        {/* Bouton de bascule pour mobile */}
        <button
          type="button"
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="w-full md:hidden flex items-center justify-between py-3 px-4 border border-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-800 bg-white hover:bg-neutral-50 mb-4 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('filter_search')}
          </span>
          <span className="text-accent font-semibold">{showFiltersMobile ? t('hide') : t('show')}</span>
        </button>

        {/* Contenu des filtres */}
        <div className={`${showFiltersMobile ? 'block' : 'hidden'} md:block bg-white p-5 border border-neutral-200 rounded-sm md:border-none md:p-0 md:bg-transparent`}>
          <DynamicFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            availableSizes={availableSizes}
            availableColors={availableColors}
            availablePriceRanges={availablePriceRanges}
          />
        </div>
      </aside>

      {/* Main catalog grid */}
      <main className="flex-1 animate-fade-up">
        {/* Header of catalog */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-neutral-100 pb-4 mb-6">
          <div className="text-left">
            <h1 className="text-xl font-bold uppercase text-neutral-900 tracking-wider m-0">
              {(() => {
                const activeCategoryObj = categories.find(c => c.id === Number(categoryId));
                return activeCategoryObj ? translateCategory(activeCategoryObj.name, activeLocale) : t('all_clothing');
              })()}
            </h1>

            <span className="text-xs text-neutral-400 font-medium">
              {filteredProducts.length} {filteredProducts.length > 1 ? t('items_found') : t('item_found')}
            </span>
          </div>

          {/* Sorting dropdown */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <label className="text-xs font-semibold uppercase text-neutral-400">{t('sort_by')}</label>
            <select className="border border-neutral-200 rounded-sm text-xs py-1.5 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-primary select-no-arrow">
              <option>{t('sort_new')}</option>
              <option>{t('sort_price_asc')}</option>
              <option>{t('sort_price_desc')}</option>
              <option>{t('sort_sales')}</option>
            </select>
          </div>
        </div>

        {/* Product grid */}
        {loading ? (
          <ProductLoader text={t('loading_products')} />
        ) : filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">{t('no_products')}</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Catalog;
