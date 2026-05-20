function pickFrenchVoice(voices) {
  return (
    voices.find(voice => voice.lang.toLowerCase() === 'fr-fr') ||
    voices.find(voice => voice.lang.toLowerCase().startsWith('fr')) ||
    voices.find(voice => `${voice.name} ${voice.lang}`.toLowerCase().includes('french')) ||
    null
  );
}

function speakWithVoice(text) {
  const synth = window.speechSynthesis;
  const utterance = new window.SpeechSynthesisUtterance(text);
  const preferredVoice = pickFrenchVoice(synth.getVoices());

  utterance.lang = preferredVoice ? preferredVoice.lang : 'fr-FR';
  utterance.voice = preferredVoice || null;
  utterance.rate = 0.95;
  utterance.pitch = 1;

  synth.cancel();
  synth.speak(utterance);
}

export function speakText(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  const synth = window.speechSynthesis;

  if (synth.getVoices().length) {
    speakWithVoice(text);
    return;
  }

  let fallbackTimeout = 0;
  const handleVoicesChanged = () => {
    synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
    window.clearTimeout(fallbackTimeout);
    speakWithVoice(text);
  };

  fallbackTimeout = window.setTimeout(() => {
    synth.removeEventListener?.('voiceschanged', handleVoicesChanged);
    speakWithVoice(text);
  }, 250);

  synth.addEventListener?.('voiceschanged', handleVoicesChanged);
}
