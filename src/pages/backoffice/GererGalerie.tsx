import { CollectionManager } from '@/components/backoffice/CollectionManager';
import { COLLECTIONS } from '@/lib/appwrite';

export function GererGalerie() {
  return (
    <CollectionManager
      collectionId={COLLECTIONS.galerie}
      titre="Galerie"
      colonnesAffichees={['titre_fr', 'date']}
      champs={[
        { name: 'titre_fr', label: 'Titre (FR)', type: 'text', required: true },
        { name: 'titre_en', label: 'Titre (EN)', type: 'text', required: true },
        { name: 'image_url', label: 'Photo', type: 'image' },
        { name: 'video_youtube_id', label: 'Vidéo YouTube (optionnel)', type: 'youtube' },
        { name: 'date', label: 'Date', type: 'date', required: true },
      ]}
    />
  );
}
