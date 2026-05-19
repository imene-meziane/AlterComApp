import React, { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const emptyForm = {
  id: '',
  key: '',
  name: '',
  description: '',
  color: '#6c9f8e',
  icon: '',
  visibleFor: ['worker', 'supervisor']
};

function CategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  async function loadCategories() {
    const data = await api.get('/categories', token);
    setCategories(data);
  }

  useEffect(() => {
    loadCategories().catch(error => {
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

  function toggleRole(role) {
    setForm(current => {
      const currentRoles = current.visibleFor.includes(role)
        ? current.visibleFor.filter(item => item !== role)
        : [...current.visibleFor, role];

      return {
        ...current,
        visibleFor: currentRoles
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      key: form.key,
      name: form.name,
      description: form.description,
      color: form.color,
      icon: form.icon,
      visibleFor: form.visibleFor
    };

    try {
      if (form.id) {
        await api.put(`/categories/${form.id}`, payload, token);
        setNotice('Categorie modifiee.');
      } else {
        await api.post('/categories', payload, token);
        setNotice('Categorie ajoutee.');
      }
      setForm(emptyForm);
      await loadCategories();
    } catch (error) {
      setNotice(error.message);
    }
  }

  function startEdit(category) {
    setForm({
      id: category.id,
      key: category.key,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      visibleFor: category.visibleFor
    });
  }

  async function handleDelete(category) {
    if (!window.confirm(`Supprimer ${category.name} ?`)) {
      return;
    }

    try {
      await api.delete(`/categories/${category.id}`, token);
      setNotice('Categorie supprimee.');
      if (form.id === category.id) {
        setForm(emptyForm);
      }
      await loadCategories();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Gestion des categories"
        title="Structurer les espaces de communication"
        description="Les categories pilotent ce que voit le travailleur et aident l'encadrant a organiser l'application."
      />

      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <section className="management-grid">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <p className="eyebrow">{form.id ? 'Edition' : 'Nouvelle categorie'}</p>
          <label>
            Cle technique
            <input name="key" onChange={handleChange} type="text" value={form.key} />
          </label>
          <label>
            Nom
            <input name="name" onChange={handleChange} type="text" value={form.name} />
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
            Couleur
            <input name="color" onChange={handleChange} type="color" value={form.color} />
          </label>
          <label>
            Icone
            <input name="icon" onChange={handleChange} type="text" value={form.icon} />
          </label>
          <div className="checkbox-group">
            <span>Visible pour</span>
            <label className="checkbox-row">
              <input
                checked={form.visibleFor.includes('worker')}
                onChange={() => toggleRole('worker')}
                type="checkbox"
              />
              Travailleur
            </label>
            <label className="checkbox-row">
              <input
                checked={form.visibleFor.includes('supervisor')}
                onChange={() => toggleRole('supervisor')}
                type="checkbox"
              />
              Encadrant
            </label>
          </div>
          <div className="button-row">
            <button className="primary-button" type="submit">
              {form.id ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button className="secondary-button" onClick={() => setForm(emptyForm)} type="button">
              Vider
            </button>
          </div>
        </form>

        <div className="panel">
          <p className="eyebrow">Categories existantes</p>
          <div className="data-list">
            {categories.map(category => (
              <article className="data-row" key={category.id}>
                <div className="data-row__with-icon">
                  <img alt="" src={category.icon} />
                  <div>
                    <strong>{category.name}</strong>
                    <p>{category.description}</p>
                  </div>
                </div>
                <div className="data-row__actions">
                  <small>{category.visibleFor.join(' / ')}</small>
                  <button className="inline-link" onClick={() => startEdit(category)} type="button">
                    Modifier
                  </button>
                  <button
                    className="inline-link inline-link--danger"
                    onClick={() => handleDelete(category)}
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

export default CategoriesPage;
