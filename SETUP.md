# Guide de mise en service — Site Best Berry

Ce document explique comment configurer les services (gratuits) dont le site a besoin,
étape par étape. Aucune connaissance technique poussée n'est requise : il s'agit surtout
de créer des comptes et de copier-coller des identifiants dans un fichier `.env`.

---

## 1. Créer le projet Appwrite (base de données + authentification + stockage)

1. Aller sur https://cloud.appwrite.io et créer un compte gratuit.
2. Créer un nouveau projet, par exemple nommé **Best Berry**.
3. Dans **Settings → Platforms**, ajouter une plateforme **Web** pour **chaque** domaine
   depuis lequel le site sera accédé — c'est ce qui autorise Appwrite à répondre aux requêtes
   venant de ce domaine (sinon erreur *CORS* / "blocked by CORS policy" dans la console du
   navigateur). Ajouter au minimum :
   - `localhost` (développement local)
   - le domaine de déploiement Vercel, ex. `best-berry.vercel.app`
   - votre nom de domaine final une fois acheté, ex. `bestberry.cm` et `www.bestberry.cm`

   Dans le champ **Hostname**, ne mettre que le nom d'hôte, sans `https://` ni slash final.
   ⚠️ Les déploiements de prévisualisation Vercel (pour chaque Pull Request) génèrent une URL
   aléatoire différente à chaque fois ; ils ne fonctionneront pas avec Appwrite tant que cette
   URL précise n'a pas été ajoutée. Pour les tests, privilégier le domaine de production stable.
4. Noter le **Project ID** et l'**API Endpoint** (visibles dans Settings) : ils vont dans `.env`.

### Option rapide : provisionnement automatique (recommandé)

Plutôt que de créer à la main la base, les 6 collections, leurs ~40 attributs, leurs
permissions, l'équipe et les 2 buckets (sections 1.1 à 1.5 ci-dessous), un script fait
tout cela en une seule commande :

1. Dans la console Appwrite, **Settings → API Keys → Create API Key**, avec les scopes :
   `databases.read`, `databases.write`, `collections.read`, `collections.write`,
   `attributes.read`, `attributes.write`, `teams.read`, `teams.write`, `buckets.read`,
   `buckets.write`.
2. `cp scripts/.env.setup.example scripts/.env.setup` puis renseigner `APPWRITE_ENDPOINT`,
   `APPWRITE_PROJECT_ID` et la clé API créée à l'étape précédente.
3. `npm install && npm run setup:appwrite`

Le script est **idempotent** : le relancer après une exécution partielle (ou après avoir
ajouté une collection à la main) ne crée pas de doublons, il saute simplement ce qui existe
déjà. Les sections 1.1 à 1.5 ci-dessous restent utiles pour comprendre ou vérifier
manuellement ce que le script a mis en place, et pour l'étape 1.4 (comptes utilisateurs),
qui elle reste manuelle — un compte nominatif ne doit pas être créé par un script générique.

⚠️ `scripts/.env.setup` contient une clé avec des droits d'administration complets sur le
projet Appwrite : ne jamais la committer (déjà exclue via `.gitignore`), ne jamais la mettre
dans les variables d'environnement Vercel (elle n'a rien à faire côté frontend).

### 1.1 Créer la base de données

Dans **Databases**, créer une base de données nommée `best_berry_db` (l'ID doit
correspondre exactement à `VITE_APPWRITE_DATABASE_ID` dans `.env`).

### 1.2 Créer les collections

Créer les collections suivantes (l'**ID** de chaque collection doit correspondre
exactement à la valeur `VITE_APPWRITE_COL_*` du fichier `.env.example`) :

