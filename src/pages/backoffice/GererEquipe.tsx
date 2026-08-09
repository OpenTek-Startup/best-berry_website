import { CollectionManager } from '@/components/backoffice/CollectionManager';
import { COLLECTIONS } from '@/lib/appwrite';

export function GererEquipe() {
  return (
    <CollectionManager
      collectionId={COLLECTIONS.staff}
      titre="Équipe pédagogique"
      colonnesAffichees={['nom', 'role_fr', 'ordre']}
      ordreQuery={[]}
      champs={[
        { name: 'nom', label: 'Nom complet', type: 'text', required: true },
        { name: 'role_fr', label: 'Rôle (FR)', type: 'text', required: true },
        { name: 'role_en', label: 'Rôle (EN)', type: 'text', required: true },
        { name: 'niveau_enseigne', label: 'Niveau enseigné (optionnel)', type: 'text' },
        { name: 'photo_url', label: 'Photo', type: 'image' },
        { name: 'ordre', label: 'Ordre d\'affichage', type: 'number', required: true },
      ]}
    />
  );
}
