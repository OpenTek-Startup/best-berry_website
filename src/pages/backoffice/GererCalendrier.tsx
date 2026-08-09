import { CollectionManager } from '@/components/backoffice/CollectionManager';
import { COLLECTIONS } from '@/lib/appwrite';

export function GererCalendrier() {
  return (
    <CollectionManager
      collectionId={COLLECTIONS.evenements}
      titre="Calendrier"
      colonnesAffichees={['titre_fr', 'date_debut', 'lieu']}
      champs={[
        { name: 'titre_fr', label: 'Titre (FR)', type: 'text', required: true },
        { name: 'titre_en', label: 'Titre (EN)', type: 'text', required: true },
        { name: 'description_fr', label: 'Description (FR)', type: 'textarea' },
        { name: 'description_en', label: 'Description (EN)', type: 'textarea' },
        { name: 'date_debut', label: 'Date de début', type: 'date', required: true },
        { name: 'date_fin', label: 'Date de fin (optionnel)', type: 'date' },
        { name: 'lieu', label: 'Lieu', type: 'text' },
      ]}
    />
  );
}
