import { ComposerItem, Pictogram } from '../types/models';

function normalizeText(text: string): string {
  const compact = text.replace(/\s+/g, ' ').trim();

  if (!compact) {
    return '';
  }

  const firstLetter = compact.charAt(0).toUpperCase();
  const rest = compact.slice(1);
  const sentence = `${firstLetter}${rest}`;

  return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
}

export function buildSentenceFromItems(items: ComposerItem[]): string {
  return normalizeText(items.map(item => item.builderText || item.label).join(' '));
}

export function buildSentenceFromPictograms(pictograms: Pictogram[]): string {
  return normalizeText(
    pictograms.map(pictogram => pictogram.builderText || pictogram.label).join(' ')
  );
}
