import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';
import storeService from '../../services/api/storeService';

// Icônes SVG inline pour les réseaux sociaux
const IconWhatsApp = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const IconFacebook = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const IconInstagram = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const IconTwitter = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const IconTikTok = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.65a8.16 8.16 0 004.77 1.52V7.73a4.85 4.85 0 01-1-.04z"/>
  </svg>
);

const SOCIAL_ICONS = {
  whatsapp: IconWhatsApp,
  facebook: IconFacebook,
  instagram: IconInstagram,
  twitter: IconTwitter,
  tiktok: IconTikTok,
};

const DEFAULT_FOOTER = {
  description: "Maison de haute couture et de maroquinerie d'exception. HA-KAVOD 97 incarne l'alliance parfaite de l'élégance intemporelle et du raffinement contemporain.",
  phone: "+225 07 20 710 359",
  email: "contact@hakavok.com",
  socials: {
    whatsapp: "https://wa.me/+22507710359",
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
        { name: "Suivi de commande", url: "/order-tracking" },
        { name: "Livraison & Retours", url: "#" },
        { name: "F.A.Q", url: "/faq" }
      ]
    },
    {
      title: "Maison",
      links: [
        { name: "L'esprit de la Maison", url: "/esprit-de-la-maison" },
        { name: "Notre engagement", url: "/engagement" },
        { name: "Services de Conciergerie", url: "/services-de-conciergerie" }
      ]
    }
  ]
};

/**
 * Footer dynamique – charge la config depuis l'API admin (POST /admin/footer → GET /store/footer).
 * Fallback: localStorage → valeurs par défaut.
 */
export const Footer = () => {
  const { activeLocale } = useSettings();
  const [config, setConfig] = useState(DEFAULT_FOOTER);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadFooter = async () => {
      // 1. Essayer l'API
      try {
        const data = await storeService.getFooter({ lang: activeLocale });
        if (data && (data.columns || data.description || data.phone)) {
          const merged = {
            ...DEFAULT_FOOTER,
            ...data,
            socials: {
              ...DEFAULT_FOOTER.socials,
              ...(data.socials || {}),
              ...(data.social || {})
            }
          };
          setConfig(merged);
          localStorage.setItem('storefront_footer_config', JSON.stringify(merged));
          setLoaded(true);
          return;
        }
      } catch (e) {
        // silencieux – on tente le cache
      }

      // 2. Fallback: localStorage
      try {
        const cached = localStorage.getItem('storefront_footer_config');
        if (cached) {
          const parsed = JSON.parse(cached);
          setConfig({ ...DEFAULT_FOOTER, ...parsed, socials: { ...DEFAULT_FOOTER.socials, ...(parsed.socials || {}) } });
        }
      } catch (e) {
        // Garder les valeurs par défaut
      }
      setLoaded(true);
    };

    loadFooter();
  }, [activeLocale]);

  const activeSocials = Object.entries(config.socials || {}).filter(([, url]) => url && url.trim() !== '');

  return (
    <footer className="bg-neutral-950 text-neutral-400 border-t border-neutral-800">
      {/* Bande supérieure – contact & réseaux */}
      {(config.phone || config.email || activeSocials.length > 0) && (
        <div className="border-b border-neutral-800/60">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div className="flex items-center gap-5">
              {config.phone && (
                <a href={`tel:${config.phone}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                  <span className="font-medium">{config.phone}</span>
                </a>
              )}
              {config.email && (
                <a href={`mailto:${config.email}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  <span className="font-medium">{config.email}</span>
                </a>
              )}
            </div>
            {/* Réseaux sociaux */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-3">
                {activeSocials.map(([key, url]) => {
                  const Icon = SOCIAL_ICONS[key];
                  if (!Icon) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={key.charAt(0).toUpperCase() + key.slice(1)}
                      className="w-7 h-7 rounded-full border border-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white transition-all duration-200"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Corps principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
          {/* Colonne Logo + Description */}
          <div className="flex flex-col gap-4">
            <Link to="/">
              <img
                src="/logo.png"
                alt="HA-KAVOD 97 Logo"
                className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
            </Link>
            {config.description && (
              <p className="text-xs leading-relaxed text-neutral-500">{config.description}</p>
            )}
            {config.country && (
              <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-bold">{config.country}</p>
            )}
          </div>

          {/* Colonnes de liens (dynamiques depuis la BDD) */}
          <div className={`grid gap-8 text-xs ${
            config.columns?.length >= 3
              ? 'grid-cols-2 sm:grid-cols-3'
              : config.columns?.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-1'
          }`}>
            {(config.columns || []).map((col, idx) => (
              <div key={idx}>
                <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-[11px]">
                  {col.title}
                </h4>
                <ul className="flex flex-col gap-2.5">
                  {(col.links || []).map((link, lIdx) => (
                    <li key={lIdx}>
                      {link.url?.startsWith('/') ? (
                        <Link
                          to={link.url}
                          className="hover:text-white transition-colors duration-150"
                        >
                          {link.name}
                        </Link>
                      ) : (
                        <a
                          href={link.url || '#'}
                          target={link.url?.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors duration-150"
                        >
                          {link.name}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barre inférieure */}
      <div className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
          <span>&copy; {new Date().getFullYear()} Ha‑kavod 97. Tous droits réservés.</span>

          {/* Logos de paiement */}
          <div className="flex gap-2 items-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-9 h-6 bg-[#FF6600] rounded-sm flex items-center justify-center" title="Orange Money">
              <span className="text-white text-[6px] font-black uppercase">Orange</span>
            </div>
            <div className="w-9 h-6 bg-[#FFCC00] rounded-sm flex items-center justify-center" title="MTN Mobile Money">
              <span className="text-neutral-950 font-black text-[7px]">MTN</span>
            </div>
            <div className="w-9 h-6 bg-[#0066cc] rounded-sm flex items-center justify-center" title="Moov Money">
              <span className="text-white font-black text-[7px]">MOOV</span>
            </div>
            <div className="w-9 h-6 bg-white rounded-sm flex items-center justify-center border border-neutral-800" title="Visa">
              <svg className="h-3 w-6 text-[#1A1F71]" viewBox="0 0 200 65" fill="currentColor">
                <path d="M78.6,4.7L62.7,46.9h-8.9L44.2,14.6c-1.8-7.1-7.2-9.7-13.4-10v0.4h14.7c3.3,0,6.2,2.2,7,5.5l8.3,44h9.1L87.7,4.7H78.6z"/>
                <polygon points="200,4.7 186.2,46.9 178,46.9 191.8,4.7"/>
              </svg>
            </div>
            <div className="w-9 h-6 bg-white rounded-sm flex items-center justify-center border border-neutral-800" title="Mastercard">
              <svg className="h-4 w-7" viewBox="0 0 100 60">
                <circle cx="40" cy="30" r="20" fill="#EB001B" opacity="0.9"/>
                <circle cx="60" cy="30" r="20" fill="#F79E1B" opacity="0.9"/>
                <path d="M50,17.3A20,20 0 0 1 50,42.7A20,20 0 0 1 50,17.3" fill="#FF5F00"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
