import React from 'react';
import ReactDOM from 'react-dom/client';

import { AppRoot } from './core/AppRoot';
import { AuthProvider } from './providers/AuthProvider';
import { ComposerProvider } from './providers/ComposerProvider';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Element racine introuvable.');
}

// Ecouteur global pour les événements d'auth invalidée
window.addEventListener('altercom:unauth', () => {
  try {
    // Nettoyage local si nécessaire
    window.localStorage.removeItem('altercom.auth.v4');
    // Redirection vers login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  } catch (e) {
    // ignore
  }
});

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ComposerProvider>
        <AppRoot />
      </ComposerProvider>
    </AuthProvider>
  </React.StrictMode>
);
