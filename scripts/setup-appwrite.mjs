/**
 * Provisionne automatiquement tout ce dont le site Best Berry a besoin côté
 * Appwrite : base de données, collections, attributs, permissions, équipe
 * "backoffice" et buckets de stockage.
 *
 * Ce script est idempotent : on peut le relancer sans danger, il saute
 * simplement ce qui existe déjà (erreurs 409 ignorées).
 *
 * ⚠️ Ce script utilise une clé API serveur (droits élevés) — à n'exécuter
 * qu'en local, jamais dans le navigateur ni commise dans Git.
 *
 * Utilisation :
 *   1. npm install            (installe node-appwrite, déjà dans package.json)
 *   2. cp scripts/.env.setup.example scripts/.env.setup
 *      puis renseigner APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY
 *      (voir SETUP.md, section "Script de provisionnement automatique")
 *   3. npm run setup:appwrite
 */

import { Client, Databases, Storage, Teams, Permission, Role } from 'node-appwrite';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- Chargement de scripts/.env.setup (sans dépendance externe) -----------
function chargerEnvSetup() {
  const fichier = path.join(__dirname, '.env.setup');
  if (!existsSync(fichier)) {
    console.error(
      "Fichier scripts/.env.setup introuvable. Copiez scripts/.env.setup.example vers " +
      'scripts/.env.setup et renseignez vos identifiants (voir SETUP.md).',
    );
    process.exit(1);
  }
  const contenu = readFileSync(fichier, 'utf-8');
  for (const ligne of contenu.split('\n')) {
    const l = ligne.trim();
    if (!l || l.startsWith('#')) continue;
    const idx = l.indexOf('=');
    if (idx === -1) continue;
    const cle = l.slice(0, idx).trim();
    const valeur = l.slice(idx + 1).trim();
    if (!(cle in process.env)) process.env[cle] = valeur;
  }
}
chargerEnvSetup();

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error('APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID et APPWRITE_API_KEY sont requis dans scripts/.env.setup');
  process.exit(1);
}

const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
const databases = new Databases(client);
const storage = new Storage(client);
const teams = new Teams(client);

const DB_ID = 'best_berry_db';
const TEAM_ID = 'backoffice';

// --- Aides génériques -------------------------------------------------------

async function ignorerSiExiste(promesse, libelle) {
  try {
    await promesse;
    console.log(`  ✓ ${libelle}`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`  • ${libelle} (déjà existant, ignoré)`);
    } else {
      console.error(`  ✗ ${libelle} :`, err.message);
      throw err;
    }
  }
}

