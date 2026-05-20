import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Save, Send, Volume2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';
import { useComposer } from '../../providers/ComposerProvider';
import { api } from '../../services/api';
import { Favorite, Message } from '../../types/models';

export function MessagePage(): React.ReactElement {
  const { token } = useAuth();
  const {
    items,
    sentence,
    isSending,
    removePictogram,
    clearMessage,
    speakCurrent,
    sendCurrentMessage
  } = useComposer();
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSavingFavorite, setIsSavingFavorite] = useState(false);

  useEffect(() => {
    api
      .get<Message[]>('/messages/mine', token)
      .then(setMessages)
      .finally(() => setLoading(false));
  }, [token]);

  async function saveFavoritePhrase(): Promise<void> {
    if (!sentence || !items.length) {
      return;
    }

    setIsSavingFavorite(true);
    setFeedback('');

    try {
      await api.post<Favorite>(
        '/favorites',
        {
          kind: 'phrase',
          title: sentence,
          text: sentence,
          pictogramIds: items.map(item => item.sourceId)
        },
        token
      );
      setFeedback('Phrase ajoutee aux favoris.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Favori impossible.');
    } finally {
      setIsSavingFavorite(false);
    }
  }

  async function handleSend(): Promise<void> {
    const message = await sendCurrentMessage();

    if (!message) {
      return;
    }

    setMessages(current => [message, ...current]);
    setFeedback('Message envoye et lu a voix haute.');
  }

  if (loading) {
    return <ScreenLoader message="Preparation de ton message..." />;
  }

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Assemble les pictogrammes, ecoute la phrase et envoie le message sans distraction."
        eyebrow="Mon message"
        title="Construire une phrase claire"
      />

      <Card className="space-y-5 overflow-hidden p-0" tone="soft">
        <div className="bg-[linear-gradient(180deg,rgba(79,140,255,0.08),rgba(255,255,255,0))] p-6">
          <div className="space-y-3">
            <Badge>Phrase en cours</Badge>
            <h2 className="text-3xl font-black text-ink">
              {sentence || 'Aucune phrase pour le moment.'}
            </h2>
            <p className="text-base leading-8 text-muted">
              Appuie sur une bulle pour retirer un pictogramme de la phrase.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {items.length ? (
              items.map((item, index) => (
                <motion.button
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-soft ring-1 ring-slate-200"
                  initial={{ opacity: 0, scale: 0.92 }}
                  key={item.clientId}
                  layout
                  onClick={() => removePictogram(item.clientId)}
                  type="button"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky text-xs font-black text-brand">
                    {index + 1}
                  </span>
                  <img
                    alt=""
                    className="h-10 w-10 rounded-2xl bg-slate-50 p-1.5"
                    src={item.imageUrl}
                  />
                  <span className="text-sm font-extrabold text-ink">{item.label}</span>
                </motion.button>
              ))
            ) : (
              <EmptyState
                description="Ajoute des pictogrammes depuis la page pictogrammes, emotions ou ton atelier."
                title="Le message est vide"
              />
            )}
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-100 p-6 md:grid-cols-2 xl:grid-cols-4">
          <Button
            iconLeft={<Volume2 className="h-4 w-4" />}
            onClick={() => speakCurrent()}
            variant="secondary"
          >
            Lire
          </Button>
          <Button iconLeft={<Eraser className="h-4 w-4" />} onClick={clearMessage} variant="ghost">
            Effacer
          </Button>
          <Button
            disabled={!items.length || isSavingFavorite}
            iconLeft={<Save className="h-4 w-4" />}
            onClick={saveFavoritePhrase}
            variant="ghost"
          >
            {isSavingFavorite ? 'Sauvegarde...' : 'Favori'}
          </Button>
          <Button
            disabled={!items.length || isSending}
            iconLeft={<Send className="h-4 w-4" />}
            onClick={handleSend}
          >
            {isSending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </div>
      </Card>

      {feedback ? (
        <Card className="text-sm font-bold text-muted" tone="soft">
          {feedback}
        </Card>
      ) : null}

      {messages.length ? (
        <section className="space-y-4">
          <div>
            <Badge>Historique recent</Badge>
            <p className="mt-3 text-2xl font-black text-ink">Tes derniers messages</p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {messages.slice(0, 3).map(message => (
              <Card className="space-y-3" key={message.id} tone="soft">
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
