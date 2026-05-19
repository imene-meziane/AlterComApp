import {
  BellRing,
  Blocks,
  Heart,
  History,
  House,
  LayoutDashboard,
  MessageSquareText,
  NotebookText,
  PanelsTopLeft,
  Star,
  UsersRound
} from 'lucide-react';

export const workerNavigation = [
  { to: '/worker', label: 'Accueil', icon: House },
  { to: '/worker/pictograms', label: 'Communication', icon: Blocks },
  { to: '/worker/routines', label: 'Mes routines', icon: NotebookText },
  { to: '/worker/emotions', label: 'Emotions', icon: Heart },
  { to: '/worker/workshop', label: 'Atelier', icon: PanelsTopLeft },
  { to: '/worker/message', label: 'Mon message', icon: MessageSquareText },
  { to: '/worker/favorites', label: 'Favoris', icon: Star }
] as const;

export const supervisorNavigation = [
  { to: '/supervisor', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/supervisor/profiles', label: 'Travailleurs', icon: UsersRound },
  { to: '/supervisor/workshops', label: 'Ateliers', icon: PanelsTopLeft },
  { to: '/supervisor/routines', label: 'Routines', icon: NotebookText },
  { to: '/supervisor/alerts', label: 'Alertes', icon: BellRing },
  { to: '/supervisor/pictograms', label: 'Pictogrammes', icon: Blocks },
  { to: '/supervisor/history', label: 'Historique', icon: History }
] as const;
