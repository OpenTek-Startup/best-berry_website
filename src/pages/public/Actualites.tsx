import { useTranslation } from 'react-i18next';
import { useCollection, Query } from '@/hooks/useCollection';
import { COLLECTIONS } from '@/lib/appwrite';
import type { Actualite } from '@/types';
import { Loading, ErrorBlock, EmptyBlock } from '@/components/ui/StateBlocks';
import type { Models } from 'appwrite';

export function Actualites() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { data, loading, error } = useCollection<Actualite & Models.Document>(
    COLLECTIONS.actualites,
    [Query.equal('publie', true), Query.orderDesc('date_publication')],
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-8">{t('nav.actualites')}</h1>

      {loading && <Loading label={fr ? 'Chargement des actualités...' : 'Loading news...'} />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyBlock label={fr ? 'Aucune actualité publiée pour le moment.' : 'No news published yet.'} />
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {data.map((article) => (
          <article key={article.$id} className="rounded-3xl overflow-hidden border border-leaf-100 bg-white shadow-sm hover:shadow-md transition-shadow">
            {article.image_url && (
              <img src={article.image_url} alt="" className="w-full h-44 object-cover" />
            )}
            {article.video_youtube_id && !article.image_url && (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${article.video_youtube_id}`}
                  title={fr ? article.titre_fr : article.titre_en}
                  allowFullScreen
                />
              </div>
            )}
            <div className="p-5">
              <p className="text-xs text-ink-500 mb-1">
                {new Date(article.date_publication).toLocaleDateString(fr ? 'fr-FR' : 'en-GB')}
              </p>
              <h2 className="font-display font-bold text-lg text-ink-900 mb-2">
                {fr ? article.titre_fr : article.titre_en}
              </h2>
              <p className="text-sm text-ink-700 line-clamp-3">
                {fr ? article.contenu_fr : article.contenu_en}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
