import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { cn } from '../lib/cn';
import { useAuth } from '../providers/AuthProvider';
import { useComposer } from '../providers/ComposerProvider';
import { workerNavigation } from '../theme/navigation';
import { AvatarBubble } from './ui/AvatarBubble';
import { Badge } from './ui/Badge';
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
  const currentWorkshop =
    typeof user.assignedWorkshop === 'object' && user.assignedWorkshop
      ? user.assignedWorkshop.name
      : 'Profil travailleur';

  return (
    <div className="relative min-h-screen">
      <div
        className={cn(
          'mx-auto grid min-h-screen max-w-[1600px] gap-5 px-4 pt-4 md:grid-cols-[18.5rem_minmax(0,1fr)] md:px-6',
          showComposerDock ? 'pb-28 md:pb-36 xl:pb-40' : 'pb-24 md:pb-24'
        )}
      >
        <aside className="hidden md:block">
          <div className="sticky top-4">
            <Card className="overflow-hidden p-4" tone="soft">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <img
                    alt="Logo AlterCom"
                    className="h-auto w-32"
                    src="/assets/logo/altercom-logo.png"
                  />
                  <Badge>ESAT</Badge>
                </div>

                <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(79,140,255,0.10),rgba(255,255,255,0.94),rgba(124,198,166,0.12))] p-3.5 ring-1 ring-white/70">
                  <div className="flex items-center gap-3">
                    <AvatarBubble initials={initials} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-ink">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-bold text-muted">
                        {currentWorkshop}
                      </p>
                      <div className="mt-2 inline-flex items-center rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-brand ring-1 ring-blue-100">
                        {user.preferences.displayMode === 'simplified'
                          ? 'Mode simplifié'
                          : 'Mode complet'}
                      </div>
                    </div>
                  </div>
                </div>

                <nav className="space-y-1.5" aria-label="Navigation travailleur">
                  {workerNavigation.map(item => {
                    const Icon = item.icon;

                    return (
                      <NavLink
                        end={item.to === '/worker'}
                        className={({ isActive }) =>
                          cn(
                            'group flex items-center gap-3 rounded-[20px] px-3 py-2.5 text-sm font-extrabold transition',
                            isActive
                              ? 'bg-[linear-gradient(135deg,rgba(79,140,255,0.18),rgba(255,255,255,0.9))] text-ink shadow-soft ring-1 ring-brand/20'
                              : 'bg-white/80 text-ink ring-1 ring-slate-200/80 hover:bg-white'
                          )
                        }
                        key={item.to}
                        to={item.to}
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-[16px]',
                                isActive
                                  ? 'bg-white text-brand shadow-soft'
                                  : 'bg-sky text-brand'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>{item.label}</span>
                            {item.to === '/worker/message' && items.length ? (
                              <span className="ml-auto rounded-full bg-brand px-2.5 py-1 text-[11px] font-black text-white shadow-soft">
                                {items.length}
                              </span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </nav>

                <button
                  className="flex w-full items-center gap-3 rounded-[20px] px-3 py-2.5 text-left text-sm font-extrabold text-rose-600 ring-1 ring-rose-100 transition hover:bg-rose-50"
                  onClick={logout}
                  type="button"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-[16px] bg-rose-50">
                    <LogOut className="h-4 w-4" />
                  </span>
                  <span>Déconnexion</span>
                </button>
              </div>
            </Card>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-6 flex flex-col gap-4 md:pt-1">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <div className="flex min-w-0 items-center gap-3 rounded-[22px] bg-white/85 px-3 py-2 shadow-soft ring-1 ring-slate-200/80">
                <AvatarBubble initials={initials} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-ink">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="truncate text-xs font-bold text-muted">{currentWorkshop}</p>
                </div>
              </div>

              <button
                className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-white/90 text-rose-600 shadow-soft ring-1 ring-rose-100"
                onClick={logout}
                type="button"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <nav className="scrollbar-soft flex gap-3 overflow-x-auto md:hidden">
              {workerNavigation.map(item => {
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== '/worker' && location.pathname.startsWith(item.to));

                return (
                  <NavLink
                    className={cn(
                      'flex min-w-[6.75rem] shrink-0 flex-col items-center gap-2 rounded-[22px] px-3 py-2.5 text-center text-xs font-extrabold',
                      isActive
                        ? 'bg-[linear-gradient(135deg,rgba(79,140,255,0.18),rgba(255,255,255,0.94))] text-ink shadow-soft ring-1 ring-brand/20'
                        : 'bg-white/90 text-ink ring-1 ring-slate-200'
                    )}
                    key={item.to}
                    to={item.to}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-[16px]',
                        isActive ? 'bg-white text-brand shadow-soft' : 'bg-sky text-brand'
                      )}
                    >
                      <Icon className="h-4 w-4" />
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-ink">{notice.text}</p>
                    {notice.detail ? (
                      <p className="mt-1 text-sm font-bold text-muted">{notice.detail}</p>
                    ) : null}
                  </div>
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
