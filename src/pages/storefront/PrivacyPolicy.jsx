import React, { useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

const CONTENT = {
  fr: {
    eyebrow: "Document Légal",
    title: "Politique de Confidentialité",
    updated: "HA-KAVOD 97 — Dernière mise à jour : ",
    intro: "HA-KAVOD 97 (\"nous\", \"notre\", \"la marque\") attache une importance particulière à la protection de vos données personnelles. Cette politique explique quelles informations nous collectons, pourquoi, comment elles sont utilisées, et quels sont vos droits — que vous accédiez à notre site depuis la Côte d'Ivoire, l'Union Européenne, ou tout autre pays.",
    h2_who: "Qui sommes-nous",
    p_who: "HA-KAVOD 97 est une marque de maroquinerie de luxe fondée par <strong>Emmanuel Agbadou</strong>, opérant sous [Raison sociale à compléter], immatriculée [numéro RCCM / SIREN à compléter], dont le siège est situé [adresse à compléter]. Pour toute question relative à vos données personnelles, vous pouvez nous contacter via les coordonnées indiquées en fin de ce document.",
    h2_what: "Quelles données nous collectons",
    p_what: "Selon votre interaction avec notre site, nous pouvons collecter :",
    what_list: [
      "<strong>Données d'identification</strong> : nom, prénom, adresse e-mail, numéro de téléphone",
      "<strong>Données de livraison</strong> : adresse postale, pays, ville",
      "<strong>Données de commande</strong> : historique d'achats, produits consultés, panier",
      "<strong>Données de paiement</strong> : traitées exclusivement par nos prestataires de paiement tiers (voir section 5) — HA-KAVOD 97 ne stocke jamais directement vos numéros de carte bancaire ou identifiants de paiement mobile",
      "<strong>Données de navigation</strong> : adresse IP, type d'appareil, navigateur, pages visitées, durée de visite (via cookies, voir section 6)",
      "<strong>Données de communication</strong> : messages envoyés via notre formulaire de contact ou par e-mail"
    ],
    h2_why: "Pourquoi nous collectons ces données",
    p_why: "Vos données sont utilisées pour :",
    why_list: [
      "Traiter et livrer vos commandes",
      "Vous contacter au sujet de votre commande (confirmation, suivi, service après-vente)",
      "Améliorer notre site et l'expérience d'achat",
      "Vous envoyer des communications marketing — <strong>uniquement si vous y avez consenti explicitement</strong>",
      "Respecter nos obligations légales et comptables",
      "Prévenir la fraude et sécuriser les transactions"
    ],
    h2_legal: "Base légale du traitement (visiteurs européens)",
    p_legal: "Pour les utilisateurs situés dans l'Union Européenne, le traitement de vos données repose sur l'une des bases suivantes prévues par le <strong>Règlement Général sur la Protection des Données (RGPD)</strong> :",
    legal_list: [
      "<strong>Exécution d'un contrat</strong> — pour traiter votre commande",
      "<strong>Consentement</strong> — pour les communications marketing et certains cookies",
      "<strong>Intérêt légitime</strong> — pour la sécurité du site et la prévention de la fraude",
      "<strong>Obligation légale</strong> — pour la conservation de documents comptables"
    ],
    h2_share: "Partage de vos données avec des tiers",
    p_share: "HA-KAVOD 97 ne vend ni ne loue vos données personnelles. Vos données peuvent être partagées uniquement avec :",
    share_list: [
      "<strong>Prestataires de paiement</strong> — pour traiter vos transactions de manière sécurisée",
      "<strong>Transporteurs et services de livraison</strong> — pour acheminer votre commande",
      "<strong>Prestataires techniques</strong> — hébergement du site, outils d'analyse d'audience",
      "<strong>Autorités compétentes</strong> — uniquement si la loi nous y oblige"
    ],
    todo_label: "À compléter avant mise en ligne",
    todo_text: "Le choix des moyens de paiement (Orange Money, MTN Mobile Money, Wave, Moov, Visa/Mastercard, Stripe, etc.) n'étant pas encore arrêté, cette section devra être mise à jour avec le nom exact de chaque prestataire retenu, accompagné d'un lien vers leur propre politique de confidentialité. C'est une obligation légale en Europe (RGPD) dès qu'un prestataire de paiement est nommé.",
    h2_cookies: "Cookies et traceurs",
    p_cookies_1: "Notre site utilise des cookies pour :",
    cookies_list: [
      "<strong>Cookies essentiels</strong> — fonctionnement du panier, connexion au compte (toujours actifs)",
      "<strong>Cookies de mesure d'audience</strong> — comprendre comment le site est utilisé (nécessitent votre consentement pour les visiteurs européens)",
      "<strong>Cookies marketing</strong> — personnalisation publicitaire (nécessitent votre consentement explicite)"
    ],
    p_cookies_2: "Vous pouvez gérer vos préférences de cookies à tout moment via le bandeau de consentement affiché lors de votre première visite, ou via les paramètres de votre navigateur.",
    h2_retention: "Durée de conservation",
    retention_list: [
      "<strong>Données de compte client</strong> : conservées tant que votre compte est actif, puis 3 ans après votre dernière activité",
      "<strong>Données de commande</strong> : conservées pendant la durée légale de conservation des documents comptables (10 ans en Côte d'Ivoire et dans l'espace OHADA, 10 ans également pour les documents commerciaux en France)",
      "<strong>Données marketing</strong> : conservées jusqu'au retrait de votre consentement",
      "<strong>Cookies</strong> : maximum 13 mois (norme européenne)"
    ],
    h2_rights: "Vos droits",
    p_rights: "Selon votre lieu de résidence, vous disposez de tout ou partie des droits suivants concernant vos données personnelles :",
    rights_list: [
      "<strong>Droit d'accès</strong> — obtenir une copie des données que nous détenons sur vous",
      "<strong>Droit de rectification</strong> — corriger des données inexactes",
      "<strong>Droit à l'effacement</strong> — demander la suppression de vos données (\"droit à l'oubli\")",
      "<strong>Droit d'opposition</strong> — vous opposer à l'utilisation de vos données à des fins marketing",
      "<strong>Droit à la portabilité</strong> — recevoir vos données dans un format réutilisable",
      "<strong>Droit de retirer votre consentement</strong> — à tout moment, pour les traitements basés sur le consentement"
    ],
    note_label: "Pour les résidents de l'Union Européenne",
    note_text: "Vous avez également le droit d'introduire une réclamation auprès de votre autorité de protection des données (par exemple la CNIL en France) si vous estimez que vos droits ne sont pas respectés.",
    h2_security: "Sécurité des données",
    p_security: "HA-KAVOD 97 met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, perte, ou divulgation — notamment le chiffrement des connexions (HTTPS/SSL) et l'accès restreint aux données par notre équipe.",
    h2_transfers: "Transferts internationaux de données",
    p_transfers: "HA-KAVOD 97 opère entre la Côte d'Ivoire et l'Europe. Vos données peuvent donc être transférées et traitées dans des pays autres que votre pays de résidence. Lorsque cela concerne des données de résidents européens transférées hors de l'Espace Économique Européen, nous veillons à ce que des garanties appropriées soient mises en place, conformément au RGPD.",
    h2_changes: "Modifications de cette politique",
    p_changes: "Cette politique peut être mise à jour pour refléter des changements dans nos pratiques ou pour des raisons légales et réglementaires. Toute modification substantielle vous sera communiquée via notre site ou par e-mail.",
    contact_title: "Nous contacter",
    contact_p: "Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits :",
    contact_email: "E-mail :",
    contact_address: "Adresse postale :"
  },
  en: {
    eyebrow: "Legal Document",
    title: "Privacy Policy",
    updated: "HA-KAVOD 97 — Last updated: ",
    intro: "HA-KAVOD 97 (\"we\", \"our\", \"the brand\") attaches particular importance to the protection of your personal data. This policy explains what information we collect, why, how it is used, and what your rights are — whether you access our site from Côte d'Ivoire, the European Union, or any other country.",
    h2_who: "Who we are",
    p_who: "HA-KAVOD 97 is a luxury leather goods brand founded by <strong>Emmanuel Agbadou</strong>, operating under [Company name to be completed], registered under [RCCM / SIREN number to be completed], whose head office is located at [address to be completed]. For any question regarding your personal data, you can contact us via the contact details indicated at the end of this document.",
    h2_what: "What data we collect",
    p_what: "Depending on your interaction with our site, we may collect:",
    what_list: [
      "<strong>Identification data</strong>: last name, first name, email address, phone number",
      "<strong>Delivery data</strong>: postal address, country, city",
      "<strong>Order data</strong>: purchase history, products viewed, cart",
      "<strong>Payment data</strong>: processed exclusively by our third-party payment providers (see section 5) — HA-KAVOD 97 never directly stores your credit card numbers or mobile payment identifiers",
      "<strong>Navigation data</strong>: IP address, device type, browser, pages visited, visit duration (via cookies, see section 6)",
      "<strong>Communication data</strong>: messages sent via our contact form or by email"
    ],
    h2_why: "Why we collect this data",
    p_why: "Your data is used to:",
    why_list: [
      "Process and deliver your orders",
      "Contact you about your order (confirmation, tracking, after-sales service)",
      "Improve our site and shopping experience",
      "Send you marketing communications — <strong>only if you have explicitly consented</strong>",
      "Comply with our legal and accounting obligations",
      "Prevent fraud and secure transactions"
    ],
    h2_legal: "Legal basis for processing (European visitors)",
    p_legal: "For users located in the European Union, the processing of your data is based on one of the following legal bases provided by the <strong>General Data Protection Regulation (GDPR)</strong>:",
    legal_list: [
      "<strong>Performance of a contract</strong> — to process your order",
      "<strong>Consent</strong> — for marketing communications and certain cookies",
      "<strong>Legitimate interest</strong> — for site security and fraud prevention",
      "<strong>Legal obligation</strong> — for the preservation of accounting documents"
    ],
    h2_share: "Sharing your data with third parties",
    p_share: "HA-KAVOD 97 does not sell or rent your personal data. Your data can only be shared with:",
    share_list: [
      "<strong>Payment providers</strong> — to process your transactions securely",
      "<strong>Carriers and delivery services</strong> — to deliver your order",
      "<strong>Technical providers</strong> — website hosting, audience analysis tools",
      "<strong>Competent authorities</strong> — only if required by law"
    ],
    todo_label: "To be completed before launch",
    todo_text: "The choice of payment methods (Orange Money, MTN Mobile Money, Wave, Moov, Visa/Mastercard, Stripe, etc.) has not yet been finalized. This section will be updated with the exact name of each selected provider, along with a link to their own privacy policy. This is a legal requirement in Europe (GDPR) once a payment provider is named.",
    h2_cookies: "Cookies and trackers",
    p_cookies_1: "Our site uses cookies to:",
    cookies_list: [
      "<strong>Essential cookies</strong> — functioning of the cart, account login (always active)",
      "<strong>Audience measurement cookies</strong> — understanding how the site is used (requires consent for European visitors)",
      "<strong>Marketing cookies</strong> — advertising personalization (requires your explicit consent)"
    ],
    p_cookies_2: "You can manage your cookie preferences at any time via the consent banner displayed during your first visit, or through your browser settings.",
    h2_retention: "Retention duration",
    retention_list: [
      "<strong>Customer account data</strong>: kept as long as your account is active, then 3 years after your last activity",
      "<strong>Order data</strong>: kept for the legal retention period of accounting documents (10 years in Côte d'Ivoire and the OHADA zone, 10 years also for commercial documents in France)",
      "<strong>Marketing data</strong>: kept until the withdrawal of your consent",
      "<strong>Cookies</strong>: maximum 13 months (European standard)"
    ],
    h2_rights: "Your rights",
    p_rights: "Depending on your place of residence, you have all or part of the following rights regarding your personal data:",
    rights_list: [
      "<strong>Right of access</strong> — obtain a copy of the data we hold about you",
      "<strong>Right to rectification</strong> — correct inaccurate data",
      "<strong>Right to erasure</strong> — request deletion of your data (\"right to be forgotten\")",
      "<strong>Right to object</strong> — object to the use of your data for marketing purposes",
      "<strong>Right to portability</strong> — receive your data in a reusable format",
      "<strong>Right to withdraw consent</strong> — at any time, for consent-based processing"
    ],
    note_label: "For European Union residents",
    note_text: "You also have the right to lodge a complaint with your data protection authority (for example, CNIL in France) if you believe your rights are not respected.",
    h2_security: "Data security",
    p_security: "HA-KAVOD 97 implements appropriate technical and organizational measures to protect your data against unauthorized access, loss, or disclosure — in particular, connection encryption (HTTPS/SSL) and restricted access to data by our team.",
    h2_transfers: "International data transfers",
    p_transfers: "HA-KAVOD 97 operates between Côte d'Ivoire and Europe. Your data may therefore be transferred and processed in countries other than your country of residence. When this concerns data of European residents transferred outside the European Economic Area, we ensure that appropriate safeguards are put in place, in accordance with the GDPR.",
    h2_changes: "Changes to this policy",
    p_changes: "This policy may be updated to reflect changes in our practices or for legal and regulatory reasons. Any substantial changes will be communicated to you via our site or by email.",
    contact_title: "Contact us",
    contact_p: "For any questions concerning this privacy policy or to exercise your rights:",
    contact_email: "Email:",
    contact_address: "Postal address:"
  }
};

const PrivacyPolicy = () => {
  const { activeLocale } = useSettings();
  const tContent = CONTENT[activeLocale === 'en' ? 'en' : 'fr'];

  useEffect(() => {
    // Inject fonts specifically for the Privacy Policy page
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&family=Montserrat:wght@200;300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // Scroll to top
    window.scrollTo(0, 0);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="privacy-page w-full min-h-screen pt-28 md:pt-40 pb-12">
      <style dangerouslySetInnerHTML={{ __html: `
        .privacy-page {
          --bordeaux: #7B1E2E;
          --or: #C9963A;
          --noir: #0C0A09;
          --ivoire: #F5ECD8;
          background-color: var(--noir) !important;
          color: var(--ivoire) !important;
          font-family: 'Montserrat', sans-serif !important;
          font-weight: 300 !important;
          text-align: left;
        }
        .privacy-page .wrap {
          max-width: 820px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }
        .privacy-page .eyebrow {
          font-size: 9px;
          letter-spacing: 6px;
          text-transform: uppercase;
          color: var(--or);
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .privacy-page .eyebrow::before {
          content: '';
          width: 28px;
          height: 1px;
          background: var(--or);
        }
        .privacy-page h1 {
          font-family: 'Cinzel', serif !important;
          font-weight: 400 !important;
          font-size: clamp(28px, 5vw, 46px) !important;
          color: var(--ivoire) !important;
          line-height: 1.2 !important;
          margin-bottom: 8px !important;
        }
        .privacy-page .updated {
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(245, 236, 216, .4);
          margin-bottom: 50px;
        }
        .privacy-page .intro {
          font-family: 'Cormorant Garamond', serif !important;
          font-style: italic !important;
          font-size: 18px !important;
          line-height: 1.8 !important;
          color: rgba(245, 236, 216, .65) !important;
          border-left: 2px solid var(--or) !important;
          padding-left: 24px !important;
          margin-bottom: 60px !important;
        }
        .privacy-page h2 {
          font-family: 'Cinzel', serif !important;
          font-weight: 400 !important;
          font-size: clamp(18px, 2.5vw, 24px) !important;
          color: var(--or) !important;
          margin: 48px 0 18px !important;
          padding-bottom: 14px !important;
          border-bottom: 1px solid rgba(201, 150, 58, .15) !important;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .privacy-page h2 .num {
          font-size: 13px;
          letter-spacing: 2px;
          color: rgba(201, 150, 58, .4);
          font-family: 'Montserrat', sans-serif !important;
        }
        .privacy-page p, .privacy-page li {
          font-size: 13.5px !important;
          line-height: 1.9 !important;
          color: rgba(245, 236, 216, .65) !important;
          letter-spacing: .3px !important;
          margin-bottom: 14px !important;
        }
        .privacy-page strong {
          color: var(--ivoire) !important;
          font-weight: 500 !important;
        }
        .privacy-page ul {
          padding-left: 20px !important;
          margin-bottom: 14px !important;
        }
        .privacy-page li {
          margin-bottom: 6px !important;
        }
        .privacy-page .note {
          background: rgba(201, 150, 58, .05) !important;
          border: 1px solid rgba(201, 150, 58, .18) !important;
          border-left: 3px solid var(--or) !important;
          padding: 18px 24px !important;
          margin: 20px 0 !important;
        }
        .privacy-page .note p {
          color: rgba(245, 236, 216, .7) !important;
          margin-bottom: 0 !important;
          font-size: 12.5px !important;
        }
        .privacy-page .note .note-label {
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: var(--or);
          display: block;
          margin-bottom: 8px;
        }
        .privacy-page .todo {
          background: rgba(123, 30, 46, .1) !important;
          border: 1px solid rgba(123, 30, 46, .25) !important;
          border-left: 3px solid var(--bordeaux) !important;
          padding: 18px 24px !important;
          margin: 20px 0 !important;
        }
        .privacy-page .todo p {
          color: rgba(245, 236, 216, .7) !important;
          margin-bottom: 0 !important;
          font-size: 12.5px !important;
        }
        .privacy-page .todo .todo-label {
          font-size: 9px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #d96a7e;
          display: block;
          margin-bottom: 8px;
        }
        .privacy-page .contact-box {
          margin-top: 60px !important;
          padding: 32px !important;
          background: rgba(245, 236, 216, .02) !important;
          border: 1px solid rgba(201, 150, 58, .12) !important;
        }
        .privacy-page .contact-box h3 {
          font-family: 'Cinzel', serif !important;
          font-size: 16px !important;
          color: var(--or) !important;
          margin-bottom: 14px !important;
          letter-spacing: 2px !important;
        }
        .privacy-page .contact-box p {
          margin-bottom: 6px !important;
        }
        .privacy-page .footer-note {
          margin-top: 60px !important;
          padding-top: 30px !important;
          border-top: 1px solid rgba(201, 150, 58, .1) !important;
          font-size: 11px !important;
          letter-spacing: 1px !important;
          color: rgba(245, 236, 216, .3) !important;
          line-height: 1.8 !important;
        }
      ` }} />
      <div className="wrap animate-fade-in">
        <div className="eyebrow">{tContent.eyebrow}</div>
        <h1>{tContent.title}</h1>
        <div className="updated">
          {tContent.updated}
          {new Date().toLocaleDateString(activeLocale === 'en' ? 'en-US' : 'fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        <p className="intro">{tContent.intro}</p>

        <h2><span className="num">01</span> {tContent.h2_who}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_who }} />

        <h2><span className="num">02</span> {tContent.h2_what}</h2>
        <p>{tContent.p_what}</p>
        <ul>
          {tContent.what_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <h2><span className="num">03</span> {tContent.h2_why}</h2>
        <p>{tContent.p_why}</p>
        <ul>
          {tContent.why_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <h2><span className="num">04</span> {tContent.h2_legal}</h2>
        <p dangerouslySetInnerHTML={{ __html: tContent.p_legal }} />
        <ul>
          {tContent.legal_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <h2><span className="num">05</span> {tContent.h2_share}</h2>
        <p>{tContent.p_share}</p>
        <ul>
          {tContent.share_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <div className="todo">
          <span className="todo-label">{tContent.todo_label}</span>
          <p>{tContent.todo_text}</p>
        </div>

        <h2><span className="num">06</span> {tContent.h2_cookies}</h2>
        <p>{tContent.p_cookies_1}</p>
        <ul>
          {tContent.cookies_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>
        <p>{tContent.p_cookies_2}</p>

        <h2><span className="num">07</span> {tContent.h2_retention}</h2>
        <ul>
          {tContent.retention_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <h2><span className="num">08</span> {tContent.h2_rights}</h2>
        <p>{tContent.p_rights}</p>
        <ul>
          {tContent.rights_list.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
          ))}
        </ul>

        <div className="note">
          <span className="note-label">{tContent.note_label}</span>
          <p>{tContent.note_text}</p>
        </div>

        <h2><span className="num">09</span> {tContent.h2_security}</h2>
        <p>{tContent.p_security}</p>

        <h2><span className="num">10</span> {tContent.h2_transfers}</h2>
        <p>{tContent.p_transfers}</p>

        <h2><span className="num">11</span> {tContent.h2_changes}</h2>
        <p>{tContent.p_changes}</p>

        <div className="contact-box">
          <h3>{tContent.contact_title}</h3>
          <p>{tContent.contact_p}</p>
          <p><strong>{tContent.contact_email}</strong> contact@hakavok.com</p>
          <p><strong>{tContent.contact_address}</strong> Abidjan, Côte d'Ivoire</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
