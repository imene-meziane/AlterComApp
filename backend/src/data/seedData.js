const demoPassword = 'AlterCom123!';

const users = [
  {
    firstName: 'Claire',
    lastName: 'Martin',
    role: 'supervisor',
    email: 'claire.martin@alterego.fr',
    password: demoPassword,
    avatar: 'CM'
  },
  {
    firstName: 'Hugo',
    lastName: 'Leroux',
    role: 'supervisor',
    email: 'hugo.leroux@alterego.fr',
    password: demoPassword,
    avatar: 'HL'
  },
  {
    firstName: 'Sarah',
    lastName: 'Brunet',
    role: 'worker',
    email: 'sarah.brunet@alterego.fr',
    password: demoPassword,
    avatar: 'SB',
    assignedWorkshopKey: 'conditionnement',
    simplificationLevel: 'high',
    supportNeeds: ['phrases courtes', 'grand affichage'],
    preferences: {
      displayMode: 'simplified',
      speechRate: 0.9,
      speechVolume: 1,
      showSearch: false,
      textScale: 'xlarge',
      contrastMode: 'standard',
      animationMode: 'calm'
    }
  },
  {
    firstName: 'Malik',
    lastName: 'Bensaid',
    role: 'worker',
    email: 'malik.bensaid@alterego.fr',
    password: demoPassword,
    avatar: 'MB',
    assignedWorkshopKey: 'repassage',
    simplificationLevel: 'medium',
    supportNeeds: ['consignes étape par étape'],
    preferences: {
      displayMode: 'complete',
      speechRate: 1,
      speechVolume: 0.9,
      showSearch: true,
      textScale: 'large',
      contrastMode: 'standard',
      animationMode: 'calm'
    }
  },
  {
    firstName: 'Julie',
    lastName: 'Perrin',
    role: 'worker',
    email: 'julie.perrin@alterego.fr',
    password: demoPassword,
    avatar: 'JP',
    assignedWorkshopKey: 'cuisine',
    simplificationLevel: 'high',
    supportNeeds: ['rappel vocal', 'atelier très guidé'],
    preferences: {
      displayMode: 'simplified',
      speechRate: 0.92,
      speechVolume: 1,
      showSearch: false,
      textScale: 'xlarge',
      contrastMode: 'high',
      animationMode: 'reduced'
    }
  },
  {
    firstName: 'Noe',
    lastName: 'Garnier',
    role: 'worker',
    email: 'noe.garnier@alterego.fr',
    password: demoPassword,
    avatar: 'NG',
    assignedWorkshopKey: 'nettoyage',
    simplificationLevel: 'low',
    supportNeeds: ['autonomie élevée'],
    preferences: {
      displayMode: 'complete',
      speechRate: 0.96,
      speechVolume: 1,
      showSearch: true,
      textScale: 'standard',
      contrastMode: 'standard',
      animationMode: 'calm'
    }
  }
];

const categories = [
  {
    key: 'besoins',
    name: 'Besoins',
    prompt: "J'ai besoin de...",
    description: 'Dire un besoin du quotidien avec peu de texte.',
    color: '#8bb9a6',
    icon: '/assets/pictograms/drink.png',
    order: 1,
    visibleFor: ['worker', 'supervisor']
  },
  {
    key: 'actions',
    name: 'Actions',
    prompt: 'Je veux faire...',
    description: 'Choisir une action simple à montrer ou demander.',
    color: '#8ea9d7',
    icon: '/assets/pictograms/workbook.svg',
    order: 2,
    visibleFor: ['worker', 'supervisor']
  },
  {
    key: 'emotions',
    name: 'Émotions',
    prompt: 'Je me sens...',
    description: 'Montrer une émotion ou une douleur rapidement.',
    color: '#edb57a',
    icon: '/assets/pictograms/emotions.svg',
    order: 3,
    visibleFor: ['worker', 'supervisor']
  },
  {
    key: 'lieux',
    name: 'Lieux',
    prompt: 'Je veux aller...',
    description: 'Nommer un endroit utile dans la journée de travail.',
    color: '#b2a6d6',
    icon: '/assets/pictograms/bathroom.png',
    order: 4,
    visibleFor: ['worker', 'supervisor']
  },
  {
    key: 'activites-atelier',
    name: "Activités d'atelier",
    prompt: "Dans l'atelier, je fais...",
    description: 'Retrouver les gestes et tâches liées aux ateliers ESAT.',
    color: '#f0c890',
    icon: '/assets/pictograms/work.svg',
    order: 5,
    visibleFor: ['worker', 'supervisor']
  }
];

