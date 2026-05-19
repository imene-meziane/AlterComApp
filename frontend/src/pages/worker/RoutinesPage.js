import React, { useEffect, useState } from 'react';

import LoadingScreen from '../../components/LoadingScreen';
import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { speakText } from '../../lib/speech';

function RoutinesPage() {
  const { token } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stepByRoutine, setStepByRoutine] = useState({});

  useEffect(() => {
    api
      .get('/routines', token)
      .then(data => {
        setRoutines(data);
      })
      .catch(fetchError => {
        setError(fetchError.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  function goToNextStep(routineId, totalSteps) {
    setStepByRoutine(current => {
      const nextIndex = Math.min((current[routineId] || 0) + 1, totalSteps - 1);
      return {
        ...current,
        [routineId]: nextIndex
      };
    });
  }

  if (loading) {
    return <LoadingScreen message="Chargement de vos routines..." />;
  }

  return (
    <div className="page-stack">
      <PageHeader
        backTo="/worker"
        eyebrow="Mes routines"
        title="Suivre les etapes du travail"
        description="Chaque routine te guide pas a pas avec une image et une phrase simple."
      />

      {error ? <div className="notice notice--error">{error}</div> : null}

      <section className="routine-list">
        {routines.map(routine => {
          const currentIndex = stepByRoutine[routine.id] || 0;
          const currentStep = routine.steps[currentIndex];

          return (
            <article className="routine-card" key={routine.id}>
              <div className="routine-card__header">
                <div>
                  <p className="eyebrow">{routine.category?.name || 'Routine'}</p>
                  <h2>{routine.title}</h2>
                  <p>{routine.description}</p>
                </div>
                <span className="routine-card__counter">
                  Etape {currentIndex + 1} / {routine.steps.length}
                </span>
              </div>

              {currentStep ? (
                <div className="routine-step">
                  <img
                    alt=""
                    className="routine-step__image"
                    src={currentStep.pictogram?.imageUrl}
                  />
                  <div>
                    <strong>{currentStep.title}</strong>
                    <p>{currentStep.instruction}</p>
                    <div className="button-row">
                      <button
                        className="secondary-button"
                        onClick={() =>
                          speakText(
                            currentStep.audioText || currentStep.instruction
                          )
                        }
                        type="button"
                      >
                        Lire
                      </button>
                      <button
                        className="primary-button"
                        disabled={currentIndex >= routine.steps.length - 1}
                        onClick={() =>
                          goToNextStep(routine.id, routine.steps.length)
                        }
                        type="button"
                      >
                        Etape suivante
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default RoutinesPage;
