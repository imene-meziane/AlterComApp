import React, { useEffect, useState } from 'react';
import { MessageCircleHeart } from 'lucide-react';

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
import { Favorite } from '../../types/models';

export function FavoritesPage(): React.ReactElement {
  const { token, user } = useAuth();
  const { addPictogram } = useComposer();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<Favorite[]>('/favorites', token)
      .then(setFavorites)
      .finally(() => setLoading(false));
  }, [token]);

  async function removeFavorite(favoriteId: string): Promise<void> {
    await api.delete(`/favorites/${favoriteId}`, token);
    setFavorites(current => current.filter(favorite => favorite.id !== favoriteId));
  }

  if (loading) {
    return <ScreenLoader message="Chargement des favoris..." />;
  }

  const pictogramFavorites = favorites.filter(
    favorite => favorite.kind === 'pictogram' && favorite.pictogram
  );
  const phraseFavorites = favorites.filter(favorite => favorite.kind === 'phrase');

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Tes phrases et pictogrammes préférés restent accessibles en quelques gestes."
        eyebrow="Favoris"
        title="Mes raccourcis utiles"
      />

      <section className="space-y-4">
        <div>
          <Badge>Pictogrammes favoris</Badge>
          <p className="mt-3 text-2xl font-black text-ink">Images frequentes</p>
        </div>

        {pictogramFavorites.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pictogramFavorites.map(favorite => (
              <Card className="space-y-4" key={favorite.id} tone="soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-sky">
                    <img alt="" className="h-10 w-10 object-contain" src={favorite.pictogram?.imageUrl} />
                  </div>
                  <div>
                    <p className="text-lg font-black text-ink">{favorite.title}</p>
                    <p className="text-sm leading-7 text-muted">{favorite.text}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => favorite.pictogram && addPictogram(favorite.pictogram)}
                    variant="secondary"
                  >
                    Utiliser
                  </Button>
                  <Button onClick={() => removeFavorite(favorite.id)} variant="ghost">
                    Retirer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Ajoute des pictogrammes en favori pour les retrouver plus vite depuis l'accueil."
            title="Aucun pictogramme favori"
          />
        )}
      </section>

      <section className="space-y-4">
        <div>
          <Badge>Phrases favorites</Badge>
          <p className="mt-3 text-2xl font-black text-ink">Messages déjà préparés</p>
        </div>

        {phraseFavorites.length ? (
          <div className="grid gap-4">
            {phraseFavorites.map(favorite => (
              <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between" key={favorite.id} tone="soft">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-orange-50 text-orange-500">
                    <MessageCircleHeart className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-ink">{favorite.title}</p>
                    <p className="text-sm leading-7 text-muted">{favorite.text}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() =>
                      speakText(favorite.text, {
                        rate: user?.preferences.speechRate,
                        volume: user?.preferences.speechVolume
                      })
                    }
                    variant="secondary"
                  >
                    Lire
                  </Button>
                  <Button onClick={() => removeFavorite(favorite.id)} variant="ghost">
                    Retirer
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            description="Enregistre une phrase depuis Mon message pour la retrouver ici."
            title="Aucune phrase favorite"
          />
        )}
      </section>
    </div>
  );
}
