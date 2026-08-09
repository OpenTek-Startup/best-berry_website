import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { databases, storage, DB_ID, COLLECTIONS, BUCKETS, Query } from '@/lib/appwrite';
import type { Models } from 'appwrite';
import type { FicheInscription, StatutInscription, PieceJointe } from '@/types';
import { exportFichePDF, exportInscriptionsCSV } from '@/lib/export';
import { Loading, EmptyBlock, ErrorBlock } from '@/components/ui/StateBlocks';
import { Download, FileDown, X, Paperclip } from 'lucide-react';

const STATUTS: StatutInscription[] = ['nouveau', 'en_cours', 'traite', 'accepte', 'refuse'];

const badgeClass: Record<StatutInscription, string> = {
  nouveau: 'bg-sun-100 text-sun-700',
  en_cours: 'bg-blue-100 text-blue-700',
  traite: 'bg-leaf-100 text-leaf-700',
  accepte: 'bg-green-100 text-green-700',
  refuse: 'bg-berry-100 text-berry-700',
};

export function Inscriptions() {
  const { t } = useTranslation();
  const [fiches, setFiches] = useState<FicheInscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<StatutInscription | 'tous'>('tous');
  const [selection, setSelection] = useState<FicheInscription | null>(null);

  const charger = () => {
    setLoading(true);
    databases
      .listDocuments<Models.Document>(DB_ID, COLLECTIONS.inscriptions, [Query.orderDesc('$createdAt')])
      .then((res) => setFiches(res.documents as unknown as FicheInscription[]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(charger, []);

  const changerStatut = async (fiche: FicheInscription, statut: StatutInscription) => {
    await databases.updateDocument(DB_ID, COLLECTIONS.inscriptions, fiche.$id, { statut });
    setFiches((prev) => prev.map((f) => (f.$id === fiche.$id ? { ...f, statut } : f)));
    if (selection?.$id === fiche.$id) setSelection({ ...selection, statut });
  };

  const filtrees = filtreStatut === 'tous' ? fiches : fiches.filter((f) => f.statut === filtreStatut);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl font-bold text-leaf-900">{t('backoffice.inscriptions')}</h1>
        <button
          onClick={() => exportInscriptionsCSV(fiches)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700"
        >
          <FileDown size={16} /> {t('backoffice.exporter_csv')}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <FiltreBtn label="Tous" active={filtreStatut === 'tous'} onClick={() => setFiltreStatut('tous')} />
        {STATUTS.map((s) => (
          <FiltreBtn key={s} label={s.replace('_', ' ')} active={filtreStatut === s} onClick={() => setFiltreStatut(s)} />
        ))}
      </div>

      {loading && <Loading label="Chargement des inscriptions..." />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && filtrees.length === 0 && <EmptyBlock label={t('backoffice.aucune_inscription')} />}

      {!loading && filtrees.length > 0 && (
        <div className="bg-white rounded-2xl border border-leaf-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-leaf-50 text-ink-700 text-left">
              <tr>
                <th className="px-4 py-3">Enfant</th>
                <th className="px-4 py-3">Niveau</th>
                <th className="px-4 py-3">Parent</th>
                <th className="px-4 py-3">{t('backoffice.date_reception')}</th>
                <th className="px-4 py-3">{t('backoffice.statut')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtrees.map((f) => (
                <tr key={f.$id} className="border-t border-leaf-50 hover:bg-leaf-50/50">
                  <td className="px-4 py-3 font-medium text-ink-900">{f.enfant_prenom} {f.enfant_nom}</td>
                  <td className="px-4 py-3">{f.niveau_vise}</td>
                  <td className="px-4 py-3">{f.parent_nom}<br /><span className="text-xs text-ink-500">{f.parent_telephone}</span></td>
                  <td className="px-4 py-3">{new Date(f.$createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badgeClass[f.statut]}`}>{f.statut}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelection(f)} className="text-leaf-700 font-semibold text-xs hover:underline">
                      {t('backoffice.voir_detail')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selection && (
        <DetailModal
          fiche={selection}
          onClose={() => setSelection(null)}
          onStatutChange={(s) => changerStatut(selection, s)}
        />
      )}
    </div>
  );
}

function FiltreBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-colors ${
        active ? 'bg-leaf-700 text-white' : 'bg-white border border-leaf-200 text-ink-700 hover:bg-leaf-50'
      }`}
    >
      {label}
    </button>
  );
}

function DetailModal({
  fiche, onClose, onStatutChange,
}: { fiche: FicheInscription; onClose: () => void; onStatutChange: (s: StatutInscription) => void }) {
  const pieces: PieceJointe[] = JSON.parse(fiche.pieces_jointes || '[]');

  const voirPiece = (p: PieceJointe) => {
    const url = storage.getFileView(BUCKETS.pieces, p.fichier_id);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <h2 className="font-display font-bold text-xl text-leaf-900">{fiche.enfant_prenom} {fiche.enfant_nom}</h2>
          <button onClick={onClose} className="text-ink-500 hover:text-ink-900"><X size={20} /></button>
        </div>

        <dl className="space-y-2 text-sm mb-6">
          <Row label="Date de naissance" value={fiche.enfant_date_naissance} />
          <Row label="Sexe" value={fiche.enfant_sexe} />
          <Row label="Niveau visé" value={fiche.niveau_vise} />
          <Row label="Parent / tuteur" value={fiche.parent_nom} />
          <Row label="Lien de parenté" value={fiche.lien_parente} />
          <Row label="Téléphone" value={fiche.parent_telephone} />
          <Row label="Email" value={fiche.parent_email} />
          <Row label="Adresse" value={fiche.parent_adresse} />
        </dl>

        {pieces.length > 0 && (
          <div className="mb-6">
            <p className="font-semibold text-ink-700 mb-2 text-sm">Pièces jointes</p>
            <div className="space-y-1.5">
              {pieces.map((p) => (
                <button key={p.fichier_id} onClick={() => voirPiece(p)}
                  className="flex items-center gap-2 text-sm text-leaf-700 hover:underline">
                  <Paperclip size={14} /> {p.nom_original}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Statut du dossier</label>
          <select
            value={fiche.statut}
            onChange={(e) => onStatutChange(e.target.value as StatutInscription)}
            className="w-full rounded-xl border border-leaf-200 px-4 py-2.5"
          >
            {STATUTS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>

        <button
          onClick={() => exportFichePDF(fiche)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-berry-600 text-white text-sm font-bold hover:bg-berry-700"
        >
          <Download size={16} /> Télécharger PDF
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-leaf-50 py-1.5">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 font-medium text-right">{value}</dd>
    </div>
  );
}
