import React, { useEffect, useState } from 'react';
import { Blocks } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { Workshop } from '../../types/models';

interface WorkshopFormState {
  key: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

const initialWorkshopForm: WorkshopFormState = {
  key: '',
  name: '',
  description: '',
  color: '#7CC6A6',
  icon: '/assets/pictograms/materials.svg',
  isActive: true
};

async function fetchWorkshops(token: string): Promise<Workshop[]> {
  return api.get<Workshop[]>('/workshops', token);
}

export function WorkshopManagementPage(): React.ReactElement {
  const { token } = useAuth();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [form, setForm] = useState<WorkshopFormState>(initialWorkshopForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkshops(token)
      .then(setWorkshops)
      .finally(() => setLoading(false));
  }, [token]);

  function updateForm(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    const { name, value, type } = event.target;
    setForm(current => ({
      ...current,
      [name]: type === 'checkbox' ? (event.target as HTMLInputElement).checked : value
    }));
  }

  function editWorkshop(workshop: Workshop): void {
    setEditingId(workshop.id);
    setForm({
      key: workshop.key,
      name: workshop.name,
      description: workshop.description,
      color: workshop.color,
      icon: workshop.icon,
      isActive: workshop.isActive ?? true
    });
  }

  function resetForm(): void {
    setEditingId(null);
    setForm(initialWorkshopForm);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (editingId) {
      await api.put(`/workshops/${editingId}`, form, token);
      setFeedback('Atelier mis a jour.');
    } else {
      await api.post('/workshops', form, token);
      setFeedback('Atelier ajoute.');
    }

    setWorkshops(await fetchWorkshops(token));
    resetForm();
  }

  if (loading) {
    return <ScreenLoader message="Preparation des ateliers..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Chaque atelier garde sa couleur, son ambiance et son usage concret pour l accompagnement."
        eyebrow="Gestion ateliers"
        title="Tableaux par atelier"
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="space-y-5" tone="soft">
          <div>
            <Badge>{editingId ? 'Modifier' : 'Ajouter'}</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Fiche atelier</p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="key" onChange={updateForm} placeholder="conditionnement" required type="text" value={form.key} />
            <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="name" onChange={updateForm} placeholder="Atelier conditionnement" required type="text" value={form.name} />
            <textarea className="min-h-[120px] rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-soft" name="description" onChange={updateForm} placeholder="Description atelier" value={form.description} />

            <div className="grid gap-4 md:grid-cols-2">
              <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="color" onChange={updateForm} placeholder="#7CC6A6" type="text" value={form.color} />
              <input className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft" name="icon" onChange={updateForm} placeholder="/assets/pictograms/materials.svg" type="text" value={form.icon} />
            </div>

            <label className="flex items-center gap-3 rounded-[24px] bg-slate-50 px-4 py-4 text-sm font-extrabold text-ink">
              <input checked={form.isActive} name="isActive" onChange={updateForm} type="checkbox" />
              Atelier actif
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit">{editingId ? 'Mettre a jour' : 'Ajouter'}</Button>
              <Button onClick={resetForm} variant="ghost">
                Reinitialiser
              </Button>
            </div>

            {feedback ? <Card className="text-sm font-bold text-muted">{feedback}</Card> : null}
          </form>
        </Card>

        <div className="grid gap-4">
          {workshops.map(workshop => (
            <Card className="space-y-4 overflow-hidden" key={workshop.id} tone="soft">
              <div
                className="rounded-[28px] p-5 text-white"
                style={{
                  background: `linear-gradient(135deg, ${workshop.color}, rgba(47,58,75,0.86))`
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-white/20 text-white ring-white/10">Atelier</Badge>
                    <p className="mt-3 text-3xl font-black">{workshop.name}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85">
                      {workshop.description}
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-white/15">
                    <Blocks className="h-6 w-6" />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge>{workshop.workerCount || 0} travailleur(s)</Badge>
                  <Badge>{workshop.pictogramCount || 0} pictogramme(s)</Badge>
                </div>
                <Button onClick={() => editWorkshop(workshop)} variant="secondary">
                  Modifier
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
