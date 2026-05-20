import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { PictogramCard } from '../../components/PictogramCard';
import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { speakText } from '../../services/speech';
import { Favorite, Pictogram, Routine } from '../../types/models';

const workshopSupportKeys = ['aide', 'pause', 'boire'];

function pickPictogramsByKey(source: Pictogram[], keys: string[]): Pictogram[] {
  const map = new Map(source.map(pictogram => [pictogram.key, pictogram]));

  return keys
    .map(key => map.get(key))
    .filter((pictogram): pictogram is Pictogram => Boolean(pictogram));
}

function mergeUniquePictograms(...groups: Pictogram[][]): Pictogram[] {
  const seen = new Set<string>();
  const result: Pictogram[] = [];

  groups.flat().forEach(pictogram => {
    if (seen.has(pictogram.id)) {
      return;
    }

    seen.add(pictogram.id);
    result.push(pictogram);
  });

  return result;
}

function WorkshopQuickButton({
  pictogram,
  onSelect
}: {
  pictogram: Pictogram;
  onSelect: (pictogram: Pictogram) => void;
}): React.ReactElement {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="rounded-[28px] border border-white/80 bg-white px-4 py-4 text-center shadow-soft transition hover:shadow-panel"
      onClick={() => onSelect(pictogram)}
      style={{
        background: `linear-gradient(180deg, ${pictogram.color}18 0%, rgba(255,255,255,0.98) 76%)`
      }}
      type="button"
    >
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className="rounded-[24px] bg-white/95 p-3 shadow-soft">
          <img alt="" className="h-12 w-12 object-contain" src={pictogram.imageUrl} />
        </div>
        <p className="text-sm font-black text-ink">{pictogram.label}</p>
      </div>
    </motion.button>
  );
}

