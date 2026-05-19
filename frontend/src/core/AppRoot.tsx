import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { RouteGate } from '../components/RouteGate';
import { ScreenLoader } from '../components/ScreenLoader';
import { SupervisorShell } from '../components/SupervisorShell';
import { WorkerShell } from '../components/WorkerShell';
import { useAuth } from '../providers/AuthProvider';
import { LoginPage } from '../views/auth/LoginPage';
import { NotFoundPage } from '../views/shared/NotFoundPage';
import { EmotionsPage } from '../views/worker/EmotionsPage';
import { AlertsPage } from '../views/supervisor/AlertsPage';
import { HistoryPage } from '../views/supervisor/HistoryPage';
import { PictogramManagementPage } from '../views/supervisor/PictogramManagementPage';
import { ProfileManagementPage } from '../views/supervisor/ProfileManagementPage';
import { RoutineManagementPage } from '../views/supervisor/RoutineManagementPage';
import { SupervisorDashboardPage } from '../views/supervisor/SupervisorDashboardPage';
import { WorkshopManagementPage } from '../views/supervisor/WorkshopManagementPage';
import { FavoritesPage } from '../views/worker/FavoritesPage';
import { MessagePage } from '../views/worker/MessagePage';
import { PictogramsPage } from '../views/worker/PictogramsPage';
import { RoutinesPage } from '../views/worker/RoutinesPage';
import { WorkerHomePage } from '../views/worker/WorkerHomePage';
import { WorkshopPage } from '../views/worker/WorkshopPage';

function LandingRedirect(): React.ReactElement {
  const { loading, user } = useAuth();

  if (loading) {
    return <ScreenLoader message="Chargement de votre session AlterCom..." />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={user.role === 'supervisor' ? '/supervisor' : '/worker'} />;
}

export function AppRoot(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingRedirect />} path="/" />
        <Route element={<LoginPage />} path="/login" />

        <Route element={<RouteGate roles={['worker']} />}>
          <Route element={<WorkerShell />}>
            <Route element={<WorkerHomePage />} path="/worker" />
            <Route element={<Navigate replace to="/worker/pictograms" />} path="/worker/categories" />
            <Route
              element={<Navigate replace to="/worker/pictograms" />}
              path="/worker/categories/:categoryKey"
            />
            <Route element={<PictogramsPage />} path="/worker/pictograms" />
            <Route element={<PictogramsPage />} path="/worker/pictograms/:categoryKey" />
            <Route element={<RoutinesPage />} path="/worker/routines" />
            <Route element={<EmotionsPage />} path="/worker/emotions" />
            <Route element={<WorkshopPage />} path="/worker/workshop" />
            <Route element={<MessagePage />} path="/worker/message" />
            <Route element={<FavoritesPage />} path="/worker/favorites" />
          </Route>
        </Route>

        <Route element={<RouteGate roles={['supervisor']} />}>
          <Route element={<SupervisorShell />}>
            <Route element={<SupervisorDashboardPage />} path="/supervisor" />
            <Route element={<AlertsPage />} path="/supervisor/alerts" />
            <Route element={<PictogramManagementPage />} path="/supervisor/pictograms" />
            <Route element={<WorkshopManagementPage />} path="/supervisor/workshops" />
            <Route element={<RoutineManagementPage />} path="/supervisor/routines" />
            <Route element={<ProfileManagementPage />} path="/supervisor/profiles" />
            <Route element={<HistoryPage />} path="/supervisor/history" />
          </Route>
        </Route>

        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  );
}
