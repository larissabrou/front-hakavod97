import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import productService from '../../services/api/productService';
import storeService from '../../services/api/storeService';
import { adaptProduct } from './Catalog';
import ProductCard from '../../components/product/ProductCard';
import ProductLoader from '../../components/ui/ProductLoader';

const CONTENT = {
  fr: {
    scroll: "Défiler",
    house_selection: "Sélection de la Maison",
    featured_products: "Produits à la une",
    loading_featured: "Chargement des produits à la une...",
    featured_error: "Impossible de charger les produits à la une pour le moment.",
    no_featured: "Aucun produit à la une disponible pour le moment.",
    our_craftsmanship: "Notre Savoir-Faire",
    handmade_title: "Fait à la main,<br />conçu pour durer.",
    craftsmanship_desc: "Chaque paire Ha-Kavod 97 passe par les mains de nos artisans cordonniers. Cuirs sélectionnés, coutures renforcées, finitions inspectées pièce par pièce — car nous ne faisons aucun compromis sur la qualité.",
    craftsmanship_items: [
      'Cuirs pleine fleur issus de tanneries certifiées',
      'Coutures Blake ou Goodyear welt selon les modèles',
      'Doublure intérieure en veau plongé',
      'Garantie artisanale 2 ans'
    ],
    marquee: ['Cuir Pleine Fleur', '·', 'Savoir-Faire', '·', 'Artisanat', '·', 'Élégance', '·', 'Ha-Kavod 97', '·', 'Collection 2025', '·', 'Livraison Mondiale', '·'],
    counter_exclusive_models: "Modèles exclusifs",
    counter_shipping_countries: "Pays de livraison",
    counter_satisfaction: "Satisfaction client %",
    counter_pairs_sold: "Paires vendues",
    cta_subtitle: "Collection 2025",
    cta_title: "Votre Prochaine<br />Paire Vous Attend.",
    cta_btn: "Explorer la boutique",
    view_product: "Voir le produit",
    prev: "Précédent",
    next: "Suivant",
    scroll_down: "Défiler vers le bas"
  },
  en: {
    scroll: "Scroll",
    house_selection: "House Selection",
    featured_products: "Featured Products",
    loading_featured: "Loading featured products...",
    featured_error: "Unable to load featured products at this time.",
    no_featured: "No featured products available at the moment.",
    our_craftsmanship: "Our Craftsmanship",
    handmade_title: "Handmade,<br />built to last.",
    craftsmanship_desc: "Every Ha-Kavod 97 pair goes through the hands of our artisan shoemakers. Selected leathers, reinforced stitching, piece-by-piece inspected finishes — because we make no compromises on quality.",
    craftsmanship_items: [
      'Full-grain leathers from certified tanneries',
      'Blake or Goodyear welt stitching depending on models',
      'Lined inside with soft calfskin',
      '2-year artisan warranty'
    ],
    marquee: ['Full Grain Leather', '·', 'Know-How', '·', 'Craftsmanship', '·', 'Elegance', '·', 'Ha-Kavod 97', '·', '2025 Collection', '·', 'Worldwide Delivery', '·'],
    counter_exclusive_models: "Exclusive Models",
    counter_shipping_countries: "Shipping Countries",
    counter_satisfaction: "Customer Satisfaction %",
    counter_pairs_sold: "Pairs Sold",
    cta_subtitle: "2025 Collection",
    cta_title: "Your Next<br />Pair Awaits You.",
    cta_btn: "Explore the Store",
    view_product: "View Product",
    prev: "Previous",
    next: "Next",
    scroll_down: "Scroll down"
  }
};


// ── Images ─────────────────────────────────────────────────────────────────
const HERO_IMG      = '/hero.png';
const OXFORD_IMG    = '/home4.jpeg';
const SNEAKER_IMG   = '/home3.jpeg';
const CHELSEA_IMG   = 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&auto=format&fit=crop&q=85';
const CRAFT_IMG     = '/home1.jpeg';
const LIFESTYLE_IMG = 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=1200&auto=format&fit=crop&q=85';

// ── Hook de révélation au scroll ───────────────────────────────────────────
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

// ── Compteur animé ─────────────────────────────────────────────────────────
const Counter = ({ end, label }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center reveal-scale" style={{ transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
      <p className="text-4xl md:text-6xl font-black text-white tracking-tight">{count}+</p>
      <p className="text-xs font-bold tracking-widest uppercase text-neutral-400 mt-2">{label}</p>
    </div>
  );
};

// ── Bande marquee ──────────────────────────────────────────────────────────
const MARQUEE_WORDS = ['Cuir Pleine Fleur', '·', 'Savoir-Faire', '·', 'Artisanat', '·', 'Élégance', '·', 'Ha-Kavod 97', '·', 'Collection 2025', '·', 'Livraison Mondiale', '·'];

