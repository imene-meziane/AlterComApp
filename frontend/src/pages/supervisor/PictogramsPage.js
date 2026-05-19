import React, { useEffect, useState } from 'react';

import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

const emptyForm = {
  id: '',
  key: '',
  label: '',
  phrase: '',
  builderText: '',
  category: '',
  imageUrl: '',
  color: '#6c9f8e',
  isActive: true
};

function PictogramsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [pictograms, setPictograms] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [notice, setNotice] = useState('');

  async function loadData() {
    const [categoriesData, pictogramsData] = await Promise.all([
      api.get('/categories', token),
      api.get('/pictograms', token)
    ]);

    setCategories(categoriesData);
    setPictograms(pictogramsData);
    setForm(current => ({
      ...current,
      category:
        current.category || categoriesData[0]?.id || categoriesData[0]?.key || ''
    }));
  }

  useEffect(() => {
    loadData().catch(error => {
      setNotice(error.message);
    });
  }, [token]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      key: form.key,
      label: form.label,
      phrase: form.phrase,
      builderText: form.builderText,
      category: form.category,
      imageUrl: form.imageUrl,
      color: form.color,
      isActive: form.isActive
    };

    try {
      if (form.id) {
        await api.put(`/pictograms/${form.id}`, payload, token);
        setNotice('Pictogramme modifie.');
      } else {
        await api.post('/pictograms', payload, token);
        setNotice('Pictogramme ajoute.');
      }

      setForm({
        ...emptyForm,
        category: categories[0]?.id || ''
      });
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  function startEdit(item) {
    setForm({
      id: item.id,
      key: item.key,
      label: item.label,
      phrase: item.phrase,
      builderText: item.builderText || '',
      category: item.category?.id || item.category?.key || '',
      imageUrl: item.imageUrl,
      color: item.color,
      isActive: item.isActive
    });
  }

  async function handleDelete(item) {
    if (!window.confirm(`Supprimer ${item.label} ?`)) {
      return;
    }

    try {
      await api.delete(`/pictograms/${item.id}`, token);
      setNotice('Pictogramme supprime.');
      if (form.id === item.id) {
        setForm({
          ...emptyForm,
          category: categories[0]?.id || ''
        });
      }
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Gestion des pictogrammes"
        title="Ajouter, modifier ou desactiver un pictogramme"
        description="Les travailleurs ne voient que les pictogrammes actifs adaptes a leur role."
      />

      {notice ? <div className="notice notice--success">{notice}</div> : null}

      <section className="management-grid">
        <form className="panel form-stack" onSubmit={handleSubmit}>
          <p className="eyebrow">{form.id ? 'Edition' : 'Nouveau pictogramme'}</p>
          <label>
            Cle technique
            <input name="key" onChange={handleChange} type="text" value={form.key} />
          </label>
          <label>
            Texte court
            <input name="label" onChange={handleChange} type="text" value={form.label} />
          </label>
          <label>
            Phrase vocale
            <textarea
              name="phrase"
              onChange={handleChange}
              rows="3"
              value={form.phrase}
            />
          </label>
          <label>
            Texte pour Ma phrase
            <input
              name="builderText"
              onChange={handleChange}
              type="text"
              value={form.builderText}
            />
          </label>
          <label>
            Categorie
            <select
              name="category"
              onChange={handleChange}
              value={form.category}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            URL image
            <input
              name="imageUrl"
              onChange={handleChange}
              type="text"
              value={form.imageUrl}
            />
          </label>
          <label>
            Couleur
            <input name="color" onChange={handleChange} type="color" value={form.color} />
          </label>
          <label className="checkbox-row">
            <input
              checked={form.isActive}
              name="isActive"
              onChange={handleChange}
              type="checkbox"
            />
            Actif pour les travailleurs
          </label>
          <div className="button-row">
            <button className="primary-button" type="submit">
              {form.id ? 'Enregistrer' : 'Ajouter'}
            </button>
            <button
              className="secondary-button"
              onClick={() =>
                setForm({
                  ...emptyForm,
                  category: categories[0]?.id || ''
                })
              }
              type="button"
            >
              Vider
            </button>
          </div>
        </form>

        <div className="panel">
          <p className="eyebrow">Tous les pictogrammes</p>
          <div className="data-list">
            {pictograms.map(item => (
              <article className="data-row" key={item.id}>
                <div className="data-row__with-icon">
                  <img alt="" src={item.imageUrl} />
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.phrase}</p>
                    <small>{item.category?.name}</small>
                  </div>
                </div>
                <div className="data-row__actions">
                  <StatusBadge value={item.isActive ? 'active' : 'inactive'} />
                  <button className="inline-link" onClick={() => startEdit(item)} type="button">
                    Modifier
                  </button>
                  <button
                    className="inline-link inline-link--danger"
                    onClick={() => handleDelete(item)}
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

export default PictogramsPage;
