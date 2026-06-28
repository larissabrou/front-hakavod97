import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

const SHARED_STYLES = `
  .luxury-page { --bordeaux: #7B1E2E; --or: #C9963A; --noir: #0C0A09; --ivoire: #F5ECD8; background-color: var(--noir) !important; color: var(--ivoire) !important; font-family: 'Montserrat', sans-serif !important; font-weight: 300 !important; text-align: left; }
  .luxury-page .wrap { max-width: 860px; margin: 0 auto; padding: 40px 24px 100px; }
  .luxury-page .eyebrow { font-size: 9px; letter-spacing: 6px; text-transform: uppercase; color: var(--or); margin-bottom: 18px; display: flex; align-items: center; gap: 14px; }
  .luxury-page .eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--or); }
  .luxury-page h1 { font-family: 'Cinzel', serif !important; font-weight: 400 !important; font-size: clamp(28px, 5vw, 52px) !important; color: var(--ivoire) !important; line-height: 1.2 !important; margin-bottom: 12px !important; }
  .luxury-page .subtitle { font-family: 'Cormorant Garamond', serif !important; font-style: italic !important; font-size: 20px !important; line-height: 1.7 !important; color: rgba(245, 236, 216, .5) !important; margin-bottom: 60px !important; }
  .luxury-page .divider { width: 60px; height: 1px; background: var(--or); margin: 0 0 60px; }
  .luxury-page h2 { font-family: 'Cinzel', serif !important; font-weight: 400 !important; font-size: clamp(16px, 2vw, 20px) !important; color: var(--or) !important; margin: 48px 0 16px !important; letter-spacing: 2px !important; text-transform: uppercase !important; }
  .luxury-page p { font-size: 14px !important; line-height: 2 !important; color: rgba(245, 236, 216, .65) !important; letter-spacing: .3px !important; margin-bottom: 20px !important; }
  .luxury-page .intro-quote { font-family: 'Cormorant Garamond', serif !important; font-size: 24px !important; font-style: italic !important; line-height: 1.7 !important; color: rgba(245, 236, 216, .8) !important; border-left: 2px solid var(--or) !important; padding: 16px 0 16px 28px !important; margin: 48px 0 !important; }
  .luxury-page .services-list { display: flex; flex-direction: column; gap: 2px; margin: 40px 0; }
  .luxury-page .service-item { display: flex; gap: 24px; padding: 28px; border: 1px solid rgba(201, 150, 58, .1); position: relative; align-items: flex-start; transition: border-color .3s; }
  .luxury-page .service-item:hover { border-color: rgba(201, 150, 58, .35); }
  .luxury-page .service-item .si-icon { width: 40px; height: 40px; border: 1px solid rgba(201, 150, 58, .2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--or); font-family: 'Cinzel', serif; font-size: 14px; }
  .luxury-page .service-item .si-body { flex: 1; }
  .luxury-page .service-item .si-title { font-family: 'Cinzel', serif !important; font-size: 13px !important; color: var(--ivoire) !important; letter-spacing: 2px !important; text-transform: uppercase !important; margin-bottom: 8px !important; }
  .luxury-page .service-item p { font-size: 12.5px !important; margin-bottom: 0 !important; }
  .luxury-page .cta-box { margin-top: 60px; padding: 40px; border: 1px solid rgba(201, 150, 58, .2); text-align: center; }
  .luxury-page .cta-box .cta-title { font-family: 'Cinzel', serif !important; font-size: 18px !important; color: var(--ivoire) !important; margin-bottom: 14px !important; }
  .luxury-page .cta-box p { font-size: 13px !important; max-width: 480px; margin: 0 auto 28px !important; }
  .luxury-page .cta-btn { display: inline-block; border: 1px solid var(--or); color: var(--or); font-family: 'Montserrat', sans-serif; font-size: 10px; letter-spacing: 3px; text-transform: uppercase; padding: 14px 36px; text-decoration: none; transition: background .3s, color .3s; }
  .luxury-page .cta-btn:hover { background: var(--or); color: var(--noir); }
  .luxury-page strong { color: var(--ivoire) !important; font-weight: 500 !important; }
`;

