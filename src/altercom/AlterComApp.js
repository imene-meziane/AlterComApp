import React, { useEffect, useState } from 'react';

import categories from './data/categories';
import initialPictograms from './data/pictograms.json';
import './altercom.css';

const STORAGE_KEY = 'altercom.pictograms.v1';
const DEFAULT_MESSAGE = 'Touchez une case pour parler.';
const quickWords = [
  { id: 'starter', label: 'Je veux', value: 'Je veux' },
  { id: 'drink', label: 'boire', value: 'boire' },
  { id: 'water', label: 'eau', value: "de l'eau" },
  { id: 'eat', label: 'manger', value: 'manger' },
  { id: 'pause', label: 'pause', value: 'une pause' },
  { id: 'help', label: 'aide', value: "de l'aide" },
  { id: 'toilet', label: 'toilettes', value: 'aller aux toilettes' }
];
const EMPTY_ADMIN_FORM = {
  originalId: null,
  id: '',
  label: '',
  phrase: '',
  builderLabel: '',
  builderValue: '',
  category: 'communication',
  image: '',
  color: '#6fbfa7'
};

function readStoredPictograms() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return initialPictograms;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length ? parsed : initialPictograms;
  } catch (error) {
    return initialPictograms;
  }
}

function persistPictograms(pictograms) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pictograms));
  } catch (error) {
    return null;
  }

  return null;
}

function speakText(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => voice.lang.startsWith('fr'));

  utterance.lang = preferredVoice ? preferredVoice.lang : 'fr-FR';
  utterance.voice = preferredVoice || null;
  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function toSentence(tokens) {
  if (!tokens.length) {
    return '';
  }

  const rawSentence = tokens
    .map(token => token.value)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!rawSentence) {
    return '';
  }

  const normalized =
    rawSentence.charAt(0).toUpperCase() + rawSentence.slice(1).trim();

  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildUniqueId(pictograms, draft) {
  const seed = slugify(draft.id || draft.label || draft.phrase || 'pictogramme');
  const baseId = seed || `pictogramme-${Date.now()}`;
  let nextId = baseId;
  let suffix = 2;
  const existingIds = new Set(
    pictograms
      .filter(item => item.id !== draft.originalId)
      .map(item => item.id)
  );

  while (existingIds.has(nextId)) {
    nextId = `${baseId}-${suffix}`;
    suffix += 1;
  }

  return nextId;
}

function getCategoryById(categoryId) {
  return categories.find(category => category.id === categoryId);
}

function PictogramImage({ item, className }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [item.image]);

  if (!item.image || failed) {
    return (
      <div
        aria-hidden="true"
        className={`${className} pictogram-image pictogram-image--fallback`}
        style={{ backgroundColor: item.color }}
      >
        <span>{item.label.slice(0, 1)}</span>
      </div>
    );
  }

  return (
    <img
      alt=""
      className={`${className} pictogram-image`}
      onError={() => setFailed(true)}
      src={item.image}
    />
  );
}

function AppHeader({ onBackHome, onOpenAdmin }) {
  return (
    <header className="app-header">
      <button className="ghost-button" onClick={onBackHome} type="button">
        Accueil
      </button>

      <div className="brand-lockup">
        <img
          alt="Logo AlterCom"
          className="brand-logo"
          src="/assets/logo/altercom-logo.png"
        />
        <h1 className="sr-only">AlterCom</h1>
        <p className="brand-caption">Application de communication pour l'ESAT Alter Ego</p>
      </div>

      <button className="ghost-button" onClick={onOpenAdmin} type="button">
        Espace encadrant
      </button>
    </header>
  );
}

function SelectedPhrase({ phrase }) {
  return (
    <section className="selected-phrase" aria-live="polite">
      <p className="section-label">Phrase choisie</p>
      <strong>{phrase}</strong>
    </section>
  );
}

