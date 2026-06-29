import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ChevronDown, ChevronUp, Sparkles, BookOpen, Package, User, Heart } from 'lucide-react';
import productService from '../../../services/api/productService';
import { useSettings } from '../../../hooks/useSettings';
import { useCustomerAuth } from '../../../hooks/useCustomerAuth';
import { useFavorites } from '../../../hooks/useFavorites';
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

export const MobileMenu = ({ isOpen, onClose, onOpenAuth }) => {
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const location = useLocation();

  const { currencies, activeCurrency, changeCurrency, locales, activeLocale, changeLocale } = useSettings();
  const { customerUser, isAuthenticated, customerLogout } = useCustomerAuth();
  const { getFavoritesCount } = useFavorites();

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
    loadCategories();
  }, []);

  // Fermer le menu lors du changement de page
  useEffect(() => {
    onClose();
  }, [location.pathname, location.search]);

  const displayCategories = categories;

  const toggleCategory = (id) => {
    setExpandedCategory(expandedCategory === id ? null : id);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop sombre et flou */}
      <div 
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Conteneur tiroir coulissant */}
      <div 
        className={`absolute inset-y-0 left-0 w-full max-w-xs bg-white shadow-2xl flex flex-col h-full border-r border-neutral-200/50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête du menu */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="HA-KAVOD 97 Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-sm font-black uppercase tracking-[0.15em] text-neutral-950">
              HA-KAVOD 97
            </span>
          </div>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-950 p-1 text-xl focus:outline-none transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps de navigation (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
          <div className="flex flex-col gap-6">
            
            {/* Titre Navigation */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">
                {activeLocale === 'en' ? "Categories" : "Catégories"}
              </span>
              
              <nav className="flex flex-col border-t border-neutral-100/70">
                {isLoadingCategories ? (
                  <ProductLoader text={activeLocale === 'en' ? "Loading categories..." : "Chargement des catégories..."} compact={true} />
                ) : displayCategories.length === 0 ? (
                  <div className="py-4 text-xs text-neutral-500">{activeLocale === 'en' ? "No categories available at the moment." : "Aucune catégorie disponible pour le moment."}</div>
                ) : (
                  displayCategories.map((category) => {
                    const isExpanded = expandedCategory === category.id;
                    const hasSub = category.sub_categories && category.sub_categories.length > 0;

                    return (
                      <div key={category.id} className="border-b border-neutral-100/70">
                        {hasSub ? (
                          <>
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="w-full flex items-center justify-between py-4 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-accent text-left focus:outline-none transition-colors"
                            >
                              <span>{tName(category.name, activeLocale)}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-neutral-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-neutral-400" />
                              )}
                            </button>

                            {/* Accordéon sous-catégories */}
                            <div
                              className={`pl-4 flex flex-col gap-3 overflow-hidden transition-all duration-300 ${
                                isExpanded ? 'max-h-60 pb-4' : 'max-h-0'
                              }`}
                            >
                              <Link
                                to={`/catalog?category_id=${category.id}`}
                                className="text-xs font-semibold text-neutral-950 hover:text-accent transition-colors"
                              >
                                {activeLocale === 'en' ? "Show all" : "Tout afficher"}
                              </Link>
                              {category.sub_categories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={`/catalog?category_id=${category.id}&sub_category_id=${sub.id}`}
                                  className="text-xs text-neutral-500 hover:text-accent transition-colors"
                                >
                                  {tName(sub.name, activeLocale)}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : (
                          <Link
                            to={`/catalog?category_id=${category.id}`}
                            className="block py-4 text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-accent transition-colors"
                          >
                            {tName(category.name, activeLocale)}
                          </Link>
                        )}
                      </div>
                    );
                  })
                )}
              </nav>
            </div>

            {/* Inspirations & Services */}
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-3">
                {activeLocale === 'en' ? "Inspirations" : "Inspirations"}
              </span>
              <ul className="flex flex-col gap-3.5 text-xs text-neutral-600">
                <li>
                  <Link 
                    to="/catalog?featured=true" 
                    className="flex items-center gap-2.5 hover:text-accent transition-colors font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-accent shrink-0" />
                    <span>{activeLocale === 'en' ? "House Essentials" : "Les Essentiels de la Maison"}</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/order-tracking" 
                    className="flex items-center gap-2.5 hover:text-accent transition-colors font-medium"
                  >
                    <Package className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{activeLocale === 'en' ? "Track my order" : "Suivre ma commande"}</span>
                  </Link>
                </li>
              </ul>
            </div>

          </div>

          {/* Section bas (Devises, Compte, etc.) */}
          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col gap-4">
            
            {/* Sélecteur de Devise */}
            <div className="flex items-center justify-between bg-neutral-50 px-3.5 py-2.5 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{activeLocale === 'en' ? "Currency" : "Devise"}</span>
              <select
                value={activeCurrency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="text-xs font-black uppercase bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0 text-neutral-900"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code} className="text-neutral-900 bg-white">
                    {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélecteur de Langue */}
            <div className="flex items-center justify-between bg-neutral-50 px-3.5 py-2.5 border border-neutral-100">
              <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{activeLocale === 'en' ? "Language" : "Langue"}</span>
              <select
                value={activeLocale}
                onChange={(e) => changeLocale(e.target.value)}
                className="text-xs font-black uppercase bg-transparent border-0 cursor-pointer focus:outline-none focus:ring-0 text-neutral-900"
              >
                {locales.map(l => (
                  <option key={l.code} value={l.code} className="text-neutral-900 bg-white">
                    {l.code === 'en' ? 'ENG' : 'FR'}
                  </option>
                ))}
              </select>
            </div>

            {/* Compte Utilisateur */}
            {isAuthenticated ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 px-1">
                  <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center font-bold text-xs text-neutral-700">
                    {customerUser.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-neutral-800 line-clamp-1">{customerUser.name}</p>
                    <p className="text-[10px] text-neutral-400 line-clamp-1">{customerUser.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    customerLogout();
                    onClose();
                  }}
                  className="w-full text-center border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-bold uppercase tracking-widest py-2.5 transition-colors font-semibold"
                >
                  {activeLocale === 'en' ? "Log out" : "Déconnexion"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth(); // Ouvre le tiroir de connexion
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-neutral-800 text-white text-[10px] font-bold uppercase tracking-widest py-3 transition-colors font-semibold shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>{activeLocale === 'en' ? "Log in" : "Se connecter"}</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
