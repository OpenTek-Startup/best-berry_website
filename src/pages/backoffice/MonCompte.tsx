import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle2, UserRound } from 'lucide-react';

export function MonCompte() {
  const { user, role, updateOwnPassword } = useAuth();
  const [motDePasseActuel, setMotDePasseActuel] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setSucces(false);

    if (nouveauMotDePasse.length < 8) {
      setErreur('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setEnregistrement(true);
    try {
      await updateOwnPassword(motDePasseActuel, nouveauMotDePasse);
      setSucces(true);
      setMotDePasseActuel('');
      setNouveauMotDePasse('');
      setConfirmation('');
    } catch {
      setErreur('Mot de passe actuel incorrect.');
    } finally {
      setEnregistrement(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl font-bold text-leaf-900 mb-1">Mon compte</h1>
      <p className="text-ink-500 mb-8">Gérez les informations de votre compte backoffice.</p>

      <div className="bg-white rounded-3xl border border-leaf-100 p-6 mb-6 flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-leaf-100 text-leaf-700 flex items-center justify-center">
          <UserRound size={22} />
        </div>
        <div>
          <p className="font-semibold text-ink-900">{user?.name || 'Sans nom'}</p>
          <p className="text-sm text-ink-500">{user?.email}</p>
          {role && <p className="text-xs text-leaf-700 font-semibold mt-1">{role}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-leaf-100 p-6 space-y-4">
        <h2 className="font-display font-bold text-ink-900">Changer de mot de passe</h2>
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Mot de passe actuel</label>
          <input
            type="password" required value={motDePasseActuel} onChange={(e) => setMotDePasseActuel(e.target.value)}
            className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Nouveau mot de passe</label>
          <input
            type="password" required minLength={8} value={nouveauMotDePasse} onChange={(e) => setNouveauMotDePasse(e.target.value)}
            className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-ink-700 mb-1.5">Confirmer le nouveau mot de passe</label>
          <input
            type="password" required minLength={8} value={confirmation} onChange={(e) => setConfirmation(e.target.value)}
            className="w-full rounded-xl border border-leaf-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-leaf-200"
          />
        </div>

        {erreur && <p className="text-berry-600 text-sm font-medium">{erreur}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit" disabled={enregistrement}
            className="px-5 py-2.5 rounded-full bg-leaf-600 text-white text-sm font-bold hover:bg-leaf-700 disabled:opacity-60 flex items-center gap-2"
          >
            {enregistrement && <Loader2 className="animate-spin" size={16} />}
            Mettre à jour
          </button>
          {succes && (
            <span className="text-leaf-700 text-sm font-semibold flex items-center gap-1">
              <CheckCircle2 size={16} /> Mot de passe mis à jour
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
