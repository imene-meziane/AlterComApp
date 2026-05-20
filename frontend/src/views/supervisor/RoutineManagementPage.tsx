import React, { useEffect, useState } from 'react';
import { Check, NotebookText, Trash2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { Category, Routine, User, Workshop } from '../../types/models';

interface RoutineDraft {
  key: string;
  title: string;
  description: string;
  workshop: string;
  category: string;
  assignedWorkerId: string;
  estimatedMinutes: string;
  difficulty: Routine['difficulty'];
  supportText: string;
  stepsText: string;
}

const initialDraft: RoutineDraft = {
  key: '',
  title: '',
  description: '',
  workshop: '',
  category: '',
  assignedWorkerId: '',
  estimatedMinutes: '10',
  difficulty: 'facile',
  supportText: '',
  stepsText: "Prendre le matériel | Je prends le bon matériel.\nRéaliser | Je fais l'action calmement.\nVérifier | Je vérifie avant de terminer."
};

export function RoutineManagementPage(): React.ReactElement {
  const { token } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<RoutineDraft>(initialDraft);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [pendingDeleteId, setPendingDeleteId] = useState('');

  useEffect(() => {
    async function refreshData(): Promise<void> {
      const [fetchedRoutines, fetchedWorkers, fetchedWorkshops, fetchedCategories] =
        await Promise.all([
          api.get<Routine[]>('/routines', token),
          api.get<User[]>('/users?role=worker', token),
          api.get<Workshop[]>('/workshops', token),
          api.get<Category[]>('/categories', token)
        ]);

      setRoutines(fetchedRoutines);
      setWorkers(fetchedWorkers);
      setWorkshops(fetchedWorkshops);
      setCategories(fetchedCategories);
      setDraft(current => ({
        ...current,
        category:
          current.category ||
          fetchedCategories.find(category => category.key === 'activites-atelier')?.id ||
          ''
      }));
    }

    refreshData().finally(() => setLoading(false));
  }, [token]);

  function updateDraft(field: keyof RoutineDraft, value: string): void {
    setDraft(current => ({
      ...current,
      [field]: value
    }));
  }

  async function createRoutine(): Promise<void> {
    const steps = draft.stepsText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [title, instruction, pictogram] = line.split('|').map(part => part.trim());
        return {
          title: title || `Etape ${index + 1}`,
          instruction: instruction || title || `Etape ${index + 1}`,
          pictogram: pictogram || undefined
        };
      });

    await api.post(
      '/routines',
      {
        key: draft.key,
        title: draft.title,
        description: draft.description,
        workshop: draft.workshop || null,
        category: draft.category,
        assignedTo: draft.assignedWorkerId ? [draft.assignedWorkerId] : [],
        estimatedMinutes: Number(draft.estimatedMinutes || 10),
        difficulty: draft.difficulty,
        supportText: draft.supportText,
        steps
      },
      token
    );

    setFeedback(`Routine créée : ${draft.title}`);
    setDraft(initialDraft);
    const [fetchedRoutines, fetchedWorkers, fetchedWorkshops, fetchedCategories] =
      await Promise.all([
        api.get<Routine[]>('/routines', token),
        api.get<User[]>('/users?role=worker', token),
        api.get<Workshop[]>('/workshops', token),
        api.get<Category[]>('/categories', token)
      ]);

    setRoutines(fetchedRoutines);
    setWorkers(fetchedWorkers);
    setWorkshops(fetchedWorkshops);
    setCategories(fetchedCategories);
  }

  async function deleteRoutine(routineId: string): Promise<void> {
    setPendingDeleteId(routineId);
    try {
      await api.delete(`/routines/${routineId}`, token);
      setRoutines(current => current.filter(routine => routine.id !== routineId));
    } finally {
      setPendingDeleteId('');
    }
  }

  if (loading) {
    return <ScreenLoader message="Chargement des routines..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Créer des routines simples, les assigner à un travailleur et garder une progression claire."
        eyebrow="Routines"
        title="Gestion des routines"
      />

      {feedback ? <Card className="text-sm font-bold text-muted">{feedback}</Card> : null}

      <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="space-y-4" tone="soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-sky text-brand">
              <NotebookText className="h-5 w-5" />
            </div>
            <div>
              <Badge>Nouvelle routine</Badge>
              <p className="mt-2 text-xl font-black text-ink">Construire une routine</p>
            </div>
          </div>

          <input
            className="h-14 w-full rounded-[1.4rem] bg-white px-5 shadow-soft"
            onChange={event => updateDraft('title', event.target.value)}
            placeholder="Titre de la routine"
            value={draft.title}
          />
          <input
            className="h-14 w-full rounded-[1.4rem] bg-white px-5 shadow-soft"
            onChange={event => updateDraft('key', event.target.value)}
            placeholder="Clé technique"
            value={draft.key}
          />
          <textarea
            className="min-h-[7rem] w-full rounded-[1.4rem] bg-white px-5 py-4 shadow-soft"
            onChange={event => updateDraft('description', event.target.value)}
            placeholder="Description courte"
            value={draft.description}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('workshop', event.target.value)}
              value={draft.workshop}
            >
              <option value="">Choisir un atelier</option>
              {workshops.map(workshop => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.name}
                </option>
              ))}
            </select>

            <select
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('category', event.target.value)}
              value={draft.category}
            >
              <option value="">Choisir une catégorie</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <select
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('assignedWorkerId', event.target.value)}
              value={draft.assignedWorkerId}
            >
              <option value="">Assigner plus tard</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>
                  {worker.firstName} {worker.lastName}
                </option>
              ))}
            </select>

            <select
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('difficulty', event.target.value as Routine['difficulty'])}
              value={draft.difficulty}
            >
              <option value="facile">Facile</option>
              <option value="moyen">Moyen</option>
              <option value="avance">Avancé</option>
            </select>
          </div>

          <div className="grid gap-3 md:grid-cols-[0.45fr_0.55fr]">
            <input
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('estimatedMinutes', event.target.value)}
              placeholder="Temps"
              value={draft.estimatedMinutes}
            />
            <input
              className="h-14 rounded-[1.4rem] bg-white px-5 shadow-soft"
              onChange={event => updateDraft('supportText', event.target.value)}
              placeholder="Consigne FALC de soutien"
              value={draft.supportText}
            />
          </div>

          <textarea
            className="min-h-[12rem] w-full rounded-[1.4rem] bg-white px-5 py-4 shadow-soft"
            onChange={event => updateDraft('stepsText', event.target.value)}
            value={draft.stepsText}
          />

          <p className="text-sm leading-6 text-muted">
            Une ligne par étape : <strong>Titre | Instruction | pictogramKey</strong>
          </p>

          <Button iconLeft={<Check className="h-4 w-4" />} onClick={createRoutine}>
            Créer la routine
          </Button>
        </Card>

        <div className="grid gap-4">
          {routines.map(routine => (
            <Card className="space-y-4" key={routine.id} tone="soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{routine.workshop?.name || 'Sans atelier'}</Badge>
                    <Badge>{routine.difficulty}</Badge>
                    <Badge>{routine.assignedTo?.length || 0} travailleur(s)</Badge>
                  </div>
                  <p className="mt-3 text-2xl font-black text-ink">{routine.title}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{routine.description}</p>
                </div>

                <Button
                  className="h-11 px-4 text-sm"
                  iconLeft={<Trash2 className="h-4 w-4" />}
                  onClick={() => deleteRoutine(routine.id)}
                  variant="ghost"
                >
                  {pendingDeleteId === routine.id ? 'Suppression...' : 'Supprimer'}
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {routine.steps.map(step => (
                  <div
                    className="rounded-[1.3rem] bg-white px-4 py-4 shadow-soft ring-1 ring-slate-100"
                    key={`${routine.id}-${step.order}`}
                  >
                    <p className="text-sm font-black text-ink">
                      {step.order}. {step.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">{step.instruction}</p>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
