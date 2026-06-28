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
  .luxury-page .values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 28px; margin: 40px 0; }
  .luxury-page .value-card { border: 1px solid rgba(201, 150, 58, .14); padding: 28px 24px; position: relative; }
  .luxury-page .value-card::before { content: ''; position: absolute; top: 0; left: 0; width: 32px; height: 2px; background: var(--or); }
  .luxury-page .value-card .vc-title { font-family: 'Cinzel', serif !important; font-size: 13px !important; color: var(--ivoire) !important; letter-spacing: 2px !important; text-transform: uppercase !important; margin-bottom: 12px !important; }
  .luxury-page .value-card p { font-size: 12.5px !important; margin-bottom: 0 !important; }
  .luxury-page strong { color: var(--ivoire) !important; font-weight: 500 !important; }
`;

const CONTENT = {
  fr: {
    eyebrow: "La Maison",
    title: "L'Esprit de la Maison",
    subtitle: "Une vision. Un héritage. Une élégance forgée entre deux continents.",
    quote: "« HA-KAVOD 97 est née d'une conviction profonde : que la beauté authentique ne s'impose pas — elle se révèle, patiemment, dans chaque détail. »",
    h2_origin: "Une Origine, Deux Mondes",
    p_origin_1: "Fondée par <strong>Emmanuel Agbadou</strong>, HA-KAVOD 97 puise ses racines dans la richesse culturelle de la Côte d'Ivoire et s'épanouit à travers le prisme de l'excellence européenne. Cette dualité n'est pas une contradiction — c'est notre force, notre singularité, notre âme.",
    p_origin_2: "Le nom lui-même est un hommage : <strong>Ha-Kavod</strong>, qui signifie « la gloire » en hébreu, traduit l'ambition d'une maison qui refuse la médiocrité et célèbre la grandeur dans chaque création.",
    h2_gesture: "L'Art du Geste Juste",
    p_gesture_1: "Chaque pièce HA-KAVOD 97 est pensée comme une conversation entre la main et la matière. Nous travaillons avec des cuirs sélectionnés, des tanneries d'exception et des artisans dont le savoir-faire se transmet sur plusieurs générations.",
    p_gesture_2: "Notre maroquinerie n'est pas faite pour être remarquée. Elle est faite pour être ressentie — par celui ou celle qui la porte, par ceux qui croisent son regard.",
    h2_philosophy: "Notre Philosophie",
    values: [
      {
        title: "Authenticité",
        desc: "Chaque création reflète une vérité — celle du matériau, de la culture et de l'intention créatrice."
      },
      {
        title: "Excellence",
        desc: "Nous n'acceptons aucun compromis sur la qualité, de la sélection des matières à la finition finale."
      },
      {
        title: "Intemporalité",
        desc: "Nos pièces traversent les saisons. Elles vieillissent avec grâce, comme les choses qui ont une âme."
      }
    ],
    h2_movement: "Une Maison en Mouvement",
    p_movement_1: "HA-KAVOD 97 est encore jeune, mais sa vision est ancienne. Nous croyons en une mode lente, réfléchie, portée par des femmes et des hommes qui choisissent leurs objets avec intention.",
    p_movement_2: "Bienvenue dans la Maison."
  },
  en: {
    eyebrow: "The House",
    title: "The House Spirit",
    subtitle: "A vision. A heritage. An elegance forged between two continents.",
    quote: "“HA-KAVOD 97 was born from a deep conviction: that authentic beauty is not imposed — it reveals itself, patiently, in every detail.”",
    h2_origin: "One Origin, Two Worlds",
    p_origin_1: "Founded by <strong>Emmanuel Agbadou</strong>, HA-KAVOD 97 draws its roots from the cultural richness of Côte d'Ivoire and flourishes through the lens of European excellence. This duality is not a contradiction — it is our strength, our singularity, our soul.",
    p_origin_2: "The name itself is a tribute: <strong>Ha-Kavod</strong>, which means 'the glory' in Hebrew, translates the ambition of a house that refuses mediocrity and celebrates greatness in every creation.",
    h2_gesture: "The Art of the Right Gesture",
    p_gesture_1: "Every HA-KAVOD 97 piece is thought of as a conversation between the hand and the material. We work with selected leathers, exceptional tanneries, and craftsmen whose know-how has been passed down for generations.",
    p_gesture_2: "Our leather goods are not made to be noticed. They are made to be felt — by the one who wears them, and by those who cross their path.",
    h2_philosophy: "Our Philosophy",
    values: [
      {
        title: "Authenticity",
        desc: "Every creation reflects a truth — that of the material, the culture, and the creative intention."
      },
      {
        title: "Excellence",
        desc: "We accept no compromise on quality, from the selection of materials to the final touch."
      },
      {
        title: "Timelessness",
        desc: "Our pieces transcend seasons. They age gracefully, like things that have a soul."
      }
    ],
    h2_movement: "A House in Motion",
    p_movement_1: "HA-KAVOD 97 is still young, but its vision is ancient. We believe in slow, thoughtful fashion, carried by women and men who choose their objects with intention.",
    p_movement_2: "Welcome to the House."
  }
};

const EspritDeLaMaison = () => {
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

        <h2>{tContent.h2_origin}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_origin_1 }} />
        <p dangerouslySetInnerHTML={{ __html: tContent.p_origin_2 }} />

        <h2>{tContent.h2_gesture}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_gesture_1 }} />
        <p dangerouslySetInnerHTML={{ __html: tContent.p_gesture_2 }} />

        <h2>{tContent.h2_philosophy}</h2>
        <div className="values-grid">
          {tContent.values.map((v) => (
            <div key={v.title} className="value-card">
              <div className="vc-title">{v.title}</div>
              <p>{v.desc}</p>
            </div>
          ))}
        </div>

        <h2>{tContent.h2_movement}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_movement_1 }} />
        <p dangerouslySetInnerHTML={{ __html: tContent.p_movement_2 }} />
      </div>
    </div>
  );
};

export default EspritDeLaMaison;
