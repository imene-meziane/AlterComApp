import React, { useState } from 'react';

import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { usePhrase } from '../../contexts/PhraseContext';
import api from '../../lib/api';
import { speakText } from '../../lib/speech';

function PhrasePage() {
  const { token } = useAuth();
  const { clearPhrase, items, removePictogram, sentence } = usePhrase();
  const [notice, setNotice] = useState('');

  async function handleSend() {
    if (!sentence) {
      return;
    }

    try {
      await api.post(
        '/alerts',
        {
          type: 'phrase',
          message: sentence
        },
        token
      );
      setNotice("La phrase a ete envoyee a un encadrant.");
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        backTo="/worker"
        eyebrow="Ma phrase"
        title="Construire une phrase"
        description="Retrouve ici les pictogrammes choisis, puis lis ou envoie ta phrase."
      />

      <section className="panel panel--phrase">
        <p className="eyebrow">Phrase construite</p>
        <strong className="panel__sentence">
          {sentence || 'Choisis d abord des pictogrammes dans les autres pages.'}
        </strong>
        <div className="button-row">
          <button
            className="primary-button"
            disabled={!sentence}
            onClick={() => speakText(sentence)}
            type="button"
          >
            Lire
          </button>
          <button
            className="secondary-button"
            disabled={!items.length}
            onClick={clearPhrase}
            type="button"
          >
            Effacer
          </button>
          <button
            className="secondary-button"
            disabled={!sentence}
            onClick={handleSend}
            type="button"
          >
            Envoyer a un encadrant
          </button>
        </div>
      </section>

      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <section className="selected-grid">
        {items.map(item => (
          <article className="selected-item" key={item.id}>
            <img alt="" src={item.imageUrl} />
            <div>
              <strong>{item.label}</strong>
              <p>{item.phrase}</p>
            </div>
            <button
              className="inline-link inline-link--danger"
              onClick={() => removePictogram(item.id)}
              type="button"
            >
              Retirer
            </button>
          </article>
        ))}
      </section>
    </div>
  );
}

export default PhrasePage;
