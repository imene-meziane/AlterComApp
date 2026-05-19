import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card } from '../../components/ui/Card';

export function NotFoundPage(): React.ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <Card className="max-w-xl space-y-6 text-center" tone="soft">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[30px] bg-sky text-brand">
          <Compass className="h-10 w-10" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-ink">Cette page n existe pas.</h1>
          <p className="text-lg leading-8 text-muted">
            Retourne vers AlterCom pour retrouver le bon parcours.
          </p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-5 text-base font-bold text-white shadow-float transition hover:bg-blue-500"
          to="/"
        >
          Revenir a l accueil
        </Link>
      </Card>
    </div>
  );
}
