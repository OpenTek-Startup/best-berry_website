import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

// Tant que le projet Appwrite n'est pas encore configuré (voir SETUP.md),
// on retombe sur des valeurs par défaut plutôt que de laisser le site planter
// au chargement : les pages publiques peuvent ainsi s'afficher (avec un
// contenu par défaut) même si Appwrite n'est pas encore joignable.
const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || 'non-configure';

if (!import.meta.env.VITE_APPWRITE_PROJECT_ID) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Appwrite] VITE_APPWRITE_PROJECT_ID n'est pas défini. " +
    'Copiez .env.example vers .env et renseignez vos identifiants Appwrite (voir SETUP.md). ' +
    'Le site public reste consultable avec un contenu par défaut, mais le formulaire ' +
    "d'admission et le backoffice ne fonctionneront pas tant que ce n'est pas fait.",
  );
}

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query, Permission, Role };

export const DB_ID = (import.meta.env.VITE_APPWRITE_DATABASE_ID as string) || 'best_berry_db';

export const COLLECTIONS = {
  pages: (import.meta.env.VITE_APPWRITE_COL_PAGES as string) || 'pages_contenu',
  actualites: (import.meta.env.VITE_APPWRITE_COL_ACTUALITES as string) || 'actualites',
  evenements: (import.meta.env.VITE_APPWRITE_COL_EVENEMENTS as string) || 'evenements',
  staff: (import.meta.env.VITE_APPWRITE_COL_STAFF as string) || 'staff',
  galerie: (import.meta.env.VITE_APPWRITE_COL_GALERIE as string) || 'galerie',
  inscriptions: (import.meta.env.VITE_APPWRITE_COL_INSCRIPTIONS as string) || 'inscriptions',
};

export const BUCKETS = {
  media: (import.meta.env.VITE_APPWRITE_BUCKET_MEDIA as string) || 'media_images',
  pieces: (import.meta.env.VITE_APPWRITE_BUCKET_PIECES as string) || 'pieces_inscription',
};

export default client;