const workshops = [
  {
    key: 'repassage',
    name: 'Atelier repassage',
    description: 'Pictogrammes utiles pour repasser, plier et préparer le linge.',
    color: '#90b8d6',
    icon: '/assets/pictograms/work-break.svg'
  },
  {
    key: 'conditionnement',
    name: 'Atelier conditionnement',
    description: 'Pictogrammes utiles pour préparer, emballer et vérifier un colis.',
    color: '#9ec59e',
    icon: '/assets/pictograms/materials.svg'
  },
  {
    key: 'cuisine',
    name: 'Atelier cuisine',
    description: 'Pictogrammes utiles pour préparer, cuire et servir.',
    color: '#f0bf83',
    icon: '/assets/pictograms/eat.svg'
  },
  {
    key: 'nettoyage',
    name: 'Atelier nettoyage',
    description: 'Pictogrammes utiles pour nettoyer, ranger et vérifier le poste.',
    color: '#d7b4a6',
    icon: '/assets/pictograms/clean.svg'
  }
];

const pictograms = [
  {
    key: 'pause',
    label: 'Une pause',
    phrase: "J'ai besoin d'une pause",
    spokenText: "J'ai besoin d'une pause",
    builderText: "j'ai besoin d'une pause",
    keywords: ['pause', 'repos', 'fatigue'],
    categoryKey: 'besoins',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/break.svg',
    color: '#f0cd77',
    showInSimplified: true
  },
  {
    key: 'boire',
    label: 'Boire',
    phrase: 'Je veux boire',
    spokenText: 'Je veux boire',
    builderText: 'je veux boire',
    keywords: ['eau', 'boisson', 'soif'],
    categoryKey: 'besoins',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/drink.png',
    color: '#8fbbe1',
    showInSimplified: true
  },
  {
    key: 'toilettes',
    label: 'Toilettes',
    phrase: 'Je veux aller aux toilettes',
    spokenText: 'Je veux aller aux toilettes',
    builderText: 'je veux aller aux toilettes',
    keywords: ['toilettes', 'wc'],
    categoryKey: 'lieux',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/bathroom.png',
    color: '#b4a7da',
    showInSimplified: true
  },
  {
    key: 'aide',
    label: "Besoin d'aide",
    phrase: "J'ai besoin d'aide",
    builderText: "j'ai besoin d'aide",
    spokenText: "J'ai besoin d'aide",
    keywords: ['aide', 'encadrant', 'besoin'],
    categoryKey: 'besoins',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/help.svg',
    color: '#8dcab8',
    showInSimplified: true
  },
  {
    key: 'j-ai-mal',
    label: "J'ai mal",
    phrase: "J'ai mal",
    spokenText: "J'ai mal",
    builderText: "j'ai mal",
    keywords: ['douleur', 'mal', 'sante'],
    categoryKey: 'besoins',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/pain.png',
    color: '#e39b8b',
    showInSimplified: true
  },
  {
    key: 'commencer',
    label: 'Commencer',
    phrase: 'Je commence',
    spokenText: 'Je commence',
    builderText: 'je commence',
    keywords: ['debut', 'commencer'],
    categoryKey: 'actions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/ready.svg',
    color: '#95c9ac',
    showInSimplified: true
  },
  {
    key: 'fini',
    label: 'Terminé',
    phrase: "J'ai terminé",
    spokenText: "J'ai terminé",
    builderText: "j'ai terminé",
    keywords: ['termine', 'fini'],
    categoryKey: 'actions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/finish.png',
    color: '#9ad0b5',
    showInSimplified: true
  },
  {
    key: 'repeter',
    label: 'Répéter',
    phrase: "Peux-tu répéter s'il te plaît ?",
    spokenText: "Peux-tu répéter s'il te plaît ?",
    builderText: "peux-tu répéter s'il te plaît",
    keywords: ['repeter', 'comprendre', 'consigne'],
    categoryKey: 'actions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/please.png',
    color: '#d4dd8f',
    showInSimplified: true
  },
  {
    key: 'attendre',
    label: 'Attendre',
    phrase: 'Je vais attendre',
    spokenText: 'Je vais attendre',
    builderText: "je vais attendre",
    keywords: ['attendre', 'patienter'],
    categoryKey: 'actions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/work-break.svg',
    color: '#c0c4df',
    showInSimplified: false
  },
  {
    key: 'nettoyer-action',
    label: 'Nettoyer',
    phrase: 'Je dois nettoyer',
    spokenText: 'Je dois nettoyer',
    builderText: 'je dois nettoyer',
    keywords: ['nettoyer', 'lavage', 'menage'],
    categoryKey: 'actions',
    workshopKeys: ['cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/clean.svg',
    color: '#8bc7d7',
    showInSimplified: true
  },
  {
    key: 'ranger',
    label: 'Ranger',
    phrase: 'Je dois ranger',
    spokenText: 'Je dois ranger',
    builderText: 'je dois ranger',
    keywords: ['ranger', 'placer'],
    categoryKey: 'actions',
    workshopKeys: ['conditionnement', 'nettoyage'],
    imageUrl: '/assets/pictograms/tidy.svg',
    color: '#a7d1b2',
    showInSimplified: true
  },
  {
    key: 'content',
    label: 'Content',
    phrase: 'Je suis content',
    spokenText: 'Je suis content',
    builderText: 'je suis content',
    keywords: ['content', 'heureux'],
    categoryKey: 'emotions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/happy.png',
    color: '#f0b96b',
    showInSimplified: true
  },
  {
    key: 'fatigue',
    label: 'Fatigué',
    phrase: 'Je suis fatigué',
    spokenText: 'Je suis fatigué',
    builderText: 'je suis fatigué',
    keywords: ['fatigue', 'repos'],
    categoryKey: 'emotions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/tired.svg',
    color: '#9fb9df',
    showInSimplified: true
  },
  {
    key: 'stresse',
    label: 'Stressé',
    phrase: 'Je suis stressé',
    spokenText: 'Je suis stressé',
    builderText: 'je suis stressé',
    keywords: ['stress', 'inquiet'],
    categoryKey: 'emotions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/worried.svg',
    color: '#eba17f',
    showInSimplified: true
  },
  {
    key: 'triste',
    label: 'Triste',
    phrase: 'Je suis triste',
    spokenText: 'Je suis triste',
    builderText: 'je suis triste',
    keywords: ['triste', 'mal'],
    categoryKey: 'emotions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/sad.png',
    color: '#93abda',
    showInSimplified: false
  },
  {
    key: 'peur',
    label: 'Peur',
    phrase: "J'ai peur",
    spokenText: "J'ai peur",
    builderText: "j'ai peur",
    keywords: ['peur', 'angoisse'],
    categoryKey: 'emotions',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/afraid.svg',
    color: '#9ea6e4',
    showInSimplified: false
  },
  {
    key: 'atelier',
    label: "Dans l'atelier",
    phrase: "Je veux retourner dans l'atelier",
    spokenText: "Je veux retourner dans l'atelier",
    builderText: "je veux retourner dans l'atelier",
    keywords: ['atelier', 'travail'],
    categoryKey: 'lieux',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/work.svg',
    color: '#8da7d7',
    showInSimplified: true
  },
  {
    key: 'salle-pause',
    label: 'Salle de pause',
    phrase: 'Je veux aller en salle de pause',
    spokenText: 'Je veux aller en salle de pause',
    builderText: 'je veux aller en salle de pause',
    keywords: ['pause', 'salle'],
    categoryKey: 'lieux',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/break.svg',
    color: '#e0c78b',
    showInSimplified: true
  },
  {
    key: 'vestiaire',
    label: 'Vestiaire',
    phrase: 'Je veux aller au vestiaire',
    spokenText: 'Je veux aller au vestiaire',
    builderText: 'je veux aller au vestiaire',
    keywords: ['vestiaire', 'casier'],
    categoryKey: 'lieux',
    workshopKeys: ['repassage', 'conditionnement', 'cuisine', 'nettoyage'],
    imageUrl: '/assets/pictograms/phone.svg',
    color: '#a9b6dc',
    showInSimplified: false
  },
  {
    key: 'repasser',
    label: 'Repasser',
    phrase: 'Je repasse le linge',
    spokenText: 'Je repasse le linge',
    builderText: 'je repasse le linge',
    keywords: ['linge', 'repassage', 'fer'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['repassage'],
    imageUrl: '/assets/pictograms/workbook.svg',
    color: '#9cc5de',
    showInSimplified: true
  },
  {
    key: 'plier',
    label: 'Plier',
    phrase: 'Je plie le linge',
    spokenText: 'Je plie le linge',
    builderText: 'je plie le linge',
    keywords: ['plier', 'linge'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['repassage'],
    imageUrl: '/assets/pictograms/tidy.svg',
    color: '#b8d1e6',
    showInSimplified: false
  },
  {
    key: 'emballer',
    label: 'Emballer',
    phrase: "J'emballe le colis",
    spokenText: "J'emballe le colis",
    builderText: "j'emballe le colis",
    keywords: ['colis', 'emballage', 'carton'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['conditionnement'],
    imageUrl: '/assets/pictograms/materials.svg',
    color: '#a7cf9f',
    showInSimplified: true
  },
  {
    key: 'verifier-colis',
    label: 'Vérifier',
    phrase: 'Je vérifie le colis',
    spokenText: 'Je vérifie le colis',
    builderText: 'je vérifie le colis',
    keywords: ['verifier', 'controle', 'colis'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['conditionnement'],
    imageUrl: '/assets/pictograms/check.svg',
    color: '#bdd7a5',
    showInSimplified: false
  },
  {
    key: 'preparer-repas',
    label: 'Préparer',
    phrase: 'Je prépare le repas',
    spokenText: 'Je prépare le repas',
    builderText: 'je prépare le repas',
    keywords: ['preparer', 'repas', 'cuisine'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['cuisine'],
    imageUrl: '/assets/pictograms/eat.svg',
    color: '#efbf83',
    showInSimplified: true
  },
  {
    key: 'servir',
    label: 'Servir',
    phrase: 'Je sers le repas',
    spokenText: 'Je sers le repas',
    builderText: 'je sers le repas',
    keywords: ['servir', 'plateau', 'repas'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['cuisine'],
    imageUrl: '/assets/pictograms/ready.svg',
    color: '#f1c98d',
    showInSimplified: false
  },
  {
    key: 'laver',
    label: 'Laver',
    phrase: 'Je lave le poste',
    spokenText: 'Je lave le poste',
    builderText: 'je lave le poste',
    keywords: ['laver', 'nettoyer', 'poste'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['nettoyage'],
    imageUrl: '/assets/pictograms/clean.svg',
    color: '#9ec9cf',
    showInSimplified: true
  },
  {
    key: 'verifier-proprete',
    label: 'Vérifier',
    phrase: "Je vérifie si c'est propre",
    spokenText: "Je vérifie si c'est propre",
    builderText: "je vérifie si c'est propre",
    keywords: ['verifier', 'proprete', 'controle'],
    categoryKey: 'activites-atelier',
    workshopKeys: ['nettoyage'],
    imageUrl: '/assets/pictograms/check.svg',
    color: '#b3d3d7',
    showInSimplified: false
  }
];

const favorites = [
  {
    userEmail: 'sarah.brunet@alterego.fr',
    kind: 'pictogram',
    pictogramKey: 'pause'
  },
  {
    userEmail: 'sarah.brunet@alterego.fr',
    kind: 'phrase',
    title: 'Pause',
    text: "J'ai besoin d'une pause.",
    pictogramKeys: ['pause']
  },
  {
    userEmail: 'malik.bensaid@alterego.fr',
    kind: 'pictogram',
    pictogramKey: 'emballer'
  },
  {
    userEmail: 'julie.perrin@alterego.fr',
    kind: 'phrase',
    title: 'Boire',
    text: 'Je veux boire.',
    pictogramKeys: ['boire']
  }
];

const routines = [
  {
    key: 'preparer-colis',
    title: 'Préparer un colis',
    description: 'Une routine courte pour préparer un colis en conditionnement.',
    workshopKey: 'conditionnement',
    categoryKey: 'activites-atelier',
    assignedWorkerEmails: ['sarah.brunet@alterego.fr'],
    estimatedMinutes: 12,
    difficulty: 'facile',
    supportText: 'Prends ton temps et valide chaque étape.',
    steps: [
      {
        title: 'Prendre le carton',
        instruction: 'Je prends un carton vide.',
        pictogramKey: 'emballer'
      },
      {
        title: 'Mettre les produits',
        instruction: 'Je mets les produits dans le carton.',
        pictogramKey: 'emballer'
      },
      {
        title: 'Fermer le carton',
        instruction: 'Je ferme le carton doucement.',
        pictogramKey: 'verifier-colis'
      },
      {
        title: 'Ranger le colis',
        instruction: 'Je range le colis au bon endroit.',
        pictogramKey: 'ranger'
      }
    ]
  },
  {
    key: 'plier-le-linge',
    title: 'Plier le linge',
    description: 'Routine pour finir le linge repassé proprement.',
    workshopKey: 'repassage',
    categoryKey: 'activites-atelier',
    assignedWorkerEmails: ['malik.bensaid@alterego.fr'],
    estimatedMinutes: 15,
    difficulty: 'moyen',
    supportText: 'Vérifier chaque pile avant de passer à la suivante.',
    steps: [
      {
        title: 'Prendre le linge',
        instruction: 'Je prends le linge repassé.',
        pictogramKey: 'repasser'
      },
      {
        title: 'Plier',
        instruction: 'Je plie le linge soigneusement.',
        pictogramKey: 'plier'
      },
      {
        title: 'Vérifier',
        instruction: 'Je vérifie que tout est bien plié.',
        pictogramKey: 'verifier-colis'
      }
    ]
  },
  {
    key: 'servir-le-repas',
    title: 'Servir le repas',
    description: 'Routine guidée pour la cuisine.',
    workshopKey: 'cuisine',
    categoryKey: 'activites-atelier',
    assignedWorkerEmails: ['julie.perrin@alterego.fr'],
    estimatedMinutes: 10,
    difficulty: 'facile',
    supportText: "Je peux demander de l'aide si je suis fatiguée.",
    steps: [
      {
        title: 'Préparer le plateau',
        instruction: 'Je prépare le plateau.',
        pictogramKey: 'preparer-repas'
      },
      {
        title: 'Servir',
        instruction: 'Je sers le repas calmement.',
        pictogramKey: 'servir'
      },
      {
        title: 'Nettoyer',
        instruction: 'Je nettoie mon poste ensuite.',
        pictogramKey: 'nettoyer-action'
      }
    ]
  },
  {
    key: 'nettoyer-le-poste',
    title: 'Nettoyer le poste',
    description: "Routine simple pour l'atelier nettoyage.",
    workshopKey: 'nettoyage',
    categoryKey: 'activites-atelier',
    assignedWorkerEmails: ['noe.garnier@alterego.fr'],
    estimatedMinutes: 9,
    difficulty: 'facile',
    supportText: 'Contrôle visuel final avant validation.',
    steps: [
      {
        title: 'Prendre le matériel',
        instruction: 'Je prends le bon matériel.',
        pictogramKey: 'laver'
      },
      {
        title: 'Nettoyer',
        instruction: 'Je nettoie le poste.',
        pictogramKey: 'laver'
      },
      {
        title: 'Vérifier',
        instruction: 'Je vérifie si tout est propre.',
        pictogramKey: 'verifier-proprete'
      }
    ]
  }
];

const messages = [
  {
    workerEmail: 'sarah.brunet@alterego.fr',
    workshopKey: 'conditionnement',
    channel: 'message',
    text: "J'ai besoin d'une pause.",
    pictogramKeys: ['pause']
  },
  {
    workerEmail: 'malik.bensaid@alterego.fr',
    workshopKey: 'repassage',
    channel: 'message',
    text: "J'ai terminé.",
    pictogramKeys: ['fini']
  },
  {
    workerEmail: 'julie.perrin@alterego.fr',
    workshopKey: 'cuisine',
    channel: 'emergency',
    text: "J'ai besoin d'aide."
  }
];

const alerts = [
  {
    workerEmail: 'julie.perrin@alterego.fr',
    type: 'fatigue',
    priority: 'important',
    message: "Je suis fatiguée et j'ai besoin d'aide.",
    status: 'pending'
  },
  {
    workerEmail: 'sarah.brunet@alterego.fr',
    type: 'incomprehension',
    priority: 'normal',
    message: 'Je ne comprends plus la consigne.',
    status: 'seen'
  }
];

module.exports = {
  alerts,
  categories,
  demoPassword,
  favorites,
  messages,
  pictograms,
  routines,
  users,
  workshops
};
