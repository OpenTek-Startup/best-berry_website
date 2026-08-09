import { useTranslation } from 'react-i18next';
import { useCollection, Query } from '@/hooks/useCollection';
import { COLLECTIONS } from '@/lib/appwrite';
import type { AlbumGalerie } from '@/types';
import { Loading, ErrorBlock, EmptyBlock } from '@/components/ui/StateBlocks';
import type { Models } from 'appwrite';
import { PlayCircle } from 'lucide-react';

export function Galerie() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');
  const { data, loading, error } = useCollection<AlbumGalerie & Models.Document>(
    COLLECTIONS.galerie,
    [Query.orderDesc('date')],
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-8">{t('nav.galerie')}</h1>

      {loading && <Loading label={fr ? 'Chargement de la galerie...' : 'Loading gallery...'} />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && data.length === 0 && (
        <EmptyBlock label={fr ? 'Aucun album pour le moment.' : 'No albums yet.'} />
      )}

      <div className="space-y-12">
        {data.map((album) => (
          <div key={album.$id}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl text-ink-900">
                {fr ? album.titre_fr : album.titre_en}
              </h2>
              <span className="text-xs text-ink-500">
                {new Date(album.date).toLocaleDateString(fr ? 'fr-FR' : 'en-GB')}
              </span>
            </div>

            {album.video_youtube_id && (
              <div className="aspect-video rounded-2xl overflow-hidden mb-4 border border-leaf-100">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube-nocookie.com/embed/${album.video_youtube_id}`}
                  title={fr ? album.titre_fr : album.titre_en}
                  allowFullScreen
                />
              </div>
            )}

            {album.image_url && !album.video_youtube_id && (
              <img src={album.image_url} alt="" loading="lazy" className="rounded-2xl object-cover w-full max-h-96" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-16 p-6 rounded-3xl bg-leaf-50 border border-leaf-100 flex items-center gap-4">
        <PlayCircle className="text-leaf-600 shrink-0" size={32} />
        <p className="text-sm text-ink-700">
          {fr
            ? 'Retrouvez toutes nos vidéos sur notre chaîne YouTube et notre page Facebook.'
            : 'Find all our videos on our YouTube channel and Facebook page.'}
        </p>
      </div>
    </div>
  );
}
