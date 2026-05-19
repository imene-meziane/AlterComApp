import React, { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

import { PictogramCard } from '../../components/PictogramCard';
import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { getWorkshopStory } from '../../theme/experience';
import { Favorite, Pictogram, Workshop } from '../../types/models';

export function WorkshopPage(): React.ReactElement {
  const { token } = useAuth();
  const { addPictogram } = useComposer();
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Workshop[]>('/workshops', token)
      .then(async fetchedWorkshops => {
        const currentWorkshop = fetchedWorkshops[0] || null;
        setWorkshop(currentWorkshop);

        if (!currentWorkshop) {
          setPictograms([]);
          setFavorites([]);
          return;
        }

        const [fetchedPictograms, fetchedFavorites] = await Promise.all([
          api.get<Pictogram[]>(
            `/pictograms?workshop=${encodeURIComponent(currentWorkshop.key)}`,
            token
          ),
          api.get<Favorite[]>('/favorites', token)
        ]);

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
    return <ScreenLoader message="Mise en place de ton atelier..." />;
  }

  if (!workshop) {
    return (
      <div className="pb-10">
        <EmptyState
          description="Un encadrant peut attribuer un atelier pour afficher le bon parcours et les pictogrammes utiles."
          title="Aucun atelier assigne"
        />
      </div>
    );
  }

  const story = getWorkshopStory(workshop);

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Un espace plus immersif pour retrouver les consignes visuelles et les pictogrammes utiles a ton activite."
        eyebrow={story.eyebrow}
        title={story.title}
      />

      <Card className="overflow-hidden p-0" tone="soft">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div
            className="rounded-[32px] p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${workshop.color}, rgba(47,58,75,0.88))`
            }}
          >
            <Badge className="bg-white/20 text-white ring-white/15">Banniere atelier</Badge>
            <h2 className="mt-4 text-4xl font-black">{workshop.name}</h2>
            <p className="mt-3 max-w-2xl text-base leading-8 text-white/86">
              {workshop.description}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-extrabold">
              <Sparkles className="h-4 w-4" />
              {story.note}
            </div>
          </div>

          <div className="grid gap-3">
            {story.steps.map((step, index) => (
              <Card className="flex items-start gap-4" key={step.title} tone="soft">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600">
                  <span className="text-lg font-black">{index + 1}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-black text-ink">{step.title}</p>
                  <p className="text-sm leading-7 text-muted">{step.text}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      <Card className="space-y-4" tone="soft">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <Badge>Phrases utiles</Badge>
            <p className="mt-2 text-xl font-black text-ink">Ce que je peux dire dans l atelier</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {pictograms.slice(0, 3).map(pictogram => (
            <Card className="space-y-2" key={pictogram.id} tone="tinted">
              <p className="text-base font-black text-ink">{pictogram.label}</p>
              <p className="text-sm leading-7 text-muted">{pictogram.phrase}</p>
            </Card>
          ))}
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
            />
          ))}
        </div>
      ) : (
        <EmptyState
          description="Les pictogrammes lies a cet atelier apparaitront ici."
          title="Aucun pictogramme d atelier"
        />
      )}
    </div>
  );
}
