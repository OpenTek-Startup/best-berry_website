import { Client, Account, Databases, Storage, ID, Query, Permission, Role } from 'appwrite';

const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID, Query, Permission, Role };

export const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID as string;

export const COLLECTIONS = {
  pages: import.meta.env.VITE_APPWRITE_COL_PAGES as string,
  actualites: import.meta.env.VITE_APPWRITE_COL_ACTUALITES as string,
  evenements: import.meta.env.VITE_APPWRITE_COL_EVENEMENTS as string,
  staff: import.meta.env.VITE_APPWRITE_COL_STAFF as string,
  galerie: import.meta.env.VITE_APPWRITE_COL_GALERIE as string,
  inscriptions: import.meta.env.VITE_APPWRITE_COL_INSCRIPTIONS as string,
};

export const BUCKETS = {
  media: import.meta.env.VITE_APPWRITE_BUCKET_MEDIA as string,
  pieces: import.meta.env.VITE_APPWRITE_BUCKET_PIECES as string,
};

export default client;
