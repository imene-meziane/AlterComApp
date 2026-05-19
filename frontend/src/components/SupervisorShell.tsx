import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Sparkles } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { cn } from '../lib/cn';
import { useAuth } from '../providers/AuthProvider';
import { supervisorNavigation } from '../theme/navigation';
import { AvatarBubble } from './ui/AvatarBubble';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

export function SupervisorShell(): React.ReactElement {
  const { logout, user } = useAuth();

  if (!user) {
    return <Outlet />;
  }

  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 md:grid-cols-[22rem_minmax(0,1fr)] md:px-6">
        <aside>
          <div className="sticky top-4 space-y-4">
            <Card className="space-y-5" tone="soft">
              <div className="flex items-center justify-between">
                <img
                  alt="Logo AlterCom"
                  className="h-auto w-36"
                  src="/assets/logo/altercom-logo.png"
                />
                <Badge>Encadrant</Badge>
              </div>

              <Card className="bg-[linear-gradient(180deg,rgba(79,140,255,0.10),rgba(124,198,166,0.08))] p-4" tone="soft">
                <div className="flex items-start gap-4">
                  <AvatarBubble initials={initials} />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-muted">Piloter l accompagnement</p>
                    <h2 className="text-xl font-black text-ink">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-sm leading-6 text-muted">
                      Une gestion plus professionnelle, mais toujours humaine et rassurante.
                    </p>
                  </div>
                </div>
              </Card>

              <nav className="space-y-2" aria-label="Navigation encadrant">
                {supervisorNavigation.map(item => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-[24px] px-4 py-3 text-base font-extrabold transition',
                          isActive
                            ? 'bg-ink text-white shadow-soft'
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
                              isActive ? 'bg-white/15' : 'bg-sky text-brand'
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </span>
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>

              <motion.div
                animate={{ y: [0, -5, 0] }}
                className="rounded-[28px] bg-[linear-gradient(180deg,rgba(255,184,107,0.16),rgba(255,255,255,0.84))] p-4"
                transition={{ duration: 5, repeat: Infinity }}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[18px] bg-white text-orange-500 shadow-soft">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="text-base font-black text-ink">Espace de suivi harmonise</p>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Pictogrammes, ateliers, profils et historique gardent la meme identite
                  inclusive.
                </p>
              </motion.div>

              <Button iconLeft={<LogOut className="h-4 w-4" />} onClick={logout} variant="ghost">
                Se deconnecter
              </Button>
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