// ── Données par défaut pour les sections dynamiques ───────────────────────
const DEFAULT_PROMO_SECTIONS = [
  {
    id: "promo-1",
    tag: "Collection Signature",
    title_line1: "Derby Oxford",
    title_line2: "Cuir Grainé",
    title_line2_italic: false,
    description: "L'élégance à l'état pur. Confectionné en cuir grainé pleine fleur, ce Derby Oxford incarne la sobriété raffinée qui définit Ha-Kavod 97. La semelle en cuir et la doublure intérieure garantissent un confort incomparable.",
    price: 125000,
    old_price: 150000,
    discount: "-17%",
    sizes: ['39', '40', '41', '42', '43', '44'],
    image: OXFORD_IMG,
    link: null,
    badge: "Best-seller",
    layout: "image-left",
    active: true
  },
  {
    id: "promo-2",
    tag: "Urban Luxe",
    title_line1: "Sneaker Cuir",
    title_line2: "Blanc",
    title_line2_italic: true,
    description: "La sneaker réinventée par Ha-Kavod 97. Silhouette minimaliste, cuir pleine fleur traité à la main, semelle Vibram ultra-confort. Elle transcende les codes du streetwear pour atteindre l'excellence du luxe contemporain.",
    price: 98000,
    old_price: null,
    discount: null,
    sizes: ['38', '39', '40', '41', '42', '43'],
    image: SNEAKER_IMG,
    link: null,
    badge: null,
    layout: "image-right",
    active: true
  }
];

const DEFAULT_TOP_SLIDES = [
  {
    id: "top-default-1",
    type: "image",
    tag: "Maison de Souliers",
    title_line1: "L'Art du",
    title_line2_italic: "Soulier",
    description: "Chaque paire est une déclaration. Des matières nobles, un savoir-faire artisanal, une esthétique sans compromis.",
    image: HERO_IMG,
    link_primary: "/catalog",
    link_primary_label: "Découvrir",
    link_secondary: "/catalog?category=nouveautes",
    link_secondary_label: "Nouveautés",
    active: true
  }
];

const DEFAULT_SLIDES = [
  {
    id: "default-1",
    tag: "Automne / Hiver",
    title: "Chelsea Boot",
    subtitle: "Cuir Suédé",
    description: "L'élégance décontractée à son apogée. Cuir suédé tanné végétal, élastiques sur les côtés en cuir de veau, semelle Goodyear welt cousue main.",
    price: 144000,
    old_price: 175000,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=1200&auto=format&fit=crop&q=85",
    link: "/catalog",
    active: true
  },
  {
    id: "default-2",
    tag: "Collection Signature",
    title: "Derby Oxford",
    subtitle: "Cuir Grainé",
    description: "L'élégance à l'état pur. Confectionné en cuir grainé pleine fleur, ce Derby Oxford incarne la sobriété raffinée qui définit Ha-Kavod 97.",
    price: 125000,
    old_price: 150000,
    image: "/home4.jpeg",
    link: "/catalog",
    active: true
  },
  {
    id: "default-3",
    tag: "Urban Luxe",
    title: "Sneaker Cuir",
    subtitle: "Blanc",
    description: "La sneaker réinventée par Ha-Kavod 97. Silhouette minimaliste, cuir pleine fleur traité à la main, semelle Vibram ultra-confort.",
    price: 98000,
    old_price: null,
    image: "/home3.jpeg",
    link: "/catalog",
    active: true
  }
];

