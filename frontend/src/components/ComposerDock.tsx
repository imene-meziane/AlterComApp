import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eraser, Send, Volume2 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import { useComposer } from '../providers/ComposerProvider';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function ComposerDock(): React.ReactElement {
  const location = useLocation();
  const {
    items,
    sentence,
    isSending,
    removePictogram,
    clearMessage,
    speakCurrent,
    sendCurrentMessage
  } = useComposer();

  const shouldShow = items.length > 0 && location.pathname !== '/worker/message';
  const previewItems = items.slice(0, 3);
  const extraItems = Math.max(0, items.length - previewItems.length);

  return (
    <AnimatePresence>
      {shouldShow ? (
        <motion.div
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-6 left-4 right-24 z-30 hidden md:block md:left-[calc(22rem+2rem)] xl:left-auto xl:right-24 xl:w-[32rem]"
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          <Card className="relative overflow-hidden rounded-[30px] p-4" tone="glass">
            <div className="absolute inset-x-0 top-0 h-20 bg-[linear-gradient(180deg,rgba(79,140,255,0.12),rgba(255,255,255,0))]" />
            <div className="absolute -right-6 top-3 h-20 w-20 rounded-full bg-brand/10 blur-3xl" />

            <div className="relative space-y-4">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ y: [0, -3, 0] }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-sky text-brand shadow-soft"
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Volume2 className="h-5 w-5" />
                </motion.div>

                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                    Message en cours
                  </p>
                  <p className="truncate text-base font-black text-ink">
                    {sentence || 'Mon message'}
                  </p>
                </div>

                <Link
                  className="inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-white/88 px-4 text-sm font-bold text-brand shadow-soft ring-1 ring-white/80 transition hover:bg-white"
                  to="/worker/message"
                >
                  Ouvrir
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <AnimatePresence initial={false}>
                  {previewItems.map(item => (
                    <motion.button
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex items-center gap-2 rounded-full bg-white/88 px-3 py-2 text-left shadow-soft ring-1 ring-white/85"
                      exit={{ opacity: 0, scale: 0.92 }}
                      initial={{ opacity: 0, scale: 0.92 }}
                      key={item.clientId}
                      layout
                      onClick={() => removePictogram(item.clientId)}
                      type="button"
                    >
                      <img
                        alt=""
                        className="h-8 w-8 rounded-full bg-slate-50 p-1"
                        src={item.imageUrl}
                      />
                      <span className="text-sm font-bold text-ink">{item.label}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>

                {extraItems ? (
                  <div className="rounded-full bg-white/82 px-3 py-2 text-sm font-black text-muted shadow-soft ring-1 ring-white/80">
                    +{extraItems}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap justify-end gap-2.5">
                <Button
                  className="h-11 px-4 text-sm"
                  iconLeft={<Volume2 className="h-4 w-4" />}
                  onClick={() => speakCurrent()}
                  variant="secondary"
                >
                  Lire
                </Button>
                <Button
                  className="h-11 px-4 text-sm"
                  iconLeft={<Eraser className="h-4 w-4" />}
                  onClick={clearMessage}
                  variant="ghost"
                >
                  Effacer
                </Button>
                <Button
                  className="h-11 px-4 text-sm"
                  disabled={isSending}
                  iconLeft={<Send className="h-4 w-4" />}
                  onClick={() => sendCurrentMessage()}
                >
                  {isSending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
