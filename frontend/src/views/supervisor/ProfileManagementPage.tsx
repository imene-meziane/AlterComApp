import React, { useEffect, useState } from 'react';
import { Check, UserCog2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { Routine, User, Workshop } from '../../types/models';

interface WorkerDraft {
  assignedWorkshop: string;
  displayMode: 'simplified' | 'complete';
  showSearch: boolean;
  simplificationLevel: 'high' | 'medium' | 'low';
  supportNeedsText: string;
  routineIds: string[];
}

export function ProfileManagementPage(): React.ReactElement {
  const { token } = useAuth();
  const [workers, setWorkers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [drafts, setDrafts] = useState<Record<string, WorkerDraft>>({});
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData(): Promise<void> {
      const [fetchedWorkers, fetchedWorkshops, fetchedRoutines] = await Promise.all([
        api.get<User[]>('/users?role=worker', token),
        api.get<Workshop[]>('/workshops', token),
        api.get<Routine[]>('/routines', token)
      ]);

      setWorkers(fetchedWorkers);
      setWorkshops(fetchedWorkshops);
      setRoutines(fetchedRoutines);
      setDrafts(
        fetchedWorkers.reduce<Record<string, WorkerDraft>>((accumulator, worker) => {
          accumulator[worker.id] = {
            assignedWorkshop: worker.assignedWorkshop?.id || '',
            displayMode: worker.preferences.displayMode,
            showSearch: worker.preferences.showSearch,
            simplificationLevel: worker.simplificationLevel,
            supportNeedsText: (worker.supportNeeds || []).join(', '),
            routineIds: (worker.routineAssignments || []).map(assignment => assignment.routine.id)
          };
          return accumulator;
        }, {})
      );
    }

    loadData().finally(() => setLoading(false));
  }, [token]);

  function updateDraft(
    workerId: string,
    field: keyof WorkerDraft,
    value: string | boolean | string[]
  ): void {
    setDrafts(current => ({
      ...current,
      [workerId]: {
        ...current[workerId],
        [field]: value
      }
    }));
  }

  function toggleRoutine(workerId: string, routineId: string): void {
    setDrafts(current => {
      const routineIds = current[workerId].routineIds.includes(routineId)
        ? current[workerId].routineIds.filter(id => id !== routineId)
        : [...current[workerId].routineIds, routineId];

      return {
        ...current,
        [workerId]: {
          ...current[workerId],
          routineIds
        }
      };
    });
  }

  async function saveWorker(worker: User): Promise<void> {
    const draft = drafts[worker.id];

    await api.put(
      `/users/${worker.id}`,
      {
        assignedWorkshop: draft.assignedWorkshop || null,
        simplificationLevel: draft.simplificationLevel,
        supportNeeds: draft.supportNeedsText
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        routineIds: draft.routineIds,
        preferences: {
          ...worker.preferences,
          displayMode: draft.displayMode,
          showSearch: draft.showSearch
        }
      },
      token
    );

    setFeedback(`Profil mis a jour pour ${worker.firstName}.`);
    const [fetchedWorkers, fetchedWorkshops, fetchedRoutines] = await Promise.all([
      api.get<User[]>('/users?role=worker', token),
      api.get<Workshop[]>('/workshops', token),
      api.get<Routine[]>('/routines', token)
    ]);

    setWorkers(fetchedWorkers);
    setWorkshops(fetchedWorkshops);
    setRoutines(fetchedRoutines);
    setDrafts(
      fetchedWorkers.reduce<Record<string, WorkerDraft>>((accumulator, currentWorker) => {
        accumulator[currentWorker.id] = {
          assignedWorkshop: currentWorker.assignedWorkshop?.id || '',
          displayMode: currentWorker.preferences.displayMode,
          showSearch: currentWorker.preferences.showSearch,
          simplificationLevel: currentWorker.simplificationLevel,
          supportNeedsText: (currentWorker.supportNeeds || []).join(', '),
          routineIds: (currentWorker.routineAssignments || []).map(
            assignment => assignment.routine.id
          )
        };
        return accumulator;
      }, {})
    );
  }

  if (loading) {
    return <ScreenLoader message="Chargement des profils travailleurs..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Chaque travailleur garde son atelier, son niveau de simplification, ses routines et ses preferences."
        eyebrow="Gestion profils"
        title="Profils travailleurs"
      />

      {feedback ? <Card className="text-sm font-bold text-muted">{feedback}</Card> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {workers.map(worker => {
          const draft = drafts[worker.id];

          if (!draft) {
            return null;
          }

          return (
            <Card className="space-y-5" key={worker.id} tone="soft">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-sky text-brand">
                  <UserCog2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xl font-black text-ink">
                    {worker.firstName} {worker.lastName}
                  </p>
                  <p className="text-sm text-muted">{worker.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>{worker.favoriteCount || 0} favoris</Badge>
                <Badge>{worker.historyCount || 0} historiques</Badge>
                <Badge>{worker.routineCount || 0} routines</Badge>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <select
                  className="h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
                  onChange={event => updateDraft(worker.id, 'assignedWorkshop', event.target.value)}
                  value={draft.assignedWorkshop}
                >
                  <option value="">Aucun atelier</option>
                  {workshops.map(workshop => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.name}
                    </option>
                  ))}
                </select>

                <select
                  className="h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
                  onChange={event =>
                    updateDraft(
                      worker.id,
                      'displayMode',
                      event.target.value as WorkerDraft['displayMode']
                    )
                  }
                  value={draft.displayMode}
                >
                  <option value="simplified">Mode simplifie</option>
                  <option value="complete">Mode complet</option>
                </select>
              </div>

              <div className="grid gap-3 md:grid-cols-[0.42fr_0.58fr]">
                <select
                  className="h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
                  onChange={event =>
                    updateDraft(
                      worker.id,
                      'simplificationLevel',
                      event.target.value as WorkerDraft['simplificationLevel']
                    )
                  }
                  value={draft.simplificationLevel}
                >
                  <option value="high">Simplification forte</option>
                  <option value="medium">Simplification moyenne</option>
                  <option value="low">Autonomie elevee</option>
                </select>

                <input
                  className="h-14 w-full rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
                  onChange={event => updateDraft(worker.id, 'supportNeedsText', event.target.value)}
                  placeholder="Besoins specifiques"
                  value={draft.supportNeedsText}
                />
              </div>

              <label className="flex items-center gap-3 rounded-[24px] bg-slate-50 px-4 py-4 text-sm font-extrabold text-ink">
                <input
                  checked={draft.showSearch}
                  onChange={event => updateDraft(worker.id, 'showSearch', event.target.checked)}
                  type="checkbox"
                />
                Afficher la recherche simple
              </label>

              <div className="space-y-3">
                <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
                  Routines assignees
                </p>
                <div className="grid gap-2">
                  {routines.map(routine => (
                    <label
                      className="flex items-center justify-between rounded-[1.3rem] bg-white px-4 py-3 shadow-soft ring-1 ring-slate-100"
                      key={`${worker.id}-${routine.id}`}
                    >
                      <div>
                        <p className="text-sm font-black text-ink">{routine.title}</p>
                        <p className="text-xs text-muted">
                          {routine.workshop?.name || 'Routine'}
                        </p>
                      </div>
                      <input
                        checked={draft.routineIds.includes(routine.id)}
                        onChange={() => toggleRoutine(worker.id, routine.id)}
                        type="checkbox"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button iconLeft={<Check className="h-4 w-4" />} onClick={() => saveWorker(worker)}>
                Enregistrer ce profil
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
