import { CollectionManager } from '@/components/backoffice/CollectionManager';
import { COLLECTIONS } from '@/lib/appwrite';

export function GererActualites() {
  return (
    <CollectionManager
      collectionId={COLLECTIONS.actualites}
      titre="Actualités"
      colonnesAffichees={['titre_fr', 'date_publication', 'publie']}
      champs={[
        { name: 'titre_fr', label: 'Titre (FR)', type: 'text', required: true },
        { name: 'titre_en', label: 'Titre (EN)', type: 'text', required: true },
        { name: 'contenu_fr', label: 'Contenu (FR)', type: 'textarea', required: true },
        { name: 'contenu_en', label: 'Contenu (EN)', type: 'textarea', required: true },
        { name: 'image_url', label: 'Image', type: 'image' },
        { name: 'video_youtube_id', label: 'Vidéo YouTube (optionnel)', type: 'youtube' },
        { name: 'date_publication', label: 'Date de publication', type: 'date', required: true },
        { name: 'publie', label: 'Publié sur le site', type: 'checkbox' },
      ]}
    />
  );
}
