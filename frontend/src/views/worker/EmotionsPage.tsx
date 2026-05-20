import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { PictogramCard } from '../../components/PictogramCard';
import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { Favorite, Pictogram } from '../../types/models';

const mainEmotionKeys = ['content', 'fatigue', 'stresse'];
const supportEmotionKeys = ['j-ai-mal', 'aide', 'pause'];

function pickPictogramsByKey(source: Pictogram[], keys: string[]): Pictogram[] {
  const map = new Map(source.map(pictogram => [pictogram.key, pictogram]));

  return keys
    .map(key => map.get(key))
    .filter((pictogram): pictogram is Pictogram => Boolean(pictogram));
}

function QuickEmotionButton({
  pictogram,
  onSelect,
  compact = false
}: {
  pictogram: Pictogram;
  onSelect: (pictogram: Pictogram) => void;
  compact?: boolean;
}): React.ReactElement {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`rounded-[28px] border border-white/80 bg-white px-4 py-4 text-center shadow-soft transition hover:shadow-panel ${
        compact ? 'min-h-[7rem]' : 'min-h-[10rem]'
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
          {pictogram.label}
        </p>
      </div>
    </motion.button>
  );
}

export function EmotionsPage(): React.ReactElement {
  const { token } = useAuth();
  const { addPictogram, items } = useComposer();
  const [emotionPictograms, setEmotionPictograms] = useState<Pictogram[]>([]);
  const [supportPictograms, setSupportPictograms] = useState<Pictogram[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Pictogram[]>('/pictograms?category=emotions', token),
      api.get<Pictogram[]>('/pictograms?category=besoins', token),
      api.get<Favorite[]>('/favorites', token)
    ])
      .then(([fetchedEmotions, fetchedNeeds, fetchedFavorites]) => {
        setEmotionPictograms(fetchedEmotions);
        setSupportPictograms(fetchedNeeds);
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

  const mainEmotions = pickPictogramsByKey(emotionPictograms, mainEmotionKeys);
  const supportChoices = pickPictogramsByKey(
    [...emotionPictograms, ...supportPictograms],
    supportEmotionKeys
  );

  return (
    <div className="space-y-6 pb-10">
      <SectionHeader
        action={
          items.length ? (
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-base font-bold text-ink shadow-soft ring-1 ring-slate-200 transition hover:bg-slate-50"
              to="/worker/message"
            >
              Mon message
            </Link>
          ) : null
        }
        eyebrow="Emotions"
        title="Comment te sens-tu ?"
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-4" tone="soft">
          <div>
            <Badge>Je me sens</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {mainEmotions.map(pictogram => (
              <QuickEmotionButton key={pictogram.id} onSelect={addPictogram} pictogram={pictogram} />
            ))}
          </div>
        </Card>

        <Card className="space-y-4" tone="soft">
          <div>
            <Badge>J ai besoin</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {supportChoices.map(pictogram => (
              <QuickEmotionButton
                compact
                key={pictogram.id}
                onSelect={addPictogram}
                pictogram={pictogram}
              />
            ))}
          </div>
        </Card>
      </div>

      {emotionPictograms.length ? (
        <section className="space-y-4">
          <div>
            <Badge>Toutes les emotions</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {emotionPictograms.map(pictogram => (
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
        </section>
      ) : (
        <EmptyState
          description="Les pictogrammes d emotions n ont pas encore ete charges."
          title="Aucune emotion disponible"
        />
      )}
    </div>
  );
}
