import React, { useEffect, useState, useRef } from 'react';
import { Modal } from '../../../components/ui/Modal';
import notificationsService from '../../../services/api/notificationsService';
import { Mail, Edit3, Trash2, Code, Info, Copy, Check, Sparkles, HelpCircle, Eye } from 'lucide-react';

const emptyForm = { name: '', type: 'custom', subject: '', body: '', is_active: true };

const defaultVariables = [
  { name: 'user_name', desc: 'Nom complet du client' },
  { name: 'order_id', desc: 'Numéro unique de la commande' },
  { name: 'order_status', desc: 'Statut de la commande (ex: Expédiée)' },
  { name: 'tracking_number', desc: 'Numéro de suivi du colis' },
  { name: 'tracking_url', desc: 'Lien de suivi de la livraison' },
  { name: 'amount_total', desc: 'Montant total de la commande' },
  { name: 'products_list', desc: 'Liste textuelle des articles commandés' }
];

const boilerplateTemplates = [
  {
    id: 'order_confirmation',
    name: 'Confirmation de commande',
    subject: 'Confirmation de votre commande {{order_id}}',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Merci pour votre commande !</h2>
        <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
        <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nous avons le plaisir de vous confirmer la réception et la validation de votre commande <strong style="color: #2d251d; font-family: monospace;">{{order_id}}</strong> d'un montant total de <strong>{{amount_total}}</strong>.</p>
        
        <!-- Order Box -->
        <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fcfcfd; border: 1px solid #eaeaea; border-radius: 8px; margin: 25px 0;">
          <tr>
            <td style="font-size: 12.5px; color: #666666; width: 50%;"><strong>Numéro de commande :</strong><br /><span style="font-family: monospace; font-size: 13px; color: #2d251d;">{{order_id}}</span></td>
            <td style="font-size: 12.5px; color: #666666; width: 50%;"><strong>Statut de traitement :</strong><br /><span style="color: #c29d59; font-weight: bold;">En cours de préparation</span></td>
          </tr>
        </table>

        <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; margin-top: 30px; border-bottom: 2px solid #2d251d; padding-bottom: 8px; color: #2d251d;">Détail des articles</h3>
        <p style="font-size: 13px; line-height: 1.6; color: #555555;">
          {{products_list}}
        </p>

        <p style="font-size: 13px; line-height: 1.6; color: #777777; margin-top: 35px;">
          Vous recevrez un nouvel e-mail contenant votre numéro de suivi dès que notre service d'expédition aura remis votre colis au transporteur.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
        <p style="margin: 20px 0 0 0; font-size: 9px; color: #8c857d; line-height: 1.5;">
          Cet e-mail est généré automatiquement, merci de ne pas y répondre directement.<br />
          Pour toute assistance, contactez notre service conciergerie.
        </p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'shipping_confirmation',
    name: 'Expédition de colis',
    subject: 'Bonne nouvelle ! Votre commande {{order_id}} est en route',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 15px;">📦</div>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Votre colis a été expédié !</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonne nouvelle ! Votre commande <strong style="color: #2d251d; font-family: monospace;">{{order_id}}</strong> a été remise à notre transporteur et est en cours de livraison.</p>
          
          <!-- Tracking Info Box -->
          <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #fcfcfd; border: 1px solid #eaeaea; border-radius: 8px; margin: 25px 0;">
            <tr>
              <td style="font-size: 12.5px; color: #666666;">
                <strong>Numéro de suivi :</strong><br />
                <span style="font-family: monospace; font-size: 14px; color: #2d251d; font-weight: bold; letter-spacing: 0.5px;">{{tracking_number}}</span>
              </td>
            </tr>
          </table>

          <p style="font-size: 13.5px; line-height: 1.6; color: #555555; text-align: center; margin: 35px 0 25px 0;">
            Vous pouvez suivre l'acheminement de votre colis en temps réel en cliquant sur le lien ci-dessous :
          </p>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 35px;">
            <a href="{{tracking_url}}" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.15);">Suivre mon colis</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
        <p style="margin: 20px 0 0 0; font-size: 9px; color: #8c857d; line-height: 1.5;">
          Cet e-mail est généré automatiquement, merci de ne pas y répondre directement.<br />
          Pour toute assistance, contactez notre service conciergerie.
        </p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'promo_newsletter',
    name: 'Newsletter promotionnelle',
    subject: 'Offre exclusive - Vente privée de Printemps',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 35px 20px; background-color: #2d251d;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 65px; width: auto; display: block; filter: brightness(0) invert(1);" />
      </td>
    </tr>
    <!-- Content Banner -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 10px;">Collection Printemps / Été</span>
        <h1 style="margin-top: 0; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #1a1a1a; line-height: 1.3;">La noblesse du cuir à portée de main</h1>
        
        <p style="font-size: 14px; line-height: 1.7; color: #555555; max-w: 480px; margin: 20px auto 30px auto;">
          Découvrez en avant-première nos nouvelles créations artisanales. Confectionnées à la main par nos maîtres maroquiniers pour sublimer votre quotidien.
        </p>
        
        <!-- Coupon Box -->
        <table align="center" cellpadding="20" cellspacing="0" style="background-color: #faf6f0; border: 2px dashed #c29d59; border-radius: 8px; margin: 30px auto; width: 85%;">
          <tr>
            <td align="center">
              <span style="font-size: 11px; text-transform: uppercase; color: #666666; letter-spacing: 1px;">Profitez de 15% de réduction exclusive :</span>
              <div style="font-size: 24px; font-weight: 950; letter-spacing: 3px; color: #2d251d; margin: 10px 0; font-family: monospace;">KAVOD15</div>
              <span style="font-size: 10px; color: #999999; display: block;">* Offre valable sur l'ensemble de la boutique jusqu'à la fin du mois</span>
            </td>
          </tr>
        </table>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 35px 0 15px 0;">
          <a href="https://hakavok.com/catalog" target="_blank" style="background-color: #c29d59; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(194, 157, 89, 0.25);">Explorer le catalogue</a>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
        <p style="margin: 20px 0 0 0; font-size: 9px; color: #8c857d; line-height: 1.5;">
          Vous recevez cet e-mail suite à votre inscription sur notre boutique.<br />
          <a href="#" style="color: #bca080; text-decoration: underline;">Se désabonner</a>
        </p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'welcome_account',
    name: 'Création de compte / Bienvenue',
    subject: 'Bienvenue chez HA-KAVOD 97',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 10px;">Bienvenue</span>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Bienvenue dans l'univers Ha-Kavod 97</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nous sommes ravis de vous compter parmi nos membres privilégiés. Votre compte a été créé avec succès.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">En tant que membre, vous bénéficiez désormais d'un accès prioritaire à nos collections exclusives, de conseils personnalisés de notre service conciergerie et d'offres réservées.</p>
          
          <table align="center" cellpadding="20" cellspacing="0" style="background-color: #faf6f0; border: 1px solid #e5d9c5; border-radius: 8px; margin: 30px auto; width: 100%;">
            <tr>
              <td align="center">
                <span style="font-size: 11.5px; text-transform: uppercase; color: #666666; letter-spacing: 1px; display: block; margin-bottom: 5px;">Pour célébrer votre arrivée, voici votre offre de bienvenue :</span>
                <span style="font-size: 18px; font-weight: bold; color: #c29d59; display: block; margin-bottom: 10px;">-10% sur votre première commande</span>
                <div style="font-size: 20px; font-weight: 950; letter-spacing: 2px; color: #2d251d; font-family: monospace; background: #ffffff; padding: 10px 20px; border-radius: 4px; display: inline-block; border: 1px dashed #c29d59;">WELCOME10</div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block;">Découvrir la boutique</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'abandoned_cart',
    name: 'Panier abandonné',
    subject: 'Votre sélection exclusive vous attend',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 15px;">🛒</div>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Votre panier vous attend</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Vous avez laissé des articles d'exception dans votre panier lors de votre dernière visite.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nos collections artisanales étant produites en quantité limitée pour préserver leur caractère unique, nous ne pouvons garantir leur disponibilité très longtemps.</p>
          
          <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 8px; margin: 25px 0;">
            <tr>
              <td style="font-size: 13px; color: #333333; text-align: center;">
                <strong>Votre sélection est toujours réservée pour une durée limitée.</strong>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com/cart" target="_blank" style="background-color: #c29d59; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(194, 157, 89, 0.25);">Finaliser mes achats</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'password_reset',
    name: 'Réinitialisation de mot de passe',
    subject: 'Demande de réinitialisation de mot de passe',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 15px;">🔒</div>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Réinitialisation de mot de passe</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte client.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expirera dans 60 minutes.</p>
          
          <div style="text-align: center; margin: 35px 0 25px 0;">
            <a href="https://hakavok.com/reset-password" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block;">Choisir un nouveau mot de passe</a>
          </div>

          <p style="font-size: 12px; line-height: 1.5; color: #777777; border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px;">
            Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité. Votre mot de passe actuel restera inchangé.
          </p>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'feedback_request',
    name: 'Demande d\'avis client',
    subject: 'Votre expérience avec HA-KAVOD 97',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 15px;">⭐</div>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Votre avis nous est précieux</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Quelques jours se sont écoulés depuis la réception de votre commande <strong style="color: #2d251d; font-family: monospace;">{{order_id}}</strong>.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nous espérons que vos articles HA-KAVOD 97 vous apportent entière satisfaction. Afin de perfectionner continuellement nos créations et notre service, nous aimerions connaître votre avis.</p>
          
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555; text-align: center; margin: 35px 0 25px 0;">
            Prenez 2 minutes pour nous faire part de vos impressions :
          </p>

          <div style="text-align: center; margin-bottom: 15px;">
            <a href="https://hakavok.com/feedback" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block;">Laisser mon avis</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'vip_invitation',
    name: 'Invitation Vente Privée VIP',
    subject: '✨ Invitation Exclusive : Vente Privée Privilège Ha-Kavod 97',
    body: `<div style="font-family: Arial, sans-serif; background-color: #0d0b09; padding: 30px; margin: 0; color: #f3eade;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #161310; border: 1px solid #332a20; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 40px 20px; background-color: #0d0b09;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 70px; width: auto; display: block; filter: brightness(0) invert(1);" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 40px; text-align: center;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 4px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 15px;">Événement Privé</span>
        <h1 style="margin-top: 0; font-size: 24px; font-weight: 950; text-transform: uppercase; letter-spacing: 2px; color: #ffffff; line-height: 1.4;">Accès Membre Privilégié</h1>
        
        <div style="height: 1px; background: linear-gradient(to right, transparent, #c29d59, transparent); margin: 25px auto; width: 80%;"></div>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 14px; line-height: 1.8; color: #d5c8b7;">Bonjour {{user_name}},</p>
          <p style="font-size: 14px; line-height: 1.8; color: #d5c8b7;">Nous avons le plaisir de vous convier en exclusivité à notre vente privée de saison. Cet événement confidentiel est réservé à nos clients les plus fidèles avant l'ouverture publique.</p>
          <p style="font-size: 14px; line-height: 1.8; color: #d5c8b7;">Profitez d'un accès anticipé et exclusif à nos pièces de haute maroquinerie avec des conditions exceptionnelles.</p>
          
          <table align="center" cellpadding="20" cellspacing="0" style="background-color: #0d0b09; border: 1px solid #c29d59; border-radius: 8px; margin: 35px auto; width: 100%;">
            <tr>
              <td align="center">
                <span style="font-size: 11px; text-transform: uppercase; color: #a89680; letter-spacing: 2px; display: block; margin-bottom: 8px;">Votre code d'accès personnel :</span>
                <div style="font-size: 24px; font-weight: bold; color: #ffffff; letter-spacing: 4px; font-family: monospace; background: #1a1613; padding: 12px 25px; border-radius: 4px; display: inline-block; border: 1px dashed #c29d59;">VIPKAVOD</div>
                <span style="font-size: 11px; color: #c29d59; display: block; margin-top: 10px; font-weight: bold;">-20% SUR TOUTE LA COLLECTION</span>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com/private-sales" target="_blank" style="background-color: #c29d59; color: #000000; text-decoration: none; padding: 16px 32px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px; display: inline-block; box-shadow: 0 4px 15px rgba(194, 157, 89, 0.4);">Accéder à la vente privée</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #0d0b09; padding: 35px; text-align: center; border-top: 1px solid #251f18; color: #a89680;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; color: #ffffff;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #c29d59;">Maison de Haute Maroquinerie d'Exception.</p>
        <p style="margin: 25px 0 0 0; font-size: 9px; color: #695e52; line-height: 1.6;">
          Cette invitation est strictement personnelle et non transférable.<br />
          <a href="#" style="color: #c29d59; text-decoration: underline;">Gérer mes préférences de communication</a>
        </p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'birthday_wishes',
    name: 'Anniversaire Client',
    subject: '🎂 Joyeux Anniversaire de la part de Ha-Kavod 97',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <span style="font-size: 35px; display: block; margin-bottom: 10px;">🎁</span>
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 10px;">Célébration</span>
        <h2 style="margin-top: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Un jour d'exception pour vous</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Toute la maison Ha-Kavod 97 se joint à moi pour vous souhaiter un merveilleux anniversaire.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Pour célébrer cette journée spéciale, nous avons le plaisir de vous offrir une attention exclusive à valoir sur notre boutique.</p>
          
          <table align="center" cellpadding="20" cellspacing="0" style="background-color: #faf6f0; border: 1px solid #e5d9c5; border-radius: 8px; margin: 30px auto; width: 100%;">
            <tr>
              <td align="center">
                <span style="font-size: 11px; text-transform: uppercase; color: #666666; letter-spacing: 1px; display: block; margin-bottom: 5px;">Votre cadeau d'anniversaire :</span>
                <span style="font-size: 20px; font-weight: bold; color: #c29d59; display: block; margin-bottom: 10px;">Un cadeau exclusif + Livraison offerte</span>
                <div style="font-size: 20px; font-weight: 950; letter-spacing: 2px; color: #2d251d; font-family: monospace; background: #ffffff; padding: 10px 20px; border-radius: 4px; display: inline-block; border: 1px dashed #c29d59;">BDAYKAVOD</div>
                <span style="font-size: 10px; color: #999999; display: block; margin-top: 10px;">* Valable pendant 30 jours à compter d'aujourd'hui</span>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block;">Découvrir mon cadeau</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'product_restock',
    name: 'Alerte de Restockage',
    subject: '📢 De retour en stock : Nos pièces iconiques sont de nouveau disponibles',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <span style="font-size: 35px; display: block; margin-bottom: 10px;">✨</span>
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 10px;">Exclusivité</span>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">De retour dans nos ateliers</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Vous aviez manifesté de l'intérêt pour nos pièces exclusives. En raison de la forte demande et de leur fabrication artisanale minutieuse, ces articles ont rapidement été épuisés.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Nous avons le plaisir de vous informer qu'une édition très limitée de ces créations vient d'être finalisée par nos maîtres artisans et est de nouveau disponible.</p>
          
          <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 8px; margin: 25px 0;">
            <tr>
              <td style="font-size: 13px; color: #333333; text-align: center;">
                <strong>Attention : Nos stocks de cuir haut de gamme étant extrêmement restreints, ces pièces ne seront disponibles que pour quelques jours seulement.</strong>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com" target="_blank" style="background-color: #c29d59; color: #ffffff; text-decoration: none; padding: 15px 30px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block; box-shadow: 0 4px 6px rgba(194, 157, 89, 0.25);">Commander dès maintenant</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 'customer_winback',
    name: 'Nous vous regrettons',
    subject: '❤️ Une attention particulière réservée pour vous',
    body: `<div style="font-family: Arial, sans-serif; background-color: #f7f7f9; padding: 30px; margin: 0; color: #2d251d;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);">
    <!-- Header -->
    <tr>
      <td align="center" style="padding: 30px 20px; border-bottom: 1px solid #f2f2f2;">
        <img src="/logo.png" alt="HA-KAVOD 97" style="height: 60px; width: auto; display: block;" />
      </td>
    </tr>
    <!-- Content -->
    <tr>
      <td style="padding: 40px 30px; text-align: center;">
        <span style="font-size: 35px; display: block; margin-bottom: 10px;">✨</span>
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase; color: #c29d59; display: block; margin-bottom: 10px;">Privilège</span>
        <h2 style="margin-top: 0; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #1a1a1a;">Que devenez-vous ?</h2>
        
        <div style="text-align: left; margin-top: 30px;">
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Bonjour {{user_name}},</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Un long moment s'est écoulé depuis votre dernière visite chez Ha-Kavod 97. Nos collections ont évolué, inspirées de nouveaux horizons de raffinement et d'excellence.</p>
          <p style="font-size: 13.5px; line-height: 1.6; color: #555555;">Pour vous inviter à redécouvrir notre univers de maroquinerie haut de gamme, nous serions honorés de vous offrir une remise spéciale sur votre prochaine acquisition.</p>
          
          <table align="center" cellpadding="20" cellspacing="0" style="background-color: #faf6f0; border: 1px solid #e5d9c5; border-radius: 8px; margin: 30px auto; width: 100%;">
            <tr>
              <td align="center">
                <span style="font-size: 11px; text-transform: uppercase; color: #666666; letter-spacing: 1px; display: block; margin-bottom: 5px;">Votre offre privilégiée de retour :</span>
                <span style="font-size: 18px; font-weight: bold; color: #c29d59; display: block; margin-bottom: 10px;">-15% sur toute la boutique</span>
                <div style="font-size: 20px; font-weight: 950; letter-spacing: 2px; color: #2d251d; font-family: monospace; background: #ffffff; padding: 10px 20px; border-radius: 4px; display: inline-block; border: 1px dashed #c29d59;">KAVOD-BACK</div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 35px 0 15px 0;">
            <a href="https://hakavok.com" target="_blank" style="background-color: #2d251d; color: #ffffff; text-decoration: none; padding: 14px 28px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; border-radius: 6px; display: inline-block;">Redécouvrir les collections</a>
          </div>
        </div>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="background-color: #2d251d; padding: 30px; text-align: center; color: #ffffff;">
        <p style="margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">HA-KAVOD 97</p>
        <p style="margin: 8px 0 0 0; font-size: 10px; color: #bca080;">L'élégance à l'état pur. Collection Privée.</p>
      </td>
    </tr>
  </table>
</div>`
  }
];

const NotificationTemplates = ({
  isDarkMode,
  showConfirm,
  showAlert,
  setSuccess,
  setError: setParentError
}) => {
  const [templates, setTemplates] = useState([]);
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [copiedVar, setCopiedVar] = useState(null);
  
  // Tab control inside the modal helper panel: 'variables' or 'preview'
  const [helperTab, setHelperTab] = useState('variables');
  
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef(null);

  const loadTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsService.listTemplates();
      setTemplates(Array.isArray(res) ? res : (res?.data ?? []));
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const loadVariables = async () => {
    try {
      const res = await notificationsService.getTemplateVariables();
      const varsArray = Array.isArray(res) ? res : (res?.data ?? []);
      if (varsArray.length > 0) {
        setVariables(varsArray.map(v => typeof v === 'string' ? { name: v, desc: '' } : v));
      } else {
        setVariables(defaultVariables);
      }
    } catch (e) {
      setVariables(defaultVariables);
    }
  };

  useEffect(() => {
    loadTemplates();
    loadVariables();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setHelperTab('variables');
    setIsModalOpen(true);
  };

  const openEdit = (t) => {
    setForm({
      name: t.name || t.title || '',
      type: t.type || 'custom',
      subject: t.subject || '',
      body: t.body_html || t.body || t.html || '',
      is_active: t.is_active ?? true
    });
    setEditingId(t.id);
    setHelperTab('variables');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      showAlert('Veuillez remplir tous les champs obligatoires (*)');
      return;
    }
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type || 'custom',
        subject: form.subject.trim(),
        body_html: form.body,
        is_active: form.is_active
      };
      if (editingId) {
        await notificationsService.updateTemplate(editingId, payload);
        if (setSuccess) setSuccess('Modèle de notification mis à jour avec succès.');
      } else {
        await notificationsService.createTemplate(payload);
        if (setSuccess) setSuccess('Modèle de notification créé avec succès.');
      }
      setIsModalOpen(false);
      loadTemplates();
    } catch (e) {
      let errorMsg = e?.response?.data?.message || e.message || 'Erreur d\'enregistrement du modèle';
      if (e?.response?.data?.errors) {
        const details = Object.entries(e.response.data.errors)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        errorMsg += `\n\nDétails des erreurs :\n${details}`;
      }
      showAlert({
        title: 'Erreur de validation',
        description: errorMsg
      });
    }
  };

  const handleLoadBoilerplate = async (bp) => {
    if (form.body.trim()) {
      const confirmed = await showConfirm({
        title: 'Écraser le contenu',
        description: 'Voulez-vous vraiment écraser le contenu actuel de votre éditeur par ce gabarit ?',
        warningText: 'Toutes les modifications en cours dans votre éditeur seront définitivement perdues.'
      });
      if (!confirmed) return;
    }
    setForm(prev => ({
      ...prev,
      subject: bp.subject,
      body: bp.body
    }));
    setHelperTab('preview');
  };

  const handleDelete = async (id) => {
    const confirmed = await showConfirm({
      title: 'Supprimer le modèle',
      description: 'Voulez-vous vraiment supprimer ce modèle de notification ?',
      warningText: 'Cette action est irréversible.'
    });
    if (!confirmed) return;
    try {
      await notificationsService.deleteTemplate(id);
      if (setSuccess) setSuccess('Modèle de notification supprimé avec succès.');
      loadTemplates();
    } catch (e) {
      if (setParentError) {
        setParentError(e?.response?.data?.message || e.message || 'Erreur de suppression');
      } else {
        showAlert(e?.response?.data?.message || e.message || 'Erreur de suppression');
      }
    }
  };

  const handleCopyVariable = (varName) => {
    const placeholder = `{{${varName}}}`;
    navigator.clipboard.writeText(placeholder).then(() => {
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 2000);
    });
  };

  // Insertion intelligente de la variable à la position exacte du curseur
  const insertVariableAtCursor = (varName) => {
    const placeholder = `{{${varName}}}`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = form.body;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      
      setForm(prev => ({
        ...prev,
        body: before + placeholder + after
      }));

      // Repositionner le focus et le curseur juste après le tag inséré
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 10);
    } else {
      // Fallback
      setForm(prev => ({
        ...prev,
        body: prev.body + placeholder
      }));
    }
  };

  // Rendu en temps réel du code HTML saisi (avec données fictives de démo)
  const getRenderedPreview = () => {
    let text = form.body || '';
    
    // Remplacer les variables par des valeurs de démonstration réalistes
    let html = text
      .replace(/\{\{user_name\}\}/g, 'Alexis Clarke')
      .replace(/\{\{order_id\}\}/g, 'HK-9721')
      .replace(/\{\{order_status\}\}/g, 'Expédiée')
      .replace(/\{\{tracking_number\}\}/g, 'TRK-987654321-CI')
      .replace(/\{\{tracking_url\}\}/g, 'https://hakavok.com/tracking/TRK-987654321-CI')
      .replace(/\{\{amount_total\}\}/g, '125 000 F CFA')
      .replace(/\{\{products_list\}\}/g, '1x Derby Oxford Cuir Grainé (Bordeaux, 40) - 125 000 F CFA');
    
    // Si la saisie n'a pas de balise HTML bloc, convertir les retours à la ligne en <br /> pour le confort visuel
    if (!html.includes('<p>') && !html.includes('<div>') && !html.includes('<br')) {
      html = html.replace(/\n/g, '<br />');
    }
    
    return html;
  };

  return (
    <div className={`space-y-6 text-xs transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
      
      {/* ── HEADER DE SECTION ── */}
      <div className={`flex flex-col sm:flex-row gap-4 justify-between sm:items-center p-6 border rounded-xl shadow-2xs transition-all ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-white border-neutral-200/60'}`}>
        <div className="text-left">
          <span className="font-bold uppercase tracking-widest text-[10px] text-neutral-400 flex items-center gap-2">
            <Mail className="w-4 h-4 text-accent" /> Gabarits de messages
          </span>
          <h2 className="text-lg font-extrabold text-neutral-900 dark:text-white mt-1.5">Modèles de notification</h2>
          <p className="text-[11px] text-neutral-400 mt-1 font-medium">Gérez la structure HTML, les sujets et les placeholders des messages envoyés aux clients.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-neutral-850 text-white font-extrabold py-3 px-5 rounded-lg uppercase tracking-wider text-[10px] shadow-sm hover:shadow-md transition-all self-start sm:self-center shrink-0"
        >
          + Créer un modèle
        </button>
      </div>

      {loading && (
        <div className="py-20 text-center font-bold uppercase tracking-widest text-neutral-400 animate-pulse">
          Chargement des modèles...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200/60 text-red-700 p-5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-3">
          <Info className="w-5 h-5 text-red-600 shrink-0" />
          {error}
        </div>
      )}

      {/* ── GRILLE DES MODÈLES EXISTANTS ── */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.length === 0 && (
            <div className={`col-span-full py-16 border rounded-xl text-center font-bold text-neutral-400 uppercase tracking-widest ${isDarkMode ? 'bg-neutral-900 border-neutral-850' : 'bg-neutral-50/50 border-neutral-200/60'}`}>
              Aucun modèle de notification configuré.
            </div>
          )}
          {templates.map(t => (
            <div 
              key={t.id} 
              className={`border p-6 rounded-xl shadow-2xs flex flex-col justify-between transition-all duration-350 hover:shadow-xs group ${isDarkMode ? 'bg-neutral-900 border-neutral-850 hover:border-neutral-700' : 'bg-white border-neutral-200/60 hover:border-neutral-350'}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border ${t.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-neutral-50 text-neutral-400 border-neutral-200'}`}>
                      {t.is_active ? 'Actif' : 'Inactif'}
                    </span>
                    {t.type && (
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full border bg-blue-50/80 text-blue-700 border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60 uppercase tracking-wider`}>
                        {t.type === 'custom' ? 'Personnalisé' : t.type}
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] text-neutral-400 font-bold tracking-wider uppercase">ID: #{t.id}</span>
                </div>
                
                <h4 className={`text-sm font-extrabold uppercase tracking-wider mb-1 line-clamp-1 ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                  {t.name || t.title || `Modèle #${t.id}`}
                </h4>
                
                <p className="text-[10px] font-extrabold text-accent mb-4 line-clamp-1">
                  Sujet: <span className="font-semibold text-neutral-500 dark:text-neutral-300">{t.subject || '(Aucun sujet)'}</span>
                </p>

                <div className={`p-4 font-mono text-[9.5px] h-24 overflow-y-auto mb-5 border rounded-lg leading-relaxed scrollbar-thin ${isDarkMode ? 'bg-neutral-950 border-neutral-800 text-neutral-400' : 'bg-neutral-50 border-neutral-150 text-neutral-500'}`}>
                  {t.body_html || t.body || t.html || ''}
                </div>
              </div>

              <div className={`flex justify-end gap-2.5 pt-4 border-t ${isDarkMode ? 'border-neutral-855' : 'border-neutral-100'}`}>
                <button
                  onClick={() => openEdit(t)}
                  className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all py-2 px-3 border rounded-lg shadow-3xs ${isDarkMode ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:text-white' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                >
                  <Edit3 className="w-3.5 h-3.5" /> Éditer
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all py-2 px-3 border border-red-500/20 text-red-500 hover:bg-red-500/10 rounded-lg shadow-3xs`}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODALE D'ÉDITION / CRÉATION ── */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? 'Modifier le modèle de notification' : 'Créer un modèle de notification'} 
        size={isExpanded ? 'full' : 'xl'}
      >
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] transition-all py-1.5 px-3 border rounded-lg shadow-3xs ${
              isDarkMode 
                ? 'border-neutral-800 text-neutral-300 hover:bg-neutral-850 hover:text-white' 
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
            }`}
          >
            {isExpanded ? 'Réduire la fenêtre' : 'Agrandir la fenêtre'}
          </button>
        </div>
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs pb-4 ${isDarkMode ? 'text-white' : 'text-neutral-800'}`}>
          
          {/* Formulaire (Col span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Nom du modèle *</label>
              <input 
                type="text"
                placeholder="ex: Confirmation de paiement"
                value={form.name} 
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-accent'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Type de modèle *</label>
              <select
                value={form.type}
                onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-accent'}`}
              >
                <option value="custom">Personnalisé (custom)</option>
                <option value="promotion">Promotion (promotion)</option>
                <option value="newsletter">Newsletter (newsletter)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Sujet du message (Email Subject) *</label>
              <input 
                type="text"
                placeholder="ex: Votre commande {{order_id}} est validée"
                value={form.subject} 
                onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
                className={`border py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-800 focus:border-accent'}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-neutral-400 uppercase tracking-wider text-[9.5px]">Contenu (HTML ou Texte) *</label>
                <span className="text-[8.5px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm flex items-center gap-1"><Code className="w-3.5 h-3.5 text-accent" /> HTML & variables supportés</span>
              </div>
              <textarea 
                ref={textareaRef}
                value={form.body} 
                onChange={(e) => setForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Exemple : Bonjour {{user_name}}, votre commande..."
                className={`w-full border p-3.5 font-mono text-[10px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/15 rounded-lg transition-all shadow-3xs resize-none ${isExpanded ? 'h-[500px]' : 'h-72'} ${isDarkMode ? 'bg-neutral-850 border-neutral-700 text-white focus:border-accent' : 'bg-white border-neutral-200 text-neutral-855 focus:border-accent'}`}
              />
            </div>
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="is_active"
                checked={form.is_active} 
                onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 rounded-md accent-accent cursor-pointer"
              />
              <label htmlFor="is_active" className="font-extrabold text-neutral-500 dark:text-neutral-300 uppercase tracking-wider text-[9px] cursor-pointer">
                Rendre ce modèle de notification actif
              </label>
            </div>
          </div>

          {/* Panneau d'Assistance / Aperçu (Col span 5) */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[420px]">
            
            {/* Tabs for variables list / live render */}
            <div className="flex border-b border-neutral-200/60 dark:border-neutral-800 mb-4">
              <button
                type="button"
                onClick={() => setHelperTab('variables')}
                className={`flex-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-all border-b-2 ${
                  helperTab === 'variables'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <span className="flex justify-center items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Variables</span>
              </button>
              <button
                type="button"
                onClick={() => setHelperTab('preview')}
                className={`flex-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-all border-b-2 ${
                  helperTab === 'preview'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <span className="flex justify-center items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Rendu Live</span>
              </button>
              <button
                type="button"
                onClick={() => setHelperTab('boilerplates')}
                className={`flex-1 pb-2 text-[10px] font-extrabold uppercase tracking-wider transition-all border-b-2 ${
                  helperTab === 'boilerplates'
                    ? 'border-accent text-accent'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <span className="flex justify-center items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Gabarits Visuels</span>
              </button>
            </div>

            {/* Tab 1: Variables */}
            {helperTab === 'variables' && (
              <div className={`p-4 border rounded-xl flex-1 flex flex-col justify-between ${isDarkMode ? 'bg-neutral-850 border-neutral-750' : 'bg-neutral-50/70 border-neutral-200/70'}`}>
                <div className="space-y-3">
                  <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold">
                    Cliquez pour copier la variable ou double-cliquez pour l'insérer directement à la position du curseur :
                  </p>

                  <div className={`space-y-2 overflow-y-auto pr-1 scrollbar-thin ${isExpanded ? 'max-h-[460px]' : 'max-h-[300px]'}`}>
                    {variables.map(v => (
                      <div 
                        key={v.name}
                        className={`p-2.5 border rounded-lg transition-all duration-200 group relative cursor-pointer shadow-3xs ${isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-150 hover:border-neutral-350'}`}
                        onClick={() => handleCopyVariable(v.name)}
                        onDoubleClick={() => insertVariableAtCursor(v.name)}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-mono font-extrabold text-accent text-[10.5px]">
                            {`{{${v.name}}}`}
                          </span>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded-sm">
                            {copiedVar === v.name ? <span className="text-emerald-600 flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> copié</span> : 'cliquer'}
                          </span>
                        </div>
                        {v.desc && (
                          <p className="text-[9px] text-neutral-400 font-medium">
                            {v.desc}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-[9px] text-neutral-400 leading-normal font-semibold mt-4 border-t pt-3 border-neutral-200/50">
                  <strong>Info :</strong> Insérez ces placeholders pour automatiser le contenu avec les données réelles du client.
                </div>
              </div>
            )}

            {/* Tab 2: Live HTML rendering box */}
            {helperTab === 'preview' && (
              <div className="flex-1 flex flex-col min-h-0 border rounded-xl overflow-hidden shadow-3xs transition-all duration-300">
                <div className={`p-4 border-b text-[10px] space-y-1 ${isDarkMode ? 'bg-neutral-900/60 border-neutral-800' : 'bg-neutral-50/70 border-neutral-200/50'}`}>
                  <div className="flex justify-between items-center text-neutral-400 font-extrabold uppercase tracking-widest text-[8px] mb-1">
                    <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-accent" /> Rendu client de l'email</span>
                    <span className="text-[8px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-bold">temps réel</span>
                  </div>
                  <div><span className="text-neutral-400 font-bold uppercase text-[9px] tracking-wider">Objet :</span> <span className="font-semibold text-neutral-800 dark:text-neutral-200">{form.subject || '(Sujet vide)'}</span></div>
                </div>
                {/* Scrollbox for raw body HTML simulation */}
                <div className={`p-4 bg-white overflow-y-auto flex-1 border-none ${isExpanded ? 'max-h-[500px]' : 'max-h-[360px]'}`}>
                  {form.body ? (
                    <div className="text-neutral-900 font-medium text-xs break-words leading-relaxed" dangerouslySetInnerHTML={{ __html: getRenderedPreview() }} />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400">
                      <Code className="w-7 h-7 mb-2 text-neutral-300" />
                      <p className="text-[10px] font-semibold leading-normal max-w-xs text-neutral-400">
                        Saisissez du texte dans l'éditeur à gauche pour voir son rendu visuel s'afficher ici en temps réel.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: Boilerplate templates selection */}
            {helperTab === 'boilerplates' && (
              <div className={`p-4 border rounded-xl flex-1 flex flex-col justify-between ${isDarkMode ? 'bg-neutral-850 border-neutral-750' : 'bg-neutral-50/70 border-neutral-200/70'}`}>
                <div className="space-y-3">
                  <p className="text-[10.5px] text-neutral-400 leading-normal font-semibold">
                    Sélectionnez un modèle pré-conçu avec logo, structure et styles premium pour l'importer dans l'éditeur :
                  </p>

                  <div className={`space-y-3 overflow-y-auto pr-1 scrollbar-thin ${isExpanded ? 'max-h-[440px]' : 'max-h-[280px]'}`}>
                    {boilerplateTemplates.map(bp => (
                      <div 
                        key={bp.id}
                        className={`p-3 border rounded-lg transition-all duration-200 shadow-3xs flex flex-col justify-between ${isDarkMode ? 'bg-neutral-900 border-neutral-800 hover:border-neutral-700' : 'bg-white border-neutral-150 hover:border-neutral-350'}`}
                      >
                        <div className="mb-2.5">
                          <h5 className="font-extrabold text-[11px] text-neutral-900 dark:text-white uppercase tracking-wider mb-1">
                            {bp.name}
                          </h5>
                          <p className="text-[9.5px] text-neutral-400 font-medium line-clamp-1">
                            Sujet : <span className="font-semibold text-accent">{bp.subject}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleLoadBoilerplate(bp)}
                          className="bg-accent/15 hover:bg-accent text-accent hover:text-white font-extrabold py-2 px-3 rounded-lg text-[9px] uppercase tracking-wider transition-all text-center"
                        >
                          Charger ce modèle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[9px] text-neutral-400 leading-normal font-semibold mt-4 border-t pt-3 border-neutral-200/50">
                  <strong>Note :</strong> Le chargement remplacera le sujet et le contenu HTML de votre modèle actuel.
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Modal Actions Footer */}
        <div className={`flex gap-3 justify-end pt-5 border-t mt-4 ${isDarkMode ? 'border-neutral-800' : 'border-neutral-100'}`}>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className={`border rounded-lg font-bold uppercase tracking-wider py-2.5 px-5 text-[10px] transition-colors ${isDarkMode ? 'border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white' : 'border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-850'}`}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-primary hover:bg-neutral-850 text-white font-extrabold uppercase tracking-wider py-2.5 px-6 text-[10px] rounded-lg transition-colors shadow-sm hover:shadow-md"
          >
            Enregistrer le modèle
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NotificationTemplates;