// ── Composant PromoSection ──────────────────────────────────────────────────
const PromoSection = ({ section, index, formatPrice, nextSectionRef, viewProductLabel }) => {
  const [txtRef, txtV] = useReveal(0.15);
  const [imgRef, imgV] = useReveal(0.1);

  const isImageLeft = section.layout === 'image-left';
  const isDarkTheme = index % 2 === 0;

  const bgClass = isDarkTheme ? 'bg-[#17070a]' : 'bg-[#f5efe6]'; 
  const textColor = isDarkTheme ? 'text-white' : 'text-[#17070a]';
  const descColor = isDarkTheme ? 'text-neutral-400' : 'text-[#5e5243]';
  const imgBgClass = isDarkTheme ? 'bg-[#2a131a]' : 'bg-[#eae3d8]'; 
  
  // Format old price & calculate discount percent if compare_at_price is set
  const priceVal = section.price ?? 0;
  const oldPriceVal = section.old_price;
  let discountPercent = section.discount;
  if (!discountPercent && oldPriceVal && oldPriceVal > priceVal) {
    const pct = Math.round(((oldPriceVal - priceVal) / oldPriceVal) * 100);
    discountPercent = `-${pct}%`;
  }

  return (
    <section ref={index === 0 ? nextSectionRef : null} className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[85vh]">
      {/* Image Column */}
      <div
        ref={imgRef}
        className={`relative ${imgBgClass} min-h-[500px] lg:min-h-auto p-8 lg:p-14 flex items-center justify-center ${isImageLeft ? 'order-1 reveal-left' : 'order-1 lg:order-2 reveal-right'} ${imgV ? 'revealed' : ''}`}
      >
        <div className="relative w-full h-full min-h-[400px] bg-white shadow-sm overflow-hidden group">
          <img src={section.image} alt={section.title_line1} className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-black/5" />
          
          {section.badge && (
            <span className="absolute top-6 left-6 text-[9px] tracking-[0.3em] uppercase font-bold bg-[#c5a059] text-white px-3 py-1.5 shadow-sm z-10">
              {section.badge}
            </span>
          )}
        </div>
      </div>

      {/* Text Column */}
      <div
        ref={txtRef}
        className={`flex flex-col justify-center px-8 md:px-16 lg:px-24 py-16 md:py-24 ${bgClass} ${isImageLeft ? 'order-2 reveal-right' : 'order-2 lg:order-1 reveal-left'} ${txtV ? 'revealed' : ''}`}
      >
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#c5a059] mb-3">{section.tag || 'Collection Signature'}</p>
        
        <h2 className={`text-3xl md:text-5xl font-black ${textColor} uppercase leading-[1.15] tracking-tight whitespace-pre-line`}>
          {section.title_line1}
          {section.title_line2 && (
            <>
              <br />
              {section.title_line2}
            </>
          )}
        </h2>
        
        {section.description && (
          <>
            <div className="w-16 h-[1.5px] bg-[#c5a059] my-6" />
            <p className={`${descColor} leading-relaxed text-xs md:text-sm max-w-md`}>
              {section.description}
            </p>
          </>
        )}
        
        <div className="flex items-center gap-3.5 mt-8 flex-wrap">
          <span className={`text-2xl md:text-3xl font-black ${textColor}`}>{formatPrice(priceVal)}</span>
          {oldPriceVal && (
            <span className="text-sm md:text-lg text-[#9c9284] line-through">{formatPrice(oldPriceVal)}</span>
          )}
          {discountPercent && (
            <span className="text-[9px] font-bold text-[#c5a059] bg-[#c5a059]/10 px-2 py-1 border border-[#c5a059]/20 uppercase tracking-widest">
              {discountPercent}
            </span>
          )}
        </div>

        {section.sizes && section.sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {section.sizes.map((s) => (
              <span key={s} className={`w-11 h-11 border ${isDarkTheme ? 'border-neutral-700 bg-transparent text-white hover:border-white' : 'border-[#e7e0d2] bg-white text-[#17070a] hover:border-[#17070a]'} flex items-center justify-center text-xs font-semibold cursor-pointer transition-all duration-200`}>
                {s}
              </span>
            ))}
          </div>
        )}

        <Link
          to={section.link || '/catalog'}
          className={`group mt-8 inline-flex items-center gap-3 ${isDarkTheme ? 'bg-white text-[#17070a] hover:bg-[#c5a059] hover:text-white' : 'bg-[#17070a] hover:bg-[#c5a059] text-white'} font-bold px-10 py-4 text-xs uppercase tracking-widest transition-all duration-300 self-start`}
        >
          {viewProductLabel} <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </section>
  );
};

