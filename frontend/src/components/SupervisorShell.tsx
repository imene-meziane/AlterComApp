import React from 'react';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '../lib/cn';
import { useAuth } from '../providers/AuthProvider';
import { supervisorNavigation } from '../theme/navigation';
import { AvatarBubble } from './ui/AvatarBubble';
import { Badge } from './ui/Badge';
import { Card } from './ui/Card';

export function SupervisorShell(): React.ReactElement {
  const { logout, user } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-5 px-4 py-4 md:grid-cols-[18.5rem_minmax(0,1fr)] md:px-6">
        <aside>
          <div className="sticky top-4">
            <Card className="space-y-4 p-4" tone="soft">
              <div className="flex items-center justify-between">
                <img
                  alt="Logo AlterCom"
                  className="h-auto w-32"
                  src="/assets/logo/altercom-logo.png"
                />
                <Badge>Encadrant</Badge>
              </div>

              <div className="rounded-[24px] bg-[linear-gradient(135deg,rgba(79,140,255,0.10),rgba(255,255,255,0.94),rgba(124,198,166,0.10))] p-3.5 ring-1 ring-white/70">
                <div className="flex items-center gap-3">
                  <AvatarBubble className="h-12 w-12 rounded-[18px] text-base" initials={initials} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-ink">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs font-bold text-muted">Encadrant</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1.5" aria-label="Navigation encadrant">
                {supervisorNavigation.map(item => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      end={item.to === '/supervisor'}
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
                              isActive ? 'bg-white text-brand shadow-soft' : 'bg-sky text-brand'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <span>{item.label}</span>
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
            </Card>
          </div>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
