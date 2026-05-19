import React, { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

function AlertsPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [notice, setNotice] = useState('');

  async function loadAlerts() {
    const data = await api.get('/alerts', token);
    setAlerts(data);
  }

  useEffect(() => {
    loadAlerts().catch(error => {
      setNotice(error.message);
    });
  }, [token]);

  async function handleStatusChange(alertId, status) {
    try {
      await api.put(`/alerts/${alertId}/status`, { status }, token);
      setNotice('Statut de l alerte mis a jour.');
      await loadAlerts();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Alertes"
        title="Traiter les demandes des travailleurs"
        description="Chaque alerte remonte le message, le travailleur et le statut de traitement."
      />

      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <section className="panel">
        <div className="data-list">
          {alerts.map(alert => (
            <article className="data-row" key={alert.id}>
              <div>
                <strong>
                  {alert.workerId?.firstName} {alert.workerId?.lastName}
                </strong>
                <p>{alert.message}</p>
                <small>
                  {alert.type} · {new Date(alert.createdAt).toLocaleString('fr-FR')}
                </small>
              </div>
              <div className="data-row__actions">
                <StatusBadge value={alert.status} />
                <select
                  onChange={event =>
                    handleStatusChange(alert.id, event.target.value)
                  }
                  value={alert.status}
                >
                  <option value="pending">En attente</option>
                  <option value="seen">Vue</option>
                  <option value="resolved">Resolue</option>
                </select>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AlertsPage;