const SlideVideo = ({ src, isActive }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(err => {
        console.log("Autoplay blocked or interrupted:", err);
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
  );
};

// ── Composant principal ────────────────────────────────────────────────────
export const Home = () => {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const { formatPrice, activeLocale } = useSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState('');
  const nextSectionRef = useRef(null);


  const [slides, setSlides] = useState(DEFAULT_SLIDES);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const [topSlides, setTopSlides] = useState(DEFAULT_TOP_SLIDES);
  const [currentTopSlide, setCurrentTopSlide] = useState(0);
  const [topAutoplay, setTopAutoplay] = useState(true);
  const [homeBlocks, setHomeBlocks] = useState([]);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (nextFn, prevFn) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;

    // Ignore swipe if vertical movement is larger than horizontal movement
    if (Math.abs(diffY) > Math.abs(diffX)) {
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchEndX.current = 0;
      touchEndY.current = 0;
      return;
    }

    const isLeftSwipe = diffX > 50;
    const isRightSwipe = diffX < -50;

    if (isLeftSwipe) {
      nextFn();
    } else if (isRightSwipe) {
      prevFn();
    }

    // Reset
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    touchEndY.current = 0;
  };





  const activeTopSlides = topSlides.filter(s => s.active).length > 0
    ? topSlides.filter(s => s.active)
    : DEFAULT_TOP_SLIDES;

  const tContent = CONTENT[activeLocale === 'en' ? 'en' : 'fr'];

  const displayTopSlides = activeTopSlides.map(slide => {
    if (activeLocale === 'en') {
      if (slide.id === 'top-default-1' || 
          slide.tag === "Maison de Souliers" || 
          slide.title_line1 === "L'Art du" || 
          (slide.title_line1 && slide.title_line1.includes("L'Art du"))) {
        return {
          ...slide,
          tag: "House of Shoes",
          title_line1: "The Art of",
          title_line2_italic: "Shoemaking",
          description: "Each pair is a statement. Noble materials, artisanal craftsmanship, uncompromising aesthetics.",
          link_primary_label: "Discover",
          link_secondary_label: "New Arrivals"
        };
      }
      let primaryLabel = slide.link_primary_label;
      if (primaryLabel === "Découvrir") primaryLabel = "Discover";
      let secondaryLabel = slide.link_secondary_label;
      if (secondaryLabel === "Nouveautés") secondaryLabel = "New Arrivals";
      return {
        ...slide,
        link_primary_label: primaryLabel,
        link_secondary_label: secondaryLabel
      };
    }
    return slide;
  });

  // Gérer l'autoplay du haut
  useEffect(() => {
    if (!topAutoplay || displayTopSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTopSlide(prev => (prev + 1) % displayTopSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [topAutoplay, displayTopSlides.length]);

  // Sécurité pour l'index hors limites du haut
  useEffect(() => {
    if (currentTopSlide >= displayTopSlides.length) {
      setCurrentTopSlide(0);
    }
  }, [displayTopSlides.length, currentTopSlide]);

  const nextTopSlide = () => {
    setCurrentTopSlide(prev => (prev + 1) % displayTopSlides.length);
  };

  const prevTopSlide = () => {
    setCurrentTopSlide(prev => (prev - 1 + displayTopSlides.length) % displayTopSlides.length);
  };





  const activeSlides = slides.filter(s => s.active).length > 0
    ? slides.filter(s => s.active)
    : DEFAULT_SLIDES;

  const displaySlides = activeSlides.map(slide => {
    if (activeLocale === 'en') {
      if (slide.id === 'default-1' || slide.tag === "Automne / Hiver" || slide.subtitle === "Cuir Suédé" || slide.subtitle === "Suede Leather") {
        return {
          ...slide,
          tag: "Autumn / Winter",
          title: "Chelsea Boot",
          subtitle: "Suede Leather",
          description: "Casual elegance at its peak. Vegetable-tanned suede leather, calfskin side elastics, hand-stitched Goodyear welt sole."
        };
      }
      if (slide.id === 'default-2' || slide.tag === "Collection Signature" || slide.subtitle === "Cuir Grainé" || slide.subtitle === "Grained Leather") {
        return {
          ...slide,
          tag: "Signature Collection",
          title: "Derby Oxford",
          subtitle: "Grained Leather",
          description: "Pure elegance. Crafted in full-grain grained leather, this Derby Oxford embodies the refined simplicity that defines Ha-Kavod 97."
        };
      }
      if (slide.id === 'default-3' || slide.tag === "Urban Luxe" || slide.subtitle === "Blanc" || slide.title === "Sneaker Cuir" || slide.title === "Leather Sneaker") {
        return {
          ...slide,
          tag: "Urban Luxe",
          title: "Leather Sneaker",
          subtitle: "White",
          description: "The sneaker reinvented by Ha-Kavod 97. Minimalist silhouette, hand-treated full-grain leather, ultra-comfortable Vibram sole."
        };
      }
    }
    return slide;
  });

  // Gérer l'autoplay
  useEffect(() => {
    if (!autoplay || displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % displaySlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [autoplay, displaySlides.length]);

  // Sécurité pour l'index hors limites
  useEffect(() => {
    if (currentSlide >= displaySlides.length) {
      setCurrentSlide(0);
    }
  }, [displaySlides.length, currentSlide]);

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % displaySlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const [promoSections, setPromoSections] = useState(DEFAULT_PROMO_SECTIONS);

  const activePromoSections = promoSections.filter(s => s.active).length > 0
    ? promoSections.filter(s => s.active)
    : DEFAULT_PROMO_SECTIONS;

  const displayPromoSections = activePromoSections.map(section => {
    if (activeLocale === 'en') {
      if (section.id === 'promo-1' || section.title_line1 === "Derby Oxford" || section.title_line2 === "Cuir Grainé" || section.title_line2 === "Grained Leather") {
        return {
          ...section,
          tag: "Signature Collection",
          title_line1: "Derby Oxford",
          title_line2: "Grained Leather",
          description: "Pure elegance. Crafted in full-grain grained leather, this Derby Oxford embodies the refined simplicity that defines Ha-Kavod 97. The leather sole and inner lining guarantee incomparable comfort.",
          badge: "Bestseller"
        };
      }
      if (section.id === 'promo-2' || section.title_line1 === "Sneaker Cuir" || section.title_line1 === "Leather Sneaker" || section.title_line2 === "Blanc" || section.title_line2 === "White") {
        return {
          ...section,
          tag: "Urban Luxe",
          title_line1: "Leather Sneaker",
          title_line2: "White",
          description: "The sneaker reinvented by Ha-Kavod 97. Minimalist silhouette, hand-treated full-grain leather, ultra-comfortable Vibram sole. It transcends streetwear codes to achieve the excellence of contemporary luxury."
        };
      }
    }
    return section;
  });

  // Refs de révélation par section
  const [s4,    s4V]      = useReveal(0.1);
  const [s5img, s5imgV]   = useReveal(0.1);
  const [s5txt, s5txtV]   = useReveal(0.15);
  const [s5bar, s5barV]   = useReveal(0.2);
  const [s6,    s6V]      = useReveal(0.1);
  const [s7,    s7V]      = useReveal(0.1);

  useEffect(() => {
    const loadHomeData = async () => {
      // 1. Charger les produits à la une (cartes produits du carrousel horizontal)
      setFeaturedLoading(true);
      setFeaturedError('');
      try {
        const data = await productService.getProducts({ featured: true });
        const items = Array.isArray(data) ? data.map(adaptProduct).filter(Boolean) : [];
        setFeaturedProducts(items);
      } catch (error) {
        console.error('Erreur de chargement des produits à la une:', error);
        setFeaturedError(tContent.featured_error || 'Impossible de charger les produits à la une.');
      } finally {
        setFeaturedLoading(false);
      }

      // 2. Charger les slides du carrousel de la page d'accueil (Hero haut et slider bas)
      try {
        const params = { lang: activeLocale };
        const slidesData = await storeService.getHomeSlides(params);
        console.log("DEBUG: storeService.getHomeSlides returned:", slidesData);
        if (Array.isArray(slidesData) && slidesData.length > 0) {
          // Fallback au cas où l'API ne renvoie pas le champ 'layout'
          const processedSlides = slidesData.map(s => ({
            ...s,
            layout: s.layout || (s.price !== undefined && s.price !== null ? 'split' : 'full')
          }));
          
          const fullSlides = processedSlides.filter(s => s.layout === 'full');
          const splitSlides = processedSlides.filter(s => s.layout === 'split');

          if (fullSlides.length > 0) {
            setTopSlides(fullSlides.map((s, idx) => ({
              id: s.id || `top-api-${idx}`,
              type: s.secondary_image_url ? 'video' : 'image',
              tag: s.tag || s.label || '',
              title_line1: s.title_line1 || s.title || '',
              title_line2_italic: s.title_line2_italic || s.subtitle || '',
              description: s.description || '',
              image: s.image_url || s.image || HERO_IMG,
              link_primary: s.link_primary || s.cta_url || '/catalog',
              link_primary_label: s.link_primary_label || s.cta_text || (activeLocale === 'en' ? 'Discover' : 'Découvrir'),
              link_secondary: s.link_secondary || s.secondary_cta_url || '',
              link_secondary_label: s.link_secondary_label || s.secondary_cta_text || '',
              active: s.active !== false
            })));
          }

          if (splitSlides.length > 0) {
            setSlides(splitSlides.map((s, idx) => ({
              id: s.id || `split-api-${idx}`,
              tag: s.label || '',
              title: s.title || '',
              subtitle: s.subtitle || '',
              description: s.description || '',
              price: s.price,
              old_price: s.compare_at_price,
              image: s.image_url || SNEAKER_IMG,
              link: s.cta_url || '/catalog',
              active: true
            })));
          }
        }
      } catch (err) {
        window.HERO_DEBUG_ERROR = err.message;
        console.warn("Impossible de charger les slides de l'API, utilisation des valeurs par défaut :", err);
      }

      // 3. Charger les sections promotionnelles (HomeFeaturedProducts - split layout)
      try {
        const params = { lang: activeLocale };
        const featuredPromoData = await storeService.getHomeFeaturedProducts(params);
        if (Array.isArray(featuredPromoData) && featuredPromoData.length > 0) {
          // Pour chaque section sans description, aller chercher celle du produit associé
          const enriched = await Promise.all(featuredPromoData.map(async (item) => {
            let description = item.description || item.short_description || item.product?.description || item.product?.short_description || '';
            const identifier = item.product_slug || item.product_id;
            
            if (!description && identifier) {
              try {
                const prodData = await productService.getProductById(identifier);
                const p = prodData?.data ?? prodData;
                description = p?.description || p?.short_description || '';
              } catch (_) { /* silencieux */ }
            }
            
            // Si toujours pas de description, fallback extrême (pour débuguer visuellement)
            if (!description) {
               description = "Découvrez ce produit exceptionnel. " + (item.title || '');
            }
            
            // Strip HTML from description if present
            if (typeof description === 'string') {
              description = description.replace(/<[^>]+>/g, '').trim();
              if (description.length > 250) {
                description = description.substring(0, 247) + '...';
              }
            }
            
            return { ...item, description };
          }));
          setPromoSections(enriched.map((item, idx) => ({
            id: item.id || `promo-api-${idx}`,
            tag: item.label || '',
            title_line1: item.title || '',
            title_line2: '',
            title_line2_italic: false,
            description: item.description || '',
            price: item.price,
            old_price: item.compare_at_price,
            discount: item.discount_percent ? `-${item.discount_percent}%` : null,
            sizes: item.sizes || [],
            image: item.image_url || CRAFT_IMG,
            link: `/product/${item.product_id}`,
            badge: item.badge || null,
            layout: idx % 2 === 0 ? "image-left" : "image-right",
            active: true
          })));
        }
      } catch (err) {
        console.warn("Impossible de charger les sections promo de l'API, utilisation des valeurs par défaut :", err);
      }

      // 4. Charger les blocs éditoriaux (savoir-faire)
      try {
        const params = { lang: activeLocale };
        const blocksData = await storeService.getHomeBlocks(params);
        if (Array.isArray(blocksData)) {
          setHomeBlocks(blocksData);
        }
      } catch (err) {
        console.warn("Impossible de charger les blocs éditoriaux de l'API :", err);
      }
    };

    loadHomeData();
  }, [activeLocale]);

  return (
    <div className="flex flex-col bg-neutral-50 overflow-x-hidden">

      {/* ═══════════════════════════════════════
          SECTION 1 – HERO PLEIN ÉCRAN
      ═══════════════════════════════════════ */}
      <section
        className="relative w-full h-gradient-mobile md:h-screen h-[75vh] min-h-[450px] md:min-h-[700px] flex items-end justify-start overflow-hidden bg-neutral-950"
        onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setTopAutoplay(false)}
        onMouseLeave={() => window.matchMedia('(hover: hover)').matches && setTopAutoplay(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => handleTouchEnd(nextTopSlide, prevTopSlide)}
      >
        {displayTopSlides.map((slide, idx) => {
          const isActive = idx === currentTopSlide;
          const isVideo = slide.type === 'video';
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex items-end transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Vidéo ou Image */}
              {isVideo ? (
                <SlideVideo src={slide.image} isActive={isActive} />
              ) : (
                <img
                  src={slide.image}
                  alt={slide.title_line1}
                  className={`absolute inset-0 w-full h-full object-cover object-center ${isActive ? 'animate-ken-burns' : ''}`}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />

              {/* Texte hero — transitions fluides */}
              <div className="relative z-10 px-6 md:px-16 pb-12 md:pb-20 max-w-3xl">
                <p className={`text-[11px] font-bold tracking-[0.4em] uppercase text-accent mb-4 transition-all duration-700 delay-100 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {slide.tag}
                </p>
                <h1 className={`text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-white uppercase leading-[0.9] tracking-tight transition-all duration-700 delay-200 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {slide.title_line1}<br />
                  <span className="italic font-light">{slide.title_line2_italic}</span>
                </h1>
                <p className={`mt-4 md:mt-6 text-neutral-300 text-xs md:text-lg max-w-xl leading-relaxed font-light transition-all duration-700 delay-300 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  {slide.description}
                </p>
                <div className={`flex flex-wrap items-center gap-4 md:gap-6 mt-6 md:mt-10 transition-all duration-700 delay-400 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <Link
                    to={slide.link_primary || "/catalog"}
                    className="group flex items-center gap-3 bg-white text-neutral-900 hover:bg-accent hover:text-white font-bold px-6 md:px-8 py-3.5 md:py-4 text-xs md:text-sm uppercase tracking-widest transition-all duration-300"
                  >
                    {slide.link_primary_label}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    to={slide.link_secondary || "/catalog?category=nouveautes"}
                    className="nav-underline text-white font-semibold text-sm tracking-wider hover:text-accent transition-colors"
                  >
                    {slide.link_secondary_label}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}


        {/* Indicateurs (dots en barres horizontales) */}
        {displayTopSlides.length > 1 && (
          <div className="absolute bottom-6 left-8 md:left-16 z-20 flex gap-3">
            {displayTopSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTopSlide(idx)}
                className={`h-1 transition-all duration-300 border-0 p-0 cursor-pointer ${
                  idx === currentTopSlide ? 'bg-accent w-12' : 'bg-white/30 w-6 hover:bg-white'
                }`}
                title={activeLocale === 'en' ? `Go to slide ${idx + 1}` : `Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Indicateur scroll flottant */}
        <button
          onClick={() => nextSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="animate-float absolute bottom-8 right-8 flex flex-col items-center gap-2 text-white/50 hover:text-accent cursor-pointer border-0 bg-transparent focus:outline-none transition-colors z-20"
          title={tContent.scroll_down}
        >
          <ArrowDown className="w-5 h-5" />
          <span className="text-[9px] tracking-[0.3em] uppercase font-semibold">{tContent.scroll}</span>
        </button>
      </section>

      {/* ── BANDE MARQUEE ── */}
      <div className="w-full bg-neutral-950 py-3 overflow-hidden border-y border-neutral-800">
        <div className="marquee-track">
          {[...tContent.marquee, ...tContent.marquee].map((w, i) => (
            <span key={i} className={`px-6 text-[11px] font-bold tracking-[0.3em] uppercase whitespace-nowrap ${w === '·' ? 'text-accent' : 'text-neutral-500'}`}>
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════
          SECTION 2 – PRODUITS À LA UNE
      ═══════════════════════════════════════ */}
      <section className="w-full bg-neutral-50 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-3">{tContent.house_selection}</p>
              <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase tracking-tight">{tContent.featured_products}</h2>
            </div>
          </div>

          {featuredLoading || featuredError ? (
            <ProductLoader text={tContent.loading_featured} />
          ) : featuredProducts.length === 0 ? (
            <div className="py-16 text-center text-neutral-500">{tContent.no_featured}</div>
          ) : (
            <div className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory md:snap-none gap-6 pb-6 md:pb-0 scrollbar-none md:grid-cols-4 w-full">
              {featuredProducts.map((product) => (
                <div key={product.id} className="w-[70vw] sm:w-[45vw] md:w-full shrink-0 snap-start">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
          
          {/* Séparateur élégant */}
          <div className="border-t border-neutral-300 mt-16" />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTIONS PROMOTIONNELLES (DYNAMIQUES)
      ═══════════════════════════════════════ */}
      {displayPromoSections.map((section, idx) => (
        <PromoSection 
          key={section.id} 
          section={section} 
          index={idx} 
          formatPrice={formatPrice} 
          nextSectionRef={nextSectionRef} 
          viewProductLabel={tContent.view_product}
        />
      ))}

      {/* ═══════════════════════════════════════
          SECTION 4 – CHELSEA BOOT (pleine largeur)
      ═══════════════════════════════════════ */}
      <section
        ref={s4}
        className={`relative w-full h-[70vh] md:h-[85vh] min-h-[450px] md:min-h-[600px] flex items-end overflow-hidden reveal-scale ${s4V ? 'revealed' : ''}`}
        onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setAutoplay(false)}
        onMouseLeave={() => window.matchMedia('(hover: hover)').matches && setAutoplay(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => handleTouchEnd(nextSlide, prevSlide)}
      >
        {displaySlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full flex items-end transition-opacity duration-1000 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover object-center ${isActive ? 'animate-ken-burns' : ''}`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              <div className="relative z-10 w-full flex flex-col md:flex-row items-start md:items-end justify-between px-6 md:px-16 pb-12 md:pb-16 gap-6 md:gap-8">
                <div className={`max-w-xl transition-all duration-700 delay-100 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-3">{slide.tag}</p>
                  <h2 className="text-2xl sm:text-3xl md:text-6xl font-black text-white uppercase leading-tight tracking-tight">
                    {slide.title}<br />
                    <span className="italic font-light">{slide.subtitle}</span>
                  </h2>
                  <p className="mt-2 md:mt-4 text-neutral-300 text-xs md:text-sm leading-relaxed max-w-md">
                    {slide.description}
                  </p>
                </div>
                <div className={`flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto gap-4 transition-all duration-700 delay-200 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl md:text-3xl font-black text-white">
                      {slide.price ? formatPrice(slide.price) : ''}
                    </span>
                    {slide.old_price && (
                      <span className="text-sm md:text-lg text-neutral-400 line-through">
                        {formatPrice(slide.old_price)}
                      </span>
                    )}
                  </div>
                  <Link
                    to={slide.link || '/catalog'}
                    className="group inline-flex items-center gap-2 md:gap-3 bg-accent hover:bg-white text-neutral-900 font-black px-6 md:px-10 py-3 md:py-4 text-xs md:text-sm uppercase tracking-widest transition-all duration-300 whitespace-nowrap"
                  >
                    {tContent.view_product}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Flèches de navigation */}
        {displaySlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-accent hover:text-neutral-900 text-white hidden md:flex items-center justify-center transition-all cursor-pointer border-0"
              title={tContent.prev}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-black/40 hover:bg-accent hover:text-neutral-900 text-white hidden md:flex items-center justify-center transition-all cursor-pointer border-0"
              title={tContent.next}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Indicateurs (dots) */}
        {displaySlides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {displaySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 transition-all border-0 p-0 cursor-pointer ${
                  idx === currentSlide ? 'bg-accent w-6' : 'bg-white/40 hover:bg-white'
                }`}
                title={activeLocale === 'en' ? `Go to slide ${idx + 1}` : `Aller à la diapositive ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 – ARTISANAT (BLOCS ÉDITORIAUX DYNAMIQUES OU FALLBACK)
      ═══════════════════════════════════════ */}
      {homeBlocks.filter(b => b.slug !== 'cta').length > 0 ? (
        homeBlocks.filter(b => b.slug !== 'cta').map((block, idx) => {
          const isImageLeft = block.layout === 'split' && idx % 2 === 0;
          return (
            <section key={block.id || idx} className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
              {/* Image */}
              <div
                className={`img-zoom relative min-h-[400px] ${isImageLeft ? 'order-1 lg:order-1' : 'order-1 lg:order-2'}`}
              >
                <img src={block.image_url} alt={block.title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Texte */}
              <div
                className={`flex flex-col justify-center px-10 md:px-16 py-16 bg-neutral-50 ${isImageLeft ? 'order-2 lg:order-2' : 'order-2 lg:order-1'}`}
              >
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-4">{block.label}</p>
                <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase leading-tight tracking-tight">
                  {block.title}
                </h2>
                <div className="w-12 h-0.5 bg-accent my-6" />
                <p className="text-neutral-500 text-sm leading-loose max-w-sm">
                  {block.description}
                </p>
                {block.bullets && block.bullets.length > 0 && (
                  <ul className="mt-8 flex flex-col gap-3 text-left">
                    {block.bullets.map((bullet, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-neutral-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          );
        })
      ) : (
        <section className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]">
          {/* Image */}
          <div
            ref={s5img}
            className={`img-zoom relative min-h-[400px] reveal-left ${s5imgV ? 'revealed' : ''}`}
          >
            <img src={CRAFT_IMG} alt="Savoir-faire artisanal" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
          </div>

          {/* Texte */}
          <div
            ref={s5txt}
            className={`flex flex-col justify-center px-10 md:px-16 py-16 bg-neutral-50 reveal-right ${s5txtV ? 'revealed' : ''}`}
          >
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-accent mb-4">{tContent.our_craftsmanship}</p>
            <h2 className="text-3xl md:text-4xl font-black text-neutral-900 uppercase leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: tContent.handmade_title }} />
            <div
              ref={s5bar}
              className={`w-12 h-0.5 bg-accent my-6 reveal-bar ${s5barV ? 'revealed' : ''}`}
            />
            <p className="text-neutral-500 text-sm leading-loose max-w-sm">
              {tContent.craftsmanship_desc}
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {tContent.craftsmanship_items.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 text-sm text-neutral-600 reveal-hidden ${s5txtV ? 'revealed' : ''}`}
                  style={{ transitionDelay: `${0.1 + i * 0.12}s` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}      {/* ═══════════════════════════════════════
          SECTION 6 – CHIFFRES CLÉS
      ═══════════════════════════════════════ */}
      <section
        ref={s6}
        className={`bg-neutral-950 py-10 md:py-20 px-4 md:px-8 reveal-hidden ${s6V ? 'revealed' : ''}`}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12">
          <Counter end={12}   label={tContent.counter_exclusive_models} />
          <Counter end={7}    label={tContent.counter_shipping_countries} />
          <Counter end={97}   label={tContent.counter_satisfaction} />
          <Counter end={2000} label={tContent.counter_pairs_sold} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 7 – CTA LIFESTYLE
      ═══════════════════════════════════════ */}
      {(() => {
        const ctaBlock = homeBlocks.find(b => b.slug === 'cta');
        const showDynamic = ctaBlock && ctaBlock.is_active !== false;
        const btnLink = showDynamic ? (ctaBlock.bullets?.[0] || '/catalog') : '/catalog';
        const imgVAlignRaw = showDynamic ? (ctaBlock.bullets?.[1] || '50') : '50';
        const overlayOpacity = showDynamic ? (ctaBlock.bullets?.[2] || '60') : '60';
        const useParallax = showDynamic ? (ctaBlock.bullets?.[3] === 'true') : false;
        const imgHAlignRaw = showDynamic ? (ctaBlock.bullets?.[4] || '50') : '50';
        const bannerHeightRaw = showDynamic ? (ctaBlock.bullets?.[5] || '60') : '60';
        const imgFit = showDynamic ? (ctaBlock.bullets?.[6] || 'cover') : 'cover';
        
        // Convert old legacy layout words if any
        const imgVAlign = imgVAlignRaw === 'top' ? '0%' : imgVAlignRaw === 'center' ? '50%' : imgVAlignRaw === 'bottom' ? '100%' : (isNaN(Number(imgVAlignRaw)) ? imgVAlignRaw : `${imgVAlignRaw}%`);
        const imgHAlign = imgHAlignRaw === 'left' ? '0%' : imgHAlignRaw === 'center' ? '50%' : imgHAlignRaw === 'right' ? '100%' : (isNaN(Number(imgHAlignRaw)) ? imgHAlignRaw : `${imgHAlignRaw}%`);
        
        let heightStyle = { minHeight: '300px' };
        if (bannerHeightRaw === 'small') heightStyle.height = '40vh';
        else if (bannerHeightRaw === 'medium') heightStyle.height = '60vh';
        else if (bannerHeightRaw === 'large') heightStyle.height = '80vh';
        else if (bannerHeightRaw === 'full') heightStyle.height = '100vh';
        else if (!isNaN(Number(bannerHeightRaw))) heightStyle.height = `${bannerHeightRaw}vh`;
        else heightStyle.height = '60vh';
        
        const sectionStyle = useParallax ? {
          backgroundImage: `url(${showDynamic ? (ctaBlock.image_url || LIFESTYLE_IMG) : LIFESTYLE_IMG})`,
          backgroundAttachment: 'fixed',
          backgroundPosition: `${imgHAlign} ${imgVAlign}`,
          backgroundSize: imgFit,
          backgroundRepeat: 'no-repeat',
          ...heightStyle
        } : heightStyle;
        
        return (
          <section
            ref={s7}
            style={sectionStyle}
            className={`relative w-full flex items-center justify-center overflow-hidden reveal-scale ${s7V ? 'revealed' : ''}`}
          >
            {!useParallax && (
              <img 
                src={showDynamic ? (ctaBlock.image_url || LIFESTYLE_IMG) : LIFESTYLE_IMG} 
                alt="Ha-Kavod 97 lifestyle" 
                style={{ objectFit: imgFit, objectPosition: `${imgHAlign} ${imgVAlign}` }}
                className="absolute inset-0 w-full h-full" 
              />
            )}
            <div className="absolute inset-0" style={{ backgroundColor: `rgba(0, 0, 0, ${Number(overlayOpacity) / 100})` }} />
            <div className={`relative z-10 text-center px-4 reveal-hidden ${s7V ? 'revealed' : ''}`}>
              <p className="text-[11px] font-bold tracking-[0.5em] uppercase text-accent mb-4 animate-pulse-soft">
                {showDynamic ? ctaBlock.label : tContent.cta_subtitle}
              </p>
              <h2 
                className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight" 
                dangerouslySetInnerHTML={{ __html: showDynamic ? ctaBlock.title.replace(/\n/g, '<br />') : tContent.cta_title }} 
              />
              <Link
                to={showDynamic ? (ctaBlock.bullets?.[0] || '/catalog') : '/catalog'}
                className="group mt-10 inline-flex items-center gap-3 bg-accent hover:bg-white text-neutral-900 font-black px-12 py-5 text-sm uppercase tracking-widest transition-all duration-300"
              >
                {showDynamic ? (ctaBlock.description || 'Explorer la boutique') : tContent.cta_btn}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>
        );
      })()}

    </div>
  );
};

export default Home;
