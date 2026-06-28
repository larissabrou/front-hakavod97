import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

const CONTENT = {
  fr: {
    eyebrow: "FAQ",
    title: "Foire aux questions",
    updated: "Dernière mise à jour : ",
    questions: [
      {
        num: "01",
        q: "Quels sont les délais de livraison ?",
        a: "Nous expédions les commandes sous 2 à 5 jours ouvrés. Les délais exacts dépendent du pays de destination et du service de transport choisi."
      },
      {
        num: "02",
        q: "Puis‑je retourner un article ?",
        a: "Oui, vous disposez de 14 jours ouvrés à compter de la réception pour retourner un produit non porté, non endommagé et dans son emballage d’origine."
      },
      {
        num: "03",
        q: "Quels modes de paiement acceptez‑vous ?",
        a: "Nous acceptons les cartes Visa/Mastercard, Stripe, ainsi que les solutions de mobile money locales (Orange Money, MTN Mobile Money, Wave, Moov)."
      },
      {
        num: "04",
        q: "Comment suivre ma commande ?",
        a: "Après expédition, vous recevrez un email contenant un lien de suivi. Vous pouvez également suivre votre commande via la page « Suivi de commande » du site."
      },
      {
        num: "05",
        q: "Mes données personnelles sont‑elles sécurisées ?",
        a: "Nous appliquons les meilleures pratiques de Sécurité des Données (HTTPS, stockage chiffré, accès restreint). Consultez notre Politique de Confidentialité pour plus de détails."
      }
    ]
  },
  en: {
    eyebrow: "FAQ",
    title: "Frequently Asked Questions",
    updated: "Last updated: ",
    questions: [
      {
        num: "01",
        q: "What are the delivery times?",
        a: "We ship orders within 2 to 5 business days. Exact times depend on the destination country and the selected shipping service."
      },
      {
        num: "02",
        q: "Can I return an item?",
        a: "Yes, you have 14 business days from receipt to return a product that is unworn, undamaged, and in its original packaging."
      },
      {
        num: "03",
        q: "What payment methods do you accept?",
        a: "We accept Visa/Mastercard, Stripe, as well as local mobile money solutions (Orange Money, MTN Mobile Money, Wave, Moov)."
      },
      {
        num: "04",
        q: "How can I track my order?",
        a: "After shipping, you will receive an email with a tracking link. You can also track your order via the 'Track my order' page on the website."
      },
      {
        num: "05",
        q: "Is my personal data secure?",
        a: "We apply the best data security practices (HTTPS, encrypted storage, restricted access). Check our Privacy Policy for more details."
      }
    ]
  }
};

const FAQ = () => {
  const { activeLocale } = useSettings();
  const tContent = CONTENT[activeLocale === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&family=Montserrat:wght@200;300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    window.scrollTo(0, 0);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="privacy-page w-full min-h-screen pt-28 md:pt-40 pb-12">
      <style dangerouslySetInnerHTML={{ __html: `
        .privacy-page { --bordeaux: #7B1E2E; --or: #C9963A; --noir: #0C0A09; --ivoire: #F5ECD8; background-color: var(--noir) !important; color: var(--ivoire) !important; font-family: 'Montserrat', sans-serif !important; font-weight: 300 !important; text-align: left; }
        .privacy-page .wrap { max-width: 820px; margin: 0 auto; padding: 40px 24px 80px; }
        .privacy-page .eyebrow { font-size: 9px; letter-spacing: 6px; text-transform: uppercase; color: var(--or); margin-bottom: 18px; display: flex; align-items: center; gap: 14px; }
        .privacy-page .eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--or); }
        .privacy-page h1 { font-family: 'Cinzel', serif !important; font-weight: 400 !important; font-size: clamp(28px, 5vw, 46px) !important; color: var(--ivoire) !important; line-height: 1.2 !important; margin-bottom: 8px !important; }
        .privacy-page .updated { font-size: 11px; letter-spacing: 2px; color: rgba(245, 236, 216, .4); margin-bottom: 50px; }
        .privacy-page h2 { font-family: 'Cinzel', serif !important; font-weight: 400 !important; font-size: clamp(18px, 2.5vw, 24px) !important; color: var(--or) !important; margin: 48px 0 18px !important; padding-bottom: 14px !important; border-bottom: 1px solid rgba(201, 150, 58, .15) !important; display: flex; align-items: center; gap: 14px; }
        .privacy-page h2 .num { font-size: 13px; letter-spacing: 2px; color: rgba(201, 150, 58, .4); font-family: 'Montserrat', sans-serif !important; }
        .privacy-page p, .privacy-page li { font-size: 13.5px !important; line-height: 1.9 !important; color: rgba(245, 236, 216, .65) !important; letter-spacing: .3px !important; margin-bottom: 14px !important; }
        .privacy-page strong { color: var(--ivoire) !important; font-weight: 500 !important; }
        .privacy-page ul { padding-left: 20px !important; margin-bottom: 14px !important; }
        .privacy-page li { margin-bottom: 6px !important; }
      `}} />
      <div className="wrap animate-fade-in">
        <div className="eyebrow">{tContent.eyebrow}</div>
        <h1>{tContent.title}</h1>
        <div className="updated">
          {tContent.updated}
          {new Date().toLocaleDateString(activeLocale === 'en' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        {tContent.questions.map((item) => (
          <React.Fragment key={item.num}>
            <h2><span className="num">{item.num}</span> {item.q}</h2>
            <p>{item.a}</p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
