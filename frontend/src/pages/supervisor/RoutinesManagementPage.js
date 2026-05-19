import React, { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const blankStep = {
  title: '',
  instruction: '',
  pictogram: '',
  audioText: ''
};

function createEmptyRoutine(categories = []) {
  return {
    id: '',
    title: '',
    description: '',
    category: categories[0]?.id || '',
    assignedTo: [],
    steps: [{ ...blankStep }]
  };
}

function RoutinesManagementPage() {
  const { token } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pictograms, setPictograms] = useState([]);
  const [form, setForm] = useState(createEmptyRoutine());
  const [notice, setNotice] = useState('');

  async function loadData() {
    const [routinesData, workersData, categoriesData, pictogramsData] =
      await Promise.all([
        api.get('/routines', token),
        api.get('/users?role=worker', token),
        api.get('/categories', token),
        api.get('/pictograms', token)
      ]);

    setRoutines(routinesData);
    setWorkers(workersData);
    setCategories(categoriesData);
    setPictograms(pictogramsData);
    setForm(current =>
      current.id
        ? current
        : {
            ...current,
            category: current.category || categoriesData[0]?.id || ''
          }
    );
  }

  useEffect(() => {
    loadData().catch(error => {
      setNotice(error.message);
    });
  }, [token]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: value
    }));
  }

  function handleAssignedWorkersChange(event) {
    const selectedValues = Array.from(event.target.selectedOptions).map(
      option => option.value
    );

    setForm(current => ({
      ...current,
      assignedTo: selectedValues
    }));
  }

  function handleStepChange(index, field, value) {
    setForm(current => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              [field]: value
            }
          : step
      )
    }));
  }

  function addStep() {
    setForm(current => ({
      ...current,
      steps: [...current.steps, { ...blankStep }]
    }));
  }

  function removeStep(index) {
    setForm(current => ({
      ...current,
      steps: current.steps.filter((step, stepIndex) => stepIndex !== index)
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      assignedTo: form.assignedTo,
      steps: form.steps.map((step, index) => ({
        ...step,
        order: index + 1
      }))
    };

    try {
      if (form.id) {
        await api.put(`/routines/${form.id}`, payload, token);
        setNotice('Routine modifiee.');
      } else {
        await api.post('/routines', payload, token);
        setNotice('Routine ajoutee.');
      }

      setForm(createEmptyRoutine(categories));
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  function startEdit(routine) {
    setForm({
      id: routine.id,
      title: routine.title,
      description: routine.description,
      category: routine.category?.id || '',
      assignedTo: routine.assignedTo.map(worker => worker.id),
      steps: routine.steps.map(step => ({
        title: step.title,
        instruction: step.instruction,
        pictogram: step.pictogram?.id || step.pictogram?.key || '',
        audioText: step.audioText || ''
      }))
    });
  }

  async function handleDelete(routine) {
    if (!window.confirm(`Supprimer la routine ${routine.title} ?`)) {
      return;
    }

    try {
      await api.delete(`/routines/${routine.id}`, token);
      setNotice('Routine supprimee.');
      if (form.id === routine.id) {
        setForm(createEmptyRoutine(categories));
      }
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Gestion des routines"
        title="Creer des parcours de travail visuels"
        description="Les routines guident le travailleur et rendent les consignes plus stables."
      />

      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <section className="management-grid">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <p className="eyebrow">{form.id ? 'Edition' : 'Nouvelle routine'}</p>
          <label>
            Titre
            <input name="title" onChange={handleChange} type="text" value={form.title} />
          </label>
          <label>
            Description
            <textarea
              name="description"
              onChange={handleChange}
              rows="3"
              value={form.description}
            />
          </label>
          <label>
            Categorie
            <select name="category" onChange={handleChange} value={form.category}>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Travailleurs assignes
            <select
              multiple
              onChange={handleAssignedWorkersChange}
              value={form.assignedTo}
            >
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.firstName} {worker.lastName}
                </option>
              ))}
            </select>
          </label>

          <div className="step-editor">
            <div className="step-editor__header">
              <strong>Etapes</strong>
              <button className="inline-link" onClick={addStep} type="button">
                Ajouter une etape
              </button>
            </div>

            {form.steps.map((step, index) => (
              <div className="step-editor__card" key={`${index}-${step.title}`}>
                <label>
                  Titre
                  <input
                    onChange={event =>
                      handleStepChange(index, 'title', event.target.value)
                    }
                    type="text"
                    value={step.title}
                  />
                </label>
                <label>
                  Instruction
                  <textarea
                    onChange={event =>
                      handleStepChange(index, 'instruction', event.target.value)
                    }
                    rows="2"
                    value={step.instruction}
                  />
                </label>
                <label>
                  Pictogramme
                  <select
                    onChange={event =>
                      handleStepChange(index, 'pictogram', event.target.value)
                    }
                    value={step.pictogram}
                  >
                    <option value="">Sans pictogramme</option>
                    {pictograms.map(pictogram => (
                      <option key={pictogram.id} value={pictogram.id}>
                        {pictogram.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Texte lu
                  <input
                    onChange={event =>
                      handleStepChange(index, 'audioText', event.target.value)
                    }
                    type="text"
                    value={step.audioText}
                  />
                </label>
                {form.steps.length > 1 ? (
                  <button
                    className="inline-link inline-link--danger"
                    onClick={() => removeStep(index)}
                    type="button"
                  >
                    Retirer cette etape
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div className="button-row">
            <button className="primary-button" type="submit">
              {form.id ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              className="secondary-button"
              onClick={() => setForm(createEmptyRoutine(categories))}
              type="button"
            >
              Vider
            </button>
          </div>
        </form>

        <div className="panel">
          <p className="eyebrow">Routines existantes</p>
          <div className="data-list">
            {routines.map(routine => (
              <article className="data-row" key={routine.id}>
                <div>
                  <strong>{routine.title}</strong>
                  <p>{routine.description}</p>
                  <small>
                    {routine.assignedTo.map(worker => `${worker.firstName} ${worker.lastName}`).join(', ')}
                  </small>
                </div>
                <div className="data-row__actions">
                  <small>{routine.steps.length} etapes</small>
                  <button className="inline-link" onClick={() => startEdit(routine)} type="button">
                    Modifier
                  </button>
                  <button
                    className="inline-link inline-link--danger"
                    onClick={() => handleDelete(routine)}
                    type="button"
                  >
                    Supprimer
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default RoutinesManagementPage;
