export function speakText(text) {
  if (!text || typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  const utterance = new window.SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(voice => voice.lang.startsWith('fr'));

  utterance.lang = preferredVoice ? preferredVoice.lang : 'fr-FR';
  utterance.voice = preferredVoice || null;
  utterance.rate = 0.95;
  utterance.pitch = 1;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
