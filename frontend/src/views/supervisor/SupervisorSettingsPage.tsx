import React from 'react';
import { LogOut, ShieldCheck, UserCog2 } from 'lucide-react';

import { ScreenLoader } from '../../components/ScreenLoader';
import { AvatarBubble } from '../../components/ui/AvatarBubble';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { useAuth } from '../../providers/AuthProvider';

export function SupervisorSettingsPage(): React.ReactElement {
  const { logout, user } = useAuth();

  if (!user) {
    return <ScreenLoader message="Préparation des réglages..." />;
  }

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-8 pb-10">
      <SectionHeader
        description="Les informations utiles de ton compte encadrant restent regroupées ici."
        eyebrow="Réglages"
        title="Compte encadrant"
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="space-y-5" tone="soft">
          <div className="flex items-center gap-4">
            <AvatarBubble initials={initials} />
            <div>
              <Badge>Compte</Badge>
              <p className="mt-2 text-2xl font-black text-ink">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                Rôle
              </p>
              <p className="mt-2 text-base font-black text-ink">Encadrant</p>
            </div>

            <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">
                E-mail
              </p>
              <p className="mt-2 text-base font-black text-ink">{user.email}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-5" tone="soft">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <Badge>Session</Badge>
              <p className="mt-2 text-xl font-black text-ink">Accès et sécurité</p>
            </div>
          </div>

          <div className="rounded-[24px] bg-white/90 p-4 ring-1 ring-slate-200/80">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[16px] bg-sky text-brand">
                <UserCog2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-black text-ink">Session active</p>
                <p className="mt-1 text-sm font-bold text-muted">
                  Tu peux fermer la session depuis cette page.
                </p>
              </div>
            </div>
          </div>

          <Button iconLeft={<LogOut className="h-4 w-4" />} onClick={logout} variant="danger">
            Déconnexion
          </Button>
        </Card>
      </div>
    </div>
  );
}
