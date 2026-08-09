import { useEffect, useState } from 'react';
import { databases, DB_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import type { PageContenu } from '@/types';

/**
 * Récupère le contenu CMS d'une page par sa clé (ex: "accueil_hero", "contact").
 * Retourne `null` tant que rien n'a été chargé, pour laisser l'appelant
 * afficher un contenu par défaut tant qu'Appwrite n'a pas encore répondu
 * (ou si la clé n'existe pas encore côté backoffice).
 */
export function usePageContenu(cle: string) {
  const [contenu, setContenu] = useState<PageContenu | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    databases
      .listDocuments<Models.Document>(DB_ID, COLLECTIONS.pages, [Query.equal('cle', cle), Query.limit(1)])
      .then((res) => {
        if (active) setContenu((res.documents[0] as unknown as PageContenu) ?? null);
      })
      .catch(() => {
        // Silencieux : la page utilise son contenu par défaut si Appwrite n'est pas configuré
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [cle]);

  return { contenu, loading };
}
