import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BellRing,
  LogOut,
  MessageCircleHeart,
  Palette,
  Volume2
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { cn } from '../lib/cn';
import { useAuth } from '../providers/AuthProvider';
import { useComposer } from '../providers/ComposerProvider';
import { workerNavigation } from '../theme/navigation';
import { AvatarBubble } from './ui/AvatarBubble';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ComposerDock } from './ComposerDock';
import { EmergencyButton } from './EmergencyButton';

export function WorkerShell(): React.ReactElement {
  const { logout, user } = useAuth();
  const { notice, dismissNotice, items } = useComposer();
  const location = useLocation();
  const showComposerDock = items.length > 0 && location.pathname !== '/worker/message';

  if (!user) {
    return <Outlet />;
  }

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="relative min-h-screen">
      <div
        className={cn(
          'mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 pt-4 md:grid-cols-[22rem_minmax(0,1fr)] md:px-6',
          showComposerDock ? 'pb-28 md:pb-36 xl:pb-40' : 'pb-24 md:pb-24'
        )}
      >
        <aside className="hidden md:block">
          <div className="sticky top-4 space-y-4">
            <Card className="overflow-hidden" tone="soft">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <img
                    alt="Logo AlterCom"
                    className="h-auto w-36"
                    src="/assets/logo/altercom-logo.png"
                  />
                  <Badge>ESAT</Badge>
                </div>

                <Card className="bg-[linear-gradient(180deg,rgba(79,140,255,0.10),rgba(124,198,166,0.08))] p-4" tone="soft">
                  <div className="flex items-start gap-4">
                    <AvatarBubble initials={initials} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-muted">Bienvenue</p>
                      <h2 className="text-xl font-black text-ink">
                        {user.firstName} {user.lastName}
                      </h2>
                      <div className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-brand ring-1 ring-blue-100">
                        {user.preferences.displayMode === 'simplified'
                          ? 'Mode simplifie'
                          : 'Mode complet'}
                      </div>
                    </div>
                  </div>
                </Card>

                <nav className="space-y-2" aria-label="Navigation travailleur">
                  {workerNavigation.map(item => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        end={item.to === '/worker'}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 rounded-[24px] px-4 py-3 text-base font-extrabold transition',
                            isActive
                              ? 'bg-[linear-gradient(135deg,rgba(79,140,255,0.18),rgba(255,255,255,0.9))] text-ink shadow-soft ring-1 ring-brand/20'
                              : 'bg-white/80 text-ink ring-1 ring-slate-200 hover:bg-white'
                          )
                        }
                        key={item.to}
                        to={item.to}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                'flex h-11 w-11 items-center justify-center rounded-[18px]',
                                isActive
                                  ? 'bg-white text-brand shadow-soft'
                                  : 'bg-sky text-brand'
                              )}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span>{item.label}</span>
                            {item.to === '/worker/message' && items.length ? (
                              <span className="ml-auto rounded-full bg-brand px-2.5 py-1 text-xs font-black text-white shadow-soft">
                                {items.length}
                              </span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>

                <div className="grid gap-3">
                  <Card className="space-y-3" tone="tinted">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-orange-50 text-orange-500">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-ink">Voix douce</p>
                        <p className="text-sm text-muted">Reglages memorises par profil.</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="space-y-3" tone="tinted">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-emerald-50 text-emerald-600">
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-ink">Repere visuel</p>
                        <p className="text-sm text-muted">Une couleur par univers de pictogrammes.</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Button iconLeft={<LogOut className="h-4 w-4" />} onClick={logout} variant="ghost">
                  Se deconnecter
                </Button>
              </div>
            </Card>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-6 flex flex-col gap-4 md:pt-1">
            <Card className="overflow-hidden px-5 py-4" tone="soft">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-12 w-12 items-center justify-center rounded-[20px] bg-sky text-brand">
                    <MessageCircleHeart className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-muted">
                      Communiquer simplement, ensemble.
                    </p>
                    <h1 className="text-2xl font-black text-ink">
                      Une interface calme, tactile et rassurante.
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <Badge>{user.assignedWorkshop?.name || 'Sans atelier'}</Badge>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-muted ring-1 ring-slate-200">
                    <BellRing className="h-4 w-4 text-brand" />
                    Acces rapide
                  </div>
                </div>
              </div>
            </Card>

            <nav className="scrollbar-soft flex gap-3 overflow-x-auto md:hidden">
              {workerNavigation.map(item => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/worker' && location.pathname.startsWith(item.to));

                return (
                  <NavLink
                    className={cn(
                      'flex min-w-[7.25rem] shrink-0 flex-col items-center gap-2 rounded-[24px] px-4 py-3 text-center text-sm font-extrabold',
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(79,140,255,0.18),rgba(255,255,255,0.94))] text-ink shadow-soft ring-1 ring-brand/20'
                        : 'bg-white/90 text-ink ring-1 ring-slate-200'
                    )}
                    key={item.to}
                    to={item.to}
                  >
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-[16px]',
                        isActive ? 'bg-white text-brand shadow-soft' : 'bg-sky text-brand'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            <AnimatePresence>
              {notice ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex items-center justify-between gap-4 rounded-[24px] px-5 py-4 shadow-soft ring-1',
                    notice.tone === 'success'
                      ? 'bg-white text-ink ring-emerald-200'
                      : 'bg-white text-ink ring-rose-200'
                  )}
                  exit={{ opacity: 0, y: -10 }}
                  initial={{ opacity: 0, y: -10 }}
                >
                  <p className="text-sm font-bold text-muted">{notice.text}</p>
                  <button
                    className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-extrabold text-ink transition hover:bg-slate-100"
                    onClick={dismissNotice}
                    type="button"
                  >
                    Fermer
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </header>

          <main>
            <Outlet />
          </main>
        </div>
      </div>

      <ComposerDock />
      <EmergencyButton />
    </div>
  );
}
