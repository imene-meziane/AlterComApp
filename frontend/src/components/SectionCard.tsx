import React from 'react';

export function SectionCard({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}): React.ReactElement {
  return <section className={`section-card ${className}`.trim()}>{children}</section>;
}
