export interface SpeechOptions {
  rate?: number;
  volume?: number;
}

export function speakText(text: string, options: SpeechOptions = {}): void {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('fr'));

  utterance.lang = frenchVoice?.lang || 'fr-FR';
  utterance.voice = frenchVoice || null;
  utterance.rate = options.rate ?? 0.95;
  utterance.volume = options.volume ?? 1;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
