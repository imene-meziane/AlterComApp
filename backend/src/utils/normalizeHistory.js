const { normalizeMessageForClient } = require('./normalizeMessage');

function toPlainObject(source) {
  if (!source) {
    return null;
  }

  return typeof source.toJSON === 'function' ? source.toJSON() : { ...source };
}

function normalizeHistoryEntryForClient(entry) {
  const source = toPlainObject(entry);

  if (!source) {
    return null;
  }

  const workerName =
    source.worker && typeof source.worker !== 'string'
      ? [source.worker.firstName, source.worker.lastName].filter(Boolean).join(' ').trim()
      : '';

  return {
    ...source,
    workerName,
    status:
      source.message && typeof source.message === 'object'
        ? source.message.status || 'sent'
        : source.channel === 'routine'
          ? 'completed'
          : 'sent',
    message:
      source.message && typeof source.message === 'object'
        ? normalizeMessageForClient(source.message, {
            worker: source.worker,
            workshop: source.workshop
          })
        : null
  };
}

module.exports = {
  normalizeHistoryEntryForClient
};
