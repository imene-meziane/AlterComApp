import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';

import { cn } from '../lib/cn';
import { getCategoryTheme } from '../theme/experience';
import { Pictogram } from '../types/models';

interface PictogramCardProps {
  pictogram: Pictogram;
  isFavorite?: boolean;
  onSelect: (pictogram: Pictogram) => void;
  onToggleFavorite?: (pictogram: Pictogram) => void;
  size?: 'default' | 'emotion';
}

export function PictogramCard({
  pictogram,
  isFavorite = false,
  onSelect,
  onToggleFavorite,
  size = 'default'
}: PictogramCardProps): React.ReactElement {
  const theme = getCategoryTheme(pictogram.category);

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className={cn(
        'group relative overflow-hidden rounded-[30px] border border-white/70 bg-white/90 p-4 shadow-soft backdrop-blur',
        size === 'emotion' ? 'min-h-[18rem]' : 'min-h-[15.5rem]'
      )}
      style={{
        boxShadow: `0 24px 48px ${pictogram.color}16`
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-20 opacity-80"
        style={{
          background: `linear-gradient(180deg, ${pictogram.color}22 0%, rgba(255,255,255,0) 100%)`
        }}
      />

      <div className="relative flex h-full flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-extrabold text-muted ring-1 ring-slate-200">
            <span className={cn('h-2.5 w-2.5 rounded-full', theme.soft)} />
            {pictogram.category.name}
          </div>

          {onToggleFavorite ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-2xl transition',
                isFavorite
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500'
              )}
              onClick={() => onToggleFavorite(pictogram)}
              type="button"
            >
              <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
            </motion.button>
          ) : null}
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="flex h-full flex-col items-center justify-center gap-4 text-center"
          onClick={() => onSelect(pictogram)}
          type="button"
        >
          <div
            className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/70 bg-white shadow-soft transition duration-200 group-hover:scale-[1.02]"
            style={{
              background: `linear-gradient(180deg, ${pictogram.color}18 0%, rgba(255,255,255,0.98) 100%)`
            }}
          >
            <img alt="" className="h-16 w-16 object-contain" src={pictogram.imageUrl} />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black leading-tight text-ink">{pictogram.label}</h3>
            <p className="line-clamp-2 text-sm leading-6 text-muted">{pictogram.phrase}</p>
          </div>

          <div className="mt-auto inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-extrabold text-ink transition group-hover:bg-sky">
            <Plus className="h-4 w-4" />
            Ajouter au message
          </div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isFavorite ? (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className="absolute bottom-4 right-4 rounded-full bg-rose-100 px-3 py-1 text-xs font-extrabold text-rose-500"
            exit={{ opacity: 0, scale: 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
          >
            Favori
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.article>
  );
}