| Collection ID       | Attributs à créer                                                                                                                        |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `pages_contenu`      | `cle` (string, requis, unique conseillé), `titre_fr`, `titre_en`, `contenu_fr` (text long), `contenu_en` (text long), `donnees_json` (text long) |
| `actualites`         | `titre_fr`, `titre_en`, `contenu_fr` (text long), `contenu_en` (text long), `image_url`, `video_youtube_id`, `date_publication` (datetime), `publie` (boolean) |
| `evenements`         | `titre_fr`, `titre_en`, `description_fr` (text long), `description_en` (text long), `date_debut` (datetime), `date_fin` (datetime), `lieu` |
| `staff`              | `nom`, `role_fr`, `role_en`, `niveau_enseigne`, `photo_url`, `ordre` (integer)                                                            |
| `galerie`            | `titre_fr`, `titre_en`, `image_url`, `video_youtube_id`, `date` (datetime)                                                               |
| `inscriptions`       | `enfant_nom`, `enfant_prenom`, `enfant_date_naissance` (datetime), `enfant_sexe`, `niveau_vise`, `parent_nom`, `parent_telephone`, `parent_email`, `parent_adresse`, `lien_parente`, `pieces_jointes` (text long), `statut`, `notes_internes` (text long), `langue_saisie` |