const CONTENT = {
  fr: {
    eyebrow: "Expérience Exclusive",
    title: "Services de Conciergerie",
    subtitle: "Un accompagnement sur mesure, à la hauteur de votre exigence.",
    quote: "« Chez HA-KAVOD 97, l'achat n'est pas une transaction — c'est le début d'une relation. Notre service de conciergerie est là pour que chaque moment soit exceptionnel. »",
    h2_services: "Nos Services",
    services: [
      {
        num: "I",
        title: "Conseil Personnalisé",
        desc: "Un expert HA-KAVOD 97 vous guide dans le choix de votre pièce — selon votre style, vos occasions, vos préférences matières. Disponible par email ou prise de rendez-vous."
      },
      {
        num: "II",
        title: "Gravure & Personnalisation",
        desc: "Faites graver vos initiales ou un message court sur certaines pièces de la collection. Un geste qui transforme un bel objet en souvenir inoubliable."
      },
      {
        num: "III",
        title: "Emballage Cadeau Prestige",
        desc: "Chaque commande peut être préparée avec soin pour une occasion spéciale : boîte rigide, papier de soie, ruban et carte manuscrite personnalisée."
      },
      {
        num: "IV",
        title: "Livraison Prioritaire",
        desc: "Vous avez une urgence ? Notre option livraison express vous garantit la réception de votre colis dans les meilleurs délais, avec suivi en temps réel."
      },
      {
        num: "V",
        title: "Après-vente & Entretien",
        desc: "HA-KAVOD 97 vous accompagne après l'achat. Conseils d'entretien, réparations mineures et suivi de votre satisfaction — parce que le service ne s'arrête pas à la livraison."
      }
    ],
    cta_title: "Prendre Contact",
    cta_desc: "Pour toute demande de conciergerie ou service sur mesure, notre équipe est à votre disposition.",
    cta_btn: "Écrire à la Maison"
  },
  en: {
    eyebrow: "Exclusive Experience",
    title: "Concierge Services",
    subtitle: "Bespoke assistance, matching your highest expectations.",
    quote: "“At HA-KAVOD 97, a purchase is not a transaction — it is the beginning of a relationship. Our concierge service is here to ensure that every moment is exceptional.”",
    h2_services: "Our Services",
    services: [
      {
        num: "I",
        title: "Personalized Advice",
        desc: "A HA-KAVOD 97 expert guides you in choosing your piece — according to your style, occasions, and material preferences. Available by email or by booking an appointment."
      },
      {
        num: "II",
        title: "Engraving & Personalization",
        desc: "Have your initials or a short message engraved on selected pieces in the collection. A touch that turns a beautiful object into an unforgettable keepsake."
      },
      {
        num: "III",
        title: "Prestige Gift Wrapping",
        desc: "Every order can be prepared with care for a special occasion: rigid box, tissue paper, ribbon, and a personalized handwritten card."
      },
      {
        num: "IV",
        title: "Priority Shipping",
        desc: "Do you have an emergency? Our express delivery option guarantees receipt of your package as quickly as possible, with real-time tracking."
      },
      {
        num: "V",
        title: "After-Sales & Care",
        desc: "HA-KAVOD 97 accompanies you after purchase. Maintenance advice, minor repairs, and satisfaction follow-up — because service does not end at delivery."
      }
    ],
    cta_title: "Get in Touch",
    cta_desc: "For any concierge request or bespoke service, our team is at your disposal.",
    cta_btn: "Write to the House"
  }
};

const ServicesDeConciergerie = () => {
  const { activeLocale } = useSettings();
  const tContent = CONTENT[activeLocale === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&family=Montserrat:wght@200;300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    window.scrollTo(0, 0);
    return () => { document.head.removeChild(link); };
  }, []);

  return (
    <div className="luxury-page w-full min-h-screen pt-28 md:pt-40 pb-12">
      <style dangerouslySetInnerHTML={{ __html: SHARED_STYLES }} />
      <div className="wrap animate-fade-in">
        <div className="eyebrow">{tContent.eyebrow}</div>
        <h1>{tContent.title}</h1>
        <p className="subtitle">{tContent.subtitle}</p>
        <div className="divider" />

        <p className="intro-quote">
          {tContent.quote}
        </p>

        <h2>{tContent.h2_services}</h2>
        <div className="services-list">
          {tContent.services.map((item) => (
            <div key={item.num} className="service-item">
              <div className="si-icon">{item.num}</div>
              <div className="si-body">
                <div className="si-title">{item.title}</div>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-box">
          <div className="cta-title">{tContent.cta_title}</div>
          <p>{tContent.cta_desc}</p>
          <a href="mailto:contact@hakavok.com" className="cta-btn">{tContent.cta_btn}</a>
        </div>
      </div>
    </div>
  );
};

export default ServicesDeConciergerie;