function PhraseBuilder({ tokens, onAdd, onRead, onClear }) {
  const sentence = toSentence(tokens);

  return (
    <section className="phrase-builder">
      <div className="phrase-builder__header">
        <div>
          <p className="section-label">Ma phrase</p>
          <strong>{sentence || 'Je construis ma phrase ici.'}</strong>
        </div>

        <div className="phrase-builder__actions">
          <button
            className="primary-button"
            disabled={!sentence}
            onClick={() => onRead(sentence)}
            type="button"
          >
            Lire la phrase
          </button>
          <button
            className="secondary-button"
            disabled={!tokens.length}
            onClick={onClear}
            type="button"
          >
            Effacer
          </button>
        </div>
      </div>

      <div className="quick-words" role="list" aria-label="Mots rapides">
        {quickWords.map(word => (
          <button
            className="quick-word"
            key={word.id}
            onClick={() => onAdd(word)}
            type="button"
          >
            {word.label}
          </button>
        ))}
      </div>

      {!!tokens.length && (
        <div className="phrase-builder__tokens" role="list" aria-label="Mots choisis">
          {tokens.map((token, index) => (
            <span className="phrase-token" key={`${token.label}-${index}`}>
              {token.label}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function HomeView({ categoriesList, onOpenCategory, onOpenAdmin }) {
  return (
    <section className="home-grid">
      {categoriesList.map(category => (
        <button
          className="category-card"
          key={category.id}
          onClick={() => onOpenCategory(category.id)}
          style={{
            '--accent': category.accent,
            '--surface': category.surface
          }}
          type="button"
        >
          <PictogramImage
            className="category-card__image"
            item={{
              image: category.image,
              label: category.label,
              color: category.accent
            }}
          />
          <div className="category-card__content">
            <h2>{category.label}</h2>
            <p>{category.shortDescription}</p>
            <span>{category.helperText}</span>
          </div>
        </button>
      ))}

      <button className="coach-card" onClick={onOpenAdmin} type="button">
        <div>
          <p className="section-label">Encadrant</p>
          <h2>Gerer les pictogrammes</h2>
          <p>Ajouter, modifier ou supprimer une carte pour la demo.</p>
        </div>
        <span>Ouvrir</span>
      </button>
    </section>
  );
}

function CategoryView({ category, pictograms, onSelect, onOpenAdmin }) {
  return (
    <section className="module-view">
      <div
        className="module-banner"
        style={{
          '--accent': category.accent,
          '--surface': category.surface
        }}
      >
        <div>
          <p className="section-label">{category.label}</p>
          <h2>{category.shortDescription}</h2>
          <p>{category.helperText}</p>
        </div>
        <PictogramImage
          className="module-banner__image"
          item={{
            image: category.image,
            label: category.label,
            color: category.accent
          }}
        />
      </div>

      <div className="pictogram-grid">
        {pictograms.map(item => (
          <button
            className="pictogram-card"
            key={item.id}
            onClick={() => onSelect(item)}
            style={{ '--card-color': item.color }}
            type="button"
          >
            <PictogramImage className="pictogram-card__image" item={item} />
            <span className="pictogram-card__label">{item.label}</span>
            <small className="pictogram-card__phrase">{item.phrase}</small>
          </button>
        ))}
      </div>

      {category.id === 'travail' && (
        <section className="module-note">
          <p className="section-label">ESAT Alter Ego</p>
          <strong>Ce module sert a parler du travail dans l'atelier.</strong>
        </section>
      )}

      <button className="secondary-button admin-shortcut" onClick={onOpenAdmin} type="button">
        Modifier les pictogrammes de cette categorie
      </button>
    </section>
  );
}

function EmergencyAlert({ alertState, onClose }) {
  if (!alertState) {
    return null;
  }

  return (
    <section className="emergency-alert" role="alert">
      <div>
        <p className="section-label">Alerte visuelle</p>
        <strong>{alertState.title}</strong>
        <p>{alertState.message}</p>
      </div>
      <button className="ghost-button ghost-button--light" onClick={onClose} type="button">
        Fermer
      </button>
    </section>
  );
}

function AdminPanel({
  editingItem,
  onDelete,
  onEdit,
  onReset,
  onSave,
  pictograms
}) {
  const [form, setForm] = useState(EMPTY_ADMIN_FORM);

  useEffect(() => {
    if (editingItem) {
      setForm({
        originalId: editingItem.id,
        id: editingItem.id,
        label: editingItem.label,
        phrase: editingItem.phrase,
        builderLabel: editingItem.builderLabel || '',
        builderValue: editingItem.builderValue || '',
        category: editingItem.category,
        image: editingItem.image,
        color: editingItem.color || '#6fbfa7'
      });
      return;
    }

    setForm(EMPTY_ADMIN_FORM);
  }, [editingItem]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm(current => ({
      ...current,
      [name]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSave(form);
    setForm(EMPTY_ADMIN_FORM);
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel__intro">
        <div>
          <p className="section-label">Encadrant</p>
          <h2>Gestion simple des pictogrammes</h2>
          <p>
            Les changements sont gardes sur cette tablette avec le stockage local
            du navigateur.
          </p>
        </div>
        <button className="secondary-button" onClick={onReset} type="button">
          Revenir aux donnees de depart
        </button>
      </div>

      <div className="admin-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form__preview">
            <PictogramImage
              className="admin-form__image"
              item={{
                label: form.label || 'A',
                image: form.image,
                color: form.color
              }}
            />
            <div>
              <p className="section-label">Apercu</p>
              <strong>{form.label || 'Nouveau pictogramme'}</strong>
              <p>{form.phrase || 'La phrase sera lue a voix haute.'}</p>
            </div>
          </div>

          <label>
            ID
            <input name="id" onChange={handleChange} type="text" value={form.id} />
          </label>

          <label>
            Texte court
            <input
              name="label"
              onChange={handleChange}
              placeholder="Exemple : Aide"
              required
              type="text"
              value={form.label}
            />
          </label>

          <label>
            Phrase lue
            <textarea
              name="phrase"
              onChange={handleChange}
              placeholder="Exemple : J'ai besoin d'aide"
              required
              rows="3"
              value={form.phrase}
            />
          </label>

          <label>
            Categorie
            <select name="category" onChange={handleChange} value={form.category}>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Texte pour "Ma phrase"
            <input
              name="builderValue"
              onChange={handleChange}
              placeholder="Exemple : de l'aide"
              type="text"
              value={form.builderValue}
            />
          </label>

          <label>
            Etiquette pour "Ma phrase"
            <input
              name="builderLabel"
              onChange={handleChange}
              placeholder="Exemple : aide"
              type="text"
              value={form.builderLabel}
            />
          </label>

          <label>
            Image
            <input
              name="image"
              onChange={handleChange}
              placeholder="/assets/pictograms/help.svg"
              type="text"
              value={form.image}
            />
          </label>

          <label>
            Couleur
            <input name="color" onChange={handleChange} type="color" value={form.color} />
          </label>

          <button className="primary-button" type="submit">
            {editingItem ? 'Enregistrer les changements' : 'Ajouter le pictogramme'}
          </button>
        </form>

        <div className="admin-list">
          {categories.map(category => {
            const categoryItems = pictograms.filter(item => item.category === category.id);

            return (
              <section className="admin-group" key={category.id}>
                <div className="admin-group__header">
                  <h3>{category.label}</h3>
                  <span>{categoryItems.length} pictogrammes</span>
                </div>

                {categoryItems.map(item => (
                  <article className="admin-item" key={item.id}>
                    <PictogramImage className="admin-item__image" item={item} />
                    <div className="admin-item__content">
                      <strong>{item.label}</strong>
                      <p>{item.phrase}</p>
                      <small>{item.id}</small>
                    </div>
                    <div className="admin-item__actions">
                      <button className="secondary-button" onClick={() => onEdit(item)} type="button">
                        Modifier
                      </button>
                      <button className="danger-button" onClick={() => onDelete(item.id)} type="button">
                        Supprimer
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AlterComApp() {
  const [activeView, setActiveView] = useState({ screen: 'home' });
  const [pictograms, setPictograms] = useState(() => readStoredPictograms());
  const [selectedPhrase, setSelectedPhrase] = useState(DEFAULT_MESSAGE);
  const [phraseTokens, setPhraseTokens] = useState([]);
  const [alertState, setAlertState] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    persistPictograms(pictograms);
  }, [pictograms]);

  const currentCategory =
    activeView.screen === 'category' ? getCategoryById(activeView.categoryId) : null;
  const visiblePictograms = currentCategory
    ? pictograms.filter(item => item.category === currentCategory.id)
    : [];

  function openCategory(categoryId) {
    setActiveView({ screen: 'category', categoryId });
  }

  function openAdmin() {
    setEditingItem(null);
    setActiveView({ screen: 'admin' });
  }

  function goHome() {
    setEditingItem(null);
    setActiveView({ screen: 'home' });
  }

  function addToken(token) {
    setPhraseTokens(current => [...current, token]);
  }

  function handleReadPhrase(sentence) {
    if (!sentence) {
      return;
    }

    setSelectedPhrase(sentence);
    speakText(sentence);
  }

  function clearPhrase() {
    setPhraseTokens([]);
    setSelectedPhrase('Phrase effacee.');
  }

  function handlePictogramSelect(item) {
    setSelectedPhrase(item.phrase);
    speakText(item.phrase);
    addToken({
      label: item.builderLabel || item.label,
      value: item.builderValue || item.phrase
    });

    if (item.alert) {
      setAlertState({
        title: 'Urgence',
        message: item.phrase
      });
    }
  }

  function handleSavePictogram(form) {
    const nextId = buildUniqueId(pictograms, form);
    const normalized = {
      id: nextId,
      label: form.label.trim(),
      phrase: form.phrase.trim(),
      builderLabel: (form.builderLabel || form.label).trim(),
      builderValue: (form.builderValue || form.phrase).trim(),
      category: form.category,
      image: form.image.trim(),
      color: form.color
    };

    setPictograms(current => {
      const withoutCurrent = current.filter(item => item.id !== form.originalId);
      return [...withoutCurrent, normalized].sort((left, right) =>
        left.category === right.category
          ? left.label.localeCompare(right.label, 'fr')
          : left.category.localeCompare(right.category, 'fr')
      );
    });

    setEditingItem(null);
    setSelectedPhrase(`Pictogramme enregistre : ${normalized.label}`);
  }

  function handleDeletePictogram(id) {
    const target = pictograms.find(item => item.id === id);
    if (!target) {
      return;
    }

    if (!window.confirm(`Supprimer le pictogramme "${target.label}" ?`)) {
      return;
    }

    setPictograms(current => current.filter(item => item.id !== id));
    setSelectedPhrase(`Pictogramme supprime : ${target.label}`);
    if (editingItem && editingItem.id === id) {
      setEditingItem(null);
    }
  }

  function handleReset() {
    if (!window.confirm('Revenir a la base de demonstration AlterCom ?')) {
      return;
    }

    window.localStorage.removeItem(STORAGE_KEY);
    setPictograms(initialPictograms);
    setEditingItem(null);
    setSelectedPhrase('Donnees de demonstration rechargees.');
  }

  return (
    <div className="altercom-app">
      <AppHeader onBackHome={goHome} onOpenAdmin={openAdmin} />

      <main className="app-shell">
        <div className="hero-panel">
          <div>
            <p className="section-label">Application M1</p>
            <h2>Une application simple, demonstrable et utile pour l'ESAT Alter Ego</h2>
            <p>
              Gros boutons, langage clair, pictogrammes visibles et lecture vocale
              immediate.
            </p>
          </div>
          <div className="hero-panel__stats">
            <div>
              <strong>4</strong>
              <span>modules</span>
            </div>
            <div>
              <strong>{pictograms.length}</strong>
              <span>pictogrammes</span>
            </div>
            <div>
              <strong>1</strong>
              <span>espace encadrant</span>
            </div>
          </div>
        </div>

        <EmergencyAlert alertState={alertState} onClose={() => setAlertState(null)} />

        <PhraseBuilder
          onAdd={addToken}
          onClear={clearPhrase}
          onRead={handleReadPhrase}
          tokens={phraseTokens}
        />

        <SelectedPhrase phrase={selectedPhrase} />

        {activeView.screen === 'home' && (
          <HomeView
            categoriesList={categories}
            onOpenAdmin={openAdmin}
            onOpenCategory={openCategory}
          />
        )}

        {activeView.screen === 'category' && currentCategory && (
          <CategoryView
            category={currentCategory}
            onOpenAdmin={openAdmin}
            onSelect={handlePictogramSelect}
            pictograms={visiblePictograms}
          />
        )}

        {activeView.screen === 'admin' && (
          <AdminPanel
            editingItem={editingItem}
            onDelete={handleDeletePictogram}
            onEdit={setEditingItem}
            onReset={handleReset}
            onSave={handleSavePictogram}
            pictograms={pictograms}
          />
        )}
      </main>
    </div>
  );
}

export default AlterComApp;
