function toPlainObject(source) {
  if (!source) {
    return null;
  }

  return typeof source.toJSON === 'function' ? source.toJSON() : { ...source };
}

function getWorkerId(worker) {
  if (!worker) {
    return null;
  }

  if (typeof worker === 'string') {
    return worker;
  }

  return worker.id || worker._id?.toString() || null;
}

function getWorkerName(worker) {
  if (!worker || typeof worker === 'string') {
    return '';
  }

  return [worker.firstName, worker.lastName].filter(Boolean).join(' ').trim();
}

function normalizePictograms(items = []) {
  return items.map(item => {
    const pictogram =
      item?.pictogram && typeof item.pictogram === 'object' ? item.pictogram : null;

    return {
      id: pictogram?.id || pictogram?._id?.toString() || (typeof item?.pictogram === 'string' ? item.pictogram : null),
      key: pictogram?.key || '',
      label: item?.label || pictogram?.label || '',
      imageUrl: item?.imageUrl || pictogram?.imageUrl || '',
      color: item?.color || pictogram?.color || '#88a9d5',
      builderText: item?.builderText || pictogram?.builderText || ''
    };
  });
}

function normalizeMessageForClient(message, overrides = {}) {
  const source = toPlainObject(message);

  if (!source) {
    return null;
  }

  const worker = overrides.worker || source.worker || null;
  const workshop = overrides.workshop || source.workshop || null;
  const items = Array.isArray(source.items) ? source.items : [];

  return {
    ...source,
    worker,
    workshop,
    workerId: getWorkerId(worker),
    workerName: getWorkerName(worker),
    pictograms: normalizePictograms(items),
    status: source.status || 'sent'
  };
}

module.exports = {
  normalizeMessageForClient
};