export function WorkshopPage(): React.ReactElement {
  const { token, user } = useAuth();
  const { addPictogram } = useComposer();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [supportPictograms, setSupportPictograms] = useState<Pictogram[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.assignedWorkshop) {
      setLoading(false);
      return;
    }

    Promise.all([
      api.get<Pictogram[]>(
        `/pictograms?workshop=${encodeURIComponent(user.assignedWorkshop.key)}`,
        token
      ),
      api.get<Pictogram[]>('/pictograms?category=besoins', token),
      api.get<Favorite[]>('/favorites', token),
      api.get<Routine[]>('/routines', token)
    ])
      .then(([fetchedPictograms, fetchedNeeds, fetchedFavorites, fetchedRoutines]) => {
        setPictograms(fetchedPictograms);
        setSupportPictograms(fetchedNeeds);
        setFavorites(fetchedFavorites);
        setRoutines(fetchedRoutines);
      })
      .finally(() => setLoading(false));
  }, [token, user]);

  async function toggleFavorite(pictogram: Pictogram): Promise<void> {
    const existing = favorites.find(
      favorite => favorite.kind === 'pictogram' && favorite.pictogram?.id === pictogram.id
    );

    if (existing) {
      await api.delete(`/favorites/${existing.id}`, token);
      setFavorites(current => current.filter(favorite => favorite.id !== existing.id));
      return;
    }

    const created = await api.post<Favorite>(
      '/favorites',
      {
        kind: 'pictogram',
        pictogramId: pictogram.id
      },
      token
    );

    setFavorites(current => [created, ...current]);
  }

  if (loading) {
    return <ScreenLoader message="Mise en place de ton atelier..." />;
  }

  if (!user?.assignedWorkshop) {
    return (
      <div className="pb-10">
        <EmptyState
          description="Un encadrant peut attribuer un atelier pour afficher les actions utiles."
          title="Aucun atelier assigne"
        />
      </div>
    );
  }

  const workshop = user.assignedWorkshop;
  const workshopRoutines = routines.filter(
    routine => !routine.workshop || routine.workshop.key === workshop.key
  );
  const currentRoutine =
    workshopRoutines.find(routine => routine.assignment?.status === 'in_progress') ||
    workshopRoutines.find(routine => routine.assignment?.status !== 'completed') ||
    workshopRoutines[0] ||
    null;
  const currentStepIndex = currentRoutine?.assignment?.currentStepIndex || 0;
  const currentStep = currentRoutine?.steps[currentStepIndex] || null;
  const nextStep = currentRoutine?.steps[currentStepIndex + 1] || null;
  const supportChoices = pickPictogramsByKey(supportPictograms, workshopSupportKeys);
  const quickActions = mergeUniquePictograms(
    currentStep?.pictogram ? [currentStep.pictogram] : [],
    nextStep?.pictogram ? [nextStep.pictogram] : [],
    supportChoices,
    pictograms.slice(0, 2)
  ).slice(0, 6);
  const progress = currentRoutine?.assignment?.progressPercent || 0;

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/worker/routines"
          >
            Ma routine
          </Link>
        }
        eyebrow="Atelier"
        title={workshop.name}
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="overflow-hidden p-0" tone="soft">
          <div
            className="p-5"
            style={{
              background: `linear-gradient(135deg, ${workshop.color}26, rgba(255,255,255,0.96), rgba(79,140,255,0.08))`
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>Maintenant</Badge>
                <p className="mt-2 text-2xl font-black text-ink">
                  {currentRoutine?.title || 'Activite du jour'}
                </p>
                <p className="mt-1 text-sm font-bold text-muted">
                  {currentStep?.instruction || workshop.description}
                </p>
              </div>
              <div className="rounded-[22px] bg-white/92 px-4 py-3 shadow-soft ring-1 ring-white/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Progression
                </p>
                <p className="mt-1 text-2xl font-black text-ink">{progress}%</p>
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

          <div className="grid gap-3 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Etape
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {currentStep?.title || 'Preparer'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Ensuite
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {nextStep?.title || 'Continuer'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Duree
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {currentRoutine?.estimatedMinutes || 0} min
                </p>
              </div>
            </div>

            <div className="rounded-[24px] bg-white/75 p-4 ring-1 ring-white/80">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] bg-sky text-brand">
                  <Clock3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-black text-ink">
                    {currentStep?.instruction || 'Prends ton temps et avance doucement.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                iconLeft={<Volume2 className="h-4 w-4" />}
                onClick={() =>
                  speakText(
                    currentStep?.audioText || currentStep?.instruction || currentRoutine?.title || workshop.name,
                    {
                      rate: user.preferences.speechRate,
                      volume: user.preferences.speechVolume
                    }
                  )
                }
                variant="secondary"
              >
                Lire l etape
              </Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-4" tone="soft">
          <div>
            <Badge>Dire vite</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map(pictogram => (
              <WorkshopQuickButton key={pictogram.id} onSelect={addPictogram} pictogram={pictogram} />
            ))}
          </div>
        </Card>
      </div>

      {currentRoutine ? (
        <Card className="space-y-4" tone="soft">
          <div>
            <Badge>Etapes utiles</Badge>
          </div>

          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
            {currentRoutine.steps.map((step, index) => {
              const done = currentRoutine.assignment?.completedStepIndexes.includes(index);
              const isCurrent =
                !done &&
                index === currentRoutine.assignment?.currentStepIndex &&
                currentRoutine.assignment?.status !== 'completed';

              return (
                <div
                  className={`rounded-[24px] p-4 ring-1 ${
                    done
                      ? 'bg-emerald-50 ring-emerald-100'
                      : isCurrent
                        ? 'bg-sky ring-blue-100'
                        : 'bg-white/90 ring-slate-200/80'
                  }`}
                  key={`${currentRoutine.id}-${step.order}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
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
                      <p className="text-sm font-black text-ink">{step.title}</p>
                      <p className="mt-1 text-sm leading-6 text-muted">{step.instruction}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {pictograms.length ? (
        <section className="space-y-4">
          <div>
            <Badge>Images utiles</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pictograms.map(pictogram => (
              <PictogramCard
                isFavorite={favorites.some(
                  favorite => favorite.kind === 'pictogram' && favorite.pictogram?.id === pictogram.id
                )}
                key={pictogram.id}
                onSelect={addPictogram}
                onToggleFavorite={toggleFavorite}
                pictogram={pictogram}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          description="Les pictogrammes lies a cet atelier apparaitront ici."
          title="Aucun pictogramme d atelier"
        />
      )}
    </div>
  );
}
