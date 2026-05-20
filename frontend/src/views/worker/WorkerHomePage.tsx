import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock3, HeartPulse, Play, Sparkles, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { speakText } from '../../services/speech';
import { getWorkshopStory } from '../../theme/experience';
import { Favorite, Message, Pictogram, Routine } from '../../types/models';

const quickNeedOrder = ['pause', 'aide', 'boire', 'toilettes', 'j-ai-mal'];
const quickNeedLabels: Record<string, string> = {
  pause: 'Pause',
  aide: 'Aide',
  boire: 'Eau',
  toilettes: 'Toilettes',
  'j-ai-mal': "J'ai mal"
};
const emotionOrder = ['content', 'fatigue', 'stresse'];

function pickPictogramsByKey(source: Pictogram[], keys: string[]): Pictogram[] {
  const map = new Map(source.map(pictogram => [pictogram.key, pictogram]));

  return keys
    .map(key => map.get(key))
    .filter((pictogram): pictogram is Pictogram => Boolean(pictogram));
}

function formatMessageTime(value: string): string {
  return new Date(value).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function HomePictogramButton({
  pictogram,
  label,
  onSelect,
  compact = false
}: {
  pictogram: Pictogram;
  label?: string;
  onSelect: (pictogram: Pictogram) => void;
  compact?: boolean;
}): React.ReactElement {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-white px-4 py-4 text-center shadow-soft transition hover:shadow-panel ${
        compact ? 'min-h-[6.5rem]' : 'min-h-[9.75rem]'
      }`}
      onClick={() => onSelect(pictogram)}
      style={{
        background: `linear-gradient(180deg, ${pictogram.color}18 0%, rgba(255,255,255,0.98) 76%)`
      }}
      type="button"
    >
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <div className={`rounded-[24px] bg-white/95 shadow-soft ${compact ? 'p-3' : 'p-4'}`}>
          <img
            alt=""
            className={compact ? 'h-12 w-12 object-contain' : 'h-16 w-16 object-contain'}
            src={pictogram.imageUrl}
          />
        </div>
        <p className={`font-black text-ink ${compact ? 'text-sm' : 'text-lg'}`}>
          {label || pictogram.label}
        </p>
      </div>
    </motion.button>
  );
}

export function WorkerHomePage(): React.ReactElement {
  const { token, user } = useAuth();
  const { addPictogram, clearMessage, items, sentence, speakCurrent } = useComposer();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [needs, setNeeds] = useState<Pictogram[]>([]);
  const [places, setPlaces] = useState<Pictogram[]>([]);
  const [emotions, setEmotions] = useState<Pictogram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      api.get<Favorite[]>('/favorites', token),
      api.get<Message[]>('/messages/mine', token),
      api.get<Routine[]>('/routines', token),
      api.get<Pictogram[]>('/pictograms?category=besoins', token),
      api.get<Pictogram[]>('/pictograms?category=lieux', token),
      api.get<Pictogram[]>('/pictograms?category=emotions', token)
    ])
      .then(
        ([
          fetchedFavorites,
          fetchedMessages,
          fetchedRoutines,
          fetchedNeeds,
          fetchedPlaces,
          fetchedEmotions
        ]) => {
          setFavorites(fetchedFavorites);
          setMessages(fetchedMessages);
          setRoutines(fetchedRoutines);
          setNeeds(fetchedNeeds);
          setPlaces(fetchedPlaces);
          setEmotions(fetchedEmotions);
        }
      )
      .finally(() => setLoading(false));
  }, [token, user]);

  if (loading || !user) {
    return <ScreenLoader message="Preparation de ton accueil..." />;
  }

  const favoritePictograms = favorites
    .filter(favorite => favorite.kind === 'pictogram' && favorite.pictogram)
    .map(favorite => favorite.pictogram as Pictogram)
    .slice(0, 3);
  const quickNeeds = pickPictogramsByKey([...needs, ...places], quickNeedOrder);
  const emotionChoices = pickPictogramsByKey(emotions, emotionOrder);
  const currentRoutine =
    routines.find(routine => routine.assignment?.status === 'in_progress') ||
    routines.find(routine => routine.assignment?.status !== 'completed') ||
    routines[0] ||
    null;
  const currentStepIndex = currentRoutine?.assignment?.currentStepIndex || 0;
  const currentStep = currentRoutine?.steps[currentStepIndex] || null;
  const nextStep = currentRoutine?.steps[currentStepIndex + 1] || null;
  const currentWorkshop = currentRoutine?.workshop || user.assignedWorkshop || null;
  const workshopStory = getWorkshopStory(currentWorkshop);
  const activityProgress = currentRoutine?.assignment?.progressPercent || 0;
  const activityShortcuts = currentRoutine
    ? currentRoutine.steps
        .slice(currentStepIndex, currentStepIndex + 2)
        .map(step => step.pictogram)
        .filter((pictogram): pictogram is Pictogram => Boolean(pictogram))
    : [];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black text-ink">{`Bonjour ${user.firstName}`}</h1>
          <p className="mt-1 text-sm font-bold text-muted">Prete a communiquer ?</p>
        </div>

        {items.length ? (
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200">
            <Sparkles className="h-4 w-4 text-brand" />
            {items.length} pictogramme{items.length > 1 ? 's' : ''} dans Mon message
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="space-y-5 overflow-hidden p-0 xl:row-span-2" tone="soft">
          <div className="bg-[linear-gradient(135deg,rgba(79,140,255,0.12),rgba(255,255,255,0.96),rgba(124,198,166,0.12))] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>Actions rapides</Badge>
                <p className="mt-2 text-2xl font-black text-ink">Parler tout de suite</p>
                <p className="mt-1 text-sm font-bold text-muted">
                  Touchez une image pour l ajouter et l entendre.
                </p>
              </div>
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-white"
                to="/worker/pictograms"
              >
                Plus d images
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-5 p-5 pt-0">
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Besoins frequents
                </p>
                <p className="text-xs font-bold text-muted">5 raccourcis utiles</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {quickNeeds.map(pictogram => (
                  <HomePictogramButton
                    key={pictogram.id}
                    label={quickNeedLabels[pictogram.key]}
                    onSelect={addPictogram}
                    pictogram={pictogram}
                  />
                ))}
              </div>
            </section>

            {favoritePictograms.length ? (
              <section className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Favoris
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {favoritePictograms.map(pictogram => (
                    <HomePictogramButton
                      compact
                      key={pictogram.id}
                      onSelect={addPictogram}
                      pictogram={pictogram}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {activityShortcuts.length ? (
              <section className="space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Pour maintenant
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {activityShortcuts.map(pictogram => (
                    <HomePictogramButton
                      compact
                      key={pictogram.id}
                      onSelect={addPictogram}
                      pictogram={pictogram}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(79,140,255,0.10),rgba(255,255,255,0.95),rgba(240,200,144,0.10))] p-4 ring-1 ring-white/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                    Mon message
                  </p>
                  <p className="mt-2 line-clamp-2 text-xl font-black text-ink">
                    {sentence || 'Ajoute un pictogramme.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={!items.length}
                    iconLeft={<Volume2 className="h-4 w-4" />}
                    onClick={() => speakCurrent()}
                    variant="secondary"
                  >
                    Lire
                  </Button>
                  <Button disabled={!items.length} onClick={clearMessage} variant="ghost">
                    Effacer
                  </Button>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#4F8CFF,#6AA5FF)] px-5 text-base font-bold text-white shadow-float transition hover:shadow-panel"
                    to="/worker/message"
                  >
                    Ouvrir
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0" tone="soft">
          <div className="bg-[linear-gradient(135deg,rgba(124,198,166,0.16),rgba(255,255,255,0.96),rgba(240,200,144,0.18))] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge>Aujourd hui</Badge>
                <p className="mt-2 text-2xl font-black text-ink">
                  {currentWorkshop?.name || 'Journee de travail'}
                </p>
                <p className="mt-1 text-sm font-bold text-muted">
                  {currentRoutine ? 'Une action claire a suivre maintenant.' : workshopStory.note}
                </p>
              </div>
              <div className="rounded-[22px] bg-white/92 px-4 py-3 shadow-soft ring-1 ring-white/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Progression
                </p>
                <p className="mt-1 text-2xl font-black text-ink">{activityProgress}%</p>
              </div>
            </div>

            <div className="mt-5 h-3 rounded-full bg-white/80">
              <motion.div
                animate={{ width: `${activityProgress}%` }}
                className="h-3 rounded-full bg-[linear-gradient(90deg,#7CC6A6,#4F8CFF)]"
                transition={{ duration: 0.35, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="grid gap-3 p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Routine
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {currentRoutine?.title || workshopStory.steps[0]?.title || 'Routine du jour'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Etape actuelle
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {currentStep?.title || workshopStory.steps[0]?.title || 'Preparer'}
                </p>
              </div>

              <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                  Ensuite
                </p>
                <p className="mt-2 text-base font-black text-ink">
                  {nextStep?.title || workshopStory.steps[1]?.title || 'Continuer'}
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
                    {currentStep?.instruction ||
                      workshopStory.steps[0]?.text ||
                      'Prends ton temps.'}
                  </p>
                </div>
              </div>
            </div>

            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
              to="/worker/routines"
            >
              Voir ma routine
            </Link>
          </div>
        </Card>

        <Card className="space-y-4" tone="soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Badge>Derniers envois</Badge>
              <p className="mt-2 text-xl font-black text-ink">Rejouer un message</p>
            </div>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
              to="/worker/message"
            >
              Ouvrir
            </Link>
          </div>

          {messages.length ? (
            <div className="space-y-3">
              {messages.slice(0, 3).map(message => (
                <motion.button
                  className={`flex w-full items-center gap-4 rounded-[24px] p-4 text-left ring-1 transition ${
                    message.channel === 'emergency'
                      ? 'bg-rose-50/80 ring-rose-100'
                      : 'bg-white/90 ring-slate-200/80 hover:bg-white'
                  }`}
                  key={message.id}
                  onClick={() =>
                    speakText(message.text, {
                      rate: user.preferences.speechRate,
                      volume: user.preferences.speechVolume
                    })
                  }
                  type="button"
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex shrink-0 -space-x-2">
                    {message.items.length ? (
                      message.items.slice(0, 3).map((item, index) => (
                        <span
                          className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white shadow-soft ring-2 ring-white"
                          key={`${message.id}-${item.label}-${index}`}
                        >
                          <img alt="" className="h-7 w-7 object-contain" src={item.imageUrl} />
                        </span>
                      ))
                    ) : (
                      <span className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-white text-rose-500 shadow-soft ring-2 ring-white">
                        <HeartPulse className="h-5 w-5" />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-black text-ink">{message.text}</p>
                    <p className="mt-1 truncate text-xs font-bold text-muted">
                      {formatMessageTime(message.createdAt)}
                      {message.items.length
                        ? ` • ${message.items.map(item => item.label).join(', ')}`
                        : ' • Urgence'}
                    </p>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky text-brand">
                    <Play className="h-4 w-4" />
                  </span>
                </motion.button>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Tes messages envoyes apparaitront ici."
              title="Aucun envoi pour le moment"
            />
          )}
        </Card>
      </div>

      <Card className="space-y-4" tone="soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-orange-50 text-orange-500">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <Badge>Etat emotionnel</Badge>
              <p className="mt-2 text-xl font-black text-ink">Comment te sens-tu ?</p>
            </div>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            {emotionChoices.map(pictogram => (
              <HomePictogramButton
                compact
                key={pictogram.id}
                onSelect={addPictogram}
                pictogram={pictogram}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
