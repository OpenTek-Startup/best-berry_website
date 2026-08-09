import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, Paperclip, X } from 'lucide-react';
import { databases, storage, DB_ID, COLLECTIONS, BUCKETS, ID, Permission, Role } from '@/lib/appwrite';
import type { Niveau, PieceJointe } from '@/types';

const NIVEAUX: Niveau[] = [
  'petite_section', 'moyenne_section', 'grande_section',
  'sil', 'cp', 'ce1', 'ce2', 'cm1', 'cm2',
];

type PieceType = PieceJointe['type'];

const CHAMPS_PIECES: { type: PieceType; labelKey: string; requis: boolean }[] = [
  { type: 'photo_enfant', labelKey: 'piece_photo', requis: true },
  { type: 'acte_naissance', labelKey: 'piece_acte', requis: true },
  { type: 'bulletin', labelKey: 'piece_bulletin', requis: false },
];

export function Admissions() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language.startsWith('fr');

  const [fichiers, setFichiers] = useState<Record<PieceType, File | null>>({
    photo_enfant: null,
    acte_naissance: null,
    bulletin: null,
    autre: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (type: PieceType, file: File | null) => {
    setFichiers((prev) => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const form = new FormData(e.currentTarget);

      // 1. Upload des pièces jointes vers le bucket "pieces_inscription"
      // Ce bucket doit être configuré en écriture "guests" mais SANS lecture publique
      // (voir SETUP.md) afin que seuls direction/secrétariat puissent consulter les documents.
      const piecesJointes: PieceJointe[] = [];
      for (const champ of CHAMPS_PIECES) {
        const fichier = fichiers[champ.type];
        if (fichier) {
          const uploaded = await storage.createFile(
            BUCKETS.pieces,
            ID.unique(),
            fichier,
            [Permission.read(Role.team('backoffice'))],
          );
          piecesJointes.push({ fichier_id: uploaded.$id, nom_original: fichier.name, type: champ.type });
        }
      }

      // 2. Création de la fiche d'inscription
      // Écriture ouverte aux visiteurs (create), lecture/écriture réservées à l'équipe backoffice.
      await databases.createDocument(
        DB_ID,
        COLLECTIONS.inscriptions,
        ID.unique(),
        {
          enfant_nom: form.get('enfant_nom'),
          enfant_prenom: form.get('enfant_prenom'),
          enfant_date_naissance: form.get('enfant_date_naissance'),
          enfant_sexe: form.get('enfant_sexe'),
          niveau_vise: form.get('niveau_vise'),
          parent_nom: form.get('parent_nom'),
          parent_telephone: form.get('parent_telephone'),
          parent_email: form.get('parent_email'),
          parent_adresse: form.get('parent_adresse'),
          lien_parente: form.get('lien_parente'),
          pieces_jointes: JSON.stringify(piecesJointes),
          statut: 'nouveau',
          langue_saisie: fr ? 'fr' : 'en',
        },
        [Permission.read(Role.team('backoffice')), Permission.update(Role.team('backoffice'))],
      );

      // 3. La notification email au secrétariat est envoyée automatiquement par une
      // fonction Appwrite déclenchée sur la création du document (voir SETUP.md).

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(t('admission.erreur'));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto text-leaf-600 mb-4" size={56} />
        <h1 className="font-display text-2xl font-bold text-leaf-900 mb-2">{t('admission.succes_titre')}</h1>
        <p className="text-ink-700">{t('admission.succes_message')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <h1 className="font-display text-3xl font-bold text-leaf-900 mb-2">{t('admission.titre')}</h1>
      <p className="text-ink-700 mb-10">{t('admission.intro')}</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Enfant */}
        <fieldset className="space-y-4">
          <legend className="font-display font-bold text-lg text-leaf-700 mb-2">{t('admission.section_enfant')}</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <Champ label={t('admission.nom')} name="enfant_nom" required />
            <Champ label={t('admission.prenom')} name="enfant_prenom" required />
            <Champ label={t('admission.date_naissance')} name="enfant_date_naissance" type="date" required />
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">{t('admission.sexe')}</label>
              <select name="enfant_sexe" required className={selectClass}>
                <option value="M">{t('admission.masculin')}</option>
                <option value="F">{t('admission.feminin')}</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700 mb-1.5">{t('admission.niveau_vise')}</label>
              <select name="niveau_vise" required className={selectClass}>
                {NIVEAUX.map((n) => (
                  <option key={n} value={n}>{t(`niveaux.${n}`)}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* Parent */}
        <fieldset className="space-y-4">
          <legend className="font-display font-bold text-lg text-leaf-700 mb-2">{t('admission.section_parent')}</legend>
          <div className="grid sm:grid-cols-2 gap-4">
            <Champ label={t('admission.nom_parent')} name="parent_nom" required />
            <Champ label={t('admission.lien_parente')} name="lien_parente" required />
            <Champ label={t('admission.telephone')} name="parent_telephone" type="tel" required />
            <Champ label={t('admission.email')} name="parent_email" type="email" required />
            <div className="sm:col-span-2">
              <Champ label={t('admission.adresse')} name="parent_adresse" required />
            </div>
          </div>
        </fieldset>

        {/* Pièces jointes */}
        <fieldset className="space-y-3">
          <legend className="font-display font-bold text-lg text-leaf-700 mb-2">{t('admission.section_pieces')}</legend>
          {CHAMPS_PIECES.map((champ) => (
            <FileField
              key={champ.type}
              label={t(`admission.${champ.labelKey}`)}
              requis={champ.requis}
              fichier={fichiers[champ.type]}
              onChange={(f) => handleFile(champ.type, f)}
              boutonLabel={t('admission.ajouter_fichier')}
            />
          ))}
        </fieldset>

        {error && <p className="text-berry-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-berry-600 text-white font-bold hover:bg-berry-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="animate-spin" size={18} />}
          {submitting ? t('admission.envoi_en_cours') : t('admission.envoyer')}
        </button>
      </form>
    </div>
  );
}

const selectClass = 'w-full rounded-xl border border-leaf-200 px-4 py-2.5 text-ink-900 focus:border-leaf-500 focus:ring-2 focus:ring-leaf-200 outline-none transition';

function Champ({ label, name, type = 'text', required }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 mb-1.5" htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} required={required} className={selectClass} />
    </div>
  );
}

function FileField({
  label, requis, fichier, onChange, boutonLabel,
}: {
  label: string; requis: boolean; fichier: File | null; onChange: (f: File | null) => void; boutonLabel: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-leaf-300 bg-leaf-50">
      <div className="flex items-center gap-3 min-w-0">
        <Paperclip className="text-leaf-600 shrink-0" size={18} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-800">{label}{requis && <span className="text-berry-600"> *</span>}</p>
          {fichier && <p className="text-xs text-ink-500 truncate">{fichier.name}</p>}
        </div>
      </div>
      <div className="shrink-0 flex items-center gap-2">
        {fichier ? (
          <button type="button" onClick={() => onChange(null)} className="text-ink-500 hover:text-berry-600" aria-label="Retirer le fichier">
            <X size={18} />
          </button>
        ) : (
          <label className="cursor-pointer px-3 py-1.5 rounded-full bg-white border border-leaf-300 text-leaf-700 text-xs font-bold hover:bg-leaf-100">
            {boutonLabel}
            <input
              type="file"
              accept="image/*,.pdf"
              required={requis}
              className="hidden"
              onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
