export const workerNavigation = [
  { to: '/worker', label: 'Accueil' },
  { to: '/worker/communication', label: 'Communiquer' },
  { to: '/worker/travail', label: 'Travail' },
  { to: '/worker/emotions', label: 'Émotions' },
  { to: '/worker/routines', label: 'Mes routines' },
  { to: '/worker/urgence', label: 'Urgence' },
  { to: '/worker/phrase', label: 'Ma phrase' }
];

export const supervisorNavigation = [
  { to: '/supervisor', label: 'Tableau de bord' },
  { to: '/supervisor/pictograms', label: 'Pictogrammes' },
  { to: '/supervisor/categories', label: 'Catégories' },
  { to: '/supervisor/routines', label: 'Routines' },
  { to: '/supervisor/workers', label: 'Travailleurs' },
  { to: '/supervisor/alerts', label: 'Alertes' }
];

export const workerHomeCards = [
  {
    to: '/worker/communication',
    title: 'Communiquer',
    description: 'Choisis une image pour parler.',
    color: '#6c9f8e',
    icon: '/assets/pictograms/communication.svg'
  },
  {
    to: '/worker/travail',
    title: 'Travail',
    description: "Dis ce qu'il se passe dans l'atelier.",
    color: '#6b8fd6',
    icon: '/assets/pictograms/work.svg'
  },
  {
    to: '/worker/emotions',
    title: 'Émotions',
    description: 'Montre comment tu te sens.',
    color: '#e7a45c',
    icon: '/assets/pictograms/emotions.svg'
  },
  {
    to: '/worker/routines',
    title: 'Mes routines',
    description: 'Suis les étapes de ton travail.',
    color: '#ad97ce',
    icon: '/assets/pictograms/workbook.svg'
  },
  {
    to: '/worker/urgence',
    title: 'Urgence',
    description: "Demande de l'aide rapidement.",
    color: '#d96b5f',
    icon: '/assets/pictograms/ambulance.svg'
  }
];
