import React, { useEffect, useState } from 'react';
import { ImagePlus, LibraryBig, Sparkles } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { Category, Pictogram, Workshop } from '../../types/models';

interface PictogramFormState {
  label: string;
  phrase: string;
  spokenText: string;
  builderText: string;
  category: string;
  workshops: string[];
  imageUrl: string;
  color: string;
  keywords: string;
  showInSimplified: boolean;
  isActive: boolean;
}

const initialForm: PictogramFormState = {
  label: '',
  phrase: '',
  spokenText: '',
  builderText: '',
  category: '',
  workshops: [],
  imageUrl: '/assets/pictograms/help.svg',
  color: '#4F8CFF',
  keywords: '',
  showInSimplified: true,
  isActive: true
};

async function fetchManagementData(token: string) {
  const [pictograms, categories, workshops] = await Promise.all([
    api.get<Pictogram[]>('/pictograms?active=true', token),
    api.get<Category[]>('/categories', token),
    api.get<Workshop[]>('/workshops', token)
  ]);

  return { pictograms, categories, workshops };
}

export function PictogramManagementPage(): React.ReactElement {
  const { token } = useAuth();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [form, setForm] = useState<PictogramFormState>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagementData(token)
      .then(data => {
        setPictograms(data.pictograms);
        setCategories(data.categories);
        setWorkshops(data.workshops);
        setForm(current =>
          !current.category && data.categories[0]
            ? { ...current, category: data.categories[0].id }
            : current
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  function updateForm(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void {
    const { name, value, type } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }));
  }

  function toggleWorkshop(workshopId: string): void {
    setForm(current => ({
      ...current,
      workshops: current.workshops.includes(workshopId)
        ? current.workshops.filter(item => item !== workshopId)
        : [...current.workshops, workshopId]
    }));
  }

  function editPictogram(pictogram: Pictogram): void {
    setEditingId(pictogram.id);
    setForm({
      label: pictogram.label,
      phrase: pictogram.phrase,
      spokenText: pictogram.spokenText,
      builderText: pictogram.builderText,
      category: pictogram.category.id,
      workshops: pictogram.workshops.map(workshop => workshop.id),
      imageUrl: pictogram.imageUrl,
      color: pictogram.color,
      keywords: pictogram.keywords.join(', '),
      showInSimplified: pictogram.showInSimplified,
      isActive: pictogram.isActive
    });
  }

  function resetForm(): void {
    setEditingId(null);
    setForm(current => ({
      ...initialForm,
      category: categories[0]?.id || ''
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFeedback('');

    const payload = {
      key: form.label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      label: form.label,
      phrase: form.phrase,
      spokenText: form.spokenText,
      builderText: form.builderText,
      category: form.category,
      workshops: form.workshops,
      imageUrl: form.imageUrl,
      color: form.color,
      keywords: form.keywords
        .split(',')
        .map(item => item.trim())
        .filter(Boolean),
      showInSimplified: form.showInSimplified,
      isActive: form.isActive
    };

    if (editingId) {
      await api.put(`/pictograms/${editingId}`, payload, token);
      setFeedback('Pictogramme mis a jour.');
    } else {
      await api.post('/pictograms', payload, token);
      setFeedback('Nouveau pictogramme ajouté.');
    }

    const data = await fetchManagementData(token);
    setPictograms(data.pictograms);
    setCategories(data.categories);
    setWorkshops(data.workshops);
    resetForm();
  }

  if (loading) {
    return <ScreenLoader message="Organisation de la bibliothèque pictogrammes..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Une gestion plus visuelle pour ajouter, catégoriser et affecter les pictogrammes sans interface froide."
        eyebrow="Gestion pictogrammes"
        title="Bibliothèque visuelle"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: 'Pictogrammes actifs',
            value: pictograms.length,
            icon: LibraryBig,
            bg: 'bg-blue-50 text-brand'
          },
          {
            title: 'Catégories',
            value: categories.length,
            icon: Sparkles,
            bg: 'bg-violet-50 text-violet-500'
          },
          {
            title: 'Ateliers liés',
            value: workshops.length,
            icon: ImagePlus,
            bg: 'bg-emerald-50 text-emerald-600'
          }
        ].map(item => {
          const Icon = item.icon;

          return (
            <Card className="space-y-4" key={item.title} tone="soft">
              <div className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${item.bg}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted">{item.title}</p>
                <p className="mt-1 text-4xl font-black text-ink">{item.value}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="space-y-5" tone="soft">
          <div>
            <Badge>{editingId ? 'Modifier' : 'Ajouter'}</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Formulaire pictogramme</p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="label" onChange={updateForm} placeholder="Mot visible" required type="text" value={form.label} />
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="phrase" onChange={updateForm} placeholder="Phrase FALC courte" required type="text" value={form.phrase} />
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="spokenText" onChange={updateForm} placeholder="Texte lu à voix haute" type="text" value={form.spokenText} />
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="builderText" onChange={updateForm} placeholder="Texte pour Mon message" type="text" value={form.builderText} />

            <div className="grid gap-4 md:grid-cols-2">
              <select className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="category" onChange={updateForm} value={form.category}>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="color" onChange={updateForm} placeholder="#4F8CFF" type="text" value={form.color} />
            </div>

            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="imageUrl" onChange={updateForm} placeholder="/assets/pictograms/help.svg" type="text" value={form.imageUrl} />
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="keywords" onChange={updateForm} placeholder="pause, besoin, aide" type="text" value={form.keywords} />

            <div className="space-y-3 rounded-[26px] bg-slate-50 p-4">
              <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted">
                Ateliers associés
              </p>
              <div className="flex flex-wrap gap-2">
                {workshops.map(workshop => (
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                      form.workshops.includes(workshop.id)
                        ? 'bg-ink text-white'
                        : 'bg-white text-ink ring-1 ring-slate-200'
                    }`}
                    key={workshop.id}
                    onClick={() => toggleWorkshop(workshop.id)}
                    type="button"
                  >
                    {workshop.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-[24px] bg-slate-50 px-4 py-4 text-sm font-extrabold text-ink">
                <input checked={form.showInSimplified} name="showInSimplified" onChange={updateForm} type="checkbox" />
                Visible en mode simplifié
              </label>
              <label className="flex items-center gap-3 rounded-[24px] bg-slate-50 px-4 py-4 text-sm font-extrabold text-ink">
                <input checked={form.isActive} name="isActive" onChange={updateForm} type="checkbox" />
                Pictogramme actif
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">{editingId ? 'Mettre à jour' : 'Ajouter'}</Button>
              <Button onClick={resetForm} variant="ghost">
                Réinitialiser
              </Button>
            </div>

            {feedback ? <Card className="text-sm font-bold text-muted">{feedback}</Card> : null}
          </form>
        </Card>

        <Card className="space-y-5" tone="soft">
          <div>
            <Badge>Bibliotheque actuelle</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Pictogrammes existants</p>
          </div>

          <div className="grid gap-3">
            {pictograms.map(pictogram => (
              <div
                className="flex flex-col gap-4 rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
                key={pictogram.id}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-slate-50">
                    <img alt="" className="h-10 w-10 object-contain" src={pictogram.imageUrl} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-ink">{pictogram.label}</p>
                    <p className="text-sm text-muted">{pictogram.category.name}</p>
                    <p className="mt-1 text-sm leading-7 text-muted">
                      {pictogram.workshops.map(workshop => workshop.name).join(', ') || 'Général'}
                    </p>
                  </div>
                </div>
                <Button onClick={() => editPictogram(pictogram)} variant="secondary">
                  Modifier
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
