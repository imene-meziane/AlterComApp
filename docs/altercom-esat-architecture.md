# AlterCom ESAT - Architecture retenue

## 1. Analyse de l'existant

L'existant possedait deja :

- un monorepo `frontend` / `backend` ;
- une authentification JWT avec deux roles ;
- une direction visuelle chaleureuse ;
- un seed MongoDB pour la demonstration.

Les principaux ecarts avec le cahier des charges officiel etaient :

- un frontend en JavaScript au lieu de `React + TypeScript` ;
- des entites `routines` et `alerts` trop centrales par rapport au besoin ESAT ;
- une navigation travailleur encore trop proche d'un prototype generique ;
- l'absence des collections metier attendues : `workshops`, `messages`, `favorites`, `history`.

## 2. Arborescence cible

```text
cboard/
  frontend/
    src/
      core/
        AppRoot.tsx
      components/
        WorkerShell.tsx
        SupervisorShell.tsx
        ComposerDock.tsx
        EmergencyButton.tsx
        PictogramCard.tsx
      providers/
        AuthProvider.tsx
        ComposerProvider.tsx
      services/
        api.ts
        speech.ts
      theme/
        navigation.ts
      types/
        models.ts
      utils/
        sentence.ts
      views/
        auth/
        worker/
        supervisor/
        shared/
      index.tsx
      styles.css
  backend/
    src/
      app.js
      server.js
      config/
      middleware/
      models/
        User.js
        Category.js
        Pictogram.js
        Workshop.js
        Message.js
        Favorite.js
        History.js
      routes/
        auth.routes.js
        user.routes.js
        category.routes.js
        pictogram.routes.js
        workshop.routes.js
        message.routes.js
        favorite.routes.js
        history.routes.js
        dashboard.routes.js
      data/
        seedData.js
      services/
        seedService.js
      utils/
        buildSentence.js
```

## 3. Modeles MongoDB

### `users`

- `role`: `worker` ou `supervisor`
- `assignedWorkshop`
- `preferences.displayMode`: `simplified` ou `complete`
- `preferences.speechRate`
- `preferences.speechVolume`
- `preferences.showSearch`

### `categories`

- `key`
- `name`
- `prompt`
- `description`
- `color`
- `icon`
- `order`

### `pictograms`

- `label`
- `phrase`
- `spokenText`
- `builderText`
- `keywords`
- `category`
- `workshops`
- `imageUrl`
- `color`
- `showInSimplified`
- `isActive`

### `workshops`

- `key`
- `name`
- `description`
- `color`
- `icon`
- `isActive`

### `messages`

- `worker`
- `workshop`
- `items`
- `text`
- `channel`: `message` ou `emergency`
- `speechRate`
- `speechVolume`

### `favorites`

- `user`
- `kind`: `pictogram` ou `phrase`
- `pictogram`
- `pictograms`
- `title`
- `text`
- `imageUrl`

### `history`

- `worker`
- `workshop`
- `message`
- `text`
- `channel`
- `createdAt`

## 4. Choix UX

- Espace travailleur : gros boutons, categories lisibles, atelier filtre, composeur visuel, urgence flottante.
- Espace encadrant : vues plus denses mais non SaaS, orientees gestion concrète.
- Palette : beige, bleu doux, vert doux, orange pastel, rouge doux.
- Lecture vocale en francais avec volume et vitesse memorises dans le profil.
