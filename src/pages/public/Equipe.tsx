import { useTranslation } from 'react-i18next';
import { useCollection, Query } from '@/hooks/useCollection';
import { COLLECTIONS } from '@/lib/appwrite';
import type { MembreStaff } from '@/types';
import { Loading, ErrorBlock, EmptyBlock } from '@/components/ui/StateBlocks';
import type { Models } from 'appwrite';
import { UserRound } from 'lucide-react';

export function Equipe() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { data, loading, error } = useCollection<MembreStaff & Models.Document>(
    COLLECTIONS.staff,
    [Query.orderAsc('ordre')],
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-8">{t('nav.equipe')}</h1>

      {loading && <Loading label={fr ? 'Chargement de l\u2019équipe...' : 'Loading team...'} />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyBlock label={fr ? 'Équipe bientôt présentée ici.' : 'Team coming soon.'} />
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.map((membre) => (
          <div key={membre.$id} className="rounded-3xl bg-white border border-leaf-100 p-5 text-center shadow-sm">
            {membre.photo_url ? (
              <img src={membre.photo_url} alt={membre.nom} className="h-28 w-28 rounded-full object-cover mx-auto mb-4" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-leaf-100 text-leaf-600 flex items-center justify-center mx-auto mb-4">
                <UserRound size={40} />
              </div>
            )}
            <h3 className="font-display font-bold text-ink-900">{membre.nom}</h3>
            <p className="text-sm text-berry-600 font-medium">{fr ? membre.role_fr : membre.role_en}</p>
            {membre.niveau_enseigne && <p className="text-xs text-ink-500 mt-1">{membre.niveau_enseigne}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
