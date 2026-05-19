import React from 'react';

const labelMap = {
  pending: 'En attente',
  seen: 'Vue',
  resolved: 'Resolue',
  active: 'Actif',
  inactive: 'Inactif',
  worker: 'Travailleur',
  supervisor: 'Encadrant'
};

function StatusBadge({ value }) {
  return (
    <span className={`status-badge status-badge--${value}`}>
      {labelMap[value] || value}
    </span>
  );
}

export default StatusBadge;
