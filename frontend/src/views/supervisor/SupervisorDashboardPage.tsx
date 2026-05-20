import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Clock3,
  History,
  ImagePlus,
  NotebookPen,
  UserPlus,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { AvatarBubble } from '../../components/ui/AvatarBubble';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenLoader } from '../../components/ScreenLoader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { speakText } from '../../services/speech';
import { Alert, Message, Routine, User, UserRoutineAssignment } from '../../types/models';

interface RoutineBoardItem {
  id: string;
  worker: User;
  routine: Routine;
  assignment: UserRoutineAssignment;
  progressPercent: number;
  currentStepLabel: string;
  currentStepPosition: string;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatTodayTime(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  if (isToday) {
    return `Aujourd’hui à ${formatTime(value)}`;
  }

  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
}

function getPriorityLabel(priority: Alert['priority']): string {
  if (priority === 'urgent') {
    return 'Urgente';
  }

  if (priority === 'important') {
    return 'Importante';
  }

  return 'Normale';
}

function getPriorityClasses(priority: Alert['priority']): string {
  if (priority === 'urgent') {
    return 'bg-rose-50 text-rose-600 ring-rose-100';
  }

  if (priority === 'important') {
    return 'bg-amber-50 text-orange-600 ring-orange-100';
  }

  return 'bg-slate-100 text-slate-700 ring-slate-200';
}

function getWorkerStatus(worker: User, latestMessage?: Message, pendingAlert?: Alert): string {
  if (pendingAlert) {
    return 'Alerte en attente';
  }

  if ((worker.routineAssignments || []).some(assignment => assignment.status === 'in_progress')) {
    return 'Routine en cours';
  }

  if (latestMessage) {
    return 'Message envoyé';
  }

  return 'À suivre';
}

export function SupervisorDashboardPage(): React.ReactElement {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingAlertId, setPendingAlertId] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Alert[]>('/alerts', token),
      api.get<Message[]>('/messages?limit=18', token),
      api.get<User[]>('/users?role=worker', token),
      api.get<Routine[]>('/routines', token)
    ])
      .then(([fetchedAlerts, fetchedMessages, fetchedWorkers, fetchedRoutines]) => {
        setAlerts(fetchedAlerts);
        setMessages(fetchedMessages);
        setWorkers(fetchedWorkers);
        setRoutines(fetchedRoutines);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const pendingAlerts = useMemo(() => {
    return alerts
      .filter(alert => alert.status === 'pending')
      .sort((left, right) => {
        const priorityWeight = { urgent: 3, important: 2, normal: 1 };

        const diff =
          priorityWeight[right.priority] - priorityWeight[left.priority];

        if (diff !== 0) {
          return diff;
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      });
  }, [alerts]);

  const recentMessages = useMemo(() => {
    return messages
      .filter(message => message.channel === 'message' || message.channel === 'emergency')
      .slice(0, 6);
  }, [messages]);

  const latestMessageByWorker = useMemo(() => {
    const map = new Map<string, Message>();

    for (const message of messages) {
      if (!message.workerId || map.has(message.workerId)) {
        continue;
      }

      map.set(message.workerId, message);
    }

    return map;
  }, [messages]);

  const pendingAlertByWorker = useMemo(() => {
    const map = new Map<string, Alert>();

    for (const alert of pendingAlerts) {
      const workerId = alert.workerId?.id;

      if (!workerId || map.has(workerId)) {
        continue;
      }

      map.set(workerId, alert);
    }

    return map;
  }, [pendingAlerts]);

  const routineBoard = useMemo(() => {
    const routinesById = new Map(routines.map(routine => [routine.id, routine]));
    const items: RoutineBoardItem[] = [];

    for (const worker of workers) {
      for (const assignment of worker.routineAssignments || []) {
        if (assignment.status === 'completed') {
          continue;
        }

        const routine = routinesById.get(assignment.routine.id);

        if (!routine) {
          continue;
        }

        const totalSteps = Math.max(routine.steps.length, 1);
        const progressPercent =
          assignment.progressPercent ??
          Math.round((assignment.completedStepIndexes.length / totalSteps) * 100);
        const currentStepIndex = Math.min(assignment.currentStepIndex || 0, totalSteps - 1);
        const currentStep = routine.steps[currentStepIndex] || routine.steps[0];

        items.push({
          id: `${worker.id}-${routine.id}`,
          worker,
          routine,
          assignment,
          progressPercent,
          currentStepLabel: currentStep?.title || 'Étape en cours',
          currentStepPosition: `Étape ${Math.min(currentStepIndex + 1, totalSteps)}/${totalSteps}`
        });
      }
    }

    return items
      .sort((left, right) => {
        if (left.assignment.status !== right.assignment.status) {
          return left.assignment.status === 'in_progress' ? -1 : 1;
        }

        return right.progressPercent - left.progressPercent;
      })
      .slice(0, 6);
  }, [routines, workers]);

  const workerCards = useMemo(() => {
    return [...workers]
      .sort((left, right) => {
        const leftAlert = pendingAlertByWorker.has(left.id) ? 1 : 0;
        const rightAlert = pendingAlertByWorker.has(right.id) ? 1 : 0;

        if (leftAlert !== rightAlert) {
          return rightAlert - leftAlert;
        }

        return `${left.firstName} ${left.lastName}`.localeCompare(
          `${right.firstName} ${right.lastName}`,
          'fr'
        );
      })
      .slice(0, 8);
  }, [pendingAlertByWorker, workers]);

  async function markAlertAsResolved(alertId: string): Promise<void> {
    setPendingAlertId(alertId);

    try {
      const updatedAlert = await api.put<Alert>(
        `/alerts/${alertId}/status`,
        {
          status: 'resolved',
          responseNote: "Aide prise en compte par l'encadrant."
        },
        token
      );

      setAlerts(current =>
        current.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
      );
    } finally {
      setPendingAlertId('');
    }
  }

  if (loading || !user) {
    return <ScreenLoader message="Préparation de l’accueil encadrant..." />;
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-black text-ink">{`Bonjour ${user.firstName}`}</h1>
          <p className="mt-1 text-sm font-bold text-muted">Aujourd’hui</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/supervisor/pictograms"
          >
            <ImagePlus className="h-4 w-4" />
            Ajouter un pictogramme
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/supervisor/routines"
          >
            <NotebookPen className="h-4 w-4" />
            Créer une routine
          </Link>
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#4F8CFF,#6AA5FF)] px-5 text-base font-bold text-white shadow-float transition hover:shadow-panel"
            to="/supervisor/profiles"
          >
            <UserPlus className="h-4 w-4" />
            Ajouter un travailleur
          </Link>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
              Alertes à traiter
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">
              {pendingAlerts.length} alerte{pendingAlerts.length > 1 ? 's' : ''} en attente
            </h2>
          </div>

          <Link
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/supervisor/alerts"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <Card className="space-y-4" tone="soft">
          {pendingAlerts.length ? (
            pendingAlerts.slice(0, 4).map(alert => (
              <div
                className="rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200"
                key={alert.id}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-ink">
                        {alert.workerId.firstName} {alert.workerId.lastName}
                      </p>
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 ${getPriorityClasses(alert.priority)}`}
                      >
                        {getPriorityLabel(alert.priority)}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-bold text-ink">{alert.message}</p>
                    <p className="mt-2 text-sm font-bold text-muted">
                      {formatTime(alert.createdAt)}
                    </p>
                  </div>

                  <Button
                    className="h-11 px-4 text-sm"
                    disabled={pendingAlertId === alert.id}
                    iconLeft={<AlertTriangle className="h-4 w-4" />}
                    onClick={() => markAlertAsResolved(alert.id)}
                  >
                    {pendingAlertId === alert.id ? 'Traitement...' : 'Marquer comme traité'}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[26px] bg-white px-5 py-6 text-sm font-bold text-muted shadow-soft ring-1 ring-slate-200">
              Aucune alerte pour le moment.
            </div>
          )}
        </Card>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
                Messages récents
              </p>
              <h2 className="mt-2 text-2xl font-black text-ink">Derniers messages envoyés</h2>
            </div>

            <Link
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
              to="/supervisor/messages"
            >
              Voir tout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <Card className="space-y-4" tone="soft">
            {recentMessages.length ? (
              recentMessages.map(message => {
                const workerName =
                  message.workerName ||
                  (message.worker
                    ? `${message.worker.firstName} ${message.worker.lastName}`
                    : 'Travailleur');
                const initials = message.worker
                  ? getInitials(message.worker.firstName, message.worker.lastName)
                  : workerName
                      .split(' ')
                      .slice(0, 2)
                      .map(part => part[0] || '')
                      .join('')
                      .toUpperCase();

                return (
                  <div
                    className="rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200"
                    key={message.id}
                  >
                    <div className="flex items-start gap-4">
                      <AvatarBubble className="h-12 w-12 rounded-[18px] text-base" initials={initials} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-lg font-black text-ink">{workerName}</p>
                          <p className="text-sm font-bold text-muted">
                            {formatTodayTime(message.createdAt)}
                          </p>
                        </div>

                        <p className="mt-2 text-base font-bold text-ink">{message.text}</p>

                        {(message.pictograms || []).length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(message.pictograms || []).slice(0, 4).map((pictogram, index) => (
                              <span
                                className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-bold text-ink ring-1 ring-slate-200"
                                key={`${message.id}-${pictogram.id || pictogram.label}-${index}`}
                              >
                                <img
                                  alt=""
                                  className="h-6 w-6 rounded-full bg-white p-1"
                                  src={pictogram.imageUrl}
                                />
                                {pictogram.label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <Button
                        className="h-11 shrink-0 px-4 text-sm"
                        iconLeft={<Volume2 className="h-4 w-4" />}
                        onClick={() =>
                          speakText(message.text, {
                            rate: message.speechRate,
                            volume: message.speechVolume
                          })
                        }
                        variant="secondary"
                      >
                        Rejouer
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[26px] bg-white px-5 py-6 text-sm font-bold text-muted shadow-soft ring-1 ring-slate-200">
                Aucun message récent pour le moment.
              </div>
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
              Routines du jour
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">Routines en cours</h2>
          </div>

          <Card className="space-y-4" tone="soft">
            {routineBoard.length ? (
              routineBoard.map(item => (
                <div
                  className="rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-black text-ink">
                        {item.worker.firstName} {item.worker.lastName}
                      </p>
                      <p className="mt-1 text-sm font-bold text-muted">
                        {item.routine.workshop?.name || item.worker.assignedWorkshop?.name || 'Sans atelier'}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-ink ring-1 ring-slate-200">
                      {item.currentStepPosition}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-black text-ink">{item.routine.title}</p>
                  <p className="mt-1 text-sm font-bold text-muted">{item.currentStepLabel}</p>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold text-muted">
                      <span>Progression</span>
                      <span>{item.progressPercent}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7CC6A6)]"
                        style={{ width: `${Math.max(0, Math.min(item.progressPercent, 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[26px] bg-white px-5 py-6 text-sm font-bold text-muted shadow-soft ring-1 ring-slate-200">
                Aucune routine en cours pour le moment.
              </div>
            )}
          </Card>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <section className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
              Travailleurs
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">Vue synthétique</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workerCards.map(worker => {
              const latestMessage = latestMessageByWorker.get(worker.id);
              const pendingAlert = pendingAlertByWorker.get(worker.id);

              return (
                <Card className="space-y-4" key={worker.id} tone="soft">
                  <div className="flex items-start gap-4">
                    <AvatarBubble
                      className="h-12 w-12 rounded-[18px] text-base"
                      initials={getInitials(worker.firstName, worker.lastName)}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-lg font-black text-ink">
                          {worker.firstName} {worker.lastName}
                        </p>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-ink ring-1 ring-slate-200">
                          {worker.preferences.displayMode === 'simplified'
                            ? 'Simplifié'
                            : 'Complet'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-muted">
                        {worker.assignedWorkshop?.name || 'Sans atelier'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="font-black text-ink">Dernier message</p>
                      <p className="mt-1 font-bold text-muted">
                        {latestMessage?.text || 'Aucun message récent.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-muted">
                      <Clock3 className="h-4 w-4" />
                      <span className="font-bold">
                        {getWorkerStatus(worker, latestMessage, pendingAlert)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-muted">
              Actions rapides
            </p>
            <h2 className="mt-2 text-2xl font-black text-ink">Accès utiles</h2>
          </div>

          <Card className="grid gap-3" tone="soft">
            {[
              {
                to: '/supervisor/profiles',
                icon: UserPlus,
                title: 'Gérer les profils',
                note: 'Affecter les ateliers et ajuster les besoins.'
              },
              {
                to: '/supervisor/history',
                icon: History,
                title: 'Voir l’historique',
                note: 'Relire les envois et les routines terminées.'
              },
              {
                to: '/supervisor/messages',
                icon: Volume2,
                title: 'Ouvrir les messages',
                note: 'Suivre les derniers messages envoyés.'
              },
              {
                to: '/supervisor/workshops',
                icon: NotebookPen,
                title: 'Gérer les ateliers',
                note: 'Vérifier les ateliers et leurs contenus utiles.'
              }
            ].map(action => {
              const Icon = action.icon;

              return (
                <Link
                  className="flex items-center gap-4 rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
                  key={action.to}
                  to={action.to}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-sky text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-ink">{action.title}</span>
                    <span className="mt-1 block text-sm font-bold text-muted">{action.note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted" />
                </Link>
              );
            })}
          </Card>
        </section>
      </div>
    </div>
  );
}
