import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, RefreshCw, Volume2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { api } from '../../services/api';
import { speakText } from '../../services/speech';
import { Routine } from '../../types/models';

export function RoutinesPage(): React.ReactElement {
  const { token, user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState('');

  useEffect(() => {
    api
      .get<Routine[]>('/routines', token)
      .then(setRoutines)
      .finally(() => setLoading(false));
  }, [token]);

  async function validateStep(routine: Routine): Promise<void> {
    if (!routine.assignment) {
      return;
    }

    setPendingId(routine.id);
    try {
      const updatedRoutine = await api.post<Routine>(
        `/routines/${routine.id}/progress`,
        {
          stepIndex: routine.assignment.currentStepIndex
        },
        token
      );

      setRoutines(current =>
        current.map(item => (item.id === updatedRoutine.id ? updatedRoutine : item))
      );
    } finally {
      setPendingId('');
    }
  }

  async function resetRoutine(routineId: string): Promise<void> {
    setPendingId(routineId);
    try {
      const updatedRoutine = await api.post<Routine>(`/routines/${routineId}/reset`, {}, token);
      setRoutines(current =>
        current.map(item => (item.id === updatedRoutine.id ? updatedRoutine : item))
      );
    } finally {
      setPendingId('');
    }
  }

  if (loading) {
    return <ScreenLoader message="Chargement des routines..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Retrouve tes routines du jour, avance etape par etape et valide quand c est termine."
        eyebrow="Mes routines"
        title={`Routines de ${user?.firstName || 'travail'}`}
      />

      {routines.length ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {routines.map(routine => {
            const assignment = routine.assignment;
            const currentStep = routine.steps[assignment?.currentStepIndex || 0];
            const isCompleted = assignment?.status === 'completed';
            const progress = assignment?.progressPercent || 0;

            return (
              <Card className="overflow-hidden p-0" key={routine.id} tone="soft">
                <div className="bg-[linear-gradient(135deg,rgba(79,140,255,0.08),rgba(124,198,166,0.08),rgba(255,255,255,0.92))] p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{routine.workshop?.name || 'Routine atelier'}</Badge>
                        <Badge>{routine.difficulty}</Badge>
                        <Badge>{routine.estimatedMinutes} min</Badge>
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-ink">{routine.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-muted">{routine.description}</p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] bg-white/85 px-4 py-3 shadow-soft">
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                        Progression
                      </p>
                      <p className="mt-2 text-2xl font-black text-ink">{progress}%</p>
                    </div>
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-white/80">
                    <motion.div
                      animate={{ width: `${progress}%` }}
                      className="h-3 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7CC6A6)]"
                      transition={{ duration: 0.35, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div className="rounded-[1.8rem] bg-white px-5 py-4 shadow-soft ring-1 ring-slate-100">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                      Etape actuelle
                    </p>
                    <p className="mt-2 text-xl font-black text-ink">
                      {isCompleted
                        ? 'Routine terminee'
                        : currentStep?.title || 'Routine prete a commencer'}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {isCompleted
                        ? 'Bravo, toutes les etapes sont validees.'
                        : currentStep?.instruction || routine.supportText || 'Prends ton temps et avance doucement.'}
                    </p>
                  </div>

                  <div className="grid gap-3">
                    {routine.steps.map((step, index) => {
                      const done = assignment?.completedStepIndexes.includes(index);
                      const isCurrent = !done && index === assignment?.currentStepIndex && !isCompleted;

                      return (
                        <div
                          className={`rounded-[1.5rem] px-4 py-4 transition ${
                            done
                              ? 'bg-emerald-50'
                              : isCurrent
                                ? 'bg-sky'
                                : 'bg-white ring-1 ring-slate-100'
                          }`}
                          key={`${routine.id}-${step.order}`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${
                                done
                                  ? 'bg-emerald-500 text-white'
                                  : isCurrent
                                    ? 'bg-brand text-white'
                                    : 'bg-slate-100 text-muted'
                              }`}
                            >
                              {step.order}
                            </div>
                            <div>
                              <p className="text-base font-black text-ink">{step.title}</p>
                              <p className="mt-1 text-sm leading-6 text-muted">{step.instruction}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap justify-end gap-3">
                    <Button
                      className="h-11 px-4 text-sm"
                      iconLeft={<Volume2 className="h-4 w-4" />}
                      onClick={() => speakText(currentStep?.audioText || currentStep?.instruction || routine.title, {
                        rate: user?.preferences.speechRate,
                        volume: user?.preferences.speechVolume
                      })}
                      variant="secondary"
                    >
                      Lire l etape
                    </Button>
                    <Button
                      className="h-11 px-4 text-sm"
                      iconLeft={<RefreshCw className="h-4 w-4" />}
                      onClick={() => resetRoutine(routine.id)}
                      variant="ghost"
                    >
                      Recommencer
                    </Button>
                    <Button
                      className="h-11 px-4 text-sm"
                      disabled={isCompleted || pendingId === routine.id}
                      iconLeft={<Check className="h-4 w-4" />}
                      onClick={() => validateStep(routine)}
                    >
                      {pendingId === routine.id ? 'Validation...' : isCompleted ? 'Routine terminee' : 'Valider etape'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          description="Quand un encadrant t attribue une routine, elle apparait ici avec ses etapes."
          title="Aucune routine assignee"
        />
      )}
    </div>
  );
}
