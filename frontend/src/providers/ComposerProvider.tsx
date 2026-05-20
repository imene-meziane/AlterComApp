import React, { createContext, useContext, useEffect, useState } from 'react';

import { api } from '../services/api';
import { speakText, SpeechOptions } from '../services/speech';
import { buildSentenceFromItems } from '../utils/sentence';
import { useAuth } from './AuthProvider';
import {
  ComposerItem,
  Message,
  MessageCreateResponse,
  NoticeState,
  Pictogram
} from '../types/models';

interface ComposerContextValue {
  items: ComposerItem[];
  sentence: string;
  selectedPictograms: ComposerItem[];
  generatedText: string;
  notice: NoticeState | null;
  isSending: boolean;
  addPictogram: (pictogram: Pictogram) => void;
  addPictogramToMessage: (pictogram: Pictogram) => void;
  removePictogram: (clientId: string) => void;
  removePictogramFromMessage: (clientId: string) => void;
  clearMessage: () => void;
  dismissNotice: () => void;
  speakCurrent: (options?: SpeechOptions) => void;
  speakMessage: (options?: SpeechOptions) => void;
  sendCurrentMessage: (options?: SpeechOptions) => Promise<Message | null>;
  sendMessage: (options?: SpeechOptions) => Promise<Message | null>;
  triggerEmergency: (options?: SpeechOptions) => Promise<Message | null>;
}

const ComposerContext = createContext<ComposerContextValue | null>(null);

function getAssignedWorkshopId(assignedWorkshop: unknown): string | null {
  if (!assignedWorkshop) {
    return null;
  }

  if (typeof assignedWorkshop === 'string') {
    return assignedWorkshop;
  }

  if (typeof assignedWorkshop === 'object') {
    const workshop = assignedWorkshop as Record<string, unknown>;
    const id = workshop.id;

    if (typeof id === 'string') {
      return id;
    }
  }

  return null;
}

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
      setNotice({
        tone: 'error',
        text: "Choisis une image d'abord."
      });
      return;
    }

    speakText(sentence, {
      rate: options?.rate ?? user?.preferences.speechRate,
      volume: options?.volume ?? user?.preferences.speechVolume
    });
  }

  async function sendCurrentMessage(options?: SpeechOptions): Promise<Message | null> {
    if (!token || user?.role !== 'worker') {
      return null;
    }

    if (isSending) {
      return null;
    }

    if (!items.length || !sentence) {
      setNotice({
        tone: 'error',
        text: "Choisis une image d'abord."
      });
      return null;
    }

    try {
      setIsSending(true);
      const speechRate = options?.rate ?? user.preferences.speechRate;
      const speechVolume = options?.volume ?? user.preferences.speechVolume;
      const response = await api.post<MessageCreateResponse>(
        '/messages',
        {
          workerId: user.id,
          workerName: `${user.firstName} ${user.lastName}`.trim(),
          pictogramIds: items.map(item => item.sourceId),
          pictograms: items.map(item => ({
            id: item.sourceId,
            sourceId: item.sourceId,
            label: item.label,
            builderText: item.builderText,
            imageUrl: item.imageUrl,
            color: item.color
          })),
          text: sentence,
          speechRate,
          speechVolume,
          workshopId: getAssignedWorkshopId(user.assignedWorkshop)
        },
        token
      );
      const message = response.message;

      clearMessage();
      setNotice({
        tone: 'success',
        text: 'Ton message est envoyé.',
        detail: message.text
      });
      speakText(message.text, {
        rate: message.speechRate,
        volume: message.speechVolume
      });

      return message;
    } catch (error) {
      setNotice({
        tone: 'error',
        text: "Le message n'a pas été envoyé.",
        detail: error instanceof Error ? error.message : undefined
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

    if (isSending) {
      return null;
    }

    try {
      setIsSending(true);
      const speechRate = options?.rate ?? user.preferences.speechRate;
      const speechVolume = options?.volume ?? user.preferences.speechVolume;
      const response = await api.post<MessageCreateResponse>(
        '/messages/emergency',
        {
          text: "J'ai besoin d'aide.",
          speechRate,
          speechVolume
        },
        token
      );
      const message = response.message;

      speakText(message.text, {
        rate: message.speechRate,
        volume: message.speechVolume
      });
      setNotice({
        tone: 'success',
        text: "Demande d'aide envoyée.",
        detail: message.text
      });

      return message;
    } catch (error) {
      setNotice({
        tone: 'error',
        text: "La demande d'aide n'a pas été envoyée.",
        detail: error instanceof Error ? error.message : undefined
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
        selectedPictograms: items,
        generatedText: sentence,
        notice,
        isSending,
        addPictogram,
        addPictogramToMessage: addPictogram,
        removePictogram,
        removePictogramFromMessage: removePictogram,
        clearMessage,
        dismissNotice,
        speakCurrent,
        speakMessage: speakCurrent,
        sendCurrentMessage,
        sendMessage: sendCurrentMessage,
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
