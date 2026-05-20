import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircleMore, Volume2 } from 'lucide-react';

const pictogramTiles = [
  { label: 'Pause', tone: 'bg-sky text-brand' },
  { label: 'Atelier', tone: 'bg-emerald-50 text-emerald-600' }
];

export function AppIllustration(): React.ReactElement {
  return (
    <motion.div
      animate={{ y: [0, -6, 0], rotate: [-1.5, 0.5, -1.5] }}
      className="relative mx-auto w-full max-w-[18.5rem]"
      transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
    >
      <div className="absolute left-8 top-12 h-20 w-20 rounded-full bg-brand/10 blur-3xl" />
      <div className="absolute bottom-10 right-4 h-20 w-20 rounded-full bg-mint/12 blur-3xl" />

      <div className="relative rounded-[2.4rem] border border-white/80 bg-white/42 p-3 shadow-[0_24px_54px_rgba(47,58,75,0.12)] backdrop-blur-2xl">
        <div className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,244,239,0.96))] p-3 shadow-soft">
          <div className="rounded-[1.7rem] bg-[linear-gradient(180deg,#FDFBF7,#F5F8FF)] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-muted">
                  AlterCom
                </p>
                <p className="text-sm font-black text-ink">Mon message</p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand shadow-soft">
                <Volume2 className="h-4 w-4" />
              </div>
            </div>

            <div className="rounded-[1.5rem] bg-white px-4 py-3 shadow-soft">
              <div className="flex flex-wrap gap-2">
                {["J'ai besoin", "d'aide"].map(item => (
                  <span
                    className="rounded-full bg-sky px-3 py-2 text-sm font-black text-brand"
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              {pictogramTiles.map(tile => (
                <div className="rounded-[1.35rem] bg-white p-3 shadow-soft" key={tile.label}>
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-[1rem] ${tile.tone}`}
                  >
                    <MessageCircleMore className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-black leading-5 text-ink">{tile.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-200/80">
              <div className="h-2 w-1/2 rounded-full bg-[linear-gradient(90deg,#4F8CFF,#7CC6A6)]" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
