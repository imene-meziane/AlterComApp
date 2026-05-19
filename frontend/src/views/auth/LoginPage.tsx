import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, ShieldCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';

import { AppIllustration } from '../../components/ui/AppIllustration';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../providers/AuthProvider';

const demoAccounts = {
  supervisor: [
    {
      label: 'Claire Martin',
      email: 'claire.martin@alterego.fr',
      password: 'AlterCom123!'
    },
    {
      label: 'Hugo Leroux',
      email: 'hugo.leroux@alterego.fr',
      password: 'AlterCom123!'
    }
  ],
  worker: [
    {
      label: 'Sarah Brunet',
      email: 'sarah.brunet@alterego.fr',
      password: 'AlterCom123!'
    },
    {
      label: 'Malik Bensaid',
      email: 'malik.bensaid@alterego.fr',
      password: 'AlterCom123!'
    }
  ]
} as const;

type RolePreview = keyof typeof demoAccounts;
type AuthMode = 'login' | 'register';
type LoginForm = {
  email: string;
  password: string;
};
type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const roleContent: Record<
  RolePreview,
  {
    title: string;
    description: string;
    icon: typeof HeartHandshake;
    tone: string;
    iconTone: string;
  }
> = {
  worker: {
    title: 'Espace travailleur',
    description: 'Utiliser les pictogrammes pour communiquer.',
    icon: HeartHandshake,
    tone: 'border-brand/30 bg-white/92 shadow-float',
    iconTone: 'bg-sky text-brand'
  },
  supervisor: {
    title: 'Espace encadrant',
    description: 'Gerer les ateliers et accompagner les parcours.',
    icon: ShieldCheck,
    tone: 'border-mint/40 bg-white/92 shadow-[0_20px_44px_rgba(124,198,166,0.12)]',
    iconTone: 'bg-emerald-50 text-emerald-600'
  }
};

