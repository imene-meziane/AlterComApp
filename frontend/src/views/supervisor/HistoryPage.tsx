import React, { useEffect, useState } from 'react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { HistoryEntry, User, Workshop } from '../../types/models';

export function HistoryPage(): React.ReactElement {
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [workerId, setWorkerId] = useState('');
  const [workshopId, setWorkshopId] = useState('');
  const [channel, setChannel] = useState('');
  const [loading, setLoading] = useState(true);

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
    return <ScreenLoader message="Mise en forme de l historique..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Messages, urgences et routines terminees restent visibles dans une timeline claire."
        eyebrow="Historique"
        title="Activite recente"
      />

      <Card className="grid gap-4 lg:grid-cols-3" tone="soft">
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
      </Card>

      <div className="grid gap-4">
        {history.map(entry => (
          <Card className="space-y-4" key={entry.id} tone="soft">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xl font-black text-ink">
                  {entry.worker.firstName} {entry.worker.lastName}
                </p>
                <p className="text-sm text-muted">
                  {entry.workshop?.name || 'Sans atelier'} •{' '}
                  {new Date(entry.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge>
                  {entry.channel === 'emergency'
                    ? 'Urgence'
                    : entry.channel === 'routine'
                      ? 'Routine'
                      : 'Message'}
                </Badge>
              </div>
            </div>
            <p className="text-base leading-8 text-muted">{entry.text}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
