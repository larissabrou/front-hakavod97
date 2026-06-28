import React from 'react';
import { Navigate } from 'react-router-dom';
import Login from '../pages/dashboard/Login';
import MainDashboard from '../pages/dashboard/MainDashboard';
import NotificationTemplates from '../pages/dashboard/notifications/NotificationTemplates';
import NotificationCampaigns from '../pages/dashboard/notifications/NotificationCampaigns';

// Composant garde de route simple
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    // Rediriger vers la page de login admin si non connecté
    return <Navigate to="/espace-prive-hk97" replace />;
  }
  
  return children;
};

export const dashboardRoutes = [
  {
    path: '/espace-prive-hk97',
    element: <Login />,
  },
  {
    path: '/admin/dashboard',
    element: (
      <ProtectedRoute>
        <MainDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/notification-templates',
    element: (
      <ProtectedRoute>
        <NotificationTemplates />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/notification-campaigns',
    element: (
      <ProtectedRoute>
        <NotificationCampaigns />
      </ProtectedRoute>
    ),
  },
];

export default dashboardRoutes;
