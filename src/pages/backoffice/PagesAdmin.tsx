import { useEffect, useState, type FormEvent } from 'react';
import { databases, DB_ID, COLLECTIONS, ID, Query, Permission, Role } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import type { PageContenu } from '@/types';
import { Loading, ErrorBlock } from '@/components/ui/StateBlocks';
import { Loader2, CheckCircle2 } from 'lucide-react';

/**
 * Les "pages" gérables ici sont volontairement fixes (pas de création libre) :
 * la structure du site (menu, routes) reste du ressort du développement, mais
 * leurs textes doivent pouvoir être modifiés par la direction sans redéploiement.
 */
const PAGES_GEREES = [
  { cle: 'accueil_hero', label: "Accueil — bandeau d'introduction", texteSimple: true },
  { cle: 'notre_ecole', label: 'Notre école — présentation', texteSimple: true },
  { cle: 'contact', label: 'Contact — coordonnées', texteSimple: false },
] as const;

export function PagesAdmin() {
  const [documents, setDocuments] = useState<Record<string, PageContenu>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    databases
      .listDocuments<Models.Document>(DB_ID, COLLECTIONS.pages, [Query.limit(100)])
      .then((res) => {
        const map: Record<string, PageContenu> = {};
        res.documents.forEach((d) => { map[(d as unknown as PageContenu).cle] = d as unknown as PageContenu; });
        setDocuments(map);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Chargement du contenu du site..." />;
  if (error) return <ErrorBlock message={error} />;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-leaf-900 mb-1">Contenu du site</h1>
      <p className="text-ink-500 mb-8">
        Modifiez ici les textes affichés sur le site public, en français et en anglais.
        Les changements sont visibles immédiatement.
      </p>

      <div className="space-y-6">
        {PAGES_GEREES.map((page) => (
          <FormulairePage
            key={page.cle}
            cle={page.cle}
            label={page.label}
            texteSimple={page.texteSimple}
            document={documents[page.cle]}
          />
        ))}
      </div>
    </div>
  );
}

interface ChampsContact {
  telephone: string;
  email: string;
  adresse: string;
  horaires_fr: string;
  horaires_en: string;
}

function FormulairePage({
  cle, label, texteSimple, document,
}: { cle: string; label: string; texteSimple: boolean; document?: PageContenu }) {
  const [titreFr, setTitreFr] = useState(document?.titre_fr ?? '');
  const [titreEn, setTitreEn] = useState(document?.titre_en ?? '');
  const [contenuFr, setContenuFr] = useState(document?.contenu_fr ?? '');
  const [contenuEn, setContenuEn] = useState(document?.contenu_en ?? '');
  const [contact, setContact] = useState<ChampsContact>(() => {
    const d = document?.donnees_json ? JSON.parse(document.donnees_json) : {};
    return {
      telephone: d.telephone ?? '', email: d.email ?? '', adresse: d.adresse ?? '',
      horaires_fr: d.horaires_fr ?? '', horaires_en: d.horaires_en ?? '',
    };
  });
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setEnregistrement(true);
    setErreur(null);
    setSucces(false);
    try {
      const data = {
        cle,
        titre_fr: titreFr,
        titre_en: titreEn,
        contenu_fr: contenuFr,
        contenu_en: contenuEn,
        donnees_json: texteSimple ? '' : JSON.stringify(contact),
      };

      if (document) {
        await databases.updateDocument(DB_ID, COLLECTIONS.pages, document.$id, data);
      } else {
        await databases.createDocument(DB_ID, COLLECTIONS.pages, ID.unique(), data, [
          Permission.read(Role.any()),
          Permission.update(Role.team('backoffice')),
          Permission.delete(Role.team('backoffice')),
        ]);
      }
      setSucces(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-leaf-100 p-6 space-y-4">
      <h2 className="font-display font-bold text-lg text-leaf-900">{label}</h2>

      {texteSimple ? (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            <Champ label="Titre (FR)" value={titreFr} onChange={setTitreFr} />
            <Champ label="Titre (EN)" value={titreEn} onChange={setTitreEn} />
          </div>
          <Zone label="Texte (FR)" value={contenuFr} onChange={setContenuFr} />
          <Zone label="Texte (EN)" value={contenuEn} onChange={setContenuEn} />
        </>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          <Champ label="Téléphone" value={contact.telephone} onChange={(v) => setContact((c) => ({ ...c, telephone: v }))} />
          <Champ label="Email" value={contact.email} onChange={(v) => setContact((c) => ({ ...c, email: v }))} />
          <div className="sm:col-span-2">
            <Champ label="Adresse" value={contact.adresse} onChange={(v) => setContact((c) => ({ ...c, adresse: v }))} />
          </div>
          <Champ label="Horaires (FR)" value={contact.horaires_fr} onChange={(v) => setContact((c) => ({ ...c, horaires_fr: v }))} />
          <Champ label="Horaires (EN)" value={contact.horaires_en} onChange={(v) => setContact((c) => ({ ...c, horaires_en: v }))} />
        </div>
      )}

      {erreur && <p className="text-berry-600 text-sm font-medium">{erreur}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={enregistrement}
          className="px-5 py-2.5 rounded-full bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center gap-2"
        >
          {enregistrement && <Loader2 className="animate-spin" size={16} />}
          Enregistrer
        </button>
        {succes && (
          <span className="text-leaf-700 text-sm font-semibold flex items-center gap-1">
            <CheckCircle2 size={16} /> Enregistré
          </span>
        )}
      </div>
    </form>
  );
}

function Champ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200" />
    </div>
  );
}

function Zone({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-700 mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4}
        className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200" />
    </div>
  );
}
