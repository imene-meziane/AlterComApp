# AlterCom

AlterCom est une application de communication augmentee pour l'ESAT Alter Ego.
Le projet est maintenant structure en deux parties :

- `frontend/` : interface React pour les espaces travailleur et encadrant
- `backend/` : API REST Express avec MongoDB, JWT et seed de demonstration

## Structure

```text
cboard/
  frontend/
  backend/
  README.md
```

## Lancement rapide

Depuis `cboard/` :

```bash
npm install
npm run dev
```

Par defaut :

- le front tourne sur `http://localhost:3000`
- le back tourne sur `http://localhost:4000`

## Seed de demonstration

Le backend peut amorcer automatiquement des donnees de demo.
Tu peux aussi relancer le seed manuellement :

```bash
npm run seed
```

## Comptes de demonstration

- Encadrant : `claire.martin@alterego.fr` / `AlterCom123!`
- Encadrant : `hugo.leroux@alterego.fr` / `AlterCom123!`
- Travailleur : `sarah.brunet@alterego.fr` / `AlterCom123!`
- Travailleur : `malik.bensaid@alterego.fr` / `AlterCom123!`

## Notes

- si `MONGODB_URI` n'est pas renseigne, le backend peut utiliser une instance MongoDB en memoire pour une demo rapide
- les assets du prototype ont ete reutilises dans `frontend/public/assets`
- l'architecture reste volontairement simple pour rester defendable dans un projet de M1
