# Best Berry — Site du Complexe Scolaire Bilingue

Site vitrine bilingue (FR/EN) avec backoffice CMS pour le Complexe Scolaire Bilingue
Best Berry (Yaoundé, Cameroun).

## Stack technique

- **Frontend** : React + TypeScript + Vite, Tailwind CSS
- **Backend as a Service** : [Appwrite](https://appwrite.io) (base de données, authentification, stockage)
- **Images** : Cloudinary (tier gratuit)
- **Vidéos** : intégration YouTube (aucun coût de stockage)
- **i18n** : react-i18next (français / anglais)

## Fonctionnalités

**Front office (site public)**
- Page d'accueil, présentation de l'école, actualités, galerie photo/vidéo,
  équipe pédagogique, calendrier scolaire, contact
- Formulaire d'admission en ligne avec pièces jointes (photo, acte de naissance, bulletin)
- Tout le contenu est géré depuis le backoffice (CMS) — aucun texte n'est en dur dans le code

**Backoffice**
- Authentification par rôle (Appwrite Teams)
- Tableau de bord
- Gestion des demandes d'inscription : filtrage par statut, export PDF individuel et CSV global
- Gestion des actualités, de la galerie, du calendrier et de l'équipe
- Gestion du contenu des pages publiques (accueil, présentation, contact)

## Démarrer en local

```bash
npm install
cp .env.example .env   # puis remplir les valeurs, voir SETUP.md
npm run dev
```

## Mise en service (Appwrite, Cloudinary, déploiement)

Voir **[SETUP.md](./SETUP.md)** pour la configuration complète, étape par étape.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build de production (vérifie aussi les types TypeScript)
- `npm run preview` — prévisualiser le build de production
- `npm run lint` — vérification du code
