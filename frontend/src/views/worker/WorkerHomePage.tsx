import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  HeartPulse,
  NotebookText,
  Sparkles,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { emotionalWeather, getCategoryTheme, workerWelcomeNotes } from '../../theme/experience';
import { Category, Favorite, Message, Routine, Workshop } from '../../types/models';

export function WorkerHomePage(): React.ReactElement {
  const { token, user } = useAuth();
  const { addPictogram } = useComposer();
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      return;
    }

    Promise.all([
      api.get<Category[]>('/categories', token),
      api.get<Favorite[]>('/favorites', token),
      api.get<Message[]>('/messages/mine', token),
      api.get<Workshop[]>('/workshops', token),
      api.get<Routine[]>('/routines', token)
    ])
      .then(([fetchedCategories, fetchedFavorites, fetchedMessages, fetchedWorkshops, fetchedRoutines]) => {
        setCategories(fetchedCategories);
        setFavorites(fetchedFavorites);
        setMessages(fetchedMessages);
        setRoutines(fetchedRoutines);
        setWorkshop(
          user.assignedWorkshop ||
            fetchedWorkshops.find(workshopItem => workshopItem.id === user.assignedWorkshop?.id) ||
            fetchedWorkshops[0] ||
            null
        );
      })
      .finally(() => setLoading(false));
  }, [token, user]);

  if (loading || !user) {
    return <ScreenLoader message="Preparation de votre accueil travailleur..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        action={
          <Link
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/worker/pictograms"
          >
            <span>Choisir des pictogrammes</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
        description="Un accueil doux, lisible et tactile pour parler, demander de l aide ou suivre son atelier."
        eyebrow="Accueil travailleur"
        title={`Bonjour ${user.firstName}`}
      />

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden p-0" tone="soft">
          <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(79,140,255,0.12),rgba(124,198,166,0.10),rgba(255,255,255,0.86))] p-6 md:p-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <Badge>Que veux-tu faire aujourd hui ?</Badge>
              <div className="space-y-3">
                <h2 className="text-3xl font-black leading-tight text-ink md:text-4xl">
                  Choisis une image, construis ton message, puis fais-le lire calmement.
                </h2>
                <p className="max-w-2xl text-base leading-8 text-muted md:text-lg">
                  AlterCom t aide a communiquer avec des phrases courtes, des categories
                  claires et un bouton urgence toujours visible.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {workerWelcomeNotes.map(note => (
                  <div
                    className="rounded-[24px] bg-white/80 px-4 py-4 text-sm font-extrabold text-ink shadow-soft ring-1 ring-white/80"
                    key={note}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <Card className="bg-white/78" tone="soft">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-sky text-brand">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted">Mon atelier aujourd hui</p>
                    <p className="text-lg font-black text-ink">
                      {workshop?.name || 'Aucun atelier assigne'}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-muted">
                  {workshop?.description ||
                    'Un encadrant peut choisir un atelier pour filtrer les pictogrammes utiles.'}
                </p>
              </Card>

              <Card className="bg-white/78" tone="soft">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-orange-50 text-orange-500">
                    <NotebookText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-muted">Routines du jour</p>
                    <p className="text-lg font-black text-ink">
                      {routines.length} routine{routines.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-7 text-muted">
                  {routines[0]?.title ||
                    'Les routines apparaitront ici pour guider le travail etape par etape.'}
                </p>
              </Card>
            </div>
          </div>
        </Card>

        <Card className="space-y-4" tone="soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-sky text-brand">
              <HeartPulse className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-muted">Meteo emotionnelle</p>
              <p className="text-xl font-black text-ink">Comment te sens-tu ?</p>
            </div>
          </div>

        <div className="grid gap-3">
          {emotionalWeather.map(item => (
              <motion.div
                className={`rounded-[24px] ${item.bg} p-4`}
                key={item.title}
                whileHover={{ x: 2 }}
              >
                <p className={`text-sm font-black uppercase tracking-[0.16em] ${item.accent}`}>
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <Link
            className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
            to="/worker/emotions"
          >
            Ouvrir la page emotions
          </Link>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge>Routines du jour</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Mes etapes de travail</p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-transparent px-5 text-base font-bold text-ink ring-1 ring-slate-200 transition hover:bg-white/80"
            to="/worker/routines"
          >
            Ouvrir mes routines
          </Link>
        </div>

        {routines.length ? (
          <div className="grid gap-4 xl:grid-cols-3">
            {routines.slice(0, 3).map(routine => (
              <Card className="space-y-4" key={routine.id} tone="soft">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black text-ink">{routine.title}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {routine.workshop?.name || 'Routine travailleur'}
                    </p>
                  </div>
                  <Badge>{routine.assignment?.progressPercent || 0}%</Badge>
                </div>

                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7CC6A6)]"
                    style={{ width: `${routine.assignment?.progressPercent || 0}%` }}
                  />
                </div>

                <p className="text-sm leading-7 text-muted">
                  {routine.assignment?.status === 'completed'
                    ? 'Routine terminee.'
                    : routine.steps[routine.assignment?.currentStepIndex || 0]?.instruction ||
                      routine.supportText}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Quand un encadrant t attribue une routine, elle sera visible ici."
            title="Aucune routine pour aujourd hui"
          />
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Badge>Favoris rapides</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Tes raccourcis les plus utiles</p>
          </div>
          <Link
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-transparent px-5 text-base font-bold text-ink ring-1 ring-slate-200 transition hover:bg-white/80"
            to="/worker/favorites"
          >
            Voir tous les favoris
          </Link>
        </div>

        {favorites.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {favorites.slice(0, 3).map(favorite => {
              const pictogram = favorite.pictogram || favorite.pictograms?.[0] || null;

              return (
                <Card className="space-y-4" key={favorite.id} tone="soft">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-amber-50 text-orange-500">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-black text-ink">{favorite.title}</p>
                      <p className="text-sm text-muted">{favorite.text}</p>
                    </div>
                  </div>
                  {pictogram ? (
                    <Button onClick={() => addPictogram(pictogram)} variant="secondary">
                      Utiliser ce favori
                    </Button>
                  ) : null}
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            description="Tes phrases et pictogrammes favoris apparaitront ici pour un acces plus rapide."
            title="Aucun favori pour le moment"
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <Badge>Categories principales</Badge>
          <p className="mt-3 text-2xl font-black text-ink">Choisir un univers de communication</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {categories.map(category => {
            const theme = getCategoryTheme(category);
            const Icon = theme.icon;

            return (
              <Link key={category.id} to={`/worker/pictograms/${category.key}`}>
                <motion.article
                  whileHover={{ y: -4 }}
                  className="group h-full rounded-[32px] bg-white/90 p-5 shadow-soft ring-1 ring-slate-200 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-[22px] ${theme.soft} ${theme.accent}`}
                    >
                      <Icon className="h-7 w-7" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-brand" />
                  </div>

                  <div className="mt-6 space-y-2">
                    <p className="text-2xl font-black text-ink">{category.name}</p>
                    <p className="text-base font-bold text-muted">{category.prompt}</p>
                    <p className="pt-2 text-sm leading-7 text-muted">{category.description}</p>
                  </div>
                </motion.article>
              </Link>
            );
          })}
        </div>
      </section>

      {messages.length ? (
        <section className="space-y-4">
          <div>
            <Badge>Derniers messages</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Tes derniers envois</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {messages.slice(0, 3).map(message => (
              <Card className="space-y-4" key={message.id} tone="soft">
                <div className="flex items-center justify-between">
                  <Badge>{message.channel === 'emergency' ? 'Urgence' : 'Message'}</Badge>
                  <span className="text-sm font-bold text-muted">
                    {new Date(message.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <p className="text-lg font-black text-ink">{message.text}</p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
