import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { useSettings } from '../../hooks/useSettings';

/**
 * Header storefront – transparent au sommet, opaque au scroll.
 * Micro-animations : slide-down entrée, nav-underline hover, logo scale, badge panier.
 */
export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { getCartCount } = useCart();
  const { activeLocale, changeLocale } = useSettings();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500
        ${scrolled
          ? 'bg-neutral-50/97 shadow-[0_1px_20px_rgba(0,0,0,0.08)] backdrop-blur-md border-b border-neutral-200/70'
          : 'bg-transparent border-b border-white/10 backdrop-blur-sm'
        }
        ${mounted ? 'animate-fade-in' : 'opacity-0'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">

        {/* ── Logo gauche ── */}
        <Link to="/" className="flex items-center group shrink-0">
          <img
            src="/logo.png"
            alt="HA-KAVOD 97 Logo"
            className="h-14 md:h-16 w-auto object-contain transition-all duration-550 group-hover:scale-105 group-hover:drop-shadow-lg"
          />
        </Link>

        {/* ── Recherche centre ── */}
        <div className={`hidden md:flex items-center gap-2 py-1.5 px-3 w-64 border transition-all duration-300 ${
          scrolled ? 'border-neutral-200 bg-neutral-50/60' : 'border-white/20 bg-white/10'
        }`}>
          <Search className={`w-4 h-4 shrink-0 transition-colors duration-300 ${scrolled ? 'text-neutral-400' : 'text-white/60'}`} />
          <input
            type="text"
            placeholder={activeLocale === 'en' ? "Search for an item..." : "Rechercher un article..."}
            className={`bg-transparent text-xs w-full focus:outline-none font-medium placeholder-current transition-colors duration-300 ${
              scrolled ? 'text-neutral-700 placeholder-neutral-400' : 'text-white/90 placeholder-white/40'
            }`}
          />
        </div>

        {/* ── Actions droite ── */}
        <div className="flex items-center gap-5">

          {/* Sélecteur de langue */}
          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-widest mr-2 select-none">
            <button
              onClick={() => changeLocale('fr')}
              className={`transition-colors duration-200 cursor-pointer ${
                activeLocale === 'fr' 
                  ? (scrolled ? 'text-neutral-900 border-b border-neutral-900' : 'text-white border-b border-white') 
                  : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              FR
            </button>
            <span className="text-neutral-500">/</span>
            <button
              onClick={() => changeLocale('en')}
              className={`transition-colors duration-200 cursor-pointer ${
                activeLocale === 'en' 
                  ? (scrolled ? 'text-neutral-900 border-b border-neutral-900' : 'text-white border-b border-white') 
                  : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              EN
            </button>
          </div>

          {/* Icônes */}
          {[
            { icon: User,  label: activeLocale === 'en' ? 'My account' : 'Mon compte', href: null },
            { icon: Heart, label: activeLocale === 'en' ? 'Favorites' : 'Favoris',    href: null },
          ].map(({ icon: Icon, label, href }) => (
            <button
              key={label}
              title={label}
              className={`relative p-2 transition-all duration-200 group ${
                scrolled ? 'text-neutral-700 hover:text-primary' : 'text-white/80 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </button>
          ))}

          {/* Panier */}
          <Link
            to="/cart"
            title={activeLocale === 'en' ? "Cart" : "Panier"}
            className={`relative p-2 transition-all duration-200 group ${
              scrolled ? 'text-neutral-700 hover:text-primary' : 'text-white/80 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            {getCartCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center animate-scale-in px-1">
                {getCartCount()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

