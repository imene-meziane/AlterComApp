function normalizeSentence(text) {
  const compact = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!compact) {
    return '';
  }

  const capitalized = compact.charAt(0).toUpperCase() + compact.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}

function buildSentenceFromPictograms(pictograms = []) {
  return normalizeSentence(
    pictograms
      .map(pictogram => pictogram.builderText || pictogram.spokenText || pictogram.label)
      .filter(Boolean)
      .join(' ')
  );
}

module.exports = {
  buildSentenceFromPictograms,
  normalizeSentence
};
