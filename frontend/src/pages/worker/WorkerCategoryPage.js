import React, { useEffect, useState } from 'react';

import LoadingScreen from '../../components/LoadingScreen';
import PageHeader from '../../components/PageHeader';
import PictogramTile from '../../components/PictogramTile';
import { useAuth } from '../../contexts/AuthContext';
import { usePhrase } from '../../contexts/PhraseContext';
import api from '../../lib/api';
import { speakText } from '../../lib/speech';

function WorkerCategoryPage({
  categoryKey,
  title,
  description,
  helperText
}) {
  const { token } = useAuth();
  const { addPictogram } = usePhrase();
  const [pictograms, setPictograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get(`/pictograms?category=${categoryKey}`, token)
      .then(data => {
        setPictograms(data);
      })
      .catch(fetchError => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [categoryKey, token]);

  function handleSelect(item) {
    addPictogram(item);
    speakText(item.phrase);
    setFeedback(`"${item.label}" a ete ajoute a Ma phrase.`);
  }

  if (loading) {
    return <LoadingScreen message={`Chargement de ${title.toLowerCase()}...`} />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        backTo="/worker"
        eyebrow={title}
        title={title}
        description={description}
      />

      <section className="panel panel--soft">
        <strong>{helperText}</strong>
        <p className="panel__text">
          L'application lit la phrase et garde le pictogramme dans Ma phrase.
        </p>
      </section>

      {feedback ? <div className="notice notice--success">{feedback}</div> : null}
      {error ? <div className="notice notice--error">{error}</div> : null}

      <section className="pictogram-grid">
        {pictograms.map(item => (
          <PictogramTile item={item} key={item.id} onClick={handleSelect} />
        ))}
      </section>
    </div>
  );
}

export default WorkerCategoryPage;
