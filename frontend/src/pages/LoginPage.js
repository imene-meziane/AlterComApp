import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const demoAccounts = [
  {
    role: 'Encadrant',
    email: 'claire.martin@alterego.fr',
    password: 'AlterCom123!'
  },
  {
    role: 'Encadrant',
    email: 'hugo.leroux@alterego.fr',
    password: 'AlterCom123!'
  },
  {
    role: 'Travailleur',
    email: 'sarah.brunet@alterego.fr',
    password: 'AlterCom123!'
  },
  {
    role: 'Travailleur',
    email: 'malik.bensaid@alterego.fr',
    password: 'AlterCom123!'
  }
];

function LoginPage() {
  const { login, loading, user } = useAuth();
  const [form, setForm] = useState({
    email: demoAccounts[0].email,
    password: demoAccounts[0].password
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && user) {
    return (
      <Navigate
        replace
        to={user.role === 'supervisor' ? '/supervisor' : '/worker'}
      />
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(form.email, form.password);
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillAccount(account) {
    setForm({
      email: account.email,
      password: account.password
    });
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-card__hero">
          <img
            alt="Logo AlterCom"
            className="auth-logo"
            src="/assets/logo/altercom-logo.png"
          />
          <p className="eyebrow">Application inclusive</p>
          <h1>Communication, routines et alertes pour l'ESAT Alter Ego</h1>
          <p>
            AlterCom separe maintenant clairement le travailleur et l'encadrant,
            avec une API REST et une base MongoDB.
          </p>
        </div>

        <div className="auth-card__panel">
          <div className="panel">
            <p className="eyebrow">Connexion</p>
            <h2>Entrer dans AlterCom</h2>
            <p className="panel__text">
              Choisis un compte de demonstration ou saisis tes identifiants.
            </p>

            <form className="form-stack" onSubmit={handleSubmit}>
              <label>
                Email
                <input
                  name="email"
                  onChange={handleChange}
                  type="email"
                  value={form.email}
                />
              </label>

              <label>
                Mot de passe
                <input
                  name="password"
                  onChange={handleChange}
                  type="password"
                  value={form.password}
                />
              </label>

              {error ? <div className="notice notice--error">{error}</div> : null}

              <button className="primary-button" disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>

          <div className="panel panel--muted">
            <p className="eyebrow">Comptes demo</p>
            <div className="demo-account-list">
              {demoAccounts.map(account => (
                <button
                  className="demo-account"
                  key={account.email}
                  onClick={() => fillAccount(account)}
                  type="button"
                >
                  <strong>{account.role}</strong>
                  <span>{account.email}</span>
                  <small>{account.password}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LoginPage;