function getInitials(label: string): string {
  return label
    .split(' ')
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

export function LoginPage(): React.ReactElement {
  const { login, registerSupervisor, user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rolePreview, setRolePreview] = useState<RolePreview>('worker');
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: demoAccounts.worker[0].email,
    password: demoAccounts.worker[0].password
  });
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && user) {
    return <Navigate replace to={user.role === 'supervisor' ? '/supervisor' : '/worker'} />;
  }

  function selectRole(role: RolePreview): void {
    setAuthMode('login');
    setRolePreview(role);
    setLoginForm({
      email: demoAccounts[role][0].email,
      password: demoAccounts[role][0].password
    });
  }

  function handleLoginChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setLoginForm(current => ({
      ...current,
      [name]: value
    }));
  }

  function handleRegisterChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setRegisterForm(current => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (authMode === 'register') {
        await registerSupervisor(registerForm);
      } else {
        await login(loginForm.email, loginForm.password);
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Connexion impossible.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-7rem] top-[-7rem] h-72 w-72 rounded-full bg-brand/12 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/3 h-80 w-80 rounded-full bg-peach/10 blur-3xl" />
        <div className="absolute right-[-5rem] top-16 h-72 w-72 rounded-full bg-mint/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-[1640px] gap-4 px-4 py-4 lg:grid-cols-[1.65fr_1fr] lg:px-6 lg:py-6">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="relative flex min-h-[36rem] flex-col overflow-hidden rounded-[2.7rem] bg-[linear-gradient(180deg,rgba(255,253,248,0.94),rgba(247,244,239,0.92))] px-7 py-7 shadow-soft ring-1 ring-white/70 sm:px-10 sm:py-10 xl:px-14 xl:py-12"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.7 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(79,140,255,0.08),transparent_22rem),radial-gradient(circle_at_85%_20%,rgba(124,198,166,0.08),transparent_18rem),linear-gradient(135deg,rgba(255,255,255,0.26),rgba(255,255,255,0))]" />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.08, duration: 0.55 }}
          >
            <img
              alt="Logo AlterCom"
              className="h-auto w-36 opacity-90 sm:w-40"
              src="/assets/logo/altercom-logo.png"
            />
          </motion.div>

          <div className="relative flex flex-1 items-center">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[35rem] space-y-6"
              initial={{ opacity: 0, y: 18 }}
              transition={{ delay: 0.16, duration: 0.65 }}
            >
              <h1 className="font-display text-[3.35rem] font-semibold leading-[1.02] tracking-[-0.04em] text-ink sm:text-[4.4rem] xl:text-[5.4rem]">
                Communiquer
                <br />
                simplement,
                <br />
                ensemble.
              </h1>

              <p className="max-w-md text-lg leading-8 text-muted xl:text-[1.16rem]">
                Une application pensee pour accompagner les travailleurs de l ESAT
                Alter Ego.
              </p>

              <p className="text-sm font-bold tracking-[0.08em] text-muted/85">
                Pictogrammes • Voix • Ateliers ESAT
              </p>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 xl:block 2xl:right-8"
              initial={{ opacity: 0, x: 16 }}
              transition={{ delay: 0.22, duration: 0.7 }}
            >
              <AppIllustration />
            </motion.div>
          </div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex justify-center xl:hidden"
            initial={{ opacity: 0, y: 12 }}
            transition={{ delay: 0.24, duration: 0.6 }}
          >
            <AppIllustration />
          </motion.div>
        </motion.section>

        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="relative flex overflow-hidden rounded-[2.7rem] bg-white/62 shadow-panel ring-1 ring-white/75 backdrop-blur-2xl"
          initial={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.7, delay: 0.08 }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.42))]" />
          <div className="absolute inset-y-0 left-0 hidden w-px bg-white/70 lg:block" />

          <div className="relative flex w-full items-center px-6 py-8 sm:px-8 sm:py-10 xl:px-10">
            <div className="mx-auto flex w-full max-w-[26rem] flex-col gap-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-muted">
                      {authMode === 'register' ? 'Inscription' : 'Connexion'}
                    </p>
                    <h2 className="font-display text-4xl font-semibold tracking-[-0.03em] text-ink">
                      {authMode === 'register' ? 'Creer un espace encadrant' : 'Bienvenue'}
                    </h2>
                  </div>
                  <button
                    className="text-sm font-bold text-brand"
                    onClick={() => {
                      setAuthMode(current => (current === 'login' ? 'register' : 'login'));
                      setError('');
                    }}
                    type="button"
                  >
                    {authMode === 'register' ? 'J ai deja un compte' : 'Creer un compte'}
                  </button>
                </div>
                <p className="text-base leading-7 text-muted">
                  {authMode === 'register'
                    ? 'L espace cree sera encadrant. Les profils travailleurs seront ajoutes ensuite.'
                    : 'Choisissez votre espace'}
                </p>
              </div>

              {authMode === 'login' ? (
                <div className="grid gap-3">
                  {(['worker', 'supervisor'] as RolePreview[]).map(role => {
                    const option = roleContent[role];
                    const Icon = option.icon;
                    const isActive = rolePreview === role;

                    return (
                      <motion.button
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.992 }}
                        className={`rounded-[1.9rem] border px-5 py-5 text-left transition-[border-color,box-shadow,background-color] duration-250 ${
                          isActive
                            ? option.tone
                            : 'border-white/60 bg-white/70 shadow-soft hover:bg-white/82'
                        }`}
                        key={role}
                        onClick={() => selectRole(role)}
                        type="button"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.1rem] ${
                              isActive ? option.iconTone : 'bg-slate-100 text-muted'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="text-base font-black text-ink">{option.title}</p>
                            <p className="mt-1 text-sm leading-6 text-muted">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.8rem] bg-white/76 px-5 py-5 shadow-soft ring-1 ring-white/80">
                  <p className="text-base font-black text-ink">Espace encadrant</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Vous pourrez ensuite creer les profils travailleurs, attribuer les
                    ateliers et suivre les routines.
                  </p>
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                {authMode === 'register' ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2">
                        <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                          Prenom
                        </span>
                        <input
                          className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                          name="firstName"
                          onChange={handleRegisterChange}
                          type="text"
                          value={registerForm.firstName}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                          Nom
                        </span>
                        <input
                          className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                          name="lastName"
                          onChange={handleRegisterChange}
                          type="text"
                          value={registerForm.lastName}
                        />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                        Email
                      </span>
                      <input
                        className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                        name="email"
                        onChange={handleRegisterChange}
                        type="email"
                        value={registerForm.email}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                        Mot de passe
                      </span>
                      <input
                        className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                        name="password"
                        onChange={handleRegisterChange}
                        type="password"
                        value={registerForm.password}
                      />
                    </label>
                  </>
                ) : (
                  <>
                    <label className="block space-y-2">
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                        Email
                      </span>
                      <input
                        className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                        name="email"
                        onChange={handleLoginChange}
                        type="email"
                        value={loginForm.email}
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                        Mot de passe
                      </span>
                      <input
                        className="h-14 w-full rounded-full bg-slate-100/90 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] transition focus:bg-white focus:ring-4 focus:ring-brand/10"
                        name="password"
                        onChange={handleLoginChange}
                        type="password"
                        value={loginForm.password}
                      />
                    </label>
                  </>
                )}

                {error ? (
                  <div className="rounded-[1.4rem] bg-rose-50 px-4 py-3 text-sm font-bold text-rose-500">
                    {error}
                  </div>
                ) : null}

                <Button
                  className="h-14 w-full text-base"
                  iconRight={<ArrowRight className="h-4 w-4" />}
                  type="submit"
                >
                  {isSubmitting
                    ? authMode === 'register'
                      ? 'Creation...'
                      : 'Connexion...'
                    : authMode === 'register'
                      ? 'Creer mon espace'
                      : 'Continuer'}
                </Button>
              </form>

              {authMode === 'login' ? (
                <div className="space-y-3 pt-2">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.18em] text-muted">
                    Profils de demonstration
                  </p>

                  <div className="grid gap-2.5">
                    {demoAccounts[rolePreview].map(account => (
                      <button
                        className="flex items-center justify-between rounded-[1.45rem] bg-white/62 px-4 py-3 text-left transition hover:bg-white/82"
                        key={account.email}
                        onClick={() =>
                          setLoginForm({
                            email: account.email,
                            password: account.password
                          })
                        }
                        type="button"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-ink">
                            {getInitials(account.label)}
                          </div>

                          <p className="truncate text-sm font-bold text-ink">{account.label}</p>
                        </div>

                        <span className="text-sm font-bold text-brand">Utiliser</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
