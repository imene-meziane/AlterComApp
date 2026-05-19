import React from 'react';
import { motion } from 'framer-motion';
import { Siren } from 'lucide-react';

import { useComposer } from '../providers/ComposerProvider';

export function EmergencyButton(): React.ReactElement {
  const { isSending, triggerEmergency } = useComposer();

  return (
    <motion.button
      animate={{ scale: [1, 1.04, 1] }}
      className="fixed bottom-6 right-5 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-danger text-white shadow-[0_24px_50px_rgba(255,123,123,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-danger/30"
      onClick={() => triggerEmergency()}
      transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      type="button"
      whileTap={{ scale: 0.96 }}
    >
      <div className="relative flex items-center justify-center">
        <Siren className="h-7 w-7" />
        {!isSending ? (
          <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-danger shadow-soft">
            Urgence
          </span>
        ) : null}
      </div>
    </motion.button>
  );
}
