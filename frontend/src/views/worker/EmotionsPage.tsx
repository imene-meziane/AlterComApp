import React, { useEffect, useState } from 'react';
import { HeartHandshake } from 'lucide-react';

import { PictogramCard } from '../../components/PictogramCard';
import { ScreenLoader } from '../../components/ScreenLoader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { Favorite, Pictogram } from '../../types/models';

const emotionCardHints: Record<
  string,
  {
    tint: string;
    note: string;
  }
> = {
  content: { tint: 'bg-amber-50', note: 'Je peux montrer que tout va bien.' },
  fatigue: { tint: 'bg-blue-50', note: 'Je peux demander un rythme plus calme.' },
  stresse: { tint: 'bg-orange-50', note: 'Je peux dire que je suis inquiet.' },
  triste: { tint: 'bg-indigo-50', note: 'Je peux dire que je ne vais pas bien.' },
  peur: { tint: 'bg-rose-50', note: 'Je peux demander du soutien.' },
  'j-ai-mal': { tint: 'bg-red-50', note: 'Je peux signaler une douleur rapidement.' }
};

export function EmotionsPage(): React.ReactElement {
  const { token } = useAuth();
  const { addPictogram } = useComposer();
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Pictogram[]>('/pictograms?category=emotions', token),
      api.get<Favorite[]>('/favorites', token)
    ])
      .then(([fetchedPictograms, fetchedFavorites]) => {
        setPictograms(fetchedPictograms);
        setFavorites(fetchedFavorites);
      })
      .finally(() => setLoading(false));
  }, [token]);

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
    return <ScreenLoader message="Preparation de la page emotions..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Cette page garde une ambiance plus douce pour aider a montrer une emotion ou un inconfort sans surcharge."
        eyebrow="Emotions"
        title="Comment je me sens aujourd hui"
      />

      <Card className="overflow-hidden p-0" tone="soft">
        <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(255,184,107,0.12),rgba(255,255,255,0.90),rgba(124,198,166,0.08))] p-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-orange-50 text-orange-500">
              <HeartHandshake className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-ink">Une page emotionnellement rassurante</h2>
              <p className="text-base leading-8 text-muted">
                Chaque carte emotion reste grande, lisible et facile a toucher sur tablette.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pictograms.slice(0, 3).map(pictogram => {
              const hint = emotionCardHints[pictogram.key] || {
                tint: 'bg-slate-50',
                note: 'Je peux montrer simplement comment je me sens.'
              };

              return (
                <div className={`rounded-[28px] ${hint.tint} p-4`} key={pictogram.id}>
                  <p className="text-base font-black text-ink">{pictogram.label}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">{hint.note}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {pictograms.length ? (
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
              size="emotion"
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Les pictogrammes d emotions n ont pas encore ete charges."
          title="Aucune emotion disponible"
        />
      )}
    </div>
  );
}
