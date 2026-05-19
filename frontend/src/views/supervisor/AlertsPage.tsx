import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, Check, Eye } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { Alert } from '../../types/models';

export function AlertsPage(): React.ReactElement {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    api
      .get<Alert[]>('/alerts', token)
      .then(setAlerts)
      .finally(() => setLoading(false));
  }, [token]);

  const metrics = useMemo(() => {
    return {
      pending: alerts.filter(alert => alert.status === 'pending').length,
      urgent: alerts.filter(alert => alert.priority === 'urgent' && alert.status !== 'resolved').length,
      resolved: alerts.filter(alert => alert.status === 'resolved').length
    };
  }, [alerts]);

  async function updateAlertStatus(alertId: string, status: Alert['status']): Promise<void> {
    setPendingId(alertId);
    try {
      const updatedAlert = await api.put<Alert>(
        `/alerts/${alertId}/status`,
        {
          status,
          responseNote:
            status === 'resolved'
              ? 'Aide prise en compte par l encadrant.'
              : 'Alerte vue par l encadrant.'
        },
        token
      );

      setAlerts(current => current.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert)));
    } finally {
      setPendingId('');
    }
  }

  if (loading) {
    return <ScreenLoader message="Chargement des alertes..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Retrouver les demandes d aide, urgences et incomprehensions dans une vue claire et priorisee."
        eyebrow="Alertes"
        title="Suivi des demandes d aide"
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'En attente', value: metrics.pending, tone: 'bg-amber-50 text-orange-500' },
          { label: 'Urgentes', value: metrics.urgent, tone: 'bg-rose-50 text-rose-500' },
          { label: 'Resolues', value: metrics.resolved, tone: 'bg-emerald-50 text-emerald-600' }
        ].map(item => (
          <Card className="space-y-4" key={item.label} tone="soft">
            <div className={`flex h-14 w-14 items-center justify-center rounded-[1.4rem] ${item.tone}`}>
              <BellRing className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted">{item.label}</p>
              <p className="mt-1 text-4xl font-black text-ink">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4">
        {alerts.map(alert => (
          <Card className="space-y-4" key={alert.id} tone="soft">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge>{alert.workerId.firstName} {alert.workerId.lastName}</Badge>
                  <Badge>{alert.type}</Badge>
                  <Badge>{alert.priority}</Badge>
                </div>
                <p className="text-xl font-black text-ink">{alert.message}</p>
                <p className="text-sm text-muted">
                  {new Date(alert.createdAt).toLocaleString('fr-FR')}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge>{alert.status}</Badge>
              </div>
            </div>

            {alert.responseNote ? (
              <div className="rounded-[1.4rem] bg-white px-4 py-3 text-sm font-bold text-muted shadow-soft ring-1 ring-slate-100">
                {alert.responseNote}
              </div>
            ) : null}

            <div className="flex flex-wrap justify-end gap-3">
              <Button
                className="h-11 px-4 text-sm"
                disabled={pendingId === alert.id || alert.status !== 'pending'}
                iconLeft={<Eye className="h-4 w-4" />}
                onClick={() => updateAlertStatus(alert.id, 'seen')}
                variant="secondary"
              >
                Voir
              </Button>
              <Button
                className="h-11 px-4 text-sm"
                disabled={pendingId === alert.id || alert.status === 'resolved'}
                iconLeft={<Check className="h-4 w-4" />}
                onClick={() => updateAlertStatus(alert.id, 'resolved')}
              >
                {pendingId === alert.id ? 'Mise a jour...' : 'Resoudre'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
