import React, { useEffect, useState } from 'react';
import { BellRing, MessageSquareHeart, NotebookText, Sparkles, UsersRound } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { DashboardSummary, User, Workshop } from '../../types/models';

export function SupervisorDashboardPage(): React.ReactElement {
  const { token } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<DashboardSummary>('/dashboard/summary', token),
      api.get<User[]>('/users?role=worker', token),
      api.get<Workshop[]>('/workshops', token)
    ])
      .then(([fetchedSummary, fetchedWorkers, fetchedWorkshops]) => {
        setSummary(fetchedSummary);
        setWorkers(fetchedWorkers);
        setWorkshops(fetchedWorkshops);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading || !summary) {
    return <ScreenLoader message="Construction du tableau de bord encadrant..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Une vue claire pour suivre les travailleurs, les routines, les alertes et l activite du jour."
        eyebrow="Tableau de bord"
        title="Pilotage de l accompagnement"
      />

      <Card className="overflow-hidden p-0" tone="soft">
        <div className="grid gap-5 bg-[linear-gradient(135deg,rgba(79,140,255,0.10),rgba(124,198,166,0.10),rgba(255,255,255,0.92))] p-6 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-4">
            <Badge>ESAT Alter Ego</Badge>
            <h2 className="text-4xl font-black leading-tight text-ink">
              Un espace de suivi simple, professionnel et humain.
            </h2>
            <p className="max-w-3xl text-base leading-8 text-muted">
              Les indicateurs privilegient le besoin d aide, la progression des routines
              et l activite recente plutot qu une logique de tableau de bord froid.
            </p>
          </div>

          <div className="grid gap-3">
            {[
              {
                title: 'Alertes en attente',
                value: summary.metrics.pendingAlerts,
                icon: BellRing,
                tone: 'bg-rose-50 text-rose-500'
              },
              {
                title: 'Routines en cours',
                value: summary.metrics.activeRoutines,
                icon: NotebookText,
                tone: 'bg-emerald-50 text-emerald-600'
              }
            ].map(item => {
              const Icon = item.icon;

              return (
                <Card className="flex items-center gap-4" key={item.title} tone="soft">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] ${item.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted">{item.title}</p>
                    <p className="text-2xl font-black text-ink">{item.value}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: 'Travailleurs',
            value: summary.metrics.workersCount,
            icon: UsersRound,
            bg: 'bg-blue-50 text-brand'
          },
          {
            title: 'Pictogrammes actifs',
            value: summary.metrics.pictogramsCount,
            icon: Sparkles,
            bg: 'bg-emerald-50 text-emerald-600'
          },
          {
            title: 'Messages traces',
            value: summary.metrics.messagesCount,
            icon: MessageSquareHeart,
            bg: 'bg-orange-50 text-orange-500'
          },
          {
            title: 'Routines terminees',
            value: summary.metrics.completedRoutineEntries,
            icon: NotebookText,
            bg: 'bg-violet-50 text-violet-500'
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

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5" tone="soft">
          <div>
            <Badge>Activite recente</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Messages, urgences et routines</p>
          </div>

          <div className="space-y-3">
            {summary.recentHistory.map(entry => (
              <div
                className="flex flex-col gap-3 rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
                key={entry.id}
              >
                <div>
                  <p className="text-lg font-black text-ink">
                    {entry.worker.firstName} {entry.worker.lastName}
                  </p>
                  <p className="text-sm leading-7 text-muted">{entry.text}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge>{entry.workshop?.name || 'Sans atelier'}</Badge>
                  <Badge>{entry.channel}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-5" tone="soft">
          <div>
            <Badge>Travailleurs</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Profils en un coup d oeil</p>
          </div>

          <div className="grid gap-3">
            {workers.map(worker => (
              <div
                className="rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200"
                key={worker.id}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-lg font-black text-ink">
                      {worker.firstName} {worker.lastName}
                    </p>
                    <p className="text-sm text-muted">
                      {worker.assignedWorkshop?.name || 'Sans atelier'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{worker.routineCount || 0} routines</Badge>
                    <Badge>{worker.favoriteCount || 0} favoris</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="space-y-5" tone="soft">
        <div>
          <Badge>Ateliers actifs</Badge>
          <p className="mt-3 text-2xl font-black text-ink">Vue rapide par atelier</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workshops.map(workshop => (
            <div
              className="rounded-[26px] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-200"
              key={workshop.id}
            >
              <p className="text-lg font-black text-ink">{workshop.name}</p>
              <p className="mt-1 text-sm text-muted">{workshop.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{workshop.workerCount || 0} travailleurs</Badge>
                <Badge>{workshop.pictogramCount || 0} pictogrammes</Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
