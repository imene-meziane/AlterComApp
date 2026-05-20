import React, { useEffect, useState } from 'react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { HistoryEntry, User, Workshop } from '../../types/models';

function getChannelLabel(channel: string): string {
  if (channel === 'emergency') {
    return 'Urgence';
  }

  if (channel === 'routine') {
    return 'Routine';
  }

  return 'Message';
}

function getStatusLabel(status?: string): string {
  if (status === 'completed') {
    return 'terminé';
  }

  return 'envoyé';
}

interface HistoryPageProps {
  defaultChannel?: string;
  title?: string;
  eyebrow?: string;
  description?: string;
  hideChannelFilter?: boolean;
}

export function HistoryPage({
  defaultChannel = '',
  title = 'Activité récente',
  eyebrow = 'Historique',
  description = 'Messages, urgences et routines terminées restent visibles dans une timeline claire.',
  hideChannelFilter = false
}: HistoryPageProps = {}): React.ReactElement {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [channel, setChannel] = useState(defaultChannel);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setChannel(defaultChannel);
  }, [defaultChannel]);

  useEffect(() => {
    Promise.all([
      api.get<User[]>('/users?role=worker', token),
      api.get<Workshop[]>('/workshops', token)
    ]).then(([fetchedWorkers, fetchedWorkshops]) => {
      setWorkers(fetchedWorkers);
      setWorkshops(fetchedWorkshops);
    });
  }, [token]);

  useEffect(() => {
    setLoading(true);

    const params = new URLSearchParams();
    if (workerId) {
      params.set('workerId', workerId);
    }
    if (workshopId) {
      params.set('workshopId', workshopId);
    }
    if (channel) {
      params.set('channel', channel);
    }

    api
      .get<HistoryEntry[]>(`/history?${params.toString()}`, token)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [channel, token, workerId, workshopId]);

  if (loading) {
    return <ScreenLoader message="Mise en forme de l’historique..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader description={description} eyebrow={eyebrow} title={title} />

      <Card
        className={`grid gap-4 ${hideChannelFilter ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}
        tone="soft"
      >
        <select
          className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
          onChange={event => setWorkerId(event.target.value)}
          value={workerId}
        >
          <option value="">Tous les travailleurs</option>
          {workers.map(worker => (
            <option key={worker.id} value={worker.id}>
              {worker.firstName} {worker.lastName}
            </option>
          ))}
        </select>

        <select
          className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
          onChange={event => setWorkshopId(event.target.value)}
          value={workshopId}
        >
          <option value="">Tous les ateliers</option>
          {workshops.map(workshop => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.name}
            </option>
          ))}
        </select>

        {!hideChannelFilter ? (
          <select
            className="h-14 rounded-[24px] border border-slate-200 bg-white px-5 shadow-soft"
            onChange={event => setChannel(event.target.value)}
            value={channel}
          >
            <option value="">Tous les types</option>
            <option value="message">Message</option>
            <option value="emergency">Urgence</option>
            <option value="routine">Routine</option>
          </select>
        ) : null}
      </Card>

      <div className="grid gap-4">
        {history.map(entry => (
          <Card className="space-y-4" key={entry.id} tone="soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xl font-black text-ink">
                  {entry.workerName || `${entry.worker.firstName} ${entry.worker.lastName}`}
                </p>
                <p className="text-sm text-muted">
                  {entry.workshop?.name || 'Sans atelier'} ·{' '}
                  {new Date(entry.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>{getChannelLabel(entry.channel)}</Badge>
                <Badge>Statut : {getStatusLabel(entry.status)}</Badge>
              </div>
            </div>

            <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Message envoyé
              </p>
              <p className="mt-2 text-lg font-black text-ink">
                {entry.message?.text || entry.text}
              </p>
            </div>

            {(entry.message?.pictograms || []).length ? (
              <div className="flex flex-wrap gap-2">
                {(entry.message?.pictograms || []).map((pictogram, index) => (
                  <span
                    className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-ink ring-1 ring-slate-200"
                    key={`${entry.id}-${pictogram.id || pictogram.label}-${index}`}
                  >
                    <img
                      alt=""
                      className="h-7 w-7 rounded-full bg-slate-50 p-1"
                      src={pictogram.imageUrl}
                    />
                    {pictogram.label}
                  </span>
                ))}
              </div>
            ) : null}

            {entry.channel === 'routine' && entry.routine ? (
              <p className="text-sm font-bold text-muted">Routine : {entry.routine.title}</p>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
