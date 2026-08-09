import { useEffect, useState, type FormEvent, type ChangeEvent } from 'react';
import { databases, DB_ID, ID, Query, Permission, Role } from '@/lib/appwrite';
import { uploadImageToCloudinary, extraireYoutubeId } from '@/lib/cloudinary';
import { Loading, EmptyBlock, ErrorBlock } from '@/components/ui/StateBlocks';
import { Plus, Pencil, Trash2, X, Loader2, ImagePlus } from 'lucide-react';
import type { Models } from 'appwrite';

type Document = Models.Document & Record<string, unknown>;

export type ChampType = 'text' | 'textarea' | 'date' | 'checkbox' | 'image' | 'youtube' | 'number';

export interface ChampConfig {
  name: string;
  label: string;
  type: ChampType;
  required?: boolean;
}

interface CollectionManagerProps {
  collectionId: string;
  titre: string;
  champs: ChampConfig[];
  colonnesAffichees: string[]; // sous-ensemble de champs affichés dans la liste
  ordreQuery?: string[];
}

export function CollectionManager({ collectionId, titre, champs, colonnesAffichees, ordreQuery }: CollectionManagerProps) {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Document | null>(null);
  const [showForm, setShowForm] = useState(false);

  const charger = () => {
    setLoading(true);
    databases
      .listDocuments<Document>(DB_ID, collectionId, ordreQuery ?? [Query.orderDesc('$createdAt')])
      .then((res) => setItems(res.documents))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(charger, [collectionId]);

  const supprimer = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;
    await databases.deleteDocument(DB_ID, collectionId, id);
    setItems((prev) => prev.filter((i) => i.$id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-leaf-900">{titre}</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-berry-600 text-white text-sm font-bold hover:bg-berry-700"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {loading && <Loading label="Chargement..." />}
      {error && <ErrorBlock message={error} />}
      {!loading && !error && items.length === 0 && <EmptyBlock label="Aucun élément pour le moment." />}

      {!loading && items.length > 0 && (
        <div className="bg-white rounded-2xl border border-leaf-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-leaf-50 text-ink-700 text-left">
              <tr>
                {colonnesAffichees.map((c) => <th key={c} className="px-4 py-3">{champs.find((f) => f.name === c)?.label ?? c}</th>)}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.$id} className="border-t border-leaf-50 hover:bg-leaf-50/50">
                  {colonnesAffichees.map((c) => (
                    <td key={c} className="px-4 py-3 max-w-xs truncate">{String(item[c] ?? '')}</td>
                  ))}
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="text-leaf-700 hover:text-leaf-900 mr-3">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => supprimer(item.$id)} className="text-berry-600 hover:text-berry-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <FormModal
          collectionId={collectionId}
          champs={champs}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); charger(); }}
        />
      )}
    </div>
  );
}

function FormModal({
  collectionId, champs, initial, onClose, onSaved,
}: { collectionId: string; champs: ChampConfig[]; initial: Document | null; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Record<string, unknown>>(initial ?? {});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const setChamp = (name: string, val: unknown) => setValues((prev) => ({ ...prev, [name]: val }));

  const handleImage = async (name: string, file: File | null) => {
    if (!file) return;
    setUploading(name);
    try {
      const url = await uploadImageToCloudinary(file);
      setChamp(name, url);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Échec de l'envoi de l'image");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErreur(null);
    try {
      const payload: Record<string, unknown> = { ...values };
      delete payload.$id; delete payload.$createdAt; delete payload.$updatedAt;
      delete payload.$collectionId; delete payload.$databaseId; delete payload.$permissions;

      // Normalise les IDs YouTube saisis sous forme d'URL
      champs.forEach((c) => {
        if (c.type === 'youtube' && payload[c.name]) {
          payload[c.name] = extraireYoutubeId(String(payload[c.name]));
        }
      });

      if (initial?.$id) {
        await databases.updateDocument(DB_ID, collectionId, initial.$id, payload);
      } else {
        // Lecture publique (contenu affiché sur le site), écriture réservée à l'équipe backoffice.
        await databases.createDocument(DB_ID, collectionId, ID.unique(), payload, [
          Permission.read(Role.any()),
          Permission.update(Role.team('backoffice')),
          Permission.delete(Role.team('backoffice')),
        ]);
      }
      onSaved();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-lg text-leaf-900">{initial ? 'Modifier' : 'Ajouter'}</h2>
          <button type="button" onClick={onClose} className="text-ink-500 hover:text-ink-900"><X size={20} /></button>
        </div>

        {champs.map((c) => (
          <div key={c.name}>
            <label className="block text-sm font-semibold text-ink-700 mb-1.5">{c.label}</label>
            {c.type === 'textarea' && (
              <textarea rows={4} required={c.required} value={String(values[c.name] ?? '')} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChamp(c.name, e.target.value)}
                className="w-full rounded-xl border border-leaf-200 px-4 py-2.5" />
            )}
            {c.type === 'checkbox' && (
              <input type="checkbox" checked={!!values[c.name]} onChange={(e: ChangeEvent<HTMLInputElement>) => setChamp(c.name, e.target.checked)} className="h-5 w-5" />
            )}
            {(c.type === 'text' || c.type === 'date' || c.type === 'number' || c.type === 'youtube') && (
              <input
                type={c.type === 'youtube' ? 'text' : c.type}
                required={c.required}
                value={String(values[c.name] ?? '')}
                placeholder={c.type === 'youtube' ? 'URL ou ID de la vidéo YouTube' : undefined}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setChamp(c.name, e.target.value)}
                className="w-full rounded-xl border border-leaf-200 px-4 py-2.5"
              />
            )}
            {c.type === 'image' && (() => {
              const valeurActuelle = values[c.name];
              const url = typeof valeurActuelle === 'string' ? valeurActuelle : '';
              return (
                <div className="flex items-center gap-3">
                  {url && <img src={url} alt="" className="h-14 w-14 object-cover rounded-lg" />}
                  <label className="cursor-pointer px-3 py-2 rounded-full bg-leaf-50 border border-leaf-200 text-leaf-700 text-xs font-bold flex items-center gap-2">
                    {uploading === c.name ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                    {url ? 'Changer' : 'Choisir une image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => handleImage(c.name, e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              );
            })()}
          </div>
        ))}

        {erreur && <p className="text-berry-600 text-sm">{erreur}</p>}

        <button type="submit" disabled={saving} className="w-full py-3 rounded-full bg-leaf-600 text-white font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <Loader2 className="animate-spin" size={16} />} Enregistrer
        </button>
      </form>
    </div>
  );
}
