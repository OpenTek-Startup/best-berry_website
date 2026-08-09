import { useTranslation } from 'react-i18next';
import { useCollection, Query } from '@/hooks/useCollection';
import { COLLECTIONS } from '@/lib/appwrite';
import type { Evenement } from '@/types';
import { Loading, ErrorBlock, EmptyBlock } from '@/components/ui/StateBlocks';
import type { Models } from 'appwrite';
import { CalendarDays, MapPin } from 'lucide-react';

export function Calendrier() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { data, loading, error } = useCollection<Evenement & Models.Document>(
    COLLECTIONS.evenements,
    [Query.orderAsc('date_debut'), Query.greaterThanEqual('date_debut', new Date().toISOString().slice(0, 10))],
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-8">{t('nav.calendrier')}</h1>

      {loading && <Loading label={fr ? 'Chargement du calendrier...' : 'Loading calendar...'} />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyBlock label={fr ? 'Aucun événement à venir.' : 'No upcoming events.'} />
      )}

      <div className="space-y-4">
        {data.map((ev) => (
          <div key={ev.$id} className="flex gap-4 p-5 rounded-2xl bg-white border border-leaf-100 shadow-sm">
            <div className="shrink-0 h-14 w-14 rounded-2xl bg-sun-100 text-sun-700 flex flex-col items-center justify-center font-display font-bold">
              <span className="text-lg leading-none">{new Date(ev.date_debut).getDate()}</span>
              <span className="text-[10px] uppercase">
                {new Date(ev.date_debut).toLocaleDateString(fr ? 'fr-FR' : 'en-GB', { month: 'short' })}
              </span>
            </div>
            <div>
              <h3 className="font-display font-bold text-ink-900">{fr ? ev.titre_fr : ev.titre_en}</h3>
              {(ev.description_fr || ev.description_en) && (
                <p className="text-sm text-ink-700 mt-1">{fr ? ev.description_fr : ev.description_en}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-ink-500">
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  {new Date(ev.date_debut).toLocaleDateString(fr ? 'fr-FR' : 'en-GB')}
                  {ev.date_fin ? ` — ${new Date(ev.date_fin).toLocaleDateString(fr ? 'fr-FR' : 'en-GB')}` : ''}
                </span>
                {ev.lieu && (
                  <span className="flex items-center gap-1"><MapPin size={14} /> {ev.lieu}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
