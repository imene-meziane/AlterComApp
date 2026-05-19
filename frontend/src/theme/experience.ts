import {
  BookHeart,
  BriefcaseBusiness,
  HeartHandshake,
  House,
  MessageCircleHeart
} from 'lucide-react';

import { Category, Workshop } from '../types/models';

export const categoryThemes: Record<
  string,
  {
    accent: string;
    soft: string;
    ring: string;
    icon: typeof MessageCircleHeart;
    tagline: string;
  }
> = {
  besoins: {
    accent: 'text-violet-500',
    soft: 'bg-violet-50',
    ring: 'ring-violet-200',
    icon: HeartHandshake,
    tagline: "Dire un besoin simplement"
  },
  actions: {
    accent: 'text-brand',
    soft: 'bg-sky',
    ring: 'ring-blue-200',
    icon: BookHeart,
    tagline: 'Faire une action pas a pas'
  },
  emotions: {
    accent: 'text-orange-500',
    soft: 'bg-orange-50',
    ring: 'ring-orange-200',
    icon: MessageCircleHeart,
    tagline: 'Montrer comment je me sens'
  },
  lieux: {
    accent: 'text-indigo-500',
    soft: 'bg-indigo-50',
    ring: 'ring-indigo-200',
    icon: House,
    tagline: 'Aller au bon endroit'
  },
  'activites-atelier': {
    accent: 'text-emerald-600',
    soft: 'bg-emerald-50',
    ring: 'ring-emerald-200',
    icon: BriefcaseBusiness,
    tagline: "Parler du travail d'atelier"
  }
};

export function getCategoryTheme(category?: Pick<Category, 'key'> | null) {
  return categoryThemes[category?.key || 'actions'] || categoryThemes.actions;
}

export const workshopStories: Record<
  string,
  {
    eyebrow: string;
    title: string;
    note: string;
    steps: Array<{ title: string; text: string }>;
  }
> = {
  repassage: {
    eyebrow: 'Atelier repassage',
    title: 'Un parcours calme pour trier, plier et verifier le linge.',
    note: 'Chaque etape garde des reperes visuels courts et rassurants.',
    steps: [
      { title: 'Preparer', text: 'Je prends le linge et le materiel.' },
      { title: 'Repasser', text: 'Je repasse doucement, sans me presser.' },
      { title: 'Verifier', text: 'Je regarde si le linge est bien termine.' }
    ]
  },
  conditionnement: {
    eyebrow: 'Atelier conditionnement',
    title: 'Une suite simple pour preparer, emballer et controler.',
    note: 'Les pictogrammes aident a suivre le colis de bout en bout.',
    steps: [
      { title: 'Preparer', text: 'Je prends le carton et les produits.' },
      { title: 'Emballer', text: "Je ferme et je range le colis avec soin." },
      { title: 'Controler', text: 'Je verifie avant de dire que j ai fini.' }
    ]
  },
  cuisine: {
    eyebrow: 'Atelier cuisine',
    title: 'Une ambiance plus chaleureuse pour preparer, servir et nettoyer.',
    note: 'Les gestes sont montres en peu de mots, avec des reperes tres visuels.',
    steps: [
      { title: 'Preparer', text: 'Je prepare les ingredients et le poste.' },
      { title: 'Servir', text: 'Je sers calmement avec une consigne claire.' },
      { title: 'Nettoyer', text: 'Je remets le poste propre a la fin.' }
    ]
  },
  nettoyage: {
    eyebrow: 'Atelier nettoyage',
    title: 'Des reperes clairs pour preparer, nettoyer et verifier.',
    note: 'Le parcours reste tres lisible sur tablette et facile a suivre.',
    steps: [
      { title: 'Preparer', text: 'Je prends le bon materiel avant de commencer.' },
      { title: 'Nettoyer', text: 'Je lave le poste ou la zone demandee.' },
      { title: 'Verifier', text: 'Je regarde si la zone est propre et finie.' }
    ]
  }
};

export function getWorkshopStory(workshop?: Workshop | null) {
  return workshopStories[workshop?.key || 'conditionnement'] || workshopStories.conditionnement;
}

export const workerWelcomeNotes = [
  'Choisis une image pour parler.',
  'Ton message se construit en douceur.',
  'Les favoris restent tout pres.',
  'Le bouton urgence est toujours visible.'
];

export const emotionalWeather = [
  {
    title: 'Calme',
    text: 'Tu peux commencer tranquillement.',
    bg: 'bg-blue-50',
    accent: 'text-brand'
  },
  {
    title: 'Besoin de pause',
    text: 'Tu peux demander un temps de repos.',
    bg: 'bg-amber-50',
    accent: 'text-orange-500'
  },
  {
    title: 'Besoin de soutien',
    text: 'L aide est toujours disponible.',
    bg: 'bg-rose-50',
    accent: 'text-rose-500'
  }
];
