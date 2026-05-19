import React, { createContext, useContext, useState } from 'react';

const PhraseContext = createContext(null);

function toSentence(items) {
  if (!items.length) {
    return '';
  }

  const text = items
    .map(item => item.builderText || item.label.toLowerCase())
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) {
    return '';
  }

  const normalized = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

export function PhraseProvider({ children }) {
  const [items, setItems] = useState([]);

  function addPictogram(item) {
    setItems(current => [
      ...current,
      {
        id: `${item.id || item.key}-${Date.now()}`,
        sourceId: item.id || item.key,
        label: item.label,
        phrase: item.phrase,
        imageUrl: item.imageUrl,
        color: item.color,
        builderText: item.builderText || item.label.toLowerCase()
      }
    ]);
  }

  function removePictogram(itemId) {
    setItems(current => current.filter(item => item.id !== itemId));
  }

  function clearPhrase() {
    setItems([]);
  }

  return (
    <PhraseContext.Provider
      value={{
        addPictogram,
        clearPhrase,
        items,
        removePictogram,
        sentence: toSentence(items)
      }}
    >
      {children}
    </PhraseContext.Provider>
  );
}

export function usePhrase() {
  return useContext(PhraseContext);
}
