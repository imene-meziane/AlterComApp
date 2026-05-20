import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { PictogramCard } from '../../components/PictogramCard';
import { ScreenLoader } from '../../components/ScreenLoader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { getCategoryTheme } from '../../theme/experience';
import { Category, Favorite, Pictogram } from '../../types/models';

export function PictogramsPage(): React.ReactElement {
  const { categoryKey } = useParams();
  const { token, user } = useAuth();
  const { addPictogram } = useComposer();
  const [categories, setCategories] = useState<Category[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const selectedKey = categoryKey || '';

    Promise.all([
      api.get<Category[]>('/categories', token),
      api.get<Favorite[]>('/favorites', token),
      api.get<Pictogram[]>(
        `/pictograms${selectedKey || search ? '?' : ''}${new URLSearchParams({
          ...(selectedKey ? { category: selectedKey } : {}),
          ...(search ? { q: search } : {})
        }).toString()}`,
        token
      )
    ])
      .then(([fetchedCategories, fetchedFavorites, fetchedPictograms]) => {
        setCategories(fetchedCategories);
        setFavorites(fetchedFavorites);
        setPictograms(fetchedPictograms);
      })
      .finally(() => setLoading(false));
  }, [categoryKey, search, token]);

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
    return <ScreenLoader message="Organisation des pictogrammes..." />;
  }

  const selectedCategory =
    categories.find(category => category.key === categoryKey) || categories[0] || null;
  const theme = getCategoryTheme(selectedCategory);
  const Icon = theme.icon;

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Des catégories horizontales, une recherche douce et de grands pictogrammes pensés pour la tablette."
        eyebrow="Pictogrammes"
        title={selectedCategory ? selectedCategory.prompt : 'Choisir une catégorie visuelle'}
      />

      <Card className="overflow-hidden p-0" tone="soft">
        <div className="grid gap-6 bg-[linear-gradient(135deg,rgba(79,140,255,0.10),rgba(124,198,166,0.10),rgba(255,255,255,0.86))] p-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-[22px] ${theme.soft} ${theme.accent}`}>
              <Icon className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-ink">
                {selectedCategory?.name || 'Bibliotheque visuelle'}
              </h2>
              <p className="text-base leading-8 text-muted">
                {selectedCategory?.description ||
                  "Chaque pictogramme s'ajoute dans Mon message avec un retour visuel immédiat."}
              </p>
            </div>
          </div>

          <Card className="space-y-4" tone="soft">
            <div className="flex items-center gap-3 rounded-[24px] bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200">
              <Search className="h-5 w-5 text-slate-400" />
              <input
                className="w-full bg-transparent text-base"
                onChange={event => setSearch(event.target.value)}
                placeholder={
                  user?.preferences.showSearch
                    ? 'Chercher un mot ou un besoin'
                    : 'Recherche simple'
                }
                type="search"
                value={search}
              />
            </div>
            <p className="text-sm leading-7 text-muted">
              La recherche reste discrète. Tu peux aussi naviguer seulement avec les catégories.
            </p>
          </Card>
        </div>
      </Card>

      <div className="scrollbar-soft flex gap-3 overflow-x-auto pb-2">
        {categories.map(category => {
          const categoryTheme = getCategoryTheme(category);
          const CategoryIcon = categoryTheme.icon;
          const active = category.key === (selectedCategory?.key || category.key);

          return (
            <Link
              className={`inline-flex shrink-0 items-center gap-3 rounded-full px-4 py-3 text-sm font-extrabold transition ${
                active
                  ? 'bg-ink text-white shadow-soft'
                  : 'bg-white text-ink ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
              key={category.id}
              to={`/worker/pictograms/${category.key}`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  active ? 'bg-white/15' : `${categoryTheme.soft} ${categoryTheme.accent}`
                }`}
              >
                <CategoryIcon className="h-5 w-5" />
              </span>
              {category.name}
            </Link>
          );
        })}
      </div>

      {pictograms.length ? (
        <motion.div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" layout>
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
        </motion.div>
      ) : (
        <EmptyState
          description="Essaie une autre catégorie ou un autre mot-clé pour faire apparaître des pictogrammes."
          title="Aucun pictogramme trouvé"
        />
      )}
    </div>
  );
}
