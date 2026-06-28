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
  .luxury-page .pillars { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin: 40px 0; }
  .luxury-page .pillar { border: 1px solid rgba(201, 150, 58, .14); padding: 32px 24px; position: relative; overflow: hidden; }
  .luxury-page .pillar::after { content: ''; position: absolute; bottom: 0; right: 0; width: 60px; height: 60px; border-top: 1px solid rgba(201,150,58,.1); border-left: 1px solid rgba(201,150,58,.1); }
  .luxury-page .pillar .num { font-size: 36px; font-family: 'Cinzel', serif; color: rgba(201,150,58,.12); line-height: 1; margin-bottom: 16px; display: block; }
  .luxury-page .pillar .p-title { font-family: 'Cinzel', serif !important; font-size: 12px !important; color: var(--ivoire) !important; letter-spacing: 2px !important; text-transform: uppercase !important; margin-bottom: 12px !important; }
  .luxury-page .pillar p { font-size: 12.5px !important; margin-bottom: 0 !important; }
  .luxury-page strong { color: var(--ivoire) !important; font-weight: 500 !important; }
`;

const CONTENT = {
  fr: {
    eyebrow: "Responsabilité",
    title: "Notre Engagement",
    subtitle: "Créer avec conscience. Durer avec élégance.",
    quote: "« L'élégance véritable ne peut pas se construire sur l'indifférence. Chaque choix que nous faisons, du cuir à l'emballage, est un acte engagé. »",
    h2_materials: "Matières Responsables",
    p_materials_1: "Nous sélectionnons nos cuirs et matières premières auprès de fournisseurs qui partagent nos valeurs : traçabilité, conditions de travail dignes et impact environnemental réduit. La beauté d'une pièce commence dans les conditions de sa conception.",
    p_materials_2: "Nous privilégions les cuirs pleine fleur, traités selon des méthodes végétales ou certifiées, qui vieillissent mieux et durent plus longtemps — parce qu'un objet qui dure est un objet qui ne finit pas à la poubelle.",
    h2_pillars: "Nos Piliers",
    pillars: [
      {
        num: "01",
        title: "Artisanat Local",
        desc: "Nous collaborons avec des artisans en Côte d'Ivoire et en Europe, valorisant un savoir-faire humain et de proximité."
      },
      {
        num: "02",
        title: "Longévité",
        desc: "Nos pièces sont conçues pour traverser le temps — contre la mode jetable, pour des objets que l'on transmet."
      },
      {
        num: "03",
        title: "Emballage Sobre",
        desc: "Nos emballages sont pensés pour être réutilisés. Aucun excès, aucun plastique superflu."
      },
      {
        num: "04",
        title: "Transparence",
        desc: "Nous travaillons à rendre notre chaîne d'approvisionnement toujours plus lisible, dès le premier jour."
      }
    ],
    h2_respect: "Un Luxe qui Respecte",
    p_respect_1: "Nous croyons que le luxe authentique et la responsabilité ne sont pas opposés. Au contraire — l'exigence éthique est une composante naturelle de l'excellence. On ne peut pas prétendre à l'excellence en négligeant l'impact de ce qu'on crée.",
    p_respect_2: "Cet engagement est un chemin, pas un état figé. Nous progressons, nous apprenons, et nous communiquons honnêtement sur ce que nous faisons — et sur ce que nous n'avons pas encore atteint."
  },
  en: {
    eyebrow: "Responsibility",
    title: "Our Commitment",
    subtitle: "Create with conscience. Endure with elegance.",
    quote: "“True elegance cannot be built on indifference. Every choice we make, from leather to packaging, is a committed act.”",
    h2_materials: "Responsible Materials",
    p_materials_1: "We select our leathers and raw materials from suppliers who share our values: traceability, decent working conditions, and reduced environmental impact. The beauty of a piece begins with the conditions of its design.",
    p_materials_2: "We favor full-grain leathers, treated using vegetable or certified methods, which age better and last longer — because an object that lasts is an object that does not end up in the trash.",
    h2_pillars: "Our Pillars",
    pillars: [
      {
        num: "01",
        title: "Local Craftsmanship",
        desc: "We collaborate with artisans in Côte d'Ivoire and Europe, promoting human and local craftsmanship."
      },
      {
        num: "02",
        title: "Longevity",
        desc: "Our pieces are designed to stand the test of time — against disposable fashion, for objects to be passed on."
      },
      {
        num: "03",
        title: "Minimal Packaging",
        desc: "Our packaging is designed to be reused. No excess, no superfluous plastic."
      },
      {
        num: "04",
        title: "Transparency",
        desc: "We work to make our supply chain increasingly transparent, from day one."
      }
    ],
    h2_respect: "A Respectful Luxury",
    p_respect_1: "We believe that authentic luxury and responsibility are not opposites. On the contrary — ethical standards are a natural component of excellence. One cannot claim excellence while neglecting the impact of what is created.",
    p_respect_2: "This commitment is a journey, not a fixed state. We progress, we learn, and we communicate honestly about what we do — and what we have not yet achieved."
  }
};

const NotreEngagement = () => {
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

        <h2>{tContent.h2_materials}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_materials_1 }} />
        <p dangerouslySetInnerHTML={{ __html: tContent.p_materials_2 }} />

        <h2>{tContent.h2_pillars}</h2>
        <div className="pillars">
          {tContent.pillars.map((p) => (
            <div key={p.num} className="pillar">
              <span className="num">{p.num}</span>
              <div className="p-title">{p.title}</div>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>

        <h2>{tContent.h2_respect}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_respect_1 }} />
        <p dangerouslySetInnerHTML={{ __html: tContent.p_respect_2 }} />
      </div>
    </div>
  );
};

export default NotreEngagement;
