import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

function ProtectedRoute({ roles }) {
  const { loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen message="Verification de votre acces..." />;
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <Navigate
        replace
        to={user.role === 'supervisor' ? '/supervisor' : '/worker'}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
