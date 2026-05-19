import React, { createContext, useContext, useEffect, useState } from 'react';

import { api } from '../services/api';
import { speakText, SpeechOptions } from '../services/speech';
import { buildSentenceFromItems } from '../utils/sentence';
import { useAuth } from './AuthProvider';
import {
  ComposerItem,
  Message,
  NoticeState,
  Pictogram
} from '../types/models';

interface ComposerContextValue {
  items: ComposerItem[];
  sentence: string;
  notice: NoticeState | null;
  isSending: boolean;
  addPictogram: (pictogram: Pictogram) => void;
  removePictogram: (clientId: string) => void;
  clearMessage: () => void;
  dismissNotice: () => void;
  speakCurrent: (options?: SpeechOptions) => void;
  sendCurrentMessage: (options?: SpeechOptions) => Promise<Message | null>;
  triggerEmergency: (options?: SpeechOptions) => Promise<Message | null>;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

export function ComposerProvider({
  children
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { token, user } = useAuth();
  const [items, setItems] = useState<ComposerItem[]>([]);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [isSending, setIsSending] = useState(false);
  const sentence = buildSentenceFromItems(items);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setNotice(null);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, [notice]);

  function addPictogram(pictogram: Pictogram): void {
    setItems(current => [
      ...current,
      {
        clientId: `${pictogram.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        sourceId: pictogram.id,
        label: pictogram.label,
        builderText: pictogram.builderText || pictogram.label.toLowerCase(),
        imageUrl: pictogram.imageUrl,
        color: pictogram.color
      }
    ]);

    speakText(pictogram.spokenText || pictogram.phrase, {
      rate: user?.preferences.speechRate,
      volume: user?.preferences.speechVolume
    });
  }

  function removePictogram(clientId: string): void {
    setItems(current => current.filter(item => item.clientId !== clientId));
  }

  function clearMessage(): void {
    setItems([]);
  }

  function dismissNotice(): void {
    setNotice(null);
  }

  function speakCurrent(options?: SpeechOptions): void {
    if (!sentence) {
      return;
    }

    speakText(sentence, {
      rate: options?.rate ?? user?.preferences.speechRate,
      volume: options?.volume ?? user?.preferences.speechVolume
    });
  }

  async function sendCurrentMessage(options?: SpeechOptions): Promise<Message | null> {
    if (!token || user?.role !== 'worker' || !items.length) {
      return null;
    }

    try {
      setIsSending(true);
      const speechRate = options?.rate ?? user.preferences.speechRate;
      const speechVolume = options?.volume ?? user.preferences.speechVolume;
      const message = await api.post<Message>(
        '/messages',
        {
          pictogramIds: items.map(item => item.sourceId),
          speechRate,
          speechVolume,
          workshopId: user.assignedWorkshop?.id || null
        },
        token
      );

      speakText(message.text, {
        rate: message.speechRate,
        volume: message.speechVolume
      });
      clearMessage();
      setNotice({
        tone: 'success',
        text: 'Message envoye et lu a voix haute.'
      });

      return message;
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Envoi impossible.'
      });
      return null;
    } finally {
      setIsSending(false);
    }
  }

  async function triggerEmergency(options?: SpeechOptions): Promise<Message | null> {
    if (!token || user?.role !== 'worker') {
      return null;
    }

    try {
      setIsSending(true);
      const speechRate = options?.rate ?? user.preferences.speechRate;
      const speechVolume = options?.volume ?? user.preferences.speechVolume;
      const message = await api.post<Message>(
        '/messages/emergency',
        {
          text: "J'ai besoin d'aide.",
          speechRate,
          speechVolume
        },
        token
      );

      speakText(message.text, {
        rate: message.speechRate,
        volume: message.speechVolume
      });
      setNotice({
        tone: 'success',
        text: 'Demande d aide envoyee.'
      });

      return message;
    } catch (error) {
      setNotice({
        tone: 'error',
        text: error instanceof Error ? error.message : 'Urgence impossible.'
      });
      return null;
    } finally {
      setIsSending(false);
    }
  }

  return (
    <ComposerContext.Provider
      value={{
        items,
        sentence,
        notice,
        isSending,
        addPictogram,
        removePictogram,
        clearMessage,
        dismissNotice,
        speakCurrent,
        sendCurrentMessage,
        triggerEmergency
      }}
    >
      {children}
    </ComposerContext.Provider>
  );
}

export function useComposer(): ComposerContextValue {
  const context = useContext(ComposerContext);

  if (!context) {
    throw new Error('useComposer doit etre utilise dans ComposerProvider.');
  }

  return context;
}
