import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const CONTENT = {
  fr: {
    shop: "Boutique",
    women: "Femme",
    men: "Homme",
    kids: "Enfant",
    help: "Aide",
    tracking: "Suivi de commande",
    shipping: "Livraison & Retours",
    faq: "F.A.Q",
    about: "À Propos",
    history: "Notre histoire",
    sustainability: "Développement durable",
    careers: "Carrières",
    desc: "Inspiré de la mode urbaine de Defacto, Ha‑kavod 97 vous propose une expérience d’achat épurée et moderne.",
    rights: "Tous droits réservés."
  },
  en: {
    shop: "Shop",
    women: "Women",
    men: "Men",
    kids: "Kids",
    help: "Help",
    tracking: "Order Tracking",
    shipping: "Shipping & Returns",
    faq: "F.A.Q",
    about: "About Us",
    history: "Our Story",
    sustainability: "Sustainability",
    careers: "Careers",
    desc: "Inspired by urban fashion, Ha-kavod 97 offers you a sleek and modern shopping experience.",
    rights: "All rights reserved."
  }
};

/**
 * Footer inspired by Defacto – minimal, dark background with quick links.
 */
export const Footer = () => {
  const { activeLocale } = useSettings();
  const t = CONTENT[activeLocale === 'en' ? 'en' : 'fr'];

  return (
    <footer className="bg-neutral-950 text-neutral-400 py-12 px-4 md:px-8 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left text-xs">
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-[11px]">{t.shop}</h4>
          <ul className="flex flex-col gap-2.5">
            <li><Link to="/catalog?category=femme" className="hover:text-white">{t.women}</Link></li>
            <li><Link to="/catalog?category=homme" className="hover:text-white">{t.men}</Link></li>
            <li><Link to="/catalog?category=enfant" className="hover:text-white">{t.kids}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-[11px]">{t.help}</h4>
          <ul className="flex flex-col gap-2.5">
            <li><Link to="/order-tracking" className="hover:text-white">{t.tracking}</Link></li>
            <li><a href="#" className="hover:text-white">{t.shipping}</a></li>
            <li><Link to="/faq" className="hover:text-white">{t.faq}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-4 uppercase tracking-widest text-[11px]">{t.about}</h4>
          <ul className="flex flex-col gap-2.5">
            <li><Link to="/esprit-de-la-maison" className="hover:text-white">{t.history}</Link></li>
            <li><Link to="/engagement" className="hover:text-white">{t.sustainability}</Link></li>
            <li><a href="#" className="hover:text-white">{t.careers}</a></li>
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          <img
            src="/logo.png"
            alt="HA-KAVOD 97 Logo"
            className="h-28 w-auto object-contain self-start transition-transform duration-300 hover:scale-105 border-2 border-white p-1 rounded-none bg-white"
          />
          <div>
            <h4 className="font-bold text-white uppercase tracking-widest text-xs">Ha‑kavod 97</h4>
            <p className="leading-relaxed mt-2">{t.desc}</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-neutral-900 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-neutral-500">
        <div>
          &copy; {new Date().getFullYear()} Ha‑kavod 97. {t.rights}
        </div>
        
        {/* Logos de paiement */}
        <div className="flex gap-2 items-center opacity-70 hover:opacity-100 transition-opacity">
          {/* Orange Money */}
          <div className="w-10 h-6.5 bg-[#FF6600] rounded-xs flex items-center justify-center border border-neutral-800" title="Orange Money">
            <span className="text-white text-[6px] font-black tracking-tighter uppercase scale-90 select-none">Orange</span>
          </div>
          {/* MTN */}
          <div className="w-10 h-6.5 bg-[#FFCC00] rounded-xs flex items-center justify-center border border-neutral-800" title="MTN Mobile Money">
            <span className="w-6.5 h-3.5 rounded-full border border-neutral-900 flex items-center justify-center bg-[#FFCC00]">
              <span className="text-neutral-950 font-black text-[5.5px] scale-80 leading-none select-none">MTN</span>
            </span>
          </div>
          {/* Moov */}
          <div className="w-10 h-6.5 bg-[#0066cc] rounded-xs flex flex-col items-center justify-center border border-neutral-800 relative" title="Moov Money">
            <span className="text-white font-black text-[5.5px] scale-85 leading-none select-none">MOOV</span>
            <span className="w-5 h-[1px] bg-[#33cc33] mt-[0.5px]" />
          </div>
          {/* Visa */}
          <div className="w-10 h-6.5 bg-white rounded-xs flex items-center justify-center border border-neutral-800 shadow-xs" title="Visa">
            <svg className="h-3.5 w-7.5 text-[#1A1F71]" viewBox="0 0 200 65" fill="currentColor">
              <path d="M78.6,4.7L62.7,46.9h-8.9L44.2,14.6c-1.8-7.1-7.2-9.7-13.4-10v0.4h14.7c3.3,0,6.2,2.2,7,5.5l8.3,44h9.1L87.7,4.7H78.6z M131.7,33.5c0.1-12.7-17.6-13.4-17.5-19.1c0.1-1.7,1.7-3.6,5.4-4.1c1.8-0.2,6.9-0.4,12.7,2.2l2.3-10.6c-3.1-1.1-7.2-2.3-12.2-2.3c-12.8,0-21.8,6.8-21.9,16.5c-0.1,14.4,19.9,15.2,19.8,23c-0.1,2.4-2.8,4.2-5.9,4.6c-4.4,0.5-8.8-1-11.5-2.2l-2.4,11.2c3.3,1.5,9.4,2.8,15.3,2.8C122.6,46.9,131.6,40.2,131.7,33.5z M171.3,4.7l-9.1,42.2h-8.5l9.1-42.2H171.3z M29.1,4.7L18.4,28.6c-1.4,3.2-3.7,5.9-6.9,7.6L1.1,41h8.5l14.6-36.3H29.1z" />
              <polygon points="200,4.7 186.2,46.9 178,46.9 191.8,4.7" />
              <path d="M22.8,11.3L16.2,37.5L5.7,11.3H22.8z" fill="#F7B600" />
            </svg>
          </div>
          {/* Mastercard */}
          <div className="w-10 h-6.5 bg-white rounded-xs flex items-center justify-center border border-neutral-800 shadow-xs" title="Mastercard">
            <svg className="h-4 w-7" viewBox="0 0 100 60">
              <circle cx="40" cy="30" r="20" fill="#EB001B" opacity="0.9"/>
              <circle cx="60" cy="30" r="20" fill="#F79E1B" opacity="0.9"/>
              <path d="M50,17.3A20,20 0 0 1 50,42.7A20,20 0 0 1 50,17.3" fill="#FF5F00"/>
            </svg>
          </div>
          {/* PayPal */}
          <div className="w-10 h-6.5 bg-white rounded-xs flex items-center justify-center border border-neutral-800 shadow-xs px-0.5 gap-0.5" title="PayPal">
            <svg className="h-3.5 w-3" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.8 8.6C18.8 3.8 15.6 1 10.6 1H3C2.3 1 1.7 1.5 1.6 2.2L0.1 23.3C0 23.8 0.4 24.3 0.9 24.3H6.8L8.6 27.6C8.8 28 9.2 28.2 9.6 28.2H14.1C14.7 28.2 15.2 27.7 15.3 27.1L16.7 17.5L16.8 17.1C16.9 16.5 17.4 16 18.1 16H18.9C22.6 16 25 14.1 25.5 9.8C25.7 8.3 25.4 6.9 24.5 5.8C23.2 4.4 21.2 3.8 18.8 3.8H14.5C13.8 3.8 13.2 4.3 13.1 5L12.3 10.8L12.2 11.2C12.1 11.8 11.6 12.3 10.9 12.3H7.5C7 12.3 6.6 12.7 6.5 13.2L5.4 20.3C5.3 20.8 5.7 21.3 6.2 21.3H11C11.7 21.3 12.3 20.8 12.4 20.1L13.8 10.5C13.9 9.5 14.8 8.6 15.8 8.6H18.8Z" fill="#003087"/>
              <path d="M18.8 3.8C21.2 3.8 23.2 4.4 24.5 5.8C25.4 6.9 25.7 8.3 25.5 9.8C25 14.1 22.6 16 18.9 16H18.1C17.4 16 16.9 16.5 16.8 17.1L16.7 17.5L15.3 27.1C15.2 27.7 14.7 28.2 14.1 28.2H9.6C9.2 28.2 8.8 28 8.6 27.6L6.8 24.3H0.9C0.4 24.3 0 23.8 0.1 23.3L1.6 2.2C1.7 1.5 2.3 1 3 1H10.6C15.6 1 18.8 3.8 18.8 3.8Z" fill="#0079C1" opacity="0.8"/>
            </svg>
            <span className="text-[7px] font-black text-[#003087] leading-none select-none">Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