async function attendreAttributDisponible(collectionId, key, tentativesMax = 15) {
  for (let i = 0; i < tentativesMax; i++) {
    const attr = await databases.getAttribute(DB_ID, collectionId, key).catch(() => null);
    if (attr && attr.status === 'available') return;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

const PERM_PUBLIC_LECTURE = [
  Permission.read(Role.any()),
  Permission.create(Role.team(TEAM_ID)),
  Permission.update(Role.team(TEAM_ID)),
  Permission.delete(Role.team(TEAM_ID)),
];

const PERM_INSCRIPTIONS = [
  Permission.create(Role.any()), // soumission publique du formulaire
  Permission.read(Role.team(TEAM_ID)),
  Permission.update(Role.team(TEAM_ID)),
  Permission.delete(Role.team(TEAM_ID)),
];

// --- Définition des collections ---------------------------------------------

const COLLECTIONS = [
  {
    id: 'pages_contenu',
    nom: 'Contenu des pages',
    permissions: PERM_PUBLIC_LECTURE,
    attributs: [
      { fn: 'createStringAttribute', args: ['cle', 100, true] },
      { fn: 'createStringAttribute', args: ['titre_fr', 500, false] },
      { fn: 'createStringAttribute', args: ['titre_en', 500, false] },
      { fn: 'createStringAttribute', args: ['contenu_fr', 20000, false] },
      { fn: 'createStringAttribute', args: ['contenu_en', 20000, false] },
      { fn: 'createStringAttribute', args: ['donnees_json', 5000, false] },
    ],
  },
  {
    id: 'actualites',
    nom: 'Actualités',
    permissions: PERM_PUBLIC_LECTURE,
    attributs: [
      { fn: 'createStringAttribute', args: ['titre_fr', 500, true] },
      { fn: 'createStringAttribute', args: ['titre_en', 500, true] },
      { fn: 'createStringAttribute', args: ['contenu_fr', 20000, true] },
      { fn: 'createStringAttribute', args: ['contenu_en', 20000, true] },
      { fn: 'createStringAttribute', args: ['image_url', 2000, false] },
      { fn: 'createStringAttribute', args: ['video_youtube_id', 50, false] },
      { fn: 'createDatetimeAttribute', args: ['date_publication', true] },
      { fn: 'createBooleanAttribute', args: ['publie', true] },
    ],
  },
  {
    id: 'evenements',
    nom: 'Calendrier (événements)',
    permissions: PERM_PUBLIC_LECTURE,
    attributs: [
      { fn: 'createStringAttribute', args: ['titre_fr', 500, true] },
      { fn: 'createStringAttribute', args: ['titre_en', 500, true] },
      { fn: 'createStringAttribute', args: ['description_fr', 5000, false] },
      { fn: 'createStringAttribute', args: ['description_en', 5000, false] },
      { fn: 'createDatetimeAttribute', args: ['date_debut', true] },
      { fn: 'createDatetimeAttribute', args: ['date_fin', false] },
      { fn: 'createStringAttribute', args: ['lieu', 500, false] },
    ],
  },
  {
    id: 'staff',
    nom: 'Équipe pédagogique',
    permissions: PERM_PUBLIC_LECTURE,
    attributs: [
      { fn: 'createStringAttribute', args: ['nom', 200, true] },
      { fn: 'createStringAttribute', args: ['role_fr', 200, true] },
      { fn: 'createStringAttribute', args: ['role_en', 200, true] },
      { fn: 'createStringAttribute', args: ['niveau_enseigne', 200, false] },
      { fn: 'createStringAttribute', args: ['photo_url', 2000, false] },
      { fn: 'createIntegerAttribute', args: ['ordre', true] },
    ],
  },
  {
    id: 'galerie',
    nom: 'Galerie photo/vidéo',
    permissions: PERM_PUBLIC_LECTURE,
    attributs: [
      { fn: 'createStringAttribute', args: ['titre_fr', 500, true] },
      { fn: 'createStringAttribute', args: ['titre_en', 500, true] },
      { fn: 'createStringAttribute', args: ['image_url', 2000, false] },
      { fn: 'createStringAttribute', args: ['video_youtube_id', 50, false] },
      { fn: 'createDatetimeAttribute', args: ['date', true] },
    ],
  },
  {
    id: 'inscriptions',
    nom: "Fiches d'admission",
    permissions: PERM_INSCRIPTIONS,
    attributs: [
      { fn: 'createStringAttribute', args: ['enfant_nom', 200, true] },
      { fn: 'createStringAttribute', args: ['enfant_prenom', 200, true] },
      { fn: 'createDatetimeAttribute', args: ['enfant_date_naissance', true] },
      { fn: 'createStringAttribute', args: ['enfant_sexe', 1, true] },
      { fn: 'createStringAttribute', args: ['niveau_vise', 50, true] },
      { fn: 'createStringAttribute', args: ['parent_nom', 200, true] },
      { fn: 'createStringAttribute', args: ['parent_telephone', 50, true] },
      { fn: 'createStringAttribute', args: ['parent_email', 200, true] },
      { fn: 'createStringAttribute', args: ['parent_adresse', 500, true] },
      { fn: 'createStringAttribute', args: ['lien_parente', 100, true] },
      { fn: 'createStringAttribute', args: ['pieces_jointes', 5000, false] },
      { fn: 'createStringAttribute', args: ['statut', 50, true] },
      { fn: 'createStringAttribute', args: ['notes_internes', 5000, false] },
      { fn: 'createStringAttribute', args: ['langue_saisie', 5, true] },
    ],
  },
];

const BUCKETS = [
  {
    id: 'media_images',
    nom: 'Médias du site',
    permissions: [
      Permission.read(Role.any()),
      Permission.create(Role.team(TEAM_ID)),
      Permission.update(Role.team(TEAM_ID)),
      Permission.delete(Role.team(TEAM_ID)),
    ],
  },
  {
    id: 'pieces_inscription',
    nom: "Pièces jointes d'admission",
    permissions: [
      Permission.create(Role.any()),
      Permission.read(Role.team(TEAM_ID)),
      Permission.update(Role.team(TEAM_ID)),
      Permission.delete(Role.team(TEAM_ID)),
    ],
  },
];

// --- Exécution ---------------------------------------------------------------

async function main() {
  console.log(`Provisionnement du projet Appwrite ${PROJECT_ID} (${ENDPOINT})\n`);

  console.log('Base de données');
  await ignorerSiExiste(databases.create(DB_ID, DB_ID), `Base "${DB_ID}"`);

  console.log('\nÉquipe');
  await ignorerSiExiste(teams.create(TEAM_ID, 'Backoffice'), `Équipe "${TEAM_ID}"`);

  for (const col of COLLECTIONS) {
    console.log(`\nCollection "${col.id}" (${col.nom})`);
    await ignorerSiExiste(
      databases.createCollection(DB_ID, col.id, col.nom, col.permissions, true /* documentSecurity */),
      `Collection créée`,
    );

    for (const attr of col.attributs) {
      const [key] = attr.args;
      await ignorerSiExiste(
        databases[attr.fn](DB_ID, col.id, ...attr.args),
        `Attribut "${key}"`,
      );
      await attendreAttributDisponible(col.id, key);
    }
  }

  console.log('\nBuckets de stockage');
  for (const bucket of BUCKETS) {
    await ignorerSiExiste(
      storage.createBucket(
        bucket.id,
        bucket.nom,
        bucket.permissions,
        false, // fileSecurity (les permissions sont au niveau du bucket)
        true, // enabled
        10 * 1024 * 1024, // 10 Mo max par fichier
      ),
      `Bucket "${bucket.id}"`,
    );
  }

  console.log('\n✅ Provisionnement terminé.');
  console.log('Il reste à : créer vos comptes backoffice dans Auth → Users, les ajouter');
  console.log(`à l'équipe "${TEAM_ID}", puis remplir le .env du site (VITE_APPWRITE_*).`);
}

main().catch((err) => {
  console.error('\n❌ Échec du provisionnement :', err.message);
  process.exit(1);
});
