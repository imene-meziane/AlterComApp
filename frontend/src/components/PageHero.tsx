import React from 'react';

export function PageHero({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}): React.ReactElement {
  return (
    <header className="page-hero">
      <div>
        <p className="page-hero__eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="page-hero__description">{description}</p>
      </div>

      {actions ? <div className="page-hero__actions">{actions}</div> : null}
    </header>
  );
}
