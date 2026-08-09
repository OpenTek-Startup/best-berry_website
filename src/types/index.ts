export type Langue = 'fr' | 'en';

export type Niveau =
  | 'petite_section'
  | 'moyenne_section'
  | 'grande_section'
  | 'sil'
  | 'cp'
  | 'ce1'
  | 'ce2'
  | 'cm1'
  | 'cm2';

export type StatutInscription = 'nouveau' | 'en_cours' | 'traite' | 'accepte' | 'refuse';

export type RoleBackoffice = 'direction' | 'secretariat' | 'personnalise';

export interface Actualite {
  $id: string;
  titre_fr: string;
  titre_en: string;
  contenu_fr: string;
  contenu_en: string;
  image_url?: string;
  video_youtube_id?: string;
  date_publication: string;
  publie: boolean;
}

export interface Evenement {
  $id: string;
  titre_fr: string;
  titre_en: string;
  description_fr?: string;
  description_en?: string;
  date_debut: string;
  date_fin?: string;
  lieu?: string;
}

export interface MembreStaff {
  $id: string;
  nom: string;
  role_fr: string;
  role_en: string;
  niveau_enseigne?: string;
  photo_url?: string;
  ordre: number;
}

export interface AlbumGalerie {
  $id: string;
  titre_fr: string;
  titre_en: string;
  image_url?: string;
  video_youtube_id?: string;
  date: string;
}

export interface PieceJointe {
  fichier_id: string;
  nom_original: string;
  type: 'photo_enfant' | 'acte_naissance' | 'bulletin' | 'autre';
}

export interface FicheInscription {
  $id: string;
  $createdAt: string;
  // Enfant
  enfant_nom: string;
  enfant_prenom: string;
  enfant_date_naissance: string;
  enfant_sexe: 'M' | 'F';
  niveau_vise: Niveau;
  // Parent / tuteur
  parent_nom: string;
  parent_telephone: string;
  parent_email: string;
  parent_adresse: string;
  lien_parente: string;
  // Pièces jointes (références vers le bucket "pieces_inscription")
  pieces_jointes: string; // JSON.stringify(PieceJointe[])
  // Suivi
  statut: StatutInscription;
  notes_internes?: string;
  langue_saisie: Langue;
}

/**
 * Contenu de page éditable depuis le backoffice (collection "pages_contenu").
 * "cle" identifie la page/section (ex: "accueil_hero", "notre_ecole", "contact").
 * "donnees_json" porte des champs structurés propres à certaines pages
 * (ex: pour "contact" : { telephone, email, adresse, horaires_fr, horaires_en }),
 * pour éviter de multiplier les attributs Appwrite selon la page.
 */
export interface PageContenu {
  $id: string;
  cle: string;
  titre_fr: string;
  titre_en: string;
  contenu_fr: string;
  contenu_en: string;
  donnees_json?: string;
}

export interface UtilisateurBackoffice {
  $id: string;
  nom: string;
  email: string;
  role: RoleBackoffice;
  permissions_personnalisees?: string[];
}
