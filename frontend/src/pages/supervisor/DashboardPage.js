import React, { useEffect, useState } from 'react';

import LoadingScreen from '../../components/LoadingScreen';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

function DashboardPage() {
  const { token } = useAuth();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard/summary', token)
      .then(data => {
        setSummary(data);
      })
      .catch(fetchError => {
        setError(fetchError.message);
      });
  }, [token]);

  if (!summary && !error) {
    return <LoadingScreen message="Chargement du tableau de bord..." />;
  }

  const metrics = summary?.metrics || {
    workersCount: 0,
    pictogramsCount: 0,
    routinesCount: 0,
    pendingAlerts: 0
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Tableau de bord"
        title="Vue d'ensemble encadrant"
        description="Retrouve ici les chiffres utiles, les alertes recentes et les derniers ajouts."
      />

      {error ? <div className="notice notice--error">{error}</div> : null}

      <section className="metric-grid">
        <article className="metric-card">
          <span>Travailleurs</span>
          <strong>{metrics.workersCount}</strong>
        </article>
        <article className="metric-card">
          <span>Pictogrammes actifs</span>
          <strong>{metrics.pictogramsCount}</strong>
        </article>
        <article className="metric-card">
          <span>Routines</span>
          <strong>{metrics.routinesCount}</strong>
        </article>
        <article className="metric-card metric-card--alert">
          <span>Alertes en attente</span>
          <strong>{metrics.pendingAlerts}</strong>
        </article>
      </section>

      <section className="two-columns">
        <article className="panel">
          <p className="eyebrow">Dernieres alertes</p>
          <div className="data-list">
            {(summary?.recentAlerts || []).map(alert => (
              <div className="data-row" key={alert.id}>
                <div>
                  <strong>
                    {alert.workerId?.firstName} {alert.workerId?.lastName}
                  </strong>
                  <p>{alert.message}</p>
                </div>
                <div className="data-row__meta">
                  <StatusBadge value={alert.status} />
                  <small>{new Date(alert.createdAt).toLocaleString('fr-FR')}</small>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <p className="eyebrow">Derniers pictogrammes</p>
          <div className="data-list">
            {(summary?.recentPictograms || []).map(pictogram => (
              <div className="data-row" key={pictogram.id}>
                <div className="data-row__with-icon">
                  <img alt="" src={pictogram.imageUrl} />
                  <div>
                    <strong>{pictogram.label}</strong>
                    <p>{pictogram.category?.name}</p>
                  </div>
                </div>
                <small>{new Date(pictogram.createdAt).toLocaleDateString('fr-FR')}</small>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
