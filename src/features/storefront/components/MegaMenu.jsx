import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Package } from 'lucide-react';
import productService from '../../../services/api/productService';
import storeService from '../../../services/api/storeService';
import { useSettings } from '../../../hooks/useSettings';
import ProductLoader from '../../../components/ui/ProductLoader';

const CATEGORY_TRANSLATIONS = {
  "robes": "Dresses",
  "robes de soirée": "Evening Dresses",
  "robes casual": "Casual Dresses",
  "robes de mariée": "Wedding Dresses",
  "sacs": "Bags",
  "sacs à main": "Handbags",
  "pochettes": "Clutches",
  "cabas": "Tote Bags",
  "chaussures": "Shoes",
  "escarpins": "Pumps",
  "sandales": "Sandals",
  "baskets luxe": "Luxury Sneakers",
  "accessoires": "Accessories",
  "bijoux": "Jewelry",
  "ceintures": "Belts",
  "lunettes": "Eyewear",
  "tous les articles": "All items"
};

const tName = (name, activeLocale) => {
  if (activeLocale !== 'en') return name;
  const key = (name || '').toLowerCase().trim();
  return CATEGORY_TRANSLATIONS[key] || name;
};

const MOCK_CATEGORIES = [
  {
    id: 1, name: "Robes", slug: "robes",
    sub_categories: [
      { id: 1, name: "Robes de soirée", slug: "robes-de-soiree" },
      { id: 2, name: "Robes casual", slug: "robes-casual" },
      { id: 3, name: "Robes de mariée", slug: "robes-de-mariee" }
    ]
  },
  {
    id: 2, name: "Sacs", slug: "sacs",
    sub_categories: [
      { id: 4, name: "Sacs à main", slug: "sacs-a-main" },
      { id: 5, name: "Pochettes", slug: "pochette" },
      { id: 6, name: "Cabas", slug: "cabas" }
    ]
  },
  {
    id: 3, name: "Chaussures", slug: "chaussures",
    sub_categories: [
      { id: 7, name: "Escarpins", slug: "escarpins" },
      { id: 8, name: "Sandales", slug: "sandales" },
      { id: 9, name: "Baskets luxe", slug: "baskets-luxe" }
    ]
  },
  {
    id: 4, name: "Accessoires", slug: "accessoires",
    sub_categories: [
      { id: 10, name: "Bijoux", slug: "bijoux" },
      { id: 11, name: "Ceintures", slug: "ceintures" },
      { id: 12, name: "Lunettes", slug: "lunettes" }
    ]
  }
];

const getCategoryFallbackImage = (categoryName) => {
  const name = (categoryName || '').toLowerCase();
  if (name.includes('robe')) {
    return 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('sac')) {
    return 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('chaussure') || name.includes('soulier')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80';
  }
  if (name.includes('accessoire')) {
    return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80';
};

const getProductImage = (product) => {
  if (!product) return null;
  
  const getApiBase = () => {
    const apiUrl = localStorage.getItem('api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return apiUrl.replace(/\/api\/?$/, '');
  };

  const resolve = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('//')) return url;
    const base = getApiBase();
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const normalizeImage = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return resolve(image);
    if (typeof image === 'object') return resolve(image.url || image.path || image.src || image.public_url || null);
    return null;
  };

  const rawImages = Array.isArray(product.images) ? product.images : [];
  const imageUrls = rawImages.map(normalizeImage).filter(Boolean);
  const primaryImageObj = rawImages.find((img) => typeof img === 'object' && img.is_primary);
  
  return (
    normalizeImage(primaryImageObj) ||
    imageUrls[0] ||
    normalizeImage(product.image) ||
    null
  );
};

