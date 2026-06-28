import React from 'react';
import Home from '../pages/storefront/Home';
import Catalog from '../pages/storefront/Catalog';
import ProductDetail from '../pages/storefront/ProductDetail';
import Cart from '../pages/storefront/Cart';
import Checkout from '../pages/storefront/Checkout';
import OrderTracking from '../pages/storefront/OrderTracking';
import PrivacyPolicy from '../pages/storefront/PrivacyPolicy';
import FAQ from '../pages/storefront/FAQ';
import EspritDeLaMaison from '../pages/storefront/EspritDeLaMaison';
import NotreEngagement from '../pages/storefront/NotreEngagement';
import ServicesDeConciergerie from '../pages/storefront/ServicesDeConciergerie';
import Account from '../pages/storefront/Account';

export const storefrontRoutes = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/catalog',
    element: <Catalog />,
  },
  {
    path: '/product/:id',
    element: <ProductDetail />,
  },
  {
    path: '/cart',
    element: <Cart />,
  },
  {
    path: '/checkout',
    element: <Checkout />,
  },
  {
    path: '/order-tracking',
    element: <OrderTracking />,
  },
  {
    path: '/order-tracking/:reference',
    element: <OrderTracking />,
  },
  {
    path: '/faq',
    element: <FAQ />,
  },
  {
    path: '/privacy-policy',
    element: <PrivacyPolicy />,
  },
  {
    path: '/esprit-de-la-maison',
    element: <EspritDeLaMaison />,
  },
  {
    path: '/notre-engagement',
    element: <NotreEngagement />,
  },
  {
    path: '/services-de-conciergerie',
    element: <ServicesDeConciergerie />,
  },
  {
    path: '/account',
    element: <Account />,
  },
];

export default storefrontRoutes;
