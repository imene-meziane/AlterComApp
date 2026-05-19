import React, { useEffect, useState } from 'react';

import LoadingScreen from '../../components/LoadingScreen';
import PageHeader from '../../components/PageHeader';
import PictogramTile from '../../components/PictogramTile';
import { useAuth } from '../../contexts/AuthContext';
import { usePhrase } from '../../contexts/PhraseContext';
import api from '../../lib/api';
import { speakText } from '../../lib/speech';

function EmergencyPage() {
  const { token } = useAuth();
  const { addPictogram } = usePhrase();
  const [pictograms, setPictograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api
      .get('/pictograms?category=urgence', token)
      .then(data => {
        setPictograms(data);
      })
      .catch(fetchError => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  async function handleEmergency(item) {
    try {
      await api.post(
        '/alerts',
        {
          type: 'urgence',
          message: item.phrase
        },
        token
      );
      addPictogram(item);
      speakText(item.phrase);
      setMessage('Votre demande a ete envoyee a un encadrant.');
    } catch (submissionError) {
      setMessage(submissionError.message);
    }
  }

  if (loading) {
    return <LoadingScreen message="Chargement des alertes d'urgence..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        backTo="/worker"
        eyebrow="Urgence"
        title="Demander de l'aide rapidement"
        description="Appuie sur un grand bouton pour prevenir un encadrant."
      />

      {message ? <div className="notice notice--success">{message}</div> : null}
      {error ? <div className="notice notice--error">{error}</div> : null}

      <section className="emergency-stack">
        {pictograms.map(item => (
          <PictogramTile
            item={item}
            key={item.id}
            onClick={handleEmergency}
            variant="emergency"
          />
        ))}
      </section>
    </div>
  );
}

export default EmergencyPage;
