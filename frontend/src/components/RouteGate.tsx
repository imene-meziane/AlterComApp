import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../providers/AuthProvider';
import { Role } from '../types/models';
import { ScreenLoader } from './ScreenLoader';

export function RouteGate({ roles }: { roles: Role[] }): React.ReactElement {
  const { loading, user } = useAuth();

  if (loading) {
    return <ScreenLoader message="Chargement de votre espace AlterCom..." />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (!roles.includes(user.role)) {
    return <Navigate replace to={user.role === 'supervisor' ? '/supervisor' : '/worker'} />;
  }

  return <Outlet />;
}