export const MegaMenu = ({ isTransparent }) => {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [menuBanners, setMenuBanners] = useState({});
  const { activeLocale } = useSettings();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res ?? []);
      } catch (err) {
        console.error("Échec de chargement des catégories depuis l'API.", err);
        setCategories(MOCK_CATEGORIES);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    const loadProducts = async () => {
      try {
        const res = await productService.getProducts();
        if (res) {
          setProducts(res);
        }
      } catch (err) {
        console.error("Échec de chargement des produits pour le MegaMenu.", err);
      }
    };
    const loadBanners = async () => {
      try {
        const res = await storeService.getMenuBanners();
        if (res) {
          const banners = res.data || res;
          if (banners && typeof banners === 'object') {
            setMenuBanners(banners);
            localStorage.setItem('category_banner_products', JSON.stringify(banners));
            return;
          }
        }
      } catch (err) {
        console.warn("Échec du chargement des bannières depuis l'API, utilisation du cache local.", err);
      }
      
      const storedSelections = localStorage.getItem('category_banner_products');
      if (storedSelections) {
        try {
          setMenuBanners(JSON.parse(storedSelections));
        } catch (e) {
          console.error("Erreur parsing category_banner_products", e);
        }
      }
    };
    loadCategories();
    loadProducts();
    loadBanners();
  }, []);

  const displayCategories = categories;

  return (
    <nav
      className="relative flex items-center gap-8 h-full"
      onMouseLeave={() => setActiveCategory(null)}
    >
      {isLoadingCategories ? (
        <ProductLoader text={activeLocale === 'en' ? "Loading categories..." : "Chargement des catégories..."} compact={true} />
      ) : displayCategories.length === 0 ? (
        <div className="text-sm text-neutral-500 uppercase tracking-wider">
          {activeLocale === 'en' ? "No categories available at the moment." : "Aucune catégorie disponible pour le moment."}
        </div>
      ) : (
        displayCategories.map((category) => (
          <div
            key={category.id}
            className="h-full flex items-center"
            onMouseEnter={() => setActiveCategory(category)}
          >
            <button
              className={`text-sm font-semibold tracking-wider uppercase h-full border-b-2 transition-colors cursor-pointer ${
                activeCategory?.id === category.id
                  ? 'border-accent text-accent'
                  : isTransparent
                  ? 'border-transparent text-white/95 hover:text-accent'
                  : 'border-transparent text-neutral-800 hover:text-accent'
              }`}
            >
              {tName(category.name, activeLocale)}
            </button>
          </div>
        ))
      )}

      {/* Panneau de Méga-Menu */}
      {activeCategory && (
        <div className="absolute top-[100%] left-0 w-[80vw] max-w-5xl bg-white border border-neutral-100 shadow-xl z-50 p-8 grid grid-cols-3 gap-8 rounded-b-md transition-all duration-300 transform opacity-100 translate-y-0 text-left">
          {/* Colonne 1: Sous-catégories */}
          <div className="flex flex-col text-left">
            <h4 className="text-sm font-bold text-neutral-900 mb-4 tracking-wide border-b border-neutral-100 pb-2 uppercase">
              {activeLocale === 'en' 
                ? `${tName(activeCategory.name, activeLocale)} Categories` 
                : `Catégories de ${activeCategory.name}`
              }
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link
                  to={`/catalog?category_id=${activeCategory.id}`}
                  className="text-xs text-neutral-950 font-bold hover:text-accent transition-colors"
                  onClick={() => setActiveCategory(null)}
                >
                  {activeLocale === 'en' ? "All items" : "Tous les articles"}
                </Link>
              </li>
              {activeCategory.sub_categories?.map((sub) => (
                <li key={sub.id}>
                  <Link
                    to={`/catalog?category_id=${activeCategory.id}&sub_category_id=${sub.id}`}
                    className="text-xs text-neutral-500 hover:text-accent hover:underline transition-colors"
                    onClick={() => setActiveCategory(null)}
                  >
                    {tName(sub.name, activeLocale)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 2: Collections / Guide */}
          <div className="flex flex-col text-left">
            <h4 className="text-sm font-bold text-neutral-900 mb-4 tracking-wide border-b border-neutral-100 pb-2 uppercase">
              {activeLocale === 'en' ? "Inspirations" : "Inspirations"}
            </h4>
            <ul className="flex flex-col gap-3 text-xs text-neutral-500">
              <li className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
                <Link to="/catalog?featured=true" className="hover:text-accent transition-colors" onClick={() => setActiveCategory(null)}>
                  {activeLocale === 'en' ? "House Essentials" : "Les Essentiels de la Maison"}
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
                <span className="cursor-not-allowed text-neutral-300">
                  {activeLocale === 'en' ? "Leather Care Guide" : "Guide d'entretien des cuirs"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                <Link to="/order-tracking" className="hover:text-accent transition-colors font-medium text-neutral-700" onClick={() => setActiveCategory(null)}>
                  {activeLocale === 'en' ? "Track my order" : "Suivre ma commande en direct"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Section Image Promotionnelle */}
          {(() => {
            // Lire les configurations des bannières personnalisées depuis l'état
            const selectedProductId = menuBanners[activeCategory.id];

            // Trouver le produit correspondant
            let categoryProduct = null;
            if (selectedProductId) {
              categoryProduct = products.find(p => p.id == selectedProductId);
            }
            
            // Si pas de produit sélectionné ou non trouvé, prendre le premier produit de la catégorie
            if (!categoryProduct) {
              categoryProduct = products.find(p => p.category_id === activeCategory.id);
            }

            const productImage = getProductImage(categoryProduct);
            const finalImage = productImage || getCategoryFallbackImage(activeCategory.name);
            
            const linkTo = categoryProduct ? `/product/${categoryProduct.id}` : `/catalog?category_id=${activeCategory.id}`;
            const linkLabel = categoryProduct 
              ? (activeLocale === 'en' ? 'Discover model' : 'Découvrir le modèle') 
              : (activeLocale === 'en' ? 'Discover selection' : 'Découvrir la sélection');

            return (
              <div className="relative overflow-hidden bg-neutral-100 rounded-sm aspect-[16/9] flex flex-col justify-end p-5 text-left group">
                <img
                  src={finalImage}
                  alt={activeCategory.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-550 z-0"
                />
                <div className="absolute inset-0 bg-neutral-950/35 group-hover:bg-neutral-950/45 transition-colors z-10" />
                <div className="relative z-20">
                  <span className="text-[9px] text-white font-bold tracking-widest uppercase bg-accent px-2 py-0.5 rounded-xs">
                    {activeLocale === 'en' ? "Royal House" : "Maison Royale"}
                  </span>
                  <h5 className="text-base font-extrabold text-white mt-2 drop-shadow-md">
                    {activeLocale === 'en' 
                      ? `New ${tName(activeCategory.name, activeLocale)} Line` 
                      : `Nouvelle Ligne ${activeCategory.name}`
                    }
                  </h5>
                  {categoryProduct && (
                    <p className="text-[10px] text-neutral-200 font-medium truncate mt-0.5 drop-shadow-sm">
                      {activeLocale === 'en' ? "Model: " : "Modèle : "}{categoryProduct.name}
                    </p>
                  )}
                  <Link
                    to={linkTo}
                    className="text-[11px] text-white font-bold underline mt-1.5 block hover:text-neutral-200"
                    onClick={() => setActiveCategory(null)}
                  >
                    {linkLabel}
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </nav>
  );
};

export default MegaMenu;

