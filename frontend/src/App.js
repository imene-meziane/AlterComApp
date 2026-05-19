import React from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes
} from 'react-router-dom';

import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import ShellLayout from './components/ShellLayout';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import AlertsPage from './pages/supervisor/AlertsPage';
import CategoriesPage from './pages/supervisor/CategoriesPage';
import DashboardPage from './pages/supervisor/DashboardPage';
import PictogramsPage from './pages/supervisor/PictogramsPage';
import RoutinesManagementPage from './pages/supervisor/RoutinesManagementPage';
import WorkersPage from './pages/supervisor/WorkersPage';
import EmergencyPage from './pages/worker/EmergencyPage';
import PhrasePage from './pages/worker/PhrasePage';
import RoutinesPage from './pages/worker/RoutinesPage';
import WorkerCategoryPage from './pages/worker/WorkerCategoryPage';
import WorkerHomePage from './pages/worker/WorkerHomePage';

function LandingRedirect() {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingScreen message="Chargement de votre session AlterCom..." />;
  }

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={user.role === 'supervisor' ? '/supervisor' : '/worker'} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingRedirect />} />
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute roles={['worker']} />}>
          <Route element={<ShellLayout mode="worker" />}>
            <Route path="/worker" element={<WorkerHomePage />} />
            <Route
              path="/worker/communication"
              element={
                <WorkerCategoryPage
                  categoryKey="communication"
                  title="Communiquer"
                  description="Choisis une image pour parler simplement."
                  helperText="Chaque clic lit la phrase et l'ajoute a Ma phrase."
                />
              }
            />
            <Route
              path="/worker/travail"
              element={
                <WorkerCategoryPage
                  categoryKey="travail"
                  title="Travail"
                  description="Parle du travail dans l'atelier avec des pictogrammes clairs."
                  helperText="Tu peux signaler une consigne, un probleme ou une tache terminee."
                />
              }
            />
            <Route
              path="/worker/emotions"
              element={
                <WorkerCategoryPage
                  categoryKey="emotions"
                  title="Emotions"
                  description="Montre comment tu te sens avec peu de texte."
                  helperText="L'encadrant comprend plus vite ton etat."
                />
              }
            />
            <Route path="/worker/routines" element={<RoutinesPage />} />
            <Route path="/worker/urgence" element={<EmergencyPage />} />
            <Route path="/worker/phrase" element={<PhrasePage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['supervisor']} />}>
          <Route element={<ShellLayout mode="supervisor" />}>
            <Route path="/supervisor" element={<DashboardPage />} />
            <Route path="/supervisor/pictograms" element={<PictogramsPage />} />
            <Route path="/supervisor/categories" element={<CategoriesPage />} />
            <Route path="/supervisor/routines" element={<RoutinesManagementPage />} />
            <Route path="/supervisor/workers" element={<WorkersPage />} />
            <Route path="/supervisor/alerts" element={<AlertsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