Pour tous les attributs texte, une taille de 500 à 5000 caractères suffit largement
(sauf indication "text long" → prévoir jusqu'à 20000 caractères pour les contenus
d'actualités ou de pages).

### 1.3 Permissions des collections — **point de sécurité important**

Pour chaque collection, aller dans l'onglet **Settings → Permissions** :

- **`pages_contenu`, `actualites`, `evenements`, `staff`, `galerie`** :
  - Lecture (`Read`) : rôle **Any** (visiteurs du site public)
  - Création/Modification/Suppression : rôle **Team: backoffice** uniquement
- **`inscriptions`** :
  - Création (`Create`) : rôle **Any** (le formulaire d'admission est public)
  - Lecture/Modification/Suppression : rôle **Team: backoffice** uniquement (jamais "Any" —
    ce sont des données personnelles d'enfants)

### 1.4 Créer l'équipe "backoffice" et les comptes

1. Dans **Auth → Teams**, créer une équipe. **Important** : lors de la création, Appwrite
   permet de choisir l'ID de l'équipe (pas seulement son nom) — il faut impérativement
   mettre l'ID exact `backoffice` (tout en minuscules). Le code de l'application et les
   permissions de toutes les collections (`Role.team('backoffice')`) s'appuient sur cet ID
   précis, pas sur le nom affiché.
2. Dans **Auth → Users**, créer un compte pour la direction et un pour le secrétariat
   (email + mot de passe), puis les ajouter à l'équipe `backoffice` (menu **Teams → backoffice
   → Add member**).
3. Activer la vérification en deux étapes (2FA) pour ces comptes dans **Auth → Security**
   — fortement recommandé puisque ces comptes ont accès aux dossiers d'inscription.
4. **Un compte Appwrite qui n'est pas ajouté à l'équipe `backoffice` ne peut pas accéder au
   backoffice**, même s'il arrive à se connecter : l'application vérifie l'appartenance à
   cette équipe à chaque chargement (`AuthContext.tsx`) et redirige sinon vers la page de
   connexion avec un message d'accès refusé.

#### Mot de passe oublié / réinitialisation

Le site propose un vrai parcours "mot de passe oublié" (`/backoffice/mot-de-passe-oublie`)
qui envoie un email avec un lien de réinitialisation via `account.createRecovery()`. **Pour
que cet email parte réellement**, il faut qu'un expéditeur soit configuré côté Appwrite :

- Par défaut, Appwrite Cloud utilise son propre service d'envoi, avec une limite quotidienne
  réduite — suffisant pour démarrer.
- Pour un usage réel (école avec plusieurs comptes), configurer un SMTP personnalisé dans
  **Settings → SMTP** du projet Appwrite (ex. avec un compte Gmail, Brevo ou Resend) afin que
  les emails de réinitialisation arrivent de façon fiable et depuis une adresse reconnaissable
  (ex. `no-reply@bestberry.cm`).
- Le lien de réinitialisation pointe par défaut vers l'URL du site en cours d'utilisation ; si
  besoin de le forcer vers un domaine précis, définir `VITE_SITE_URL` dans `.env`.

### 1.5 Créer les buckets de stockage

Dans **Storage**, créer deux buckets :

| Bucket ID              | Permissions                                                                 | Taille max conseillée |
|-------------------------|------------------------------------------------------------------------------|------------------------|
| `media_images`          | Lecture: Any · Écriture: Team backoffice                                     | 10 Mo / fichier        |
| `pieces_inscription`    | Création: Any (upload par les parents) · Lecture/Suppression: Team backoffice uniquement | 10 Mo / fichier |

---

## 2. Créer le compte Cloudinary (photos)

1. Créer un compte gratuit sur https://cloudinary.com (tier gratuit : ~25 Go).
2. Noter le **Cloud Name** (visible sur le tableau de bord).
3. Aller dans **Settings → Upload**, créer un **Upload preset** en mode **Unsigned**
   (nécessaire pour permettre l'envoi d'images depuis le backoffice sans exposer de clé secrète).
4. Copier le Cloud Name et le nom du preset dans `.env`.

## 3. Chaîne YouTube pour les vidéos

Pour éviter tout coût de stockage/bande passante vidéo :
1. Créer une chaîne YouTube pour l'école (ou utiliser un compte existant).
2. Mettre les vidéos en visibilité **"Non répertoriée"** (pas besoin qu'elles soient publiques
   sur YouTube — elles ne seront visibles que via le site).
3. Dans le backoffice, coller simplement l'URL de la vidéo : le site en extrait automatiquement l'identifiant.

## 4. Notification email à chaque nouvelle inscription (optionnel mais recommandé)

Ceci nécessite une **Appwrite Function** (gratuite, incluse dans le tier Appwrite Cloud) :

1. Dans Appwrite, aller dans **Functions → Create Function**, runtime Node.js.
2. Déclencheur : `databases.*.collections.inscriptions.documents.*.create`.
3. La fonction envoie un email via un service gratuit comme **Resend** (100 emails/jour gratuits)
   ou **Brevo** (anciennement Sendinblue, 300 emails/jour gratuits) à l'adresse du secrétariat.
4. Cette étape peut être ajoutée après la mise en ligne initiale du site — le formulaire
   fonctionne sans, il suffit alors de consulter le backoffice régulièrement.

## 5. Configuration du fichier `.env`

Copier `.env.example` vers `.env` et remplir toutes les valeurs collectées ci-dessus :

```bash
cp .env.example .env
```

**Important** : ce fichier `.env` ne doit jamais être partagé publiquement ni mis sur GitHub
(il est déjà exclu via `.gitignore`).

## 6. Déploiement

### Frontend → Vercel (gratuit)
1. Pousser le code sur un dépôt GitHub.
2. Sur https://vercel.com, importer le dépôt.
3. Renseigner toutes les variables de `.env` dans les **Environment Variables** de Vercel.
4. Déployer — Vercel fournit un sous-domaine gratuit et le HTTPS automatique. Un nom de
   domaine personnalisé (ex: `bestberry.cm`) peut être ajouté ensuite dans les réglages du projet.

### Backend → déjà en ligne
Appwrite Cloud et Cloudinary sont des services gérés : aucune installation ni maintenance
de serveur n'est nécessaire côté école.

## 7. Créer le contenu initial

Une fois le site en ligne et connecté à Appwrite, se connecter au backoffice
(`/backoffice/connexion`) et renseigner :
1. Le contenu de la page d'accueil et de la page Contact (section "Contenu du site").
2. La présentation de l'école (section "Contenu du site").
3. Les membres de l'équipe pédagogique.
4. Une première actualité et le calendrier des événements à venir.

---

## Résumé des coûts (avec un usage raisonnable pour une école primaire)

| Service     | Usage typique                          | Coût     |
|-------------|-----------------------------------------|----------|
| Appwrite Cloud | Base de données, auth, petits fichiers | Gratuit  |
| Cloudinary  | Photos du site (~jusqu'à 25 Go/mois)    | Gratuit  |
| YouTube     | Hébergement vidéo illimité               | Gratuit  |
| Vercel      | Hébergement du site                      | Gratuit  |
| Nom de domaine (optionnel) | ex: bestberry.cm              | ~10-15 $/an |

Le seul coût réel à prévoir, si souhaité, est l'achat d'un nom de domaine personnalisé.
