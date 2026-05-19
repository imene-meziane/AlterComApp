import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { usePhrase } from '../contexts/PhraseContext';
import { supervisorNavigation, workerNavigation } from '../data/navigation';

function ShellLayout({ mode }) {
  const { logout, user } = useAuth();
  const { items, sentence } = usePhrase();
  const navigation =
    mode === 'supervisor' ? supervisorNavigation : workerNavigation;

  return (
    <div className={`portal portal--${mode}`}>
      <aside className="portal-sidebar">
        <div className="brand-card">
          <img
            alt="Logo AlterCom"
            className="brand-card__logo"
            src="/assets/logo/altercom-logo.png"
          />
          <p className="brand-card__caption">
            Communiquer, comprendre, avancer ensemble.
          </p>
        </div>

        <div className="profile-card">
          <div className="profile-card__avatar">{user.avatar || `${user.firstName[0]}${user.lastName[0]}`}</div>
          <div>
            <p className="eyebrow">Connecte</p>
            <strong>
              {user.firstName} {user.lastName}
            </strong>
            <span className={`role-pill role-pill--${user.role}`}>
              {user.role === 'supervisor' ? 'Encadrant' : 'Travailleur'}
            </span>
          </div>
        </div>

        <nav className="portal-nav" aria-label="Navigation principale">
          {navigation.map(item => (
            <NavLink
              className={({ isActive }) =>
                `portal-nav__link${isActive ? ' portal-nav__link--active' : ''}`
              }
              key={item.to}
              to={item.to}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {mode === 'worker' ? (
          <div className="phrase-compact">
            <p className="eyebrow">Ma phrase</p>
            <strong>{items.length} pictogramme(s)</strong>
            <p>{sentence || 'Les images choisies apparaissent ici.'}</p>
            <NavLink className="inline-link" to="/worker/phrase">
              Ouvrir Ma phrase
            </NavLink>
          </div>
        ) : (
          <div className="phrase-compact phrase-compact--supervisor">
            <p className="eyebrow">Espace encadrant</p>
            <strong>Pilotage simple</strong>
            <p>
              Ajoute des pictogrammes, assigne des routines et traite les alertes.
            </p>
          </div>
        )}

        <button className="ghost-button" onClick={logout} type="button">
          Se deconnecter
        </button>
      </aside>

      <div className="portal-main">
        <header className="portal-topbar">
          <div>
            <p className="eyebrow">{mode === 'supervisor' ? 'ESAT Alter Ego' : 'Parcours travailleur'}</p>
            <strong>
              {mode === 'supervisor'
                ? 'Tableau de travail encadrant'
                : 'Interface simple pour communiquer et suivre le travail'}
            </strong>
          </div>
          <span className="topbar-note">
            {mode === 'supervisor'
              ? 'Droits de gestion actifs'
              : 'Pense a utiliser Ma phrase si besoin'}
          </span>
        </header>

        <main className="portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default ShellLayout;
