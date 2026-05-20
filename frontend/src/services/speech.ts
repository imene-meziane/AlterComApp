export interface SpeechOptions {
  rate?: number;
  volume?: number;
}

function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  return (
    voices.find(voice => voice.lang.toLowerCase() === 'fr-fr') ||
    voices.find(voice => voice.lang.toLowerCase().startsWith('fr')) ||
    voices.find(voice =>
      `${voice.name} ${voice.lang}`.toLowerCase().includes('french')
    ) ||
    null
  );
}

function speakWithVoice(text: string, options: SpeechOptions): void {
  const synth = window.speechSynthesis;
  const utterance = new window.SpeechSynthesisUtterance(text);
  const frenchVoice = pickFrenchVoice(synth.getVoices());

  utterance.lang = frenchVoice?.lang || 'fr-FR';
  utterance.voice = frenchVoice || null;
  utterance.rate = options.rate ?? 0.95;
  utterance.volume = options.volume ?? 1;
  utterance.pitch = 1;

  synth.cancel();
  synth.speak(utterance);
}

export function speakText(text: string, options: SpeechOptions = {}): void {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  try {
    const synth = window.speechSynthesis;

    if (synth.getVoices().length) {
      speakWithVoice(text, options);
      return;
    }

    let fallbackTimeout = 0;
    const handleVoicesChanged = () => {
      synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
      window.clearTimeout(fallbackTimeout);
      speakWithVoice(text, options);
    };

    fallbackTimeout = window.setTimeout(() => {
      synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
      speakWithVoice(text, options);
    }, 250);

    synth.addEventListener?.('voiceschanged', handleVoicesChanged);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug('[speech] lecture vocale indisponible', error);
    }
  }
}
