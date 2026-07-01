import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Check, X, ArrowRight, Image as ImageIcon, Video as VideoIcon, Sliders, LayoutGrid } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import productService from '../../services/api/productService';
import adminService from '../../services/api/adminService';
import storeService from '../../services/api/storeService';

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

const DEFAULT_TOP_SLIDES = [
  {
    id: "top-default-1",
    type: "image", // 'image' | 'video'
    tag: "Maison de Souliers",
    title_line1: "L'Art du",
    title_line2_italic: "Soulier",
    description: "Chaque paire est une déclaration. Des matières nobles, un savoir-faire artisanal, une esthétique sans compromis.",
    image: "/hero.png",
    link_primary: "/catalog",
    link_primary_label: "Découvrir",
    link_secondary: "/catalog?category=nouveautes",
    link_secondary_label: "Nouveautés",
    active: true
  }
];

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

export const HeroSlides = ({
  isDarkMode,
  showConfirm,
  showAlert,
  setSuccess,
  setError,
  initialSection = 'top',
  hideTabs = false
}) => {
  const { formatPrice } = useSettings();
  
  // Onglet de gestion : 'top' (En-tête), 'middle' (Milieu/ Chelsea) ou 'menu_banners' (Méga Menu)
  const [activeSection, setActiveSection] = useState(initialSection);
  
  // Données
  const [middleSlides, setMiddleSlides] = useState([]);
  const [topSlides, setTopSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [menuBanners, setMenuBanners] = useState({});
  const [bannerSaveStatus, setBannerSaveStatus] = useState({});
  const [loadingData, setLoadingData] = useState(false);

  // Configuration dynamique du Footer
  const [footerConfig, setFooterConfig] = useState({
    description: '',
    phone: '',
    email: '',
    socials: { whatsapp: '', facebook: '', twitter: '', instagram: '', tiktok: '' },
    country: '',
    columns: []
  });
  const [footerSaveState, setFooterSaveState] = useState('idle');
  
  // États de formulaire et Modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSlide, setPreviewSlide] = useState(null);

  const [formData, setFormData] = useState({
    // Champs communs
    active: true,
    image: '',
    description: '',
    
    // Section 'middle' uniquement
    tag: '',
    title: '',
    subtitle: '',
    price: '',
    old_price: '',
    link: '',

    // Section 'top' uniquement
    type: 'image', // 'image' | 'video'
    title_line1: '',
    title_line2_italic: '',
    link_primary: '',
    link_primary_label: 'Découvrir',
    link_secondary: '',
    link_secondary_label: 'Nouveautés'
  });

  // Charger les slides depuis localStorage au montage ou changement
  useEffect(() => {
    // 1 & 2. Charger les Slides depuis l'API ou localement
    const loadSlides = async () => {
      try {
        const slidesData = await storeService.getHomeSlides();
        if (Array.isArray(slidesData) && slidesData.length > 0) {
          const fullSlides = slidesData.filter(s => s.layout === 'full');
          const splitSlides = slidesData.filter(s => s.layout === 'split');

          if (fullSlides.length > 0) {
            const mappedTop = fullSlides.map((s, idx) => ({
              id: s.id || `top-api-${idx}`,
              type: s.secondary_image_url ? 'video' : 'image',
              tag: s.label || '',
              title_line1: s.title || '',
              title_line2_italic: s.subtitle || '',
              description: s.description || '',
              image: s.image_url || '',
              link_primary: s.cta_url || '',
              link_primary_label: s.cta_text || 'Découvrir',
              link_secondary: s.secondary_cta_url || '',
              link_secondary_label: s.secondary_cta_text || '',
              active: s.active !== false
            }));
            setTopSlides(mappedTop);
            localStorage.setItem('main_hero_slides', JSON.stringify(mappedTop));
          } else {
            loadTopSlidesFallback();
          }

          if (splitSlides.length > 0) {
            const mappedMiddle = splitSlides.map((s, idx) => ({
              id: s.id || `split-api-${idx}`,
              tag: s.label || '',
              title: s.title || '',
              subtitle: s.subtitle || '',
              description: s.description || '',
              price: s.price || 0,
              old_price: s.compare_at_price || 0,
              image: s.image_url || '',
              link: s.cta_url || '',
              active: s.active !== false
            }));
            setMiddleSlides(mappedMiddle);
            localStorage.setItem('home_hero_slides', JSON.stringify(mappedMiddle));
          } else {
            loadMiddleSlidesFallback();
          }
          return;
        }
      } catch (e) {
        console.warn("Échec de chargement des slides depuis l'API, utilisation du cache local.", e);
      }

      loadTopSlidesFallback();
      loadMiddleSlidesFallback();
    };

    const loadTopSlidesFallback = () => {
      const storedTop = localStorage.getItem('main_hero_slides');
      if (storedTop) {
        try { setTopSlides(JSON.parse(storedTop)); }
        catch (e) { setTopSlides(DEFAULT_TOP_SLIDES); }
      } else {
        setTopSlides(DEFAULT_TOP_SLIDES);
      }
    };

    const loadMiddleSlidesFallback = () => {
      const storedMiddle = localStorage.getItem('home_hero_slides');
      if (storedMiddle) {
        try { setMiddleSlides(JSON.parse(storedMiddle)); }
        catch (e) { setMiddleSlides(DEFAULT_SLIDES); }
      } else {
        setMiddleSlides(DEFAULT_SLIDES);
      }
    };

    // 3. Charger les bannières du Méga Menu depuis l'API ou localement
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

      const storedBanners = localStorage.getItem('category_banner_products');
      if (storedBanners) {
        try { setMenuBanners(JSON.parse(storedBanners)); }
        catch (e) { console.error(e); }
      }
    };

    // 5. Charger la configuration du footer depuis l'API ou le localStorage
    const loadFooterConfig = async () => {
      try {
        const data = await storeService.getFooter();
        if (data) {
          const config = data.data || data;
          if (config && (config.columns || config.description)) {
            setFooterConfig(config);
            localStorage.setItem('storefront_footer_config', JSON.stringify(config));
            return;
          }
        }
      } catch (e) {
        console.warn("Échec de récupération du footer depuis l'API, utilisation du cache local.", e);
      }

      const storedFooter = localStorage.getItem('storefront_footer_config');
      if (storedFooter) {
        try { setFooterConfig(JSON.parse(storedFooter)); }
        catch (e) { console.error(e); }
      } else {
        const defaultFooter = {
          description: "Maison de haute couture et de maroquinerie d'exception. HA-KAVOD 97 incarne l'alliance parfaite de l'élégance intemporelle et du raffinement contemporain.",
          phone: "0850 333 22 86",
          email: "contact@hakavok.com",
          socials: {
            whatsapp: "https://wa.me/22507000000",
            facebook: "https://facebook.com/hakavod97",
            twitter: "https://twitter.com/hakavod97",
            instagram: "https://instagram.com/hakavod97",
            tiktok: "https://tiktok.com/@hakavod97"
          },
          country: "Côte d'Ivoire (XOF)",
          columns: [
            {
              title: "Boutique",
              links: [
                { name: "Robes", url: "/catalog?category_id=1" },
                { name: "Sacs", url: "/catalog?category_id=2" },
                { name: "Chaussures", url: "/catalog?category_id=3" },
                { name: "Accessoires", url: "/catalog?category_id=4" }
              ]
            },
            {
              title: "Aide",
              links: [
                { name: "Suivi de commande", url: "/order-tracking", icon: "track" },
                { name: "Livraison & Retours", url: "#", icon: "return" },
                { name: "F.A.Q", url: "#" }
              ]
            },
            {
              title: "Maison",
              links: [
                { name: "L'esprit de la Maison", url: "#" },
                { name: "Notre engagement", url: "#" },
                { name: "Services de Conciergerie", url: "#" }
              ]
            }
          ]
        };
        setFooterConfig(defaultFooter);
      }
    };

    // 4. Charger les catégories et produits de l'API
    const loadApiData = async () => {
      setLoadingData(true);
      try {
        const [cats, prods] = await Promise.all([
          productService.getCategories(),
          productService.getProducts()
        ]);
        if (cats) setCategories(cats);
        if (prods) setProducts(prods);
      } catch (err) {
        console.error("Erreur lors de la récupération des données API pour les bannières", err);
      } finally {
        setLoadingData(false);
      }
    };

    loadSlides();
    loadBanners();
    loadFooterConfig();
    loadApiData();
  }, []);

  const handleSaveBanner = async (categoryId, productId) => {
    setBannerSaveStatus(prev => ({ ...prev, [categoryId]: 'saving' }));
    
    const updatedBanners = {
      ...menuBanners,
      [categoryId]: productId ? Number(productId) : null
    };
    
    if (!productId) {
      delete updatedBanners[categoryId];
    }
    
    try {
      setMenuBanners(updatedBanners);
      localStorage.setItem('category_banner_products', JSON.stringify(updatedBanners));
      
      // Sauvegarder dans le backend via l'API
      await adminService.updateMenuBanners(updatedBanners);
      
      setBannerSaveStatus(prev => ({ ...prev, [categoryId]: 'saved' }));
    } catch (err) {
      console.error("Erreur de sauvegarde de la bannière sur le serveur", err);
      // Fallback
      setBannerSaveStatus(prev => ({ ...prev, [categoryId]: 'saved' }));
    } finally {
      setTimeout(() => {
        setBannerSaveStatus(prev => ({ ...prev, [categoryId]: 'idle' }));
      }, 2000);
    }
  };

  const handleSaveFooter = async (e) => {
    e.preventDefault();
    setFooterSaveState('saving');
    try {
      // 1. Sauvegarder localement dans localStorage
      localStorage.setItem('storefront_footer_config', JSON.stringify(footerConfig));
      
      // 2. Envoyer la configuration au serveur backend via l'API
      await adminService.updateFooterConfig(footerConfig);
      
      setFooterSaveState('saved');
    } catch (err) {
      console.error("Erreur de sauvegarde du footer sur le serveur", err);
      // Fallback : On indique quand même que c'est enregistré (car sauvegardé dans localStorage)
      setFooterSaveState('saved');
    } finally {
      setTimeout(() => {
        setFooterSaveState('idle');
      }, 2000);
    }
  };

  const handleColumnTitleChange = (colIdx, value) => {
    const updatedCols = [...footerConfig.columns];
    updatedCols[colIdx].title = value;
    setFooterConfig({ ...footerConfig, columns: updatedCols });
  };

  const handleLinkChange = (colIdx, linkIdx, field, value) => {
    const updatedCols = [...footerConfig.columns];
    updatedCols[colIdx].links[linkIdx] = {
      ...updatedCols[colIdx].links[linkIdx],
      [field]: value
    };
    setFooterConfig({ ...footerConfig, columns: updatedCols });
  };

  const handleAddLink = (colIdx) => {
    const updatedCols = [...footerConfig.columns];
    if (!updatedCols[colIdx].links) updatedCols[colIdx].links = [];
    updatedCols[colIdx].links.push({ name: 'Nouveau lien', url: '#' });
    setFooterConfig({ ...footerConfig, columns: updatedCols });
  };

  const handleRemoveLink = (colIdx, linkIdx) => {
    const updatedCols = [...footerConfig.columns];
    updatedCols[colIdx].links.splice(linkIdx, 1);
    setFooterConfig({ ...footerConfig, columns: updatedCols });
  };

  // Sauvegarder dans localStorage (uniquement pour le cache)
  const saveToLocal = (updated, section) => {
    if (section === 'middle') {
      setMiddleSlides(updated);
      localStorage.setItem('home_hero_slides', JSON.stringify(updated));
    } else {
      setTopSlides(updated);
      localStorage.setItem('main_hero_slides', JSON.stringify(updated));
    }
  };

  const mapToApiSlide = (s, section) => {
    if (section === 'middle') {
      return {
        layout: 'split',
        label: s.tag || '',
        title: s.title || '',
        subtitle: s.subtitle || '',
        description: s.description || '',
        price: s.price ? Number(s.price) : null,
        compare_at_price: s.old_price ? Number(s.old_price) : null,
        image: s.image || '',
        image_url: s.image || '',
        cta_url: s.link || '',
        active: s.active !== false ? 1 : 0
      };
    } else {
      return {
        layout: 'full',
        type: s.type || 'image',
        label: s.tag || '',
        title: s.title_line1 || '',
        subtitle: s.title_line2_italic || '',
        description: s.description || '',
        image: s.image || '',
        image_url: s.image || '',
        cta_url: s.link_primary || '',
        cta_text: s.link_primary_label || '',
        secondary_cta_url: s.link_secondary || '',
        secondary_cta_text: s.link_secondary_label || '',
        active: s.active !== false ? 1 : 0
      };
    }
  };

  // Gérer l'upload de médias
  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file); // Save for API upload
    setImageLoading(true);
    const isVideo = file.type.startsWith('video/');
    
    // Limiter la taille à 4.5 Mo pour éviter de saturer le localStorage (limite max locale ~ 5 Mo)
    const maxSize = 4.5 * 1024 * 1024;
    if (file.size > maxSize) {
      showAlert(`Le fichier est trop volumineux pour le stockage local. Taille maximale : 4.5 Mo. Pour les fichiers plus lourds, veuillez copier/coller une URL directe.`);
    }

    setImageLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image: reader.result }));
      setImageLoading(false);
    };
    reader.onerror = () => {
      showAlert("Erreur lors de la lecture du fichier.");
      setImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Gérer la création
  const handleCreate = () => {
    setEditingSlide(null);
    setSelectedFile(null);
    if (activeSection === 'middle') {
      setFormData({
        active: true,
        image: '',
        description: '',
        tag: 'Nouveautés',
        title: '',
        subtitle: '',
        price: '',
        old_price: '',
        link: '/catalog',
        type: 'image'
      });
    } else {
      setFormData({
        active: true,
        image: '',
        description: '',
        type: 'image',
        tag: 'Maison de Souliers',
        title_line1: '',
        title_line2_italic: '',
        link_primary: '/catalog',
        link_primary_label: 'Découvrir',
        link_secondary: '/catalog?category=nouveautes',
        link_secondary_label: 'Nouveautés'
      });
    }
    setIsModalOpen(true);
  };

  // Gérer l'édition
  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setSelectedFile(null);
    if (activeSection === 'middle') {
      setFormData({
        active: slide.active !== undefined ? slide.active : true,
        image: slide.image || '',
        description: slide.description || '',
        tag: slide.tag || '',
        title: slide.title || '',
        subtitle: slide.subtitle || '',
        price: slide.price || '',
        old_price: slide.old_price || '',
        link: slide.link || '',
        type: 'image'
      });
    } else {
      setFormData({
        active: slide.active !== undefined ? slide.active : true,
        image: slide.image || '',
        description: slide.description || '',
        type: slide.type || 'image',
        tag: slide.tag || '',
        title_line1: slide.title_line1 || '',
        title_line2_italic: slide.title_line2_italic || '',
        link_primary: slide.link_primary || '',
        link_primary_label: slide.link_primary_label || 'Découvrir',
        link_secondary: slide.link_secondary || '',
        link_secondary_label: slide.link_secondary_label || 'Nouveautés'
      });
    }
    setIsModalOpen(true);
  };

  // Supprimer une diapositive
  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Supprimer la diapositive',
      description: 'Êtes-vous sûr de vouloir supprimer cette diapositive ?',
      warningText: 'Cette action est irréversible et retirera immédiatement le visuel de la boutique en ligne.'
    });
    if (!confirmed) return;

    try {
      if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('default-') && !id.startsWith('top-') && !id.startsWith('middle-'))) {
        await adminService.deleteHomeSlide(id);
      }
      const currentList = activeSection === 'middle' ? middleSlides : topSlides;
      const filtered = currentList.filter(s => s.id !== id);
      saveToLocal(filtered, activeSection);
      if (previewSlide && previewSlide.id === id) {
        setPreviewSlide(null);
      }
      if (setSuccess) {
        setSuccess('Diapositive supprimée avec succès.');
      }
    } catch (err) {
      showAlert("Erreur lors de la suppression : " + (err?.response?.data?.message || err.message));
    }
  };

  // Activer / Désactiver
  const toggleActive = async (id) => {
    const currentList = activeSection === 'middle' ? middleSlides : topSlides;
    const slide = currentList.find(s => s.id === id);
    if (!slide) return;
    
    try {
      const isRealId = typeof id === 'number' || (typeof id === 'string' && !id.startsWith('default-') && !id.startsWith('top-') && !id.startsWith('middle-'));
      if (isRealId) {
        await adminService.updateHomeSlide(id, { active: !slide.active });
      }
      const updated = currentList.map(s => s.id === id ? { ...s, active: !s.active } : s);
      saveToLocal(updated, activeSection);
    } catch (err) {
      showAlert("Erreur lors de l'activation : " + (err?.response?.data?.message || err.message));
    }
  };

  // Enregistrer le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      showAlert("Le média (image ou vidéo) est obligatoire.");
      return;
    }

    const currentList = activeSection === 'middle' ? middleSlides : topSlides;
    let slideData = {};

    if (activeSection === 'middle') {
      slideData = {
        tag: formData.tag,
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        price: formData.price ? Number(formData.price) : null,
        old_price: formData.old_price ? Number(formData.old_price) : null,
        image: formData.image,
        link: formData.link || '/catalog',
        active: formData.active !== false
      };
    } else {
      slideData = {
        type: formData.type,
        tag: formData.tag,
        title_line1: formData.title_line1,
        title_line2_italic: formData.title_line2_italic,
        description: formData.description,
        image: formData.image,
        link_primary: formData.link_primary || '/catalog',
        link_primary_label: formData.link_primary_label || 'Découvrir',
        link_secondary: formData.link_secondary || '/catalog?category=nouveautes',
        link_secondary_label: formData.link_secondary_label || 'Nouveautés',
        active: formData.active !== false
      };
    }

    try {
      let updated;
      const apiPayload = mapToApiSlide(slideData, activeSection);
      let savedSlideId = null;

      if (editingSlide) {
        const isRealId = typeof editingSlide.id === 'number' || (typeof editingSlide.id === 'string' && !editingSlide.id.startsWith('default-') && !editingSlide.id.startsWith('top-') && !editingSlide.id.startsWith('middle-'));
        if (isRealId) {
          const res = await adminService.updateHomeSlide(editingSlide.id, apiPayload);
          savedSlideId = res.data?.id || res.id || editingSlide.id;
        }
        updated = currentList.map(s => s.id === editingSlide.id ? { ...s, ...slideData } : s);
        if (setSuccess) setSuccess("Diapositive mise à jour !");
      } else {
        const res = await adminService.addHomeSlide(apiPayload);
        savedSlideId = res.data?.id || res.id;
        const newSlide = {
          ...slideData,
          id: savedSlideId || `${activeSection}-${Date.now()}`
        };
        updated = [...currentList, newSlide];
        if (setSuccess) setSuccess("Nouvelle diapositive ajoutée !");
      }

      // S'il y a un fichier sélectionné, on l'uploade via le point d'accès dédié
      if (selectedFile && savedSlideId) {
        try {
          const fd = new FormData();
          fd.append('image', selectedFile);
          const uploadRes = await adminService.uploadHomeSlideImage(savedSlideId, fd);
          // Si l'upload retourne l'image mise à jour, on met à jour notre state
          const newImageUrl = uploadRes.data?.image || uploadRes.data?.image_url || uploadRes.image || uploadRes.image_url;
          if (newImageUrl) {
            updated = updated.map(s => s.id === (editingSlide ? editingSlide.id : savedSlideId) ? { ...s, image: newImageUrl } : s);
          }
        } catch (uploadErr) {
          console.error("Erreur lors de l'upload de l'image:", uploadErr);
          showAlert("La diapositive a été sauvegardée, mais l'image n'a pas pu être envoyée. " + (uploadErr?.response?.data?.message || ''));
        }
      }

      saveToLocal(updated, activeSection);
      setIsModalOpen(false);
      setSelectedFile(null);
    } catch (err) {
      console.error("Erreur API:", err);
      let errorMsg = err?.response?.data?.message || err.message;
      if (err?.response?.data?.errors) {
        errorMsg += "\\n" + JSON.stringify(err.response.data.errors, null, 2);
      }
      showAlert("Erreur lors de la sauvegarde : " + errorMsg);
    }
  };

  const currentSlidesList = activeSection === 'middle' ? middleSlides : topSlides;

  return (
    <div className="space-y-8 animate-fade-in text-xs">
      
      {!hideTabs && (
        <div className={`flex border-b mb-6 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
          <button
            onClick={() => { setActiveSection('top'); setPreviewSlide(null); }}
            className={`py-3 px-6 font-bold uppercase tracking-wider text-[10.5px] border-b-2 transition-all ${
              activeSection === 'top'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-400 hover:text-neutral-950'
            }`}
          >
            Carrousel Principal (Haut)
          </button>
          <button
            onClick={() => { setActiveSection('middle'); setPreviewSlide(null); }}
            className={`py-3 px-6 font-bold uppercase tracking-wider text-[10.5px] border-b-2 transition-all ${
              activeSection === 'middle'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-400 hover:text-neutral-950'
            }`}
          >
            Carrousel Produits (Milieu)
          </button>
          <button
            onClick={() => { setActiveSection('menu_banners'); setPreviewSlide(null); }}
            className={`py-3 px-6 font-bold uppercase tracking-wider text-[10.5px] border-b-2 transition-all ${
              activeSection === 'menu_banners'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-400 hover:text-neutral-950'
            }`}
          >
            Méga Menu (Bannières)
          </button>
          <button
            onClick={() => { setActiveSection('footer_config'); setPreviewSlide(null); }}
            className={`py-3 px-6 font-bold uppercase tracking-wider text-[10.5px] border-b-2 transition-all ${
              activeSection === 'footer_config'
                ? 'border-accent text-accent'
                : 'border-transparent text-neutral-400 hover:text-neutral-950'
            }`}
          >
            Footer
          </button>
        </div>
      )}

      {activeSection !== 'menu_banners' && (
        <>
          {/* Titre et Bouton */}
          <div className="flex justify-between items-center">
            <h3 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Diapositives Actives ({currentSlidesList.filter(s => s.active).length} / {currentSlidesList.length})
            </h3>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1.5 bg-primary hover:bg-neutral-900 text-white font-bold uppercase tracking-widest py-2.5 px-5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Ajouter une diapositive
            </button>
          </div>

          {/* Liste des diapositives */}
          <div className={`border shadow-2xs overflow-hidden ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b font-bold uppercase tracking-widest text-[9.5px] ${isDarkMode ? 'border-neutral-800 bg-neutral-950 text-neutral-400' : 'border-neutral-100 bg-neutral-50 text-neutral-500'}`}>
                    <th className="py-3 px-4">Médias</th>
                    <th className="py-3 px-4">Détails</th>
                    <th className="py-3 px-4">Lien / Info</th>
                    <th className="py-3 px-4 text-center">Statut</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100" style={{ borderColor: isDarkMode ? '#2d251d' : '#f1f1f1' }}>
                  {currentSlidesList.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-neutral-500 uppercase tracking-wider text-[10px]">
                        Aucune diapositive configurée pour cette section.
                      </td>
                    </tr>
                  ) : (
                    currentSlidesList.map((slide) => {
                      const isVideo = slide.type === 'video';
                      return (
                        <tr 
                          key={slide.id} 
                          className={`group hover:bg-neutral-50/50 transition-colors ${isDarkMode ? 'hover:bg-neutral-800/30 text-neutral-300' : 'text-neutral-700'}`}
                        >
                          <td className="py-3 px-4">
                            <div className="relative w-24 h-14 bg-neutral-150 overflow-hidden border border-neutral-200 flex items-center justify-center">
                              {isVideo ? (
                                slide.image.startsWith('data:video/') ? (
                                  <video src={slide.image} className="w-full h-full object-cover" muted />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-800 text-white gap-1 text-[8px]">
                                    <VideoIcon className="w-4 h-4 text-accent" />
                                    <span>Vidéo URL</span>
                                  </div>
                                )
                              ) : slide.image ? (
                                <img src={slide.image} alt={slide.title || slide.title_line1} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                              
                              {/* Badge de Type de média pour la section du haut */}
                              {activeSection === 'top' && (
                                <span className="absolute bottom-0 right-0 bg-neutral-950/80 text-white font-bold text-[7px] uppercase tracking-wider px-1 py-0.5">
                                  {slide.type === 'video' ? 'Vidéo' : 'Image'}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {activeSection === 'middle' ? (
                              <div>
                                <span className="text-[9.5px] font-bold tracking-widest uppercase text-accent mb-0.5 block">
                                  {slide.tag || 'Sans Catégorie'}
                                </span>
                                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                                  {slide.title} <span className="font-light italic">{slide.subtitle}</span>
                                </p>
                                <p className="text-[10px] text-neutral-400 max-w-sm truncate mt-1">
                                  {slide.description}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-[9.5px] font-bold tracking-widest uppercase text-accent mb-0.5 block">
                                  {slide.tag || 'Hero Haut'}
                                </span>
                                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                                  {slide.title_line1} <span className="font-light italic text-neutral-400">{slide.title_line2_italic}</span>
                                </p>
                                <p className="text-[10px] text-neutral-400 max-w-sm truncate mt-1">
                                  {slide.description}
                                </p>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[10.5px]">
                            {activeSection === 'middle' ? (
                              <div className="flex flex-col">
                                <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                                  {slide.price ? formatPrice(slide.price) : 'Aucun tarif'}
                                </span>
                                <span className="text-[9.5px] text-neutral-400 tracking-wider">
                                  Lien : {slide.link}
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-neutral-400 block font-normal">
                                  Bouton 1 : <strong className={isDarkMode ? 'text-white' : 'text-neutral-900'}>{slide.link_primary_label}</strong> ({slide.link_primary})
                                </span>
                                <span className="text-neutral-400 block font-normal">
                                  Bouton 2 : <strong className={isDarkMode ? 'text-white' : 'text-neutral-900'}>{slide.link_secondary_label}</strong> ({slide.link_secondary})
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => toggleActive(slide.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider rounded-none border transition-all ${
                                slide.active
                                  ? 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
                                  : 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400 hover:bg-neutral-500/20'
                              }`}
                            >
                              {slide.active ? (
                                <>
                                  <Eye className="w-3 h-3" /> Actif
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3" /> Inactif
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setPreviewSlide(slide)}
                                className={`p-1.5 border hover:bg-neutral-900 hover:text-white transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:border-neutral-600' : 'border-neutral-200 text-neutral-500 hover:border-neutral-800'}`}
                                title="Prévisualiser"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleEdit(slide)}
                                className={`p-1.5 border hover:bg-accent hover:text-white transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:border-accent' : 'border-neutral-200 text-neutral-500 hover:border-accent'}`}
                                title="Modifier"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(slide.id)}
                                className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-550 hover:text-white transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── APERÇU EN DIRECT (PREVIEW) ── */}
          {previewSlide && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className={`text-xs font-bold uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  Aperçu en direct : {activeSection === 'middle' ? previewSlide.title : previewSlide.title_line1}
                </h4>
                <button 
                  onClick={() => setPreviewSlide(null)}
                  className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-600"
                >
                  Fermer l'aperçu
                </button>
              </div>
              
              {activeSection === 'middle' ? (
                // Aperçu Section 4
                <div className="relative w-full h-[320px] bg-neutral-950 flex items-end overflow-hidden border border-neutral-800">
                  <img src={previewSlide.image} alt={previewSlide.title} className="absolute inset-0 w-full h-full object-cover object-center opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                  
                  <div className="relative z-10 w-full flex flex-row items-end justify-between px-8 pb-8 gap-4 text-left">
                    <div className="max-w-md">
                      <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-accent mb-2 block">{previewSlide.tag}</span>
                      <h2 className="text-2xl font-black text-white uppercase leading-tight tracking-tight">
                        {previewSlide.title}<br />
                        <span className="italic font-light text-neutral-300">{previewSlide.subtitle}</span>
                      </h2>
                      <p className="mt-2 text-neutral-400 text-[10px] leading-relaxed max-w-xs line-clamp-2">
                        {previewSlide.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-white">{previewSlide.price ? formatPrice(previewSlide.price) : ''}</span>
                        {previewSlide.old_price && (
                          <span className="text-xs text-neutral-500 line-through">{formatPrice(previewSlide.old_price)}</span>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-accent text-neutral-900 font-bold px-5 py-2 text-[10px] uppercase tracking-wider">
                        Voir le produit
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Aperçu Section 1 (Top Hero)
                <div className="relative w-full h-[360px] bg-neutral-950 flex items-end justify-start overflow-hidden border border-neutral-800">
                  {previewSlide.type === 'video' ? (
                    <video src={previewSlide.image} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover object-center opacity-80" />
                  ) : (
                    <img src={previewSlide.image} alt={previewSlide.title_line1} className="absolute inset-0 w-full h-full object-cover object-center opacity-80" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 to-transparent" />
                  
                  <div className="relative z-10 px-8 pb-10 text-left max-w-lg">
                    <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-accent mb-2 block">{previewSlide.tag}</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white uppercase leading-[0.95] tracking-tight">
                      {previewSlide.title_line1}<br />
                      <span className="italic font-light text-neutral-300">{previewSlide.title_line2_italic}</span>
                    </h2>
                    <p className="mt-3 text-neutral-400 text-[10px] leading-relaxed max-w-xs line-clamp-2">
                      {previewSlide.description}
                    </p>
                    <div className="flex items-center gap-4 mt-6">
                      <div className="bg-white text-neutral-900 font-bold px-5 py-2 text-[10px] uppercase tracking-widest">
                        {previewSlide.link_primary_label}
                      </div>
                      <span className="text-white text-[10.5px] font-semibold border-b border-transparent hover:border-accent">
                        {previewSlide.link_secondary_label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── SECTION CONFIGURATION DES BANNIÈRES DU MÉGA MENU ── */}
      {activeSection === 'menu_banners' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className={`p-4 border border-dashed rounded-none ${isDarkMode ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50/50'}`}>
            <p className={`text-[11px] leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
              Cette section vous permet de choisir quel produit (et donc quelle image et quelles informations) s'affiche comme bannière promotionnelle dans l'encart droit du Méga Menu pour chaque catégorie. Par défaut, le système sélectionne automatiquement le premier produit de la catégorie.
            </p>
          </div>

          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              <span className={`uppercase font-bold tracking-widest text-[9.5px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Chargement des catégories et des produits...
              </span>
            </div>
          ) : categories.length === 0 ? (
            <div className={`p-8 text-center border uppercase tracking-wider text-[10px] ${isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'}`}>
              Aucune catégorie disponible sur la boutique.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {categories.map((category) => {
                const selectedProdId = menuBanners[category.id] || '';
                const categoryProducts = products.filter(p => p.category_id === category.id);
                const otherProducts = products.filter(p => p.category_id !== category.id);
                
                // Trouver le produit sélectionné ou par défaut
                let activeProduct = null;
                if (selectedProdId) {
                  activeProduct = products.find(p => p.id == selectedProdId);
                } else if (categoryProducts.length > 0) {
                  activeProduct = categoryProducts[0];
                }
                
                const productImage = getProductImage(activeProduct);
                const finalImage = productImage || getCategoryFallbackImage(category.name);
                const saveState = bannerSaveStatus[category.id] || 'idle';

                return (
                  <div 
                    key={category.id} 
                    className={`border shadow-2xs flex flex-col md:flex-row gap-6 p-5 transition-all ${
                      isDarkMode 
                        ? 'bg-neutral-900 border-neutral-850 hover:border-neutral-800' 
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    {/* Colonne gauche : Formulaire */}
                    <div className="flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <span className="text-[9px] font-bold tracking-[0.25em] uppercase text-accent mb-1 block">
                          Catégorie Principale
                        </span>
                        <h4 className={`text-sm font-extrabold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                          {category.name}
                        </h4>
                        {category.sub_categories && category.sub_categories.length > 0 && (
                          <p className="text-[10px] text-neutral-400 mt-1">
                            Sous-catégories : {category.sub_categories.map(s => s.name).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={`font-bold uppercase tracking-wider text-[9px] ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          Produit mis en avant
                        </label>
                        <select
                          value={selectedProdId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMenuBanners(prev => ({ ...prev, [category.id]: val ? Number(val) : '' }));
                          }}
                          className={`border py-2 px-3 text-[11px] focus:outline-none focus:border-neutral-850 rounded-none w-full ${
                            isDarkMode 
                              ? 'bg-neutral-850 border-neutral-700 text-white' 
                              : 'bg-white border-neutral-200 text-neutral-800'
                          }`}
                        >
                          <option value="">Sélection automatique (Premier produit de la catégorie)</option>
                          
                          {categoryProducts.length > 0 && (
                            <optgroup label="Produits de cette catégorie">
                              {categoryProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.price ? formatPrice(p.price) : 'Pas de prix'})
                                </option>
                              ))}
                            </optgroup>
                          )}
                          
                          {otherProducts.length > 0 && (
                            <optgroup label="Autres produits de la boutique">
                              {otherProducts.map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} — [{(p.category?.name || p.category_id || 'Sans cat.')}]
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => handleSaveBanner(category.id, selectedProdId)}
                          disabled={saveState === 'saving'}
                          className={`flex items-center justify-center gap-1.5 font-bold uppercase tracking-widest py-2.5 px-5 text-[10px] transition-all rounded-none ${
                            saveState === 'saved'
                              ? 'bg-green-600 text-white'
                              : 'bg-primary hover:bg-neutral-900 text-white disabled:opacity-50'
                          }`}
                        >
                          {saveState === 'saving' && (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          )}
                          {saveState === 'saved' && <Check className="w-3.5 h-3.5 text-white" />}
                          {saveState === 'idle' && 'Enregistrer'}
                          {saveState === 'saving' && 'Enregistrement...'}
                          {saveState === 'saved' && 'Enregistré'}
                        </button>

                        {!selectedProdId && (
                          <span className="text-[10px] text-neutral-400 italic">
                            Sélection automatique active
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Colonne droite : Aperçu live de la carte */}
                    <div className="w-full md:w-[200px] shrink-0 flex flex-col justify-end">
                      <div className="relative overflow-hidden bg-neutral-100 rounded-sm aspect-[16/9] md:aspect-[4/3] flex flex-col justify-end p-4 text-left group border border-neutral-200">
                        {finalImage ? (
                          <img
                            src={finalImage}
                            alt={category.name}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-neutral-200 flex items-center justify-center z-0">
                            <ImageIcon className="w-8 h-8 text-neutral-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-neutral-950/35 z-10" />
                        <div className="relative z-20">
                          <span className="text-[8px] text-white font-bold tracking-widest uppercase bg-accent px-1.5 py-0.5 rounded-2xs">
                            Maison Royale
                          </span>
                          <h5 className="text-[11px] font-extrabold text-white mt-1 leading-tight drop-shadow-md">
                            Nouvelle Ligne {category.name}
                          </h5>
                          {activeProduct && (
                            <p className="text-[8.5px] text-neutral-200 truncate mt-0.5 font-medium">
                              {activeProduct.name}
                            </p>
                          )}
                          <span className="text-[9px] text-white font-bold underline mt-1 block cursor-default">
                            Découvrir la sélection
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── SECTION CONFIGURATION DU FOOTER ── */}
      {activeSection === 'footer_config' && (
        <form onSubmit={handleSaveFooter} className="space-y-6 animate-fade-in text-xs text-left">
          <div className={`p-4 border border-dashed rounded-none ${isDarkMode ? 'border-neutral-800 bg-neutral-950/20' : 'border-neutral-200 bg-neutral-50/50'}`}>
            <p className="text-[11px] leading-relaxed text-neutral-400">
              Gérez les informations textuelles, les coordonnées, les réseaux sociaux et l'ensemble des liens de navigation du pied de page du site. Les modifications seront appliquées instantanément.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section Gauche : Infos & Réseaux */}
            <div className="space-y-6">
              <div className={`p-5 border shadow-2xs space-y-4 ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${isDarkMode ? 'text-white border-neutral-800' : 'text-neutral-900 border-neutral-100'}`}>
                  Informations de Contact
                </h4>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Description de la Maison</label>
                    <textarea
                      value={footerConfig.description || ''}
                      onChange={(e) => setFooterConfig({ ...footerConfig, description: e.target.value })}
                      placeholder="Description de la maison..."
                      rows="3"
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Téléphone de Contact</label>
                      <input
                        type="text"
                        value={footerConfig.phone || ''}
                        onChange={(e) => setFooterConfig({ ...footerConfig, phone: e.target.value })}
                        placeholder="ex: 0850 333 22 86"
                        className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">E-mail de Contact</label>
                      <input
                        type="email"
                        value={footerConfig.email || ''}
                        onChange={(e) => setFooterConfig({ ...footerConfig, email: e.target.value })}
                        placeholder="ex: contact@hakavok.com"
                        className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Pays & Devise par défaut</label>
                    <input
                      type="text"
                      value={footerConfig.country || ''}
                      onChange={(e) => setFooterConfig({ ...footerConfig, country: e.target.value })}
                      placeholder="ex: Côte d'Ivoire (XOF)"
                      className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`p-5 border shadow-2xs space-y-4 ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${isDarkMode ? 'text-white border-neutral-800' : 'text-neutral-900 border-neutral-100'}`}>
                  Réseaux Sociaux
                </h4>
                <div className="flex flex-col gap-3">
                  {['whatsapp', 'facebook', 'twitter', 'instagram', 'tiktok'].map((key) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">{key}</label>
                      <input
                        type="text"
                        value={footerConfig.socials?.[key] || ''}
                        onChange={(e) => {
                          const updatedSocials = { ...footerConfig.socials, [key]: e.target.value };
                          setFooterConfig({ ...footerConfig, socials: updatedSocials });
                        }}
                        placeholder={`Lien ${key}...`}
                        className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Droite : Colonnes de liens */}
            <div className="space-y-6">
              <div className={`p-5 border shadow-2xs space-y-6 ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200'}`}>
                <h4 className={`text-xs font-bold uppercase tracking-widest border-b pb-2 ${isDarkMode ? 'text-white border-neutral-800' : 'text-neutral-900 border-neutral-100'}`}>
                  Colonnes de Liens
                </h4>
                
                {footerConfig.columns?.map((col, cIdx) => (
                  <div key={cIdx} className="p-4 border border-neutral-200/50 space-y-4 bg-neutral-50/20">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-bold text-accent uppercase tracking-wider text-[9px]">Titre de la Colonne {cIdx + 1}</label>
                      <input
                        type="text"
                        value={col.title || ''}
                        onChange={(e) => handleColumnTitleChange(cIdx, e.target.value)}
                        className={`border py-1.5 px-3 font-bold text-[11px] focus:outline-none focus:border-neutral-850 rounded-none w-full ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="font-bold text-neutral-400 uppercase tracking-wider text-[8px] block">Liens de la colonne</label>
                      {col.links?.map((link, lIdx) => (
                        <div key={lIdx} className="grid grid-cols-12 gap-2 items-center border-b border-neutral-200/40 pb-2">
                          {/* Libellé */}
                          <div className="col-span-4 flex flex-col gap-1">
                            <input
                              type="text"
                              value={link.name || ''}
                              onChange={(e) => handleLinkChange(cIdx, lIdx, 'name', e.target.value)}
                              placeholder="Nom"
                              className={`border py-1 px-2 text-[10px] focus:outline-none focus:border-neutral-800 rounded-none w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                            />
                          </div>
                          
                          {/* URL */}
                          <div className="col-span-5 flex flex-col gap-1">
                            <input
                              type="text"
                              value={link.url || ''}
                              onChange={(e) => handleLinkChange(cIdx, lIdx, 'url', e.target.value)}
                              placeholder="URL (ex: /catalog)"
                              className={`border py-1 px-2 text-[10px] focus:outline-none focus:border-neutral-800 rounded-none w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                            />
                          </div>

                          {/* Icône */}
                          <div className="col-span-2">
                            <select
                              value={link.icon || ''}
                              onChange={(e) => handleLinkChange(cIdx, lIdx, 'icon', e.target.value)}
                              className={`border py-1 px-1.5 text-[9px] focus:outline-none focus:border-neutral-800 rounded-none w-full ${isDarkMode ? 'bg-neutral-800 border-neutral-700 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
                            >
                              <option value="">Aucune</option>
                              <option value="track">Lecture (Suivi)</option>
                              <option value="return">Lecture (Retour)</option>
                            </select>
                          </div>

                          {/* Supprimer */}
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLink(cIdx, lIdx)}
                              className="text-red-500 hover:text-red-700 font-bold p-1 text-[11px]"
                              title="Supprimer le lien"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => handleAddLink(cIdx)}
                        className="text-[10px] font-bold uppercase tracking-wider text-accent hover:underline mt-2 block"
                      >
                        + Ajouter un lien
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enregistrer Footer */}
          <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
            <button
              type="submit"
              disabled={footerSaveState === 'saving'}
              className="bg-primary hover:bg-neutral-850 text-white font-bold uppercase tracking-widest py-2.5 px-6 text-[10.5px] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {footerSaveState === 'saving' && (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {footerSaveState === 'saved' && <Check className="w-3.5 h-3.5 text-white" />}
              {footerSaveState === 'idle' && 'Enregistrer le Footer'}
              {footerSaveState === 'saving' && 'Enregistrement...'}
              {footerSaveState === 'saved' && 'Configuration Enregistrée'}
            </button>
          </div>
        </form>
      )}

      {/* ── MODAL DE CRÉATION / ÉDITION ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <form 
            onSubmit={handleSubmit} 
            className={`relative border w-full max-w-2xl shadow-2xl p-6 z-10 space-y-4 text-left max-h-[90vh] overflow-y-auto ${isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-neutral-200 text-neutral-800'}`}
          >
            <h3 className={`text-sm font-black uppercase tracking-wider border-b pb-3 ${isDarkMode ? 'text-white border-neutral-800' : 'text-neutral-900 border-neutral-100'}`}>
              {editingSlide ? 'Modifier la diapositive' : 'Créer une diapositive'} ({activeSection === 'top' ? 'Haut' : 'Milieu'})
            </h3>
            
            {/* Si c'est la section DU HAUT, afficher le sélecteur de Type de Média */}
            {activeSection === 'top' && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Type de Média *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="media-type"
                      value="image"
                      checked={formData.type === 'image'}
                      onChange={() => setFormData({ ...formData, type: 'image' })}
                      className="accent-primary"
                    />
                    Image
                  </label>
                  <label className="flex items-center gap-2 font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="media-type"
                      value="video"
                      checked={formData.type === 'video'}
                      onChange={() => setFormData({ ...formData, type: 'video' })}
                      className="accent-primary"
                    />
                    Vidéo
                  </label>
                </div>
              </div>
            )}

            {/* Champs d'identification de catégorie / Badge */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Catégorie / Badge (ex: Automne / Hiver, Maison de Souliers)</label>
                <input
                  type="text"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder={activeSection === 'top' ? 'ex: Maison de Souliers' : 'ex: Automne / Hiver'}
                  className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>

              {activeSection === 'middle' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Titre Principal *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="ex: Chelsea Boot"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Titre Ligne 1 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title_line1}
                    onChange={(e) => setFormData({ ...formData, title_line1: e.target.value })}
                    placeholder="ex: L'Art du"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              )}
            </div>

            {/* Titre additionnel / Liens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeSection === 'middle' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Sous-titre (en italique, ex: Cuir Suédé)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="ex: Cuir Suédé"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Titre Ligne 2 (en italique, ex: Soulier)</label>
                  <input
                    type="text"
                    value={formData.title_line2_italic}
                    onChange={(e) => setFormData({ ...formData, title_line2_italic: e.target.value })}
                    placeholder="ex: Soulier"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              )}

              {activeSection === 'middle' ? (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Lien du Bouton (ex: /catalog)</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="ex: /product/1 ou /catalog"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Lien Bouton Principal ("Découvrir")</label>
                  <input
                    type="text"
                    value={formData.link_primary}
                    onChange={(e) => setFormData({ ...formData, link_primary: e.target.value })}
                    placeholder="ex: /catalog"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              )}
            </div>

            {/* Liens secondaires (Top Section uniquement) */}
            {activeSection === 'top' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Texte Bouton Principal (Défaut : Découvrir)</label>
                  <input
                    type="text"
                    value={formData.link_primary_label}
                    onChange={(e) => setFormData({ ...formData, link_primary_label: e.target.value })}
                    placeholder="Découvrir"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Lien Bouton Secondaire (ex: /catalog?category=nouveautes)</label>
                  <input
                    type="text"
                    value={formData.link_secondary}
                    onChange={(e) => setFormData({ ...formData, link_secondary: e.target.value })}
                    placeholder="ex: /catalog?category=nouveautes"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              </div>
            )}

            {activeSection === 'top' && (
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Texte Bouton Secondaire (Défaut : Nouveautés)</label>
                <input
                  type="text"
                  value={formData.link_secondary_label}
                  onChange={(e) => setFormData({ ...formData, link_secondary_label: e.target.value })}
                  placeholder="Nouveautés"
                  className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
            )}

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description concise..."
                rows="3"
                className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
              />
            </div>

            {/* Tarifs (Middle Section uniquement) */}
            {activeSection === 'middle' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Prix Actuel (XOF)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="ex: 144000"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Ancien Prix (barré, optionnel)</label>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    placeholder="ex: 175000"
                    className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                  />
                </div>
              </div>
            )}

            {/* Téléversement de Médias */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">
                  Téléverser un fichier ({formData.type === 'video' ? 'Vidéo MP4, Max. 4.5 Mo' : 'Image, Max. 4.5 Mo'})
                </label>
                <input
                  type="file"
                  accept={formData.type === 'video' ? 'video/*' : 'image/*'}
                  onChange={handleMediaUpload}
                  className={`border py-1.5 px-3 focus:outline-none focus:border-neutral-850 text-[10px] ${
                    isDarkMode 
                      ? 'bg-neutral-850 border-neutral-700 text-white file:bg-neutral-800 file:text-neutral-300 file:border-0 file:py-1 file:px-2 file:cursor-pointer hover:file:bg-neutral-750' 
                      : 'bg-white border-neutral-200 file:bg-neutral-100 file:text-neutral-700 file:border-0 file:py-1 file:px-2 file:cursor-pointer hover:file:bg-neutral-200'
                  }`}
                />
                {imageLoading && <span className="text-[10px] text-accent animate-pulse">Chargement et encodage du fichier...</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9px]">Ou coller l'URL du média *</label>
                <input
                  type="text"
                  required
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="ex: https://site.com/video.mp4 ou /hero.png"
                  className={`border py-2 px-3 focus:outline-none focus:border-neutral-850 ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white' : 'bg-white border-neutral-200'}`}
                />
              </div>
            </div>

            {/* Statut actif */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="slide-active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded-none accent-primary"
              />
              <label htmlFor="slide-active" className="font-bold text-neutral-500 uppercase tracking-wider text-[9.5px] cursor-pointer">
                Rendre cette diapositive active immédiatement
              </label>
            </div>

            {/* Boutons d'action */}
            <div className={`flex gap-3 justify-end pt-4 border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`border font-bold uppercase tracking-wider py-2 px-4 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={imageLoading}
                className="bg-primary hover:bg-neutral-850 text-white font-bold uppercase tracking-wider py-2 px-5 text-[10px] disabled:opacity-50"
              >
                {editingSlide ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HeroSlides;
