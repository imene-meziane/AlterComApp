import React, { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

function WorkersPage() {
  const { token } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/users?role=worker', token)
      .then(data => {
        setWorkers(data);
      })
      .catch(fetchError => {
        setError(fetchError.message);
      });
  }, [token]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Travailleurs"
        title="Suivi des profils travailleurs"
        description="Consulte rapidement les comptes, routines assignees et elements favoris."
      />

      {error ? <div className="notice notice--error">{error}</div> : null}

      <section className="worker-grid">
        {workers.map(worker => (
          <article className="panel worker-card" key={worker.id}>
            <div className="worker-card__top">
              <div className="profile-card__avatar">{worker.avatar}</div>
              <div>
                <strong>
                  {worker.firstName} {worker.lastName}
                </strong>
                <p>{worker.email}</p>
              </div>
              <StatusBadge value={worker.role} />
            </div>
            <div className="worker-card__meta">
              <p>Routines assignees : {worker.assignedRoutines?.length || 0}</p>
              <p>Compte cree le {new Date(worker.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

export default WorkersPage;
