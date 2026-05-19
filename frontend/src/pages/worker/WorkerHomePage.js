import React from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import { workerHomeCards } from '../../data/navigation';

function WorkerHomePage() {
  const { user } = useAuth();
  const favorites = user.favoritePictograms || [];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Accueil travailleur"
        title={`Bonjour ${user.firstName}`}
        description="Choisis un espace simple pour parler, suivre tes routines ou demander de l'aide."
      />

      <section className="home-grid">
        {workerHomeCards.map(card => (
          <Link
            className="home-card"
            key={card.to}
            style={{ '--card-accent': card.color }}
            to={card.to}
          >
            <img alt="" className="home-card__icon" src={card.icon} />
            <div>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="panel panel--soft">
        <p className="eyebrow">Aide FALC</p>
        <strong>Tu peux toucher une image pour faire lire une phrase.</strong>
        <p className="panel__text">
          Les images choisies vont aussi dans la page Ma phrase.
        </p>
      </section>

      {favorites.length ? (
        <section className="panel">
          <p className="eyebrow">Pictogrammes favoris</p>
          <div className="compact-list">
            {favorites.map(item => (
              <article className="compact-list__item" key={item.id}>
                <img alt="" src={item.imageUrl} />
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.phrase}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default WorkerHomePage;
