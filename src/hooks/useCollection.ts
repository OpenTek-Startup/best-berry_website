import { useEffect, useState } from 'react';
import { databases, DB_ID, Query } from '@/lib/appwrite';
import type { Models } from 'appwrite';

/**
 * Récupère la liste des documents d'une collection Appwrite.
 * Utilisé par toutes les pages publiques (actualités, galerie, équipe, calendrier)
 * pour éviter de dupliquer la logique de fetch/loading/erreur.
 */
export function useCollection<T extends Models.Document>(
  collectionId: string,
  queries: string[] = [],
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    databases
      .listDocuments<T>(DB_ID, collectionId, queries)
      .then((res) => {
        if (active) setData(res.documents);
      })
      .catch((err) => {
        if (active) setError(err.message ?? 'Erreur de chargement');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionId, JSON.stringify(queries)]);

  return { data, loading, error };
}

export { Query };
